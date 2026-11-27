export type AvatarSkinToneId =
  | 'marfil'
  | 'claro'
  | 'calido'
  | 'dorado'
  | 'canela'
  | 'bronce'
  | 'cacao'
  | 'ebano';

export type AvatarFaceShapeId = 'oval' | 'angular' | 'soft' | 'slim';

export type AvatarEyeStyleId =
  | 'classic'
  | 'almond'
  | 'bright'
  | 'focused'
  | 'wink'
  | 'skeptic'
  | 'hearts'
  | 'star';

export type AvatarEyebrowId =
  | 'natural'
  | 'thick'
  | 'arched'
  | 'straight'
  | 'expressive';

export type AvatarNoseId = 'classic' | 'small' | 'straight' | 'wide' | 'defined';

export type AvatarMouthId = 'smile' | 'grin' | 'smirk' | 'lips' | 'calm' | 'laugh';

export type AvatarHairId =
  | 'classic'
  | 'textured_crop'
  | 'messy'
  | 'fade'
  | 'buzz'
  | 'receding'
  | 'bald'
  | 'spiky'
  | 'spiky_wild'
  | 'curtain'
  | 'shaggy'
  | 'side_sweep'
  | 'wavy_part'
  | 'bowl_mod'
  | 'slick_tail'
  | 'samurai_bun'
  | 'rocker_long'
  | 'dreads_band'
  | 'straight_long'
  | 'waves'
  | 'bob'
  | 'ponytail'
  | 'bun'
  | 'curls'
  | 'afro'
  | 'braids'
  | 'pompadour';

export type AvatarFacialId =
  | 'none'
  | 'blush'
  | 'freckles'
  | 'hoops'
  | 'stubble'
  | 'beard'
  | 'mustache'
  | 'goatee'
  | 'dali'
  | 'pirate_beard';

export type AvatarOutfitId =
  | 'tee'
  | 'vneck'
  | 'polo'
  | 'hoodie'
  | 'sweater'
  | 'open_shirt'
  | 'blouse'
  | 'jacket'
  | 'blazer'
  | 'royal_tux';

export type AvatarGlassesId =
  | 'none'
  | 'round'
  | 'square'
  | 'cat_eye'
  | 'hearts_shades'
  | 'aviator'
  | 'wayfarer'
  | 'pixel_boss'
  | 'star_party'
  | 'monocle'
  | 'gold_visor';

export type AvatarHatId =
  | 'none'
  | 'cap'
  | 'beanie'
  | 'headband'
  | 'flower'
  | 'beret'
  | 'bandana'
  | 'dj_phones'
  | 'chef'
  | 'fedora'
  | 'captain'
  | 'crown';

export type AvatarFrameId =
  | 'studio_cream'
  | 'sky_light'
  | 'mint_fresh'
  | 'lavender'
  | 'peach_sun'
  | 'pearl_gray'
  | 'neon_glow'
  | 'gold_prestige'
  | 'aurora'
  | 'legend';

export interface AvatarConfig {
  skinTone: AvatarSkinToneId;
  faceShape: AvatarFaceShapeId;
  eyeStyle: AvatarEyeStyleId;
  eyeColor: string;
  eyebrows: AvatarEyebrowId;
  nose: AvatarNoseId;
  mouth: AvatarMouthId;
  hair: AvatarHairId;
  hairColor: string;
  facial: AvatarFacialId;
  outfit: AvatarOutfitId;
  outfitColor: string;
  glasses: AvatarGlassesId;
  hat: AvatarHatId;
  frame: AvatarFrameId;
}

export const DEFAULT_AVATAR_CONFIG: AvatarConfig = {
  skinTone: 'calido',
  faceShape: 'oval',
  eyeStyle: 'classic',
  eyeColor: '#4A2B18',
  eyebrows: 'natural',
  nose: 'classic',
  mouth: 'smile',
  hair: 'classic',
  hairColor: '#2B1E17',
  facial: 'none',
  outfit: 'tee',
  outfitColor: '#2563EB',
  glasses: 'none',
  hat: 'none',
  frame: 'studio_cream',
};

