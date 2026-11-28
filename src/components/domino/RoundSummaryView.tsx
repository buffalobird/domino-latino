import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { AvatarConfig } from '@/constants/avatarCatalog';
import { getSeatProfile } from '@/constants/seatProfiles';
import { TileStyleId } from '@/constants/tileStyles';
import { CLUB, FONT } from '@/constants/tokens';
import { usePalette } from '@/context/PaletteContext';
import { GameState, HandSummary } from '@/engine/types';
import { hapticSnap } from '@/utils/feedback';
import { AvatarIllustration } from './AvatarIllustration';
import { DominoTile } from './DominoTile';
import { GlossyButton } from './GlossyButton';
import { CrownIcon } from './Icons';

interface RoundSummaryViewProps {
  state: GameState;
  playerAvatarConfig?: AvatarConfig;
  seatAvatars?: Record<number, AvatarConfig | undefined>;
  seatIsHuman?: Record<number, boolean>;
  seatNames?: Record<number, string>;
  tileStyleId?: TileStyleId;
  onContinue: () => void;
}

type RemainingEntry = HandSummary['remainingHands'][number];

function VerticalTilesStrip({
  tiles,
  tileStyleId = 'marfil',
}: {
  tiles: RemainingEntry['tiles'];
  tileStyleId?: TileStyleId;
}) {
  const { palette } = usePalette();

  if (tiles.length === 0) {
    return (
      <View
        style={[
          styles.emptyBox,
          {
            backgroundColor: palette.positiveBg,
            borderColor: palette.positiveBorder,
          },
        ]}
      >
        <Text style={[styles.emptyText, { color: palette.positiveText }]}>
          ¡Se pegó!
        </Text>
      </View>
    );
  }

  const unit = tiles.length > 6 ? 19 : tiles.length > 4 ? 22 : 25;

  return (
    <View
      style={[
        styles.tilesTray,
        { backgroundColor: palette.modalInputBg },
      ]}
    >
      {tiles.map((tile) => (
        <DominoTile
          key={tile.id}
          a={tile.a}
          b={tile.b}
          orientation="vertical"
          unit={unit}
          tileStyleId={tileStyleId}
        />
      ))}
    </View>
  );
}

