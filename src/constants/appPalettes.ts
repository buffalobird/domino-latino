/**
 * Centralized tactile 3D App Palette system for live 1-tap visual comparison.
 * Includes all 4 high-contrast tactile palettes inspired by the user's mockups
 * (Índigo Crema, Cacao Coral, Noche Menta, Espresso Cielo) plus Brisa Coral.
 */

export type AppPaletteId =
  | 'indigo_crema'
  | 'cacao_coral'
  | 'noche_menta'
  | 'espresso_cielo'
  | 'coral_brisa';

export interface AppPalette {
  id: AppPaletteId;
  name: string;
  shortLabel: string;
  isDark: boolean;
  /** 3-5 core swatches for the 1-tap switcher pill */
  swatches: [string, string, string, string, string];

  // Room / Canvas Backdrops
  bgTop: string;
  bgMid: string;
  bgBottom: string;
  glowTop: string;
  glowTopOpacity: number;
  glowBottom: string;
  glowBottomOpacity: number;

  // Brand Title (3D extruded)
  titlePrimary: string;
  titleSecondary: string;
  titleShadow: string;
  kickerColor: string;

  // Top Bar Pills & Tactile Gear Button
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

  // Hero Greeting Card (High-contrast figure-ground anchor!)
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

  // Config Tray + Tactile 3D Mode & Score Buttons
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

  // Shared Semantic Surfaces & Borders (used across Lobby, WaitingRoom, Modals)
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