export interface SkinToneOption {
  id: AvatarSkinToneId;
  name: string;
  light: string;
  base: string;
  shadow: string;
  outline: string;
  blush: string;
  lipColor: string;
}

export const AVATAR_SKIN_TONES: SkinToneOption[] = [
  { id: 'marfil', name: 'Marfil', light: '#FFF0E5', base: '#FADAC6', shadow: '#E0B296', outline: '#B88469', blush: '#F48FB1', lipColor: '#D47B7B' },
  { id: 'claro', name: 'Claro', light: '#FCE3CE', base: '#F4C6A3', shadow: '#D89F78', outline: '#AA7250', blush: '#F08080', lipColor: '#CC6E6E' },
  { id: 'calido', name: 'Cálido', light: '#F5CBA4', base: '#E6AF82', shadow: '#C4875A', outline: '#965F3B', blush: '#E57373', lipColor: '#BD605C' },
  { id: 'dorado', name: 'Dorado', light: '#E8B37E', base: '#D6965E', shadow: '#B0703B', outline: '#844F26', blush: '#D96B6B', lipColor: '#AC564F' },
  { id: 'canela', name: 'Canela', light: '#D19160', base: '#BA7545', shadow: '#91542B', outline: '#6A3A1C', blush: '#C85A5A', lipColor: '#984A44' },
  { id: 'bronce', name: 'Bronce', light: '#B37349', base: '#9B5B35', shadow: '#743F21', outline: '#522A15', blush: '#B85050', lipColor: '#863F3B' },
  { id: 'cacao', name: 'Cacao', light: '#8E583A', base: '#754328', shadow: '#542D18', outline: '#3B1E10', blush: '#A24444', lipColor: '#723532' },
  { id: 'ebano', name: 'Ébano', light: '#6B3F29', base: '#542F1D', shadow: '#381D11', outline: '#241109', blush: '#8A3838', lipColor: '#5D2A28' },
];

export const AVATAR_EYE_COLORS: { hex: string; name: string }[] = [
  { hex: '#4A2B18', name: 'Marrón' },
  { hex: '#1B202C', name: 'Oscuro' },
  { hex: '#8A5D28', name: 'Avellana' },
  { hex: '#1F7A4C', name: 'Verde' },
  { hex: '#1D6FD6', name: 'Azul' },
  { hex: '#64748B', name: 'Gris' },
];

export const AVATAR_HAIR_COLORS: { hex: string; name: string }[] = [
  { hex: '#1C202B', name: 'Negro' },
  { hex: '#2B1E17', name: 'Castaño Oscuro' },
  { hex: '#63412B', name: 'Castaño' },
  { hex: '#9C6B3B', name: 'Miel' },
  { hex: '#E0B45A', name: 'Rubio' },
  { hex: '#B84A27', name: 'Pelirrojo' },
  { hex: '#CBD5E1', name: 'Plata' },
  { hex: '#7E224C', name: 'Vino' },
  { hex: '#0EA5E9', name: 'Azul' },
];

export const AVATAR_OUTFIT_COLORS: { hex: string; name: string }[] = [
  { hex: '#2563EB', name: 'Azul' },
  { hex: '#F43F5E', name: 'Coral' },
  { hex: '#10B981', name: 'Verde' },
  { hex: '#F8FAFC', name: 'Blanco' },
  { hex: '#1E293B', name: 'Grafito' },
  { hex: '#8B5CF6', name: 'Violeta' },
  { hex: '#F59E0B', name: 'Mostaza' },
  { hex: '#0D9488', name: 'Petróleo' },
  { hex: '#EC4899', name: 'Fucsia' },
];

export interface AvatarItemOption<T extends string = string> {
  id: T;
  cosmeticKey: string | null;
  name: string;
  costChips: number;
  tag?: string;
}

export const AVATAR_FACE_SHAPE_OPTIONS: AvatarItemOption<AvatarFaceShapeId>[] = [
  { id: 'oval', cosmeticKey: null, name: 'Ovalado', costChips: 0 },
  { id: 'angular', cosmeticKey: null, name: 'Marcado', costChips: 0 },
  { id: 'soft', cosmeticKey: null, name: 'Suave', costChips: 0 },
  { id: 'slim', cosmeticKey: null, name: 'Fino', costChips: 0 },
];

