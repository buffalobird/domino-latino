import { makeRedirectUri } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

import { isSupabaseConfigured, supabase } from './supabase';

// Ensures the auth browser session closes cleanly on redirect
WebBrowser.maybeCompleteAuthSession();

export type OAuthProvider = 'google' | 'apple';

export interface OAuthResult {
  ok: boolean;
  cancelled?: boolean;
  error?: string;
}

const configuredSupabaseOrigin = (() => {
  const raw = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
  try {
    return raw ? new URL(raw).origin : null;
  } catch {
    return null;
  }
})();

function isTrustedAuthStartUrl(url: string): boolean {
  if (!configuredSupabaseOrigin) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' && parsed.origin === configuredSupabaseOrigin;
  } catch {
    return false;
  }
}

function isExpectedCallbackUrl(callbackUrl: string, expectedRedirect: string): boolean {
  const normalizedExpected = expectedRedirect.replace(/\/+$/, '');
  return (
    callbackUrl === expectedRedirect ||
    callbackUrl.startsWith(`${normalizedExpected}?`) ||
    callbackUrl.startsWith(`${normalizedExpected}#`) ||
    callbackUrl.startsWith(`${normalizedExpected}/`)
  );
}

/**
 * Computes the exact redirect URI for the current runtime:
 * - Expo Go: exp://<LAN-IP>:8081/--/auth/callback
 * - Standalone iOS/Android: dominolatino://auth/callback
 * - Web: current origin (e.g. http://localhost:8081)
 */
export function getOAuthRedirectUri(): string {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return window.location.origin;
  }
  return makeRedirectUri({
    scheme: 'dominolatino',
    path: 'auth/callback',
  });
}

function parseCallbackQueryParams(url: string): Record<string, string> {
  const params: Record<string, string> = {};
  const queryStart = url.indexOf('?');
  if (queryStart === -1) return params;
  const hashStart = url.indexOf('#', queryStart);
  const queryStr = url.slice(queryStart + 1, hashStart !== -1 ? hashStart : undefined);

  for (const pair of queryStr.split('&')) {
    const [k, v] = pair.split('=');
    if (k) {
      try {
        params[decodeURIComponent(k)] = decodeURIComponent(v ?? '');
      } catch {
        // Ignore malformed percent-encoding
      }
    }
  }
  return params;
}

/**
 * Initiates Google or Apple OAuth via Supabase Auth using strict PKCE flow.
 * - Verifies authorization URL origin matches EXPO_PUBLIC_SUPABASE_URL (anti-open-redirect).
 * - Verifies callback URL matches expected redirect URI.
 * - Accepts ONLY short-lived PKCE authorization `code` (rejects implicit URL tokens).
 */
export async function signInWithOAuthProvider(
  provider: OAuthProvider
): Promise<OAuthResult> {
  if (!isSupabaseConfigured) {
    return { ok: false, error: 'Supabase no está configurado en .env.local.' };
  }

  const redirectTo = getOAuthRedirectUri();

  // On web, redirect directly in the browser tab (Supabase detects ?code= on return via PKCE)
  if (Platform.OS === 'web') {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo },
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  }

  // On iOS / Android (Expo Go & native builds): open secure system auth session
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo,
      skipBrowserRedirect: true,
      queryParams:
        provider === 'google'
          ? { access_type: 'offline', prompt: 'select_account' }
          : undefined,
    },
  });

  if (error || !data?.url) {
    return {
      ok: false,
      error: error?.message ?? 'No se pudo iniciar el flujo OAuth.',
    };
  }

  if (!isTrustedAuthStartUrl(data.url)) {
    return {
      ok: false,
      error: 'URL de autenticación no confiable.',
    };
  }

  const res = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

  if (res.type === 'cancel' || res.type === 'dismiss') {
    return { ok: false, cancelled: true };
  }

  if (res.type !== 'success' || !res.url) {
    return { ok: false, error: 'No se completó el inicio de sesión.' };
  }

  if (!isExpectedCallbackUrl(res.url, redirectTo)) {
    return { ok: false, error: 'Callback OAuth inválido.' };
  }

  const params = parseCallbackQueryParams(res.url);

  if (params.error_description || params.error) {
    return {
      ok: false,
      error: params.error_description || params.error,
    };
  }

  // Strict PKCE code exchange only (never accept implicit access_token fragments)
  if (params.code) {
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(
      params.code
    );
    if (exchangeError) {
      return { ok: false, error: exchangeError.message };
    }
    return { ok: true };
  }

  return { ok: false, error: 'Respuesta OAuth sin código PKCE válido.' };
}

export async function signOutUser(): Promise<void> {
  if (!isSupabaseConfigured) return;
  await supabase.auth.signOut();
}
