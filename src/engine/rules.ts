import {
  AiPublicView,
  GameMode,
  GameState,
  HandSummary,
  HistoryEntry,
  LegalMove,
  PlacedTile,
  Player,
  PlaySide,
  SortMode,
  TargetScore,
  Tile,
} from './types';

export const ENGINE_STATE_VERSION = 2;

/** Generate the standard 28 double-six domino tiles (0-0 through 6-6). */
export function createFullDeck(): Tile[] {
  const deck: Tile[] = [];
  for (let a = 0; a <= 6; a++) {
    for (let b = a; b <= 6; b++) {
      deck.push({ id: `${a}-${b}`, a, b });
    }
  }
  return deck;
}

/** Fisher-Yates shuffle returning a new array. Accepts optional RNG for deterministic tests. */
export function shuffleDeck(deck: Tile[], rng: () => number = Math.random): Tile[] {
  const copy = [...deck];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function isDouble(tile: Tile): boolean {
  return tile.a === tile.b;
}

export function tilePipSum(tile: Tile): number {
  return tile.a + tile.b;
}

export function handPipSum(hand: Tile[]): number {
  return hand.reduce((sum, t) => sum + t.a + t.b, 0);
}

export function countDoubles(hand: Tile[]): number {
  return hand.reduce((count, t) => count + (isDouble(t) ? 1 : 0), 0);
}

export function hasFourOrMoreDoubles(hands: Tile[][]): boolean {
  return hands.some((h) => countDoubles(h) >= 4);
}

export function getPlayerCount(mode: GameMode): number {
  return mode === '1v1' ? 2 : 4;
}

/**
 * Clockwise next seat:
 * Table layout: 0 = Bottom (Tú), 1 = Left, 2 = Top, 3 = Right.
 * Clockwise: 0 -> 1 -> 2 -> 3 -> 0.
 */
export function getNextClockwiseSeat(seat: number, numPlayers: number): number {
  return (seat + 1) % numPlayers;
}

/**
 * Seat to the right of `seat` (facing the center of the table):
 * 0 (Bottom) -> right is 3 (Right)
 * 3 (Right)  -> right is 2 (Top)
 * 2 (Top)    -> right is 1 (Left)
 * 1 (Left)   -> right is 0 (Bottom)
 * In 1v1 (2 players): alternates 0 <-> 1.
 */
export function getSeatToRight(seat: number, numPlayers: number): number {
  return (seat - 1 + numPlayers) % numPlayers;
}

export function getScoreConfig(mode: GameMode): { labels: string[]; count: number } {
  if (mode === '1v1') {
    return { labels: ['Tú', 'CPU'], count: 2 };
  }
  if (mode === '2v2') {
    return { labels: ['Nosotros', 'Rivales'], count: 2 };
  }
  return { labels: ['Tú', 'CPU 1', 'CPU 2', 'CPU 3'], count: 4 };
}

export function buildPlayersSkeleton(mode: GameMode): Player[] {
  if (mode === '1v1') {
    return [
      { seat: 0, name: 'Tú', isHuman: true, teamId: 0, hand: [], lastAction: null },
      { seat: 1, name: 'CPU', isHuman: false, teamId: 1, hand: [], lastAction: null },
    ];
  }
  if (mode === '2v2') {
    return [
      { seat: 0, name: 'Tú', isHuman: true, teamId: 0, hand: [], lastAction: null },
      { seat: 1, name: 'CPU Oeste', isHuman: false, teamId: 1, hand: [], lastAction: null },
      { seat: 2, name: 'Compañero', isHuman: false, teamId: 0, hand: [], lastAction: null },
      { seat: 3, name: 'CPU Este', isHuman: false, teamId: 1, hand: [], lastAction: null },
    ];
  }
  return [
    { seat: 0, name: 'Tú', isHuman: true, teamId: 0, hand: [], lastAction: null },
    { seat: 1, name: 'CPU 1', isHuman: false, teamId: 1, hand: [], lastAction: null },
    { seat: 2, name: 'CPU 2', isHuman: false, teamId: 2, hand: [], lastAction: null },
    { seat: 3, name: 'CPU 3', isHuman: false, teamId: 3, hand: [], lastAction: null },
  ];
}

/**
 * Determine who opens Hand 1 and which tile they MUST play.
 * - Mandatory 6-6 if anyone holds it.
 * - In 1v1, if neither holds 6-6: highest double (5-5 down to 0-0).
 * - If nobody has any double: tile with highest pip sum (tiebreaker: highest max pip).
 */
export function determineFirstHandOpener(hands: Tile[][]): {
  openerSeat: number;
  forcedTileId: string;
} {
  for (let seat = 0; seat < hands.length; seat++) {
    const sixSix = hands[seat].find((t) => t.a === 6 && t.b === 6);
    if (sixSix) {
      return { openerSeat: seat, forcedTileId: sixSix.id };
    }
  }

  let bestDoubleSeat = -1;
  let bestDoubleVal = -1;
  let bestDoubleId = '';
  for (let seat = 0; seat < hands.length; seat++) {
    for (const tile of hands[seat]) {
      if (isDouble(tile) && tile.a > bestDoubleVal) {
        bestDoubleVal = tile.a;
        bestDoubleSeat = seat;
        bestDoubleId = tile.id;
      }
    }
  }
  if (bestDoubleSeat !== -1) {
    return { openerSeat: bestDoubleSeat, forcedTileId: bestDoubleId };
  }

  let bestSeat = 0;
  let bestTile = hands[0][0];
  for (let seat = 0; seat < hands.length; seat++) {
    for (const tile of hands[seat]) {
      const sum = tilePipSum(tile);
      const bestSum = tilePipSum(bestTile);
      if (sum > bestSum || (sum === bestSum && tile.b > bestTile.b)) {
        bestSeat = seat;
        bestTile = tile;
      }
    }
  }

  return { openerSeat: bestSeat, forcedTileId: bestTile.id };
}

/**
 * Deal 7 tiles to each player, putting remaining tiles in the face-down boneyard.
 * Automatically redeals if ANY player receives 4+ doubles.
 */
export function dealValidHands(
  numPlayers: number,
  rng: () => number = Math.random
): { hands: Tile[][]; boneyard: Tile[]; undealtCount: number; redealCount: number } {
  let redealCount = 0;
  const maxAttempts = 100;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const deck = shuffleDeck(createFullDeck(), rng);
    const hands: Tile[][] = [];
    for (let p = 0; p < numPlayers; p++) {
      hands.push(deck.slice(p * 7, (p + 1) * 7));
    }
    if (!hasFourOrMoreDoubles(hands)) {
      const boneyard = deck.slice(numPlayers * 7);
      return {
        hands,
        boneyard,
        undealtCount: boneyard.length,
        redealCount,
      };
    }
    redealCount++;
  }

  const deck = createFullDeck();
  const hands: Tile[][] = [];
  for (let p = 0; p < numPlayers; p++) {
    hands.push(deck.slice(p * 7, (p + 1) * 7));
  }
  const boneyard = deck.slice(numPlayers * 7);
  return { hands, boneyard, undealtCount: boneyard.length, redealCount };
}