export const AVATAR_EYE_OPTIONS: AvatarItemOption<AvatarEyeStyleId>[] = [
  { id: 'classic', cosmeticKey: null, name: 'Clásicos', costChips: 0 },
  { id: 'almond', cosmeticKey: null, name: 'Almendrados', costChips: 0 },
  { id: 'bright', cosmeticKey: null, name: 'Expresivos', costChips: 0 },
  { id: 'focused', cosmeticKey: null, name: 'Mirada Fija', costChips: 0 },
  { id: 'wink', cosmeticKey: null, name: 'Guiño', costChips: 0 },
  { id: 'skeptic', cosmeticKey: 'eye:skeptic', name: 'Sospechoso', costChips: 250, tag: 'Humor' },
  { id: 'hearts', cosmeticKey: 'eye:hearts', name: 'Enamorado', costChips: 600, tag: 'Pop' },
  { id: 'star', cosmeticKey: 'eye:star', name: 'Estrella', costChips: 800, tag: 'VIP' },
];

export const AVATAR_EYEBROW_OPTIONS: AvatarItemOption<AvatarEyebrowId>[] = [
  { id: 'natural', cosmeticKey: null, name: 'Naturales', costChips: 0 },
  { id: 'thick', cosmeticKey: null, name: 'Gruesas', costChips: 0 },
  { id: 'arched', cosmeticKey: null, name: 'Arqueadas', costChips: 0 },
  { id: 'straight', cosmeticKey: null, name: 'Rectas', costChips: 0 },
  { id: 'expressive', cosmeticKey: null, name: 'Expresivas', costChips: 0 },
];

export const AVATAR_NOSE_OPTIONS: AvatarItemOption<AvatarNoseId>[] = [
  { id: 'classic', cosmeticKey: null, name: 'Clásica', costChips: 0 },
  { id: 'small', cosmeticKey: null, name: 'Pequeña', costChips: 0 },
  { id: 'straight', cosmeticKey: null, name: 'Recta', costChips: 0 },
  { id: 'defined', cosmeticKey: null, name: 'Perfilada', costChips: 0 },
  { id: 'wide', cosmeticKey: null, name: 'Ancha', costChips: 0 },
];

export const AVATAR_MOUTH_OPTIONS: AvatarItemOption<AvatarMouthId>[] = [
  { id: 'smile', cosmeticKey: null, name: 'Sonrisa', costChips: 0 },
  { id: 'grin', cosmeticKey: null, name: 'Abierta', costChips: 0 },
  { id: 'lips', cosmeticKey: null, name: 'Definida', costChips: 0 },
  { id: 'smirk', cosmeticKey: null, name: 'Pícara', costChips: 0 },
  { id: 'calm', cosmeticKey: null, name: 'Serena', costChips: 0 },
  { id: 'laugh', cosmeticKey: null, name: 'Alegre', costChips: 0 },
];

