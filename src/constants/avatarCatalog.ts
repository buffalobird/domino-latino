export type AvatarBodyType = 'feminine' | 'masculine';

export type AvatarSkinToneId =
  | 'marfil'
  | 'claro'
  | 'calido'
  | 'canela'
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
  | 'guayabera'
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
  | 'panama'
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
  outfit: 'guayabera',
  outfitColor: '#F8FAFC',
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

/** 6 balanced, inclusive skin tones that fit comfortably on a single row without scrolling */
export const AVATAR_SKIN_TONES: SkinToneOption[] = [
  { id: 'marfil', name: 'Marfil', light: '#FFF1E6', base: '#FADBC8', shadow: '#DFB195', outline: '#B58165', blush: '#F48FB1', lipColor: '#D47878' },
  { id: 'claro', name: 'Claro', light: '#FCE3CE', base: '#F2C29E', shadow: '#D49A72', outline: '#A66E4C', blush: '#EE7D7D', lipColor: '#C96A6A' },
  { id: 'calido', name: 'Trigueño', light: '#F1C193', base: '#DF9F6B', shadow: '#B87846', outline: '#8B532B', blush: '#DF6C6C', lipColor: '#B35952' },
  { id: 'canela', name: 'Canela', light: '#CE8E5D', base: '#B57040', shadow: '#8D5027', outline: '#663619', blush: '#C65858', lipColor: '#964741' },
  { id: 'cacao', name: 'Cacao', light: '#965E3E', base: '#7B472B', shadow: '#58301A', outline: '#3D1F10', blush: '#A44545', lipColor: '#743633' },
  { id: 'ebano', name: 'Ébano', light: '#6B3F29', base: '#522E1C', shadow: '#361C10', outline: '#231008', blush: '#8A3838', lipColor: '#5D2A28' },
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
  { hex: '#B84A27', name: 'Cobrizo' },
  { hex: '#CBD5E1', name: 'Plata' },
  { hex: '#7E224C', name: 'Vino' },
  { hex: '#0EA5E9', name: 'Turquesa' },
];

export const AVATAR_OUTFIT_COLORS: { hex: string; name: string }[] = [
  { hex: '#F8FAFC', name: 'Lino Blanco' },
  { hex: '#2563EB', name: 'Azul' },
  { hex: '#F43F5E', name: 'Coral' },
  { hex: '#10B981', name: 'Esmeralda' },
  { hex: '#1E293B', name: 'Grafito' },
  { hex: '#F59E0B', name: 'Ámbar' },
  { hex: '#0D9488', name: 'Petróleo' },
  { hex: '#8B5CF6', name: 'Violeta' },
  { hex: '#EC4899', name: 'Fucsia' },
];

export interface AvatarItemOption<T extends string = string> {
  id: T;
  cosmeticKey: string | null;
  name: string;
  costChips: number;
  tag?: string;
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
  { id: 'sleepy', cosmeticKey: null, name: 'Bohemio', costChips: 0 },
  { id: 'focused', cosmeticKey: null, name: 'Estratega', costChips: 0 },
  { id: 'sharp', cosmeticKey: null, name: 'Intensos', costChips: 0 },
  { id: 'wink', cosmeticKey: null, name: 'Guiño', costChips: 0 },
  { id: 'closed_calm', cosmeticKey: null, name: 'Zen', costChips: 0 },
  { id: 'shocked', cosmeticKey: null, name: 'Asombrado', costChips: 0 },
  { id: 'crazy', cosmeticKey: null, name: 'Locura', costChips: 0 },
  { id: 'goofy_squint', cosmeticKey: 'eye:goofy_squint', name: 'Pícaro', costChips: 150, tag: 'Humor' },
  { id: 'skeptic', cosmeticKey: 'eye:skeptic', name: 'Calculador', costChips: 250, tag: 'Club' },
  { id: 'hero_white', cosmeticKey: 'eye:hero_white', name: 'Héroe', costChips: 250, tag: 'Cómic' },
  { id: 'rock_smoky', cosmeticKey: 'eye:rock_smoky', name: 'Ahumado Rock', costChips: 350, tag: 'Rock' },
  { id: 'cat_gold', cosmeticKey: 'eye:cat_gold', name: 'Felino Oro', costChips: 450, tag: 'Fantasía' },
  { id: 'laser_red', cosmeticKey: 'eye:laser_red', name: 'Fuego', costChips: 550, tag: 'Cómic' },
  { id: 'hearts', cosmeticKey: 'eye:hearts', name: 'Enamorado', costChips: 600, tag: 'Pop' },
  { id: 'star', cosmeticKey: 'eye:star', name: 'Estelar', costChips: 800, tag: 'VIP' },
];

