import { GameMode } from '@/engine/types';
import { CLUB } from './tokens';

export type BotMood = 'idle' | 'thinking' | 'play' | 'double' | 'draw' | 'pass' | 'win' | 'lose';

export interface SeatProfile {
  seat: number;
  displayName: string;
  accentColor: string;
  isBot: boolean;
  isPartner: boolean;
  badgeText?: string;
}

/**
 * Presentation layer mapping engine seats to warm, personable Bot profiles.
 * Keeps `src/engine/rules.ts` and persisted states 100% untouched.
 */
export function getSeatProfile(mode: GameMode, seat: number): SeatProfile {
  if (seat === 0) {
    return {
      seat: 0,
      displayName: 'Tú',
      accentColor: CLUB.emerald,
      isBot: false,
      isPartner: false,
    };
  }

  if (mode === '1v1') {
    return {
      seat: 1,
      displayName: 'Bot',
      accentColor: CLUB.cyan,
      isBot: true,
      isPartner: false,
    };
  }

  if (mode === '2v2') {
    if (seat === 1) {
      return {
        seat: 1,
        displayName: 'Bot Oeste',
        accentColor: CLUB.coral,
        isBot: true,
        isPartner: false,
      };
    }
    if (seat === 2) {
      return {
        seat: 2,
        displayName: 'Bot Compa',
        accentColor: CLUB.emerald,
        isBot: true,
        isPartner: true,
        badgeText: 'PAREJA',
      };
    }
    return {
      seat: 3,
      displayName: 'Bot Este',
      accentColor: CLUB.amber,
      isBot: true,
      isPartner: false,
    };
  }

  // 4ffa
  if (seat === 1) {
    return {
      seat: 1,
      displayName: 'Bot Chispa',
      accentColor: CLUB.coral,
      isBot: true,
      isPartner: false,
    };
  }
  if (seat === 2) {
    return {
      seat: 2,
      displayName: 'Bot Tuerca',
      accentColor: CLUB.violet,
      isBot: true,
      isPartner: false,
    };
  }
  return {
    seat: 3,
    displayName: 'Bot Voltio',
    accentColor: CLUB.amber,
    isBot: true,
    isPartner: false,
  };
}