export const AVATAR_HAIR_OPTIONS: AvatarItemOption<AvatarHairId>[] = [
  { id: 'classic', cosmeticKey: null, name: 'Corto Clásico', costChips: 0 },
  { id: 'textured_crop', cosmeticKey: null, name: 'Crop Puntas', costChips: 0 },
  { id: 'curtain', cosmeticKey: null, name: 'Raya al Medio', costChips: 0 },
  { id: 'shaggy', cosmeticKey: null, name: 'Flequillo', costChips: 0 },
  { id: 'side_sweep', cosmeticKey: null, name: 'Fleco de Lado', costChips: 0 },
  { id: 'slick_tail', cosmeticKey: null, name: 'Coleta Baja', costChips: 0 },
  { id: 'bowl_mod', cosmeticKey: null, name: 'Corte Mod', costChips: 0 },
  { id: 'messy', cosmeticKey: null, name: 'Despeinado', costChips: 0 },
  { id: 'fade', cosmeticKey: null, name: 'Fade Urbano', costChips: 0 },
  { id: 'straight_long', cosmeticKey: null, name: 'Liso Largo', costChips: 0 },
  { id: 'waves', cosmeticKey: null, name: 'Ondulado', costChips: 0 },
  { id: 'bob', cosmeticKey: null, name: 'Bob Moderno', costChips: 0 },
  { id: 'ponytail', cosmeticKey: null, name: 'Coleta Alta', costChips: 0 },
  { id: 'curls', cosmeticKey: null, name: 'Rizos', costChips: 0 },
  { id: 'buzz', cosmeticKey: null, name: 'Rapado', costChips: 0 },
  { id: 'receding', cosmeticKey: null, name: 'Entradas', costChips: 0 },
  { id: 'bald', cosmeticKey: null, name: 'Calvo', costChips: 0 },
  { id: 'bun', cosmeticKey: 'hair:bun', name: 'Moño Alto', costChips: 150 },
  { id: 'spiky', cosmeticKey: 'hair:spiky', name: 'Puntas Arriba', costChips: 200 },
  { id: 'afro', cosmeticKey: 'hair:afro', name: 'Afro', costChips: 250 },
  { id: 'wavy_part', cosmeticKey: 'hair:wavy_part', name: 'Onda Elegante', costChips: 300 },
  { id: 'braids', cosmeticKey: 'hair:braids', name: 'Trenzas', costChips: 400 },
  { id: 'spiky_wild', cosmeticKey: 'hair:spiky_wild', name: 'Puntas Rebeldes', costChips: 450, tag: 'Pop' },
  { id: 'samurai_bun', cosmeticKey: 'hair:samurai_bun', name: 'Moño Top-Knot', costChips: 550, tag: 'Pro' },
  { id: 'pompadour', cosmeticKey: 'hair:pompadour', name: 'Copete Retro', costChips: 600 },
  { id: 'dreads_band', cosmeticKey: 'hair:dreads_band', name: 'Rastas', costChips: 650, tag: 'Flow' },
  { id: 'rocker_long', cosmeticKey: 'hair:rocker_long', name: 'Melena Rock', costChips: 800, tag: 'VIP' },
];

export const AVATAR_FACIAL_OPTIONS: AvatarItemOption<AvatarFacialId>[] = [
  { id: 'none', cosmeticKey: null, name: 'Ninguno', costChips: 0 },
  { id: 'blush', cosmeticKey: null, name: 'Rubor & Perlas', costChips: 0 },
  { id: 'freckles', cosmeticKey: null, name: 'Pecas', costChips: 0 },
  { id: 'stubble', cosmeticKey: null, name: 'Sombreada', costChips: 0 },
  { id: 'beard', cosmeticKey: 'facial:beard', name: 'Barba Completa', costChips: 180 },
  { id: 'hoops', cosmeticKey: 'facial:hoops', name: 'Aros Dorados', costChips: 200 },
  { id: 'mustache', cosmeticKey: 'facial:mustache', name: 'Bigote Clásico', costChips: 250 },
  { id: 'goatee', cosmeticKey: 'facial:goatee', name: 'Candado', costChips: 350 },
  { id: 'dali', cosmeticKey: 'facial:dali', name: 'Bigote Dalí', costChips: 450, tag: 'Humor' },
  { id: 'pirate_beard', cosmeticKey: 'facial:pirate_beard', name: 'Barba Larga', costChips: 750, tag: 'Pro' },
];

export const AVATAR_OUTFIT_OPTIONS: AvatarItemOption<AvatarOutfitId>[] = [
  { id: 'tee', cosmeticKey: null, name: 'Polera / Remera', costChips: 0 },
  { id: 'vneck', cosmeticKey: null, name: 'Cuello en V', costChips: 0 },
  { id: 'polo', cosmeticKey: null, name: 'Polo Clásico', costChips: 0 },
  { id: 'blouse', cosmeticKey: null, name: 'Blusa & Collar', costChips: 0 },
  { id: 'sweater', cosmeticKey: null, name: 'Suéter Tejido', costChips: 0 },
  { id: 'hoodie', cosmeticKey: 'outfit:hoodie', name: 'Buzo / Hoodie', costChips: 300 },
  { id: 'open_shirt', cosmeticKey: 'outfit:open_shirt', name: 'Camisa Abierta', costChips: 450 },
  { id: 'jacket', cosmeticKey: 'outfit:jacket', name: 'Chaqueta Cuero', costChips: 700 },
  { id: 'blazer', cosmeticKey: 'outfit:blazer', name: 'Blazer Ejecutivo', costChips: 1200, tag: 'Elegante' },
  { id: 'royal_tux', cosmeticKey: 'outfit:royal_tux', name: 'Etiqueta Gala', costChips: 6500, tag: 'Élite' },
];

