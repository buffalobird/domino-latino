export type AvatarBodyType = 'feminine' | 'masculine';

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
  | 'relaxed'
  | 'sleepy'
  | 'sharp'
  | 'closed_calm'
  | 'puppy'
  | 'shocked'
  | 'crazy'
  | 'goofy_squint'
  | 'skeptic'
  | 'hero_white'
  | 'rock_smoky'
  | 'cat_gold'
  | 'laser_red'
  | 'hearts'
  | 'star';

export type AvatarEyebrowId =
  | 'natural'
  | 'thick'
  | 'arched'
  | 'straight'
  | 'expressive';

export type AvatarNoseId = 'classic' | 'small' | 'straight' | 'wide' | 'defined';

export type AvatarMouthId =
  | 'smile'
  | 'grin'
  | 'smirk'
  | 'smirk_teeth'
  | 'lips'
  | 'calm'
  | 'laugh'
  | 'tongue'
  | 'surprised_o'
  | 'grumpy'
  | 'grit'
  | 'cat_mouth'
  | 'buck_teeth'
  | 'vampire'
  | 'stitched'
  | 'pacifier'
  | 'gold_tooth'
  | 'daisy'
  | 'wide_villain'
  | 'rose';

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
  | 'tank'
  | 'stripes'
  | 'polo'
  | 'blouse'
  | 'sweater'
  | 'tie_shirt'
  | 'hoodie'
  | 'flannel'
  | 'rock_skull'
  | 'hawaiian_floral'
  | 'open_shirt'
  | 'suspenders'
  | 'ballet'
  | 'vest_bowtie'
  | 'kimono'
  | 'jacket'
  | 'pirate'
  | 'winter_fur'
  | 'princess'
  | 'blazer'
  | 'carnival'
  | 'pharaoh'
  | 'queen'
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
  bodyType: AvatarBodyType;
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

export const BASE_MALE_AVATAR: AvatarConfig = {
  bodyType: 'masculine',
  skinTone: 'calido',
  faceShape: 'angular',
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

export const BASE_FEMALE_AVATAR: AvatarConfig = {
  bodyType: 'feminine',
  skinTone: 'claro',
  faceShape: 'oval',
  eyeStyle: 'almond',
  eyeColor: '#4A2B18',
  eyebrows: 'arched',
  nose: 'small',
  mouth: 'lips',
  hair: 'waves',
  hairColor: '#63412B',
  facial: 'blush',
  outfit: 'blouse',
  outfitColor: '#F43F5E',
  glasses: 'none',
  hat: 'none',
  frame: 'lavender',
};

export const DEFAULT_AVATAR_CONFIG: AvatarConfig = { ...BASE_MALE_AVATAR };

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
  /** Used ONLY to float the most relevant styles to the top for Mujer / Hombre base (never locks items!) */
  affinity?: 'feminine' | 'masculine' | 'unisex';
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
  { id: 'puppy', cosmeticKey: null, name: 'Tiernos', costChips: 0 },
  { id: 'relaxed', cosmeticKey: null, name: 'Tranquilos', costChips: 0 },
  { id: 'sleepy', cosmeticKey: null, name: 'Desvelado', costChips: 0 },
  { id: 'focused', cosmeticKey: null, name: 'Mirada Fija', costChips: 0 },
  { id: 'sharp', cosmeticKey: null, name: 'Intensos', costChips: 0 },
  { id: 'wink', cosmeticKey: null, name: 'Guiño', costChips: 0 },
  { id: 'closed_calm', cosmeticKey: null, name: 'Zen', costChips: 0 },
  { id: 'shocked', cosmeticKey: null, name: 'Asombrado', costChips: 0 },
  { id: 'crazy', cosmeticKey: null, name: 'Loco', costChips: 0 },
  { id: 'goofy_squint', cosmeticKey: 'eye:goofy_squint', name: 'Desconfiado', costChips: 150, tag: 'Humor' },
  { id: 'skeptic', cosmeticKey: 'eye:skeptic', name: 'Sospechoso', costChips: 250, tag: 'Humor' },
  { id: 'hero_white', cosmeticKey: 'eye:hero_white', name: 'Héroe', costChips: 250, tag: 'Cómic' },
  { id: 'rock_smoky', cosmeticKey: 'eye:rock_smoky', name: 'Rock', costChips: 350, tag: 'Estilo' },
  { id: 'cat_gold', cosmeticKey: 'eye:cat_gold', name: 'Felino', costChips: 450, tag: 'Pro' },
  { id: 'laser_red', cosmeticKey: 'eye:laser_red', name: 'Furia Roja', costChips: 550, tag: 'Cómic' },
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
  { id: 'smirk_teeth', cosmeticKey: null, name: 'Confiada', costChips: 0 },
  { id: 'calm', cosmeticKey: null, name: 'Serena', costChips: 0 },
  { id: 'laugh', cosmeticKey: null, name: 'Alegre', costChips: 0 },
  { id: 'tongue', cosmeticKey: null, name: 'Lengua', costChips: 0 },
  { id: 'surprised_o', cosmeticKey: null, name: 'Asombro', costChips: 0 },
  { id: 'grumpy', cosmeticKey: null, name: 'Gruñón', costChips: 0 },
  { id: 'grit', cosmeticKey: null, name: 'Tenso', costChips: 0 },
  { id: 'cat_mouth', cosmeticKey: 'mouth:cat_mouth', name: 'Gatito :3', costChips: 150, tag: 'Pop' },
  { id: 'buck_teeth', cosmeticKey: 'mouth:buck_teeth', name: 'Dientecitos', costChips: 200, tag: 'Humor' },
  { id: 'vampire', cosmeticKey: 'mouth:vampire', name: 'Colmillos', costChips: 250, tag: 'Noche' },
  { id: 'stitched', cosmeticKey: 'mouth:stitched', name: 'Sellada', costChips: 300, tag: 'Humor' },
  { id: 'pacifier', cosmeticKey: 'mouth:pacifier', name: 'Chupete', costChips: 350, tag: 'Humor' },
  { id: 'gold_tooth', cosmeticKey: 'mouth:gold_tooth', name: 'Diente Oro', costChips: 450, tag: 'Pro' },
  { id: 'daisy', cosmeticKey: 'mouth:daisy', name: 'Margarita', costChips: 500, tag: 'Pop' },
  { id: 'wide_villain', cosmeticKey: 'mouth:wide_villain', name: 'Sonrisa XL', costChips: 600, tag: 'Cómic' },
  { id: 'rose', cosmeticKey: 'mouth:rose', name: 'Rosa', costChips: 750, tag: 'VIP' },
];

