import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { TABLE_THEME_LIST, TableThemeId } from '@/constants/tableThemes';
import { TILE_STYLE_LIST, TileStyleId } from '@/constants/tileStyles';
import { CLUB } from '@/constants/tokens';
import { RetentionProgress } from '@/storage/gameStorage';
import { hapticLight, hapticSnap } from '@/utils/feedback';
import { DominoTile } from './DominoTile';
import { CheckIcon, ChipIcon, CloseIcon, TableIcon } from './Icons';

interface ThemesModalProps {
  visible: boolean;
  retention: RetentionProgress;
  onSelectOrUnlockTheme: (themeId: TableThemeId) => void;
  onSelectOrUnlockTileStyle: (tileStyleId: TileStyleId) => void;
  onClose: () => void;
}

export function ThemesModal({
  visible,
  retention,
  onSelectOrUnlockTheme,
  onSelectOrUnlockTileStyle,
  onClose,
}: ThemesModalProps) {
  const [tab, setTab] = useState<'tables' | 'tiles'>('tables');

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
                <Text style={styles.title}>Estilo de Mesa</Text>
              </View>
              <Text style={styles.sub}>
                Saldo: {retention.clubChips.toLocaleString('es-ES')} fichas
              </Text>
            </View>
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Cerrar mesas y fichas"
              style={styles.closeBtn}
            >
              <CloseIcon size={18} color={CLUB.textPrimary} />
            </Pressable>
          </View>

          {/* Segmented Tabs: Mesas vs Fichas */}
          <View style={styles.segmentRow}>
            <Pressable
              onPress={() => {
                hapticLight();
                setTab('tables');
              }}
              style={[styles.segmentBtn, tab === 'tables' && styles.segmentBtnActive]}
            >
              <Text
                style={[
                  styles.segmentText,
                  tab === 'tables' && styles.segmentTextActive,
                ]}
              >
                Mesas ({TABLE_THEME_LIST.length})
              </Text>
            </Pressable>
            <Pressable
              onPress={() => {
                hapticLight();
                setTab('tiles');
              }}
              style={[styles.segmentBtn, tab === 'tiles' && styles.segmentBtnActive]}
            >
              <Text
                style={[
                  styles.segmentText,
                  tab === 'tiles' && styles.segmentTextActive,
                ]}
              >
                Fichas ({TILE_STYLE_LIST.length})
              </Text>
            </Pressable>
          </View>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          >
            {tab === 'tables'
              ? TABLE_THEME_LIST.map((theme) => {
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
                        colors={[theme.woodLight, theme.woodDark]}
                        style={styles.miniTableFrame}
                      >
                        <LinearGradient
                          colors={[theme.feltCenter, theme.feltEdge]}
                          style={styles.miniTableFelt}
                        >
                          <View
                            style={[
                              styles.miniTableInlay,
                              { borderColor: theme.feltInlay },
                            ]}
                          />
                          <View style={styles.miniDomino} />
                        </LinearGradient>
                      </LinearGradient>
                      <View style={styles.info}>
                        <View style={styles.nameRow}>
                          <Text style={styles.name}>{theme.name}</Text>
                          {theme.tag && (
                            <View style={styles.tierBadge}>
                              <Text style={styles.tierBadgeText}>{theme.tag}</Text>
                            </View>
                          )}
                        </View>
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
                          <ChipIcon
                            size={12}
                            color={canAfford ? CLUB.textInk : CLUB.gold}
                          />
                        ) : null}
                        <Text
                          style={[
                            styles.ctaText,
                            (equipped || (!unlocked && canAfford)) && {
                              color: CLUB.textInk,
                            },
                          ]}
                        >
                          {equipped
                            ? 'Activa'
                            : unlocked
                            ? 'Usar'
                            : theme.costChips.toLocaleString('es-ES')}
                        </Text>
                      </View>
                    </Pressable>
                  );
                })
              : TILE_STYLE_LIST.map((tileStyle) => {
                  const unlocked =
                    !tileStyle.cosmeticKey ||
                    retention.unlockedCosmetics.includes(tileStyle.cosmeticKey);
                  const equipped = retention.equippedTileStyle === tileStyle.id;
                  const canAfford = retention.clubChips >= tileStyle.costChips;

                  return (
                    <Pressable
                      key={tileStyle.id}
                      onPress={() => {
                        if (!unlocked && !canAfford) return;
                        hapticSnap();
                        onSelectOrUnlockTileStyle(tileStyle.id);
                      }}
                      style={[
                        styles.row,
                        equipped && styles.rowEquipped,
                        !unlocked && !canAfford && styles.rowLocked,
                      ]}
                    >
                      <View style={styles.miniTilePreview}>
                        <DominoTile
                          a={6}
                          b={5}
                          orientation="horizontal"
                          unit={24}
                          tileStyleId={tileStyle.id}
                        />
                      </View>
                      <View style={styles.info}>
                        <View style={styles.nameRow}>
                          <Text style={styles.name}>{tileStyle.name}</Text>
                          {tileStyle.tag && (
                            <View style={styles.tierBadge}>
                              <Text style={styles.tierBadgeText}>
                                {tileStyle.tag}
                              </Text>
                            </View>
                          )}
                        </View>
                        <Text style={styles.desc}>{tileStyle.subtitle}</Text>
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
                          <ChipIcon
                            size={12}
                            color={canAfford ? CLUB.textInk : CLUB.gold}
                          />
                        ) : null}
                        <Text
                          style={[
                            styles.ctaText,
                            (equipped || (!unlocked && canAfford)) && {
                              color: CLUB.textInk,
                            },
                          ]}
                        >
                          {equipped
                            ? 'Activa'
                            : unlocked
                            ? 'Usar'
                            : tileStyle.costChips.toLocaleString('es-ES')}
                        </Text>
                      </View>
                    </Pressable>
                  );
                })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(6, 12, 24, 0.78)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    maxHeight: '84%',
    backgroundColor: 'rgba(14, 28, 52, 0.97)',
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
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentRow: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: 'rgba(7, 17, 36, 0.75)',
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
    borderColor: 'rgba(148, 190, 255, 0.16)',
  },
  segmentBtn: {
    flex: 1,
    minHeight: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentBtnActive: {
    backgroundColor: 'rgba(245, 196, 81, 0.2)',
    borderWidth: 1,
    borderColor: CLUB.gold,
  },
  segmentText: {
    color: CLUB.textSecondary,
    fontSize: 13,
    fontWeight: '800',
  },
  segmentTextActive: {
    color: CLUB.goldSoft,
  },
  scroll: {
    flexGrow: 0,
  },
  list: {
    gap: 9,
    paddingBottom: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
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
    opacity: 0.62,
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
  miniTilePreview: {
    width: 56,
    height: 44,
    borderRadius: 10,
    backgroundColor: 'rgba(8, 22, 42, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  name: {
    color: CLUB.textPrimary,
    fontSize: 13.5,
    fontWeight: '900',
  },
  tierBadge: {
    backgroundColor: 'rgba(245, 196, 81, 0.2)',
    borderRadius: 6,
    borderWidth: 0.8,
    borderColor: CLUB.gold,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  tierBadgeText: {
    color: CLUB.goldSoft,
    fontSize: 9,
    fontWeight: '900',
  },
  desc: {
    color: CLUB.textSecondary,
    fontSize: 11.5,
    fontWeight: '600',
    marginTop: 2,
  },
  ctaPill: {
    flexDirection: 'row',
    gap: 4,
    minWidth: 74,
    minHeight: 34,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 9,
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
