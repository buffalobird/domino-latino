import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '@/context/AuthContext';
import { usePalette } from '@/context/PaletteContext';
import { hapticLight } from '@/utils/feedback';
import { UserSilhouetteIcon } from './Icons';

interface AccountCardProps {
  onOpenAuth: () => void;
}

/**
 * Tactile 1-row profile/sign-in bar matching the high-contrast 3D game mockups.
 */
export function AccountCard({ onOpenAuth }: AccountCardProps) {
  const { user, profile, isSignedIn } = useAuth();
  const { palette } = usePalette();

  if (isSignedIn && user) {
    const label =
      profile?.displayName ||
      (user.user_metadata?.full_name as string | undefined) ||
      user.email ||
      'Jugador';

    return (
      <Pressable
        onPress={() => {
          hapticLight();
          onOpenAuth();
        }}
        accessibilityRole="button"
        style={({ pressed }) => [
          styles.bar,
          {
            backgroundColor: palette.accountBg,
            borderColor: palette.accountBorder,
            borderBottomColor: palette.accountLip,
          },
          pressed && styles.pressed,
        ]}
      >
        <View style={styles.leftRow}>
          <View style={[styles.syncDot, { backgroundColor: palette.primaryMid }]} />
          <Text style={[styles.userName, { color: palette.accountText }]} numberOfLines={1}>
            {label}
          </Text>
        </View>
        <View
          style={[
            styles.actionPill,
            {
              backgroundColor: palette.accountBtnBg,
              borderBottomColor: palette.accountBtnLip,
            },
          ]}
        >
          <Text style={[styles.actionPillText, { color: palette.accountBtnText }]}>
            Mi cuenta
          </Text>
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={() => {
        hapticLight();
        onOpenAuth();
      }}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.bar,
        {
          backgroundColor: palette.accountBg,
          borderColor: palette.accountBorder,
          borderBottomColor: palette.accountLip,
        },
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.leftRow}>
        <View
          style={[
            styles.avatarBadge,
            {
              backgroundColor: palette.accountBtnBg,
            },
          ]}
        >
          <UserSilhouetteIcon size={14} color={palette.accountBtnText} />
        </View>
        <Text style={[styles.guestTitle, { color: palette.accountText }]} numberOfLines={1}>
          Guarda tu progreso...
        </Text>
      </View>

      <View
        style={[
          styles.signInPill,
          {
            backgroundColor: palette.accountBtnBg,
            borderBottomColor: palette.accountBtnLip,
          },
        ]}
      >
        <Text style={[styles.signInPillText, { color: palette.accountBtnText }]}>
          Iniciar sesión
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    borderRadius: 18,
    borderWidth: 1.25,
    borderBottomWidth: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 50,
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.18)',
  },
  pressed: {
    opacity: 0.92,
    transform: [{ translateY: 1 }],
  },
  leftRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  avatarBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guestTitle: {
    flex: 1,
    fontSize: 13.5,
    fontWeight: '800',
  },
  signInPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 12,
    borderBottomWidth: 3,
  },
  signInPillText: {
    fontSize: 12.5,
    fontWeight: '900',
  },
  syncDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },
  userName: {
    flex: 1,
    fontSize: 13.5,
    fontWeight: '800',
  },
  actionPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 11,
    borderBottomWidth: 3,
  },
  actionPillText: {
    fontSize: 12,
    fontWeight: '900',
  },
});