  // Selected Mode / Score Chips (shared Lobby pills)
  selectedBg: string;
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
  /**
   * Mockup #2 — Índigo Crema (Default)
   * Rich twilight indigo canvas + warm butter-cream tactile cards + mint/gold/tangerine pops
   */
  indigo_crema: {
    id: 'indigo_crema',
    name: 'Índigo Crema',
    shortLabel: 'Índigo',
    isDark: true,
    swatches: ['#36407A', '#FBF6E2', '#8CD4C6', '#FFE05D', '#7AE8B4'],

    bgTop: '#3B4686',
    bgMid: '#313B74',
    bgBottom: '#262E5E',
    glowTop: '#5C6BC0',
    glowTopOpacity: 0.3,
    glowBottom: '#202652',
    glowBottomOpacity: 0.45,

    titlePrimary: '#FFD166',
    titleSecondary: '#FFD166',
    titleShadow: '#9D6517',
    kickerColor: '#D6DDF5',

    topPillBg: '#465294',
    topPillLip: '#273061',
    topPillBorder: 'rgba(255, 255, 255, 0.18)',
    topPillText: '#FFFFFF',
    levelPillBg: '#8CD4C6',
    levelPillLip: '#5BA598',
    levelPillText: '#14333A',
    gearBg: '#4E9AF8',
    gearLip: '#2967C4',
    gearIcon: '#FFFFFF',

    heroCardBg: '#FBF6E2',
    heroCardLip: '#D8CEA8',
    heroCardBorder: '#FFFDF5',
    heroCardText: '#1E2440',
    heroCardSub: '#485070',
    heroAvatarRing: '#8CD4C6',
    heroEditBg: '#6B5D42',
    heroEditText: '#FFFDF5',

    dailyCardBg: '#FBF6E2',
    dailyCardLip: '#D8CEA8',
    dailyCardBorder: '#FFFDF5',
    dailyCardText: '#1E2440',
    dailyCardSub: '#555E7D',
    dailyBtnBg: '#FF8B28',
    dailyBtnLip: '#CC5D0A',
    dailyBtnText: '#FFFFFF',

    trayBg: 'rgba(255, 255, 255, 0.09)',
    trayBorder: 'rgba(255, 255, 255, 0.14)',
    trayLabel: '#D2DAF5',

    modeBg: '#8CD4C6',
    modeLip: '#5AA99B',
    modeBorder: '#B7EBE0',
    modeText: '#133138',
    modeSub: '#224C54',
    modeSelectedBg: '#FFE05D',
    modeSelectedLip: '#D4A420',
    modeSelectedBorder: '#FFF3B0',
    modeSelectedText: '#261C04',
    modeSelectedSub: '#4F3C0B',

    scoreBg: '#FBF6E2',
    scoreLip: '#D5CBA5',
    scoreBorder: '#FFFFFF',
    scoreText: '#1E2440',
    scoreSelectedBg: '#FF8A26',
    scoreSelectedLip: '#C95B0A',
    scoreSelectedBorder: '#FFB673',
    scoreSelectedText: '#2A1100',

    accountBg: '#FBF6E2',
    accountLip: '#D8CEA8',
    accountBorder: '#FFFDF5',
    accountText: '#1E2440',
    accountBtnBg: '#FCC97A',
    accountBtnLip: '#D4943A',
    accountBtnText: '#2B1B04',

    onlineBtnBg: '#465294',
    onlineBtnLip: '#273061',
    onlineBtnBorder: 'rgba(255, 255, 255, 0.16)',
    onlineBtnText: '#FFFFFF',
    onlineBtnSub: '#C6D1F2',
    onlineIconColor: '#67D4F5',

    privateBtnBg: '#465294',
    privateBtnLip: '#273061',
    privateBtnBorder: 'rgba(255, 255, 255, 0.16)',
    privateBtnText: '#FFFFFF',
    privateBtnSub: '#C6D1F2',
    privateIconColor: '#FFD166',

    surfaceCard: 'rgba(40, 49, 98, 0.90)',
    surfaceCardAlt: '#465294',
    surfaceHighlight: '#FBF6E2',
    surfacePill: '#465294',
    borderSubtle: 'rgba(255, 255, 255, 0.16)',
    borderAccent: '#8CD4C6',
    borderWarm: 'rgba(255, 209, 102, 0.55)',

    textPrimary: '#FFFFFF',
    textSecondary: '#CED7F4',
    textMuted: '#9AA8D6',
    textOnPrimary: '#0E4229',
    textOnAccent: '#133138',

    primaryTop: '#9CF2C4',
    primaryMid: '#6EE0A8',
    primaryBottom: '#4CC78C',
    primaryShadow: '#2E9664',

    brandAccent: '#FFD166',
    accent: '#8CD4C6',
    accentSoft: '#D7F5EE',
    accentBg: 'rgba(140, 212, 198, 0.18)',
    secondaryAccent: '#FF8B28',
    chipPillBg: '#272F5E',
    chipPillText: '#FFD166',
    chipIconColor: '#FFD166',
    starColor: '#F5B82E',
    starMuted: '#D6CBA5',

    selectedBg: '#FFE05D',
    selectedBorder: '#FFF3B0',
    selectedText: '#261C04',
    selectedSubText: '#4F3C0B',

    dockBg: 'transparent',
    dockBorder: 'transparent',

    tableRoomTop: '#293264',
    tableRoomMid: '#2F3970',
    tableRoomBottom: '#222A54',
    hudPillBg: 'rgba(34, 42, 84, 0.88)',
    hudPillBorder: 'rgba(255, 255, 255, 0.18)',
    hudPillText: '#FFFFFF',
  },

