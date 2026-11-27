import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import {
  APP_PALETTE_LIST,
  APP_PALETTES,
  AppPalette,
  AppPaletteId,
} from '@/constants/appPalettes';

const PALETTE_STORAGE_KEY = 'domino_latino_palette_lab_v2';
const DEFAULT_PALETTE_ID: AppPaletteId = 'indigo_crema';

interface PaletteContextValue {
  paletteId: AppPaletteId;
  palette: AppPalette;
  allPalettes: AppPalette[];
  setPaletteId: (id: AppPaletteId) => void;
  cyclePalette: () => void;
}

const PaletteContext = createContext<PaletteContextValue>({
  paletteId: DEFAULT_PALETTE_ID,
  palette: APP_PALETTES[DEFAULT_PALETTE_ID],
  allPalettes: APP_PALETTE_LIST,
  setPaletteId: () => {},
  cyclePalette: () => {},
});

export function PaletteProvider({ children }: { children: React.ReactNode }) {
  const [paletteId, setPaletteIdState] = useState<AppPaletteId>(DEFAULT_PALETTE_ID);

  useEffect(() => {
    AsyncStorage.getItem(PALETTE_STORAGE_KEY)
      .then((saved) => {
        if (saved && saved in APP_PALETTES) {
          setPaletteIdState(saved as AppPaletteId);
        }
      })
      .catch(() => {});
  }, []);

  const setPaletteId = useCallback((id: AppPaletteId) => {
    if (!(id in APP_PALETTES)) return;
    setPaletteIdState(id);
    AsyncStorage.setItem(PALETTE_STORAGE_KEY, id).catch(() => {});
  }, []);

  const cyclePalette = useCallback(() => {
    setPaletteIdState((prev) => {
      const idx = APP_PALETTE_LIST.findIndex((p) => p.id === prev);
      const next = APP_PALETTE_LIST[(idx + 1) % APP_PALETTE_LIST.length].id;
      AsyncStorage.setItem(PALETTE_STORAGE_KEY, next).catch(() => {});
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      paletteId,
      palette: APP_PALETTES[paletteId] ?? APP_PALETTES[DEFAULT_PALETTE_ID],
      allPalettes: APP_PALETTE_LIST,
      setPaletteId,
      cyclePalette,
    }),
    [paletteId, setPaletteId, cyclePalette]
  );

  return <PaletteContext.Provider value={value}>{children}</PaletteContext.Provider>;
}

export function usePalette() {
  return useContext(PaletteContext);
}
