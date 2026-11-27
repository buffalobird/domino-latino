/**
 * Centralized semantic App Palette system for rapid live visual iteration.
 * Add any new 5-color palette here to test it across the entire app in 1 tap.
 */

export type AppPaletteId = 'coral_brisa' | 'sobremesa_noche';

export interface AppPalette {
  id: AppPaletteId;
  name: string;
  isDark: boolean;
  /** The 5 core palette swatches for preview dots */
  swatches: [string, string, string, string, string];

  // Room / Canvas Backdrops
  bgTop: string;
  bgMid: string;
  bgBottom: string;
  glowTop: string;
  glowTopOpacity: number;
  glowBottom: string;
  glowBottomOpacity: number;

  // Surfaces & Borders
  surfaceCard: string;
  surfaceCardAlt: string;
  surfaceHighlight: string;
  surfacePill: string;
  borderSubtle: string;
  borderAccent: string;
  borderWarm: string;

  // Typography
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textOnPrimary: string;
  textOnAccent: string;

  // Primary CTA ("Jugar ahora")
  primaryTop: string;
  primaryMid: string;
  primaryBottom: string;
  primaryShadow: string;

  // Brand & Interactive Accents
  brandAccent: string;
  accent: string;
  accentSoft: string;
  accentBg: string;
  secondaryAccent: string;
  chipPillBg: string;
  chipPillText: string;
  chipIconColor: string;
  starColor: string;
  starMuted: string;

  // Selected Mode / Score Chips
  selectedBg: string;
  selectedBorder: string;
  selectedText: string;
  selectedSubText: string;

  // Bottom Thumb Dock
  dockBg: string;
  dockBorder: string;

  // Active Table Room Surround (keeps felt & porcelain tiles super legible)
  tableRoomTop: string;
  tableRoomMid: string;
  tableRoomBottom: string;
  hudPillBg: string;
  hudPillBorder: string;
  hudPillText: string;
}

export const APP_PALETTES: Record<AppPaletteId, AppPalette> = {
  /**
   * User Palette #1:
   * #ED6A5A (Vibrant Coral) · #F4F1BB (Lemon Chiffon) · #9BC1BC (Ash Grey)
   * #E6EBE0 (Soft Linen) · #36C9C6 (Strong Cyan)
   */
  coral_brisa: {
    id: 'coral_brisa',
    name: 'Brisa Coral',
    isDark: false,
    swatches: ['#ED6A5A', '#F4F1BB', '#9BC1BC', '#E6EBE0', '#36C9C6'],

    bgTop: '#E6EBE0',
    bgMid: '#EEF2E8',
    bgBottom: '#DFE7DC',
    glowTop: '#F4F1BB',
    glowTopOpacity: 0.72,
    glowBottom: '#9BC1BC',
    glowBottomOpacity: 0.34,

    surfaceCard: 'rgba(255, 255, 255, 0.88)',
    surfaceCardAlt: '#F5F7F1',
    surfaceHighlight: '#FFFDF0',
    surfacePill: 'rgba(255, 255, 255, 0.82)',
    borderSubtle: 'rgba(155, 193, 188, 0.55)',
    borderAccent: '#36C9C6',
    borderWarm: 'rgba(237, 106, 90, 0.45)',

    textPrimary: '#1A3136',
    textSecondary: '#47656A',
    textMuted: '#6A868B',
    textOnPrimary: '#FFFFFF',
    textOnAccent: '#0B2F31',

    primaryTop: '#F47C6D',
    primaryMid: '#ED6A5A',
    primaryBottom: '#D85343',
    primaryShadow: '#B53E30',

    brandAccent: '#ED6A5A',
    accent: '#36C9C6',
    accentSoft: '#D7F5F4',
    accentBg: 'rgba(54, 201, 198, 0.16)',
    secondaryAccent: '#9BC1BC',
    chipPillBg: '#F4F1BB',
    chipPillText: '#3A320D',
    chipIconColor: '#C28A0E',
    starColor: '#E59A1A',
    starMuted: 'rgba(155, 193, 188, 0.55)',

    selectedBg: '#36C9C6',
    selectedBorder: '#24B0AD',
    selectedText: '#082E30',
    selectedSubText: '#0E484B',

    dockBg: 'rgba(246, 248, 242, 0.96)',
    dockBorder: 'rgba(155, 193, 188, 0.55)',

    tableRoomTop: '#D9E5DF',
    tableRoomMid: '#E6EBE0',
    tableRoomBottom: '#CFE0DB',
    hudPillBg: 'rgba(255, 255, 255, 0.86)',
    hudPillBorder: 'rgba(155, 193, 188, 0.72)',
    hudPillText: '#1A3136',
  },

  /**
   * Dark Comparison Baseline:
   * Nocturnal warm emerald-teal & brass parlor
   */
  sobremesa_noche: {
    id: 'sobremesa_noche',
    name: 'Noche Club',
    isDark: true,
    swatches: ['#071419', '#0F252E', '#14626A', '#27D188', '#F5C451'],

    bgTop: '#071419',
    bgMid: '#0B2027',
    bgBottom: '#061116',
    glowTop: '#F5C451',
    glowTopOpacity: 0.14,
    glowBottom: '#1A6E56',
    glowBottomOpacity: 0.22,

    surfaceCard: 'rgba(13, 32, 40, 0.84)',
    surfaceCardAlt: '#163340',
    surfaceHighlight: 'rgba(15, 38, 46, 0.90)',
    surfacePill: 'rgba(13, 32, 40, 0.82)',
    borderSubtle: 'rgba(226, 232, 240, 0.14)',
    borderAccent: 'rgba(245, 214, 138, 0.35)',
    borderWarm: 'rgba(245, 196, 81, 0.52)',

    textPrimary: '#FFFDF9',
    textSecondary: '#B9C8D9',
    textMuted: '#7E95AE',
    textOnPrimary: '#06291A',
    textOnAccent: '#0D1520',

    primaryTop: '#38DF96',
    primaryMid: '#21BA77',
    primaryBottom: '#138956',
    primaryShadow: '#0D6840',

    brandAccent: '#F5C451',
    accent: '#F5C451',
    accentSoft: '#FCE39C',
    accentBg: 'rgba(245, 196, 81, 0.16)',
    secondaryAccent: '#27D188',
    chipPillBg: 'rgba(34, 27, 14, 0.80)',
    chipPillText: '#F5C451',
    chipIconColor: '#F5C451',
    starColor: '#F5C451',
    starMuted: 'rgba(245, 196, 81, 0.32)',

    selectedBg: '#F5C451',
    selectedBorder: '#FCE39C',
    selectedText: '#0D1520',
    selectedSubText: '#2A1D06',

    dockBg: 'rgba(6, 17, 22, 0.94)',
    dockBorder: 'rgba(245, 214, 138, 0.14)',

    tableRoomTop: '#071419',
    tableRoomMid: '#0B2027',
    tableRoomBottom: '#061116',
    hudPillBg: 'rgba(13, 32, 40, 0.82)',
    hudPillBorder: 'rgba(245, 214, 138, 0.22)',
    hudPillText: '#FFFDF9',
  },
};

export const APP_PALETTE_LIST: AppPalette[] = [
  APP_PALETTES.coral_brisa,
  APP_PALETTES.sobremesa_noche,
];
