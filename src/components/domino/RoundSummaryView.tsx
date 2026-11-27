import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AvatarConfig } from '@/constants/avatarCatalog';
import { getSeatProfile } from '@/constants/seatProfiles';
import { TileStyleId } from '@/constants/tileStyles';
import { CLUB } from '@/constants/tokens';
import { GameState, HandSummary } from '@/engine/types';
import { hapticSnap } from '@/utils/feedback';
import { AvatarIllustration } from './AvatarIllustration';
import { DominoTile } from './DominoTile';
import { GlossyButton } from './GlossyButton';
import { CrownIcon } from './Icons';

interface RoundSummaryViewProps {
  state: GameState;
  playerAvatarConfig?: AvatarConfig;
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
  if (tiles.length === 0) {
    return (
      <View style={styles.emptyBox}>
        <Text style={styles.emptyText}>¡Se pegó!</Text>
      </View>
    );
  }

  // Auto-size vertical tiles cleanly so 1..8+ tiles always stay readable inside column
  const unit = tiles.length > 6 ? 19 : tiles.length > 4 ? 22 : 25;

  return (
    <View style={styles.tilesTray}>
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

/**
 * Results overlay modeled after the reference visual:
 * - Vertical tiles placed directly UNDER each player (1v1, 4ffa) or pair (2v2),
 *   matching the exact vertical orientation used while playing on the rack.
 * - Adapted cleanly per mode: 2 columns for 1v1, 2 team columns for 2v2, 2x2 grid for 4ffa.
 */
export function RoundSummaryView({
  state,
  playerAvatarConfig,
  tileStyleId = 'marfil',
  onContinue,
}: RoundSummaryViewProps) {
  const summary = state.lastHandSummary;
  if (!summary) return null;

  const winnerDisplayName =
    summary.winnerSeat !== null
      ? state.mode === '2v2'
        ? summary.winnerScoreIndex === 0
          ? 'Nosotros'
          : 'Rivales'
        : getSeatProfile(state.mode, summary.winnerSeat).displayName
      : null;

  const headline =
    summary.reason === 'domino'
      ? `¡Dominó! · ${winnerDisplayName}`
      : summary.reason === 'tranca'
      ? `¡Tranca! · ${winnerDisplayName}`
      : 'Tranca empatada · Mano nula';

  const render1v1Columns = () => {
    const entries = summary.remainingHands; // seat 0 (Tú) & seat 1 (Bot)
    return (
      <View style={styles.twoColRow}>
        {entries.map((entry) => {
          const prof = getSeatProfile(state.mode, entry.seat);
          const isWinner = summary.winnerSeat === entry.seat;
          const ptsThisRound = isWinner ? summary.pointsAwarded : 0;
          const total = summary.scoresAfter[entry.teamId] ?? 0;

          return (
            <View
              key={entry.seat}
              style={[styles.playerColCard, isWinner && styles.colCardWinner]}
            >
              <View
                style={[
                  styles.avatarRing,
                  { borderColor: isWinner ? CLUB.gold : prof.accentColor },
                ]}
              >
                <AvatarIllustration
                  isBot={prof.isBot}
                  accentColor={prof.accentColor}
                  mood={
                    summary.reason === 'tranca_tie'
                      ? 'idle'
                      : isWinner
                      ? 'win'
                      : 'lose'
                  }
                  size={48}
                  avatarConfig={entry.seat === 0 ? playerAvatarConfig : undefined}
                />
              </View>

              <Text style={styles.colName} numberOfLines={1}>
                {prof.displayName}
              </Text>

              <View style={styles.roundPtsPill}>
                <Text style={[styles.roundPtsText, isWinner && { color: CLUB.gold }]}>
                  {ptsThisRound > 0 ? `+${ptsThisRound}` : '0'} pts ronda
                </Text>
              </View>

              <Text style={styles.trayLabel}>
                Restantes ({entry.pipSum} pts)
              </Text>
              <VerticalTilesStrip tiles={entry.tiles} tileStyleId={tileStyleId} />

              <View style={styles.totalFooter}>
                <Text style={styles.totalLabel}>TOTAL</Text>
                <Text style={[styles.totalVal, isWinner && { color: CLUB.gold }]}>
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
              style={[styles.playerColCard, isWinner && styles.colCardWinner]}
            >
              {/* Paired avatars */}
              <View style={styles.pairAvatarsRow}>
                {team.members.map((m) => {
                  const prof = getSeatProfile(state.mode, m.seat);
                  return (
                    <View
                      key={m.seat}
                      style={[
                        styles.miniAvatarRing,
                        { borderColor: isWinner ? CLUB.gold : team.accent },
                      ]}
                    >
                      <AvatarIllustration
                        isBot={prof.isBot}
                        accentColor={prof.accentColor}
                        mood={
                          summary.reason === 'tranca_tie'
                            ? 'idle'
                            : isWinner
                            ? 'win'
                            : 'lose'
                        }
                        size={36}
                        avatarConfig={m.seat === 0 ? playerAvatarConfig : undefined}
                      />
                    </View>
                  );
                })}
              </View>

              <Text style={styles.colName}>{team.title}</Text>

              <View style={styles.roundPtsPill}>
                <Text style={[styles.roundPtsText, isWinner && { color: CLUB.gold }]}>
                  {ptsThisRound > 0 ? `+${ptsThisRound}` : '0'} pts ronda
                </Text>
              </View>

              {/* Vertical remaining tiles grouped cleanly per partner */}
              <View style={styles.pairMembersList}>
                {team.members.map((m) => {
                  const prof = getSeatProfile(state.mode, m.seat);
                  return (
                    <View key={m.seat} style={styles.memberSubBlock}>
                      <Text style={styles.memberSubLabel}>
                        {prof.displayName} · {m.pipSum} pts
                        {m.countedInScore ? '' : ' (ganó)'}
                      </Text>
                      <VerticalTilesStrip tiles={m.tiles} tileStyleId={tileStyleId} />
                    </View>
                  );
                })}
              </View>

              <View style={styles.totalFooter}>
                <Text style={styles.totalLabel}>TOTAL</Text>
                <Text style={[styles.totalVal, isWinner && { color: CLUB.gold }]}>
                  {total}/{state.targetScore}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  const render4ffaGrid = () => {
    return (
      <View style={styles.fourGrid}>
        {summary.remainingHands.map((entry) => {
          const prof = getSeatProfile(state.mode, entry.seat);
          const isWinner = summary.winnerSeat === entry.seat;
          const ptsThisRound = isWinner ? summary.pointsAwarded : 0;
          const total = summary.scoresAfter[entry.teamId] ?? 0;

          return (
            <View
              key={entry.seat}
              style={[styles.gridCard, isWinner && styles.colCardWinner]}
            >
              <View style={styles.gridTop}>
                <View
                  style={[
                    styles.miniAvatarRing,
                    { borderColor: isWinner ? CLUB.gold : prof.accentColor },
                  ]}
                >
                  <AvatarIllustration
                    isBot={prof.isBot}
                    accentColor={prof.accentColor}
                    mood={
                      summary.reason === 'tranca_tie'
                        ? 'idle'
                        : isWinner
                        ? 'win'
                        : 'lose'
                    }
                    size={34}
                    avatarConfig={entry.seat === 0 ? playerAvatarConfig : undefined}
                  />
                </View>
                <View style={styles.gridNameCol}>
                  <Text style={styles.gridName} numberOfLines={1}>
                    {prof.displayName}
                  </Text>
                  <Text style={[styles.gridScore, isWinner && { color: CLUB.gold }]}>
                    {total}/{state.targetScore}
                    {ptsThisRound > 0 ? ` (+${ptsThisRound})` : ''}
                  </Text>
                </View>
              </View>

              <Text style={styles.memberSubLabel}>Restan {entry.pipSum} pts</Text>
              <VerticalTilesStrip tiles={entry.tiles} tileStyleId={tileStyleId} />
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <View style={styles.backdrop}>
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.kicker}>RESULTADOS · MANO #{summary.handNumber}</Text>
          <View style={styles.headlineRow}>
            {summary.winnerSeat !== null && <CrownIcon size={17} color={CLUB.gold} />}
            <Text style={styles.headline}>{headline}</Text>
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
          title="Continuar"
          variant="emerald"
          onPress={() => {
            hapticSnap();
            onContinue();
          }}
        />
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
    backgroundColor: 'rgba(6, 12, 24, 0.76)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    zIndex: 80,
  },
  card: {
    width: '100%',
    maxWidth: 460,
    maxHeight: '88%',
    backgroundColor: 'rgba(14, 28, 52, 0.96)',
    borderRadius: 24,
    borderWidth: 1.25,
    borderColor: 'rgba(148, 190, 255, 0.26)',
    padding: 15,
    gap: 12,
    boxShadow: '0px 18px 44px rgba(0, 0, 0, 0.72)',
  },
  header: {
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: CLUB.borderSubtle,
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
    color: CLUB.textMuted,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.9,
  },
  headline: {
    color: CLUB.textPrimary,
    fontSize: 19,
    fontWeight: '900',
    marginTop: 2,
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
    backgroundColor: CLUB.surfaceCardLight,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: CLUB.glassBorder,
    padding: 10,
    alignItems: 'center',
    gap: 6,
  },
  colCardWinner: {
    borderColor: '#F5C451',
    backgroundColor: 'rgba(54, 42, 18, 0.62)',
    boxShadow: '0px 0px 18px rgba(245, 196, 81, 0.22)',
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
    color: CLUB.textPrimary,
    fontSize: 14,
    fontWeight: '900',
  },
  roundPtsPill: {
    backgroundColor: 'rgba(11, 20, 36, 0.65)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  roundPtsText: {
    color: CLUB.textSecondary,
    fontSize: 12,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  trayLabel: {
    color: CLUB.textMuted,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  tilesTray: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: 'rgba(11, 20, 36, 0.45)',
    borderRadius: 12,
    padding: 6,
    width: '100%',
    minHeight: 56,
    alignItems: 'center',
  },
  emptyBox: {
    backgroundColor: 'rgba(46, 209, 138, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(46, 209, 138, 0.35)',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 8,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: CLUB.emerald,
    fontSize: 12,
    fontWeight: '900',
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
    color: CLUB.textSecondary,
    fontSize: 11,
    fontWeight: '700',
  },
  totalFooter: {
    marginTop: 'auto',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: CLUB.glassBorder,
    width: '100%',
    alignItems: 'center',
  },
  totalLabel: {
    color: CLUB.textMuted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.7,
  },
  totalVal: {
    color: CLUB.textPrimary,
    fontSize: 18,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
  fourGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  gridCard: {
    width: '48.5%',
    backgroundColor: CLUB.surfaceCardLight,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: CLUB.glassBorder,
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
    color: CLUB.textPrimary,
    fontSize: 12,
    fontWeight: '800',
  },
  gridScore: {
    color: CLUB.textSecondary,
    fontSize: 12,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
  continueBtn: {
    backgroundColor: CLUB.emerald,
    borderRadius: 16,
    borderBottomWidth: 4,
    borderBottomColor: CLUB.emeraldDark,
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueBtnText: {
    color: CLUB.textInk,
    fontSize: 17,
    fontWeight: '900',
  },
});
