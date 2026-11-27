/**
 * "Club Caribe 2.0" Design System Tokens
 * Nocturnal Latin domino parlor: warm obsidian-teal room, tactile velvet felt with overhead lamp glow,
 * lacquered mahogany/walnut rails, engraved porcelain ivory & sculpted ebony tiles, brushed brass inlays.
 */
export const CLUB = {
  // Room & Ambient Surfaces (Unified Warm Nocturnal Sobremesa Club — see DESIGN_LANGUAGE.md)
  roomBgTop: '#071419',
  roomBgMid: '#0B2027',
  roomBgBottom: '#061116',
  surfaceDeep: 'rgba(8, 22, 28, 0.78)',
  surfaceCard: '#0F252E',
  surfaceCardLight: '#163340',
  surfaceElevated: '#1F4454',

  // Smoked Glass Hairlines & Warm Brass Highlights
  glassBg: 'rgba(13, 32, 40, 0.78)',
  glassBgStrong: 'rgba(9, 22, 28, 0.95)',
  glassBorder: 'rgba(245, 214, 138, 0.20)',
  borderSubtle: 'rgba(226, 232, 240, 0.14)',
  borderWarm: 'rgba(245, 196, 81, 0.56)',
  surfaceHighlight: 'rgba(255, 243, 214, 0.22)',

  // Default Table Felt
  feltCenter: '#14626A',
  feltEdge: '#09343E',
  feltLine: 'rgba(245, 214, 138, 0.20)',

  // Lacquered Mahogany Wood Rail & Rack
  woodLight: '#C57B42',
  woodMid: '#8C4B20',
  woodDark: '#47210B',
  woodHighlight: 'rgba(255, 232, 194, 0.34)',
  rackTop: '#713B18',
  rackBottom: '#3A1B08',

  // Semantic Accents (Strict 60/30/10 hierarchy)
  gold: '#F5C451',
  goldDark: '#B37B14',
  goldSoft: '#FCE39C',
  brass: '#D4A84B',
  emerald: '#27D188',
  emeraldDark: '#128554',
  emeraldDeep: '#06472D',
  cyan: '#38BDF8',
  cyanGlow: 'rgba(56, 189, 248, 0.30)',
  cobalt: '#2563EB',
  cobaltDark: '#1D4ED8',
  amber: '#FF9240',
  amberDark: '#C2590B',
  coral: '#F43F5E',
  coralDark: '#AD1A35',
  violet: '#7C3AED',
  violetDark: '#521EAB',

  // Tiles: Sculpted Porcelain Ivory vs Matte Obsidian Ebony
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

  // Ghost Preview
  ghostFill: 'rgba(56, 189, 248, 0.28)',
  ghostBorder: '#7DD3FC',
  ghostHoverFill: 'rgba(245, 196, 81, 0.48)',
  ghostHoverBorder: '#F5C451',

  // Typography (WCAG AA+ contrast on dark warm surfaces)
  textPrimary: '#F8FAFC',
  textSecondary: '#B9C8D9',
  textMuted: '#7E95AE',
  textInk: '#0D1520',
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

// High-contrast jewel pips on ebony dark tiles
export const EBONY_PIP_COLORS: Record<number, string> = {
  0: '#94A3B8',
  1: '#60A5FA',
  2: '#4ADE80',
  3: '#FB7185',
  4: '#FBBF24',
  5: '#C084FC',
  6: '#F1F5F9',
};
