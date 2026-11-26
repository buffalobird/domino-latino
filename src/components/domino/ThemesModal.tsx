import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { TABLE_THEME_LIST, TableThemeId } from '@/constants/tableThemes';
import { CLUB } from '@/constants/tokens';
import { RetentionProgress } from '@/storage/gameStorage';
import { hapticSnap } from '@/utils/feedback';
import { CloseIcon } from './Icons';

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
              <Text style={styles.title}>Mesas del Club</Text>
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
                  <LinearGradient
                    colors={[theme.feltCenter, theme.feltEdge]}
                    style={[styles.swatch, { borderColor: theme.woodLight }]}
                  />
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
    backgroundColor: CLUB.surfaceCard,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: CLUB.glassBorder,
    padding: 16,
    gap: 12,
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
  swatch: {
    width: 46,
    height: 46,
    borderRadius: 10,
    borderWidth: 3,
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
    minWidth: 66,
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