  /**
   * Mockup #1 — Cacao Coral
   * Warm espresso-cacao canvas + pastel sky-blue hero + cream daily + cobalt & coral 3D buttons
   */
  cacao_coral: {
    id: 'cacao_coral',
    name: 'Cacao Coral',
    shortLabel: 'Cacao',
    isDark: true,
    swatches: ['#463B37', '#C0E7FF', '#5A94F6', '#FF7E76', '#F4EEE7'],

    bgTop: '#4A3E3A',
    bgMid: '#3E3330',
    bgBottom: '#332926',
    glowTop: '#6B5751',
    glowTopOpacity: 0.34,
    glowBottom: '#261E1C',
    glowBottomOpacity: 0.45,

    titlePrimary: '#FF8980',
    titleSecondary: '#FF8980',
    titleShadow: '#9A332E',
    kickerColor: '#EADAD5',

    topPillBg: '#5C4E49',
    topPillLip: '#342B28',
    topPillBorder: 'rgba(255, 240, 232, 0.2)',
    topPillText: '#FFF8F4',
    levelPillBg: '#675852',
    levelPillLip: '#3C322F',
    levelPillText: '#FFF8F4',
    gearBg: '#5A94F6',
    gearLip: '#3165C2',
    gearIcon: '#FFFFFF',

    heroCardBg: '#C4E9FF',
    heroCardLip: '#7FC2EB',
    heroCardBorder: '#E5F6FF',
    heroCardText: '#2C2422',
    heroCardSub: '#475058',
    heroAvatarRing: '#5A94F6',
    heroEditBg: '#3D7AE0',
    heroEditText: '#FFFFFF',

    dailyCardBg: '#F4EEE7',
    dailyCardLip: '#CFC4B8',
    dailyCardBorder: '#FFFDFB',
    dailyCardText: '#2C2422',
    dailyCardSub: '#605450',
    dailyBtnBg: '#FF7D75',
    dailyBtnLip: '#CE4741',
    dailyBtnText: '#FFFFFF',

    trayBg: 'rgba(255, 244, 238, 0.06)',
    trayBorder: 'rgba(255, 244, 238, 0.14)',
    trayLabel: '#E8D9D3',

    modeBg: '#5A94F6',
    modeLip: '#3267C4',
    modeBorder: '#8DB9FF',
    modeText: '#FFFFFF',
    modeSub: '#E0EEFF',
    modeSelectedBg: '#FFB4AC',
    modeSelectedLip: '#DC736A',
    modeSelectedBorder: '#FFE0DC',
    modeSelectedText: '#3A1513',
    modeSelectedSub: '#5E2723',

    scoreBg: '#C4E9FF',
    scoreLip: '#7FC2EB',
    scoreBorder: '#E5F6FF',
    scoreText: '#263847',
    scoreSelectedBg: '#F56E66',
    scoreSelectedLip: '#BF3E38',
    scoreSelectedBorder: '#FFACA6',
    scoreSelectedText: '#FFFFFF',

    accountBg: '#463A37',
    accountLip: '#2C2321',
    accountBorder: 'rgba(255, 240, 232, 0.24)',
    accountText: '#F5EAE6',
    accountBtnBg: '#FF7D75',
    accountBtnLip: '#CE4741',
    accountBtnText: '#FFFFFF',

    onlineBtnBg: '#C4E9FF',
    onlineBtnLip: '#7FC2EB',
    onlineBtnBorder: '#E5F6FF',
    onlineBtnText: '#243542',
    onlineBtnSub: '#475D6E',
    onlineIconColor: '#2E6287',

    privateBtnBg: '#5A94F6',
    privateBtnLip: '#3267C4',
    privateBtnBorder: '#8DB9FF',
    privateBtnText: '#FFFFFF',
    privateBtnSub: '#DCEBFF',
    privateIconColor: '#FFD166',

    surfaceCard: 'rgba(66, 54, 50, 0.92)',
    surfaceCardAlt: '#5A4B46',
    surfaceHighlight: '#C4E9FF',
    surfacePill: '#5C4E49',
    borderSubtle: 'rgba(255, 240, 232, 0.18)',
    borderAccent: '#5A94F6',
    borderWarm: 'rgba(255, 137, 128, 0.5)',

    textPrimary: '#FFF8F5',
    textSecondary: '#DFCFC9',
    textMuted: '#B39F98',
    textOnPrimary: '#FFFFFF',
    textOnAccent: '#1D3344',

    primaryTop: '#FF9890',
    primaryMid: '#F57169',
    primaryBottom: '#DE514A',
    primaryShadow: '#B0342E',

    brandAccent: '#FF8980',
    accent: '#5A94F6',
    accentSoft: '#C4E9FF',
    accentBg: 'rgba(90, 148, 246, 0.18)',
    secondaryAccent: '#C4E9FF',
    chipPillBg: '#372D2A',
    chipPillText: '#FFD166',
    chipIconColor: '#FFD166',
    starColor: '#E59A38',
    starMuted: '#B7A79B',

    selectedBg: '#FFB4AC',
    selectedBorder: '#FFE0DC',
    selectedText: '#3A1513',
    selectedSubText: '#5E2723',

    dockBg: 'transparent',
    dockBorder: 'transparent',

    tableRoomTop: '#3D322E',
    tableRoomMid: '#463A36',
    tableRoomBottom: '#2F2623',
    hudPillBg: 'rgba(54, 44, 41, 0.88)',
    hudPillBorder: 'rgba(255, 240, 232, 0.2)',
    hudPillText: '#FFF8F5',
  },

