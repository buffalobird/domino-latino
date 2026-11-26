/**
 * "Club Caribe 2026" Design Tokens
 * Nocturnal Latin domino club: deep plush teal-indigo felt, warm lacquered mahogany rails,
 * porcelain ivory tiles with brass center pin, sleek ebony unplayable tiles, and high-contrast typography.
 */
export const CLUB = {
  // Room & Table
  roomBgTop: '#0A1322',
  roomBgBottom: '#0F1E33',
  feltCenter: '#135962',
  feltEdge: '#0B3542',
  feltLine: 'rgba(255, 255, 255, 0.10)',

  // Lacquered Mahogany Wood Rail & Rack
  woodLight: '#B66F39',
  woodMid: '#8A4B22',
  woodDark: '#4D260E',
  woodHighlight: 'rgba(255, 224, 178, 0.28)',
  rackTop: '#6A3818',
  rackBottom: '#3E1E0B',

  // Glass / Surface Cards
  glassBg: 'rgba(11, 20, 36, 0.78)',
  glassBgStrong: 'rgba(11, 20, 36, 0.92)',
  glassBorder: 'rgba(255, 255, 255, 0.16)',
  surfaceCard: '#142238',
  surfaceCardLight: '#1B2E4B',

  // Accents
  gold: '#F5C451',
  goldDark: '#B8831A',
  goldSoft: '#FDE68A',
  emerald: '#2ED18A',
  emeraldDark: '#168A57',
  cyan: '#38BDF8',
  cyanGlow: 'rgba(56, 189, 248, 0.32)',
  amber: '#FF9240',
  amberDark: '#C2590B',
  coral: '#F43F5E',
  coralDark: '#AD1A35',
  violet: '#8B5CF6',
  violetDark: '#5B21B6',

  // Tiles: Porcelain Ivory (Playable/Board) vs Sleek Ebony (Unplayable/Waiting)
  ivoryTop: '#FFFDF8',
  ivoryBottom: '#F1EADB',
  ivoryBorder: '#D4C8B4',
  ivoryLip: '#BFAEA0',
  brassPin: '#C9A24D',

  ebonyTop: '#273142',
  ebonyBottom: '#19202D',
  ebonyBorder: '#3B485F',
  ebonyLip: '#10151F',

  // Ghost Preview
  ghostFill: 'rgba(56, 189, 248, 0.34)',
  ghostBorder: '#7DD3FC',
  ghostHoverFill: 'rgba(245, 196, 81, 0.52)',
  ghostHoverBorder: '#F5C451',

  // Text
  textPrimary: '#F8FAFC',
  textSecondary: '#B6C5D9',
  textMuted: '#7F93AD',
  textInk: '#111827',
} as const;

export const PIP_COLORS: Record<number, string> = {
  0: '#1E293B',
  1: '#2563EB', // Cobalt Blue
  2: '#16A34A', // Emerald Green
  3: '#DC2626', // Crimson Red
  4: '#D97706', // Warm Amber
  5: '#7C3AED', // Royal Violet
  6: '#111827', // Obsidian
};

// Brighter pips on ebony dark tiles so values remain 100% legible even when unplayable
export const EBONY_PIP_COLORS: Record<number, string> = {
  0: '#94A3B8',
  1: '#60A5FA',
  2: '#4ADE80',
  3: '#FB7185',
  4: '#FBBF24',
  5: '#C084FC',
  6: '#E2E8F0',
};
