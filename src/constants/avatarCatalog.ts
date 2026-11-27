export type AvatarSkinToneId =
  | 'porcelana'
  | 'triguena'
  | 'miel'
  | 'canela'
  | 'cacao'
  | 'ebano';

export type AvatarHairId =
  | 'classic'
  | 'fade'
  | 'waves'
  | 'bob'
  | 'ponytail'
  | 'curls'
  | 'bun'
  | 'afro'
  | 'braids'
  | 'pompadour'
  | 'bald';

export type AvatarEyeStyleId = 'natural' | 'lashes' | 'fierce' | 'warm' | 'star';

export type AvatarFacialId =
  | 'none'
  | 'blush'
  | 'hoops'
  | 'stubble'
  | 'beard'
  | 'mustache'
  | 'goatee';

export type AvatarOutfitId =
  | 'guayabera'
  | 'blouse'
  | 'tee'
  | 'jacket'
  | 'blazer'
  | 'hawaiian'
  | 'collar_gold'
  | 'royal_tux';

export type AvatarGlassesId =
  | 'none'
  | 'round'
  | 'cat_eye'
  | 'aviator'
  | 'wayfarer'
  | 'gold_visor';

export type AvatarHatId =
  | 'none'
  | 'cap'
  | 'headband'
  | 'beanie'
  | 'beret'
  | 'panama'
  | 'vueltiao'
  | 'crown';

export type AvatarFrameId =
  | 'noche'
  | 'atardecer'
  | 'neon'
  | 'esmeralda'
  | 'oro_real'
  | 'galaxia'
  | 'leyenda';

export interface AvatarConfig {
  skinTone: AvatarSkinToneId;
  hair: AvatarHairId;
  hairColor: string;
  eyeStyle: AvatarEyeStyleId;
  facial: AvatarFacialId;
  outfit: AvatarOutfitId;
  outfitColor: string;
  glasses: AvatarGlassesId;
  hat: AvatarHatId;
  frame: AvatarFrameId;
}

export const DEFAULT_AVATAR_CONFIG: AvatarConfig = {
  skinTone: 'triguena',
  hair: 'classic',
  hairColor: '#1A2232',
  eyeStyle: 'natural',
  facial: 'none',
  outfit: 'guayabera',
  outfitColor: '#0EA5E9',
  glasses: 'none',
  hat: 'none',
  frame: 'noche',
};

export interface SkinToneOption {
  id: AvatarSkinToneId;
  name: string;
  light: string;
  base: string;
  shadow: string;
  blush: string;
}

export const AVATAR_SKIN_TONES: SkinToneOption[] = [
  { id: 'porcelana', name: 'Porcelana', light: '#FCE3D4', base: '#F5CBB2', shadow: '#DFA687', blush: '#F48FB1' },
  { id: 'triguena', name: 'Trigueña', light: '#F6CCA8', base: '#EBB489', shadow: '#CC8E63', blush: '#E57373' },
  { id: 'miel', name: 'Miel', light: '#E8AC7E', base: '#D69362', shadow: '#B27042', blush: '#D96B6B' },
  { id: 'canela', name: 'Canela', light: '#C78658', base: '#B26E42', shadow: '#8A4E29', blush: '#C85A5A' },
  { id: 'cacao', name: 'Cacao', light: '#9D623F', base: '#854D2D', shadow: '#61341B', blush: '#B04A4A' },
  { id: 'ebano', name: 'Ébano', light: '#73442C', base: '#5B331F', shadow: '#3D1F11', blush: '#943B3B' },
];

export const AVATAR_HAIR_COLORS: { hex: string; name: string }[] = [
  { hex: '#1A2232', name: 'Azabache' },
  { hex: '#4A2C1D', name: 'Castaño' },
  { hex: '#8A562C', name: 'Avellana' },
  { hex: '#D9A14A', name: 'Dorado' },
  { hex: '#B4432C', name: 'Cobrizo' },
  { hex: '#CBD5E1', name: 'Plata' },
  { hex: '#7C2D5A', name: 'Borgoña' },
  { hex: '#0EA5E9', name: 'Caribe' },
];

export const AVATAR_OUTFIT_COLORS: { hex: string; name: string }[] = [
  { hex: '#0EA5E9', name: 'Caribe' },
  { hex: '#F43F5E', name: 'Coral' },
  { hex: '#F8FAFC', name: 'Lino' },
  { hex: '#10B981', name: 'Esmeralda' },
  { hex: '#8B5CF6', name: 'Amatista' },
  { hex: '#F59E0B', name: 'Ámbar' },
  { hex: '#1E293B', name: 'Noche' },
];

