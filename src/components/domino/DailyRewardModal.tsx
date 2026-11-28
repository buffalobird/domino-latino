import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { FONT } from '@/constants/tokens';
import { usePalette } from '@/context/PaletteContext';
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
  const { palette } = usePalette();
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
      <View style={[styles.backdrop, { backgroundColor: palette.modalBackdrop }]}>
        <View
          style={[
            styles.card,
            {
              backgroundColor: palette.modalBg,
              borderColor: palette.modalBorder,
            },
          ]}
        >
          <View style={styles.header}>
            <View>
              <View style={styles.titleRow}>
                <ChipIcon size={19} color={palette.chipIconColor} />
                <Text style={[styles.title, { color: palette.textPrimary }]}>
                  Fichas de Club
                </Text>
              </View>
              <Text style={[styles.sub, { color: palette.winnerText }]}>
                Saldo actual: {retention.clubChips.toLocaleString('es-ES')} fichas
              </Text>
            </View>
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Cerrar bono diario"
              style={[styles.closeBtn, { backgroundColor: palette.closeBtnBg }]}
            >
              <CloseIcon size={18} color={palette.textPrimary} />
            </Pressable>
          </View>

          <Text style={[styles.sectionLabel, { color: palette.textMuted }]}>
            BONO DIARIO DE 7 DÍAS
          </Text>

          <View style={styles.daysGrid}>
            {DAILY_REWARD_SCHEDULE.map((reward, idx) => {
              const isPast = idx < retention.dailyClaimStreak;
              const isToday = idx === dayIndex;
              const isGrandPrize = idx === 6;
              const highlight = isToday && claimable;
              return (
                <View
                  key={idx}
                  style={[
                    styles.dayCell,
                    {
                      backgroundColor: highlight
                        ? palette.winnerCardBg
                        : palette.modalCardBg,
                      borderColor: highlight
                        ? palette.winnerCardBorder
                        : palette.modalCardBorder,
                      borderBottomColor: highlight
                        ? palette.winnerCardBorder
                        : palette.modalCardLip,
                    },
                    isGrandPrize && styles.dayCellWide,
                    isPast && styles.dayCellPast,
                  ]}
                >
                  <View style={styles.dayTopRow}>
                    {isGrandPrize && (
                      <CrownIcon size={14} color={palette.winnerCardBorder} />
                    )}
                    <Text
                      style={[styles.dayNum, { color: palette.textSecondary }]}
                    >
                      {isGrandPrize ? 'Día 7 · Gran Premio' : `Día ${idx + 1}`}
                    </Text>
                    {isPast && <CheckIcon size={12} color={palette.accent} />}
                  </View>
                  <View style={styles.rewardRow}>
                    <ChipIcon size={12} color={palette.chipIconColor} />
                    <Text
                      style={[
                        styles.dayReward,
                        {
                          color:
                            highlight || isGrandPrize
                              ? palette.winnerText
                              : palette.textPrimary,
                        },
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

          <Text style={[styles.complianceNote, { color: palette.textMuted }]}>
            Las Fichas de Club son moneda de entretenimiento sin valor monetario
            real y nunca se venden por dinero.
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 26,
    borderWidth: 1.5,
    padding: 18,
    gap: 12,
    boxShadow: '0px 18px 44px rgba(0, 0, 0, 0.55)',
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
    fontFamily: FONT.display,
    fontSize: 20,
  },
  sub: {
    fontFamily: FONT.extraBold,
    fontSize: 12.5,
    fontVariant: ['tabular-nums'],
    marginTop: 2,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionLabel: {
    fontFamily: FONT.extraBold,
    fontSize: 11,
    letterSpacing: 0.9,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dayCell: {
    width: '31%',
    borderRadius: 14,
    borderWidth: 1.25,
    borderBottomWidth: 3.5,
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
    opacity: 0.5,
  },
  dayNum: {
    fontFamily: FONT.extraBold,
    fontSize: 11,
  },
  dayReward: {
    fontFamily: FONT.display,
    fontSize: 15.5,
    fontVariant: ['tabular-nums'],
  },
  complianceNote: {
    fontFamily: FONT.semi,
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 15,
  },
});