export const AVATAR_EYEBROW_OPTIONS: AvatarItemOption<AvatarEyebrowId>[] = [
  { id: 'natural', cosmeticKey: null, name: 'Naturales', costChips: 0 },
  { id: 'thick', cosmeticKey: null, name: 'Pobladas', costChips: 0 },
  { id: 'arched', cosmeticKey: null, name: 'Arqueadas', costChips: 0 },
  { id: 'straight', cosmeticKey: null, name: 'Rectas', costChips: 0 },
  { id: 'expressive', cosmeticKey: null, name: 'Expresivas', costChips: 0 },
];

export const AVATAR_NOSE_OPTIONS: AvatarItemOption<AvatarNoseId>[] = [
  { id: 'classic', cosmeticKey: null, name: 'Clásica', costChips: 0 },
  { id: 'small', cosmeticKey: null, name: 'Suave', costChips: 0 },
  { id: 'straight', cosmeticKey: null, name: 'Recta', costChips: 0 },
  { id: 'defined', cosmeticKey: null, name: 'Perfilada', costChips: 0 },
  { id: 'wide', cosmeticKey: null, name: 'Ancha', costChips: 0 },
];

export const AVATAR_MOUTH_OPTIONS: AvatarItemOption<AvatarMouthId>[] = [
  { id: 'smile', cosmeticKey: null, name: 'Sonrisa', costChips: 0 },
  { id: 'grin', cosmeticKey: null, name: 'Radiante', costChips: 0 },
  { id: 'lips', cosmeticKey: null, name: 'Definida', costChips: 0 },
  { id: 'smirk', cosmeticKey: null, name: 'Pícara', costChips: 0 },
  { id: 'smirk_teeth', cosmeticKey: null, name: 'Confiada', costChips: 0 },
  { id: 'calm', cosmeticKey: null, name: 'Serena', costChips: 0 },
  { id: 'laugh', cosmeticKey: null, name: 'Carcajada', costChips: 0 },
  { id: 'tongue', cosmeticKey: null, name: 'Burla', costChips: 0 },
  { id: 'surprised_o', cosmeticKey: null, name: 'Asombro', costChips: 0 },
  { id: 'grumpy', cosmeticKey: null, name: 'Serio', costChips: 0 },
  { id: 'grit', cosmeticKey: null, name: 'Tensión', costChips: 0 },
  { id: 'cat_mouth', cosmeticKey: 'mouth:cat_mouth', name: 'Gatito', costChips: 150, tag: 'Pop' },
  { id: 'buck_teeth', cosmeticKey: 'mouth:buck_teeth', name: 'Simpático', costChips: 200, tag: 'Humor' },
  { id: 'vampire', cosmeticKey: 'mouth:vampire', name: 'Vampiro', costChips: 250, tag: 'Disfraz' },
  { id: 'stitched', cosmeticKey: 'mouth:stitched', name: 'Mimo Rebelde', costChips: 300, tag: 'Disfraz' },
  { id: 'pacifier', cosmeticKey: 'mouth:pacifier', name: 'Bebé', costChips: 350, tag: 'Humor' },
  { id: 'gold_tooth', cosmeticKey: 'mouth:gold_tooth', name: 'Diente de Oro', costChips: 450, tag: 'Flow' },
  { id: 'daisy', cosmeticKey: 'mouth:daisy', name: 'Margarita', costChips: 500, tag: 'Pop' },
  { id: 'wide_villain', cosmeticKey: 'mouth:wide_villain', name: 'Comodín', costChips: 600, tag: 'Cómic' },
  { id: 'rose', cosmeticKey: 'mouth:rose', name: 'Rosa Galante', costChips: 750, tag: 'VIP' },
];

