import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  BackHandler,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GameTableView } from '@/components/domino/GameTableView';
import { MatchOverView } from '@/components/domino/MatchOverView';
import { BotSpeed } from '@/components/domino/PauseModal';
import { RoundSummaryView } from '@/components/domino/RoundSummaryView';
import { SetupView } from '@/components/domino/SetupView';
import { BotMood } from '@/constants/seatProfiles';
import { CLUB } from '@/constants/tokens';
import { chooseAiMove } from '@/engine/ai';
import {
  applyDraw,
  applyPass,
  applyPlay,
  buildAiPublicView,
  createInitialSetupState,
  dealNextHand,
  getLegalMovesForSeat,
  isDouble,
  sortHand,
  startNewMatch,
} from '@/engine/rules';
import { GameMode, GameState, PlaySide, SortMode, TargetScore } from '@/engine/types';
import {
  createDefaultRetention,
  loadGameState,
  loadRetentionProgress,
  recordMatchResult,
  RetentionProgress,
  saveGameState,
  saveRetentionProgress,
} from '@/storage/gameStorage';
import {
  hapticDouble,
  hapticLight,
  hapticSnap,
  hapticSoft,
  hapticSuccess,
  hapticWarning,
  playGameSound,
} from '@/utils/feedback';

const HUMAN_TURN_SECONDS = 20;

/**
 * Situational human-like Bot pacing (never metronomic!):
 * Gives the human player natural breathing room to read played tiles, track passes,
 * and count suits—just like sitting at a real table without ever feeling sluggish.
 */
function computeHumanLikeBotDelay(
  state: GameState,
  seat: number,
  speed: BotSpeed
): number {
  const speedMult = speed === 'fast' ? 0.65 : speed === 'relaxed' ? 1.35 : 1.0;
  const jitter = Math.floor(Math.random() * 340); // Organic human variance
  const legal = getLegalMovesForSeat(state, seat);
  const player = state.players[seat];

  let baseMs: number;
  if (legal.length === 0) {
    if (state.boneyard.length > 0) {
      // First draw has a brief "checking my hand" pause; consecutive draws flow crisply
      const lastEntry = state.history[state.history.length - 1];
      const consecutiveDraw = lastEntry?.type === 'draw' && lastEntry.seat === seat;
      baseMs = consecutiveDraw ? 720 : 1250;
    } else {
      // Passing: natural pause so the player clearly sees who passed and on which numbers
      baseMs = 1650;
    }
  } else if (player && player.hand.length === 1) {
    // Closing the hand (¡Dominó!): confident crisp slam
    baseMs = 1150;
  } else if (state.chain.length === 0 || legal.length === 1) {
    // Forced opening (6-6) or only 1 legal move: quicker confident play
    baseMs = 1300;
  } else {
    // Genuine 2+ option tactical choice: natural human thinking window so you can count tiles
    baseMs = 1850;
  }

  return Math.round((baseMs + jitter) * speedMult);
}