export const AVATAR_HAIR_OPTIONS: AvatarItemOption<AvatarHairId>[] = [
  { id: 'classic', cosmeticKey: null, name: 'Corto Clásico', costChips: 0, affinity: 'masculine' },
  { id: 'textured_crop', cosmeticKey: null, name: 'Crop Puntas', costChips: 0, affinity: 'masculine' },
  { id: 'curtain', cosmeticKey: null, name: 'Raya al Medio', costChips: 0, affinity: 'unisex' },
  { id: 'shaggy', cosmeticKey: null, name: 'Flequillo', costChips: 0, affinity: 'unisex' },
  { id: 'side_sweep', cosmeticKey: null, name: 'Fleco de Lado', costChips: 0, affinity: 'masculine' },
  { id: 'slick_tail', cosmeticKey: null, name: 'Coleta Baja', costChips: 0, affinity: 'unisex' },
  { id: 'bowl_mod', cosmeticKey: null, name: 'Corte Mod', costChips: 0, affinity: 'masculine' },
  { id: 'messy', cosmeticKey: null, name: 'Despeinado', costChips: 0, affinity: 'masculine' },
  { id: 'fade', cosmeticKey: null, name: 'Fade Urbano', costChips: 0, affinity: 'masculine' },
  { id: 'straight_long', cosmeticKey: null, name: 'Liso Largo', costChips: 0, affinity: 'feminine' },
  { id: 'waves', cosmeticKey: null, name: 'Ondulado', costChips: 0, affinity: 'feminine' },
  { id: 'bob', cosmeticKey: null, name: 'Bob Moderno', costChips: 0, affinity: 'feminine' },
  { id: 'ponytail', cosmeticKey: null, name: 'Coleta Alta', costChips: 0, affinity: 'feminine' },
  { id: 'curls', cosmeticKey: null, name: 'Rizos', costChips: 0, affinity: 'unisex' },
  { id: 'buzz', cosmeticKey: null, name: 'Rapado', costChips: 0, affinity: 'masculine' },
  { id: 'receding', cosmeticKey: null, name: 'Entradas', costChips: 0, affinity: 'masculine' },
  { id: 'bald', cosmeticKey: null, name: 'Calvo', costChips: 0, affinity: 'masculine' },
  { id: 'bun', cosmeticKey: 'hair:bun', name: 'Moño Alto', costChips: 150, affinity: 'feminine' },
  { id: 'spiky', cosmeticKey: 'hair:spiky', name: 'Puntas Arriba', costChips: 200, affinity: 'masculine' },
  { id: 'afro', cosmeticKey: 'hair:afro', name: 'Afro', costChips: 250, affinity: 'unisex' },
  { id: 'wavy_part', cosmeticKey: 'hair:wavy_part', name: 'Onda Elegante', costChips: 300, affinity: 'unisex' },
  { id: 'braids', cosmeticKey: 'hair:braids', name: 'Trenzas', costChips: 400, affinity: 'feminine' },
  { id: 'spiky_wild', cosmeticKey: 'hair:spiky_wild', name: 'Puntas Rebeldes', costChips: 450, tag: 'Pop', affinity: 'masculine' },
  { id: 'samurai_bun', cosmeticKey: 'hair:samurai_bun', name: 'Moño Top-Knot', costChips: 550, tag: 'Pro', affinity: 'masculine' },
  { id: 'pompadour', cosmeticKey: 'hair:pompadour', name: 'Copete Retro', costChips: 600, affinity: 'masculine' },
  { id: 'dreads_band', cosmeticKey: 'hair:dreads_band', name: 'Rastas', costChips: 650, tag: 'Flow', affinity: 'unisex' },
  { id: 'rocker_long', cosmeticKey: 'hair:rocker_long', name: 'Melena Rock', costChips: 800, tag: 'VIP', affinity: 'unisex' },
];