export const AVATAR_HAIR_OPTIONS: AvatarItemOption<AvatarHairId>[] = [
  { id: 'classic', cosmeticKey: null, name: 'Corto Clásico', costChips: 0, affinity: 'masculine' },
  { id: 'textured_crop', cosmeticKey: null, name: 'Crop Textura', costChips: 0, affinity: 'masculine' },
  { id: 'curtain', cosmeticKey: null, name: 'Raya al Medio', costChips: 0, affinity: 'unisex' },
  { id: 'shaggy', cosmeticKey: null, name: 'Flequillo', costChips: 0, affinity: 'unisex' },
  { id: 'side_sweep', cosmeticKey: null, name: 'Peinado Lado', costChips: 0, affinity: 'masculine' },
  { id: 'slick_tail', cosmeticKey: null, name: 'Coleta Baja', costChips: 0, affinity: 'unisex' },
  { id: 'bowl_mod', cosmeticKey: null, name: 'Corte Mod', costChips: 0, affinity: 'masculine' },
  { id: 'messy', cosmeticKey: null, name: 'Casual', costChips: 0, affinity: 'masculine' },
  { id: 'fade', cosmeticKey: null, name: 'Degradado', costChips: 0, affinity: 'masculine' },
  { id: 'straight_long', cosmeticKey: null, name: 'Liso Largo', costChips: 0, affinity: 'feminine' },
  { id: 'waves', cosmeticKey: null, name: 'Ondas Suaves', costChips: 0, affinity: 'feminine' },
  { id: 'bob', cosmeticKey: null, name: 'Bob Chic', costChips: 0, affinity: 'feminine' },
  { id: 'ponytail', cosmeticKey: null, name: 'Coleta Alta', costChips: 0, affinity: 'feminine' },
  { id: 'curls', cosmeticKey: null, name: 'Rizos', costChips: 0, affinity: 'unisex' },
  { id: 'buzz', cosmeticKey: null, name: 'Rapado', costChips: 0, affinity: 'masculine' },
  { id: 'receding', cosmeticKey: null, name: 'Maduro', costChips: 0, affinity: 'masculine' },
  { id: 'bald', cosmeticKey: null, name: 'Rapado Total', costChips: 0, affinity: 'masculine' },
  { id: 'bun', cosmeticKey: 'hair:bun', name: 'Moño Alto', costChips: 150, affinity: 'feminine' },
  { id: 'spiky', cosmeticKey: 'hair:spiky', name: 'Puntas', costChips: 200, affinity: 'masculine' },
  { id: 'afro', cosmeticKey: 'hair:afro', name: 'Afro Esculpido', costChips: 250, affinity: 'unisex' },
  { id: 'wavy_part', cosmeticKey: 'hair:wavy_part', name: 'Onda Club', costChips: 300, affinity: 'unisex' },
  { id: 'braids', cosmeticKey: 'hair:braids', name: 'Trenzas Oro', costChips: 400, affinity: 'feminine' },
  { id: 'spiky_wild', cosmeticKey: 'hair:spiky_wild', name: 'Punk Rebelde', costChips: 450, tag: 'Rock', affinity: 'masculine' },
  { id: 'samurai_bun', cosmeticKey: 'hair:samurai_bun', name: 'Top-Knot', costChips: 550, tag: 'Estilo', affinity: 'masculine' },
  { id: 'pompadour', cosmeticKey: 'hair:pompadour', name: 'Copete Retro', costChips: 600, tag: 'Retro', affinity: 'masculine' },
  { id: 'dreads_band', cosmeticKey: 'hair:dreads_band', name: 'Dreads & Vincha', costChips: 650, tag: 'Flow', affinity: 'unisex' },
  { id: 'rocker_long', cosmeticKey: 'hair:rocker_long', name: 'Melena Rock', costChips: 800, tag: 'Rock', affinity: 'unisex' },
];

