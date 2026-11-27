/**
 * "Club Caribe 2.0" Design System Tokens
 * Nocturnal Latin domino parlor: warm obsidian-teal room, tactile velvet felt with overhead lamp glow,
 * lacquered mahogany/walnut rails, engraved porcelain ivory & sculpted ebony tiles, brushed brass inlays.
 */
export const CLUB = {
  // Room & Ambient Surfaces (3 clean tonal layers — eliminates generic cold SaaS dark blue)
  roomBgTop: '#07111B',
  roomBgBottom: '#0E1D2B',
  surfaceDeep: '#0B1622',
  surfaceCard: '#122130',
  surfaceCardLight: '#192C3F',
  surfaceElevated: '#1F364D',

  // Hairlines & Specular Top Highlights
  glassBg: 'rgba(10, 20, 31, 0.82)',
  glassBgStrong: 'rgba(9, 17, 27, 0.94)',
  glassBorder: 'rgba(255, 255, 255, 0.11)',
  borderSubtle: 'rgba(255, 255, 255, 0.07)',
  borderWarm: 'rgba(245, 204, 102, 0.28)',
  surfaceHighlight: 'rgba(255, 245, 224, 0.14)',

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
