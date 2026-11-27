import React from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { CLUB } from '@/constants/tokens';
import { useAuth } from '@/context/AuthContext';
import { hapticLight } from '@/utils/feedback';

function GoogleLogo({ size = 15 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.2-2.27H12v4.3h6.45a5.52 5.52 0 0 1-2.39 3.62v3h3.87c2.26-2.08 3.56-5.15 3.56-8.65z"
      />
      <Path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.07 7.93-2.91l-3.87-3c-1.07.72-2.44 1.15-4.06 1.15-3.12 0-5.77-2.11-6.71-4.95H1.29v3.1A12 12 0 0 0 12 24z"
      />
      <Path
        fill="#FBBC05"
        d="M5.29 14.29A7.2 7.2 0 0 1 4.91 12c0-.79.14-1.56.38-2.29v-3.1H1.29A12 12 0 0 0 0 12c0 1.94.46 3.77 1.29 5.39l4-3.1z"
      />
      <Path
        fill="#EA4335"
        d="M12 4.76c1.76 0 3.34.61 4.58 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.29 6.61l4 3.1C6.23 6.87 8.88 4.76 12 4.76z"
      />
    </Svg>
  );
}

function AppleLogo({ size = 15, color = '#FFFFFF' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        fill={color}
        d="M16.365 1.43c0 1.14-.493 2.27-1.177 3.08-.744.9-1.99 1.57-2.987 1.57-.12 0-.23-.02-.3-.03-.01-.06-.04-.22-.04-.39 0-1.15.572-2.27 1.206-2.98.804-.94 2.142-1.64 3.248-1.68.03.13.05.28.05.43zm4.565 15.71c-.03.07-.463 1.58-1.518 3.12-.945 1.34-1.94 2.71-3.43 2.71-1.517 0-1.9-.88-3.63-.88-1.698 0-2.302.91-3.67.91-1.377 0-2.332-1.26-3.428-2.8-1.287-1.82-2.323-4.63-2.323-7.28 0-4.28 2.797-6.55 5.552-6.55 1.448 0 2.675.95 3.6.95.865 0 2.222-1.01 3.902-1.01.613 0 2.886.06 4.374 2.19-.13.09-2.383 1.37-2.383 4.19 0 3.26 2.854 4.42 2.955 4.45z"
      />
    </Svg>
  );
}

/**
 * Slim 1-row Club Caribe account bar for optional Google & Apple OAuth.
 * Keeps 1-tap cloud sync accessible without competing visually against the Bottom Play Dock.
 */
