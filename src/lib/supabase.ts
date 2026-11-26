import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { AppState, Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabasePublishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabasePublishableKey);

const isSSR = Platform.OS === 'web' && typeof window === 'undefined';
const SECURE_CHUNK_SIZE = 1800; // Safe margin below 2048-byte SecureStore limit
const SECURE_OPTIONS: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK,
};

function sanitizeSecureKey(key: string): string {
  return key.replace(/[^a-zA-Z0-9._-]/g, '_');
}

async function clearSecureKey(safeKey: string): Promise<void> {
  try {
    const chunkCountRaw = await SecureStore.getItemAsync(`${safeKey}__chunks`, SECURE_OPTIONS);
    if (chunkCountRaw) {
      const count = Number.parseInt(chunkCountRaw, 10);
      if (Number.isFinite(count) && count > 0) {
        await Promise.all(
          Array.from({ length: count }, (_, idx) =>
            SecureStore.deleteItemAsync(`${safeKey}__c_${idx}`, SECURE_OPTIONS).catch(() => {})
          )
        );
      }
      await SecureStore.deleteItemAsync(`${safeKey}__chunks`, SECURE_OPTIONS).catch(() => {});
    }
    await SecureStore.deleteItemAsync(safeKey, SECURE_OPTIONS).catch(() => {});
  } catch {
    // Non-fatal cleanup error
  }
}

/**
 * Hardware-backed encrypted session storage on iOS (Keychain) & Android (Keystore)
 * with automatic chunking for Supabase JWTs > 2048 bytes and seamless migration
 * from any legacy plaintext AsyncStorage session.
 */
const NativeSecureStorageAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    const safeKey = sanitizeSecureKey(key);
    try {
      const chunkCountRaw = await SecureStore.getItemAsync(`${safeKey}__chunks`, SECURE_OPTIONS);
      if (chunkCountRaw) {
        const count = Number.parseInt(chunkCountRaw, 10);
        if (Number.isFinite(count) && count > 0) {
          const chunks = await Promise.all(
            Array.from({ length: count }, (_, idx) =>
              SecureStore.getItemAsync(`${safeKey}__c_${idx}`, SECURE_OPTIONS)
            )
          );
          if (chunks.every((c): c is string => typeof c === 'string')) {
            return chunks.join('');
          }
          return null;
        }
      }

      const direct = await SecureStore.getItemAsync(safeKey, SECURE_OPTIONS);
      if (direct !== null) return direct;

      // Seamless one-time migration from legacy plaintext AsyncStorage -> SecureStore
      const legacy = await AsyncStorage.getItem(key);
      if (legacy !== null) {
        await NativeSecureStorageAdapter.setItem(key, legacy);
        return legacy;
      }
      return null;
    } catch {
      return null;
    }
  },

  setItem: async (key: string, value: string): Promise<void> => {
    const safeKey = sanitizeSecureKey(key);
    await clearSecureKey(safeKey);

    if (value.length <= SECURE_CHUNK_SIZE) {
      await SecureStore.setItemAsync(safeKey, value, SECURE_OPTIONS);
    } else {
      const chunks: string[] = [];
      for (let i = 0; i < value.length; i += SECURE_CHUNK_SIZE) {
        chunks.push(value.slice(i, i + SECURE_CHUNK_SIZE));
      }
      await Promise.all(
        chunks.map((chunk, idx) =>
          SecureStore.setItemAsync(`${safeKey}__c_${idx}`, chunk, SECURE_OPTIONS)
        )
      );
      await SecureStore.setItemAsync(`${safeKey}__chunks`, String(chunks.length), SECURE_OPTIONS);
    }

    // Ensure no plaintext copy remains in AsyncStorage
    AsyncStorage.removeItem(key).catch(() => {});
  },

  removeItem: async (key: string): Promise<void> => {
    const safeKey = sanitizeSecureKey(key);
    await clearSecureKey(safeKey);
    await AsyncStorage.removeItem(key).catch(() => {});
  },
};

const WebStorageAdapter = {
  getItem: (key: string) => {
    if (isSSR) return Promise.resolve(null);
    return AsyncStorage.getItem(key);
  },
  setItem: (key: string, value: string) => {
    if (isSSR) return Promise.resolve();
    return AsyncStorage.setItem(key, value);
  },
  removeItem: (key: string) => {
    if (isSSR) return Promise.resolve();
    return AsyncStorage.removeItem(key);
  },
};

const ExpoStorageAdapter = Platform.OS === 'web' ? WebStorageAdapter : NativeSecureStorageAdapter;

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabasePublishableKey || 'placeholder-key',
  {
    auth: {
      storage: ExpoStorageAdapter,
      autoRefreshToken: true,
      persistSession: true,
      // On web, let Supabase pick up OAuth PKCE code from URL automatically;
      // on mobile we handle the deep-link callback explicitly in src/lib/auth.ts.
      detectSessionInUrl: Platform.OS === 'web',
      flowType: 'pkce',
    },
  }
);

// Keep token refresh paused when app is backgrounded on mobile (Supabase RN best practice)
if (Platform.OS !== 'web') {
  AppState.addEventListener('change', (state) => {
    if (state === 'active') {
      supabase.auth.startAutoRefresh();
    } else {
      supabase.auth.stopAutoRefresh();
    }
  });
}
