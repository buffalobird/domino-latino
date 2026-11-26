export type GameMode = '1v1' | '2v2' | '4ffa';

export type TargetScore = 50 | 100 | 150 | 200 | 250 | 300;

export const TARGET_SCORES: TargetScore[] = [50, 100, 150, 200, 250, 300];

export type PlaySide = 'left' | 'right' | 'start';

export type SortMode = 'value' | 'doubles';

export interface Tile {
  id: string;
  a: number; // 0..6, always a <= b
  b: number; // 0..6
}

export interface PlacedTile {
  tile: Tile;
  /** Pip value facing toward the left/start end of the chain */
  leftPip: number;
  /** Pip value facing toward the right/end of the chain */
  rightPip: number;
  isDouble: boolean;
  playedBy: number;
  order: number;
}

export interface Player {
  seat: number;
  name: string;
  isHuman: boolean;
  /** In 2v2: 0 = Nosotros (seats 0 & 2), 1 = Rivales (seats 1 & 3). In 1v1/4ffa: equals seat. */
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
  /** Open ends at the moment of a pass or draw (useful for fair AI inference & display) */
  openEndsAtPass?: [number, number];
  message: string;
}

export type HandEndReason = 'domino' | 'tranca' | 'tranca_tie';

export interface HandSummary {
  handNumber: number;
  reason: HandEndReason;
  /** Seat that closed or won the tranca (null on tranca_tie) */
  winnerSeat: number | null;
  /** Team/player score index that earned points (null on tranca_tie) */
  winnerScoreIndex: number | null;
  winnerLabel: string | null;
  pointsAwarded: number;
  /** Remaining hands of every player at hand end (visible for verification) */
  remainingHands: {
    seat: number;
    name: string;
    teamId: number;
    tiles: Tile[];
    pipSum: number;
    countedInScore: boolean;
  }[];
  /** Cumulative scores after this hand */
  scoresAfter: number[];
}

export type GamePhase = 'setup' | 'playing' | 'round_summary' | 'match_over';

export interface GameState {
  version: number;
  phase: GamePhase;
  mode: GameMode;
  targetScore: TargetScore;
  handNumber: number;
  /** Seat index that opened the current hand */
  currentOpenerSeat: number;
  /** Seat index that opened the previous hand (null before hand 1) */
  lastOpenerSeat: number | null;
  /** Seat index whose turn it currently is */
  currentTurnSeat: number;
  /** Forced opening tile ID on hand 1 (6-6, or highest double/sum in 1v1) */
  forcedOpeningTileId: string | null;
  players: Player[];
  /** Face-down boneyard ("pozo") tiles available to draw when a player has no legal move (14 initially in 1v1, 0 in 2v2/4ffa). Never scored, never visible to AI. */
  boneyard: Tile[];
  /** Convenience count of remaining boneyard tiles */
  undealtCount: number;
  chain: PlacedTile[];
  leftEnd: number | null;
  rightEnd: number | null;
  consecutivePasses: number;
  /** Number of automatic redeals triggered by 4+ doubles on this hand */
  redealCount: number;
  /** Scores indexed by teamId (2 entries in 1v1 and 2v2; 4 entries in 4ffa) */
  scores: number[];
  scoreLabels: string[];
  history: HistoryEntry[];
  lastHandSummary: HandSummary | null;
  matchWinnerIndex: number | null;
  matchWinnerLabel: string | null;
  sortMode: SortMode;
  soundEnabled: boolean;
}

export interface LegalMove {
  tile: Tile;
  sides: PlaySide[];
}

/**
 * Strictly fair view passed to the computer AI.
 * Contains ONLY public table information + the AI player's own hand.
 * Never includes other players' hands or boneyard tile identities.
 */
export interface AiPublicView {
  mySeat: number;
  myTeamId: number;
  myHand: Tile[];
  mode: GameMode;
  numPlayers: number;
  chain: PlacedTile[];
  leftEnd: number | null;
  rightEnd: number | null;
  boneyardCount: number;
  history: HistoryEntry[];
  tileCounts: number[];
  forcedOpeningTileId: string | null;
}

export interface AiDecision {
  tile: Tile;
  side: PlaySide;
}
