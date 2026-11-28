import React from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { AvatarConfig } from '@/constants/avatarCatalog';
import { FONT } from '@/constants/tokens';
import { useAuth } from '@/context/AuthContext';
import { usePalette } from '@/context/PaletteContext';
import { hapticLight } from '@/utils/feedback';
import { AvatarIllustration } from './AvatarIllustration';
import { CloseIcon } from './Icons';

export type AuthModalReason = 'profile' | 'online_public' | 'online_private';

interface AuthModalProps {
  visible: boolean;
  reason: AuthModalReason;
  avatarConfig?: AvatarConfig;
  onClose: () => void;
}

function GoogleLogo({ size = 20 }: { size?: number }) {
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

function AppleLogo({ size = 20, color = '#FFFFFF' }: { size?: number; color?: string }) {
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
 * Industry-standard Bottom Sheet for OAuth (Apple HIG & Google Identity compliant 52px full-width buttons)
 * and signed-in account management (Sign Out + Apple 5.1.1(v) Delete Account),
 * styled seamlessly in Noche de Club & Día Brisa.
 */
export function AuthModal({
  visible,
  reason,
  avatarConfig,
  onClose,
}: AuthModalProps) {
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
  const { palette } = usePalette();

  const title =
    reason === 'online_public'
      ? 'Juega en Salas Online'
      : reason === 'online_private'
      ? 'Crea o únete a una Sala Privada'
      : 'Guarda tu progreso';

  const subtitle =
    reason === 'online_public'
      ? 'Inicia sesión para competir en mesas públicas y acumular Fichas de Club.'
      : reason === 'online_private'
      ? 'Inicia sesión para abrir tu mesa privada e invitar amigos con código.'
      : 'Conserva tus rachas, fichas y mesas desbloqueadas en cualquier dispositivo.';

  const handleConfirmDeleteAccount = () => {
    hapticLight();
    const alertTitle = 'Eliminar cuenta permanentemente';
    const message =
      'Se borrarán de forma permanente tu perfil, tus Fichas de Club, temas desbloqueados e historial de partidas en la nube. Esta acción no se puede deshacer.';

    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.confirm(`${alertTitle}\n\n${message}`)) {
        deleteAccount().then((ok) => {
          if (ok) onClose();
        });
      }
      return;
    }

    Alert.alert(alertTitle, message, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar cuenta',
        style: 'destructive',
        onPress: () => {
          deleteAccount().then((ok) => {
            if (ok) onClose();
          });
        },
      },
    ]);
  };

  const label =
    profile?.displayName ||
    (user?.user_metadata?.full_name as string | undefined) ||
    user?.email ||
    'Jugador';

  return (
    <Modal
      visible={visible}
      transparent
      statusBarTranslucent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={[styles.backdrop, { backgroundColor: palette.modalBackdrop }]}>
        <Pressable style={styles.dismissArea} onPress={onClose} />

        <View
          style={[
            styles.sheet,
            {
              backgroundColor: palette.modalBg,
              borderColor: palette.modalBorder,
            },
          ]}
        >
          <View
            style={[styles.grabHandle, { backgroundColor: palette.borderSubtle }]}
          />

          <View style={styles.topRow}>
            <View style={{ width: 40 }} />
            <Text style={[styles.kicker, { color: palette.brandAccent }]}>
              DOMINÓ LATINO
            </Text>
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Cerrar"
              style={[styles.closeBtn, { backgroundColor: palette.closeBtnBg }]}
            >
              <CloseIcon size={18} color={palette.textPrimary} />
            </Pressable>
          </View>

          {isSignedIn && user ? (
            <View style={styles.signedBody}>
              <View
                style={[
                  styles.profileRow,
                  {
                    backgroundColor: palette.modalCardBg,
                    borderColor: palette.modalCardBorder,
                    borderBottomColor: palette.modalCardLip,
                  },
                ]}
              >
                <AvatarIllustration
                  isBot={false}
                  accentColor={palette.accent}
                  size={52}
                  avatarConfig={avatarConfig}
                />
                <View style={styles.profileTextCol}>
                  <Text
                    style={[styles.profileName, { color: palette.textPrimary }]}
                    numberOfLines={1}
                  >
                    {label}
                  </Text>
                  <View style={styles.syncRow}>
                    <View
                      style={[
                        styles.syncDot,
                        { backgroundColor: palette.positiveText },
                      ]}
                    />
                    <Text
                      style={[styles.syncLabel, { color: palette.positiveText }]}
                    >
                      Cuenta sincronizada
                    </Text>
                  </View>
                </View>
              </View>

              <Pressable
                onPress={() => {
                  hapticLight();
                  signOut().then(() => onClose());
                }}
                disabled={authBusy !== null}
                accessibilityRole="button"
                style={({ pressed }) => [
                  styles.signOutBtn,
                  {
                    backgroundColor: palette.modalCardBg,
                    borderColor: palette.modalCardBorder,
                    borderBottomColor: palette.modalCardLip,
                  },
                  pressed && { opacity: 0.85 },
                ]}
              >
                {authBusy === 'signout' ? (
                  <ActivityIndicator size="small" color={palette.textPrimary} />
                ) : (
                  <Text style={[styles.signOutText, { color: palette.textPrimary }]}>
                    Cerrar sesión
                  </Text>
                )}
              </Pressable>

              <Pressable
                onPress={handleConfirmDeleteAccount}
                disabled={authBusy !== null}
                accessibilityRole="button"
                style={({ pressed }) => [styles.deleteBtn, pressed && { opacity: 0.75 }]}
              >
                {authBusy === 'delete' ? (
                  <ActivityIndicator size="small" color={palette.dangerText} />
                ) : (
                  <Text style={[styles.deleteText, { color: palette.dangerText }]}>
                    Eliminar cuenta permanentemente
                  </Text>
                )}
              </Pressable>

              {authError && (
                <Text style={[styles.errorText, { color: palette.dangerText }]}>
                  {authError}
                </Text>
              )}
            </View>
          ) : (
            <View style={styles.guestBody}>
              <Text style={[styles.title, { color: palette.textPrimary }]}>
                {title}
              </Text>
              <Text style={[styles.subtitle, { color: palette.textSecondary }]}>
                {subtitle}
              </Text>

              <View style={styles.buttonsStack}>
                {/* Apple HIG compliant full-width Sign in with Apple button (52px) */}
                <Pressable
                  onPress={() => {
                    hapticLight();
                    signInWithApple();
                  }}
                  disabled={authBusy !== null}
                  accessibilityRole="button"
                  style={({ pressed }) => [
                    styles.appleBtn,
                    {
                      borderColor: palette.isDark
                        ? 'rgba(255, 255, 255, 0.24)'
                        : '#000000',
                    },
                    pressed && { opacity: 0.9, transform: [{ scale: 0.99 }] },
                  ]}
                >
                  {authBusy === 'apple' ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <AppleLogo size={20} color="#FFFFFF" />
                      <Text style={styles.appleText}>Continuar con Apple</Text>
                    </>
                  )}
                </Pressable>

                {/* Google Identity compliant full-width Continue with Google button (52px) */}
                <Pressable
                  onPress={() => {
                    hapticLight();
                    signInWithGoogle();
                  }}
                  disabled={authBusy !== null}
                  accessibilityRole="button"
                  style={({ pressed }) => [
                    styles.googleBtn,
                    {
                      borderColor: palette.isDark
                        ? 'rgba(255, 255, 255, 0.92)'
                        : '#D6CBB8',
                      borderBottomColor: palette.isDark ? '#CBD5E1' : '#C2B49C',
                    },
                    pressed && { opacity: 0.92, transform: [{ scale: 0.99 }] },
                  ]}
                >
                  {authBusy === 'google' ? (
                    <ActivityIndicator size="small" color="#0D1520" />
                  ) : (
                    <>
                      <GoogleLogo size={20} />
                      <Text style={styles.googleText}>Continuar con Google</Text>
                    </>
                  )}
                </Pressable>
              </View>

              {authError && (
                <Text style={[styles.errorText, { color: palette.dangerText }]}>
                  {authError}
                </Text>
              )}

              <Text style={[styles.footnote, { color: palette.textMuted }]}>
                Puedes jugar Partida Rápida con los compañeros del Club cuando quieras sin iniciar sesión.
              </Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  dismissArea: {
    flex: 1,
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1.5,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 32,
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    gap: 12,
    boxShadow: '0px -12px 36px rgba(0, 0, 0, 0.35)',
  },
  grabHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  kicker: {
    fontFamily: FONT.extraBold,
    fontSize: 11,
    letterSpacing: 1.2,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guestBody: {
    gap: 12,
  },
  title: {
    fontFamily: FONT.display,
    fontSize: 23,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: FONT.semi,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 6,
  },
  buttonsStack: {
    gap: 10,
    marginTop: 4,
  },
  appleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    minHeight: 52,
    borderRadius: 15,
    backgroundColor: '#000000',
    borderWidth: 1,
    paddingHorizontal: 16,
  },
  appleText: {
    color: '#FFFFFF',
    fontFamily: FONT.extraBold,
    fontSize: 16,
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    minHeight: 52,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.25,
    borderBottomWidth: 3,
    paddingHorizontal: 16,
  },
  googleText: {
    color: '#0D1520',
    fontFamily: FONT.extraBold,
    fontSize: 16,
  },
  footnote: {
    fontFamily: FONT.semi,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 2,
  },
  signedBody: {
    gap: 12,
    paddingTop: 4,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 18,
    borderWidth: 1.25,
    borderBottomWidth: 3.5,
    padding: 12,
  },
  profileTextCol: {
    flex: 1,
  },
  profileName: {
    fontFamily: FONT.display,
    fontSize: 18,
  },
  syncRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 3,
  },
  syncDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  syncLabel: {
    fontFamily: FONT.extraBold,
    fontSize: 12,
  },
  signOutBtn: {
    minHeight: 48,
    borderRadius: 15,
    borderWidth: 1.25,
    borderBottomWidth: 3.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signOutText: {
    fontFamily: FONT.extraBold,
    fontSize: 15,
  },
  deleteBtn: {
    minHeight: 42,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  deleteText: {
    fontFamily: FONT.bold,
    fontSize: 13,
  },
  errorText: {
    fontFamily: FONT.bold,
    fontSize: 12,
    textAlign: 'center',
  },
});