export const AVATAR_FACIAL_OPTIONS: AvatarItemOption<AvatarFacialId>[] = [
  { id: 'none', cosmeticKey: null, name: 'Ninguno', costChips: 0, affinity: 'unisex' },
  { id: 'blush', cosmeticKey: null, name: 'Rubor & Perlas', costChips: 0, affinity: 'feminine' },
  { id: 'freckles', cosmeticKey: null, name: 'Pecas', costChips: 0, affinity: 'unisex' },
  { id: 'stubble', cosmeticKey: null, name: 'Sombreada', costChips: 0, affinity: 'masculine' },
  { id: 'hoops', cosmeticKey: 'facial:hoops', name: 'Aros Dorados', costChips: 200, affinity: 'feminine' },
  { id: 'beard', cosmeticKey: 'facial:beard', name: 'Barba Completa', costChips: 180, affinity: 'masculine' },
  { id: 'mustache', cosmeticKey: 'facial:mustache', name: 'Bigote Clásico', costChips: 250, affinity: 'masculine' },
  { id: 'goatee', cosmeticKey: 'facial:goatee', name: 'Candado', costChips: 350, affinity: 'masculine' },
  { id: 'dali', cosmeticKey: 'facial:dali', name: 'Bigote Dalí', costChips: 450, tag: 'Humor', affinity: 'masculine' },
  { id: 'pirate_beard', cosmeticKey: 'facial:pirate_beard', name: 'Barba Larga', costChips: 750, tag: 'Pro', affinity: 'masculine' },
];

