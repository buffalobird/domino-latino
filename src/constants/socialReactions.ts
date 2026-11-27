/**
 * Curated warm table reactions ("Sobremesa") + respectful local Bot companionship lines.
 * Zero toxic free-text chat, zero heavy moderation overhead — 100% genuine table warmth.
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
  | 'human_double'
  | 'human_pass'
  | 'bot_double'
  | 'partner_good_play'
  | 'hand_start';

const PARTNER_PHRASES: Record<BotMoment, string[]> = {
  human_double: ['¡Buena esa, compa!', '¡Con fuerza, compa!', '¡Así se juega!'],
  human_pass: ['Tranquilo, yo cubro', '¡Sin pena, seguimos!', 'Con calma, vamos bien'],
  bot_double: ['¡Ahí va doble!', '¡A defender la mesa!'],
  partner_good_play: ['¡Buena jugada, compa!', '¡Excelente salida!'],
  hand_start: ['¡Vamos con todo, compa!', '¡Buena suerte en esta!'],
};

const RIVAL_PHRASES: Record<BotMoment, string[]> = {
  human_double: ['¡Uy, qué jugada!', '¡Buena esa!', '¡Fuerte movida!'],
  human_pass: ['¡Uff, se puso apretado!', '¡A cuidar las pintas!'],
  bot_double: ['¡Doble en mesa!', '¡Ahí va esa!'],
  partner_good_play: ['¡Bien jugado!', '¡Buen movimiento!'],
  hand_start: ['¡Buena partida!', '¡Que gane el mejor!'],
};

/**
 * Picks a warm, understated table comment for a Bot seat at key moments (~35% trigger rate
 * so the table feels genuinely accompanied without ever feeling noisy or spammy).
 */
export function pickBotTablePhrase(
  moment: BotMoment,
  isPartner: boolean,
  chance = 0.36
): string | null {
  if (Math.random() > chance) return null;
  const pool = isPartner ? PARTNER_PHRASES[moment] : RIVAL_PHRASES[moment];
  if (!pool || pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}