export const AVATAR_FACIAL_OPTIONS: AvatarItemOption<AvatarFacialId>[] = [
  { id: 'none', cosmeticKey: null, name: 'Ninguno', costChips: 0, affinity: 'unisex' },
  { id: 'blush', cosmeticKey: null, name: 'Rubor & Perlas', costChips: 0, affinity: 'feminine' },
  { id: 'freckles', cosmeticKey: null, name: 'Pecas', costChips: 0, affinity: 'unisex' },
  { id: 'stubble', cosmeticKey: null, name: 'Barba de 3 días', costChips: 0, affinity: 'masculine' },
  { id: 'hoops', cosmeticKey: 'facial:hoops', name: 'Aros de Oro', costChips: 200, tag: 'Club', affinity: 'feminine' },
  { id: 'beard', cosmeticKey: 'facial:beard', name: 'Barba Cerrada', costChips: 180, affinity: 'masculine' },
  { id: 'mustache', cosmeticKey: 'facial:mustache', name: 'Bigote Don', costChips: 250, tag: 'Caribe', affinity: 'masculine' },
  { id: 'goatee', cosmeticKey: 'facial:goatee', name: 'Candado', costChips: 350, affinity: 'masculine' },
  { id: 'dali', cosmeticKey: 'facial:dali', name: 'Bigote Imperial', costChips: 450, tag: 'Arte', affinity: 'masculine' },
  { id: 'pirate_beard', cosmeticKey: 'facial:pirate_beard', name: 'Barba Corsario', costChips: 750, tag: 'Aventura', affinity: 'masculine' },
];

