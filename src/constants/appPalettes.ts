/**
 * Dual Master Aesthetic System — Dominó Latino
 * 1. "Noche de Club" (Default): Nocturnal Havana sobremesa parlor — deep obsidian-petrol room,
 *    warm overhead amber lamp, butter-ivory host card, brushed brass & emerald felt accents.
 * 2. "Día Brisa": Sunlit Caribbean courtyard — warm travertine linen, crisp porcelain surfaces,
 *    sea-jade accents, and vibrant terracotta-coral primary action.
 */

export type AppPaletteId = 'noche_club' | 'dia_brisa';

export interface AppPalette {
  id: AppPaletteId;
  name: string;
  shortLabel: string;
  subtitle: string;
  isDark: boolean;
  swatches: [string, string, string, string, string];

  // Room / Canvas Backdrops
  bgTop: string;
  bgMid: string;
  bgBottom: string;
  glowTop: string;
  glowTopOpacity: number;
  glowBottom: string;
  glowBottomOpacity: number;

  // Brand Title
  titlePrimary: string;
  titleSecondary: string;
  titleShadow: string;
  kickerColor: string;

  // Top Bar Pills & Settings Button
  topPillBg: string;
  topPillLip: string;
  topPillBorder: string;
  topPillText: string;
  levelPillBg: string;
  levelPillLip: string;
  levelPillText: string;
  gearBg: string;
  gearLip: string;
  gearIcon: string;

  // Hero Greeting Card
  heroCardBg: string;
  heroCardLip: string;
  heroCardBorder: string;
  heroCardText: string;
  heroCardSub: string;
  heroAvatarRing: string;
  heroEditBg: string;
  heroEditText: string;

  // Daily Challenge Strip
  dailyCardBg: string;
  dailyCardLip: string;
  dailyCardBorder: string;
  dailyCardText: string;
  dailyCardSub: string;
  dailyBtnBg: string;
  dailyBtnLip: string;
  dailyBtnText: string;

  // Config Tray + Tactile Mode & Score Buttons
  trayBg: string;
  trayBorder: string;
  trayLabel: string;

  modeBg: string;
  modeLip: string;
  modeBorder: string;
  modeText: string;
  modeSub: string;
  modeSelectedBg: string;
  modeSelectedLip: string;
  modeSelectedBorder: string;
  modeSelectedText: string;
  modeSelectedSub: string;

  scoreBg: string;
  scoreLip: string;
  scoreBorder: string;
  scoreText: string;
  scoreSelectedBg: string;
  scoreSelectedLip: string;
  scoreSelectedBorder: string;
  scoreSelectedText: string;

  // Account Strip
  accountBg: string;
  accountLip: string;
  accountBorder: string;
  accountText: string;
  accountBtnBg: string;
  accountBtnLip: string;
  accountBtnText: string;

  // Bottom Secondary Online / Private Buttons
  onlineBtnBg: string;
  onlineBtnLip: string;
  onlineBtnBorder: string;
  onlineBtnText: string;
  onlineBtnSub: string;
  onlineIconColor: string;

  privateBtnBg: string;
  privateBtnLip: string;
  privateBtnBorder: string;
  privateBtnText: string;
  privateBtnSub: string;
  privateIconColor: string;

  // Shared Semantic Surfaces & Borders (Lobby, WaitingRoom, Cards)
  surfaceCard: string;
  surfaceCardLip: string;
  surfaceCardAlt: string;
  surfaceCardAltLip: string;
  surfaceHighlight: string;
  surfacePill: string;
  borderSubtle: string;
  borderAccent: string;
  borderWarm: string;

  // Unified Modal & Overlay System (100% consistent across all 8 modals & summaries)
  modalBackdrop: string;
  modalBg: string;
  modalBorder: string;
  modalCardBg: string;
  modalCardLip: string;
  modalCardBorder: string;
  modalInputBg: string;
  closeBtnBg: string;
  winnerCardBg: string;
  winnerCardBorder: string;
  winnerText: string;
  positiveBg: string;
  positiveBorder: string;
  positiveText: string;
  dangerBg: string;
  dangerBorder: string;
  dangerText: string;

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

  // Selected Chips (shared Lobby / Modal pills)
  selectedBg: string;
  selectedLip: string;
  selectedBorder: string;
  selectedText: string;
  selectedSubText: string;

  // Bottom Thumb Dock
  dockBg: string;
  dockBorder: string;

