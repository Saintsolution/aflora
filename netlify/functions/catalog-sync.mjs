// Admin-only intermediary. Never accepts a destination or sync payload from the browser.
const PROJECT = 'https://pgzxphalazwsgizfsvkz.supabase.co';
const reply = (statusCode, body) => ({ statusCode, headers: {
  'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store',
}, body: JSON.stringify(body) });

export function createSyncProxy({ env = process.env, fetchImpl = fetch, now = Date.now } = {}) {
  let busy = false;
  let retryAt = 0;
  return async (event) => {
    if (event.httpMethod !== 'POST') return reply(405, { error: 'method_not_allowed' });
    const headers = Object.fromEntries(Object.entries(event.headers ?? {}).map(([k,v]) => [k.toLowerCase(),v]));
    // Bearer auth is not ambient cookie auth. Origin additionally blocks foreign browser forms.
    const allowedOrigins = new Set(['https://aflorapreservada.com.br', 'https://www.aflorapreservada.com.br',
      'https://atelieaflora.netlify.app']);
    if (env.NETLIFY_DEV === 'true') {
      allowedOrigins.add('http://localhost:5173'); allowedOrigins.add('http://127.0.0.1:5173');
      allowedOrigins.add('http://localhost:5174'); allowedOrigins.add('http://127.0.0.1:5174');
    }
    if (!allowedOrigins.has(headers.origin)) return reply(403, { error: 'forbidden_origin' });
    if (!/^Bearer [A-Za-z0-9_.-]+$/.test(headers.authorization ?? '')) return reply(401, { error: 'authentication_required' });
    if (!headers['content-type']?.startsWith('application/json') || event.isBase64Encoded
      || (event.body?.length ?? 0) > 100) return reply(400, { error: 'invalid_request' });
    try {
      const body = JSON.parse(event.body || '{}');
      if (!body || Array.isArray(body) || Object.keys(body).length) return reply(400, { error: 'invalid_request' });
    } catch { return reply(400, { error: 'invalid_request' }); }
    const base = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
    const key = env.SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_PUBLISHABLE_KEY;
    if (base?.replace(/\/$/, '') !== PROJECT || !key?.startsWith('sb_publishable_')) {
      return reply(503, { error: 'sync_not_configured' });
    }
    let dispatchStarted = false;
    try {
      const authHeaders = { apikey: key, Authorization: headers.authorization, 'Content-Type': 'application/json' };
      const signal = AbortSignal.timeout(8000);
      const userResponse = await fetchImpl(`${PROJECT}/auth/v1/user`, { headers: authHeaders, signal, redirect: 'error' });
      if (userResponse.status === 401 || userResponse.status === 403) return reply(401, { error: 'authentication_required' });
      if (!userResponse.ok) return reply(503, { error: 'authorization_unavailable' });
      const user = await userResponse.json();
      if (!user?.id) return reply(401, { error: 'authentication_required' });
      const roleResponse = await fetchImpl(`${PROJECT}/rest/v1/rpc/is_admin`, {
        method: 'POST', headers: authHeaders, body: '{}', signal, redirect: 'error',
      });
      if (!roleResponse.ok) return reply(503, { error: 'authorization_unavailable' });
      if (await roleResponse.json() !== true) return reply(403, { error: 'admin_required' });
      const secret = env.AFLORA_CATALOG_SYNC_SECRET;
      if (!secret?.startsWith('sb_secret_')) return reply(503, { error: 'sync_not_configured' });
      if (busy) return reply(409, { error: 'sync_already_running' });
      if (now() < retryAt) return reply(429, { error: 'sync_cooldown' });
      busy = true;
      retryAt = now() + 60000;
      dispatchStarted = true;
      // The existing Edge Function/RPC lock also protects across instances and cron.
      const response = await fetchImpl(`${PROJECT}/functions/v1/sync-aflora-catalog`, {
        method: 'POST', headers: { apikey: secret, 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'import' }), signal: AbortSignal.timeout(45000), redirect: 'error',
      });
      if (response.status === 409) return reply(409, { error: 'sync_already_running' });
      if (!response.ok) return reply(502, { error: 'sync_failed' });
      const result = await response.json();
      if (result.ok !== true || result.mode !== 'import') return reply(502, { error: 'sync_result_unknown' });
      const counts = Object.fromEntries(['products_found','products_inserted','products_updated']
        .filter(k => Number.isSafeInteger(result[k]) && result[k] >= 0).map(k => [k,result[k]]));
      return reply(200, { ok: true, ...counts });
    } catch {
      // Do not log tokens, raw upstream errors or upstream response bodies.
      return reply(dispatchStarted ? 504 : 503, { error: dispatchStarted ? 'sync_result_unknown' : 'authorization_unavailable' });
    } finally {
      if (dispatchStarted) busy = false;
    }
  };
}
export const handler = createSyncProxy();