export function AccountCard() {
  const {
    user,
    profile,
    isSignedIn,
    authBusy,
    authError,
    signInWithGoogle,
    signInWithApple,
    signOut,
    deleteAccount,
  } = useAuth();

  const handleConfirmDeleteAccount = () => {
    hapticLight();
    const title = 'Eliminar cuenta permanentemente';
    const message =
      'Se borrarán de forma permanente tu perfil, tus Fichas de Club, temas desbloqueados e historial de partidas en la nube. Esta acción no se puede deshacer.';

    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.confirm(`${title}\n\n${message}`)) {
        deleteAccount();
      }
      return;
    }

    Alert.alert(title, message, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar cuenta',
        style: 'destructive',
        onPress: () => {
          deleteAccount();
        },
      },
    ]);
  };

  if (isSignedIn && user) {
    const label =
      profile?.displayName ||
      (user.user_metadata?.full_name as string | undefined) ||
      user.email ||
      'Jugador';

    return (
      <View style={styles.bar}>
        <View style={styles.row}>
          <View style={styles.signedInfo}>
            <View style={styles.syncDot} />
            <View style={styles.signedTextCol}>
              <Text style={styles.userName} numberOfLines={1}>
                {label}
              </Text>
              <Text style={styles.syncTag}>Nube sincronizada</Text>
            </View>
          </View>

          <View style={styles.signedActions}>
            <Pressable
              onPress={() => {
                hapticLight();
                signOut();
              }}
              disabled={authBusy !== null}
              accessibilityRole="button"
              style={({ pressed }) => [styles.signOutBtn, pressed && { opacity: 0.8 }]}
            >
              {authBusy === 'signout' ? (
                <ActivityIndicator size="small" color={CLUB.textSecondary} />
              ) : (
                <Text style={styles.signOutText}>Salir</Text>
              )}
            </Pressable>

            <Pressable
              onPress={handleConfirmDeleteAccount}
              disabled={authBusy !== null}
              accessibilityRole="button"
              style={({ pressed }) => [styles.deleteBtn, pressed && { opacity: 0.7 }]}
            >
              {authBusy === 'delete' ? (
                <ActivityIndicator size="small" color="#FDA4AF" />
              ) : (
                <Text style={styles.deleteText}>Eliminar</Text>
              )}
            </Pressable>
          </View>
        </View>

        {authError && <Text style={styles.errorText}>{authError}</Text>}
      </View>
    );
  }

  return (
    <View style={styles.bar}>
      <View style={styles.row}>
        <View style={styles.guestLabelCol}>
          <Text style={styles.guestTitle}>Guardar progreso</Text>
          <Text style={styles.guestSub}>Nube y Online</Text>
        </View>

        <View style={styles.oauthPills}>
          <Pressable
            onPress={() => {
              hapticLight();
              signInWithGoogle();
            }}
            disabled={authBusy !== null}
            accessibilityRole="button"
            accessibilityLabel="Iniciar sesión con Google"
            style={({ pressed }) => [
              styles.googlePill,
              pressed && { opacity: 0.9 },
            ]}
          >
            {authBusy === 'google' ? (
              <ActivityIndicator size="small" color={CLUB.textInk} />
            ) : (
              <>
                <GoogleLogo size={14} />
                <Text style={styles.googleText}>Google</Text>
              </>
            )}
          </Pressable>

          <Pressable
            onPress={() => {
              hapticLight();
              signInWithApple();
            }}
            disabled={authBusy !== null}
            accessibilityRole="button"
            accessibilityLabel="Iniciar sesión con Apple"
            style={({ pressed }) => [
              styles.applePill,
              pressed && { opacity: 0.9 },
            ]}
          >
            {authBusy === 'apple' ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <AppleLogo size={14} color="#FFFFFF" />
                <Text style={styles.appleText}>Apple</Text>
              </>
            )}
          </Pressable>
        </View>
      </View>

      {authError && <Text style={styles.errorText}>{authError}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: CLUB.surfaceCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: CLUB.borderSubtle,
    borderTopColor: CLUB.surfaceHighlight,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  guestLabelCol: {
    flex: 1,
  },
  guestTitle: {
    color: CLUB.textPrimary,
    fontSize: 12,
    fontWeight: '800',
  },
  guestSub: {
    color: CLUB.textMuted,
    fontSize: 10,
    fontWeight: '700',
    marginTop: 1,
  },
  oauthPills: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  googlePill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    minHeight: 36,
    paddingHorizontal: 11,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
  },
  googleText: {
    color: CLUB.textInk,
    fontSize: 12,
    fontWeight: '800',
  },
  applePill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    minHeight: 36,
    paddingHorizontal: 11,
    backgroundColor: '#090D16',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  appleText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  signedInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  syncDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: CLUB.emerald,
  },
  signedTextCol: {
    flex: 1,
  },
  userName: {
    color: CLUB.textPrimary,
    fontSize: 13,
    fontWeight: '800',
  },
  syncTag: {
    color: CLUB.emerald,
    fontSize: 10,
    fontWeight: '800',
  },
  signedActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  signOutBtn: {
    minHeight: 34,
    paddingHorizontal: 10,
    borderRadius: 9,
    backgroundColor: CLUB.surfaceCardLight,
    borderWidth: 1,
    borderColor: CLUB.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signOutText: {
    color: CLUB.textSecondary,
    fontSize: 11,
    fontWeight: '800',
  },
  deleteBtn: {
    minHeight: 34,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteText: {
    color: '#FDA4AF',
    fontSize: 11,
    fontWeight: '700',
  },
  errorText: {
    color: '#FDA4AF',
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
});