  /**
   * Mockup #3 — Noche Menta
   * Deep twilight plum canvas + blush pink hero + vivid coral mode + lime-mint score & CTA
   */
  noche_menta: {
    id: 'noche_menta',
    name: 'Noche Menta',
    shortLabel: 'Menta',
    isDark: true,
    swatches: ['#29284C', '#FFE2E7', '#FF6342', '#B58EA6', '#B9F490'],

    bgTop: '#2E2D56',
    bgMid: '#242345',
    bgBottom: '#1B1A36',
    glowTop: '#494782',
    glowTopOpacity: 0.32,
    glowBottom: '#141329',
    glowBottomOpacity: 0.5,

    titlePrimary: '#FF6B4A',
    titleSecondary: '#FF6B4A',
    titleShadow: '#8A2616',
    kickerColor: '#DCD9F4',

    topPillBg: '#353462',
    topPillLip: '#1D1C3B',
    topPillBorder: 'rgba(255, 255, 255, 0.14)',
    topPillText: '#FFFFFF',
    levelPillBg: '#8DD4F4',
    levelPillLip: '#54A4C9',
    levelPillText: '#142F42',
    gearBg: '#73C2F7',
    gearLip: '#3E8DC7',
    gearIcon: '#FFFFFF',

    heroCardBg: '#FFE3E8',
    heroCardLip: '#DEB1BC',
    heroCardBorder: '#FFF4F6',
    heroCardText: '#262340',
    heroCardSub: '#514C70',
    heroAvatarRing: '#6B6591',
    heroEditBg: '#2A284E',
    heroEditText: '#FFFFFF',

    dailyCardBg: '#363564',
    dailyCardLip: '#1E1D3C',
    dailyCardBorder: 'rgba(255, 255, 255, 0.14)',
    dailyCardText: '#FFFFFF',
    dailyCardSub: '#C4C1E3',
    dailyBtnBg: '#FF6342',
    dailyBtnLip: '#C7391D',
    dailyBtnText: '#FFFFFF',

    trayBg: 'rgba(255, 255, 255, 0.05)',
    trayBorder: 'rgba(255, 255, 255, 0.12)',
    trayLabel: '#DCD8F2',

    modeBg: '#2D2C54',
    modeLip: '#181733',
    modeBorder: 'rgba(255, 255, 255, 0.14)',
    modeText: '#F0EEFC',
    modeSub: '#B4B0D6',
    modeSelectedBg: '#FF6342',
    modeSelectedLip: '#C7391D',
    modeSelectedBorder: '#FFA08A',
    modeSelectedText: '#FFFFFF',
    modeSelectedSub: '#FFE2DA',

    scoreBg: '#B88FA7',
    scoreLip: '#8A647B',
    scoreBorder: '#D4B0C5',
    scoreText: '#FFFFFF',
    scoreSelectedBg: '#C8FA9B',
    scoreSelectedLip: '#84C452',
    scoreSelectedBorder: '#E5FFCC',
    scoreSelectedText: '#183C12',

    accountBg: '#343360',
    accountLip: '#1C1B38',
    accountBorder: 'rgba(255, 255, 255, 0.14)',
    accountText: '#E9E7F9',
    accountBtnBg: '#FF6342',
    accountBtnLip: '#C7391D',
    accountBtnText: '#FFFFFF',

    onlineBtnBg: '#33325E',
    onlineBtnLip: '#1C1B38',
    onlineBtnBorder: 'rgba(255, 255, 255, 0.14)',
    onlineBtnText: '#FFFFFF',
    onlineBtnSub: '#B8B5DA',
    onlineIconColor: '#FFD166',

    privateBtnBg: '#33325E',
    privateBtnLip: '#1C1B38',
    privateBtnBorder: 'rgba(255, 255, 255, 0.14)',
    privateBtnText: '#FFFFFF',
    privateBtnSub: '#B8B5DA',
    privateIconColor: '#FFD166',

    surfaceCard: 'rgba(46, 45, 86, 0.92)',
    surfaceCardAlt: '#39386B',
    surfaceHighlight: '#FFE3E8',
    surfacePill: '#353462',
    borderSubtle: 'rgba(255, 255, 255, 0.14)',
    borderAccent: '#C8FA9B',
    borderWarm: 'rgba(255, 99, 66, 0.5)',

    textPrimary: '#FFFFFF',
    textSecondary: '#CCC9E8',
    textMuted: '#9995BF',
    textOnPrimary: '#163D11',
    textOnAccent: '#163D11',

    primaryTop: '#DCFEB8',
    primaryMid: '#A5EC84',
    primaryBottom: '#78CC5E',
    primaryShadow: '#4B9B38',

    brandAccent: '#FF6342',
    accent: '#C8FA9B',
    accentSoft: '#E5FFCC',
    accentBg: 'rgba(200, 250, 155, 0.16)',
    secondaryAccent: '#B88FA7',
    chipPillBg: '#232242',
    chipPillText: '#FFD166',
    chipIconColor: '#FFD166',
    starColor: '#FFD166',
    starMuted: 'rgba(255, 255, 255, 0.22)',

    selectedBg: '#C8FA9B',
    selectedBorder: '#E5FFCC',
    selectedText: '#183C12',
    selectedSubText: '#2A5922',

    dockBg: 'transparent',
    dockBorder: 'transparent',

    tableRoomTop: '#252447',
    tableRoomMid: '#2C2B54',
    tableRoomBottom: '#1D1C38',
    hudPillBg: 'rgba(40, 39, 76, 0.88)',
    hudPillBorder: 'rgba(255, 255, 255, 0.16)',
    hudPillText: '#FFFFFF',
  },