export function sortHand(hand: Tile[], sortMode: SortMode): Tile[] {
  const copy = [...hand];
  if (sortMode === 'doubles') {
    return copy.sort((x, y) => {
      const xd = isDouble(x) ? 1 : 0;
      const yd = isDouble(y) ? 1 : 0;
      if (xd !== yd) return yd - xd;
      const sumDiff = tilePipSum(y) - tilePipSum(x);
      if (sumDiff !== 0) return sumDiff;
      return y.b - x.b;
    });
  }
  return copy.sort((x, y) => {
    const sumDiff = tilePipSum(x) - tilePipSum(y);
    if (sumDiff !== 0) return sumDiff;
    if (x.b !== y.b) return x.b - y.b;
    return x.a - y.a;
  });
}

export function createInitialSetupState(
  mode: GameMode = '1v1',
  targetScore: TargetScore = 100,
  sortMode: SortMode = 'value',
  soundEnabled = false
): GameState {
  const scoreCfg = getScoreConfig(mode);
  return {
    version: ENGINE_STATE_VERSION,
    phase: 'setup',
    mode,
    targetScore,
    handNumber: 0,
    currentOpenerSeat: 0,
    lastOpenerSeat: null,
    currentTurnSeat: 0,
    forcedOpeningTileId: null,
    players: buildPlayersSkeleton(mode),
    boneyard: [],
    undealtCount: mode === '1v1' ? 14 : 0,
    chain: [],
    leftEnd: null,
    rightEnd: null,
    consecutivePasses: 0,
    redealCount: 0,
    scores: Array(scoreCfg.count).fill(0),
    scoreLabels: scoreCfg.labels,
    history: [],
    lastHandSummary: null,
    matchWinnerIndex: null,
    matchWinnerLabel: null,
    sortMode,
    soundEnabled,
  };
}

