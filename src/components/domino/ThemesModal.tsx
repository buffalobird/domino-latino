import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { TABLE_THEME_LIST, TableThemeId } from '@/constants/tableThemes';
import { CLUB } from '@/constants/tokens';
import { RetentionProgress } from '@/storage/gameStorage';
import { hapticSnap } from '@/utils/feedback';
import { CheckIcon, ChipIcon, CloseIcon, TableIcon } from './Icons';

interface ThemesModalProps {
  visible: boolean;
  retention: RetentionProgress;
  onSelectOrUnlockTheme: (themeId: TableThemeId) => void;
  onClose: () => void;
}

export function ThemesModal({
  visible,
  retention,
  onSelectOrUnlockTheme,
  onClose,
}: ThemesModalProps) {
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
                <TableIcon size={18} color={CLUB.gold} />
                <Text style={styles.title}>Mesas del Club</Text>
              </View>
              <Text style={styles.sub}>
                Saldo: {retention.clubChips.toLocaleString('es-ES')} fichas
              </Text>
            </View>
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Cerrar mesas"
              style={styles.closeBtn}
            >
              <CloseIcon size={18} color={CLUB.textPrimary} />
            </Pressable>
          </View>

          <View style={styles.list}>
            {TABLE_THEME_LIST.map((theme) => {
              const unlocked = retention.unlockedThemes.includes(theme.id);
              const equipped = retention.equippedTheme === theme.id;
              const canAfford = retention.clubChips >= theme.costChips;

              return (
                <Pressable
                  key={theme.id}
                  onPress={() => {
                    if (!unlocked && !canAfford) return;
                    hapticSnap();
                    onSelectOrUnlockTheme(theme.id);
                  }}
                  style={[
                    styles.row,
                    equipped && styles.rowEquipped,
                    !unlocked && !canAfford && styles.rowLocked,
                  ]}
                >
                  {/* Miniature tactile domino table preview (wood rail + felt + brass inlay + mini domino) */}
                  <LinearGradient
                    colors={[theme.woodLight, theme.woodDark]}
                    style={styles.miniTableFrame}
                  >
                    <LinearGradient
                      colors={[theme.feltCenter, theme.feltEdge]}
                      style={styles.miniTableFelt}
                    >
                      <View
                        style={[styles.miniTableInlay, { borderColor: theme.feltInlay }]}
                      />
                      <View style={styles.miniDomino} />
                    </LinearGradient>
                  </LinearGradient>
                  <View style={styles.info}>
                    <Text style={styles.name}>{theme.name}</Text>
                    <Text style={styles.desc}>{theme.subtitle}</Text>
                  </View>
                  <View
                    style={[
                      styles.ctaPill,
                      equipped && styles.ctaEquipped,
                      !unlocked && canAfford && styles.ctaBuy,
                    ]}
                  >
                    {equipped ? (
                      <CheckIcon size={13} color={CLUB.textInk} />
                    ) : !unlocked ? (
                      <ChipIcon size={12} color={canAfford ? CLUB.textInk : CLUB.gold} />
                    ) : null}
                    <Text
                      style={[
                        styles.ctaText,
                        (equipped || (!unlocked && canAfford)) && { color: CLUB.textInk },
                      ]}
                    >
                      {equipped
                        ? 'Activa'
                        : unlocked
                        ? 'Usar'
                        : `${theme.costChips}`}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
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
  list: {
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: CLUB.surfaceCardLight,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: CLUB.glassBorder,
    padding: 10,
  },
  rowEquipped: {
    borderColor: CLUB.emerald,
  },
  rowLocked: {
    opacity: 0.55,
  },
  miniTableFrame: {
    width: 56,
    height: 44,
    borderRadius: 10,
    padding: 3,
  },
  miniTableFelt: {
    flex: 1,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  miniTableInlay: {
    position: 'absolute',
    top: 3,
    right: 3,
    bottom: 3,
    left: 3,
    borderRadius: 5,
    borderWidth: 1,
  },
  miniDomino: {
    width: 18,
    height: 9,
    borderRadius: 2.5,
    backgroundColor: CLUB.ivoryTop,
    borderBottomWidth: 1.5,
    borderBottomColor: CLUB.ivoryLip,
  },
  info: {
    flex: 1,
  },
  name: {
    color: CLUB.textPrimary,
    fontSize: 14,
    fontWeight: '900',
  },
  desc: {
    color: CLUB.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  ctaPill: {
    flexDirection: 'row',
    gap: 4,
    minWidth: 72,
    minHeight: 34,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  ctaEquipped: {
    backgroundColor: CLUB.emerald,
  },
  ctaBuy: {
    backgroundColor: CLUB.gold,
  },
  ctaText: {
    color: CLUB.textPrimary,
    fontSize: 12,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
});