export const AVATAR_GLASSES_OPTIONS: AvatarItemOption<AvatarGlassesId>[] = [
  { id: 'none', cosmeticKey: null, name: 'Sin gafas', costChips: 0 },
  { id: 'round', cosmeticKey: 'glasses:round', name: 'Redondas', costChips: 150 },
  { id: 'square', cosmeticKey: 'glasses:square', name: 'Cuadradas', costChips: 200 },
  { id: 'cat_eye', cosmeticKey: 'glasses:cat_eye', name: 'Ojo de Gato', costChips: 300 },
  { id: 'hearts_shades', cosmeticKey: 'glasses:hearts_shades', name: 'Corazón', costChips: 400, tag: 'Pop' },
  { id: 'aviator', cosmeticKey: 'glasses:aviator', name: 'Aviador', costChips: 550 },
  { id: 'wayfarer', cosmeticKey: 'glasses:wayfarer', name: 'Oscuras', costChips: 900 },
  { id: 'pixel_boss', cosmeticKey: 'glasses:pixel_boss', name: 'Pixel Jefe', costChips: 1100, tag: 'Humor' },
  { id: 'star_party', cosmeticKey: 'glasses:star_party', name: 'Estrella', costChips: 1400, tag: 'Fiesta' },
  { id: 'monocle', cosmeticKey: 'glasses:monocle', name: 'Monóculo', costChips: 2200, tag: 'Clásico' },
  { id: 'gold_visor', cosmeticKey: 'glasses:gold_visor', name: 'Visor Oro', costChips: 3500, tag: 'VIP' },
];

export const AVATAR_HAT_OPTIONS: AvatarItemOption<AvatarHatId>[] = [
  { id: 'none', cosmeticKey: null, name: 'Ninguno', costChips: 0 },
  { id: 'cap', cosmeticKey: 'hat:cap', name: 'Gorra', costChips: 200 },
  { id: 'flower', cosmeticKey: 'hat:flower', name: 'Flor', costChips: 300 },
  { id: 'headband', cosmeticKey: 'hat:headband', name: 'Diadema', costChips: 350 },
  { id: 'beanie', cosmeticKey: 'hat:beanie', name: 'Gorro Tejido', costChips: 450 },
  { id: 'bandana', cosmeticKey: 'hat:bandana', name: 'Bandana', costChips: 500 },
  { id: 'beret', cosmeticKey: 'hat:beret', name: 'Boina', costChips: 750 },
  { id: 'dj_phones', cosmeticKey: 'hat:dj_phones', name: 'Audífonos', costChips: 950, tag: 'Música' },
  { id: 'chef', cosmeticKey: 'hat:chef', name: 'Gorro Chef', costChips: 1200, tag: 'Humor' },
  { id: 'fedora', cosmeticKey: 'hat:fedora', name: 'Sombrero', costChips: 1500, tag: 'Clásico' },
  { id: 'captain', cosmeticKey: 'hat:captain', name: 'Gorra Capitán', costChips: 1800, tag: 'Pro' },
  { id: 'crown', cosmeticKey: 'hat:crown', name: 'Corona Real', costChips: 12000, tag: 'Leyenda' },
];

export interface AvatarFrameOption extends AvatarItemOption<AvatarFrameId> {
  bgTop: string;
  bgBottom: string;
  ringColor: string;
  isLightBackdrop?: boolean;
  hasSparkles?: boolean;
}