  /**
   * Mockup #4 — Espresso Cielo
   * Warm espresso-brown canvas + vivid cobalt-sky hero + ice-blue scores + soft coral CTA
   */
  espresso_cielo: {
    id: 'espresso_cielo',
    name: 'Espresso Cielo',
    shortLabel: 'Cielo',
    isDark: true,
    swatches: ['#4E3D3B', '#5897F6', '#FFA69E', '#CBEBFF', '#F46F67'],

    bgTop: '#564341',
    bgMid: '#463735',
    bgBottom: '#372B2A',
    glowTop: '#785E5A',
    glowTopOpacity: 0.32,
    glowBottom: '#261D1C',
    glowBottomOpacity: 0.48,

    titlePrimary: '#FFF2EE',
    titleSecondary: '#FF847A',
    titleShadow: '#8B2E29',
    kickerColor: '#F2C9C2',

    topPillBg: '#CBEBFF',
    topPillLip: '#88C4EA',
    topPillBorder: '#EAF7FF',
    topPillText: '#1E3342',
    levelPillBg: '#CBEBFF',
    levelPillLip: '#88C4EA',
    levelPillText: '#1E3342',
    gearBg: '#5594F5',
    gearLip: '#2E62C0',
    gearIcon: '#FFFFFF',

    heroCardBg: '#5B98F6',
    heroCardLip: '#346CD0',
    heroCardBorder: '#91BEFF',
    heroCardText: '#FFFFFF',
    heroCardSub: '#EAF3FF',
    heroAvatarRing: '#CBEBFF',
    heroEditBg: '#346FD4',
    heroEditText: '#FFFFFF',

    dailyCardBg: '#463735',
    dailyCardLip: '#2C2120',
    dailyCardBorder: 'rgba(255, 236, 230, 0.18)',
    dailyCardText: '#FFF6F4',
    dailyCardSub: '#D6C2BE',
    dailyBtnBg: '#FF847A',
    dailyBtnLip: '#C94C44',
    dailyBtnText: '#FFFFFF',

    trayBg: 'rgba(255, 238, 232, 0.06)',
    trayBorder: 'rgba(255, 238, 232, 0.15)',
    trayLabel: '#EBD9D5',

    modeBg: '#5E4B48',
    modeLip: '#3C2F2D',
    modeBorder: 'rgba(255, 238, 232, 0.18)',
    modeText: '#FFF5F2',
    modeSub: '#D9C6C2',
    modeSelectedBg: '#FFA9A1',
    modeSelectedLip: '#DC6C63',
    modeSelectedBorder: '#FFDCD8',
    modeSelectedText: '#331412',
    modeSelectedSub: '#5A2622',

    scoreBg: '#CBEBFF',
    scoreLip: '#89C5EB',
    scoreBorder: '#EAF7FF',
    scoreText: '#1E3546',
    scoreSelectedBg: '#FF867C',
    scoreSelectedLip: '#C94B43',
    scoreSelectedBorder: '#FFC0BA',
    scoreSelectedText: '#2F0E0C',

    accountBg: '#463735',
    accountLip: '#2C2120',
    accountBorder: 'rgba(255, 236, 230, 0.2)',
    accountText: '#F0DFDB',
    accountBtnBg: '#5E4B48',
    accountBtnLip: '#3B2E2C',
    accountBtnText: '#FFFFFF',

    onlineBtnBg: '#4E8AEF',
    onlineBtnLip: '#2B5CB8',
    onlineBtnBorder: '#88B6FF',
    onlineBtnText: '#FFFFFF',
    onlineBtnSub: '#DCEBFF',
    onlineIconColor: '#CBEBFF',

    privateBtnBg: '#4E8AEF',
    privateBtnLip: '#2B5CB8',
    privateBtnBorder: '#88B6FF',
    privateBtnText: '#FFFFFF',
    privateBtnSub: '#DCEBFF',
    privateIconColor: '#FFD166',

    surfaceCard: 'rgba(70, 55, 53, 0.92)',
    surfaceCardAlt: '#5E4B48',
    surfaceHighlight: '#5B98F6',
    surfacePill: '#5E4B48',
    borderSubtle: 'rgba(255, 236, 230, 0.18)',
    borderAccent: '#5B98F6',
    borderWarm: 'rgba(255, 132, 122, 0.5)',

    textPrimary: '#FFF6F4',
    textSecondary: '#DECAC6',
    textMuted: '#B39B96',
    textOnPrimary: '#FFFFFF',
    textOnAccent: '#1D3546',

    primaryTop: '#FF9A91',
    primaryMid: '#F47169',
    primaryBottom: '#DE544C',
    primaryShadow: '#AD342E',

    brandAccent: '#FF867C',
    accent: '#5B98F6',
    accentSoft: '#CBEBFF',
    accentBg: 'rgba(91, 152, 246, 0.2)',
    secondaryAccent: '#CBEBFF',
    chipPillBg: '#3A2D2B',
    chipPillText: '#FFD166',
    chipIconColor: '#FFD166',
    starColor: '#FF867C',
    starMuted: 'rgba(255, 236, 230, 0.22)',

    selectedBg: '#FFA9A1',
    selectedBorder: '#FFDCD8',
    selectedText: '#331412',
    selectedSubText: '#5A2622',

    dockBg: 'transparent',
    dockBorder: 'transparent',

    tableRoomTop: '#423331',
    tableRoomMid: '#4C3B39',
    tableRoomBottom: '#332726',
    hudPillBg: 'rgba(58, 45, 43, 0.88)',
    hudPillBorder: 'rgba(255, 236, 230, 0.2)',
    hudPillText: '#FFF6F4',
  },

