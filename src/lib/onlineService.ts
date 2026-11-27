import { ENGINE_STATE_VERSION, sortHand } from '@/engine/rules';
import {
  GameMode,
  GameState,
  HandSummary,
  HistoryEntry,
  PlacedTile,
  PlaySide,
  SortMode,
  TargetScore,
  Tile,
} from '@/engine/types';
import { supabase } from './supabase';

export interface OnlineSeatInfo {
  seat: number;
  user_id: string | null;
  display_name: string;
  is_bot: boolean;
}

export interface OnlineRoomRow {
  id: string;
  code: string;
  host_user_id: string;
  mode: GameMode;
  target_score: TargetScore;
  is_private: boolean;
  buy_in: number;
  status: 'waiting' | 'playing' | 'finished';
  max_players: number;
  player_count: number;
  public_state: SanitizedRoomPublicState | null;
  turn_started_at?: string | null;
  created_at: string;
  room_players?: OnlineSeatInfo[];
}

export interface SanitizedRoomPublicState {
  phase: 'playing' | 'round_summary' | 'match_over';
  mode: GameMode;
  targetScore: TargetScore;
  handNumber: number;
  currentOpenerSeat: number;
  currentTurnSeat: number;
  forcedOpeningTileId: string | null;
  undealtCount: number;
  chain: PlacedTile[];
  leftEnd: number | null;
  rightEnd: number | null;
  consecutivePasses: number;
  redealCount: number;
  scores: number[];
  scoreLabels: string[];
  history: HistoryEntry[];
  lastHandSummary: HandSummary | null;
  matchWinnerIndex: number | null;
  matchWinnerLabel: string | null;
  buyIn: number;
  players: {
    seat: number;
    name: string;
    isHuman: boolean;
    userId: string | null;
    teamId: number;
    tileCount: number;
    lastAction: string | null;
  }[];
}

async function invokeOnlineFn<T>(payload: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.functions.invoke('domino-online', {
    body: payload,
  });
  if (error) {
    throw new Error(error.message || 'Error conectando con la sala online.');
  }
  if (data && typeof data === 'object' && 'error' in data && data.error) {
    throw new Error(String(data.error));
  }
  return data as T;
}

