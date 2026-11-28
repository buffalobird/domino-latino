/**
 * Curated warm table reactions ("Sobremesa") + psychologically grounded Bot companionship.
 * Zero toxic free-text chat — timely, earned, readable comments that never spam or clip.
 */

export type TableReactionCode =
  | 'hola'
  | 'buena'
  | 'uff'
  | 'tranca'
  | 'compa'
  | 'buen_juego';

export interface TableReactionItem {
  code: TableReactionCode;
  label: string;
  shortLabel: string;
}

export const TABLE_REACTIONS: TableReactionItem[] = [
  { code: 'hola', label: '¡Hola!', shortLabel: 'Hola' },
  { code: 'buena', label: '¡Buena jugada!', shortLabel: 'Buena' },
  { code: 'uff', label: '¡Uff, por poco!', shortLabel: 'Uff' },
  { code: 'tranca', label: '¡Se trancó!', shortLabel: 'Tranca' },
  { code: 'compa', label: '¡Bien, compa!', shortLabel: 'Compa' },
  { code: 'buen_juego', label: '¡Buen juego!', shortLabel: 'Gracias' },
];

export const REACTION_BY_CODE: Record<TableReactionCode, TableReactionItem> =
  TABLE_REACTIONS.reduce((acc, item) => {
    acc[item.code] = item;
    return acc;
  }, {} as Record<TableReactionCode, TableReactionItem>);

/** Warm, time-of-day host greeting for Home (never robotic) */
export function getWarmHostGreeting(displayName?: string | null): {
  greeting: string;
  inviteLine: string;
} {
  const hour = new Date().getHours();
  const base =
    hour >= 5 && hour < 12
      ? 'Buenos días'
      : hour >= 12 && hour < 19
      ? 'Buenas tardes'
      : 'Buenas noches';

  const firstName = displayName
    ? displayName.trim().split(/\s+/)[0]?.slice(0, 16)
    : null;
  const greeting =
    firstName && firstName.toLowerCase() !== 'jugador'
      ? `${base}, ${firstName}`
      : base;

  const inviteLine =
    hour >= 5 && hour < 12
      ? 'Un cafecito y una mano de dominó'
      : hour >= 12 && hour < 19
      ? 'La mesa está servida, ¿echamos una?'
      : 'Buena compañía para cerrar el día';

  return { greeting, inviteLine };
}

export type BotMoment =
  | 'human_caused_pass'
  | 'human_one_tile'
  | 'human_double'
  | 'human_pass'
  | 'bot_double'
  | 'partner_good_play';

/**
 * Every phrase is intentionally <= 22 characters so it reads in <0.8s at a glance
 * and NEVER clips or ellipsizes on compact phone screens.
 */
const PARTNER_PHRASES: Record<BotMoment, string[]> = {
  human_caused_pass: ['¡Eso es, compa!', '¡Buen pase le diste!', '¡Así se aprieta!'],
  human_one_tile: ['¡Ya casi, compa!', '¡A una ficha, vamos!'],
  human_double: ['¡Buen doble, compa!', '¡Bien bajado!'],
  human_pass: ['Tranquilo, yo cubro', 'Sin pena, seguimos'],
  bot_double: ['¡Ahí va doble!', '¡Doble en mesa!'],
  partner_good_play: ['¡Buena jugada, compa!', '¡Buen ritmo!'],
};

const RIVAL_PHRASES: Record<BotMoment, string[]> = {
  human_caused_pass: ['¡Me dejaste fuera!', '¡Uff, no tengo!', '¡Buena esa!'],
  human_one_tile: ['¡A una ficha!', '¡Ojo que pega!'],
  human_double: ['¡Doble fuerte!', '¡Bien jugado!'],
  human_pass: ['¡Se puso apretado!', '¡A cuidar puntos!'],
  bot_double: ['¡Doble en mesa!', '¡Ahí va esa!'],
  partner_good_play: ['¡Bien jugado!', '¡Buen toque!'],
};

/** Minimum board chain length before each spontaneous moment feels earned (never on move 1-2) */
export const BOT_MOMENT_MIN_CHAIN: Record<BotMoment, number> = {
  human_caused_pass: 3,
  human_one_tile: 4,
  human_double: 4,
  human_pass: 3,
  bot_double: 5,
  partner_good_play: 3,
};

export interface BotPacingMemory {
  handNumber: number;
  commentsInHand: number;
  lastCommentMoveCount: number;
  lastCommentAtMs: number;
  lastPhrase: string | null;
}

export function createBotPacingMemory(handNumber = 0): BotPacingMemory {
  return {
    handNumber,
    commentsInHand: 0,
    lastCommentMoveCount: -10,
    lastCommentAtMs: 0,
    lastPhrase: null,
  };
}

/**
 * Evaluates whether a spontaneous Bot comment is timely, earned, and non-repetitive.
 * Enforces:
 * - Minimum turn threshold per moment (zero fake praise on opening 6-6 / turns 1-2)
 * - Max 3 spontaneous comments per hand (scarcity = warmth & authenticity)
 * - At least 3 moves AND 9 seconds between spontaneous comments (urgent endgame exception: 5s / 2 moves)
 * - Never repeats the exact same phrase back-to-back
 */
export function tryPickTimedBotPhrase(params: {
  moment: BotMoment;
  isPartner: boolean;
  chainLength: number;
  moveCount: number;
  chance: number;
  memory: BotPacingMemory;
  nowMs?: number;
  urgent?: boolean;
}): string | null {
  const {
    moment,
    isPartner,
    chainLength,
    moveCount,
    chance,
    memory,
    nowMs = Date.now(),
    urgent = false,
  } = params;

  if (chainLength < BOT_MOMENT_MIN_CHAIN[moment]) return null;
  if (memory.commentsInHand >= 3) return null;

  const minMovesGap = urgent ? 2 : 3;
  const minTimeMs = urgent ? 5000 : 9000;
  if (moveCount - memory.lastCommentMoveCount < minMovesGap) return null;
  if (memory.lastCommentAtMs > 0 && nowMs - memory.lastCommentAtMs < minTimeMs) return null;

  if (Math.random() > chance) return null;

  const pool = isPartner ? PARTNER_PHRASES[moment] : RIVAL_PHRASES[moment];
  if (!pool || pool.length === 0) return null;

  const filtered = pool.filter((p) => p !== memory.lastPhrase);
  const candidates = filtered.length > 0 ? filtered : pool;
  const picked = candidates[Math.floor(Math.random() * candidates.length)];

  memory.commentsInHand += 1;
  memory.lastCommentMoveCount = moveCount;
  memory.lastCommentAtMs = nowMs;
  memory.lastPhrase = picked;

  return picked;
}

/** Direct non-gated phrase picker (used for immediate replies to player-initiated reactions). */
export function pickBotTablePhrase(
  moment: BotMoment,
  isPartner: boolean,
  chance = 0.55
): string | null {
  if (Math.random() > chance) return null;
  const pool = isPartner ? PARTNER_PHRASES[moment] : RIVAL_PHRASES[moment];
  if (!pool || pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}