export interface AvatarItemOption<T extends string = string> {
  id: T;
  /** Unique server-side cosmetic unlock key (`category:id`), null when free */
  cosmeticKey: string | null;
  name: string;
  costChips: number;
  tag?: string;
}

export const AVATAR_HAIR_OPTIONS: AvatarItemOption<AvatarHairId>[] = [
  { id: 'classic', cosmeticKey: null, name: 'Clásico', costChips: 0 },
  { id: 'waves', cosmeticKey: null, name: 'Ondas Largas', costChips: 0 },
  { id: 'fade', cosmeticKey: null, name: 'Fade Urbano', costChips: 0 },
  { id: 'bob', cosmeticKey: null, name: 'Bob Chic', costChips: 0 },
  { id: 'ponytail', cosmeticKey: null, name: 'Coleta Alta', costChips: 0 },
  { id: 'curls', cosmeticKey: null, name: 'Rizos', costChips: 0 },
  { id: 'bald', cosmeticKey: null, name: 'Rapado', costChips: 0 },
  { id: 'bun', cosmeticKey: 'hair:bun', name: 'Moño Elegante', costChips: 150 },
  { id: 'afro', cosmeticKey: 'hair:afro', name: 'Afro Corona', costChips: 250 },
  { id: 'braids', cosmeticKey: 'hair:braids', name: 'Trenzas Caribe', costChips: 400 },
  { id: 'pompadour', cosmeticKey: 'hair:pompadour', name: 'Copete Salsero', costChips: 600 },
];

export const AVATAR_EYE_OPTIONS: AvatarItemOption<AvatarEyeStyleId>[] = [
  { id: 'natural', cosmeticKey: null, name: 'Clásicos', costChips: 0 },
  { id: 'lashes', cosmeticKey: null, name: 'Pestañas Glam', costChips: 0 },
  { id: 'warm', cosmeticKey: null, name: 'Sonriente', costChips: 0 },
  { id: 'fierce', cosmeticKey: null, name: 'Competitivo', costChips: 0 },
  { id: 'star', cosmeticKey: 'eye:star', name: 'Mirada Estrella', costChips: 800, tag: 'VIP' },
];

export const AVATAR_FACIAL_OPTIONS: AvatarItemOption<AvatarFacialId>[] = [
  { id: 'none', cosmeticKey: null, name: 'Limpio', costChips: 0 },
  { id: 'blush', cosmeticKey: null, name: 'Perlas & Rubor', costChips: 0 },
  { id: 'stubble', cosmeticKey: null, name: 'Sombreada', costChips: 0 },
  { id: 'beard', cosmeticKey: 'facial:beard', name: 'Barba Completa', costChips: 180 },
  { id: 'hoops', cosmeticKey: 'facial:hoops', name: 'Aros de Oro', costChips: 200 },
  { id: 'mustache', cosmeticKey: 'facial:mustache', name: 'Bigote Clásico', costChips: 250 },
  { id: 'goatee', cosmeticKey: 'facial:goatee', name: 'Candado', costChips: 350 },
];

export const AVATAR_OUTFIT_OPTIONS: AvatarItemOption<AvatarOutfitId>[] = [
  { id: 'guayabera', cosmeticKey: null, name: 'Guayabera', costChips: 0 },
  { id: 'blouse', cosmeticKey: null, name: 'Blusa & Dije', costChips: 0 },
  { id: 'tee', cosmeticKey: null, name: 'Urbana', costChips: 0 },
  { id: 'jacket', cosmeticKey: 'outfit:jacket', name: 'Chaqueta Cuero', costChips: 450 },
  { id: 'blazer', cosmeticKey: 'outfit:blazer', name: 'Blazer Club', costChips: 900 },
  { id: 'hawaiian', cosmeticKey: 'outfit:hawaiian', name: 'Camisa Palmeras', costChips: 1200 },
  { id: 'collar_gold', cosmeticKey: 'outfit:collar_gold', name: 'Cadena Cubana', costChips: 2800, tag: 'Club' },
  { id: 'royal_tux', cosmeticKey: 'outfit:royal_tux', name: 'Gala Imperial', costChips: 6500, tag: 'Élite' },
];

export const AVATAR_GLASSES_OPTIONS: AvatarItemOption<AvatarGlassesId>[] = [
  { id: 'none', cosmeticKey: null, name: 'Sin gafas', costChips: 0 },
  { id: 'round', cosmeticKey: 'glasses:round', name: 'Redondas', costChips: 150 },
  { id: 'cat_eye', cosmeticKey: 'glasses:cat_eye', name: 'Ojo de Gato', costChips: 300 },
  { id: 'aviator', cosmeticKey: 'glasses:aviator', name: 'Aviador Sol', costChips: 550 },
  { id: 'wayfarer', cosmeticKey: 'glasses:wayfarer', name: 'Nocturnas', costChips: 900 },
  { id: 'gold_visor', cosmeticKey: 'glasses:gold_visor', name: 'Visor Oro VIP', costChips: 3500, tag: 'VIP' },
];