/** High-contrast luminous studio backdrops by default so avatars pop crisply over dark app UI */
export const AVATAR_FRAME_OPTIONS: AvatarFrameOption[] = [
  {
    id: 'studio_cream',
    cosmeticKey: null,
    name: 'Estudio Crema',
    costChips: 0,
    bgTop: '#FFF8EB',
    bgBottom: '#EBD9BE',
    ringColor: '#F5C451',
    isLightBackdrop: true,
  },
  {
    id: 'sky_light',
    cosmeticKey: null,
    name: 'Cielo Claro',
    costChips: 0,
    bgTop: '#E0F2FE',
    bgBottom: '#93C5FD',
    ringColor: '#38BDF8',
    isLightBackdrop: true,
  },
  {
    id: 'mint_fresh',
    cosmeticKey: null,
    name: 'Menta Fresca',
    costChips: 0,
    bgTop: '#DCFCE7',
    bgBottom: '#86EFAC',
    ringColor: '#10B981',
    isLightBackdrop: true,
  },
  {
    id: 'lavender',
    cosmeticKey: null,
    name: 'Lavanda',
    costChips: 0,
    bgTop: '#F3E8FF',
    bgBottom: '#C4B5FD',
    ringColor: '#A855F7',
    isLightBackdrop: true,
  },
  {
    id: 'peach_sun',
    cosmeticKey: 'frame:peach_sun',
    name: 'Durazno',
    costChips: 250,
    bgTop: '#FFEDD5',
    bgBottom: '#FDBA74',
    ringColor: '#FB923C',
    isLightBackdrop: true,
  },
  {
    id: 'pearl_gray',
    cosmeticKey: 'frame:pearl_gray',
    name: 'Gris Perla',
    costChips: 400,
    bgTop: '#F8FAFC',
    bgBottom: '#CBD5E1',
    ringColor: '#94A3B8',
    isLightBackdrop: true,
  },
  {
    id: 'neon_glow',
    cosmeticKey: 'frame:neon_glow',
    name: 'Neón Pop',
    costChips: 900,
    bgTop: '#4F46E5',
    bgBottom: '#1E1B4B',
    ringColor: '#E879F9',
    hasSparkles: true,
  },
  {
    id: 'gold_prestige',
    cosmeticKey: 'frame:gold_prestige',
    name: 'Oro Real',
    costChips: 4500,
    bgTop: '#FEF3C7',
    bgBottom: '#F59E0B',
    ringColor: '#FDE047',
    isLightBackdrop: true,
    hasSparkles: true,
    tag: 'VIP',
  },
  {
    id: 'aurora',
    cosmeticKey: 'frame:aurora',
    name: 'Aurora',
    costChips: 9000,
    bgTop: '#CFFAFE',
    bgBottom: '#6366F1',
    ringColor: '#67E8F9',
    isLightBackdrop: true,
    hasSparkles: true,
    tag: 'Élite',
  },
  {
    id: 'legend',
    cosmeticKey: 'frame:legend',
    name: 'Leyenda',
    costChips: 22000,
    bgTop: '#FEF08A',
    bgBottom: '#9333EA',
    ringColor: '#FDE047',
    isLightBackdrop: true,
    hasSparkles: true,
    tag: 'Leyenda',
  },
];

