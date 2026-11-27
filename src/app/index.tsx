import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  BackHandler,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AuthModal, AuthModalReason } from '@/components/domino/AuthModal';
import { AvatarStudioModal } from '@/components/domino/AvatarStudioModal';
import { DailyRewardModal } from '@/components/domino/DailyRewardModal';
import { FeedbackModal } from '@/components/domino/FeedbackModal';
import { GameTableView, HandEndMomentData } from '@/components/domino/GameTableView';
import { MatchOverView } from '@/components/domino/MatchOverView';
import { OnlineLobbyView } from '@/components/domino/OnlineLobbyView';
import { BotSpeed } from '@/components/domino/PauseModal';
import { RoundSummaryView } from '@/components/domino/RoundSummaryView';
import { SetupView } from '@/components/domino/SetupView';
import { ThemesModal } from '@/components/domino/ThemesModal';
import { WaitingRoomView } from '@/components/domino/WaitingRoomView';
import { AVATAR_COSMETIC_PRICES, AvatarConfig } from '@/constants/avatarCatalog';
import { BotMood, getSeatProfile } from '@/constants/seatProfiles';
import {
  pickBotTablePhrase,
  REACTION_BY_CODE,
  TableReactionCode,
} from '@/constants/socialReactions';
import { TABLE_THEMES, TableThemeId } from '@/constants/tableThemes';
import { TILE_STYLES, TileStyleId } from '@/constants/tileStyles';
import { CLUB } from '@/constants/tokens';
import { useAuth } from '@/context/AuthContext';
import { usePalette } from '@/context/PaletteContext';
import { AiDifficulty, chooseAiMove } from '@/engine/ai';
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
import { GameMode, GameState, PlaySide, SortMode, TargetScore, Tile } from '@/engine/types';
import { trackEvent } from '@/lib/analytics';
import {
  fetchTableCompanions,
  saveTableCompanion,
  TableCompanion,
} from '@/lib/companionsService';
import {
  APP_VERSION,
  DEFAULT_REMOTE_CONFIG,
  fetchRemoteAppConfig,
  isVersionBelow,
  loadCachedRemoteConfig,
  RemoteAppConfig,
} from '@/lib/remoteConfig';
import { maybeRequestStoreReview } from '@/lib/storeReview';
import {
  buildRotatedOnlineGameState,
  buildRotatedOnlineSeatMeta,
  fetchRoomSnapshot,
  leaveOnlineRoom,
  OnlineRoomRow,
  sendOnlineClaimTimeout,
  sendOnlineDraw,
  sendOnlineNextHand,
  sendOnlinePass,
  sendOnlinePlay,
  sendOnlineReaction,
  sendOnlineRematch,
  startOnlineRoomWithBots,
} from '@/lib/onlineService';
import { supabase } from '@/lib/supabase';
import {
  applyFreeClubRefill,
  claimDailyRewardLocal,
  createDefaultRetention,
  loadGameState,
  loadRetentionProgress,
  recordMatchResult,
  RetentionProgress,
  saveGameState,
  saveRetentionProgress,
} from '@/storage/gameStorage';
import {
  flushPendingAndSyncProgress,
  queueAndSyncMatch,
  syncAvatarConfigToCloud,
  syncCosmeticUnlockToCloud,
  syncDailyRewardToCloud,
  syncFreeRefillToCloud,
  syncThemeToCloud,
  syncTileStyleToCloud,
  syncUserPreferences,
} from '@/storage/syncService';
import {
  hapticDouble,
  hapticLight,
  hapticSnap,
  hapticSoft,
  hapticSuccess,
  hapticWarning,
  initGameAudio,
  playGameSound,
} from '@/utils/feedback';

const HUMAN_TURN_SECONDS = 20;
const BOT_SPEED_STORAGE_KEY = 'domino_latino_bot_speed_v1';
const SOUND_ENABLED_STORAGE_KEY = 'domino_latino_sound_enabled_v1';
const AI_DIFFICULTY_STORAGE_KEY = 'domino_latino_ai_difficulty_v1';

/**
 * Distinct, non-overlapping human-like pacing tiers:
 * - fast ("Rápido"):   ~0.50s – 0.90s (snappy blitz)
 * - normal ("Humano"): ~1.30s – 2.15s (natural domino table cadence)
 * - relaxed ("Relajado"): ~2.55s – 3.95s (unhurried tile-counting pace)
 */
function computeHumanLikeBotDelay(
  state: GameState,
  seat: number,
  speed: BotSpeed
): number {
  const speedMult = speed === 'fast' ? 0.42 : speed === 'relaxed' ? 1.9 : 1.0;
  const maxJitter = speed === 'fast' ? 120 : speed === 'relaxed' ? 420 : 300;
  const jitter = Math.floor(Math.random() * maxJitter);
  const legal = getLegalMovesForSeat(state, seat);
  const player = state.players[seat];

  let baseMs: number;
  if (legal.length === 0) {
    if (state.boneyard.length > 0) {
      const lastEntry = state.history[state.history.length - 1];
      const consecutiveDraw = lastEntry?.type === 'draw' && lastEntry.seat === seat;
      baseMs = consecutiveDraw ? 700 : 1250;
    } else {
      baseMs = 1600;
    }
  } else if (player && player.hand.length === 1) {
    baseMs = 1150;
  } else if (state.chain.length === 0 || legal.length === 1) {
    baseMs = 1300;
  } else {
    baseMs = 1850;
  }

  return Math.round(baseMs * speedMult + jitter);
}

type AppScreenMode = 'local' | 'online_lobby' | 'online_room';

