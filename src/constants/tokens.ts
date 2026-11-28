/**
 * "Dominó Latino" Design System Tokens & Rounded Tactile Typography
 * Warm nocturnal parlor ("Noche de Club") + sunlit terrace ("Día Brisa"),
 * tactile porcelain ivory tiles, brushed brass spinner pins, and rounded playful typography.
 */

export const FONT = {
  /** Sculpted rounded display font (titles, scores, primary CTAs, "¡DOMINÓ!") */
  display: 'Fredoka-Bold',
  displaySemi: 'Fredoka-SemiBold',
  /** Crisp rounded-humanist UI family (headings, buttons, chips, body, tabular numbers) */
  black: 'Nunito-Black',
  extraBold: 'Nunito-ExtraBold',
  bold: 'Nunito-Bold',
  semi: 'Nunito-SemiBold',
} as const;

export const CLUB = {
  // Room & Ambient Surfaces (Warm Nocturnal Sobremesa Parlor)
  roomBgTop: '#0A1A22',
  roomBgMid: '#0E242E',
  roomBgBottom: '#071319',
  surfaceDeep: 'rgba(8, 22, 28, 0.82)',
  surfaceCard: '#132C38',
  surfaceCardLight: '#183746',
  surfaceElevated: '#1F4557',

  // Smoked Glass Hairlines & Warm Brass Highlights
  glassBg: 'rgba(14, 34, 43, 0.84)',
  glassBgStrong: 'rgba(11, 27, 35, 0.96)',
  glassBorder: 'rgba(245, 214, 138, 0.22)',
  borderSubtle: 'rgba(226, 232, 240, 0.14)',
  borderWarm: 'rgba(245, 196, 81, 0.56)',
  surfaceHighlight: 'rgba(255, 243, 214, 0.22)',

  // Default Table Felt
  feltCenter: '#14626A',
  feltEdge: '#09343E',
  feltLine: 'rgba(245, 214, 138, 0.22)',

  // Lacquered Mahogany Wood Rail & Rack
  woodLight: '#C57B42',
  woodMid: '#8C4B20',
  woodDark: '#47210B',
  woodHighlight: 'rgba(255, 232, 194, 0.34)',
  rackTop: '#713B18',
  rackBottom: '#3A1B08',

  // Semantic Accents
  gold: '#F5C451',
  goldDark: '#B37B14',
  goldSoft: '#FCE39C',
  brass: '#D4A84B',
  emerald: '#22C57E',
  emeraldDark: '#0F7A4A',
  emeraldDeep: '#06472D',
  cyan: '#38BDF8',
  cyanGlow: 'rgba(56, 189, 248, 0.30)',
  cobalt: '#2563EB',
  cobaltDark: '#1D4ED8',
  amber: '#F59E0B',
  amberDark: '#B45309',
  coral: '#F43F5E',
  coralDark: '#AD1A35',
  violet: '#7C3AED',
  violetDark: '#521EAB',

  // Tiles: Sculpted Porcelain Ivory
  ivoryTop: '#FFFDF9',
  ivoryBottom: '#EFE7D6',
  ivoryBorder: '#D8CBB4',
  ivoryLip: '#B5A288',
  ivoryInnerRim: 'rgba(255, 255, 255, 0.92)',
  brassPin: '#D4AA4E',
  brassPinEdge: '#8A6619',

  ebonyTop: '#24303E',
  ebonyBottom: '#151D27',
  ebonyBorder: '#344458',
  ebonyLip: '#0B1017',

  // Warm Luminous Ghost Preview on Felt
  ghostFill: 'rgba(255, 248, 225, 0.22)',
  ghostBorder: 'rgba(252, 227, 156, 0.82)',
  ghostHoverFill: 'rgba(245, 196, 81, 0.44)',
  ghostHoverBorder: '#FFD166',

  // Typography
  textPrimary: '#FFFDF9',
  textSecondary: '#BDD0DC',
  textMuted: '#7F99AA',
  textInk: '#0B1922',
} as const;

export const PIP_COLORS: Record<number, string> = {
  0: '#1E293B',
  1: '#1D4ED8', // Deep Cobalt
  2: '#15803D', // Rich Forest Emerald
  3: '#C81E2B', // Classic Crimson
  4: '#C26706', // Warm Ochre Amber
  5: '#6D28D9', // Royal Violet
  6: '#111827', // Obsidian Ink
};

// High-contrast jewel pips for dark luxury sets
export const EBONY_PIP_COLORS: Record<number, string> = {
  0: '#94A3B8',
  1: '#60A5FA',
  2: '#4ADE80',
  3: '#FB7185',
  4: '#FBBF24',
  5: '#C084FC',
  6: '#F1F5F9',
};
