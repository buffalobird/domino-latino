import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AvatarConfig } from '@/constants/avatarCatalog';
import { getSeatProfile } from '@/constants/seatProfiles';
import { CLUB } from '@/constants/tokens';
import { GameState } from '@/engine/types';
import { RetentionProgress } from '@/storage/gameStorage';
import { hapticLight, hapticSnap } from '@/utils/feedback';
import { AvatarIllustration } from './AvatarIllustration';
import { DominoTile } from './DominoTile';
import { GlossyButton } from './GlossyButton';
import { StarIcon, TrophyIcon } from './Icons';

interface MatchOverViewProps {
  state: GameState;
  retention: RetentionProgress;
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
  seatAvatars,
  seatIsHuman,
  seatNames,
  seatUserIds,
  savedCompanionIds = [],
  onSaveCompanion,
  onRematch,
  onChangeMode,
}: MatchOverViewProps) {
  const summary = state.lastHandSummary;
  const humanWon = state.matchWinnerIndex === 0;
  const remainingStars = Math.max(0, 3 - retention.dailyStars);
  const [countdown, setCountdown] = useState(10);
  const [localSaved, setLocalSaved] = useState<string[]>(savedCompanionIds);

  const resolveSeat = (seat: number) => {
    const base = getSeatProfile(state.mode, seat);
    const isBot = seatIsHuman ? !seatIsHuman[seat] : base.isBot;
    const displayName = seatNames?.[seat] ?? base.displayName;
    const avatarConfig = seat === 0 ? retention.avatarConfig : seatAvatars?.[seat];
    const userId = seatUserIds?.[seat] ?? null;
    return { ...base, isBot, displayName, avatarConfig, userId };
  };

  const humanCoPlayers = (summary?.remainingHands ?? [])
    .map((m) => resolveSeat(m.seat))
    .filter((p) => p.seat !== 0 && !p.isBot && Boolean(p.userId));

  useEffect(() => {
    if (countdown <= 0) {
      onRematch();
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown, onRematch]);

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
                style={[styles.colCard, isWin && styles.colCardWin]}
              >
                <View style={styles.pairRow}>
                  {team.members.map((m) => {
                    const prof = resolveSeat(m.seat);
                    return (
                      <View
                        key={m.seat}
                        style={[
                          styles.miniRing,
                          { borderColor: isWin ? CLUB.gold : team.accent },
                        ]}
                      >
                        <AvatarIllustration
                          isBot={prof.isBot}
                          accentColor={prof.accentColor}
                          mood={isWin ? 'win' : 'lose'}
                          size={34}
                          avatarConfig={prof.avatarConfig}
                        />
                      </View>
                    );
                  })}
                </View>
                <Text style={styles.colName}>{team.title}</Text>
                <Text style={[styles.colScore, isWin && { color: CLUB.gold }]}>
                  {state.scores[team.teamId]}/{state.targetScore}
                </Text>

                {team.members.map((m) => {
                  const prof = resolveSeat(m.seat);
                  return (
                    <View key={m.seat} style={styles.subTray}>
                      <Text style={styles.subLabel}>
                        {prof.displayName} ({m.pipSum})
                      </Text>
                      {m.tiles.length === 0 ? (
                        <Text style={styles.closedSmall}>¡Se pegó!</Text>
                      ) : (
                        <View style={styles.vTilesWrap}>
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

    // 1v1 (2 columns) or 4ffa (2x2 grid)
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
                isWin && styles.colCardWin,
              ]}
            >
              <View
                style={[
                  styles.avatarRing,
                  { borderColor: isWin ? CLUB.gold : prof.accentColor },
                ]}
              >
                <AvatarIllustration
                  isBot={prof.isBot}
                  accentColor={prof.accentColor}
                  mood={isWin ? 'win' : 'lose'}
                  size={state.mode === '1v1' ? 44 : 34}
                  avatarConfig={prof.avatarConfig}
                />
              </View>
              <Text style={styles.colName} numberOfLines={1}>
                {prof.displayName}
              </Text>
              <Text style={[styles.colScore, isWin && { color: CLUB.gold }]}>
                {state.scores[entry.teamId]}/{state.targetScore}
              </Text>
              {entry.tiles.length === 0 ? (
                <Text style={styles.closedSmall}>¡Se pegó!</Text>
              ) : (
                <View style={styles.vTilesWrap}>
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
    <View style={styles.backdrop}>
      <View style={styles.card}>
        <View style={[styles.banner, humanWon ? styles.bannerWin : styles.bannerLoss]}>
          <View style={styles.headlineRow}>
            {humanWon && <TrophyIcon size={22} color={CLUB.gold} />}
            <Text style={styles.headline}>
              {humanWon ? '¡Victoria!' : `Ganó ${winnerDisplayLabel}`}
            </Text>
          </View>
          <Text style={styles.sub}>
            Meta de {state.targetScore} pts en {state.handNumber}{' '}
            {state.handNumber === 1 ? 'mano' : 'manos'}
          </Text>
        </View>

        <ScrollView
          style={styles.scrollBody}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* 3-Star Daily Challenge Retention Hook */}
          <View style={styles.challengeRow}>
            <View style={styles.starsRow}>
              {[0, 1, 2].map((idx) => (
                <StarIcon
                  key={idx}
                  size={19}
                  color={CLUB.gold}
                  filled={idx < retention.dailyStars}
                />
              ))}
            </View>
            <View style={styles.challengeCol}>
              <Text style={styles.challengeTitle}>
                {remainingStars === 0
                  ? 'Reto diario completado'
                  : `Reto diario: ${retention.dailyStars}/3`}
              </Text>
              <Text style={styles.challengeSub}>
                {humanWon
                  ? `Racha activa: ${retention.winStreak}`
                  : 'Revancha rápida para recuperar tu estrella'}
              </Text>
            </View>
          </View>

          {/* Vertical Tiles Under Each Player / Pair */}
          {renderFinalColumns()}

          {/* Intimate Table Companions Circle (Online humans only) */}
          {humanCoPlayers.length > 0 && onSaveCompanion && (
            <View style={styles.companionsCard}>
              <Text style={styles.companionsTitle}>¿Te gustó jugar con ellos?</Text>
              <Text style={styles.companionsSub}>
                Guárdalos en tu círculo de Compañeros para invitarlos en 1 toque.
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
                        size={32}
                        avatarConfig={p.avatarConfig}
                      />
                      <Text style={styles.companionName} numberOfLines={1}>
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
                          isSaved && styles.companionBtnSaved,
                        ]}
                      >
                        <Text
                          style={[
                            styles.companionBtnText,
                            isSaved && styles.companionBtnTextSaved,
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
            title={`Revancha (${countdown}s)`}
            variant="emerald"
            onPress={() => {
              hapticSnap();
              onRematch();
            }}
          />

          <GlossyButton
            title="Cambiar modo"
            variant="glass"
            compact
            onPress={() => {
              hapticSnap();
              onChangeMode();
            }}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(6, 12, 24, 0.78)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    zIndex: 90,
  },
  card: {
    width: '100%',
    maxWidth: 460,
    maxHeight: '90%',
    backgroundColor: CLUB.glassBgStrong,
    borderRadius: 24,
    borderWidth: 1.25,
    borderColor: CLUB.glassBorder,
    padding: 15,
    gap: 10,
    boxShadow: '0px 18px 44px rgba(0, 0, 0, 0.76)',
  },
  companionsCard: {
    backgroundColor: 'rgba(19, 44, 52, 0.85)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(245, 196, 81, 0.30)',
    padding: 12,
    gap: 6,
  },
  companionsTitle: {
    color: CLUB.ivoryTop,
    fontSize: 13,
    fontWeight: '900',
  },
  companionsSub: {
    color: CLUB.textSecondary,
    fontSize: 11,
    fontWeight: '600',
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
    color: CLUB.ivoryTop,
    fontSize: 13,
    fontWeight: '800',
  },
  companionBtn: {
    backgroundColor: 'rgba(245, 196, 81, 0.16)',
    borderWidth: 1,
    borderColor: CLUB.gold,
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 5,
  },
  companionBtnSaved: {
    backgroundColor: 'rgba(39, 209, 136, 0.16)',
    borderColor: CLUB.emerald,
  },
  companionBtnText: {
    color: CLUB.goldSoft,
    fontSize: 11.5,
    fontWeight: '800',
  },
  companionBtnTextSaved: {
    color: CLUB.emerald,
  },
  headlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  banner: {
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    alignItems: 'center',
    gap: 2,
    borderWidth: 1,
  },
  bannerWin: {
    backgroundColor: 'rgba(46, 209, 138, 0.16)',
    borderColor: CLUB.emerald,
  },
  bannerLoss: {
    backgroundColor: 'rgba(139, 92, 246, 0.18)',
    borderColor: CLUB.violet,
  },
  headline: {
    color: CLUB.textPrimary,
    fontSize: 23,
    fontWeight: '900',
  },
  sub: {
    color: CLUB.textSecondary,
    fontSize: 12,
    fontWeight: '700',
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
    gap: 10,
    backgroundColor: 'rgba(34, 27, 16, 0.68)',
    borderRadius: 15,
    borderWidth: 1.25,
    borderColor: 'rgba(245, 196, 81, 0.72)',
    padding: 10,
    boxShadow: '0px 0px 18px rgba(245, 196, 81, 0.22)',
  },
  starsRow: {
    flexDirection: 'row',
    gap: 3,
  },
  challengeCol: {
    flex: 1,
  },
  challengeTitle: {
    color: CLUB.textPrimary,
    fontSize: 13,
    fontWeight: '800',
  },
  challengeSub: {
    color: CLUB.textSecondary,
    fontSize: 11,
    fontWeight: '600',
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
    backgroundColor: CLUB.surfaceCardLight,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: CLUB.glassBorder,
    padding: 10,
    alignItems: 'center',
    gap: 6,
  },
  gridCard: {
    width: '48.5%',
    backgroundColor: CLUB.surfaceCardLight,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: CLUB.glassBorder,
    padding: 8,
    alignItems: 'center',
    gap: 5,
  },
  colCardWin: {
    borderColor: '#F5C451',
    backgroundColor: 'rgba(54, 42, 18, 0.62)',
    boxShadow: '0px 0px 18px rgba(245, 196, 81, 0.22)',
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
    color: CLUB.textPrimary,
    fontSize: 13,
    fontWeight: '900',
  },
  colScore: {
    color: CLUB.textSecondary,
    fontSize: 15,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
  subTray: {
    width: '100%',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  subLabel: {
    color: CLUB.textMuted,
    fontSize: 11,
    fontWeight: '700',
  },
  closedSmall: {
    color: CLUB.emerald,
    fontSize: 12,
    fontWeight: '800',
    paddingVertical: 6,
  },
  vTilesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: 'rgba(11, 20, 36, 0.45)',
    borderRadius: 10,
    padding: 6,
    width: '100%',
  },
  actions: {
    gap: 8,
  },
  primaryBtn: {
    backgroundColor: CLUB.emerald,
    borderRadius: 16,
    borderBottomWidth: 4,
    borderBottomColor: CLUB.emeraldDark,
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {
    color: CLUB.textInk,
    fontSize: 17,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
  secondaryBtn: {
    backgroundColor: CLUB.surfaceCardLight,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: CLUB.glassBorder,
    minHeight: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: {
    color: CLUB.textPrimary,
    fontSize: 14,
    fontWeight: '800',
  },
});