export const AVATAR_OUTFIT_OPTIONS: AvatarItemOption<AvatarOutfitId>[] = [
  { id: 'guayabera', cosmeticKey: null, name: 'Guayabera Habana', costChips: 0, tag: 'Caribe', affinity: 'unisex' },
  { id: 'tee', cosmeticKey: null, name: 'Remera Básica', costChips: 0, affinity: 'unisex' },
  { id: 'vneck', cosmeticKey: null, name: 'Cuello en V', costChips: 0, affinity: 'unisex' },
  { id: 'tank', cosmeticKey: null, name: 'Musculosa', costChips: 0, affinity: 'unisex' },
  { id: 'stripes', cosmeticKey: null, name: 'Marinero', costChips: 0, affinity: 'unisex' },
  { id: 'blouse', cosmeticKey: null, name: 'Blusa & Perla', costChips: 0, affinity: 'feminine' },
  { id: 'polo', cosmeticKey: null, name: 'Polo Club', costChips: 0, affinity: 'masculine' },
  { id: 'sweater', cosmeticKey: null, name: 'Suéter Tejido', costChips: 0, affinity: 'unisex' },
  { id: 'tie_shirt', cosmeticKey: 'outfit:tie_shirt', name: 'Camisa & Corbata', costChips: 250, affinity: 'masculine' },
  { id: 'hoodie', cosmeticKey: 'outfit:hoodie', name: 'Hoodie Urbano', costChips: 300, tag: 'Flow', affinity: 'unisex' },
  { id: 'flannel', cosmeticKey: 'outfit:flannel', name: 'Leñador Tartán', costChips: 300, tag: 'Casual', affinity: 'masculine' },
  { id: 'rock_skull', cosmeticKey: 'outfit:rock_skull', name: 'Camiseta Rock', costChips: 350, tag: 'Rock', affinity: 'unisex' },
  { id: 'hawaiian_floral', cosmeticKey: 'outfit:hawaiian_floral', name: 'Camisa Tropical', costChips: 400, tag: 'Caribe', affinity: 'unisex' },
  { id: 'open_shirt', cosmeticKey: 'outfit:open_shirt', name: 'Lino Abierto', costChips: 450, tag: 'Brisa', affinity: 'masculine' },
  { id: 'suspenders', cosmeticKey: 'outfit:suspenders', name: 'Tirantes Swing', costChips: 450, tag: 'Retro', affinity: 'masculine' },
  { id: 'ballet', cosmeticKey: 'outfit:ballet', name: 'Corsé Danza', costChips: 500, tag: 'Arte', affinity: 'feminine' },
  { id: 'vest_bowtie', cosmeticKey: 'outfit:vest_bowtie', name: 'Chaleco & Moño', costChips: 550, tag: 'Salón', affinity: 'masculine' },
  { id: 'kimono', cosmeticKey: 'outfit:kimono', name: 'Kimono Seda', costChips: 700, tag: 'Mundo', affinity: 'unisex' },
  { id: 'jacket', cosmeticKey: 'outfit:jacket', name: 'Chaqueta Cuero', costChips: 700, tag: 'Rock', affinity: 'unisex' },
  { id: 'pirate', cosmeticKey: 'outfit:pirate', name: 'Túnica Corsario', costChips: 850, tag: 'Pirata', affinity: 'unisex' },
  { id: 'winter_fur', cosmeticKey: 'outfit:winter_fur', name: 'Abrigo Nórdico', costChips: 950, tag: 'Mundo', affinity: 'unisex' },
  { id: 'princess', cosmeticKey: 'outfit:princess', name: 'Gala Real', costChips: 1100, tag: 'Gala', affinity: 'feminine' },
  { id: 'blazer', cosmeticKey: 'outfit:blazer', name: 'Blazer Club', costChips: 1200, tag: 'Elegante', affinity: 'unisex' },
  { id: 'carnival', cosmeticKey: 'outfit:carnival', name: 'Reina Carnaval', costChips: 1400, tag: 'Fiesta', affinity: 'feminine' },
  { id: 'pharaoh', cosmeticKey: 'outfit:pharaoh', name: 'Faraón Dorado', costChips: 1800, tag: 'Disfraz', affinity: 'unisex' },
  { id: 'queen', cosmeticKey: 'outfit:queen', name: 'Emperatriz', costChips: 2400, tag: 'VIP', affinity: 'feminine' },
  { id: 'royal_tux', cosmeticKey: 'outfit:royal_tux', name: 'Smoking Dorado', costChips: 6500, tag: 'Élite', affinity: 'masculine' },
];

export const AVATAR_GLASSES_OPTIONS: AvatarItemOption<AvatarGlassesId>[] = [
  { id: 'none', cosmeticKey: null, name: 'Ninguno', costChips: 0 },
  { id: 'round', cosmeticKey: 'glasses:round', name: 'Carey Redondas', costChips: 150, tag: 'Club' },
  { id: 'square', cosmeticKey: 'glasses:square', name: 'Pasta Clásica', costChips: 200 },
  { id: 'cat_eye', cosmeticKey: 'glasses:cat_eye', name: 'Ojo de Gato', costChips: 300, tag: 'Retro' },
  { id: 'hearts_shades', cosmeticKey: 'glasses:hearts_shades', name: 'Corazón Pop', costChips: 400, tag: 'Pop' },
  { id: 'aviator', cosmeticKey: 'glasses:aviator', name: 'Aviador Oro', costChips: 550, tag: 'Caribe' },
  { id: 'wayfarer', cosmeticKey: 'glasses:wayfarer', name: 'Sol Nocturnas', costChips: 900, tag: 'Rock' },
  { id: 'pixel_boss', cosmeticKey: 'glasses:pixel_boss', name: '8-Bit Jefe', costChips: 1100, tag: 'Humor' },
  { id: 'star_party', cosmeticKey: 'glasses:star_party', name: 'Estrella Fiesta', costChips: 1400, tag: 'Fiesta' },
  { id: 'monocle', cosmeticKey: 'glasses:monocle', name: 'Monóculo Real', costChips: 2200, tag: 'Gala' },
  { id: 'gold_visor', cosmeticKey: 'glasses:gold_visor', name: 'Visor Dorado', costChips: 3500, tag: 'VIP' },
];