export function RoundSummaryView({
  state,
  playerAvatarConfig,
  seatAvatars,
  seatIsHuman,
  seatNames,
  tileStyleId = 'marfil',
  onContinue,
}: RoundSummaryViewProps) {
  const { palette } = usePalette();
  const summary = state.lastHandSummary;
  if (!summary) return null;

  const resolveSeat = (seat: number) => {
    const base = getSeatProfile(state.mode, seat);
    const isBot = seatIsHuman ? !seatIsHuman[seat] : base.isBot;
    const displayName =
      seatNames?.[seat] && !seatNames[seat].startsWith('CPU')
        ? seatNames[seat]
        : base.displayName;
    const avatarConfig =
      seat === 0
        ? playerAvatarConfig
        : seatAvatars?.[seat] ?? base.avatarConfig;
    return { ...base, isBot, displayName, avatarConfig };
  };

  const winnerDisplayName =
    summary.winnerSeat !== null
      ? state.mode === '2v2'
        ? summary.winnerScoreIndex === 0
          ? 'Nosotros'
          : 'Rivales'
        : resolveSeat(summary.winnerSeat).displayName
      : null;

  const headline =
    summary.reason === 'domino'
      ? `¡Dominó! · ${winnerDisplayName}`
      : summary.reason === 'tranca'
      ? `¡Tranca! · ${winnerDisplayName}`
      : 'Tranca empatada · Mano nula';

  const render1v1Columns = () => {
    const entries = summary.remainingHands;
    return (
      <View style={styles.twoColRow}>
        {entries.map((entry) => {
          const prof = resolveSeat(entry.seat);
          const isWinner = summary.winnerSeat === entry.seat;
          const ptsThisRound = isWinner ? summary.pointsAwarded : 0;
          const total = summary.scoresAfter[entry.teamId] ?? 0;

          return (
            <View
              key={entry.seat}
              style={[
                styles.playerColCard,
                {
                  backgroundColor: isWinner
                    ? palette.winnerCardBg
                    : palette.modalCardBg,
                  borderColor: isWinner
                    ? palette.winnerCardBorder
                    : palette.modalCardBorder,
                  borderBottomColor: isWinner
                    ? palette.winnerCardBorder
                    : palette.modalCardLip,
                },
              ]}
            >
              <View
                style={[
                  styles.avatarRing,
                  {
                    borderColor: isWinner
                      ? palette.winnerCardBorder
                      : prof.accentColor,
                  },
                ]}
              >
                <AvatarIllustration
                  isBot={prof.isBot}
                  seatHint={entry.seat}
                  accentColor={prof.accentColor}
                  mood={
                    summary.reason === 'tranca_tie'
                      ? 'idle'
                      : isWinner
                      ? 'win'
                      : 'lose'
                  }
                  size={48}
                  avatarConfig={prof.avatarConfig}
                />
              </View>

              <Text
                style={[styles.colName, { color: palette.textPrimary }]}
                numberOfLines={1}
              >
                {prof.displayName}
              </Text>

              <View
                style={[
                  styles.roundPtsPill,
                  { backgroundColor: palette.modalInputBg },
                ]}
              >
                <Text
                  style={[
                    styles.roundPtsText,
                    {
                      color: isWinner
                        ? palette.winnerText
                        : palette.textSecondary,
                    },
                  ]}
                >
                  {ptsThisRound > 0 ? `+${ptsThisRound}` : '0'} pts mano
                </Text>
              </View>

              <Text style={[styles.trayLabel, { color: palette.textMuted }]}>
                Restantes ({entry.pipSum} pts)
              </Text>
              <VerticalTilesStrip tiles={entry.tiles} tileStyleId={tileStyleId} />

              <View
                style={[
                  styles.totalFooter,
                  { borderTopColor: palette.modalCardBorder },
                ]}
              >
                <Text style={[styles.totalLabel, { color: palette.textMuted }]}>
                  TOTAL
                </Text>
                <Text
                  style={[
                    styles.totalVal,
                    {
                      color: isWinner ? palette.winnerText : palette.textPrimary,
                    },
                  ]}
                >
                  {total}/{state.targetScore}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  const render2v2Columns = () => {
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
          const isWinner = summary.winnerScoreIndex === team.teamId;
          const ptsThisRound = isWinner ? summary.pointsAwarded : 0;
          const total = summary.scoresAfter[team.teamId] ?? 0;

          return (
            <View
              key={team.teamId}
              style={[
                styles.playerColCard,
                {
                  backgroundColor: isWinner
                    ? palette.winnerCardBg
                    : palette.modalCardBg,
                  borderColor: isWinner
                    ? palette.winnerCardBorder
                    : palette.modalCardBorder,
                  borderBottomColor: isWinner
                    ? palette.winnerCardBorder
                    : palette.modalCardLip,
                },
              ]}
            >
              <View style={styles.pairAvatarsRow}>
                {team.members.map((m) => {
                  const prof = resolveSeat(m.seat);
                  return (
                    <View
                      key={m.seat}
                      style={[
                        styles.miniAvatarRing,
                        {
                          borderColor: isWinner
                            ? palette.winnerCardBorder
                            : team.accent,
                        },
                      ]}
                    >
                      <AvatarIllustration
                        isBot={prof.isBot}
                        seatHint={m.seat}
                        accentColor={prof.accentColor}
                        mood={
                          summary.reason === 'tranca_tie'
                            ? 'idle'
                            : isWinner
                            ? 'win'
                            : 'lose'
                        }
                        size={36}
                        avatarConfig={prof.avatarConfig}
                      />
                    </View>
                  );
                })}
              </View>

              <Text style={[styles.colName, { color: palette.textPrimary }]}>
                {team.title}
              </Text>

              <View
                style={[
                  styles.roundPtsPill,
                  { backgroundColor: palette.modalInputBg },
                ]}
              >
                <Text
                  style={[
                    styles.roundPtsText,
                    {
                      color: isWinner
                        ? palette.winnerText
                        : palette.textSecondary,
                    },
                  ]}
                >
                  {ptsThisRound > 0 ? `+${ptsThisRound}` : '0'} pts mano
                </Text>
              </View>

              <View style={styles.pairMembersList}>
                {team.members.map((m) => {
                  const prof = resolveSeat(m.seat);
                  return (
                    <View key={m.seat} style={styles.memberSubBlock}>
                      <Text
                        style={[
                          styles.memberSubLabel,
                          { color: palette.textSecondary },
                        ]}
                      >
                        {prof.displayName} · {m.pipSum} pts
                        {m.countedInScore ? '' : ' (ganó)'}
                      </Text>
                      <VerticalTilesStrip
                        tiles={m.tiles}
                        tileStyleId={tileStyleId}
                      />
                    </View>
                  );
                })}
              </View>

              <View
                style={[
                  styles.totalFooter,
                  { borderTopColor: palette.modalCardBorder },
                ]}
              >
                <Text style={[styles.totalLabel, { color: palette.textMuted }]}>
                  TOTAL
                </Text>
                <Text
                  style={[
                    styles.totalVal,
                    {
                      color: isWinner ? palette.winnerText : palette.textPrimary,
                    },
                  ]}
                >
                  {total}/{state.targetScore}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  const render4ffaGrid = () => (
    <View style={styles.fourGrid}>
      {summary.remainingHands.map((entry) => {
        const prof = resolveSeat(entry.seat);
        const isWinner = summary.winnerSeat === entry.seat;
        const ptsThisRound = isWinner ? summary.pointsAwarded : 0;
        const total = summary.scoresAfter[entry.teamId] ?? 0;

        return (
          <View
            key={entry.seat}
            style={[
              styles.gridCard,
              {
                backgroundColor: isWinner
                  ? palette.winnerCardBg
                  : palette.modalCardBg,
                borderColor: isWinner
                  ? palette.winnerCardBorder
                  : palette.modalCardBorder,
                borderBottomColor: isWinner
                  ? palette.winnerCardBorder
                  : palette.modalCardLip,
              },
            ]}
          >
            <View style={styles.gridTop}>
              <View
                style={[
                  styles.miniAvatarRing,
                  {
                    borderColor: isWinner
                      ? palette.winnerCardBorder
                      : prof.accentColor,
                  },
                ]}
              >
                <AvatarIllustration
                  isBot={prof.isBot}
                  seatHint={entry.seat}
                  accentColor={prof.accentColor}
                  mood={
                    summary.reason === 'tranca_tie'
                      ? 'idle'
                      : isWinner
                      ? 'win'
                      : 'lose'
                  }
                  size={34}
                  avatarConfig={prof.avatarConfig}
                />
              </View>
              <View style={styles.gridNameCol}>
                <Text
                  style={[styles.gridName, { color: palette.textPrimary }]}
                  numberOfLines={1}
                >
                  {prof.displayName}
                </Text>
                <Text
                  style={[
                    styles.gridScore,
                    {
                      color: isWinner
                        ? palette.winnerText
                        : palette.textSecondary,
                    },
                  ]}
                >
                  {total}/{state.targetScore}
                  {ptsThisRound > 0 ? ` (+${ptsThisRound})` : ''}
                </Text>
              </View>
            </View>

            <Text
              style={[styles.memberSubLabel, { color: palette.textSecondary }]}
            >
              Restan {entry.pipSum} pts
            </Text>
            <VerticalTilesStrip tiles={entry.tiles} tileStyleId={tileStyleId} />
          </View>
        );
      })}
    </View>
  );

  return (
    <Animated.View
      entering={FadeIn.duration(170)}
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
            styles.header,
            { borderBottomColor: palette.modalCardBorder },
          ]}
        >
          <Text style={[styles.kicker, { color: palette.textMuted }]}>
            CIERRE DE MANO #{summary.handNumber}
          </Text>
          <View style={styles.headlineRow}>
            {summary.winnerSeat !== null && (
              <CrownIcon size={18} color={palette.winnerCardBorder} />
            )}
            <Text style={[styles.headline, { color: palette.textPrimary }]}>
              {headline}
            </Text>
          </View>
        </View>

        <ScrollView
          style={styles.scrollBody}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {state.mode === '1v1' && render1v1Columns()}
          {state.mode === '2v2' && render2v2Columns()}
          {state.mode === '4ffa' && render4ffaGrid()}
        </ScrollView>

        <GlossyButton
          title="Siguiente mano"
          variant="emerald"
          onPress={() => {
            hapticSnap();
            onContinue();
          }}
        />
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
    zIndex: 80,
  },
  card: {
    width: '100%',
    maxWidth: 460,
    maxHeight: '88%',
    borderRadius: 26,
    borderWidth: 1.5,
    padding: 16,
    gap: 12,
    boxShadow: '0px 18px 44px rgba(0, 0, 0, 0.55)',
  },
  header: {
    alignItems: 'center',
    borderBottomWidth: 1,
    paddingBottom: 10,
  },
  headlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    marginTop: 2,
  },
  kicker: {
    fontFamily: FONT.extraBold,
    fontSize: 11,
    letterSpacing: 0.9,
  },
  headline: {
    fontFamily: FONT.display,
    fontSize: 20,
    textAlign: 'center',
  },
  scrollBody: {
    flexGrow: 0,
  },
  scrollContent: {
    gap: 10,
  },
  twoColRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'stretch',
  },
  playerColCard: {
    flex: 1,
    borderRadius: 18,
    borderWidth: 1.5,
    borderBottomWidth: 4,
    padding: 10,
    alignItems: 'center',
    gap: 6,
  },
  avatarRing: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  pairAvatarsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  miniAvatarRing: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  colName: {
    fontFamily: FONT.display,
    fontSize: 15,
  },
  roundPtsPill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  roundPtsText: {
    fontFamily: FONT.extraBold,
    fontSize: 12,
    fontVariant: ['tabular-nums'],
  },
  trayLabel: {
    fontFamily: FONT.bold,
    fontSize: 11,
    marginTop: 2,
  },
  tilesTray: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 4,
    borderRadius: 12,
    padding: 6,
    width: '100%',
    minHeight: 56,
    alignItems: 'center',
  },
  emptyBox: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 8,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontFamily: FONT.extraBold,
    fontSize: 12.5,
  },
  pairMembersList: {
    width: '100%',
    gap: 6,
  },
  memberSubBlock: {
    width: '100%',
    alignItems: 'center',
    gap: 4,
  },
  memberSubLabel: {
    fontFamily: FONT.bold,
    fontSize: 11,
  },
  totalFooter: {
    marginTop: 'auto',
    paddingTop: 8,
    borderTopWidth: 1,
    width: '100%',
    alignItems: 'center',
  },
  totalLabel: {
    fontFamily: FONT.extraBold,
    fontSize: 10,
    letterSpacing: 0.7,
  },
  totalVal: {
    fontFamily: FONT.display,
    fontSize: 19,
    fontVariant: ['tabular-nums'],
  },
  fourGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  gridCard: {
    width: '48.5%',
    borderRadius: 16,
    borderWidth: 1.5,
    borderBottomWidth: 3.5,
    padding: 8,
    gap: 6,
  },
  gridTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  gridNameCol: {
    flex: 1,
  },
  gridName: {
    fontFamily: FONT.extraBold,
    fontSize: 12.5,
  },
  gridScore: {
    fontFamily: FONT.display,
    fontSize: 12.5,
    fontVariant: ['tabular-nums'],
  },
});