/** Neutral, diverse, free starter presets showcasing truly distinct faces, eyes, hair & clothes */
export const AVATAR_STARTER_PRESETS: { label: string; config: AvatarConfig }[] = [
  {
    label: 'Natural',
    config: {
      skinTone: 'claro',
      faceShape: 'oval',
      eyeStyle: 'almond',
      eyeColor: '#1F7A4C',
      eyebrows: 'arched',
      nose: 'small',
      mouth: 'lips',
      hair: 'straight_long',
      hairColor: '#63412B',
      facial: 'blush',
      outfit: 'blouse',
      outfitColor: '#F43F5E',
      glasses: 'none',
      hat: 'none',
      frame: 'lavender',
    },
  },
  {
    label: 'Urbano',
    config: {
      skinTone: 'canela',
      faceShape: 'angular',
      eyeStyle: 'focused',
      eyeColor: '#4A2B18',
      eyebrows: 'thick',
      nose: 'straight',
      mouth: 'smirk',
      hair: 'fade',
      hairColor: '#1C202B',
      facial: 'stubble',
      outfit: 'tee',
      outfitColor: '#10B981',
      glasses: 'none',
      hat: 'none',
      frame: 'mint_fresh',
    },
  },
  {
    label: 'Luminosa',
    config: {
      skinTone: 'marfil',
      faceShape: 'slim',
      eyeStyle: 'bright',
      eyeColor: '#1D6FD6',
      eyebrows: 'natural',
      nose: 'small',
      mouth: 'grin',
      hair: 'bob',
      hairColor: '#E0B45A',
      facial: 'freckles',
      outfit: 'sweater',
      outfitColor: '#8B5CF6',
      glasses: 'none',
      hat: 'none',
      frame: 'sky_light',
    },
  },
  {
    label: 'Clásico',
    config: {
      skinTone: 'dorado',
      faceShape: 'soft',
      eyeStyle: 'classic',
      eyeColor: '#8A5D28',
      eyebrows: 'straight',
      nose: 'defined',
      mouth: 'smile',
      hair: 'messy',
      hairColor: '#2B1E17',
      facial: 'none',
      outfit: 'polo',
      outfitColor: '#2563EB',
      glasses: 'none',
      hat: 'none',
      frame: 'studio_cream',
    },
  },
];