export async function listOpenPublicRooms(
  modeFilter: GameMode | 'all' = 'all'
): Promise<OnlineRoomRow[]> {
  let query = supabase
    .from('game_rooms')
    .select(
      'id, code, host_user_id, mode, target_score, is_private, buy_in, status, max_players, player_count, public_state, turn_started_at, created_at, room_players(seat, user_id, display_name, is_bot)'
    )
    .eq('status', 'waiting')
    .eq('is_private', false);

  if (modeFilter !== 'all') {
    query = query.eq('mode', modeFilter);
  }

  // Prioritize almost-full rooms first so tables fill and launch fast even with thousands online
  const { data, error } = await query
    .order('player_count', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(20);

  if (error || !data) return [];
  return data as OnlineRoomRow[];
}

export async function fetchRoomSnapshot(
  roomId: string,
  userId: string
): Promise<{ room: OnlineRoomRow | null; myHand: Tile[]; mySeat: number }> {
  const [roomRes, handRes] = await Promise.all([
    supabase
      .from('game_rooms')
      .select(
        'id, code, host_user_id, mode, target_score, is_private, buy_in, status, max_players, player_count, public_state, turn_started_at, created_at, room_players(seat, user_id, display_name, is_bot)'
      )
      .eq('id', roomId)
      .maybeSingle(),
    supabase
      .from('room_player_hands')
      .select('seat, hand')
      .eq('room_id', roomId)
      .eq('user_id', userId)
      .maybeSingle(),
  ]);

  const room = (roomRes.data as OnlineRoomRow | null) ?? null;
  const seats = room?.room_players ?? [];
  const seatFromRoster = seats.find((s) => s.user_id === userId)?.seat ?? 0;
  const mySeat = handRes.data?.seat ?? seatFromRoster;
  const myHand = Array.isArray(handRes.data?.hand) ? (handRes.data.hand as Tile[]) : [];

  return { room, myHand, mySeat };
}

export function quickMatchOnlineRoom(params: {
  mode: GameMode;
  targetScore: TargetScore;
  buyIn?: number;
}) {
  return invokeOnlineFn<{ room: OnlineRoomRow; mySeat: number; matched: boolean }>({
    action: 'quick_match',
    mode: params.mode,
    targetScore: params.targetScore,
    buyIn: params.buyIn ?? 0,
  });
}

export function createOnlineRoom(params: {
  mode: GameMode;
  targetScore: TargetScore;
  isPrivate: boolean;
  buyIn: number;
}) {
  return invokeOnlineFn<{ room: OnlineRoomRow; mySeat: number }>({
    action: 'create_room',
    ...params,
  });
}

export function joinOnlineRoom(params: { roomId?: string; code?: string }) {
  return invokeOnlineFn<{ room: OnlineRoomRow; mySeat: number }>({
    action: 'join_room',
    ...params,
  });
}

export function startOnlineRoomWithBots(
  roomId: string,
  options?: { convertToFree?: boolean }
) {
  return invokeOnlineFn<{ ok: boolean; convertedToFree?: boolean }>({
    action: 'start_with_bots',
    roomId,
    convertToFree: Boolean(options?.convertToFree),
  });
}

export function leaveOnlineRoom(roomId: string) {
  return invokeOnlineFn<{ ok: boolean }>({
    action: 'leave_room',
    roomId,
  });
}

export function sendOnlinePlay(roomId: string, tileId: string, side: PlaySide) {
  return invokeOnlineFn<{ ok: boolean }>({
    action: 'play_tile',
    roomId,
    tileId,
    side,
  });
}

export function sendOnlineDraw(roomId: string, boneyardIndex?: number) {
  return invokeOnlineFn<{ ok: boolean }>({
    action: 'draw_tile',
    roomId,
    boneyardIndex,
  });
}

export function sendOnlinePass(roomId: string) {
  return invokeOnlineFn<{ ok: boolean }>({
    action: 'pass_turn',
    roomId,
  });
}

export function sendOnlineNextHand(roomId: string) {
  return invokeOnlineFn<{ ok: boolean }>({
    action: 'next_hand',
    roomId,
  });
}

export function sendOnlineRematch(roomId: string) {
  return invokeOnlineFn<{ ok: boolean }>({
    action: 'rematch',
    roomId,
  });
}

export function sendOnlineClaimTimeout(roomId: string) {
  return invokeOnlineFn<{ ok: boolean }>({
    action: 'claim_timeout',
    roomId,
  });
}

/**
 * Rotates the authoritative server `public_state` + caller's secret `myHand` so
 * the local user is ALWAYS visual seat `0` (bottom of the table!), allowing us to reuse
 * the exact same 120Hz `GameTableView`, `RoundSummaryView`, and `MatchOverView`.
 */
export function buildRotatedOnlineGameState(
  pub: SanitizedRoomPublicState,
  myHand: Tile[],
  myServerSeat: number,
  sortMode: SortMode,
  soundEnabled: boolean
): GameState {
  const n = pub.players.length;
  const toVisualSeat = (serverSeat: number) => (serverSeat - myServerSeat + n) % n;

  // Rotate player list so index 0 is always the local player
  const rotatedPlayers = Array.from({ length: n }, (_, visualSeat) => {
    const serverSeat = (myServerSeat + visualSeat) % n;
    const sp = pub.players[serverSeat];
    const hand: Tile[] =
      visualSeat === 0
        ? sortHand(myHand, sortMode)
        : Array.from({ length: sp.tileCount }, (_, idx) => ({
            id: `hidden-${visualSeat}-${idx}`,
            a: 0,
            b: 0,
          }));
    return {
      seat: visualSeat,
      name: visualSeat === 0 ? 'Tú' : sp.name,
      isHuman: visualSeat === 0,
      teamId: sp.teamId,
      hand,
      lastAction: sp.lastAction,
    };
  });

  // Rotate scores/labels so index 0 is always local player's team/score
  const myTeamId = pub.players[myServerSeat]?.teamId ?? 0;
  let rotatedScores = [...pub.scores];
  let rotatedLabels = [...pub.scoreLabels];
  let rotatedWinnerIndex = pub.matchWinnerIndex;

  if (pub.mode === '2v2') {
    if (myTeamId === 1) {
      rotatedScores = [pub.scores[1], pub.scores[0]];
      rotatedLabels = ['Nosotros', 'Rivales'];
      if (rotatedWinnerIndex !== null) rotatedWinnerIndex = rotatedWinnerIndex === 1 ? 0 : 1;
    } else {
      rotatedLabels = ['Nosotros', 'Rivales'];
    }
    for (const p of rotatedPlayers) {
      p.teamId = p.seat % 2;
    }
  } else {
    rotatedScores = Array.from({ length: n }, (_, v) => pub.scores[(myServerSeat + v) % n] ?? 0);
    rotatedLabels = rotatedPlayers.map((p) => p.name);
    if (rotatedWinnerIndex !== null) {
      rotatedWinnerIndex = toVisualSeat(rotatedWinnerIndex);
    }
    for (const p of rotatedPlayers) {
      p.teamId = p.seat;
    }
  }

  // Rotate chain playedBy for directional animations
  const rotatedChain = pub.chain.map((c) => ({
    ...c,
    playedBy: toVisualSeat(c.playedBy),
  }));

  // Rotate lastHandSummary seats & teamIds so Results screen displays cleanly
  let rotatedSummary: HandSummary | null = null;
  if (pub.lastHandSummary) {
    const s = pub.lastHandSummary;
    const mapScoreIdx = (idx: number | null) => {
      if (idx === null) return null;
      if (pub.mode === '2v2') return myTeamId === 1 ? (idx === 1 ? 0 : 1) : idx;
      return toVisualSeat(idx);
    };
    const remSorted = s.remainingHands
      .map((r) => {
        const vs = toVisualSeat(r.seat);
        return {
          ...r,
          seat: vs,
          name: vs === 0 ? 'Tú' : r.name,
          teamId: pub.mode === '2v2' ? vs % 2 : vs,
        };
      })
      .sort((a, b) => a.seat - b.seat);

    rotatedSummary = {
      ...s,
      winnerSeat: s.winnerSeat !== null ? toVisualSeat(s.winnerSeat) : null,
      winnerScoreIndex: mapScoreIdx(s.winnerScoreIndex),
      scoresAfter: rotatedScores,
      remainingHands: remSorted,
    };
  }

  return {
    version: ENGINE_STATE_VERSION,
    phase: pub.phase,
    mode: pub.mode,
    targetScore: pub.targetScore,
    handNumber: pub.handNumber,
    currentOpenerSeat: toVisualSeat(pub.currentOpenerSeat),
    lastOpenerSeat: null,
    currentTurnSeat: toVisualSeat(pub.currentTurnSeat),
    forcedOpeningTileId: pub.forcedOpeningTileId,
    players: rotatedPlayers,
    boneyard: Array.from({ length: pub.undealtCount }, (_, i) => ({
      id: `boneyard-${i}`,
      a: 0,
      b: 0,
    })),
    undealtCount: pub.undealtCount,
    chain: rotatedChain,
    leftEnd: pub.leftEnd,
    rightEnd: pub.rightEnd,
    consecutivePasses: pub.consecutivePasses,
    redealCount: pub.redealCount,
    scores: rotatedScores,
    scoreLabels: rotatedLabels,
    history: pub.history,
    lastHandSummary: rotatedSummary,
    matchWinnerIndex: rotatedWinnerIndex,
    matchWinnerLabel:
      rotatedWinnerIndex !== null ? rotatedLabels[rotatedWinnerIndex] : pub.matchWinnerLabel,
    sortMode,
    soundEnabled,
  };
}
