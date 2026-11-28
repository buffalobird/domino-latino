export type GameMode = '1v1' | '2v2' | '4ffa';
export type TargetScore = 50 | 100 | 150 | 200 | 250 | 300;
export type PlaySide = 'left' | 'right' | 'start';

export interface Tile {
  id: string;
  a: number;
  b: number;
}

export interface PlacedTile {
  tile: Tile;
  leftPip: number;
  rightPip: number;
  isDouble: boolean;
  playedBy: number;
  order: number;
}

export interface Player {
  seat: number;
  name: string;
  isHuman: boolean;
  userId?: string | null;
  avatarConfig?: Record<string, unknown> | null;
  teamId: number;
  hand: Tile[];
  lastAction: string | null;
}

export interface HistoryEntry {
  id: string;
  moveNumber: number;
  seat: number;
  playerName: string;
  type: 'play' | 'pass' | 'draw' | 'redeal';
  tile?: Tile;
  side?: PlaySide;
  openEndsAtPass?: [number, number];
  message: string;
}

export interface HandSummary {
  handNumber: number;
  reason: 'domino' | 'tranca' | 'tranca_tie';
  winnerSeat: number | null;
  winnerScoreIndex: number | null;
  winnerLabel: string | null;
  pointsAwarded: number;
  remainingHands: {
    seat: number;
    name: string;
    teamId: number;
    tiles: Tile[];
    pipSum: number;
    countedInScore: boolean;
  }[];
  scoresAfter: number[];
}

export interface RoomGameState {
  phase: 'playing' | 'round_summary' | 'match_over';
  mode: GameMode;
  targetScore: TargetScore;
  handNumber: number;
  currentOpenerSeat: number;
  lastOpenerSeat: number | null;
  currentTurnSeat: number;
  forcedOpeningTileId: string | null;
  players: Player[];
  boneyard: Tile[];
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
  escrowedPool?: number;
  settled?: boolean;
  lastReaction?: {
    seat: number;
    code: string;
    text: string;
    at: number;
  } | null;
}

export interface SeatAssignment {
  seat: number;
  userId: string | null;
  displayName: string;
  isBot: boolean;
  avatarConfig?: Record<string, unknown> | null;
}

function createFullDeck(): Tile[] {
  const deck: Tile[] = [];
  for (let a = 0; a <= 6; a++) {
    for (let b = a; b <= 6; b++) {
      deck.push({ id: `${a}-${b}`, a, b });
    }
  }
  return deck;
}

