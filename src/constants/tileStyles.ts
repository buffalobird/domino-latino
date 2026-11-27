import { EBONY_PIP_COLORS, PIP_COLORS } from './tokens';

export type TileStyleId =
  | 'marfil'
  | 'perla'
  | 'jade'
  | 'caoba_crema'
  | 'ebano_oro'
  | 'diamante';

export interface TileStyleConfig {
  id: TileStyleId;
  cosmeticKey: string | null;
  name: string;
  subtitle: string;
  costChips: number;
  tag?: string;
  isDarkFace?: boolean;
  /** Front face 3-stop gradient */
  faceGradient: [string, string, string];
  borderColor: string;
  bottomLipColor: string;
  playableBorderColor: string;
  playableLipColor: string;
  dividerColor: string;
  dividerHighlight: string;
  spinnerGradient: [string, string, string];
  spinnerBorder: string;
  specularColor: string;
  /** Boneyard back 3-stop gradient + filigree stroke */
  backGradient: [string, string, string];
  backBorderColor: string;
  backLipColor: string;
  backFiligreeStroke: string;
  backFiligreeFill: string;
  /** Pip colors map 1..6 */
  pipColors: Record<number, string>;
}

const PEARL_PIPS: Record<number, string> = {
  1: '#0284C7',
  2: '#0F766E',
  3: '#DC2626',
  4: '#4F46E5',
  5: '#D97706',
  6: '#0F172A',
};

const VINTAGE_PIPS: Record<number, string> = {
  1: '#991B1B',
  2: '#1E3A5F',
  3: '#92400E',
  4: '#14532D',
  5: '#581C87',
  6: '#1C1917',
};

const GOLD_ON_DARK_PIPS: Record<number, string> = {
  1: '#FDE047',
  2: '#38BDF8',
  3: '#FB7185',
  4: '#34D399',
  5: '#FBBF24',
  6: '#FFFBEB',
};

const SAPPHIRE_PIPS: Record<number, string> = {
  1: '#FDE68A',
  2: '#7DD3FC',
  3: '#F9A8D4',
  4: '#6EE7B7',
  5: '#FCD34D',
  6: '#FFFFFF',
};

/**
 * Collectible Domino Tile Sets (100% soft-currency Club Chips, zero gameplay advantage).
 * Spans a motivating long-tail ladder from Free up to 18,000 Club Chips.
 */