  // Active Table Room Surround
  tableRoomTop: string;
  tableRoomMid: string;
  tableRoomBottom: string;
  hudPillBg: string;
  hudPillBorder: string;
  hudPillText: string;
}

export const APP_PALETTES: Record<AppPaletteId, AppPalette> = {
  noche_club: {
    id: 'noche_club',
    name: 'Noche de Club',
    shortLabel: 'Noche',
    subtitle: 'Velada cálida de caoba, marfil y paño esmeralda',
    isDark: true,
    swatches: ['#0A1A22', '#FBF5E6', '#FFD166', '#22C57E', '#163240'],

    bgTop: '#0B1D26',
    bgMid: '#0F2631',
    bgBottom: '#071319',
    glowTop: '#F5C451',
    glowTopOpacity: 0.14,
    glowBottom: '#14626A',
    glowBottomOpacity: 0.28,

    titlePrimary: '#FFFDF7',
    titleSecondary: '#FFD166',
    titleShadow: '#593808',
    kickerColor: '#B8CFD9',

    topPillBg: '#163342',
    topPillLip: '#08161E',
    topPillBorder: 'rgba(255, 248, 230, 0.16)',
    topPillText: '#FFFDF7',
    levelPillBg: '#1B4354',
    levelPillLip: '#0B212B',
    levelPillText: '#FFFDF7',
    gearBg: '#1D4152',
    gearLip: '#0B1F29',
    gearIcon: '#FCE39C',

    heroCardBg: '#FBF5E6',
    heroCardLip: '#D2C09B',
    heroCardBorder: '#FFFDF9',
    heroCardText: '#11252E',
    heroCardSub: '#475F6B',
    heroAvatarRing: '#22C57E',
    heroEditBg: '#132B36',
    heroEditText: '#FFD166',

    dailyCardBg: '#142E3B',
    dailyCardLip: '#08161E',
    dailyCardBorder: 'rgba(245, 204, 112, 0.26)',
    dailyCardText: '#FFFDF7',
    dailyCardSub: '#AEC4D0',
    dailyBtnBg: '#F5B82E',
    dailyBtnLip: '#AD750B',
    dailyBtnText: '#1F1402',

    trayBg: 'rgba(8, 22, 29, 0.52)',
    trayBorder: 'rgba(255, 246, 224, 0.12)',
    trayLabel: '#B7CDD8',

    modeBg: '#173645',
    modeLip: '#091921',
    modeBorder: 'rgba(255, 255, 255, 0.13)',
    modeText: '#F4F9FB',
    modeSub: '#9BB6C4',
    modeSelectedBg: '#FFD166',
    modeSelectedLip: '#C28716',
    modeSelectedBorder: '#FFF1B8',
    modeSelectedText: '#231703',
    modeSelectedSub: '#593D09',

    scoreBg: '#173645',
    scoreLip: '#091921',
    scoreBorder: 'rgba(255, 255, 255, 0.13)',
    scoreText: '#E8F2F7',
    scoreSelectedBg: '#FFFDF7',
    scoreSelectedLip: '#C7B695',
    scoreSelectedBorder: '#FFFFFF',
    scoreSelectedText: '#10242D',

    accountBg: '#142E3B',
    accountLip: '#08161E',
    accountBorder: 'rgba(255, 248, 230, 0.14)',
    accountText: '#F2F7FA',
    accountBtnBg: '#FFD166',
    accountBtnLip: '#C28716',
    accountBtnText: '#231703',

    onlineBtnBg: '#163342',
    onlineBtnLip: '#08161E',
    onlineBtnBorder: 'rgba(255, 248, 230, 0.15)',
    onlineBtnText: '#FFFDF7',
    onlineBtnSub: '#A9C1CE',
    onlineIconColor: '#4CC9F0',

    privateBtnBg: '#163342',
    privateBtnLip: '#08161E',
    privateBtnBorder: 'rgba(255, 248, 230, 0.15)',
    privateBtnText: '#FFFDF7',
    privateBtnSub: '#A9C1CE',
    privateIconColor: '#FFD166',

    surfaceCard: '#132C38',
    surfaceCardLip: '#08161E',
    surfaceCardAlt: '#193847',
    surfaceCardAltLip: '#0B1D26',
    surfaceHighlight: '#FBF5E6',
    surfacePill: '#173645',
    borderSubtle: 'rgba(255, 248, 230, 0.14)',
    borderAccent: '#22C57E',
    borderWarm: 'rgba(245, 196, 81, 0.48)',

    modalBackdrop: 'rgba(4, 12, 16, 0.78)',
    modalBg: '#0F242E',
    modalBorder: 'rgba(245, 204, 112, 0.28)',
    modalCardBg: '#163342',
    modalCardLip: '#08161E',
    modalCardBorder: 'rgba(255, 248, 230, 0.14)',
    modalInputBg: '#0A1921',
    closeBtnBg: 'rgba(255, 255, 255, 0.10)',
    winnerCardBg: 'rgba(245, 196, 81, 0.14)',
    winnerCardBorder: '#F5C451',
    winnerText: '#FFD166',
    positiveBg: 'rgba(34, 197, 126, 0.16)',
    positiveBorder: 'rgba(52, 224, 150, 0.45)',
    positiveText: '#3EE69C',
    dangerBg: 'rgba(244, 63, 94, 0.15)',
    dangerBorder: 'rgba(244, 63, 94, 0.42)',
    dangerText: '#FDA4AF',

    textPrimary: '#FFFDF7',
    textSecondary: '#BCD0DC',
    textMuted: '#7F99A8',
    textOnPrimary: '#052E1A',
    textOnAccent: '#07291A',

    primaryTop: '#5BF0AE',
    primaryMid: '#24C981',
    primaryBottom: '#139E60',
    primaryShadow: '#0A693E',

    brandAccent: '#FFD166',
    accent: '#24C981',
    accentSoft: '#D3FAE7',
    accentBg: 'rgba(36, 201, 129, 0.16)',
    secondaryAccent: '#4CC9F0',
    chipPillBg: '#0D2029',
    chipPillText: '#FFD166',
    chipIconColor: '#F5C451',
    starColor: '#F5C451',
    starMuted: 'rgba(255, 248, 230, 0.20)',

    selectedBg: '#FFD166',
    selectedLip: '#C28716',
    selectedBorder: '#FFF1B8',
    selectedText: '#231703',
    selectedSubText: '#593D09',

    dockBg: 'transparent',
    dockBorder: 'transparent',

    tableRoomTop: '#08161E',
    tableRoomMid: '#0C202A',
    tableRoomBottom: '#061117',
    hudPillBg: 'rgba(13, 33, 43, 0.90)',
    hudPillBorder: 'rgba(245, 214, 138, 0.22)',
    hudPillText: '#FFFDF7',
  },

  dia_brisa: {
    id: 'dia_brisa',
    name: 'Día Brisa',
    shortLabel: 'Brisa',
    subtitle: 'Terraza habanera soleada en lino, porcelana y coral',
    isDark: false,
    swatches: ['#F4EFE4', '#FFFFFF', '#1BA8A0', '#F05A43', '#152B32'],

    bgTop: '#F6F1E7',
    bgMid: '#EFE7D8',
    bgBottom: '#E5DAC7',
    glowTop: '#FFFFFF',
    glowTopOpacity: 0.72,
    glowBottom: '#9ED2CB',
    glowBottomOpacity: 0.30,

    titlePrimary: '#152B32',
    titleSecondary: '#E85741',
    titleShadow: 'rgba(21, 43, 50, 0.14)',
    kickerColor: '#567078',

    topPillBg: '#FFFFFF',
    topPillLip: '#CFC2AD',
    topPillBorder: '#E7DECFE6',
    topPillText: '#152B32',
    levelPillBg: '#FFFFFF',
    levelPillLip: '#CFC2AD',
    levelPillText: '#152B32',
    gearBg: '#152B32',
    gearLip: '#0A161A',
    gearIcon: '#FFFDF7',

    heroCardBg: '#FFFFFF',
    heroCardLip: '#D2C5B0',
    heroCardBorder: '#FFFFFF',
    heroCardText: '#152B32',
    heroCardSub: '#516A73',
    heroAvatarRing: '#1BA8A0',
    heroEditBg: '#152B32',
    heroEditText: '#FFFDF7',

    dailyCardBg: '#FDF8EC',
    dailyCardLip: '#D6C6A5',
    dailyCardBorder: '#F2E7D1',
    dailyCardText: '#152B32',
    dailyCardSub: '#5B727A',
    dailyBtnBg: '#F09624',
    dailyBtnLip: '#B86A0A',
    dailyBtnText: '#FFFFFF',

    trayBg: 'rgba(21, 43, 50, 0.05)',
    trayBorder: 'rgba(21, 43, 50, 0.11)',
    trayLabel: '#4E6770',

    modeBg: '#FFFFFF',
    modeLip: '#CFC2AD',
    modeBorder: '#EAE1D3',
    modeText: '#152B32',
    modeSub: '#5B747D',
    modeSelectedBg: '#1BA8A0',
    modeSelectedLip: '#107872',
    modeSelectedBorder: '#6FE3DC',
    modeSelectedText: '#FFFFFF',
    modeSelectedSub: '#E3FFFD',

    scoreBg: '#FFFFFF',
    scoreLip: '#CFC2AD',
    scoreBorder: '#EAE1D3',
    scoreText: '#152B32',
    scoreSelectedBg: '#152B32',
    scoreSelectedLip: '#091519',
    scoreSelectedBorder: '#2D4E59',
    scoreSelectedText: '#FFFDF7',

    accountBg: '#FFFFFF',
    accountLip: '#CFC2AD',
    accountBorder: '#EAE1D3',
    accountText: '#152B32',
    accountBtnBg: '#1BA8A0',
    accountBtnLip: '#107872',
    accountBtnText: '#FFFFFF',

    onlineBtnBg: '#FFFFFF',
    onlineBtnLip: '#CFC2AD',
    onlineBtnBorder: '#E5DBCB',
    onlineBtnText: '#152B32',
    onlineBtnSub: '#5A737C',
    onlineIconColor: '#1BA8A0',

    privateBtnBg: '#FFFFFF',
    privateBtnLip: '#CFC2AD',
    privateBtnBorder: '#E5DBCB',
    privateBtnText: '#152B32',
    privateBtnSub: '#5A737C',
    privateIconColor: '#E85741',

    surfaceCard: '#FFFFFF',
    surfaceCardLip: '#D2C5B0',
    surfaceCardAlt: '#F5EFE3',
    surfaceCardAltLip: '#CFC2AD',
    surfaceHighlight: '#FDF8EC',
    surfacePill: '#FFFFFF',
    borderSubtle: '#E2D8C7',
    borderAccent: '#1BA8A0',
    borderWarm: 'rgba(232, 87, 65, 0.36)',

    modalBackdrop: 'rgba(18, 36, 42, 0.50)',
    modalBg: '#FAF6EE',
    modalBorder: '#DFD4C2',
    modalCardBg: '#FFFFFF',
    modalCardLip: '#D2C5B0',
    modalCardBorder: '#E6DDD0',
    modalInputBg: '#F1EAE0',
    closeBtnBg: 'rgba(21, 43, 50, 0.08)',
    winnerCardBg: '#FFF8E3',
    winnerCardBorder: '#E09F1F',
    winnerText: '#A86406',
    positiveBg: '#E6F8F3',
    positiveBorder: '#1BA8A0',
    positiveText: '#0E7A74',
    dangerBg: '#FFF0F2',
    dangerBorder: '#FECDD3',
    dangerText: '#BE123C',

    textPrimary: '#152B32',
    textSecondary: '#4D666F',
    textMuted: '#789099',
    textOnPrimary: '#FFFFFF',
    textOnAccent: '#FFFFFF',

    primaryTop: '#FF8470',
    primaryMid: '#F05A43',
    primaryBottom: '#D6402A',
    primaryShadow: '#9B2716',

    brandAccent: '#E85741',
    accent: '#1BA8A0',
    accentSoft: '#D9F5F3',
    accentBg: 'rgba(27, 168, 160, 0.14)',
    secondaryAccent: '#CFC2AD',
    chipPillBg: '#FFF8E3',
    chipPillText: '#5C3D06',
    chipIconColor: '#D99316',
    starColor: '#E59A1A',
    starMuted: 'rgba(21, 43, 50, 0.18)',

    selectedBg: '#1BA8A0',
    selectedLip: '#107872',
    selectedBorder: '#6FE3DC',
    selectedText: '#FFFFFF',
    selectedSubText: '#E3FFFD',

    dockBg: 'transparent',
    dockBorder: 'transparent',

    tableRoomTop: '#E5DDD0',
    tableRoomMid: '#EDE6DA',
    tableRoomBottom: '#DBD1C1',
    hudPillBg: 'rgba(255, 255, 255, 0.92)',
    hudPillBorder: '#D8CCBA',
    hudPillText: '#152B32',
  },
};

export const APP_PALETTE_LIST: AppPalette[] = [
  APP_PALETTES.noche_club,
  APP_PALETTES.dia_brisa,
];