  /**
   * Daylight Option — Brisa Coral (User's earlier 5-color daylight palette, now with 3D tactile bevels)
   */
  coral_brisa: {
    id: 'coral_brisa',
    name: 'Brisa Coral',
    shortLabel: 'Brisa',
    isDark: false,
    swatches: ['#ED6A5A', '#F4F1BB', '#9BC1BC', '#E6EBE0', '#36C9C6'],

    bgTop: '#E6EBE0',
    bgMid: '#ECF0E7',
    bgBottom: '#DCE5D9',
    glowTop: '#F4F1BB',
    glowTopOpacity: 0.72,
    glowBottom: '#9BC1BC',
    glowBottomOpacity: 0.34,

    titlePrimary: '#1A3136',
    titleSecondary: '#ED6A5A',
    titleShadow: 'rgba(26, 49, 54, 0.16)',
    kickerColor: '#5B787D',

    topPillBg: '#FFFFFF',
    topPillLip: '#B7CECA',
    topPillBorder: '#D8E6E2',
    topPillText: '#1A3136',
    levelPillBg: '#FFFFFF',
    levelPillLip: '#B7CECA',
    levelPillText: '#1A3136',
    gearBg: '#36C9C6',
    gearLip: '#219A97',
    gearIcon: '#FFFFFF',

    heroCardBg: '#FFFDF0',
    heroCardLip: '#D8D4A4',
    heroCardBorder: '#FFFFFF',
    heroCardText: '#1A3136',
    heroCardSub: '#47656A',
    heroAvatarRing: '#36C9C6',
    heroEditBg: '#ED6A5A',
    heroEditText: '#FFFFFF',

    dailyCardBg: '#FFFFFF',
    dailyCardLip: '#BDD4D0',
    dailyCardBorder: '#FFFFFF',
    dailyCardText: '#1A3136',
    dailyCardSub: '#516E73',
    dailyBtnBg: '#ED6A5A',
    dailyBtnLip: '#BE4537',
    dailyBtnText: '#FFFFFF',

    trayBg: 'rgba(155, 193, 188, 0.24)',
    trayBorder: 'rgba(155, 193, 188, 0.5)',
    trayLabel: '#47656A',

    modeBg: '#FFFFFF',
    modeLip: '#BDD4D0',
    modeBorder: '#FFFFFF',
    modeText: '#1A3136',
    modeSub: '#5B787D',
    modeSelectedBg: '#36C9C6',
    modeSelectedLip: '#1E9B98',
    modeSelectedBorder: '#84E8E5',
    modeSelectedText: '#082E30',
    modeSelectedSub: '#10494C',

    scoreBg: '#FFFFFF',
    scoreLip: '#BDD4D0',
    scoreBorder: '#FFFFFF',
    scoreText: '#1A3136',
    scoreSelectedBg: '#ED6A5A',
    scoreSelectedLip: '#BE4537',
    scoreSelectedBorder: '#F79D92',
    scoreSelectedText: '#FFFFFF',

    accountBg: '#FFFFFF',
    accountLip: '#BDD4D0',
    accountBorder: '#FFFFFF',
    accountText: '#3A585E',
    accountBtnBg: '#F4F1BB',
    accountBtnLip: '#CCC683',
    accountBtnText: '#3A320D',

    onlineBtnBg: '#FFFFFF',
    onlineBtnLip: '#BDD4D0',
    onlineBtnBorder: '#9BC1BC',
    onlineBtnText: '#1A3136',
    onlineBtnSub: '#516E73',
    onlineIconColor: '#25ABA8',

    privateBtnBg: '#FFFFFF',
    privateBtnLip: '#BDD4D0',
    privateBtnBorder: '#9BC1BC',
    privateBtnText: '#1A3136',
    privateBtnSub: '#516E73',
    privateIconColor: '#ED6A5A',

    surfaceCard: 'rgba(255, 255, 255, 0.92)',
    surfaceCardAlt: '#F5F7F1',
    surfaceHighlight: '#FFFDF0',
    surfacePill: 'rgba(255, 255, 255, 0.9)',
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

    dockBg: 'transparent',
    dockBorder: 'transparent',

    tableRoomTop: '#D9E5DF',
    tableRoomMid: '#E6EBE0',
    tableRoomBottom: '#CFE0DB',
    hudPillBg: 'rgba(255, 255, 255, 0.88)',
    hudPillBorder: 'rgba(155, 193, 188, 0.72)',
    hudPillText: '#1A3136',
  },
};

export const APP_PALETTE_LIST: AppPalette[] = [
  APP_PALETTES.indigo_crema,
  APP_PALETTES.cacao_coral,
  APP_PALETTES.noche_menta,
  APP_PALETTES.espresso_cielo,
  APP_PALETTES.coral_brisa,
];
