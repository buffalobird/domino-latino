import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { AvatarConfig } from '@/constants/avatarCatalog';
import { getSeatProfile } from '@/constants/seatProfiles';
import { CLUB, FONT } from '@/constants/tokens';
import { usePalette } from '@/context/PaletteContext';
import { GameState } from '@/engine/types';
import { RetentionProgress } from '@/storage/gameStorage';
import { hapticLight, hapticSnap } from '@/utils/feedback';
import { AvatarIllustration } from './AvatarIllustration';
import { DominoTile } from './DominoTile';
import { GlossyButton } from './GlossyButton';
import { ChipIcon, StarIcon, TrophyIcon } from './Icons';

interface MatchOverViewProps {
  state: GameState;
  retention: RetentionProgress;
  lastReward?: { chips: number; xp: number } | null;
  seatAvatars?: Record<number, AvatarConfig | undefined>;
  seatIsHuman?: Record<number, boolean>;
  seatNames?: Record<number, string>;
  seatUserIds?: Record<number, string | null>;
  savedCompanionIds?: string[];
  onSaveCompanion?: (companionUserId: string) => Promise<void>;
  onRematch: () => void;
  onChangeMode: () => void;
}

export function MatchOverView({
  state,
  retention,
  lastReward = null,
  seatAvatars,
  seatIsHuman,
  seatNames,
  seatUserIds,
  savedCompanionIds = [],
  onSaveCompanion,
  onRematch,
  onChangeMode,
}: MatchOverViewProps) {
  const { palette } = usePalette();
  const summary = state.lastHandSummary;
  const humanWon = state.matchWinnerIndex === 0;
  const remainingStars = Math.max(0, 3 - retention.dailyStars);
  const [localSaved, setLocalSaved] = useState<string[]>(savedCompanionIds);

  const resolveSeat = (seat: number) => {
    const base = getSeatProfile(state.mode, seat);
    const isBot = seatIsHuman ? !seatIsHuman[seat] : base.isBot;
    const displayName =
      seatNames?.[seat] && !seatNames[seat].startsWith('CPU')
        ? seatNames[seat]
        : base.displayName;
    const avatarConfig =
      seat === 0
        ? retention.avatarConfig
        : seatAvatars?.[seat] ?? base.avatarConfig;
    const userId = seatUserIds?.[seat] ?? null;
    return { ...base, isBot, displayName, avatarConfig, userId };
  };

  const humanCoPlayers = (summary?.remainingHands ?? [])
    .map((m) => resolveSeat(m.seat))
    .filter((p) => p.seat !== 0 && !p.isBot && Boolean(p.userId));

  const winnerDisplayLabel =
    state.matchWinnerIndex === null
      ? ''
      : state.mode === '2v2'
      ? state.scoreLabels[state.matchWinnerIndex]
      : resolveSeat(state.matchWinnerIndex).displayName;

  const renderFinalColumns = () => {
    if (!summary) return null;

    if (state.mode === '2v2') {
      const teams = [
        {
          teamId: 0,
          title: 'Nosotros',
          accent: CLUB.emerald,
          members: summary.remainingHands.filter((e) => e.teamId === 0),
        },
        {
          teamId: 1,
          title: 'Rivales',
          accent: CLUB.coral,
          members: summary.remainingHands.filter((e) => e.teamId === 1),
        },
      ];
      return (
        <View style={styles.twoColRow}>
          {teams.map((team) => {
            const isWin = state.matchWinnerIndex === team.teamId;
            return (
              <View
                key={team.teamId}
                style={[
                  styles.colCard,
                  {
                    backgroundColor: isWin
                      ? palette.winnerCardBg
                      : palette.modalCardBg,
                    borderColor: isWin
                      ? palette.winnerCardBorder
                      : palette.modalCardBorder,
                    borderBottomColor: isWin
                      ? palette.winnerCardBorder
                      : palette.modalCardLip,
                  },
                ]}
              >
                <View style={styles.pairRow}>
                  {team.members.map((m) => {
                    const prof = resolveSeat(m.seat);
                    return (
                      <View
                        key={m.seat}
                        style={[
                          styles.miniRing,
                          {
                            borderColor: isWin
                              ? palette.winnerCardBorder
                              : team.accent,
                          },
                        ]}
                      >
                        <AvatarIllustration
                          isBot={prof.isBot}
                          seatHint={m.seat}
                          accentColor={prof.accentColor}
                          mood={isWin ? 'win' : 'lose'}
                          size={34}
                          avatarConfig={prof.avatarConfig}
                        />
                      </View>
                    );
                  })}
                </View>
                <Text style={[styles.colName, { color: palette.textPrimary }]}>
                  {team.title}
                </Text>
                <Text
                  style={[
                    styles.colScore,
                    {
                      color: isWin ? palette.winnerText : palette.textSecondary,
                    },
                  ]}
                >
                  {state.scores[team.teamId]}/{state.targetScore}
                </Text>

                {team.members.map((m) => {
                  const prof = resolveSeat(m.seat);
                  return (
                    <View key={m.seat} style={styles.subTray}>
                      <Text style={[styles.subLabel, { color: palette.textMuted }]}>
                        {prof.displayName} ({m.pipSum})
                      </Text>
                      {m.tiles.length === 0 ? (
                        <Text
                          style={[
                            styles.closedSmall,
                            { color: palette.positiveText },
                          ]}
                        >
                          ¡Se pegó!
                        </Text>
                      ) : (
                        <View
                          style={[
                            styles.vTilesWrap,
                            { backgroundColor: palette.modalInputBg },
                          ]}
                        >
                          {m.tiles.map((t) => (
                            <DominoTile
                              key={t.id}
                              a={t.a}
                              b={t.b}
                              orientation="vertical"
                              unit={19}
                              tileStyleId={retention.equippedTileStyle}
                            />
                          ))}
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            );
          })}
        </View>
      );
    }

    return (
      <View style={state.mode === '1v1' ? styles.twoColRow : styles.fourGrid}>
        {summary.remainingHands.map((entry) => {
          const prof = resolveSeat(entry.seat);
          const isWin = state.matchWinnerIndex === entry.teamId;
          const unit = entry.tiles.length > 5 ? 18 : 22;
          return (
            <View
              key={entry.seat}
              style={[
                state.mode === '1v1' ? styles.colCard : styles.gridCard,
                {
                  backgroundColor: isWin
                    ? palette.winnerCardBg
                    : palette.modalCardBg,
                  borderColor: isWin
                    ? palette.winnerCardBorder
                    : palette.modalCardBorder,
                  borderBottomColor: isWin
                    ? palette.winnerCardBorder
                    : palette.modalCardLip,
                },
              ]}
            >
              <View
                style={[
                  styles.avatarRing,
                  {
                    borderColor: isWin
                      ? palette.winnerCardBorder
                      : prof.accentColor,
                  },
                ]}
              >
                <AvatarIllustration
                  isBot={prof.isBot}
                  seatHint={entry.seat}
                  accentColor={prof.accentColor}
                  mood={isWin ? 'win' : 'lose'}
                  size={state.mode === '1v1' ? 44 : 34}
                  avatarConfig={prof.avatarConfig}
                />
              </View>
              <Text
                style={[styles.colName, { color: palette.textPrimary }]}
                numberOfLines={1}
              >
                {prof.displayName}
              </Text>
              <Text
                style={[
                  styles.colScore,
                  {
                    color: isWin ? palette.winnerText : palette.textSecondary,
                  },
                ]}
              >
                {state.scores[entry.teamId]}/{state.targetScore}
              </Text>
              {entry.tiles.length === 0 ? (
                <Text
                  style={[styles.closedSmall, { color: palette.positiveText }]}
                >
                  ¡Se pegó!
                </Text>
              ) : (
                <View
                  style={[
                    styles.vTilesWrap,
                    { backgroundColor: palette.modalInputBg },
                  ]}
                >
                  {entry.tiles.map((t) => (
                    <DominoTile
                      key={t.id}
                      a={t.a}
                      b={t.b}
                      orientation="vertical"
                      unit={unit}
                      tileStyleId={retention.equippedTileStyle}
                    />
                  ))}
                </View>
              )}
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <Animated.View
      entering={FadeIn.duration(180)}
      style={[styles.backdrop, { backgroundColor: palette.modalBackdrop }]}
    >
      <View
        style={[
          styles.card,
          {
            backgroundColor: palette.modalBg,
            borderColor: palette.modalBorder,
          },
        ]}
      >
        <View
          style={[
            styles.banner,
            {
              backgroundColor: humanWon
                ? palette.positiveBg
                : palette.modalCardBg,
              borderColor: humanWon
                ? palette.positiveBorder
                : palette.borderWarm,
            },
          ]}
        >
          <View style={styles.headlineRow}>
            {humanWon && <TrophyIcon size={23} color={palette.winnerCardBorder} />}
            <Text style={[styles.headline, { color: palette.textPrimary }]}>
              {humanWon ? '¡Victoria en la mesa!' : `Ganó ${winnerDisplayLabel}`}
            </Text>
          </View>
          <Text style={[styles.sub, { color: palette.textSecondary }]}>
            Meta de {state.targetScore} pts en {state.handNumber}{' '}
            {state.handNumber === 1 ? 'mano' : 'manos'}
          </Text>
        </View>

        <ScrollView
          style={styles.scrollBody}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Earned Club Chips + XP + Daily Stars Celebration Row */}
          <View
            style={[
              styles.challengeRow,
              {
                backgroundColor: palette.modalCardBg,
                borderColor: palette.borderWarm,
                borderBottomColor: palette.modalCardLip,
              },
            ]}
          >
            <View style={styles.starsRow}>
              {[0, 1, 2].map((idx) => (
                <StarIcon
                  key={idx}
                  size={18}
                  color={idx < retention.dailyStars ? palette.starColor : palette.starMuted}
                  filled={idx < retention.dailyStars}
                />
              ))}
            </View>
            <View style={styles.challengeCol}>
              <Text
                style={[styles.challengeTitle, { color: palette.textPrimary }]}
              >
                {remainingStars === 0
                  ? 'Reto diario completado'
                  : `Reto diario · ${retention.dailyStars}/3`}
              </Text>
              <Text
                style={[styles.challengeSub, { color: palette.textSecondary }]}
              >
                {humanWon
                  ? `Racha activa: ${retention.winStreak}`
                  : 'Buena partida · ¿Echamos la revancha?'}
              </Text>
            </View>

            {lastReward && (
              <View
                style={[
                  styles.rewardBadge,
                  { backgroundColor: palette.chipPillBg },
                ]}
              >
                <ChipIcon size={13} color={palette.chipIconColor} />
                <Text
                  style={[styles.rewardBadgeText, { color: palette.chipPillText }]}
                >
                  +{lastReward.chips} · +{lastReward.xp} XP
                </Text>
              </View>
            )}
          </View>

          {renderFinalColumns()}

          {humanCoPlayers.length > 0 && onSaveCompanion && (
            <View
              style={[
                styles.companionsCard,
                {
                  backgroundColor: palette.modalCardBg,
                  borderColor: palette.borderWarm,
                },
              ]}
            >
              <Text
                style={[styles.companionsTitle, { color: palette.textPrimary }]}
              >
                ¿Buena compañía en la mesa?
              </Text>
              <Text
                style={[styles.companionsSub, { color: palette.textSecondary }]}
              >
                Guárdalos en tu círculo para invitarlos en 1 toque cuando quieras.
              </Text>
              <View style={styles.companionsList}>
                {humanCoPlayers.map((p) => {
                  const uid = p.userId!;
                  const isSaved = localSaved.includes(uid);
                  return (
                    <View key={uid} style={styles.companionRow}>
                      <AvatarIllustration
                        isBot={false}
                        accentColor={p.accentColor}
                        size={34}
                        avatarConfig={p.avatarConfig}
                      />
                      <Text
                        style={[
                          styles.companionName,
                          { color: palette.textPrimary },
                        ]}
                        numberOfLines={1}
                      >
                        {p.displayName}
                      </Text>
                      <Pressable
                        disabled={isSaved}
                        onPress={() => {
                          hapticLight();
                          setLocalSaved((prev) =>
                            prev.includes(uid) ? prev : [...prev, uid]
                          );
                          onSaveCompanion(uid).catch(() => {});
                        }}
                        style={[
                          styles.companionBtn,
                          {
                            backgroundColor: isSaved
                              ? palette.positiveBg
                              : palette.chipPillBg,
                            borderColor: isSaved
                              ? palette.positiveBorder
                              : palette.borderWarm,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.companionBtnText,
                            {
                              color: isSaved
                                ? palette.positiveText
                                : palette.chipPillText,
                            },
                          ]}
                        >
                          {isSaved ? 'En tu mesa ✓' : '+ Compañero'}
                        </Text>
                      </Pressable>
                    </View>
                  );
                })}
              </View>
            </View>
          )}
        </ScrollView>

        <View style={styles.actions}>
          <GlossyButton
            title="Jugar revancha"
            variant="emerald"
            onPress={() => {
              hapticSnap();
              onRematch();
            }}
          />

          <GlossyButton
            title="Volver al inicio"
            variant="glass"
            compact
            onPress={() => {
              hapticSnap();
              onChangeMode();
            }}
          />
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    zIndex: 90,
  },
  card: {
    width: '100%',
    maxWidth: 460,
    maxHeight: '90%',
    borderRadius: 26,
    borderWidth: 1.5,
    padding: 16,
    gap: 11,
    boxShadow: '0px 18px 44px rgba(0, 0, 0, 0.58)',
  },
  headlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  banner: {
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 14,
    alignItems: 'center',
    gap: 2,
    borderWidth: 1.25,
  },
  headline: {
    fontFamily: FONT.display,
    fontSize: 23,
  },
  sub: {
    fontFamily: FONT.bold,
    fontSize: 12.5,
  },
  scrollBody: {
    flexGrow: 0,
  },
  scrollContent: {
    gap: 10,
  },
  challengeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    borderRadius: 16,
    borderWidth: 1.25,
    borderBottomWidth: 3.5,
    padding: 10,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
  },
  challengeCol: {
    flex: 1,
  },
  challengeTitle: {
    fontFamily: FONT.extraBold,
    fontSize: 12.5,
  },
  challengeSub: {
    fontFamily: FONT.semi,
    fontSize: 11,
  },
  rewardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  rewardBadgeText: {
    fontFamily: FONT.extraBold,
    fontSize: 11,
    fontVariant: ['tabular-nums'],
  },
  twoColRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'stretch',
  },
  fourGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  colCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1.5,
    borderBottomWidth: 3.5,
    padding: 10,
    alignItems: 'center',
    gap: 5,
  },
  gridCard: {
    width: '48.5%',
    borderRadius: 16,
    borderWidth: 1.5,
    borderBottomWidth: 3.5,
    padding: 8,
    alignItems: 'center',
    gap: 5,
  },
  pairRow: {
    flexDirection: 'row',
    gap: 6,
  },
  avatarRing: {
    borderRadius: 999,
    borderWidth: 2,
    padding: 2,
    overflow: 'hidden',
  },
  miniRing: {
    borderRadius: 999,
    borderWidth: 2,
    padding: 1,
    overflow: 'hidden',
  },
  colName: {
    fontFamily: FONT.display,
    fontSize: 14,
  },
  colScore: {
    fontFamily: FONT.display,
    fontSize: 15.5,
    fontVariant: ['tabular-nums'],
  },
  subTray: {
    width: '100%',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  subLabel: {
    fontFamily: FONT.bold,
    fontSize: 11,
  },
  closedSmall: {
    fontFamily: FONT.extraBold,
    fontSize: 12,
    paddingVertical: 6,
  },
  vTilesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 4,
    borderRadius: 10,
    padding: 6,
    width: '100%',
  },
  companionsCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    gap: 6,
  },
  companionsTitle: {
    fontFamily: FONT.extraBold,
    fontSize: 13,
  },
  companionsSub: {
    fontFamily: FONT.semi,
    fontSize: 11.5,
  },
  companionsList: {
    gap: 7,
    marginTop: 4,
  },
  companionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  companionName: {
    flex: 1,
    fontFamily: FONT.extraBold,
    fontSize: 13,
  },
  companionBtn: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 5,
  },
  companionBtnText: {
    fontFamily: FONT.extraBold,
    fontSize: 11.5,
  },
  actions: {
    gap: 8,
  },
});
