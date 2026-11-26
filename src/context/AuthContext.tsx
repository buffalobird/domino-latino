import { User } from '@supabase/supabase-js';
import React, {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

import {
  OAuthProvider,
  signInWithOAuthProvider,
  signOutUser,
} from '@/lib/auth';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import {
  deleteUserAccount,
  loadCachedProfile,
  saveCachedProfile,
  UserProfileCache,
} from '@/storage/syncService';

interface AuthContextValue {
  user: User | null;
  profile: UserProfileCache | null;
  isSignedIn: boolean;
  authBusy: OAuthProvider | 'signout' | 'delete' | null;
  authError: string | null;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<boolean>;
  setProfile: (profile: UserProfileCache | null) => void;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  profile: null,
  isSignedIn: false,
  authBusy: null,
  authError: null,
  signInWithGoogle: async () => {},
  signInWithApple: async () => {},
  signOut: async () => {},
  deleteAccount: async () => false,
  setProfile: () => {},
  clearAuthError: () => {},
});

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfileCache | null>(null);
  const [authBusy, setAuthBusy] = useState<OAuthProvider | 'signout' | 'delete' | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    // 1. Instant local cache hydrate (0 ms UI latency)
    loadCachedProfile().then((cached) => {
      if (mounted && cached) {
        setProfile(cached);
      }
    });

    if (!isSupabaseConfigured) return;

    // 2. Hydrate active Supabase session
    supabase.auth.getSession().then(({ data }) => {
      if (mounted) {
        setUser(data.session?.user ?? null);
      }
    });

    // 3. Subscribe to auth state transitions (sign-in, token refresh, sign-out)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      const nextUser = session?.user ?? null;
      setUser(nextUser);
      if (!nextUser) {
        setProfile(null);
        saveCachedProfile(null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const runOAuth = useCallback(async (provider: OAuthProvider) => {
    setAuthError(null);
    setAuthBusy(provider);
    try {
      const res = await signInWithOAuthProvider(provider);
      if (!res.ok && !res.cancelled && res.error) {
        setAuthError(res.error);
      }
    } catch (err) {
      setAuthError(
        err instanceof Error ? err.message : 'Error al iniciar sesión.'
      );
    } finally {
      setAuthBusy(null);
    }
  }, []);

  const signInWithGoogle = useCallback(() => runOAuth('google'), [runOAuth]);
  const signInWithApple = useCallback(() => runOAuth('apple'), [runOAuth]);

  const signOut = useCallback(async () => {
    setAuthError(null);
    setAuthBusy('signout');
    try {
      await signOutUser();
      setUser(null);
      setProfile(null);
      await saveCachedProfile(null);
    } finally {
      setAuthBusy(null);
    }
  }, []);

  const deleteAccount = useCallback(async (): Promise<boolean> => {
    setAuthError(null);
    setAuthBusy('delete');
    try {
      await deleteUserAccount();
      await signOutUser().catch(() => {});
      setUser(null);
      setProfile(null);
      await saveCachedProfile(null);
      return true;
    } catch (err) {
      setAuthError(
        err instanceof Error ? err.message : 'No se pudo eliminar la cuenta. Intenta de nuevo.'
      );
      return false;
    } finally {
      setAuthBusy(null);
    }
  }, []);

  const clearAuthError = useCallback(() => setAuthError(null), []);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isSignedIn: Boolean(user),
        authBusy,
        authError,
        signInWithGoogle,
        signInWithApple,
        signOut,
        deleteAccount,
        setProfile,
        clearAuthError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
