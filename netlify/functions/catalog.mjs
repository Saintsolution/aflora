import { readSupabaseCatalog } from '../lib/supabase-catalog.mjs';

// Keep manually updated pieces visible promptly, without privileged CDN purge access.
const TTL = 60 * 1000;
const MAX_STALE_AGE = 60 * 60 * 1000;

export function createHandler(read = readSupabaseCatalog, now = Date.now) {
  let cached;
  let expires = 0;
  let fetched = 0;
  let pending;
  let retryAt = 0;
  return async (event) => {
    if (event.httpMethod !== 'GET') return { statusCode: 405, headers: { Allow: 'GET' }, body: '' };
    try {
      if (!cached || now() >= expires) {
        if (now() < retryAt) throw Object.assign(new Error('Aguardando nova tentativa'), { code: 'RETRY_COOLDOWN' });
        pending ??= read().then((data) => { cached = data; fetched = now(); expires = now() + TTL; retryAt = 0; return data; })
          .catch((error) => { retryAt = now() + 30000; throw error; }).finally(() => { pending = undefined; });
        await pending;
      }
      return { statusCode: 200, headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'public, max-age=60',
        'Netlify-CDN-Cache-Control': `public, s-maxage=${Math.max(1, Math.floor((expires - now()) / 1000))}, must-revalidate`,
      }, body: JSON.stringify(cached) };
    } catch (error) {
      console.error('catalog_refresh_failed', {
        kind: error.code === 'RETRY_COOLDOWN' ? 'cooldown' : error.status ? 'origin_http' : error.name === 'TimeoutError' || error.name === 'AbortError' ? 'timeout' : error.cause?.code ? 'network' : 'validation_or_internal',
        status: error.status, path: error.path, code: error.cause?.code,
        reason: typeof error.code === 'string' && /^CATALOG_[A-Z_]+$/.test(error.code) ? error.code : undefined,
        cacheAgeSeconds: cached ? Math.floor((now() - fetched) / 1000) : null,
      });
      if (cached && now() - fetched <= MAX_STALE_AGE) {
        return { statusCode: 200, headers: {
          'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store',
          'Netlify-CDN-Cache-Control': 'no-store',
        }, body: JSON.stringify({ ...cached, stale: true, cacheAgeSeconds: Math.floor((now() - fetched) / 1000) }) };
      }
      return { statusCode: 503, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
        body: JSON.stringify({ error: 'Catálogo temporariamente indisponível' }) };
    }
  };
}

export const handler = createHandler();