function shuffleDeck(deck: Tile[]): Tile[] {
  const copy = [...deck];
  const rand = new Uint32Array(copy.length);
  crypto.getRandomValues(rand);
  for (let i = copy.length - 1; i > 0; i--) {
    const j = rand[i] % (i + 1);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function isDouble(t: Tile): boolean {
  return t.a === t.b;
}

function tilePipSum(t: Tile): number {
  return t.a + t.b;
}

function handPipSum(hand: Tile[]): number {
  return hand.reduce((s, t) => s + t.a + t.b, 0);
}

function hasFourOrMoreDoubles(hands: Tile[][]): boolean {
  return hands.some((h) => h.filter(isDouble).length >= 4);
}

function getNextClockwiseSeat(seat: number, n: number): number {
  return (seat + 1) % n;
}

function getSeatToRight(seat: number, n: number): number {
  return (seat - 1 + n) % n;
}

function determineFirstHandOpener(hands: Tile[][]): { openerSeat: number; forcedTileId: string } {
  for (let s = 0; s < hands.length; s++) {
    const sixSix = hands[s].find((t) => t.a === 6 && t.b === 6);
    if (sixSix) return { openerSeat: s, forcedTileId: sixSix.id };
  }
  let bestDSeat = -1;
  let bestDVal = -1;
  let bestDId = '';
  for (let s = 0; s < hands.length; s++) {
    for (const t of hands[s]) {
      if (isDouble(t) && t.a > bestDVal) {
        bestDVal = t.a;
        bestDSeat = s;
        bestDId = t.id;
      }
    }
  }
  if (bestDSeat !== -1) return { openerSeat: bestDSeat, forcedTileId: bestDId };

  let bestSeat = 0;
  let bestTile = hands[0][0];
  for (let s = 0; s < hands.length; s++) {
    for (const t of hands[s]) {
      const sum = tilePipSum(t);
      const bSum = tilePipSum(bestTile);
      if (sum > bSum || (sum === bSum && t.b > bestTile.b)) {
        bestSeat = s;
        bestTile = t;
      }
    }
  }
  return { openerSeat: bestSeat, forcedTileId: bestTile.id };
}

function dealValidHands(numPlayers: number): { hands: Tile[][]; boneyard: Tile[]; redealCount: number } {
  let redealCount = 0;
  for (let attempt = 0; attempt < 100; attempt++) {
    const deck = shuffleDeck(createFullDeck());
    const hands: Tile[][] = [];
    for (let p = 0; p < numPlayers; p++) {
      hands.push(deck.slice(p * 7, (p + 1) * 7));
    }
    if (!hasFourOrMoreDoubles(hands)) {
      return { hands, boneyard: deck.slice(numPlayers * 7), redealCount };
    }
    redealCount++;
  }
  const deck = createFullDeck();
  const hands: Tile[][] = [];
  for (let p = 0; p < numPlayers; p++) {
    hands.push(deck.slice(p * 7, (p + 1) * 7));
  }
  return { hands, boneyard: deck.slice(numPlayers * 7), redealCount };
}

function getTeamId(mode: GameMode, seat: number): number {
  if (mode === '2v2') return seat % 2;
  return seat;
}

function getScoreLabels(mode: GameMode, seats: SeatAssignment[]): string[] {
  if (mode === '2v2') return ['Pareja 1', 'Pareja 2'];
  return seats.map((s) => s.displayName);
}

export function startOnlineMatch(
  mode: GameMode,
  targetScore: TargetScore,
  seats: SeatAssignment[],
  buyIn: number
): RoomGameState {
  const scoreLabels = getScoreLabels(mode, seats);
  const scores = Array(scoreLabels.length).fill(0);
  const base: RoomGameState = {
    phase: 'playing',
    mode,
    targetScore,
    handNumber: 0,
    currentOpenerSeat: 0,
    lastOpenerSeat: null,
    currentTurnSeat: 0,
    forcedOpeningTileId: null,
    players: seats.map((s) => ({
      seat: s.seat,
      name: s.displayName,
      isHuman: !s.isBot,
      userId: s.userId,
      avatarConfig: s.avatarConfig ?? null,
      teamId: getTeamId(mode, s.seat),
      hand: [],
      lastAction: null,
    })),
    boneyard: [],
    undealtCount: 0,
    chain: [],
    leftEnd: null,
    rightEnd: null,
    consecutivePasses: 0,
    redealCount: 0,
    scores,
    scoreLabels,
    history: [],
    lastHandSummary: null,
    matchWinnerIndex: null,
    matchWinnerLabel: null,
    buyIn,
    escrowedPool: buyIn * seats.filter((s) => !s.isBot && s.userId).length,
    settled: false,
  };
  return dealOnlineHand(base);
}

export function dealOnlineHand(state: RoomGameState): RoomGameState {
  const n = state.players.length;
  const handNumber = state.handNumber + 1;
  const { hands, boneyard, redealCount } = dealValidHands(n);

  let openerSeat: number;
  let forcedOpeningTileId: string | null = null;
  if (state.lastOpenerSeat === null) {
    const open = determineFirstHandOpener(hands);
    openerSeat = open.openerSeat;
    forcedOpeningTileId = open.forcedTileId;
  } else {
    openerSeat = getSeatToRight(state.lastOpenerSeat, n);
  }

  const players = state.players.map((p, idx) => ({
    ...p,
    hand: hands[idx],
    lastAction: null,
  }));

  const history: HistoryEntry[] = [];
  if (redealCount > 0) {
    history.push({
      id: `redeal-${handNumber}`,
      moveNumber: 0,
      seat: -1,
      playerName: 'Mesa',
      type: 'redeal',
      message: 'Mano anulada (4+ dobles). Nuevo reparto.',
    });
  }

  return {
    ...state,
    phase: 'playing',
    handNumber,
    currentOpenerSeat: openerSeat,
    lastOpenerSeat: openerSeat,
    currentTurnSeat: openerSeat,
    forcedOpeningTileId,
    players,
    boneyard,
    undealtCount: boneyard.length,
    chain: [],
    leftEnd: null,
    rightEnd: null,
    consecutivePasses: 0,
    redealCount,
    history,
    lastHandSummary: null,
  };
}

export function getLegalMoves(state: RoomGameState, seat: number): { tile: Tile; sides: PlaySide[] }[] {
  if (state.phase !== 'playing' || state.currentTurnSeat !== seat) return [];
  const player = state.players[seat];
  if (!player) return [];
  if (state.chain.length === 0) {
    if (state.forcedOpeningTileId) {
      const forced = player.hand.find((t) => t.id === state.forcedOpeningTileId);
      return forced ? [{ tile: forced, sides: ['start'] }] : [];
    }
    return player.hand.map((tile) => ({ tile, sides: ['start'] }));
  }
  const leftEnd = state.leftEnd!;
  const rightEnd = state.rightEnd!;
  const moves: { tile: Tile; sides: PlaySide[] }[] = [];
  for (const tile of player.hand) {
    const sides: PlaySide[] = [];
    if (tile.a === leftEnd || tile.b === leftEnd) sides.push('left');
    if (tile.a === rightEnd || tile.b === rightEnd) sides.push('right');
    if (sides.length > 0) moves.push({ tile, sides });
  }
  return moves;
}

function tileMatchesEnds(tile: Tile, leftEnd: number, rightEnd: number): boolean {
  return (
    tile.a === leftEnd ||
    tile.b === leftEnd ||
    tile.a === rightEnd ||
    tile.b === rightEnd
  );
}

/**
 * Returns true as soon as the board is mathematically locked (trancado):
 * no player at the table AND no tile remaining in the boneyard matches either open end.
 */
export function isOnlineBoardTrancado(state: RoomGameState): boolean {
  if (state.chain.length === 0 || state.leftEnd === null || state.rightEnd === null) {
    return false;
  }
  const { leftEnd, rightEnd } = state;
  const anyPlayerCanPlay = state.players.some((p) =>
    p.hand.some((t) => tileMatchesEnds(t, leftEnd, rightEnd))
  );
  if (anyPlayerCanPlay) return false;
  const boneyardHasPlayable = state.boneyard.some((t) =>
    tileMatchesEnds(t, leftEnd, rightEnd)
  );
  return !boneyardHasPlayable;
}

function resolveHandEnd(
  state: RoomGameState,
  trigger: 'domino' | 'tranca',
  dominoSeat: number | null
): RoomGameState {
  const sums = state.players.map((p) => handPipSum(p.hand));
  let reason: HandSummary['reason'] = trigger;
  let winnerSeat: number | null = dominoSeat;

  if (trigger === 'tranca') {
    const minSum = Math.min(...sums);
    const minSeats = state.players.filter((_, i) => sums[i] === minSum).map((p) => p.seat);
    if (minSeats.length > 1) {
      reason = 'tranca_tie';
      winnerSeat = null;
    } else {
      winnerSeat = minSeats[0];
    }
  }

  let pointsAwarded = 0;
  let winnerScoreIndex: number | null = null;
  let winnerLabel: string | null = null;

  const remainingHands = state.players.map((p, idx) => {
    const countedInScore = winnerSeat !== null && p.seat !== winnerSeat;
    if (countedInScore) pointsAwarded += sums[idx];
    return {
      seat: p.seat,
      name: p.name,
      teamId: p.teamId,
      tiles: [...p.hand],
      pipSum: sums[idx],
      countedInScore,
    };
  });

  const newScores = [...state.scores];
  if (winnerSeat !== null) {
    winnerScoreIndex = state.players[winnerSeat].teamId;
    winnerLabel = state.scoreLabels[winnerScoreIndex];
    newScores[winnerScoreIndex] += pointsAwarded;
  }

  const players = state.players.map((p) =>
    winnerSeat !== null && p.seat === winnerSeat ? { ...p, lastAction: '¡Ganó!' } : p
  );

  const summary: HandSummary = {
    handNumber: state.handNumber,
    reason,
    winnerSeat,
    winnerScoreIndex,
    winnerLabel,
    pointsAwarded,
    remainingHands,
    scoresAfter: newScores,
  };

  const reachedTarget = winnerScoreIndex !== null && newScores[winnerScoreIndex] >= state.targetScore;
  return {
    ...state,
    phase: reachedTarget ? 'match_over' : 'round_summary',
    players,
    scores: newScores,
    lastHandSummary: summary,
    matchWinnerIndex: reachedTarget ? winnerScoreIndex : null,
    matchWinnerLabel: reachedTarget ? winnerLabel : null,
  };
}

export function applyOnlinePlay(
  state: RoomGameState,
  seat: number,
  tileId: string,
  side: PlaySide
): RoomGameState {
  if (state.phase !== 'playing' || state.currentTurnSeat !== seat) {
    throw new Error('No es tu turno.');
  }
  const legal = getLegalMoves(state, seat);
  const found = legal.find((m) => m.tile.id === tileId && m.sides.includes(side));
  if (!found) throw new Error('Jugada ilegal.');

  const player = state.players[seat];
  const tile = found.tile;
  const remaining = player.hand.filter((t) => t.id !== tileId);
  const nextOrder = state.chain.length + 1;

  let newChain: PlacedTile[];
  let newLeft: number;
  let newRight: number;

  if (state.chain.length === 0) {
    newChain = [{ tile, leftPip: tile.a, rightPip: tile.b, isDouble: isDouble(tile), playedBy: seat, order: nextOrder }];
    newLeft = tile.a;
    newRight = tile.b;
  } else if (side === 'left') {
    const target = state.leftEnd!;
    const leftPip = tile.a === target ? tile.b : tile.a;
    newChain = [{ tile, leftPip, rightPip: target, isDouble: isDouble(tile), playedBy: seat, order: nextOrder }, ...state.chain];
    newLeft = leftPip;
    newRight = state.rightEnd!;
  } else {
    const target = state.rightEnd!;
    const rightPip = tile.a === target ? tile.b : tile.a;
    newChain = [...state.chain, { tile, leftPip: target, rightPip, isDouble: isDouble(tile), playedBy: seat, order: nextOrder }];
    newLeft = state.leftEnd!;
    newRight = rightPip;
  }

  const moveNumber = state.history.filter((h) => h.type !== 'redeal').length + 1;
  const entry: HistoryEntry = {
    id: `m-${state.handNumber}-${moveNumber}`,
    moveNumber,
    seat,
    playerName: player.name,
    type: 'play',
    tile,
    side,
    message: `${player.name} jugó ${tile.a}-${tile.b}`,
  };

  const didDomino = remaining.length === 0;
  const players = state.players.map((p) =>
    p.seat === seat
      ? { ...p, hand: remaining, lastAction: didDomino ? '¡Se pegó!' : `Jugó ${tile.a}-${tile.b}` }
      : p
  );

  const nextState: RoomGameState = {
    ...state,
    players,
    chain: newChain,
    leftEnd: newLeft,
    rightEnd: newRight,
    consecutivePasses: 0,
    forcedOpeningTileId: null,
    history: [...state.history, entry],
    currentTurnSeat: getNextClockwiseSeat(seat, state.players.length),
  };

  if (didDomino) {
    return resolveHandEnd(nextState, 'domino', seat);
  }
  if (isOnlineBoardTrancado(nextState)) {
    const lockedPlayers = nextState.players.map((p) =>
      p.seat === seat ? { ...p, lastAction: '¡Trancó!' } : p
    );
    return resolveHandEnd({ ...nextState, players: lockedPlayers }, 'tranca', null);
  }
  return nextState;
}

export function applyOnlineDraw(
  state: RoomGameState,
  seat: number,
  boneyardIndex?: number
): RoomGameState {
  if (state.phase !== 'playing' || state.currentTurnSeat !== seat) {
    throw new Error('No es tu turno.');
  }
  if (getLegalMoves(state, seat).length > 0) throw new Error('Tienes jugada legal.');
  if (state.boneyard.length === 0) throw new Error('Pozo vacío.');

  const idx =
    typeof boneyardIndex === 'number' && boneyardIndex >= 0 && boneyardIndex < state.boneyard.length
      ? boneyardIndex
      : 0;
  const drawn = state.boneyard[idx];
  const nextBoneyard = state.boneyard.filter((_, i) => i !== idx);
  const player = state.players[seat];
  const moveNumber = state.history.filter((h) => h.type !== 'redeal').length + 1;

  const entry: HistoryEntry = {
    id: `m-${state.handNumber}-${moveNumber}`,
    moveNumber,
    seat,
    playerName: player.name,
    type: 'draw',
    openEndsAtPass:
      state.leftEnd !== null && state.rightEnd !== null ? [state.leftEnd, state.rightEnd] : undefined,
    message: `${player.name} robó ficha del pozo`,
  };

  const nextState: RoomGameState = {
    ...state,
    players: state.players.map((p) =>
      p.seat === seat ? { ...p, hand: [...p.hand, drawn], lastAction: 'Robó ficha' } : p
    ),
    boneyard: nextBoneyard,
    undealtCount: nextBoneyard.length,
    history: [...state.history, entry],
  };

  if (nextBoneyard.length === 0 && isOnlineBoardTrancado(nextState)) {
    return resolveHandEnd(nextState, 'tranca', null);
  }
  if (nextBoneyard.length === 0 && getLegalMoves(nextState, seat).length === 0) {
    return applyOnlinePass(nextState, seat);
  }
  return nextState;
}

export function applyOnlinePass(state: RoomGameState, seat: number): RoomGameState {
  if (state.phase !== 'playing' || state.currentTurnSeat !== seat) {
    throw new Error('No es tu turno.');
  }
  if (getLegalMoves(state, seat).length > 0) throw new Error('Tienes jugada legal.');
  if (state.boneyard.length > 0) throw new Error('Debes robar del pozo.');

  const player = state.players[seat];
  const moveNumber = state.history.filter((h) => h.type !== 'redeal').length + 1;
  const openEnds: [number, number] | undefined =
    state.leftEnd !== null && state.rightEnd !== null ? [state.leftEnd, state.rightEnd] : undefined;

  const entry: HistoryEntry = {
    id: `m-${state.handNumber}-${moveNumber}`,
    moveNumber,
    seat,
    playerName: player.name,
    type: 'pass',
    openEndsAtPass: openEnds,
    message: `${player.name} pasó`,
  };

  const consecutivePasses = state.consecutivePasses + 1;
  const nextState: RoomGameState = {
    ...state,
    players: state.players.map((p) =>
      p.seat === seat ? { ...p, lastAction: '¡Pasó!' } : p
    ),
    consecutivePasses,
    history: [...state.history, entry],
    currentTurnSeat: getNextClockwiseSeat(seat, state.players.length),
  };

  return consecutivePasses >= state.players.length || isOnlineBoardTrancado(nextState)
    ? resolveHandEnd(nextState, 'tranca', null)
    : nextState;
}

export function applyTimeoutAutoMove(initial: RoomGameState): RoomGameState {
  let state = initial;
  const seat = state.currentTurnSeat;
  let safety = 0;

  while (state.phase === 'playing' && state.currentTurnSeat === seat && safety < 20) {
    const legal = getLegalMoves(state, seat);
    if (legal.length > 0) {
      return applyOnlinePlay(state, seat, legal[0].tile.id, legal[0].sides[0]);
    }
    if (state.boneyard.length > 0) {
      state = applyOnlineDraw(state, seat);
    } else {
      return applyOnlinePass(state, seat);
    }
    safety++;
  }
  return state;
}

export function runBotTurnsUntilHuman(initial: RoomGameState): RoomGameState {
  let state = initial;
  let safety = 0;
  while (state.phase === 'playing' && safety < 40) {
    const seat = state.currentTurnSeat;
    const player = state.players[seat];
    if (!player || player.isHuman) break;

    const legal = getLegalMoves(state, seat);
    if (legal.length === 0) {
      if (state.boneyard.length > 0) {
        state = applyOnlineDraw(state, seat);
      } else {
        state = applyOnlinePass(state, seat);
      }
    } else {
      let best = legal[0];
      let bestVal = -1;
      for (const m of legal) {
        const val = tilePipSum(m.tile) + (isDouble(m.tile) ? 5 : 0);
        if (val > bestVal) {
          bestVal = val;
          best = m;
        }
      }
      state = applyOnlinePlay(state, seat, best.tile.id, best.sides[0]);
    }
    safety++;
  }
  return state;
}

export function buildSanitizedPublicState(state: RoomGameState) {
  return {
    phase: state.phase,
    mode: state.mode,
    targetScore: state.targetScore,
    handNumber: state.handNumber,
    currentOpenerSeat: state.currentOpenerSeat,
    currentTurnSeat: state.currentTurnSeat,
    forcedOpeningTileId: state.forcedOpeningTileId,
    undealtCount: state.boneyard.length,
    chain: state.chain,
    leftEnd: state.leftEnd,
    rightEnd: state.rightEnd,
    consecutivePasses: state.consecutivePasses,
    redealCount: state.redealCount,
    scores: state.scores,
    scoreLabels: state.scoreLabels,
    history: state.history,
    lastHandSummary: state.lastHandSummary,
    matchWinnerIndex: state.matchWinnerIndex,
    matchWinnerLabel: state.matchWinnerLabel,
    buyIn: state.buyIn,
    lastReaction: state.lastReaction ?? null,
    players: state.players.map((p) => ({
      seat: p.seat,
      name: p.name,
      isHuman: p.isHuman,
      userId: p.userId ?? null,
      avatarConfig: p.avatarConfig ?? null,
      teamId: p.teamId,
      tileCount: p.hand.length,
      lastAction: p.lastAction,
    })),
  };
}