export const AVATAR_HAT_OPTIONS: AvatarItemOption<AvatarHatId>[] = [
  { id: 'none', cosmeticKey: null, name: 'Ninguno', costChips: 0 },
  { id: 'cap', cosmeticKey: 'hat:cap', name: 'Gorra Club', costChips: 200 },
  { id: 'flower', cosmeticKey: 'hat:flower', name: 'Cayena Tropical', costChips: 300, tag: 'Caribe' },
  { id: 'headband', cosmeticKey: 'hat:headband', name: 'Diadema Perlas', costChips: 350 },
  { id: 'beanie', cosmeticKey: 'hat:beanie', name: 'Gorro Urbano', costChips: 450, tag: 'Flow' },
  { id: 'bandana', cosmeticKey: 'hat:bandana', name: 'Bandana Pirata', costChips: 500, tag: 'Pirata' },
  { id: 'panama', cosmeticKey: 'hat:panama', name: 'Sombrero Panamá', costChips: 650, tag: 'Caribe' },
  { id: 'beret', cosmeticKey: 'hat:beret', name: 'Boina Bohemio', costChips: 750, tag: 'Arte' },
  { id: 'dj_phones', cosmeticKey: 'hat:dj_phones', name: 'Audífonos Studio', costChips: 950, tag: 'Flow' },
  { id: 'chef', cosmeticKey: 'hat:chef', name: 'Gran Chef', costChips: 1200, tag: 'Humor' },
  { id: 'fedora', cosmeticKey: 'hat:fedora', name: 'Fedora Nocturno', costChips: 1500, tag: 'Gala' },
  { id: 'captain', cosmeticKey: 'hat:captain', name: 'Capitán de Mar', costChips: 1800, tag: 'Aventura' },
  { id: 'crown', cosmeticKey: 'hat:crown', name: 'Corona Real', costChips: 12000, tag: 'Leyenda' },
];

export interface AvatarFrameOption extends AvatarItemOption<AvatarFrameId> {
  bgTop: string;
  bgBottom: string;
  ringColor: string;
  isLightBackdrop?: boolean;
  hasSparkles?: boolean;
}

export const AVATAR_FRAME_OPTIONS: AvatarFrameOption[] = [
  {
    id: 'studio_cream',
    cosmeticKey: null,
    name: 'Lino Crema',
    costChips: 0,
    bgTop: '#FFF9ED',
    bgBottom: '#EAD7B9',
    ringColor: '#F5C451',
    isLightBackdrop: true,
  },
  {
    id: 'sky_light',
    cosmeticKey: null,
    name: 'Brisa Marina',
    costChips: 0,
    bgTop: '#E0F2FE',
    bgBottom: '#93C5FD',
    ringColor: '#38BDF8',
    isLightBackdrop: true,
  },
  {
    id: 'mint_fresh',
    cosmeticKey: null,
    name: 'Jade Suave',
    costChips: 0,
    bgTop: '#DCFCE7',
    bgBottom: '#86EFAC',
    ringColor: '#10B981',
    isLightBackdrop: true,
  },
  {
    id: 'lavender',
    cosmeticKey: null,
    name: 'Malva',
    costChips: 0,
    bgTop: '#F3E8FF',
    bgBottom: '#C4B5FD',
    ringColor: '#A855F7',
    isLightBackdrop: true,
  },
  {
    id: 'peach_sun',
    cosmeticKey: 'frame:peach_sun',
    name: 'Atardecer Coral',
    costChips: 250,
    bgTop: '#FFEDD5',
    bgBottom: '#FDBA74',
    ringColor: '#FB923C',
    isLightBackdrop: true,
  },
  {
    id: 'pearl_gray',
    cosmeticKey: 'frame:pearl_gray',
    name: 'Plata Estudio',
    costChips: 400,
    bgTop: '#F8FAFC',
    bgBottom: '#CBD5E1',
    ringColor: '#94A3B8',
    isLightBackdrop: true,
  },
  {
    id: 'neon_glow',
    cosmeticKey: 'frame:neon_glow',
    name: 'Noche Rock',
    costChips: 900,
    bgTop: '#4338CA',
    bgBottom: '#1E1B4B',
    ringColor: '#E879F9',
    hasSparkles: true,
    tag: 'Rock',
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
    name: 'Aurora Boreal',
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
    name: 'Leyenda Imperial',
    costChips: 22000,
    bgTop: '#FEF08A',
    bgBottom: '#9333EA',
    ringColor: '#FDE047',
    isLightBackdrop: true,
    hasSparkles: true,
    tag: 'Leyenda',
  },
];