export const AVATAR_OUTFIT_OPTIONS: AvatarItemOption<AvatarOutfitId>[] = [
  { id: 'tee', cosmeticKey: null, name: 'Polera / Remera', costChips: 0, affinity: 'unisex' },
  { id: 'vneck', cosmeticKey: null, name: 'Cuello en V', costChips: 0, affinity: 'unisex' },
  { id: 'tank', cosmeticKey: null, name: 'Musculosa', costChips: 0, affinity: 'unisex' },
  { id: 'stripes', cosmeticKey: null, name: 'Rayas Marinero', costChips: 0, affinity: 'unisex' },
  { id: 'blouse', cosmeticKey: null, name: 'Blusa & Collar', costChips: 0, affinity: 'feminine' },
  { id: 'polo', cosmeticKey: null, name: 'Polo Clásico', costChips: 0, affinity: 'masculine' },
  { id: 'sweater', cosmeticKey: null, name: 'Suéter Tejido', costChips: 0, affinity: 'unisex' },
  { id: 'tie_shirt', cosmeticKey: 'outfit:tie_shirt', name: 'Formal Corbata', costChips: 250, affinity: 'masculine' },
  { id: 'hoodie', cosmeticKey: 'outfit:hoodie', name: 'Buzo / Hoodie', costChips: 300, affinity: 'unisex' },
  { id: 'flannel', cosmeticKey: 'outfit:flannel', name: 'Leñador Cuadros', costChips: 300, tag: 'Casual', affinity: 'masculine' },
  { id: 'rock_skull', cosmeticKey: 'outfit:rock_skull', name: 'Rock Calavera', costChips: 350, tag: 'Rock', affinity: 'unisex' },
  { id: 'hawaiian_floral', cosmeticKey: 'outfit:hawaiian_floral', name: 'Hawaiana Playa', costChips: 400, tag: 'Playa', affinity: 'unisex' },
  { id: 'open_shirt', cosmeticKey: 'outfit:open_shirt', name: 'Camisa Abierta', costChips: 450, affinity: 'masculine' },
  { id: 'suspenders', cosmeticKey: 'outfit:suspenders', name: 'Tirantes Retro', costChips: 450, tag: 'Retro', affinity: 'masculine' },
  { id: 'ballet', cosmeticKey: 'outfit:ballet', name: 'Ballet / Danza', costChips: 500, tag: 'Arte', affinity: 'feminine' },
  { id: 'vest_bowtie', cosmeticKey: 'outfit:vest_bowtie', name: 'Chaleco Gala', costChips: 550, tag: 'Formal', affinity: 'masculine' },
  { id: 'kimono', cosmeticKey: 'outfit:kimono', name: 'Kimono Japonés', costChips: 700, tag: 'Mundo', affinity: 'unisex' },
  { id: 'jacket', cosmeticKey: 'outfit:jacket', name: 'Chaqueta Cuero', costChips: 700, tag: 'Rock', affinity: 'unisex' },
  { id: 'pirate', cosmeticKey: 'outfit:pirate', name: 'Pirata Aventura', costChips: 850, tag: 'Aventura', affinity: 'unisex' },
  { id: 'winter_fur', cosmeticKey: 'outfit:winter_fur', name: 'Abrigo Nórdico', costChips: 950, tag: 'Mundo', affinity: 'unisex' },
  { id: 'princess', cosmeticKey: 'outfit:princess', name: 'Vestido Princesa', costChips: 1100, tag: 'Gala', affinity: 'feminine' },
  { id: 'blazer', cosmeticKey: 'outfit:blazer', name: 'Blazer Ejecutivo', costChips: 1200, tag: 'Elegante', affinity: 'unisex' },
  { id: 'carnival', cosmeticKey: 'outfit:carnival', name: 'Carnaval Brasil', costChips: 1400, tag: 'Fiesta', affinity: 'feminine' },
  { id: 'pharaoh', cosmeticKey: 'outfit:pharaoh', name: 'Túnica Egipcia', costChips: 1800, tag: 'Mundo', affinity: 'unisex' },
  { id: 'queen', cosmeticKey: 'outfit:queen', name: 'Reina Imperial', costChips: 2400, tag: 'VIP', affinity: 'feminine' },
  { id: 'royal_tux', cosmeticKey: 'outfit:royal_tux', name: 'Traje Pingüino', costChips: 6500, tag: 'Élite', affinity: 'masculine' },
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

/** Sort options so items matching the selected Mujer/Hombre base appear first (all remain selectable!) */
export function sortOptionsForBodyType<T extends string>(
  items: AvatarItemOption<T>[],
  bodyType: AvatarBodyType
): AvatarItemOption<T>[] {
  const score = (item: AvatarItemOption<T>) => {
    const aff = item.affinity ?? 'unisex';
    if (aff === bodyType) return 0;
    if (aff === 'unisex') return 1;
    return 2;
  };
  return [...items].sort((a, b) => score(a) - score(b));
}

export const AVATAR_STARTER_PRESETS: { label: string; config: AvatarConfig }[] = [
  { label: 'Mujer', config: { ...BASE_FEMALE_AVATAR } },
  { label: 'Hombre', config: { ...BASE_MALE_AVATAR } },
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

  const bodyType: AvatarBodyType =
    obj.bodyType === 'feminine' || obj.bodyType === 'masculine'
      ? obj.bodyType
      : DEFAULT_AVATAR_CONFIG.bodyType;

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
    bodyType,
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