export function startNewMatch(
  mode: GameMode,
  targetScore: TargetScore,
  sortMode: SortMode = 'value',
  soundEnabled = false,
  rng: () => number = Math.random
): GameState {
  const base = createInitialSetupState(mode, targetScore, sortMode, soundEnabled);
  return dealNextHand(base, rng);
}

export function dealNextHand(
  state: GameState,
  rng: () => number = Math.random,
  customHands?: Tile[][],
  customBoneyard?: Tile[]
): GameState {
  const numPlayers = getPlayerCount(state.mode);
  const handNumber = state.handNumber + 1;

  let hands: Tile[][];
  let boneyard: Tile[];
  let redealCount: number;

  if (customHands) {
    hands = customHands.map((h) => [...h]);
    boneyard = customBoneyard ? [...customBoneyard] : [];
    redealCount = 0;
  } else {
    const dealt = dealValidHands(numPlayers, rng);
    hands = dealt.hands;
    boneyard = dealt.boneyard;
    redealCount = dealt.redealCount;
  }

  let openerSeat: number;
  let forcedOpeningTileId: string | null = null;

  if (state.lastOpenerSeat === null) {
    const opening = determineFirstHandOpener(hands);
    openerSeat = opening.openerSeat;
    forcedOpeningTileId = opening.forcedTileId;
  } else {
    openerSeat = getSeatToRight(state.lastOpenerSeat, numPlayers);
    forcedOpeningTileId = null;
  }

  const players = buildPlayersSkeleton(state.mode).map((p, idx) => ({
    ...p,
    hand: p.isHuman ? sortHand(hands[idx], state.sortMode) : hands[idx],
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
      message:
        redealCount === 1
          ? 'Mano anulada (4+ dobles). Se repartió de nuevo.'
          : `Mano anulada ${redealCount} veces (4+ dobles). Se repartió de nuevo.`,
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

export function getLegalMovesForSeat(state: GameState, seat: number): LegalMove[] {
  if (state.phase !== 'playing' || state.currentTurnSeat !== seat) {
    return [];
  }
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
  const moves: LegalMove[] = [];

  for (const tile of player.hand) {
    const sides: PlaySide[] = [];
    if (tile.a === leftEnd || tile.b === leftEnd) {
      sides.push('left');
    }
    if (tile.a === rightEnd || tile.b === rightEnd) {
      sides.push('right');
    }
    if (sides.length > 0) {
      moves.push({ tile, sides });
    }
  }

  return moves;
}

export function canDrawFromBoneyard(state: GameState, seat: number): boolean {
  if (state.phase !== 'playing' || state.currentTurnSeat !== seat) return false;
  if (state.boneyard.length === 0) return false;
  return getLegalMovesForSeat(state, seat).length === 0;
}

export function canPlayTileOnSide(
  state: GameState,
  seat: number,
  tileId: string,
  side: PlaySide
): boolean {
  const moves = getLegalMovesForSeat(state, seat);
  const move = moves.find((m) => m.tile.id === tileId);
  return Boolean(move && move.sides.includes(side));
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
export function isBoardTrancado(
  state: Pick<GameState, 'chain' | 'leftEnd' | 'rightEnd' | 'players' | 'boneyard'>
): boolean {
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

/**
 * Draw a tile from the boneyard ("pozo") when the current player has 0 legal moves.
 * Optional `boneyardIndex` lets the human pick a specific face-down tile from the drawer.
 * If drawing empties the boneyard and the player STILL has no legal move, automatically passes turn.
 */
export function applyDraw(
  state: GameState,
  seat: number,
  boneyardIndex?: number
): GameState {
  if (state.phase !== 'playing') {
    throw new Error('No se puede recoger fuera de una mano activa.');
  }
  if (state.currentTurnSeat !== seat) {
    throw new Error('No es el turno de este jugador.');
  }
  if (getLegalMovesForSeat(state, seat).length > 0) {
    throw new Error('No se puede recoger teniendo una jugada legal.');
  }
  if (state.boneyard.length === 0) {
    throw new Error('No quedan fichas en el pozo.');
  }

  const idx =
    typeof boneyardIndex === 'number' &&
    boneyardIndex >= 0 &&
    boneyardIndex < state.boneyard.length
      ? boneyardIndex
      : 0;

  const drawnTile = state.boneyard[idx];
  const nextBoneyard = state.boneyard.filter((_, i) => i !== idx);
  const player = state.players[seat];
  const nextHand = player.isHuman
    ? sortHand([...player.hand, drawnTile], state.sortMode)
    : [...player.hand, drawnTile];

  const moveNumber = state.history.filter((h) => h.type !== 'redeal').length + 1;
  const openEnds: [number, number] | undefined =
    state.leftEnd !== null && state.rightEnd !== null
      ? [state.leftEnd, state.rightEnd]
      : undefined;

  const entry: HistoryEntry = {
    id: `m-${state.handNumber}-${moveNumber}`,
    moveNumber,
    seat,
    playerName: player.name,
    type: 'draw',
    openEndsAtPass: openEnds,
    message: `${player.name} robó ficha del pozo`,
  };

  const updatedPlayers = state.players.map((p) =>
    p.seat === seat ? { ...p, hand: nextHand, lastAction: 'Robó ficha' } : p
  );

  const nextState: GameState = {
    ...state,
    players: updatedPlayers,
    boneyard: nextBoneyard,
    undealtCount: nextBoneyard.length,
    history: [...state.history, entry],
  };

  // If the boneyard is now empty and nobody can play, declare tranca immediately
  if (nextBoneyard.length === 0 && isBoardTrancado(nextState)) {
    return resolveHandEnd(nextState, 'tranca', null);
  }

  // If the boneyard is now empty and the player STILL has no legal moves, automatically pass
  if (nextBoneyard.length === 0 && getLegalMovesForSeat(nextState, seat).length === 0) {
    return applyPass(nextState, seat);
  }

  return nextState;
}

export function applyPlay(
  state: GameState,
  seat: number,
  tileId: string,
  side: PlaySide
): GameState {
  if (state.phase !== 'playing') {
    throw new Error('No se puede jugar fuera de una mano activa.');
  }
  if (state.currentTurnSeat !== seat) {
    throw new Error('No es el turno de este jugador.');
  }
  if (!canPlayTileOnSide(state, seat, tileId, side)) {
    throw new Error('Jugada ilegal para esta ficha o extremo.');
  }

  const player = state.players[seat];
  const tile = player.hand.find((t) => t.id === tileId)!;
  const remainingHand = player.hand.filter((t) => t.id !== tileId);
  const nextOrder = state.chain.length + 1;

  let newChain: PlacedTile[];
  let newLeftEnd: number;
  let newRightEnd: number;

  if (state.chain.length === 0) {
    const placed: PlacedTile = {
      tile,
      leftPip: tile.a,
      rightPip: tile.b,
      isDouble: isDouble(tile),
      playedBy: seat,
      order: nextOrder,
    };
    newChain = [placed];
    newLeftEnd = tile.a;
    newRightEnd = tile.b;
  } else if (side === 'left') {
    const target = state.leftEnd!;
    const rightPip = target;
    const leftPip = tile.a === target ? tile.b : tile.a;
    const placed: PlacedTile = {
      tile,
      leftPip,
      rightPip,
      isDouble: isDouble(tile),
      playedBy: seat,
      order: nextOrder,
    };
    newChain = [placed, ...state.chain];
    newLeftEnd = leftPip;
    newRightEnd = state.rightEnd!;
  } else {
    const target = state.rightEnd!;
    const leftPip = target;
    const rightPip = tile.a === target ? tile.b : tile.a;
    const placed: PlacedTile = {
      tile,
      leftPip,
      rightPip,
      isDouble: isDouble(tile),
      playedBy: seat,
      order: nextOrder,
    };
    newChain = [...state.chain, placed];
    newLeftEnd = state.leftEnd!;
    newRightEnd = rightPip;
  }

  const moveNumber = state.history.filter((h) => h.type !== 'redeal').length + 1;
  const sideLabel =
    side === 'start' ? 'salida' : side === 'left' ? 'izquierda' : 'derecha';
  const entry: HistoryEntry = {
    id: `m-${state.handNumber}-${moveNumber}`,
    moveNumber,
    seat,
    playerName: player.name,
    type: 'play',
    tile,
    side,
    message: `${player.name} jugó ${tile.a}-${tile.b} (${sideLabel})`,
  };

  const didDomino = remainingHand.length === 0;
  const updatedPlayers = state.players.map((p) => {
    if (p.seat === seat) {
      return {
        ...p,
        hand: remainingHand,
        lastAction: didDomino ? '¡Se pegó!' : `Jugó ${tile.a}-${tile.b}`,
      };
    }
    return p;
  });

  const nextState: GameState = {
    ...state,
    players: updatedPlayers,
    chain: newChain,
    leftEnd: newLeftEnd,
    rightEnd: newRightEnd,
    consecutivePasses: 0,
    forcedOpeningTileId: null,
    history: [...state.history, entry],
    currentTurnSeat: getNextClockwiseSeat(seat, state.players.length),
  };

  if (didDomino) {
    return resolveHandEnd(nextState, 'domino', seat);
  }

  if (isBoardTrancado(nextState)) {
    const lockedPlayers = nextState.players.map((p) =>
      p.seat === seat ? { ...p, lastAction: '¡Trancó!' } : p
    );
    return resolveHandEnd({ ...nextState, players: lockedPlayers }, 'tranca', null);
  }

  return nextState;
}

/**
 * Declare a pass ("paso") for the current player.
 * Throws if the player has a legal move, can still draw from the boneyard, or is out of turn.
 */
export function applyPass(state: GameState, seat: number): GameState {
  if (state.phase !== 'playing') {
    throw new Error('No se puede pasar fuera de una mano activa.');
  }
  if (state.currentTurnSeat !== seat) {
    throw new Error('No es el turno de este jugador.');
  }
  const legalMoves = getLegalMovesForSeat(state, seat);
  if (legalMoves.length > 0) {
    throw new Error('No se puede pasar teniendo una jugada legal.');
  }
  if (state.boneyard.length > 0) {
    throw new Error('Debes recoger del pozo antes de pasar.');
  }

  const player = state.players[seat];
  const moveNumber = state.history.filter((h) => h.type !== 'redeal').length + 1;
  const openEnds: [number, number] | undefined =
    state.leftEnd !== null && state.rightEnd !== null
      ? [state.leftEnd, state.rightEnd]
      : undefined;

  const entry: HistoryEntry = {
    id: `m-${state.handNumber}-${moveNumber}`,
    moveNumber,
    seat,
    playerName: player.name,
    type: 'pass',
    openEndsAtPass: openEnds,
    message: openEnds
      ? `${player.name} pasó (extremos ${openEnds[0]} y ${openEnds[1]})`
      : `${player.name} pasó`,
  };

  const consecutivePasses = state.consecutivePasses + 1;
  const updatedPlayers = state.players.map((p) =>
    p.seat === seat ? { ...p, lastAction: '¡Pasó!' } : p
  );

  const nextState: GameState = {
    ...state,
    players: updatedPlayers,
    consecutivePasses,
    history: [...state.history, entry],
    currentTurnSeat: getNextClockwiseSeat(seat, state.players.length),
  };

  if (consecutivePasses >= state.players.length || isBoardTrancado(nextState)) {
    return resolveHandEnd(nextState, 'tranca', null);
  }

  return nextState;
}

function resolveHandEnd(
  state: GameState,
  trigger: 'domino' | 'tranca',
  dominoSeat: number | null
): GameState {
  const playerSums = state.players.map((p) => handPipSum(p.hand));

  let reason: HandSummary['reason'] = trigger;
  let winnerSeat: number | null = dominoSeat;

  if (trigger === 'tranca') {
    const minSum = Math.min(...playerSums);
    const minSeats = state.players
      .filter((_, idx) => playerSums[idx] === minSum)
      .map((p) => p.seat);

    if (minSeats.length > 1) {
      reason = 'tranca_tie';
      winnerSeat = null;
    } else {
      reason = 'tranca';
      winnerSeat = minSeats[0];
    }
  }

  let pointsAwarded = 0;
  let winnerScoreIndex: number | null = null;
  let winnerLabel: string | null = null;

  const remainingHands = state.players.map((p, idx) => {
    const countedInScore = winnerSeat !== null && p.seat !== winnerSeat;
    if (countedInScore) {
      pointsAwarded += playerSums[idx];
    }
    return {
      seat: p.seat,
      name: p.name,
      teamId: p.teamId,
      tiles: [...p.hand],
      pipSum: playerSums[idx],
      countedInScore,
    };
  });

  const newScores = [...state.scores];
  if (winnerSeat !== null) {
    const winnerPlayer = state.players[winnerSeat];
    winnerScoreIndex = winnerPlayer.teamId;
    winnerLabel = state.scoreLabels[winnerScoreIndex];
    newScores[winnerScoreIndex] += pointsAwarded;
  }

  const updatedPlayers = state.players.map((p) => {
    if (winnerSeat !== null && p.seat === winnerSeat) {
      return { ...p, lastAction: '¡Ganó!' };
    }
    return p;
  });

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

  const reachedTarget =
    winnerScoreIndex !== null && newScores[winnerScoreIndex] >= state.targetScore;

  return {
    ...state,
    phase: reachedTarget ? 'match_over' : 'round_summary',
    players: updatedPlayers,
    scores: newScores,
    lastHandSummary: summary,
    matchWinnerIndex: reachedTarget ? winnerScoreIndex : null,
    matchWinnerLabel: reachedTarget ? winnerLabel : null,
  };
}

/**
 * Construct the strictly fair public view for an AI seat.
 * Does NOT expose other players' hands or boneyard tile identities.
 */
export function buildAiPublicView(state: GameState, seat: number): AiPublicView {
  const player = state.players[seat];
  return {
    mySeat: seat,
    myTeamId: player.teamId,
    myHand: [...player.hand],
    mode: state.mode,
    numPlayers: state.players.length,
    chain: [...state.chain],
    leftEnd: state.leftEnd,
    rightEnd: state.rightEnd,
    boneyardCount: state.boneyard.length,
    history: [...state.history],
    tileCounts: state.players.map((p) => p.hand.length),
    forcedOpeningTileId: state.forcedOpeningTileId,
  };
}

export function isValidPersistedState(raw: unknown): raw is GameState {
  if (!raw || typeof raw !== 'object') return false;
  const s = raw as Partial<GameState>;
  if (s.version !== ENGINE_STATE_VERSION) return false;
  if (!['setup', 'playing', 'round_summary', 'match_over'].includes(String(s.phase))) {
    return false;
  }
  if (!['1v1', '2v2', '4ffa'].includes(String(s.mode))) return false;
  if (
    !Array.isArray(s.players) ||
    !Array.isArray(s.scores) ||
    !Array.isArray(s.chain) ||
    !Array.isArray(s.boneyard)
  ) {
    return false;
  }
  const expectedPlayers = getPlayerCount(s.mode as GameMode);
  if (s.players.length !== expectedPlayers) return false;
  if (
    typeof s.currentTurnSeat !== 'number' ||
    s.currentTurnSeat < 0 ||
    s.currentTurnSeat >= expectedPlayers
  ) {
    return false;
  }
  return true;
}