/** Curated 1-tap Thematic Persona Packs ("Looks") to inspire creative self-expression */
export interface AvatarThematicLook {
  id: string;
  name: string;
  tag: string;
  subtitle: string;
  build: (base: AvatarConfig) => AvatarConfig;
}

export const AVATAR_THEMATIC_LOOKS: AvatarThematicLook[] = [
  {
    id: 'habana_social',
    name: 'Clásico Habana',
    tag: 'Caribe',
    subtitle: 'Guayabera de lino, Panamá y elegancia tropical',
    build: (base) => ({
      ...base,
      hair: base.bodyType === 'feminine' ? 'waves' : 'wavy_part',
      eyeStyle: base.bodyType === 'feminine' ? 'almond' : 'relaxed',
      mouth: 'smirk_teeth',
      facial: base.bodyType === 'feminine' ? 'hoops' : 'mustache',
      outfit: 'guayabera',
      outfitColor: '#F8FAFC',
      glasses: 'aviator',
      hat: base.bodyType === 'feminine' ? 'flower' : 'panama',
      frame: 'studio_cream',
    }),
  },
  {
    id: 'leyenda_rock',
    name: 'Estrella de Rock',
    tag: 'Rock',
    subtitle: 'Chaqueta de cuero, mirada intensa y actitud',
    build: (base) => ({
      ...base,
      hair: base.bodyType === 'feminine' ? 'rocker_long' : 'spiky_wild',
      hairColor: '#1C202B',
      eyeStyle: 'rock_smoky',
      mouth: 'smirk',
      facial: base.bodyType === 'feminine' ? 'blush' : 'stubble',
      outfit: 'jacket',
      outfitColor: '#F43F5E',
      glasses: 'wayfarer',
      hat: 'none',
      frame: 'neon_glow',
    }),
  },
  {
    id: 'capitan_corsario',
    name: 'Corsario del Caribe',
    tag: 'Pirata',
    subtitle: 'Bandana roja, túnica de aventura y diente de oro',
    build: (base) => ({
      ...base,
      hair: base.bodyType === 'feminine' ? 'braids' : 'slick_tail',
      eyeStyle: 'skeptic',
      mouth: 'gold_tooth',
      facial: base.bodyType === 'feminine' ? 'hoops' : 'pirate_beard',
      outfit: 'pirate',
      glasses: 'none',
      hat: 'bandana',
      frame: 'peach_sun',
    }),
  },
  {
    id: 'fiesta_tropical',
    name: 'Reina & Rey Carnaval',
    tag: 'Fiesta',
    subtitle: 'Colorido vibrante, gafas estrella y alegría pura',
    build: (base) => ({
      ...base,
      hair: base.bodyType === 'feminine' ? 'curls' : 'afro',
      eyeStyle: 'bright',
      mouth: 'laugh',
      facial: base.bodyType === 'feminine' ? 'hoops' : 'goatee',
      outfit: base.bodyType === 'feminine' ? 'carnival' : 'hawaiian_floral',
      outfitColor: '#10B981',
      glasses: 'star_party',
      hat: base.bodyType === 'feminine' ? 'flower' : 'none',
      frame: 'mint_fresh',
    }),
  },
  {
    id: 'flow_urbano',
    name: 'Flow Estudio',
    tag: 'Flow',
    subtitle: 'Hoodie, audífonos de estudio y estilo callejero',
    build: (base) => ({
      ...base,
      hair: base.bodyType === 'feminine' ? 'braids' : 'dreads_band',
      eyeStyle: 'wink',
      mouth: 'smirk_teeth',
      facial: 'freckles',
      outfit: 'hoodie',
      outfitColor: '#8B5CF6',
      glasses: 'round',
      hat: 'dj_phones',
      frame: 'aurora',
    }),
  },
  {
    id: 'gala_imperial',
    name: 'Gala de Leyenda',
    tag: 'Leyenda',
    subtitle: 'Corona real, traje de etiqueta y marco de oro',
    build: (base) => ({
      ...base,
      hair: base.bodyType === 'feminine' ? 'bun' : 'pompadour',
      eyeStyle: 'star',
      mouth: 'rose',
      facial: base.bodyType === 'feminine' ? 'hoops' : 'dali',
      outfit: base.bodyType === 'feminine' ? 'queen' : 'royal_tux',
      outfitColor: '#7E224C',
      glasses: 'monocle',
      hat: 'crown',
      frame: 'gold_prestige',
    }),
  },
];

