export type TableThemeId = 'caribe' | 'caoba' | 'esmeralda';

export interface TableThemeConfig {
  id: TableThemeId;
  name: string;
  subtitle: string;
  costChips: number;
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
 * Each theme harmonizes felt, brass rail inlay, wooden table frame, and player hand rack.
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
};

export const TABLE_THEME_LIST: TableThemeConfig[] = [
  TABLE_THEMES.caribe,
  TABLE_THEMES.caoba,
  TABLE_THEMES.esmeralda,
];
