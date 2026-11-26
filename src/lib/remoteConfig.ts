import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

import { isSupabaseConfigured, supabase } from './supabase';

const REMOTE_CONFIG_CACHE_KEY = 'domino_latino_remote_config_v1';

export const APP_VERSION: string = Constants.expoConfig?.version ?? '1.0.0';

export interface RemoteAppConfig {
  minSupportedVersion: string;
  onlineEnabled: boolean;
  maintenanceBanner: string | null;
  forceUpdateMessage: string;
}

export const DEFAULT_REMOTE_CONFIG: RemoteAppConfig = {
  minSupportedVersion: '1.0.0',
  onlineEnabled: true,
  maintenanceBanner: null,
  forceUpdateMessage:
    'Hay una nueva versión disponible de Dominó Latino. Actualiza la app para continuar.',
};

function parseSemver(ver: string): [number, number, number] {
  const parts = ver
    .trim()
    .split('.')
    .map((p) => Number.parseInt(p.replace(/[^0-9]/g, ''), 10));
  return [
    Number.isFinite(parts[0]) ? parts[0] : 0,
    Number.isFinite(parts[1]) ? parts[1] : 0,
    Number.isFinite(parts[2]) ? parts[2] : 0,
  ];
}

/** Returns true if `current` is strictly older than `minSupported`. */
export function isVersionBelow(current: string, minSupported: string): boolean {
  const [cMaj, cMin, cPat] = parseSemver(current);
  const [mMaj, mMin, mPat] = parseSemver(minSupported);
  if (cMaj !== mMaj) return cMaj < mMaj;
  if (cMin !== mMin) return cMin < mMin;
  return cPat < mPat;
}

export async function loadCachedRemoteConfig(): Promise<RemoteAppConfig> {
  try {
    const raw = await AsyncStorage.getItem(REMOTE_CONFIG_CACHE_KEY);
    if (!raw) return DEFAULT_REMOTE_CONFIG;
    const parsed = JSON.parse(raw) as Partial<RemoteAppConfig>;
    return {
      minSupportedVersion:
        typeof parsed.minSupportedVersion === 'string'
          ? parsed.minSupportedVersion
          : DEFAULT_REMOTE_CONFIG.minSupportedVersion,
      onlineEnabled:
        typeof parsed.onlineEnabled === 'boolean'
          ? parsed.onlineEnabled
          : DEFAULT_REMOTE_CONFIG.onlineEnabled,
      maintenanceBanner:
        typeof parsed.maintenanceBanner === 'string' && parsed.maintenanceBanner.trim().length > 0
          ? parsed.maintenanceBanner.trim()
          : null,
      forceUpdateMessage:
        typeof parsed.forceUpdateMessage === 'string' && parsed.forceUpdateMessage.trim().length > 0
          ? parsed.forceUpdateMessage.trim()
          : DEFAULT_REMOTE_CONFIG.forceUpdateMessage,
    };
  } catch {
    return DEFAULT_REMOTE_CONFIG;
  }
}

/**
 * Fetches authoritative remote kill-switch & min-version config from `public.app_config`.
 * Fails open to cached/default config when offline so local quick-play always works.
 */
export async function fetchRemoteAppConfig(): Promise<RemoteAppConfig> {
  const fallback = await loadCachedRemoteConfig();
  if (!isSupabaseConfigured) return fallback;

  try {
    const { data, error } = await supabase
      .from('app_config')
      .select(
        'min_supported_version, online_enabled, maintenance_banner, force_update_message'
      )
      .eq('id', 'global')
      .maybeSingle();

    if (error || !data) return fallback;

    const next: RemoteAppConfig = {
      minSupportedVersion:
        typeof data.min_supported_version === 'string'
          ? data.min_supported_version
          : DEFAULT_REMOTE_CONFIG.minSupportedVersion,
      onlineEnabled:
        typeof data.online_enabled === 'boolean'
          ? data.online_enabled
          : DEFAULT_REMOTE_CONFIG.onlineEnabled,
      maintenanceBanner:
        typeof data.maintenance_banner === 'string' && data.maintenance_banner.trim().length > 0
          ? data.maintenance_banner.trim()
          : null,
      forceUpdateMessage:
        typeof data.force_update_message === 'string' &&
        data.force_update_message.trim().length > 0
          ? data.force_update_message.trim()
          : DEFAULT_REMOTE_CONFIG.forceUpdateMessage,
    };

    AsyncStorage.setItem(REMOTE_CONFIG_CACHE_KEY, JSON.stringify(next)).catch(() => {});
    return next;
  } catch {
    return fallback;
  }
}

let lastReportedFingerprint = '';
let lastReportedAt = 0;

/**
 * Lightweight crash/error reporter backed by `public.app_error_logs` (Expo Go safe,
 * ready to sit alongside Sentry when building with EAS). Throttled to prevent render-loop floods.
 */
export async function reportClientError(
  error: Error,
  componentStack?: string | null
): Promise<void> {
  if (!isSupabaseConfigured) return;

  const errorName = (error?.name || 'Error').slice(0, 120);
  const errorMessage = (error?.message || 'Unknown error').slice(0, 600);
  const fingerprint = `${errorName}:${errorMessage}`;
  const now = Date.now();
  if (fingerprint === lastReportedFingerprint && now - lastReportedAt < 30_000) {
    return;
  }
  lastReportedFingerprint = fingerprint;
  lastReportedAt = now;

  try {
    const { data } = await supabase.auth.getSession();
    const userId = data.session?.user?.id ?? null;
    await supabase.from('app_error_logs').insert({
      user_id: userId,
      error_name: errorName,
      error_message: errorMessage,
      component_stack: componentStack ? componentStack.slice(0, 2000) : null,
      platform: Platform.OS,
      app_version: APP_VERSION.slice(0, 24),
    });
  } catch {
    // Never throw from an error reporter
  }
}
