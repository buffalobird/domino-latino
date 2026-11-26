export type TableThemeId = 'caribe' | 'caoba' | 'esmeralda';

export interface TableThemeConfig {
  id: TableThemeId;
  name: string;
  subtitle: string;
  costChips: number;
  feltCenter: string;
  feltEdge: string;
  woodLight: string;
  woodMid: string;
  woodDark: string;
  accent: string;
}

/**
 * Cosmetic table themes unlockable strictly with soft-currency "Fichas de Club".
 * All themes preserve >= 4.5:1 pip legibility on ivory & ebony tiles.
 */
export const TABLE_THEMES: Record<TableThemeId, TableThemeConfig> = {
  caribe: {
    id: 'caribe',
    name: 'Club Caribe',
    subtitle: 'Paño petróleo nocturno y caoba',
    costChips: 0,
    feltCenter: '#135962',
    feltEdge: '#0B3542',
    woodLight: '#B66F39',
    woodMid: '#8A4B22',
    woodDark: '#4D260E',
    accent: '#38BDF8',
  },
  caoba: {
    id: 'caoba',
    name: 'Salón La Habana',
    subtitle: 'Azul zafiro clásico y roble cálido',
    costChips: 600,
    feltCenter: '#1A4480',
    feltEdge: '#0F274D',
    woodLight: '#C58546',
    woodMid: '#965A24',
    woodDark: '#522C0D',
    accent: '#F5C451',
  },
  esmeralda: {
    id: 'esmeralda',
    name: 'Esmeralda Real',
    subtitle: 'Paño verde torneo y nogal oscuro',
    costChips: 1200,
    feltCenter: '#135E40',
    feltEdge: '#093926',
    woodLight: '#9C6644',
    woodMid: '#6E4427',
    woodDark: '#3A2010',
    accent: '#2ED18A',
  },
};

export const TABLE_THEME_LIST: TableThemeConfig[] = [
  TABLE_THEMES.caribe,
  TABLE_THEMES.caoba,
  TABLE_THEMES.esmeralda,
];