export const TILE_STYLES: Record<TileStyleId, TileStyleConfig> = {
  marfil: {
    id: 'marfil',
    cosmeticKey: null,
    name: 'Marfil Real',
    subtitle: 'Porcelana marfil clásica con clavija de latón',
    costChips: 0,
    faceGradient: ['#FFFFFF', '#FBF6EC', '#EAE0CB'],
    borderColor: '#DDD1BC',
    bottomLipColor: '#B5A287',
    playableBorderColor: '#EBD39A',
    playableLipColor: '#B89E68',
    dividerColor: '#B4A387',
    dividerHighlight: 'rgba(255, 255, 255, 0.78)',
    spinnerGradient: ['#FFF5BF', '#D9AE4E', '#8C6516'],
    spinnerBorder: '#8A6416',
    specularColor: 'rgba(255, 255, 255, 0.95)',
    backGradient: ['#FFFFFF', '#FBF6EC', '#E7DBC3'],
    backBorderColor: '#DFD2BC',
    backLipColor: '#B5A287',
    backFiligreeStroke: '#CBB999',
    backFiligreeFill: 'rgba(212, 197, 170, 0.14)',
    pipColors: PIP_COLORS,
  },
  perla: {
    id: 'perla',
    cosmeticKey: 'tile:perla',
    name: 'Perla Marina',
    subtitle: 'Nácar blanco helado con clavija de plata',
    costChips: 400,
    faceGradient: ['#FFFFFF', '#F4F8FC', '#DCE6F2'],
    borderColor: '#C5D5E8',
    bottomLipColor: '#91A8C2',
    playableBorderColor: '#93C5FD',
    playableLipColor: '#60A5FA',
    dividerColor: '#94A3B8',
    dividerHighlight: 'rgba(255, 255, 255, 0.85)',
    spinnerGradient: ['#FFFFFF', '#CBD5E1', '#64748B'],
    spinnerBorder: '#64748B',
    specularColor: 'rgba(255, 255, 255, 0.98)',
    backGradient: ['#FFFFFF', '#F1F6FC', '#D6E3F0'],
    backBorderColor: '#C5D5E8',
    backLipColor: '#91A8C2',
    backFiligreeStroke: '#94AEC9',
    backFiligreeFill: 'rgba(148, 174, 201, 0.15)',
    pipColors: PEARL_PIPS,
  },
  jade: {
    id: 'jade',
    cosmeticKey: 'tile:jade',
    name: 'Jade Caribe',
    subtitle: 'Porcelana celadón suave y esmalte torneo',
    costChips: 1400,
    tag: 'Caribe',
    faceGradient: ['#F5FDF9', '#E2F5EC', '#C3E6D6'],
    borderColor: '#9BD1B9',
    bottomLipColor: '#639E85',
    playableBorderColor: '#6EE7B7',
    playableLipColor: '#34D399',
    dividerColor: '#6CA68E',
    dividerHighlight: 'rgba(255, 255, 255, 0.72)',
    spinnerGradient: ['#FEF3C7', '#EAB308', '#854D0E'],
    spinnerBorder: '#854D0E',
    specularColor: 'rgba(255, 255, 255, 0.88)',
    backGradient: ['#F5FDF9', '#E0F4EA', '#BFE3D2'],
    backBorderColor: '#9BD1B9',
    backLipColor: '#639E85',
    backFiligreeStroke: '#6CA68E',
    backFiligreeFill: 'rgba(108, 166, 142, 0.16)',
    pipColors: PIP_COLORS,
  },
  caoba_crema: {
    id: 'caoba_crema',
    cosmeticKey: 'tile:caoba_crema',
    name: 'Vintage Habana',
    subtitle: 'Hueso envejecido y clavija de bronce antiguo',
    costChips: 3200,
    tag: 'Club',
    faceGradient: ['#FFF8E8', '#F2E0BD', '#D8BC8B'],
    borderColor: '#C4A472',
    bottomLipColor: '#8E6F42',
    playableBorderColor: '#FCD34D',
    playableLipColor: '#B45309',
    dividerColor: '#9C7E52',
    dividerHighlight: 'rgba(255, 248, 224, 0.65)',
    spinnerGradient: ['#FDE68A', '#B45309', '#5C2908'],
    spinnerBorder: '#69320C',
    specularColor: 'rgba(255, 250, 232, 0.82)',
    backGradient: ['#FFF8E8', '#EEDAB3', '#D4B684'],
    backBorderColor: '#C4A472',
    backLipColor: '#8E6F42',
    backFiligreeStroke: '#9E7F52',
    backFiligreeFill: 'rgba(158, 127, 82, 0.16)',
    pipColors: VINTAGE_PIPS,
  },
  ebano_oro: {
    id: 'ebano_oro',
    cosmeticKey: 'tile:ebano_oro',
    name: 'Obsidiana & Oro',
    subtitle: 'Ébano pulido con puntos dorados de gala',
    costChips: 8500,
    tag: 'Élite',
    isDarkFace: true,
    faceGradient: ['#303B4E', '#1B2433', '#0D131D'],
    borderColor: '#64748B',
    bottomLipColor: '#05080F',
    playableBorderColor: '#F5C451',
    playableLipColor: '#B45309',
    dividerColor: 'rgba(245, 196, 81, 0.55)',
    dividerHighlight: 'rgba(255, 255, 255, 0.12)',
    spinnerGradient: ['#FEF9C3', '#F5C451', '#92400E'],
    spinnerBorder: '#92400E',
    specularColor: 'rgba(255, 255, 255, 0.24)',
    backGradient: ['#2B3649', '#192231', '#0C121C'],
    backBorderColor: '#6B582E',
    backLipColor: '#060A12',
    backFiligreeStroke: '#D9AE4E',
    backFiligreeFill: 'rgba(245, 196, 81, 0.14)',
    pipColors: GOLD_ON_DARK_PIPS,
  },
  diamante: {
    id: 'diamante',
    cosmeticKey: 'tile:diamante',
    name: 'Zafiro Imperial',
    subtitle: 'Porcelana azul rey con puntos de platino',
    costChips: 18000,
    tag: 'Leyenda',
    isDarkFace: true,
    faceGradient: ['#1E40AF', '#152B75', '#0B1845'],
    borderColor: '#60A5FA',
    bottomLipColor: '#070F2D',
    playableBorderColor: '#7DD3FC',
    playableLipColor: '#0284C7',
    dividerColor: 'rgba(147, 197, 253, 0.55)',
    dividerHighlight: 'rgba(255, 255, 255, 0.16)',
    spinnerGradient: ['#FFFFFF', '#BAE6FD', '#0284C7'],
    spinnerBorder: '#0369A1',
    specularColor: 'rgba(224, 242, 254, 0.34)',
    backGradient: ['#1D4ED8', '#152E7A', '#0A1742'],
    backBorderColor: '#60A5FA',
    backLipColor: '#060E2A',
    backFiligreeStroke: '#93C5FD',
    backFiligreeFill: 'rgba(147, 197, 253, 0.16)',
    pipColors: SAPPHIRE_PIPS,
  },
};

export const TILE_STYLE_LIST: TileStyleConfig[] = [
  TILE_STYLES.marfil,
  TILE_STYLES.perla,
  TILE_STYLES.jade,
  TILE_STYLES.caoba_crema,
  TILE_STYLES.ebano_oro,
  TILE_STYLES.diamante,
];

export const TILE_STYLE_PRICES: Record<string, number> = Object.fromEntries(
  TILE_STYLE_LIST.filter((t) => t.cosmeticKey && t.costChips > 0).map((t) => [
    t.cosmeticKey!,
    t.costChips,
  ])
);

export function getTileStyle(id?: TileStyleId | null): TileStyleConfig {
  if (id && id in TILE_STYLES) return TILE_STYLES[id];
  return TILE_STYLES.marfil;
}

export { EBONY_PIP_COLORS };
