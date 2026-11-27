import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CLUB } from '@/constants/tokens';
import { useAuth } from '@/context/AuthContext';
import { hapticLight } from '@/utils/feedback';
import { UserSilhouetteIcon } from './Icons';

interface AccountCardProps {
  onOpenAuth: () => void;
}

/**
 * Clean 1-row profile/sign-in trigger on Home.
 * Opens the full-size Apple/Google OAuth Bottom Sheet (`AuthModal`) so Home stays clutter-free
 * and OAuth buttons always respect official Apple HIG / Google Identity proportions (52px).
 */
export function AccountCard({ onOpenAuth }: AccountCardProps) {
  const { user, profile, isSignedIn } = useAuth();

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
        style={({ pressed }) => [styles.bar, pressed && { opacity: 0.88 }]}
      >
        <View style={styles.leftRow}>
          <View style={styles.syncDot} />
          <Text style={styles.userName} numberOfLines={1}>
            {label}
          </Text>
        </View>
        <View style={styles.actionPill}>
          <Text style={styles.actionPillText}>Mi cuenta</Text>
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
      style={({ pressed }) => [styles.bar, pressed && { opacity: 0.88 }]}
    >
      <View style={styles.leftRow}>
        <View style={styles.avatarBadge}>
          <UserSilhouetteIcon size={15} color="#93C5FD" />
        </View>
        <Text style={styles.guestTitle} numberOfLines={1}>
          Guarda tu progreso y juega online
        </Text>
      </View>

      <View style={styles.signInPill}>
        <Text style={styles.signInPillText}>Iniciar sesión</Text>
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
    backgroundColor: 'rgba(15, 30, 54, 0.58)',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(148, 190, 255, 0.18)',
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
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(147, 197, 253, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  guestTitle: {
    flex: 1,
    color: '#D5E3F5',
    fontSize: 12.5,
    fontWeight: '700',
  },
  signInPill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: 'rgba(56, 189, 248, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(125, 211, 252, 0.5)',
  },
  signInPillText: {
    color: '#E0F2FE',
    fontSize: 12,
    fontWeight: '800',
  },
  syncDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: CLUB.emerald,
  },
  userName: {
    flex: 1,
    color: CLUB.textPrimary,
    fontSize: 13,
    fontWeight: '800',
  },
  actionPill: {
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(148, 190, 255, 0.2)',
  },
  actionPillText: {
    color: CLUB.textSecondary,
    fontSize: 11.5,
    fontWeight: '800',
  },
});