export const AVATAR_HAT_OPTIONS: AvatarItemOption<AvatarHatId>[] = [
  { id: 'none', cosmeticKey: null, name: 'Sin sombrero', costChips: 0 },
  { id: 'cap', cosmeticKey: 'hat:cap', name: 'Gorra Urbana', costChips: 200 },
  { id: 'headband', cosmeticKey: 'hat:headband', name: 'Diadema Perlas', costChips: 350 },
  { id: 'beanie', cosmeticKey: 'hat:beanie', name: 'Gorro Street', costChips: 450 },
  { id: 'beret', cosmeticKey: 'hat:beret', name: 'Boina Bohemio', costChips: 750 },
  { id: 'panama', cosmeticKey: 'hat:panama', name: 'Panamá Clásico', costChips: 1500, tag: 'Caribe' },
  { id: 'vueltiao', cosmeticKey: 'hat:vueltiao', name: 'Sombrero Caribe', costChips: 2500, tag: 'Maestro' },
  { id: 'crown', cosmeticKey: 'hat:crown', name: 'Corona del Club', costChips: 12000, tag: 'Leyenda' },
];

export interface AvatarFrameOption extends AvatarItemOption<AvatarFrameId> {
  bgTop: string;
  bgBottom: string;
  ringColor: string;
  hasSparkles?: boolean;
}

export const AVATAR_FRAME_OPTIONS: AvatarFrameOption[] = [
  {
    id: 'noche',
    cosmeticKey: null,
    name: 'Noche Caribe',
    costChips: 0,
    bgTop: '#1B3B54',
    bgBottom: '#0B1926',
    ringColor: '#38BDF8',
  },
  {
    id: 'atardecer',
    cosmeticKey: 'frame:atardecer',
    name: 'Atardecer',
    costChips: 250,
    bgTop: '#7C2D12',
    bgBottom: '#2B0F26',
    ringColor: '#FB923C',
  },
  {
    id: 'neon',
    cosmeticKey: 'frame:neon',
    name: 'Neón Habana',
    costChips: 700,
    bgTop: '#312E81',
    bgBottom: '#0F172A',
    ringColor: '#E879F9',
    hasSparkles: true,
  },
  {
    id: 'esmeralda',
    cosmeticKey: 'frame:esmeralda',
    name: 'Esmeralda',
    costChips: 1600,
    bgTop: '#065F46',
    bgBottom: '#022C22',
    ringColor: '#34D399',
  },
  {
    id: 'oro_real',
    cosmeticKey: 'frame:oro_real',
    name: 'Oro Imperial',
    costChips: 4500,
    bgTop: '#78350F',
    bgBottom: '#1C1004',
    ringColor: '#F5C451',
    hasSparkles: true,
    tag: 'VIP',
  },
  {
    id: 'galaxia',
    cosmeticKey: 'frame:galaxia',
    name: 'Noche Estelar',
    costChips: 9000,
    bgTop: '#1E1B4B',
    bgBottom: '#050816',
    ringColor: '#67E8F9',
    hasSparkles: true,
    tag: 'Élite',
  },
  {
    id: 'leyenda',
    cosmeticKey: 'frame:leyenda',
    name: 'Leyenda Suprema',
    costChips: 22000,
    bgTop: '#581C87',
    bgBottom: '#1E082E',
    ringColor: '#FDE047',
    hasSparkles: true,
    tag: 'Leyenda',
  },
];

/** Quick free starter presets showcasing inclusive feminine, masculine & creative looks */
export const AVATAR_STARTER_PRESETS: { label: string; config: AvatarConfig }[] = [
  {
    label: 'Caribeña',
    config: {
      skinTone: 'miel',
      hair: 'waves',
      hairColor: '#4A2C1D',
      eyeStyle: 'lashes',
      facial: 'blush',
      outfit: 'blouse',
      outfitColor: '#F43F5E',
      glasses: 'none',
      hat: 'none',
      frame: 'noche',
    },
  },
  {
    label: 'Clásico',
    config: {
      skinTone: 'triguena',
      hair: 'classic',
      hairColor: '#1A2232',
      eyeStyle: 'warm',
      facial: 'stubble',
      outfit: 'guayabera',
      outfitColor: '#0EA5E9',
      glasses: 'none',
      hat: 'none',
      frame: 'noche',
    },
  },
  {
    label: 'Chic',
    config: {
      skinTone: 'canela',
      hair: 'bob',
      hairColor: '#1A2232',
      eyeStyle: 'lashes',
      facial: 'blush',
      outfit: 'blouse',
      outfitColor: '#8B5CF6',
      glasses: 'none',
      hat: 'none',
      frame: 'noche',
    },
  },
  {
    label: 'Urbano',
    config: {
      skinTone: 'cacao',
      hair: 'fade',
      hairColor: '#1A2232',
      eyeStyle: 'fierce',
      facial: 'stubble',
      outfit: 'tee',
      outfitColor: '#10B981',
      glasses: 'none',
      hat: 'none',
      frame: 'noche',
    },
  },
];