export default function DominoAppScreen() {
  const { user, setProfile } = useAuth();
  const { palette } = usePalette();
  const [screenMode, setScreenMode] = useState<AppScreenMode>('local');
  const [lobbyInitialTab, setLobbyInitialTab] = useState<'public' | 'private'>('public');

  // Local Quick Play State (sound defaults ON with persisted user preference)
  const [state, setState] = useState<GameState>(() =>
    createInitialSetupState('1v1', 100, 'value', true)
  );
  const [retention, setRetention] = useState<RetentionProgress>(() =>
    createDefaultRetention()
  );
  const [hydrated, setHydrated] = useState(false);
  const [turnSecondsLeft, setTurnSecondsLeft] = useState<number | null>(null);
  const [botTimerProgress, setBotTimerProgress] = useState(1);
  const [botSpeed, setBotSpeed] = useState<BotSpeed>('normal');
  const [aiDifficulty, setAiDifficulty] = useState<AiDifficulty>('normal');
  const [isLocalPaused, setIsLocalPaused] = useState(false);
  const [seatMoods, setSeatMoods] = useState<Record<number, BotMood>>({});
  const [seatReactions, setSeatReactions] = useState<Record<number, string | null>>({});
  const [handEndMoment, setHandEndMoment] = useState<HandEndMomentData | null>(null);
  const [summaryRevealReady, setSummaryRevealReady] = useState(true);
  const [companions, setCompanions] = useState<TableCompanion[]>([]);

  // Economy, Auth & Feedback Modals + Remote Kill-Switch Config
  const [dailyModalOpen, setDailyModalOpen] = useState(false);
  const [themesModalOpen, setThemesModalOpen] = useState(false);
  const [avatarStudioOpen, setAvatarStudioOpen] = useState(false);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [authModal, setAuthModal] = useState<{ open: boolean; reason: AuthModalReason }>({
    open: false,
    reason: 'profile',
  });
  const [remoteConfig, setRemoteConfig] = useState<RemoteAppConfig>(DEFAULT_REMOTE_CONFIG);
  const pendingOnlineTabRef = useRef<'public' | 'private' | null>(null);

  // Online Room Realtime State
  const [onlineRoom, setOnlineRoom] = useState<OnlineRoomRow | null>(null);
  const [onlineMyHand, setOnlineMyHand] = useState<Tile[]>([]);
  const [onlineMySeat, setOnlineMySeat] = useState<number>(0);

  const stateRef = useRef(state);
  stateRef.current = state;
  const retentionRef = useRef(retention);
  retentionRef.current = retention;
  const recordedMatchIdRef = useRef<string | null>(null);
  const reviewedOnlineRoomRef = useRef<string | null>(null);
  const reactionTimersRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());
  const lastOnlineReactionAtRef = useRef<number>(0);
  const lastSignatureKeyRef = useRef<string | null>(null);

  const setTempMood = useCallback((seat: number, mood: BotMood) => {
    setSeatMoods((prev) => ({ ...prev, [seat]: mood }));
  }, []);

  const flashSeatReaction = useCallback((visualSeat: number, text: string, durationMs = 2600) => {
    const existing = reactionTimersRef.current.get(visualSeat);
    if (existing) clearTimeout(existing);
    setSeatReactions((prev) => ({ ...prev, [visualSeat]: text }));
    const t = setTimeout(() => {
      reactionTimersRef.current.delete(visualSeat);
      setSeatReactions((prev) => ({ ...prev, [visualSeat]: null }));
    }, durationMs);
    reactionTimersRef.current.set(visualSeat, t);
  }, []);

  // 1. Hydrate local cache immediately (0 ms perceived startup) & warm up native SFX
  useEffect(() => {
    let active = true;
    initGameAudio();
    Promise.all([
      loadGameState(),
      loadRetentionProgress(),
      loadCachedRemoteConfig(),
      AsyncStorage.getItem(BOT_SPEED_STORAGE_KEY).catch(() => null),
      AsyncStorage.getItem(SOUND_ENABLED_STORAGE_KEY).catch(() => null),
      AsyncStorage.getItem(AI_DIFFICULTY_STORAGE_KEY).catch(() => null),
    ]).then(([savedGame, savedRetention, cachedCfg, savedBotSpeed, savedSound, savedDiff]) => {
      if (!active) return;
      const resolvedSound =
        savedSound === 'false' ? false : savedSound === 'true' ? true : true;
      if (savedGame) {
        setState({ ...savedGame, soundEnabled: resolvedSound });
      } else {
        setState((prev) => ({ ...prev, soundEnabled: resolvedSound }));
      }
      setRetention(savedRetention);
      setRemoteConfig(cachedCfg);
      if (
        savedBotSpeed === 'fast' ||
        savedBotSpeed === 'normal' ||
        savedBotSpeed === 'relaxed'
      ) {
        setBotSpeed(savedBotSpeed);
      }
      if (savedDiff === 'casual' || savedDiff === 'normal' || savedDiff === 'pro') {
        setAiDifficulty(savedDiff);
      }
      setHydrated(true);
      trackEvent('app_open', { level: savedRetention.level });
    });
    fetchRemoteAppConfig()
      .then((freshCfg) => {
        if (active) setRemoteConfig(freshCfg);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  // Persist local quick-play game state
  useEffect(() => {
    if (!hydrated) return;
    saveGameState(state);
  }, [state, hydrated]);

  // Prevent accidental Android back button exit during active game
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (screenMode === 'local' && stateRef.current.phase === 'playing') {
        return true;
      }
      if (screenMode === 'online_lobby') {
        setScreenMode('local');
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [screenMode]);

  // 2. Background Supabase Sync on sign-in + Auto-continue into Online Lobby if triggered from guest tap
  useEffect(() => {
    if (!hydrated || !user) return;
    let active = true;

    if (authModal.open) {
      setAuthModal((prev) => ({ ...prev, open: false }));
    }
    if (pendingOnlineTabRef.current) {
      const targetTab = pendingOnlineTabRef.current;
      pendingOnlineTabRef.current = null;
      setLobbyInitialTab(targetTab);
      setScreenMode('online_lobby');
    }

    flushPendingAndSyncProgress(user.id, retentionRef.current)
      .then(({ mergedProgress, profile }) => {
        if (!active) return;
        setRetention(mergedProgress);
        if (profile) {
          setProfile(profile);
          setBotSpeed(profile.preferredBotSpeed);
        }
      })
      .catch(() => {});

    fetchTableCompanions()
      .then((list) => {
        if (active) setCompanions(list);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [hydrated, user, setProfile]);

  // 3. Realtime Subscription when inside an Online Room
  const activeOnlineRoomId = screenMode === 'online_room' ? onlineRoom?.id ?? null : null;
  useEffect(() => {
    if (!activeOnlineRoomId || !user) return;
    let mounted = true;

    const refreshSnapshot = async () => {
      const snap = await fetchRoomSnapshot(activeOnlineRoomId, user.id);
      if (!mounted || !snap.room) return;
      setOnlineRoom(snap.room);
      setOnlineMyHand(snap.myHand);
      setOnlineMySeat(snap.mySeat);

      // Refresh local progress/chips from cloud whenever an online match finishes
      if (snap.room.status === 'finished') {
        flushPendingAndSyncProgress(user.id, retentionRef.current)
          .then(({ mergedProgress }) => {
            if (mounted) setRetention(mergedProgress);
          })
          .catch(() => {});
      }
    };

    refreshSnapshot();

    const channel = supabase
      .channel(`room-live-${activeOnlineRoomId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'game_rooms',
          filter: `id=eq.${activeOnlineRoomId}`,
        },
        () => {
          refreshSnapshot();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'room_players',
          filter: `room_id=eq.${activeOnlineRoomId}`,
        },
        () => {
          refreshSnapshot();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'room_player_hands',
          filter: `room_id=eq.${activeOnlineRoomId}`,
        },
        () => {
          refreshSnapshot();
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [activeOnlineRoomId, user]);

  // Build rotated local-seat-0 GameState & real human avatar metadata for Online Multiplayer
  const onlineGameState = useMemo(() => {
    if (screenMode !== 'online_room' || !onlineRoom?.public_state) return null;
    return buildRotatedOnlineGameState(
      onlineRoom.public_state,
      onlineMyHand,
      onlineMySeat,
      state.sortMode,
      state.soundEnabled
    );
  }, [screenMode, onlineRoom, onlineMyHand, onlineMySeat, state.sortMode, state.soundEnabled]);

  const onlineSeatMeta = useMemo(() => {
    if (screenMode !== 'online_room' || !onlineRoom?.public_state) return null;
    return buildRotatedOnlineSeatMeta(onlineRoom.public_state, onlineMySeat);
  }, [screenMode, onlineRoom, onlineMySeat]);

  // Display incoming Online Sobremesa reactions on the rotated visual seat
  const onlineLastReaction = onlineRoom?.public_state?.lastReaction ?? null;
  useEffect(() => {
    if (
      screenMode !== 'online_room' ||
      !onlineLastReaction ||
      !onlineRoom?.public_state
    ) {
      return;
    }
    if (onlineLastReaction.at <= lastOnlineReactionAtRef.current) return;
    lastOnlineReactionAtRef.current = onlineLastReaction.at;

    const n = onlineRoom.public_state.players.length || 2;
    const visualSeat = (onlineLastReaction.seat - onlineMySeat + n) % n;
    flashSeatReaction(visualSeat, onlineLastReaction.text);
    if (visualSeat !== 0) {
      playGameSound('pickup', stateRef.current.soundEnabled);
    }
  }, [screenMode, onlineLastReaction, onlineRoom?.public_state, onlineMySeat, flashSeatReaction]);

  // Signature Moment (~0.95s warm celebration over the live table before showing RoundSummary / MatchOver)
  const activeTableState = screenMode === 'online_room' ? onlineGameState : state;
  const activeTablePhase = activeTableState?.phase ?? 'setup';
  const activeTableHandNum = activeTableState?.handNumber ?? 0;
  const activeSummary = activeTableState?.lastHandSummary ?? null;
  useEffect(() => {
    if (!activeTableState || (activeTablePhase !== 'round_summary' && activeTablePhase !== 'match_over')) {
      setHandEndMoment(null);
      setSummaryRevealReady(true);
      lastSignatureKeyRef.current = null;
      return;
    }

    const sigKey = `${screenMode}-${activeOnlineRoomId ?? 'local'}-${activeTableHandNum}-${activeTablePhase}`;
    if (lastSignatureKeyRef.current === sigKey) return;
    lastSignatureKeyRef.current = sigKey;

    if (!activeSummary) {
      setSummaryRevealReady(true);
      return;
    }

    const wSeat = activeSummary.winnerSeat;
    const isOnline = screenMode === 'online_room' && Boolean(onlineSeatMeta);
    const prof = wSeat !== null ? getSeatProfile(activeTableState.mode, wSeat) : null;
    const isWinnerBot =
      wSeat === null
        ? false
        : isOnline && onlineSeatMeta
        ? !onlineSeatMeta.seatIsHuman[wSeat]
        : prof?.isBot ?? false;
    const winnerName =
      wSeat === null
        ? null
        : activeTableState.mode === '2v2'
        ? activeSummary.winnerScoreIndex === 0
          ? 'Nosotros'
          : 'Rivales'
        : isOnline && onlineSeatMeta
        ? onlineSeatMeta.seatNames[wSeat]
        : prof?.displayName ?? 'Ganador';
    const winnerAvatar =
      wSeat === 0
        ? retentionRef.current.avatarConfig
        : wSeat !== null && isOnline && onlineSeatMeta
        ? onlineSeatMeta.seatAvatars[wSeat]
        : undefined;

    setSummaryRevealReady(false);
    setHandEndMoment({
      reason: activeSummary.reason,
      winnerName,
      points: activeSummary.pointsAwarded,
      winnerAvatar,
      isWinnerBot,
      accentColor: prof?.accentColor ?? CLUB.gold,
    });
    if (screenMode === 'online_room') {
      hapticSuccess();
      playGameSound('win', stateRef.current.soundEnabled);
    }

    const timer = setTimeout(() => {
      setHandEndMoment(null);
      setSummaryRevealReady(true);
    }, 950);

    return () => clearTimeout(timer);
  }, [
    screenMode,
    activeOnlineRoomId,
    activeTableState,
    activeTablePhase,
    activeTableHandNum,
    activeSummary,
    onlineSeatMeta,
  ]);

  // 3b. Server-enforced Online Turn Timeout Watchdog (26s grace over server's 25s limit)
  const onlineTurnStartedAt = onlineRoom?.turn_started_at ?? null;
  const onlineCurrentTurnSeat = onlineRoom?.public_state?.currentTurnSeat ?? null;
  const onlinePhase = onlineRoom?.public_state?.phase ?? null;
  useEffect(() => {
    if (
      screenMode !== 'online_room' ||
      !activeOnlineRoomId ||
      onlinePhase !== 'playing' ||
      !onlineTurnStartedAt
    ) {
      return;
    }

    const startedMs = Date.parse(onlineTurnStartedAt);
    if (!Number.isFinite(startedMs)) return;

    const elapsed = Date.now() - startedMs;
    const waitMs = Math.max(1000, 26_000 - elapsed);
    const timer = setTimeout(() => {
      sendOnlineClaimTimeout(activeOnlineRoomId).catch(() => {});
    }, waitMs);

    return () => clearTimeout(timer);
  }, [
    screenMode,
    activeOnlineRoomId,
    onlinePhase,
    onlineTurnStartedAt,
    onlineCurrentTurnSeat,
  ]);

  // 3c. Compliant native In-App Review on Online Match Victory
  const onlineWinnerIndex = onlineGameState?.matchWinnerIndex ?? null;
  useEffect(() => {
    if (
      screenMode !== 'online_room' ||
      !activeOnlineRoomId ||
      onlinePhase !== 'match_over' ||
      onlineWinnerIndex !== 0
    ) {
      return;
    }
    const reviewKey = `${activeOnlineRoomId}-${onlineRoom?.public_state?.handNumber ?? 0}`;
    if (reviewedOnlineRoomRef.current === reviewKey) return;
    reviewedOnlineRoomRef.current = reviewKey;

    const timer = setTimeout(() => {
      maybeRequestStoreReview({
        humanWon: true,
        totalWins: Math.max(2, retentionRef.current.totalWins + 1),
        dailyStars: retentionRef.current.dailyStars,
        userId: user?.id ?? null,
      }).catch(() => {});
    }, 950);

    return () => clearTimeout(timer);
  }, [
    screenMode,
    activeOnlineRoomId,
    onlinePhase,
    onlineWinnerIndex,
    onlineRoom?.public_state?.handNumber,
    user?.id,
  ]);

  // 4. Local Match Completion -> XP + Club Chips + Stars + Cloud Sync
  useEffect(() => {
    if (!hydrated || screenMode !== 'local') return;
    if (state.phase === 'round_summary') {
      hapticSuccess();
      playGameSound('win', state.soundEnabled);
    } else if (state.phase === 'match_over') {
      hapticSuccess();
      playGameSound('win', state.soundEnabled);
      const matchKey = `${state.mode}-${state.targetScore}-${state.handNumber}-${state.scores.join('-')}-${state.matchWinnerIndex}`;
      if (recordedMatchIdRef.current !== matchKey) {
        recordedMatchIdRef.current = matchKey;
        const humanWon = state.matchWinnerIndex === 0;
        const { updated, chipsEarned, xpEarned } = recordMatchResult(
          retentionRef.current,
          humanWon
        );
        setRetention(updated);
        saveRetentionProgress(updated);

        trackEvent(
          'match_end',
          {
            mode: state.mode,
            target: state.targetScore,
            won: humanWon,
            hands: state.handNumber,
            chips: chipsEarned,
            xp: xpEarned,
          },
          user?.id
        );

        queueAndSyncMatch(
          user?.id ?? null,
          {
            clientMatchId: `${matchKey}-${Date.now()}`,
            mode: state.mode,
            targetScore: state.targetScore,
            humanWon,
            handsPlayed: state.handNumber,
            finalScores: state.scores,
            playedAt: new Date().toISOString(),
          },
          updated
        )
          .then((authoritative) => {
            if (authoritative) setRetention(authoritative);
          })
          .catch(() => {});

        // Compliant native In-App Review prompt on genuine Peak Joy victory (no review gating)
        if (humanWon) {
          setTimeout(() => {
            maybeRequestStoreReview({
              humanWon: true,
              totalWins: updated.totalWins,
              dailyStars: updated.dailyStars,
              userId: user?.id ?? null,
            }).catch(() => {});
          }, 950);
        }
      }
    }
  }, [
    hydrated,
    screenMode,
    state.phase,
    state.mode,
    state.targetScore,
    state.handNumber,
    state.scores,
    state.matchWinnerIndex,
    state.soundEnabled,
    user?.id,
  ]);

  // Local Human Move Dispatchers
  const executeLocalHumanPlay = useCallback((tileId: string, side: PlaySide) => {
    const curr = stateRef.current;
    if (curr.phase !== 'playing' || curr.currentTurnSeat !== 0) return;
    const tile = curr.players[0]?.hand.find((t) => t.id === tileId);
    try {
      const next = applyPlay(curr, 0, tileId, side);
      setState(next);
      if (tile && isDouble(tile)) {
        hapticDouble();
        playGameSound('double', curr.soundEnabled);
        // Subtle warm Bot reaction when human drops a double
        if (next.phase === 'playing') {
          const reactorSeat = curr.mode === '2v2' ? 2 : 1;
          const phrase = pickBotTablePhrase('human_double', curr.mode === '2v2', 0.42);
          if (phrase) {
            setTimeout(() => flashSeatReaction(reactorSeat, phrase), 450);
          }
        }
      } else {
        hapticSnap();
        playGameSound('clack', curr.soundEnabled);
      }
    } catch {
      // Ignore illegal action
    }
  }, [flashSeatReaction]);

  const executeLocalHumanDraw = useCallback((boneyardIndex?: number) => {
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

  const executeLocalHumanPass = useCallback(() => {
    const curr = stateRef.current;
    if (curr.phase !== 'playing' || curr.currentTurnSeat !== 0) return;
    try {
      const next = applyPass(curr, 0);
      setState(next);
      hapticWarning();
      playGameSound('pass', curr.soundEnabled);
      if (next.phase === 'playing' && curr.mode === '2v2') {
        const phrase = pickBotTablePhrase('human_pass', true, 0.48);
        if (phrase) {
          setTimeout(() => flashSeatReaction(2, phrase), 500);
        }
      }
    } catch {
      // Ignore
    }
  }, [flashSeatReaction]);

  // Local 20s Human Turn Timer (genuinely pauses while Pause modal is open)
  useEffect(() => {
    if (
      !hydrated ||
      screenMode !== 'local' ||
      isLocalPaused ||
      state.phase !== 'playing' ||
      state.currentTurnSeat !== 0
    ) {
      if (!isLocalPaused) setTurnSecondsLeft(null);
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
          executeLocalHumanPlay(legal[0].tile.id, legal[0].sides[0]);
        } else if (curr.boneyard.length > 0) {
          executeLocalHumanDraw();
        } else {
          executeLocalHumanPass();
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
    screenMode,
    isLocalPaused,
    state.phase,
    state.currentTurnSeat,
    state.handNumber,
    state.chain.length,
    state.boneyard.length,
    executeLocalHumanPlay,
    executeLocalHumanDraw,
    executeLocalHumanPass,
  ]);

  // Local Situational Human-like Bot Loop (pauses cleanly while Pause modal is open)
  useEffect(() => {
    if (!hydrated || screenMode !== 'local' || isLocalPaused || state.phase !== 'playing') return;
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
      const decision = chooseAiMove(publicView, aiDifficulty);

      try {
        if (decision) {
          const next = applyPlay(curr, seat, decision.tile.id, decision.side);
          setState(next);
          if (isDouble(decision.tile)) {
            setTempMood(seat, 'double');
            hapticDouble();
            playGameSound('double', curr.soundEnabled);
            if (next.phase === 'playing') {
              const phrase = pickBotTablePhrase('bot_double', curr.mode === '2v2' && seat === 2, 0.34);
              if (phrase) flashSeatReaction(seat, phrase);
            }
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
    screenMode,
    isLocalPaused,
    state.phase,
    state.currentTurnSeat,
    state.handNumber,
    state.chain.length,
    state.boneyard.length,
    state.consecutivePasses,
    botSpeed,
    aiDifficulty,
    setTempMood,
  ]);

  // Economy Actions (Daily 7-day Reward, Free Refill, Cosmetic Table Themes)
  const handleClaimDailyReward = useCallback(() => {
    const { updated, awarded } = claimDailyRewardLocal(retentionRef.current);
    if (awarded <= 0) return;
    setRetention(updated);
    saveRetentionProgress(updated);
    hapticSuccess();
    trackEvent('daily_claim', { awarded, streak: updated.dailyClaimStreak }, user?.id);
    syncDailyRewardToCloud(user?.id ?? null, updated)
      .then((authoritative) => {
        if (authoritative) setRetention(authoritative);
      })
      .catch(() => {});
  }, [user?.id]);

  const handleClaimFreeRefill = useCallback(() => {
    const { updated, awarded } = applyFreeClubRefill(retentionRef.current);
    if (awarded <= 0) return;
    setRetention(updated);
    saveRetentionProgress(updated);
    hapticSuccess();
    trackEvent('free_refill', { awarded }, user?.id);
    syncFreeRefillToCloud(user?.id ?? null, updated)
      .then((authoritative) => {
        if (authoritative) setRetention(authoritative);
      })
      .catch(() => {});
  }, [user?.id]);

  const handleSelectOrUnlockTheme = useCallback(
    (themeId: TableThemeId) => {
      const curr = retentionRef.current;
      const cfg = TABLE_THEMES[themeId];
      if (!cfg) return;

      if (curr.unlockedThemes.includes(themeId)) {
        const updated: RetentionProgress = { ...curr, equippedTheme: themeId };
        setRetention(updated);
        saveRetentionProgress(updated);
        syncThemeToCloud(user?.id ?? null, themeId, updated)
          .then((authoritative) => {
            if (authoritative) setRetention(authoritative);
          })
          .catch(() => {});
        return;
      }

      if (curr.clubChips < cfg.costChips) return;
      const updated: RetentionProgress = {
        ...curr,
        clubChips: curr.clubChips - cfg.costChips,
        unlockedThemes: [...curr.unlockedThemes, themeId],
        equippedTheme: themeId,
      };
      setRetention(updated);
      saveRetentionProgress(updated);
      hapticSuccess();
      trackEvent('theme_unlock', { themeId, cost: cfg.costChips }, user?.id);
      syncThemeToCloud(user?.id ?? null, themeId, updated)
        .then((authoritative) => {
          if (authoritative) setRetention(authoritative);
        })
        .catch(() => {});
    },
    [user?.id]
  );

  const handleSelectOrUnlockTileStyle = useCallback(
    (tileStyleId: TileStyleId) => {
      const curr = retentionRef.current;
      const cfg = TILE_STYLES[tileStyleId];
      if (!cfg) return;

      const isOwned =
        !cfg.cosmeticKey || curr.unlockedCosmetics.includes(cfg.cosmeticKey);

      if (isOwned) {
        const updated: RetentionProgress = {
          ...curr,
          equippedTileStyle: tileStyleId,
        };
        setRetention(updated);
        saveRetentionProgress(updated);
        syncTileStyleToCloud(user?.id ?? null, tileStyleId, updated)
          .then((authoritative) => {
            if (authoritative) setRetention(authoritative);
          })
          .catch(() => {});
        return;
      }

      if (curr.clubChips < cfg.costChips) return;
      const updated: RetentionProgress = {
        ...curr,
        clubChips: curr.clubChips - cfg.costChips,
        unlockedCosmetics: [...curr.unlockedCosmetics, cfg.cosmeticKey!],
        equippedTileStyle: tileStyleId,
      };
      setRetention(updated);
      saveRetentionProgress(updated);
      hapticSuccess();
      trackEvent(
        'cosmetic_unlock',
        { itemKey: cfg.cosmeticKey!, cost: cfg.costChips },
        user?.id
      );
      syncTileStyleToCloud(user?.id ?? null, tileStyleId, updated)
        .then((authoritative) => {
          if (authoritative) setRetention(authoritative);
        })
        .catch(() => {});
    },
    [user?.id]
  );

  const handleUnlockAndSaveAvatar = useCallback(
    (nextConfig: AvatarConfig, keysToUnlock: string[]) => {
      const curr = retentionRef.current;
      const ownedSet = new Set(curr.unlockedCosmetics);
      const uniqueToBuy = Array.from(new Set(keysToUnlock)).filter(
        (k) => k in AVATAR_COSMETIC_PRICES && !ownedSet.has(k)
      );
      const totalCost = uniqueToBuy.reduce(
        (sum, k) => sum + (AVATAR_COSMETIC_PRICES[k] ?? 0),
        0
      );

      if (curr.clubChips < totalCost) return;

      const updated: RetentionProgress = {
        ...curr,
        clubChips: curr.clubChips - totalCost,
        unlockedCosmetics: [...curr.unlockedCosmetics, ...uniqueToBuy],
        avatarConfig: nextConfig,
      };
      setRetention(updated);
      saveRetentionProgress(updated);
      if (uniqueToBuy.length > 0) {
        hapticSuccess();
        for (const k of uniqueToBuy) {
          trackEvent(
            'cosmetic_unlock',
            { itemKey: k, cost: AVATAR_COSMETIC_PRICES[k] ?? 0 },
            user?.id
          );
        }
      }
      trackEvent(
        'avatar_updated',
        { hat: nextConfig.hat, outfit: nextConfig.outfit, frame: nextConfig.frame },
        user?.id
      );

      if (user?.id) {
        (async () => {
          let latest: RetentionProgress = updated;
          for (const k of uniqueToBuy) {
            const unlockedRes = await syncCosmeticUnlockToCloud(user.id, k, latest);
            if (unlockedRes) latest = unlockedRes;
          }
          const saved = await syncAvatarConfigToCloud(user.id, nextConfig, latest);
          if (saved) setRetention(saved);
        })().catch(() => {});
      }
    },
    [user?.id]
  );

  // Setup & Local Controls
  const handleChangeMode = useCallback(
    (mode: GameMode) => {
      setState((prev) =>
        createInitialSetupState(mode, prev.targetScore, prev.sortMode, prev.soundEnabled)
      );
      syncUserPreferences(user?.id ?? null, { mode }).catch(() => {});
    },
    [user?.id]
  );

  const handleChangeTargetScore = useCallback(
    (targetScore: TargetScore) => {
      setState((prev) =>
        createInitialSetupState(prev.mode, targetScore, prev.sortMode, prev.soundEnabled)
      );
      syncUserPreferences(user?.id ?? null, { targetScore }).catch(() => {});
    },
    [user?.id]
  );

  const handleStartQuickMatch = useCallback(() => {
    recordedMatchIdRef.current = null;
    setSeatMoods({});
    setScreenMode('local');
    trackEvent(
      'match_start',
      { mode: stateRef.current.mode, target: stateRef.current.targetScore, online: false },
      user?.id
    );
    setState((prev) =>
      startNewMatch(prev.mode, prev.targetScore, prev.sortMode, prev.soundEnabled)
    );
  }, [user?.id]);

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
    setState((prev) => {
      const nextSound = !prev.soundEnabled;
      AsyncStorage.setItem(SOUND_ENABLED_STORAGE_KEY, String(nextSound)).catch(() => {});
      if (nextSound) {
        playGameSound('clack', true);
      }
      return { ...prev, soundEnabled: nextSound };
    });
  }, []);

  const handleCycleAiDifficulty = useCallback(() => {
    hapticLight();
    setAiDifficulty((prev) => {
      const next: AiDifficulty =
        prev === 'normal' ? 'pro' : prev === 'pro' ? 'casual' : 'normal';
      AsyncStorage.setItem(AI_DIFFICULTY_STORAGE_KEY, next).catch(() => {});
      return next;
    });
  }, []);

  const handleCycleBotSpeed = useCallback(() => {
    hapticLight();
    setBotSpeed((prev) => {
      const next: BotSpeed =
        prev === 'normal' ? 'relaxed' : prev === 'relaxed' ? 'fast' : 'normal';
      AsyncStorage.setItem(BOT_SPEED_STORAGE_KEY, next).catch(() => {});
      syncUserPreferences(user?.id ?? null, { botSpeed: next }).catch(() => {});
      return next;
    });
  }, [user?.id]);

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
    setScreenMode('local');
    setOnlineRoom(null);
    setState((prev) =>
      createInitialSetupState(prev.mode, prev.targetScore, prev.sortMode, prev.soundEnabled)
    );
  }, []);

  // Online Room Action Handlers
  const handleEnteredOnlineRoom = useCallback(
    (room: OnlineRoomRow, mySeat: number) => {
      setOnlineRoom(room);
      setOnlineMySeat(mySeat);
      setOnlineMyHand([]);
      setScreenMode('online_room');
      trackEvent(
        'room_joined',
        { mode: room.mode, isPrivate: room.is_private, buyIn: room.buy_in },
        user?.id
      );
    },
    [user?.id]
  );

  const handleLeaveOnlineRoom = useCallback(async () => {
    if (onlineRoom) {
      await leaveOnlineRoom(onlineRoom.id).catch(() => {});
    }
    setOnlineRoom(null);
    setOnlineMyHand([]);
    setScreenMode('online_lobby');
  }, [onlineRoom]);

  const handleStartOnlineWithBots = useCallback(
    async (convertToFree = false) => {
      if (!onlineRoom) return;
      await startOnlineRoomWithBots(onlineRoom.id, { convertToFree });
      trackEvent(
        'room_started_with_bots',
        { mode: onlineRoom.mode, convertToFree, originalBuyIn: onlineRoom.buy_in },
        user?.id
      );
    },
    [onlineRoom, user?.id]
  );

  const handleOnlinePlay = useCallback(
    (tileId: string, side: PlaySide) => {
      if (!onlineRoom) return;
      hapticSnap();
      playGameSound('clack', state.soundEnabled);
      sendOnlinePlay(onlineRoom.id, tileId, side).catch(() => {});
    },
    [onlineRoom, state.soundEnabled]
  );

  const handleOnlineDraw = useCallback(
    (boneyardIndex?: number) => {
      if (!onlineRoom) return;
      hapticLight();
      playGameSound('draw', state.soundEnabled);
      sendOnlineDraw(onlineRoom.id, boneyardIndex).catch(() => {});
    },
    [onlineRoom, state.soundEnabled]
  );

  const handleOnlinePass = useCallback(() => {
    if (!onlineRoom) return;
    hapticWarning();
    playGameSound('pass', state.soundEnabled);
    sendOnlinePass(onlineRoom.id).catch(() => {});
  }, [onlineRoom, state.soundEnabled]);

  const handleOnlineNextHand = useCallback(() => {
    if (!onlineRoom) return;
    sendOnlineNextHand(onlineRoom.id).catch(() => {});
  }, [onlineRoom]);

  const handleOnlineRematch = useCallback(() => {
    if (!onlineRoom) return;
    sendOnlineRematch(onlineRoom.id).catch(() => {});
  }, [onlineRoom]);

  const handleLocalSendReaction = useCallback(
    (code: TableReactionCode) => {
      const item = REACTION_BY_CODE[code];
      if (!item) return;
      flashSeatReaction(0, item.label);
      const curr = stateRef.current;
      if (curr.phase !== 'playing') return;
      const responderSeat = curr.mode === '2v2' ? 2 : 1;
      const reply =
        code === 'hola'
          ? '¡Hola! ¡Buena partida!'
          : code === 'buena'
          ? '¡Gracias!'
          : code === 'compa' && curr.mode === '2v2'
          ? '¡Eso es, equipo!'
          : code === 'buen_juego'
          ? '¡Igual para ti!'
          : pickBotTablePhrase('partner_good_play', curr.mode === '2v2', 0.55);
      if (reply) {
        setTimeout(() => flashSeatReaction(responderSeat, reply), 650);
      }
    },
    [flashSeatReaction]
  );

  const handleOnlineSendReaction = useCallback(
    (code: TableReactionCode) => {
      if (!onlineRoom) return;
      const item = REACTION_BY_CODE[code];
      if (item) flashSeatReaction(0, item.label);
      sendOnlineReaction(onlineRoom.id, code).catch(() => {});
    },
    [onlineRoom, flashSeatReaction]
  );

  const handleSaveCompanion = useCallback(async (companionUserId: string) => {
    const updated = await saveTableCompanion(companionUserId);
    if (updated) setCompanions(updated);
  }, []);

  if (!hydrated) {
    return (
      <SafeAreaView style={[styles.loading, { backgroundColor: palette.bgTop }]}>
        <ActivityIndicator size="large" color={palette.brandAccent} />
      </SafeAreaView>
    );
  }

  const requiresForceUpdate = isVersionBelow(
    APP_VERSION,
    remoteConfig.minSupportedVersion
  );

  if (requiresForceUpdate) {
    return (
      <SafeAreaView style={[styles.loading, { backgroundColor: palette.bgTop }]}>
        <View
          style={[
            styles.updateCard,
            {
              backgroundColor: palette.surfaceCard,
              borderColor: palette.borderSubtle,
            },
          ]}
        >
          <Text style={[styles.updateKicker, { color: palette.brandAccent }]}>
            ACTUALIZACIÓN REQUERIDA
          </Text>
          <Text style={[styles.updateTitle, { color: palette.textPrimary }]}>
            Nueva versión disponible
          </Text>
          <Text style={[styles.updateBody, { color: palette.textSecondary }]}>
            {remoteConfig.forceUpdateMessage}
          </Text>
          <Text style={[styles.updateMeta, { color: palette.textMuted }]}>
            Tu versión: v{APP_VERSION} · Mínima: v{remoteConfig.minSupportedVersion}
          </Text>
          <Pressable
            onPress={() => {
              fetchRemoteAppConfig()
                .then((cfg) => setRemoteConfig(cfg))
                .catch(() => {});
            }}
            style={[
              styles.updateBtn,
              {
                backgroundColor: palette.primaryMid,
                borderBottomColor: palette.primaryShadow,
              },
            ]}
          >
            <Text style={[styles.updateBtnText, { color: palette.textOnPrimary }]}>
              Comprobar de nuevo
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const showLocalTable =
    screenMode === 'local' &&
    (state.phase === 'playing' ||
      state.phase === 'round_summary' ||
      state.phase === 'match_over');

  const safeAreaBg =
    showLocalTable || (screenMode === 'online_room' && Boolean(onlineGameState))
      ? palette.tableRoomTop
      : palette.bgTop;

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: safeAreaBg }]}
      edges={['top', 'bottom', 'left', 'right']}
    >
      <View style={styles.flex}>
        {/* HOME / SETUP */}
        {screenMode === 'local' && state.phase === 'setup' && (
          <SetupView
            mode={state.mode}
            targetScore={state.targetScore}
            retention={retention}
            onlineEnabled={remoteConfig.onlineEnabled}
            maintenanceBanner={remoteConfig.maintenanceBanner}
            onChangeMode={handleChangeMode}
            onChangeTargetScore={handleChangeTargetScore}
            onStartQuickMatch={handleStartQuickMatch}
            onOpenOnlineLobby={(tab) => {
              if (!remoteConfig.onlineEnabled) return;
              if (!user) {
                pendingOnlineTabRef.current = tab;
                setAuthModal({
                  open: true,
                  reason: tab === 'private' ? 'online_private' : 'online_public',
                });
                return;
              }
              setLobbyInitialTab(tab);
              setScreenMode('online_lobby');
            }}
            onOpenDailyRewards={() => setDailyModalOpen(true)}
            onOpenThemes={() => setThemesModalOpen(true)}
            onOpenAvatarStudio={() => setAvatarStudioOpen(true)}
            onOpenFeedback={() => setFeedbackModalOpen(true)}
            onOpenAuth={() => {
              pendingOnlineTabRef.current = null;
              setAuthModal({ open: true, reason: 'profile' });
            }}
          />
        )}

        {/* LOCAL QUICK PLAY TABLE */}
        {showLocalTable && (
          <GameTableView
            state={state}
            turnSecondsLeft={turnSecondsLeft}
            humanTurnTotalSeconds={HUMAN_TURN_SECONDS}
            botTimerProgress={botTimerProgress}
            botSpeed={botSpeed}
            aiDifficulty={aiDifficulty}
            seatMoods={seatMoods}
            seatReactions={seatReactions}
            handEndMoment={handEndMoment}
            themeId={retention.equippedTheme}
            tileStyleId={retention.equippedTileStyle}
            playerAvatarConfig={retention.avatarConfig}
            onHumanPlay={executeLocalHumanPlay}
            onHumanDraw={executeLocalHumanDraw}
            onHumanPass={executeLocalHumanPass}
            onSendReaction={handleLocalSendReaction}
            onToggleSort={handleToggleSort}
            onToggleSound={handleToggleSound}
            onCycleBotSpeed={handleCycleBotSpeed}
            onCycleAiDifficulty={handleCycleAiDifficulty}
            onPauseChange={setIsLocalPaused}
            onOpenFeedback={() => setFeedbackModalOpen(true)}
            onRestartMatch={handleRematch}
            onExitToHome={handleReturnToSetup}
          />
        )}

        {screenMode === 'local' && state.phase === 'round_summary' && summaryRevealReady && (
          <RoundSummaryView
            state={state}
            playerAvatarConfig={retention.avatarConfig}
            tileStyleId={retention.equippedTileStyle}
            onContinue={handleContinueNextHand}
          />
        )}

        {screenMode === 'local' && state.phase === 'match_over' && summaryRevealReady && (
          <MatchOverView
            state={state}
            retention={retention}
            onRematch={handleRematch}
            onChangeMode={handleReturnToSetup}
          />
        )}

        {/* ONLINE MULTIPLAYER LOBBY */}
        {screenMode === 'online_lobby' && (
          <OnlineLobbyView
            clubChips={retention.clubChips}
            defaultMode={state.mode}
            defaultTargetScore={state.targetScore}
            initialTab={lobbyInitialTab}
            companions={companions}
            onEnteredRoom={handleEnteredOnlineRoom}
            onRequestAuth={() => setAuthModal({ open: true, reason: 'online_public' })}
            onBack={() => setScreenMode('local')}
          />
        )}

        {/* ONLINE WAITING ROOM */}
        {screenMode === 'online_room' && onlineRoom && onlineRoom.status === 'waiting' && (
          <WaitingRoomView
            room={onlineRoom}
            isHost={onlineRoom.host_user_id === user?.id}
            onStartWithBots={handleStartOnlineWithBots}
            onLeave={handleLeaveOnlineRoom}
          />
        )}

        {/* ONLINE ACTIVE TABLE (Authoritative Realtime) */}
        {screenMode === 'online_room' && onlineGameState && (
          <>
            <GameTableView
              state={onlineGameState}
              turnSecondsLeft={null}
              humanTurnTotalSeconds={HUMAN_TURN_SECONDS}
              botTimerProgress={1}
              botSpeed={botSpeed}
              seatMoods={{}}
              seatAvatars={onlineSeatMeta?.seatAvatars}
              seatIsHuman={onlineSeatMeta?.seatIsHuman}
              seatNames={onlineSeatMeta?.seatNames}
              seatReactions={seatReactions}
              handEndMoment={handEndMoment}
              themeId={retention.equippedTheme}
              tileStyleId={retention.equippedTileStyle}
              playerAvatarConfig={retention.avatarConfig}
              onHumanPlay={handleOnlinePlay}
              onHumanDraw={handleOnlineDraw}
              onHumanPass={handleOnlinePass}
              onSendReaction={handleOnlineSendReaction}
              onToggleSort={handleToggleSort}
              onToggleSound={handleToggleSound}
              onCycleBotSpeed={handleCycleBotSpeed}
              onOpenFeedback={() => setFeedbackModalOpen(true)}
              onRestartMatch={handleOnlineRematch}
              onExitToHome={handleLeaveOnlineRoom}
            />

            {onlineGameState.phase === 'round_summary' && summaryRevealReady && (
              <RoundSummaryView
                state={onlineGameState}
                playerAvatarConfig={retention.avatarConfig}
                seatAvatars={onlineSeatMeta?.seatAvatars}
                seatIsHuman={onlineSeatMeta?.seatIsHuman}
                seatNames={onlineSeatMeta?.seatNames}
                tileStyleId={retention.equippedTileStyle}
                onContinue={handleOnlineNextHand}
              />
            )}

            {onlineGameState.phase === 'match_over' && summaryRevealReady && (
              <MatchOverView
                state={onlineGameState}
                retention={retention}
                seatAvatars={onlineSeatMeta?.seatAvatars}
                seatIsHuman={onlineSeatMeta?.seatIsHuman}
                seatNames={onlineSeatMeta?.seatNames}
                seatUserIds={onlineSeatMeta?.seatUserIds}
                savedCompanionIds={companions.map((c) => c.companion_user_id)}
                onSaveCompanion={handleSaveCompanion}
                onRematch={handleOnlineRematch}
                onChangeMode={handleLeaveOnlineRoom}
              />
            )}
          </>
        )}

        {/* Economy Modals */}
        <DailyRewardModal
          visible={dailyModalOpen}
          retention={retention}
          onClaimDaily={handleClaimDailyReward}
          onClaimFreeRefill={handleClaimFreeRefill}
          onClose={() => setDailyModalOpen(false)}
        />

        <ThemesModal
          visible={themesModalOpen}
          retention={retention}
          onSelectOrUnlockTheme={handleSelectOrUnlockTheme}
          onSelectOrUnlockTileStyle={handleSelectOrUnlockTileStyle}
          onClose={() => setThemesModalOpen(false)}
        />

        <AvatarStudioModal
          visible={avatarStudioOpen}
          retention={retention}
          onUnlockAndSaveAvatar={handleUnlockAndSaveAvatar}
          onClose={() => setAvatarStudioOpen(false)}
        />

        <FeedbackModal
          visible={feedbackModalOpen}
          userId={user?.id ?? null}
          onClose={() => setFeedbackModalOpen(false)}
        />

        <AuthModal
          visible={authModal.open}
          reason={authModal.reason}
          avatarConfig={retention.avatarConfig}
          onClose={() => {
            pendingOnlineTabRef.current = null;
            setAuthModal((prev) => ({ ...prev, open: false }));
          }}
        />
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
    padding: 20,
  },
  updateCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: CLUB.surfaceCard,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: CLUB.glassBorder,
    padding: 22,
    gap: 10,
    alignItems: 'center',
  },
  updateKicker: {
    color: CLUB.gold,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.1,
  },
  updateTitle: {
    color: CLUB.textPrimary,
    fontSize: 20,
    fontWeight: '900',
    textAlign: 'center',
  },
  updateBody: {
    color: CLUB.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 19,
  },
  updateMeta: {
    color: CLUB.textMuted,
    fontSize: 11,
    fontWeight: '700',
  },
  updateBtn: {
    width: '100%',
    marginTop: 6,
    backgroundColor: CLUB.emerald,
    borderRadius: 14,
    borderBottomWidth: 4,
    borderBottomColor: CLUB.emeraldDark,
    minHeight: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
  updateBtnText: {
    color: CLUB.textInk,
    fontSize: 15,
    fontWeight: '900',
  },
});