export const AVATAR_COSMETIC_PRICES: Record<string, number> = (() => {
  const map: Record<string, number> = {};
  const groups: AvatarItemOption[][] = [
    AVATAR_FACE_SHAPE_OPTIONS,
    AVATAR_EYE_OPTIONS,
    AVATAR_EYEBROW_OPTIONS,
    AVATAR_NOSE_OPTIONS,
    AVATAR_MOUTH_OPTIONS,
    AVATAR_HAIR_OPTIONS,
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
  return AVATAR_SKIN_TONES.find((s) => s.id === id) ?? AVATAR_SKIN_TONES[2];
}

export function getAvatarFrame(id: AvatarFrameId): AvatarFrameOption {
  return AVATAR_FRAME_OPTIONS.find((f) => f.id === id) ?? AVATAR_FRAME_OPTIONS[0];
}

// Graceful backwards-compatibility mapping for any earlier saved configs
const LEGACY_SKIN_MAP: Record<string, AvatarSkinToneId> = {
  porcelana: 'marfil',
  triguena: 'calido',
  miel: 'dorado',
};
const LEGACY_EYE_MAP: Record<string, AvatarEyeStyleId> = {
  natural: 'classic',
  lashes: 'almond',
  warm: 'bright',
  fierce: 'focused',
};
const LEGACY_OUTFIT_MAP: Record<string, AvatarOutfitId> = {
  guayabera: 'polo',
  hawaiian: 'open_shirt',
  collar_gold: 'vneck',
};
const LEGACY_HAT_MAP: Record<string, AvatarHatId> = {
  hibiscus: 'flower',
  panama: 'fedora',
  vueltiao: 'fedora',
};
const LEGACY_FRAME_MAP: Record<string, AvatarFrameId> = {
  noche: 'studio_cream',
  atardecer: 'peach_sun',
  neon: 'neon_glow',
  esmeralda: 'mint_fresh',
  oro_real: 'gold_prestige',
  galaxia: 'aurora',
  leyenda: 'legend',
};

export function sanitizeAvatarConfig(raw: unknown): AvatarConfig {
  if (!raw || typeof raw !== 'object') return { ...DEFAULT_AVATAR_CONFIG };
  const obj = raw as Record<string, unknown>;

  const rawSkin = String(obj.skinTone ?? '');
  const mappedSkin = LEGACY_SKIN_MAP[rawSkin] ?? rawSkin;
  const skinTone = AVATAR_SKIN_TONES.some((s) => s.id === mappedSkin)
    ? (mappedSkin as AvatarSkinToneId)
    : DEFAULT_AVATAR_CONFIG.skinTone;

  const faceShape = AVATAR_FACE_SHAPE_OPTIONS.some((f) => f.id === obj.faceShape)
    ? (obj.faceShape as AvatarFaceShapeId)
    : DEFAULT_AVATAR_CONFIG.faceShape;

  const rawEye = String(obj.eyeStyle ?? '');
  const mappedEye = LEGACY_EYE_MAP[rawEye] ?? rawEye;
  const eyeStyle = AVATAR_EYE_OPTIONS.some((e) => e.id === mappedEye)
    ? (mappedEye as AvatarEyeStyleId)
    : DEFAULT_AVATAR_CONFIG.eyeStyle;

  const eyeColor =
    typeof obj.eyeColor === 'string' && AVATAR_EYE_COLORS.some((c) => c.hex === obj.eyeColor)
      ? obj.eyeColor
      : DEFAULT_AVATAR_CONFIG.eyeColor;

  const eyebrows = AVATAR_EYEBROW_OPTIONS.some((b) => b.id === obj.eyebrows)
    ? (obj.eyebrows as AvatarEyebrowId)
    : DEFAULT_AVATAR_CONFIG.eyebrows;

  const nose = AVATAR_NOSE_OPTIONS.some((n) => n.id === obj.nose)
    ? (obj.nose as AvatarNoseId)
    : DEFAULT_AVATAR_CONFIG.nose;

  const mouth = AVATAR_MOUTH_OPTIONS.some((m) => m.id === obj.mouth)
    ? (obj.mouth as AvatarMouthId)
    : DEFAULT_AVATAR_CONFIG.mouth;

  const hair = AVATAR_HAIR_OPTIONS.some((h) => h.id === obj.hair)
    ? (obj.hair as AvatarHairId)
    : DEFAULT_AVATAR_CONFIG.hair;

  const hairColor =
    typeof obj.hairColor === 'string' && AVATAR_HAIR_COLORS.some((c) => c.hex === obj.hairColor)
      ? obj.hairColor
      : DEFAULT_AVATAR_CONFIG.hairColor;

  const facial = AVATAR_FACIAL_OPTIONS.some((f) => f.id === obj.facial)
    ? (obj.facial as AvatarFacialId)
    : DEFAULT_AVATAR_CONFIG.facial;

  const rawOutfit = String(obj.outfit ?? '');
  const mappedOutfit = LEGACY_OUTFIT_MAP[rawOutfit] ?? rawOutfit;
  const outfit = AVATAR_OUTFIT_OPTIONS.some((o) => o.id === mappedOutfit)
    ? (mappedOutfit as AvatarOutfitId)
    : DEFAULT_AVATAR_CONFIG.outfit;

  const outfitColor =
    typeof obj.outfitColor === 'string' &&
    AVATAR_OUTFIT_COLORS.some((c) => c.hex === obj.outfitColor)
      ? obj.outfitColor
      : DEFAULT_AVATAR_CONFIG.outfitColor;

  const glasses = AVATAR_GLASSES_OPTIONS.some((g) => g.id === obj.glasses)
    ? (obj.glasses as AvatarGlassesId)
    : DEFAULT_AVATAR_CONFIG.glasses;

  const rawHat = String(obj.hat ?? '');
  const mappedHat = LEGACY_HAT_MAP[rawHat] ?? rawHat;
  const hat = AVATAR_HAT_OPTIONS.some((h) => h.id === mappedHat)
    ? (mappedHat as AvatarHatId)
    : DEFAULT_AVATAR_CONFIG.hat;

  const rawFrame = String(obj.frame ?? '');
  const mappedFrame = LEGACY_FRAME_MAP[rawFrame] ?? rawFrame;
  const frame = AVATAR_FRAME_OPTIONS.some((f) => f.id === mappedFrame)
    ? (mappedFrame as AvatarFrameId)
    : DEFAULT_AVATAR_CONFIG.frame;

  return {
    skinTone,
    faceShape,
    eyeStyle,
    eyeColor,
    eyebrows,
    nose,
    mouth,
    hair,
    hairColor,
    facial,
    outfit,
    outfitColor,
    glasses,
    hat,
    frame,
  };
}
