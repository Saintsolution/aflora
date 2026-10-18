import type { SupabaseClient } from '@supabase/supabase-js';

type RecoveryState = 'idle' | 'checking' | 'ready' | 'invalid' | 'complete';
const url = new URL(window.location.href);
const fragment = new URLSearchParams(url.hash.slice(1));
const read = (key: string) => fragment.get(key) ?? url.searchParams.get(key);
const callbackKeys = [
  'access_token', 'refresh_token', 'type', 'token_type', 'expires_in',
  'expires_at', 'error', 'error_code', 'error_description', 'code',
];
const hasCallback = callbackKeys.some((key) => read(key) !== null);
const recoveryLink = read('type') === 'recovery';
const hasError = Boolean(read('error') || read('error_code') || read('error_description'));
let state: RecoveryState = recoveryLink || hasError || read('access_token')
  || url.pathname === '/redefinir-senha' ? 'checking' : 'idle';
const listeners = new Set<() => void>();

export const recoverySnapshot = () => state;
export function subscribeRecovery(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}
function setState(next: RecoveryState) {
  state = next;
  listeners.forEach((listener) => listener());
}
export function invalidateRecovery() { setState('invalid'); }
export function completeRecovery() { setState('complete'); }

function cleanCallbackUrl() {
  if (!hasCallback) return;
  const clean = new URL(window.location.href);
  const hash = new URLSearchParams(clean.hash.slice(1));
  callbackKeys.forEach((key) => {
    clean.searchParams.delete(key);
    hash.delete(key);
  });
  if (clean.hash.includes('=')) clean.hash = hash.toString();
  window.history.replaceState(window.history.state, '', clean.pathname + clean.search + clean.hash);
}

export function initializePasswordRecovery(client: SupabaseClient) {
  // Register before React mounts: Supabase can emit the redirect event during startup.
  client.auth.onAuthStateChange((event, session) => {
    if (event === 'PASSWORD_RECOVERY' && session && state !== 'complete') {
      // Session validation runs outside the auth callback to avoid locking auth operations.
      setTimeout(() => { void validate(); }, 0);
    } else if (event === 'SIGNED_OUT' && state === 'ready') {
      invalidateRecovery();
    }
  });

  async function validate() {
    try {
      const { data, error } = await client.auth.getUser();
      if (state !== 'complete') setState(error || !data.user ? 'invalid' : 'ready');
    } catch {
      if (state !== 'complete') invalidateRecovery();
    }
  }

  if (state !== 'checking') return;
  void (async () => {
    try {
      const { error } = await client.auth.initialize();
      cleanCallbackUrl();
      // An existing unrelated session must never rescue an invalid recovery callback.
      if (error || hasError || !recoveryLink || !read('access_token') || !read('refresh_token')) {
        invalidateRecovery();
        return;
      }
      await validate();
    } catch {
      invalidateRecovery();
    } finally {
      cleanCallbackUrl();
    }
  })();
}