export default function DominoAppScreen() {
  const [state, setState] = useState<GameState>(() =>
    createInitialSetupState('1v1', 100, 'value', false)
  );
  const [retention, setRetention] = useState<RetentionProgress>(() =>
    createDefaultRetention()
  );
  const [hydrated, setHydrated] = useState(false);
  const [turnSecondsLeft, setTurnSecondsLeft] = useState<number | null>(null);
  const [botTimerProgress, setBotTimerProgress] = useState(1);
  const [botSpeed, setBotSpeed] = useState<BotSpeed>('normal');
  const [seatMoods, setSeatMoods] = useState<Record<number, BotMood>>({});

  const stateRef = useRef(state);
  stateRef.current = state;
  const recordedMatchIdRef = useRef<string | null>(null);

  const setTempMood = useCallback((seat: number, mood: BotMood) => {
    setSeatMoods((prev) => ({ ...prev, [seat]: mood }));
  }, []);

  // Restore saved game state & retention progress on launch
  useEffect(() => {
    let active = true;
    Promise.all([loadGameState(), loadRetentionProgress()]).then(
      ([savedGame, savedRetention]) => {
        if (!active) return;
        if (savedGame) setState(savedGame);
        setRetention(savedRetention);
        setHydrated(true);
      }
    );
    return () => {
      active = false;
    };
  }, []);

  // Persist every game state change
  useEffect(() => {
    if (!hydrated) return;
    saveGameState(state);
  }, [state, hydrated]);

  // Prevent accidental hardware Back exit on Android during active match (Audit U14)
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (stateRef.current.phase === 'playing') {
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, []);

  // Record retention & play win cue when a hand or match ends
  useEffect(() => {
    if (!hydrated) return;
    if (state.phase === 'round_summary') {
      hapticSuccess();
      playGameSound('win', state.soundEnabled);
    } else if (state.phase === 'match_over') {
      hapticSuccess();
      playGameSound('win', state.soundEnabled);
      const matchKey = `${state.handNumber}-${state.scores.join('-')}-${state.matchWinnerIndex}`;
      if (recordedMatchIdRef.current !== matchKey) {
        recordedMatchIdRef.current = matchKey;
        const humanWon = state.matchWinnerIndex === 0;
        setRetention((prev) => {
          const updated = recordMatchResult(prev, humanWon);
          saveRetentionProgress(updated);
          return updated;
        });
      }
    }
  }, [
    hydrated,
    state.phase,
    state.handNumber,
    state.scores,
    state.matchWinnerIndex,
    state.soundEnabled,
  ]);

  // Centralized clean move dispatchers (ZERO side effects inside setState updaters — fixes T4!)
  const executeHumanPlay = useCallback(
    (tileId: string, side: PlaySide) => {
      const curr = stateRef.current;
      if (curr.phase !== 'playing' || curr.currentTurnSeat !== 0) return;
      const tile = curr.players[0]?.hand.find((t) => t.id === tileId);
      try {
        const next = applyPlay(curr, 0, tileId, side);
        setState(next);
        if (tile && isDouble(tile)) {
          hapticDouble();
          playGameSound('double', curr.soundEnabled);
        } else {
          hapticSnap();
          playGameSound('clack', curr.soundEnabled);
        }
      } catch {
        // Ignore illegal action
      }
    },
    []
  );

  const executeHumanDraw = useCallback((boneyardIndex?: number) => {
    const curr = stateRef.current;
    if (curr.phase !== 'playing' || curr.currentTurnSeat !== 0) return;
    try {
      const next = applyDraw(curr, 0, boneyardIndex);
      setState(next);
      if (next.currentTurnSeat !== 0) {
        hapticWarning();
        playGameSound('pass', curr.soundEnabled);
      } else {
        hapticLight();
        playGameSound('draw', curr.soundEnabled);
      }
    } catch {
      // Ignore
    }
  }, []);

  const executeHumanPass = useCallback(() => {
    const curr = stateRef.current;
    if (curr.phase !== 'playing' || curr.currentTurnSeat !== 0) return;
    try {
      const next = applyPass(curr, 0);
      setState(next);
      hapticWarning();
      playGameSound('pass', curr.soundEnabled);
    } catch {
      // Ignore
    }
  }, []);

  // Human 20s turn timer: drains avatar ring smoothly & shows 5-4-3-2-1 urgent overlay; auto-plays at 0s
  useEffect(() => {
    if (!hydrated || state.phase !== 'playing' || state.currentTurnSeat !== 0) {
      setTurnSecondsLeft(null);
      return;
    }

    let remaining = HUMAN_TURN_SECONDS;
    setTurnSecondsLeft(remaining);

    const interval = setInterval(() => {
      remaining -= 1;
      if (remaining <= 0) {
        clearInterval(interval);
        setTurnSecondsLeft(0);
        const curr = stateRef.current;
        if (curr.phase !== 'playing' || curr.currentTurnSeat !== 0) return;
        const legal = getLegalMovesForSeat(curr, 0);
        if (legal.length > 0) {
          executeHumanPlay(legal[0].tile.id, legal[0].sides[0]);
        } else if (curr.boneyard.length > 0) {
          executeHumanDraw();
        } else {
          executeHumanPass();
        }
        return;
      }

      setTurnSecondsLeft(remaining);
      if (remaining <= 5) {
        hapticSoft();
        playGameSound('tick', stateRef.current.soundEnabled);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [
    hydrated,
    state.phase,
    state.currentTurnSeat,
    state.handNumber,
    state.chain.length,
    state.boneyard.length,
    executeHumanPlay,
    executeHumanDraw,
    executeHumanPass,
  ]);

  // Bot turn scheduler: 1050ms thinking rhythm (with visible ring drain) for plays, 520ms for boneyard draws
  useEffect(() => {
    if (!hydrated || state.phase !== 'playing') return;
    const seat = state.currentTurnSeat;
    const currentPlayer = state.players[seat];
    if (!currentPlayer || currentPlayer.isHuman) {
      setBotTimerProgress(1);
      return;
    }

    const totalMs = computeHumanLikeBotDelay(state, seat, botSpeed);

    const startedAt = Date.now();
    setBotTimerProgress(1);
    const ringTick = setInterval(() => {
      const elapsed = Date.now() - startedAt;
      setBotTimerProgress(Math.max(0.05, 1 - elapsed / totalMs));
    }, 80);

    const timer = setTimeout(() => {
      clearInterval(ringTick);
      const curr = stateRef.current;
      if (curr.phase !== 'playing' || curr.currentTurnSeat !== seat) return;
      const player = curr.players[seat];
      if (!player || player.isHuman) return;

      const publicView = buildAiPublicView(curr, seat);
      const decision = chooseAiMove(publicView);

      try {
        if (decision) {
          const next = applyPlay(curr, seat, decision.tile.id, decision.side);
          setState(next);
          if (isDouble(decision.tile)) {
            setTempMood(seat, 'double');
            hapticDouble();
            playGameSound('double', curr.soundEnabled);
          } else {
            setTempMood(seat, 'play');
            hapticSnap();
            playGameSound('clack', curr.soundEnabled);
          }
          return;
        }
        if (curr.boneyard.length > 0) {
          const next = applyDraw(curr, seat);
          setState(next);
          setTempMood(seat, 'draw');
          hapticLight();
          playGameSound('draw', curr.soundEnabled);
          return;
        }
        const next = applyPass(curr, seat);
        setState(next);
        setTempMood(seat, 'pass');
        hapticWarning();
        playGameSound('pass', curr.soundEnabled);
      } catch {
        // Ignore
      }
    }, totalMs);

    return () => {
      clearTimeout(timer);
      clearInterval(ringTick);
    };
  }, [
    hydrated,
    state.phase,
    state.currentTurnSeat,
    state.handNumber,
    state.chain.length,
    state.boneyard.length,
    state.consecutivePasses,
    botSpeed,
    setTempMood,
  ]);

  const handleChangeMode = useCallback((mode: GameMode) => {
    setState((prev) =>
      createInitialSetupState(mode, prev.targetScore, prev.sortMode, prev.soundEnabled)
    );
  }, []);

  const handleChangeTargetScore = useCallback((targetScore: TargetScore) => {
    setState((prev) =>
      createInitialSetupState(prev.mode, targetScore, prev.sortMode, prev.soundEnabled)
    );
  }, []);

  const handleStartQuickMatch = useCallback(() => {
    recordedMatchIdRef.current = null;
    setSeatMoods({});
    setState((prev) =>
      startNewMatch(prev.mode, prev.targetScore, prev.sortMode, prev.soundEnabled)
    );
  }, []);

  const handleToggleSort = useCallback((sortMode: SortMode) => {
    setState((prev) => ({
      ...prev,
      sortMode,
      players: prev.players.map((p) =>
        p.isHuman ? { ...p, hand: sortHand(p.hand, sortMode) } : p
      ),
    }));
  }, []);

  const handleToggleSound = useCallback(() => {
    setState((prev) => ({
      ...prev,
      soundEnabled: !prev.soundEnabled,
    }));
  }, []);

  const handleCycleBotSpeed = useCallback(() => {
    setBotSpeed((prev) =>
      prev === 'normal' ? 'relaxed' : prev === 'relaxed' ? 'fast' : 'normal'
    );
  }, []);

  const handleContinueNextHand = useCallback(() => {
    setSeatMoods({});
    setState((prev) => dealNextHand(prev));
  }, []);

  const handleRematch = useCallback(() => {
    recordedMatchIdRef.current = null;
    setSeatMoods({});
    setState((prev) =>
      startNewMatch(prev.mode, prev.targetScore, prev.sortMode, prev.soundEnabled)
    );
  }, []);

  const handleReturnToSetup = useCallback(() => {
    setSeatMoods({});
    setState((prev) =>
      createInitialSetupState(prev.mode, prev.targetScore, prev.sortMode, prev.soundEnabled)
    );
  }, []);

  if (!hydrated) {
    return (
      <SafeAreaView style={styles.loading}>
        <ActivityIndicator size="large" color={CLUB.gold} />
      </SafeAreaView>
    );
  }

  const showTable =
    state.phase === 'playing' ||
    state.phase === 'round_summary' ||
    state.phase === 'match_over';

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.flex}>
        {state.phase === 'setup' && (
          <SetupView
            mode={state.mode}
            targetScore={state.targetScore}
            retention={retention}
            onChangeMode={handleChangeMode}
            onChangeTargetScore={handleChangeTargetScore}
            onStartQuickMatch={handleStartQuickMatch}
          />
        )}

        {showTable && (
          <GameTableView
            state={state}
            turnSecondsLeft={turnSecondsLeft}
            humanTurnTotalSeconds={HUMAN_TURN_SECONDS}
            botTimerProgress={botTimerProgress}
            botSpeed={botSpeed}
            seatMoods={seatMoods}
            onHumanPlay={executeHumanPlay}
            onHumanDraw={executeHumanDraw}
            onHumanPass={executeHumanPass}
            onToggleSort={handleToggleSort}
            onToggleSound={handleToggleSound}
            onCycleBotSpeed={handleCycleBotSpeed}
            onRestartMatch={handleRematch}
            onExitToHome={handleReturnToSetup}
          />
        )}

        {state.phase === 'round_summary' && (
          <RoundSummaryView state={state} onContinue={handleContinueNextHand} />
        )}

        {state.phase === 'match_over' && (
          <MatchOverView
            state={state}
            retention={retention}
            onRematch={handleRematch}
            onChangeMode={handleReturnToSetup}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: CLUB.roomBgTop,
  },
  flex: {
    flex: 1,
  },
  loading: {
    flex: 1,
    backgroundColor: CLUB.roomBgTop,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
