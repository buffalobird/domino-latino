export type TableThemeId =
  | 'caribe'
  | 'caoba'
  | 'esmeralda'
  | 'habana_noche'
  | 'casino_oro';

export interface TableThemeConfig {
  id: TableThemeId;
  name: string;
  subtitle: string;
  costChips: number;
  tag?: string;
  feltCenter: string;
  feltEdge: string;
  feltInlay: string;
  woodLight: string;
  woodMid: string;
  woodDark: string;
  rackTop: string;
  rackBottom: string;
  accent: string;
}

/**
 * Tactile Club table themes unlockable strictly with soft-currency "Fichas de Club".
 * Long-tail ladder from Free up to 15,000 Club Chips.
 */
export const TABLE_THEMES: Record<TableThemeId, TableThemeConfig> = {
  caribe: {
    id: 'caribe',
    name: 'Club Caribe',
    subtitle: 'Paño petróleo nocturno y caoba clásica',
    costChips: 0,
    feltCenter: '#14626A',
    feltEdge: '#09343E',
    feltInlay: 'rgba(245, 214, 138, 0.22)',
    woodLight: '#C57B42',
    woodMid: '#8C4B20',
    woodDark: '#47210B',
    rackTop: '#713B18',
    rackBottom: '#3A1B08',
    accent: '#38BDF8',
  },
  caoba: {
    id: 'caoba',
    name: 'Salón La Habana',
    subtitle: 'Zafiro elegante y roble dorado',
    costChips: 600,
    feltCenter: '#1A4B8C',
    feltEdge: '#0D264C',
    feltInlay: 'rgba(245, 196, 81, 0.28)',
    woodLight: '#D0914E',
    woodMid: '#995E26',
    woodDark: '#522C0D',
    rackTop: '#7F4C1D',
    rackBottom: '#422209',
    accent: '#F5C451',
  },
  esmeralda: {
    id: 'esmeralda',
    name: 'Esmeralda Real',
    subtitle: 'Paño torneo profesional y nogal oscuro',
    costChips: 1200,
    tag: 'Torneo',
    feltCenter: '#146645',
    feltEdge: '#083724',
    feltInlay: 'rgba(245, 214, 138, 0.26)',
    woodLight: '#A56D49',
    woodMid: '#6E4326',
    woodDark: '#361E0F',
    rackTop: '#5E3920',
    rackBottom: '#2B170A',
    accent: '#27D188',
  },
  habana_noche: {
    id: 'habana_noche',
    name: 'Terciopelo Burdeos',
    subtitle: 'Salón nocturno vino tinto y filete dorado',
    costChips: 4000,
    tag: 'VIP',
    feltCenter: '#6E1D34',
    feltEdge: '#380C1A',
    feltInlay: 'rgba(245, 196, 81, 0.34)',
    woodLight: '#B27C4F',
    woodMid: '#6B3E22',
    woodDark: '#2E160A',
    rackTop: '#542D16',
    rackBottom: '#251208',
    accent: '#FB7185',
  },
  casino_oro: {
    id: 'casino_oro',
    name: 'Gran Salón Dorado',
    subtitle: 'Paño obsidiana de gala con marco de oro',
    costChips: 15000,
    tag: 'Leyenda',
    feltCenter: '#1A2438',
    feltEdge: '#0A101D',
    feltInlay: 'rgba(253, 224, 71, 0.42)',
    woodLight: '#D9A94E',
    woodMid: '#8F621B',
    woodDark: '#3E2607',
    rackTop: '#6E4912',
    rackBottom: '#2E1C06',
    accent: '#FDE047',
  },
};

export const TABLE_THEME_LIST: TableThemeConfig[] = [
  TABLE_THEMES.caribe,
  TABLE_THEMES.caoba,
  TABLE_THEMES.esmeralda,
  TABLE_THEMES.habana_noche,
  TABLE_THEMES.casino_oro,
];