/** Flat lookup map of every paid avatar cosmetic key -> cost in Club Chips */
export const AVATAR_COSMETIC_PRICES: Record<string, number> = (() => {
  const map: Record<string, number> = {};
  const groups: AvatarItemOption[][] = [
    AVATAR_HAIR_OPTIONS,
    AVATAR_EYE_OPTIONS,
    AVATAR_FACIAL_OPTIONS,
    AVATAR_OUTFIT_OPTIONS,
    AVATAR_GLASSES_OPTIONS,
    AVATAR_HAT_OPTIONS,
    AVATAR_FRAME_OPTIONS,
  ];
  for (const list of groups) {
    for (const item of list) {
      if (item.cosmeticKey && item.costChips > 0) {
        map[item.cosmeticKey] = item.costChips;
      }
    }
  }
  return map;
})();

export function getSkinTone(id: AvatarSkinToneId): SkinToneOption {
  return AVATAR_SKIN_TONES.find((s) => s.id === id) ?? AVATAR_SKIN_TONES[1];
}

export function getAvatarFrame(id: AvatarFrameId): AvatarFrameOption {
  return AVATAR_FRAME_OPTIONS.find((f) => f.id === id) ?? AVATAR_FRAME_OPTIONS[0];
}

export function sanitizeAvatarConfig(raw: unknown): AvatarConfig {
  if (!raw || typeof raw !== 'object') return { ...DEFAULT_AVATAR_CONFIG };
  const obj = raw as Partial<AvatarConfig>;
  const validSkin = AVATAR_SKIN_TONES.some((s) => s.id === obj.skinTone)
    ? (obj.skinTone as AvatarSkinToneId)
    : DEFAULT_AVATAR_CONFIG.skinTone;
  const validHair = AVATAR_HAIR_OPTIONS.some((h) => h.id === obj.hair)
    ? (obj.hair as AvatarHairId)
    : DEFAULT_AVATAR_CONFIG.hair;
  const validHairColor =
    typeof obj.hairColor === 'string' && AVATAR_HAIR_COLORS.some((c) => c.hex === obj.hairColor)
      ? obj.hairColor
      : DEFAULT_AVATAR_CONFIG.hairColor;
  const validEyes = AVATAR_EYE_OPTIONS.some((e) => e.id === obj.eyeStyle)
    ? (obj.eyeStyle as AvatarEyeStyleId)
    : DEFAULT_AVATAR_CONFIG.eyeStyle;
  const validFacial = AVATAR_FACIAL_OPTIONS.some((f) => f.id === obj.facial)
    ? (obj.facial as AvatarFacialId)
    : DEFAULT_AVATAR_CONFIG.facial;
  const validOutfit = AVATAR_OUTFIT_OPTIONS.some((o) => o.id === obj.outfit)
    ? (obj.outfit as AvatarOutfitId)
    : DEFAULT_AVATAR_CONFIG.outfit;
  const validOutfitColor =
    typeof obj.outfitColor === 'string' &&
    AVATAR_OUTFIT_COLORS.some((c) => c.hex === obj.outfitColor)
      ? obj.outfitColor
      : DEFAULT_AVATAR_CONFIG.outfitColor;
  const validGlasses = AVATAR_GLASSES_OPTIONS.some((g) => g.id === obj.glasses)
    ? (obj.glasses as AvatarGlassesId)
    : DEFAULT_AVATAR_CONFIG.glasses;
  const validHat = AVATAR_HAT_OPTIONS.some((h) => h.id === obj.hat)
    ? (obj.hat as AvatarHatId)
    : DEFAULT_AVATAR_CONFIG.hat;
  const validFrame = AVATAR_FRAME_OPTIONS.some((f) => f.id === obj.frame)
    ? (obj.frame as AvatarFrameId)
    : DEFAULT_AVATAR_CONFIG.frame;

  return {
    skinTone: validSkin,
    hair: validHair,
    hairColor: validHairColor,
    eyeStyle: validEyes,
    facial: validFacial,
    outfit: validOutfit,
    outfitColor: validOutfitColor,
    glasses: validGlasses,
    hat: validHat,
    frame: validFrame,
  };
}
