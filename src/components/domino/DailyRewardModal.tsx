import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { CLUB } from '@/constants/tokens';
import {
  canClaimDailyReward,
  DAILY_REWARD_SCHEDULE,
  getNextDailyRewardAmount,
  RetentionProgress,
} from '@/storage/gameStorage';
import { hapticSnap } from '@/utils/feedback';
import { GlossyButton } from './GlossyButton';
import { CheckIcon, ChipIcon, CloseIcon, CrownIcon } from './Icons';

interface DailyRewardModalProps {
  visible: boolean;
  retention: RetentionProgress;
  onClaimDaily: () => void;
  onClaimFreeRefill: () => void;
  onClose: () => void;
}

export function DailyRewardModal({
  visible,
  retention,
  onClaimDaily,
  onClaimFreeRefill,
  onClose,
}: DailyRewardModalProps) {
  const claimable = canClaimDailyReward(retention);
  const { dayIndex, amount } = getNextDailyRewardAmount(retention);
  const needsRefill = retention.clubChips < 200;

  return (
    <Modal
      visible={visible}
      transparent
      statusBarTranslucent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.header}>
            <View>
              <View style={styles.titleRow}>
                <ChipIcon size={18} color={CLUB.gold} />
                <Text style={styles.title}>Fichas de Club</Text>
              </View>
              <Text style={styles.sub}>
                Saldo actual: {retention.clubChips.toLocaleString('es-ES')} fichas
              </Text>
            </View>
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Cerrar bono diario"
              style={styles.closeBtn}
            >
              <CloseIcon size={18} color={CLUB.textPrimary} />
            </Pressable>
          </View>

          <Text style={styles.sectionLabel}>Bono diario de 7 días</Text>

          <View style={styles.daysGrid}>
            {DAILY_REWARD_SCHEDULE.map((reward, idx) => {
              const isPast = idx < retention.dailyClaimStreak;
              const isToday = idx === dayIndex;
              const isGrandPrize = idx === 6;
              return (
                <View
                  key={idx}
                  style={[
                    styles.dayCell,
                    isGrandPrize && styles.dayCellWide,
                    isPast && styles.dayCellPast,
                    isToday && claimable && styles.dayCellActive,
                  ]}
                >
                  <View style={styles.dayTopRow}>
                    {isGrandPrize && <CrownIcon size={14} color={CLUB.gold} />}
                    <Text style={styles.dayNum}>
                      {isGrandPrize ? 'Día 7 · Gran Premio' : `Día ${idx + 1}`}
                    </Text>
                    {isPast && <CheckIcon size={12} color={CLUB.emerald} />}
                  </View>
                  <View style={styles.rewardRow}>
                    <ChipIcon size={12} color={isToday && claimable ? CLUB.gold : CLUB.goldSoft} />
                    <Text
                      style={[
                        styles.dayReward,
                        (isToday && claimable) || isGrandPrize ? { color: CLUB.gold } : null,
                      ]}
                    >
                      +{reward}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>

          <GlossyButton
            title={
              claimable
                ? `Reclamar +${amount} fichas`
                : 'Bono de hoy ya reclamado'
            }
            variant={claimable ? 'emerald' : 'glass'}
            disabled={!claimable}
            onPress={() => {
              if (!claimable) return;
              hapticSnap();
              onClaimDaily();
            }}
          />

          {/* Compliance guarantee: unlimited free refill whenever balance drops below 200 */}
          {needsRefill && (
            <GlossyButton
              title="Recarga gratuita del Club (+300 fichas)"
              variant="cobalt"
              compact
              onPress={() => {
                hapticSnap();
                onClaimFreeRefill();
              }}
            />
          )}

          <Text style={styles.complianceNote}>
            Las Fichas de Club son moneda virtual de entretenimiento sin valor
            monetario real y nunca se venden por dinero.
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(6, 12, 24, 0.76)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: 'rgba(14, 28, 52, 0.96)',
    borderRadius: 24,
    borderWidth: 1.25,
    borderColor: 'rgba(148, 190, 255, 0.26)',
    padding: 18,
    gap: 12,
    boxShadow: '0px 18px 44px rgba(0, 0, 0, 0.72)',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  dayTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rewardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    color: CLUB.textPrimary,
    fontSize: 19,
    fontWeight: '900',
  },
  sub: {
    color: CLUB.gold,
    fontSize: 13,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
    marginTop: 2,
  },
  closeBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionLabel: {
    color: CLUB.textMuted,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dayCell: {
    width: '31%',
    backgroundColor: CLUB.surfaceCardLight,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: CLUB.glassBorder,
    paddingVertical: 10,
    alignItems: 'center',
    gap: 2,
  },
  dayCellWide: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
  },
  dayCellPast: {
    opacity: 0.45,
  },
  dayCellActive: {
    borderColor: '#F5C451',
    borderWidth: 1.75,
    backgroundColor: 'rgba(54, 42, 18, 0.66)',
    boxShadow: '0px 0px 16px rgba(245, 196, 81, 0.35)',
  },
  dayNum: {
    color: CLUB.textSecondary,
    fontSize: 11,
    fontWeight: '800',
  },
  dayReward: {
    color: CLUB.textPrimary,
    fontSize: 15,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
  claimBtn: {
    backgroundColor: CLUB.emerald,
    borderRadius: 14,
    borderBottomWidth: 4,
    borderBottomColor: CLUB.emeraldDark,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  claimBtnDisabled: {
    backgroundColor: CLUB.surfaceCardLight,
    borderBottomWidth: 0,
  },
  claimBtnText: {
    color: CLUB.textInk,
    fontSize: 15,
    fontWeight: '900',
  },
  refillBtn: {
    backgroundColor: 'rgba(56, 189, 248, 0.18)',
    borderWidth: 1,
    borderColor: CLUB.cyan,
    borderRadius: 12,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  refillBtnText: {
    color: CLUB.cyan,
    fontSize: 13,
    fontWeight: '800',
  },
  complianceNote: {
    color: CLUB.textMuted,
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 15,
  },
});
