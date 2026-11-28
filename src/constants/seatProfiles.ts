import { GameMode } from '@/engine/types';
import { AvatarConfig } from './avatarCatalog';
import { CLUB } from './tokens';

export type BotMood = 'idle' | 'thinking' | 'play' | 'double' | 'draw' | 'pass' | 'win' | 'lose';

export interface SeatProfile {
  seat: number;
  displayName: string;
  accentColor: string;
  isBot: boolean;
  isPartner: boolean;
  badgeText?: string;
  avatarConfig?: AvatarConfig;
}

/**
 * Curated Club Sobremesa Characters (Chess.com / Duolingo style human cast):
 * Replaces cold metallic robots ("Bot Tuerca / Bot Voltio") with memorable table companions.
 */
export const CLUB_BOT_AVATARS: Record<'mateo' | 'camila' | 'rafa' | 'valeria', AvatarConfig> = {
  mateo: {
    bodyType: 'masculine',
    skinTone: 'canela',
    faceShape: 'angular',
    eyeStyle: 'relaxed',
    eyeColor: '#4A2B18',
    eyebrows: 'thick',
    nose: 'defined',
    mouth: 'smile',
    hair: 'receding',
    hairColor: '#CBD5E1',
    facial: 'mustache',
    outfit: 'guayabera',
    outfitColor: '#F8FAFC',
    glasses: 'round',
    hat: 'panama',
    frame: 'studio_cream',
  },
  camila: {
    bodyType: 'feminine',
    skinTone: 'calido',
    faceShape: 'oval',
    eyeStyle: 'almond',
    eyeColor: '#4A2B18',
    eyebrows: 'arched',
    nose: 'small',
    mouth: 'grin',
    hair: 'waves',
    hairColor: '#2B1E17',
    facial: 'hoops',
    outfit: 'blouse',
    outfitColor: '#F43F5E',
    glasses: 'none',
    hat: 'flower',
    frame: 'peach_sun',
  },
  rafa: {
    bodyType: 'masculine',
    skinTone: 'cacao',
    faceShape: 'soft',
    eyeStyle: 'classic',
    eyeColor: '#1B202C',
    eyebrows: 'expressive',
    nose: 'wide',
    mouth: 'smirk_teeth',
    hair: 'fade',
    hairColor: '#1C202B',
    facial: 'goatee',
    outfit: 'hawaiian_floral',
    outfitColor: '#0D9488',
    glasses: 'aviator',
    hat: 'none',
    frame: 'sky_light',
  },
  valeria: {
    bodyType: 'feminine',
    skinTone: 'claro',
    faceShape: 'slim',
    eyeStyle: 'bright',
    eyeColor: '#1F7A4C',
    eyebrows: 'arched',
    nose: 'straight',
    mouth: 'lips',
    hair: 'bob',
    hairColor: '#63412B',
    facial: 'blush',
    outfit: 'blazer',
    outfitColor: '#F59E0B',
    glasses: 'cat_eye',
    hat: 'none',
    frame: 'lavender',
  },
};

const CLUB_BOT_ROTATION: AvatarConfig[] = [
  CLUB_BOT_AVATARS.mateo,
  CLUB_BOT_AVATARS.rafa,
  CLUB_BOT_AVATARS.camila,
  CLUB_BOT_AVATARS.valeria,
];

export function getClubBotAvatarBySeat(seatHint = 1): AvatarConfig {
  const idx = Math.abs(seatHint) % CLUB_BOT_ROTATION.length;
  return CLUB_BOT_ROTATION[idx];
}

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
      displayName: 'Don Mateo',
      accentColor: CLUB.gold,
      isBot: true,
      isPartner: false,
      avatarConfig: CLUB_BOT_AVATARS.mateo,
    };
  }

  if (mode === '2v2') {
    if (seat === 1) {
      return {
        seat: 1,
        displayName: 'Tío Rafa',
        accentColor: CLUB.coral,
        isBot: true,
        isPartner: false,
        avatarConfig: CLUB_BOT_AVATARS.rafa,
      };
    }
    if (seat === 2) {
      return {
        seat: 2,
        displayName: 'Camila',
        accentColor: CLUB.emerald,
        isBot: true,
        isPartner: true,
        badgeText: 'PAREJA',
        avatarConfig: CLUB_BOT_AVATARS.camila,
      };
    }
    return {
      seat: 3,
      displayName: 'Valeria',
      accentColor: CLUB.amber,
      isBot: true,
      isPartner: false,
      avatarConfig: CLUB_BOT_AVATARS.valeria,
    };
  }

  // 4ffa
  if (seat === 1) {
    return {
      seat: 1,
      displayName: 'Tío Rafa',
      accentColor: CLUB.coral,
      isBot: true,
      isPartner: false,
      avatarConfig: CLUB_BOT_AVATARS.rafa,
    };
  }
  if (seat === 2) {
    return {
      seat: 2,
      displayName: 'Valeria',
      accentColor: CLUB.violet,
      isBot: true,
      isPartner: false,
      avatarConfig: CLUB_BOT_AVATARS.valeria,
    };
  }
  return {
    seat: 3,
    displayName: 'Don Mateo',
    accentColor: CLUB.amber,
    isBot: true,
    isPartner: false,
    avatarConfig: CLUB_BOT_AVATARS.mateo,
  };
}
