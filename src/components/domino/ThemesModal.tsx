import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { TABLE_THEME_LIST, TableThemeId } from '@/constants/tableThemes';
import { TILE_STYLE_LIST, TileStyleId } from '@/constants/tileStyles';
import { CLUB, FONT } from '@/constants/tokens';
import { usePalette } from '@/context/PaletteContext';
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
  const { palette } = usePalette();
  const [tab, setTab] = useState<'tables' | 'tiles'>('tables');

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
                <TableIcon size={18} color={palette.brandAccent} />
                <Text style={[styles.title, { color: palette.textPrimary }]}>
                  Estilo de Mesa
                </Text>
              </View>
              <Text style={[styles.sub, { color: palette.winnerText }]}>
                Saldo: {retention.clubChips.toLocaleString('es-ES')} fichas
              </Text>
            </View>
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Cerrar mesas y fichas"
              style={[styles.closeBtn, { backgroundColor: palette.closeBtnBg }]}
            >
              <CloseIcon size={18} color={palette.textPrimary} />
            </Pressable>
          </View>

          {/* Segmented Tabs: Mesas vs Fichas */}
          <View
            style={[
              styles.segmentRow,
              {
                backgroundColor: palette.modalInputBg,
                borderColor: palette.modalCardBorder,
              },
            ]}
          >
            <Pressable
              onPress={() => {
                hapticLight();
                setTab('tables');
              }}
              style={[
                styles.segmentBtn,
                tab === 'tables' && { backgroundColor: palette.selectedBg },
              ]}
            >
              <Text
                style={[
                  styles.segmentText,
                  {
                    color:
                      tab === 'tables'
                        ? palette.selectedText
                        : palette.textSecondary,
                  },
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
              style={[
                styles.segmentBtn,
                tab === 'tiles' && { backgroundColor: palette.selectedBg },
              ]}
            >
              <Text
                style={[
                  styles.segmentText,
                  {
                    color:
                      tab === 'tiles'
                        ? palette.selectedText
                        : palette.textSecondary,
                  },
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
                        {
                          backgroundColor: equipped
                            ? palette.positiveBg
                            : palette.modalCardBg,
                          borderColor: equipped
                            ? palette.positiveBorder
                            : palette.modalCardBorder,
                          borderBottomColor: equipped
                            ? palette.positiveBorder
                            : palette.modalCardLip,
                        },
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
                          <Text style={[styles.name, { color: palette.textPrimary }]}>
                            {theme.name}
                          </Text>
                          {theme.tag && (
                            <View
                              style={[
                                styles.tierBadge,
                                {
                                  backgroundColor: palette.chipPillBg,
                                  borderColor: palette.borderWarm,
                                },
                              ]}
                            >
                              <Text
                                style={[
                                  styles.tierBadgeText,
                                  { color: palette.chipPillText },
                                ]}
                              >
                                {theme.tag}
                              </Text>
                            </View>
                          )}
                        </View>
                        <Text
                          style={[styles.desc, { color: palette.textSecondary }]}
                        >
                          {theme.subtitle}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.ctaPill,
                          {
                            backgroundColor: equipped
                              ? palette.accent
                              : !unlocked && canAfford
                              ? CLUB.gold
                              : palette.modalInputBg,
                          },
                        ]}
                      >
                        {equipped ? (
                          <CheckIcon size={13} color={palette.textOnAccent} />
                        ) : !unlocked ? (
                          <ChipIcon
                            size={12}
                            color={canAfford ? CLUB.textInk : palette.chipIconColor}
                          />
                        ) : null}
                        <Text
                          style={[
                            styles.ctaText,
                            {
                              color: equipped
                                ? palette.textOnAccent
                                : !unlocked && canAfford
                                ? CLUB.textInk
                                : palette.textPrimary,
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
                        {
                          backgroundColor: equipped
                            ? palette.positiveBg
                            : palette.modalCardBg,
                          borderColor: equipped
                            ? palette.positiveBorder
                            : palette.modalCardBorder,
                          borderBottomColor: equipped
                            ? palette.positiveBorder
                            : palette.modalCardLip,
                        },
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
                          <Text style={[styles.name, { color: palette.textPrimary }]}>
                            {tileStyle.name}
                          </Text>
                          {tileStyle.tag && (
                            <View
                              style={[
                                styles.tierBadge,
                                {
                                  backgroundColor: palette.chipPillBg,
                                  borderColor: palette.borderWarm,
                                },
                              ]}
                            >
                              <Text
                                style={[
                                  styles.tierBadgeText,
                                  { color: palette.chipPillText },
                                ]}
                              >
                                {tileStyle.tag}
                              </Text>
                            </View>
                          )}
                        </View>
                        <Text
                          style={[styles.desc, { color: palette.textSecondary }]}
                        >
                          {tileStyle.subtitle}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.ctaPill,
                          {
                            backgroundColor: equipped
                              ? palette.accent
                              : !unlocked && canAfford
                              ? CLUB.gold
                              : palette.modalInputBg,
                          },
                        ]}
                      >
                        {equipped ? (
                          <CheckIcon size={13} color={palette.textOnAccent} />
                        ) : !unlocked ? (
                          <ChipIcon
                            size={12}
                            color={canAfford ? CLUB.textInk : palette.chipIconColor}
                          />
                        ) : null}
                        <Text
                          style={[
                            styles.ctaText,
                            {
                              color: equipped
                                ? palette.textOnAccent
                                : !unlocked && canAfford
                                ? CLUB.textInk
                                : palette.textPrimary,
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
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    maxHeight: '85%',
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
  segmentRow: {
    flexDirection: 'row',
    gap: 6,
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
  },
  segmentBtn: {
    flex: 1,
    minHeight: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentText: {
    fontFamily: FONT.extraBold,
    fontSize: 13,
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
    borderRadius: 16,
    borderWidth: 1.5,
    borderBottomWidth: 3.5,
    padding: 10,
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
    backgroundColor: '#14626A',
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
    fontFamily: FONT.display,
    fontSize: 14.5,
  },
  tierBadge: {
    borderRadius: 6,
    borderWidth: 0.8,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  tierBadgeText: {
    fontFamily: FONT.extraBold,
    fontSize: 9,
  },
  desc: {
    fontFamily: FONT.semi,
    fontSize: 11.5,
    marginTop: 2,
  },
  ctaPill: {
    flexDirection: 'row',
    gap: 4,
    minWidth: 74,
    minHeight: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 9,
  },
  ctaText: {
    fontFamily: FONT.extraBold,
    fontSize: 12,
    fontVariant: ['tabular-nums'],
  },
});
