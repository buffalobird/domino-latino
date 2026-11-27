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
 * Clean 1-row profile/sign-in trigger on Home, dynamically themed via PaletteContext.
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
            backgroundColor: palette.surfaceCard,
            borderColor: palette.borderSubtle,
          },
          pressed && { opacity: 0.88 },
        ]}
      >
        <View style={styles.leftRow}>
          <View style={[styles.syncDot, { backgroundColor: palette.accent }]} />
          <Text style={[styles.userName, { color: palette.textPrimary }]} numberOfLines={1}>
            {label}
          </Text>
        </View>
        <View
          style={[
            styles.actionPill,
            {
              backgroundColor: palette.surfaceCardAlt,
              borderColor: palette.borderSubtle,
            },
          ]}
        >
          <Text style={[styles.actionPillText, { color: palette.textSecondary }]}>
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
          backgroundColor: palette.surfaceCard,
          borderColor: palette.borderSubtle,
        },
        pressed && { opacity: 0.88 },
      ]}
    >
      <View style={styles.leftRow}>
        <View
          style={[
            styles.avatarBadge,
            {
              backgroundColor: palette.accentBg,
              borderColor: palette.borderAccent,
            },
          ]}
        >
          <UserSilhouetteIcon size={15} color={palette.accent} />
        </View>
        <Text style={[styles.guestTitle, { color: palette.textSecondary }]} numberOfLines={1}>
          Guarda tu progreso y juega online
        </Text>
      </View>

      <View
        style={[
          styles.signInPill,
          {
            backgroundColor: palette.accentBg,
            borderColor: palette.borderAccent,
          },
        ]}
      >
        <Text style={[styles.signInPillText, { color: palette.textPrimary }]}>
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
    borderRadius: 15,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 46,
  },
  leftRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatarBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guestTitle: {
    flex: 1,
    fontSize: 12.5,
    fontWeight: '700',
  },
  signInPill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
  },
  signInPillText: {
    fontSize: 12,
    fontWeight: '800',
  },
  syncDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  userName: {
    flex: 1,
    fontSize: 13,
    fontWeight: '800',
  },
  actionPill: {
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  actionPillText: {
    fontSize: 11.5,
    fontWeight: '800',
  },
});