export const EYE_STYLES_WITHOUT_IRIS_COLOR = new Set<AvatarEyeStyleId>([
  'hearts',
  'hero_white',
  'laser_red',
  'cat_gold',
  'closed_calm',
  'shocked',
]);

export const OUTFITS_WITH_FIXED_COLOR = new Set<AvatarOutfitId>([
  'flannel',
  'rock_skull',
  'pirate',
  'pharaoh',
  'royal_tux',
]);

export function sortOptionsForBodyType<T extends string>(
  items: AvatarItemOption<T>[],
  bodyType: AvatarBodyType,
  ownedSet?: Set<string>
): AvatarItemOption<T>[] {
  const affinityRank = (item: AvatarItemOption<T>) => {
    const aff = item.affinity ?? 'unisex';
    if (aff === bodyType) return 0;
    if (aff === 'unisex') return 1;
    return 2;
  };

  const isOwnedOrFree = (item: AvatarItemOption<T>) =>
    !item.cosmeticKey || item.costChips === 0 || Boolean(ownedSet?.has(item.cosmeticKey));

  return [...items].sort((a, b) => {
    if (a.id === 'none' && b.id !== 'none') return -1;
    if (b.id === 'none' && a.id !== 'none') return 1;

    const aOwned = isOwnedOrFree(a);
    const bOwned = isOwnedOrFree(b);
    if (aOwned !== bOwned) return aOwned ? -1 : 1;

    const aAff = affinityRank(a);
    const bAff = affinityRank(b);
    if (aAff !== bAff) return aAff - bAff;

    if (!aOwned && !bOwned && a.costChips !== b.costChips) {
      return a.costChips - b.costChips;
    }
    return 0;
  });
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

// Backwards-compatibility mappings so earlier saved configs migrate seamlessly
const LEGACY_SKIN_MAP: Record<string, AvatarSkinToneId> = {
  porcelana: 'marfil',
  triguena: 'calido',
  miel: 'calido',
  dorado: 'calido',
  bronce: 'canela',
};
const LEGACY_EYE_MAP: Record<string, AvatarEyeStyleId> = {
  natural: 'classic',
  lashes: 'almond',
  warm: 'bright',
  fierce: 'focused',
};
const LEGACY_OUTFIT_MAP: Record<string, AvatarOutfitId> = {
  hawaiian: 'hawaiian_floral',
  collar_gold: 'vneck',
};
const LEGACY_HAT_MAP: Record<string, AvatarHatId> = {
  hibiscus: 'flower',
  vueltiao: 'panama',
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
