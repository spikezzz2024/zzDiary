import { create } from 'zustand';

export type PaperMaterial = 'grid' | 'lined' | 'blank';
export type PaperColor = 'classic' | 'rice' | 'warm' | 'forest' | 'lavender' | 'slate' | 'dark' | 'blue';

export interface PaperPreferences {
  material: PaperMaterial;
  color: PaperColor;
}

interface PaperState extends PaperPreferences {
  setMaterial: (material: PaperMaterial) => void;
  setColor: (color: PaperColor) => void;
  reset: () => void;
}

const DEFAULTS: PaperPreferences = {
  material: 'grid',
  color: 'classic',
};

function loadPreferences(): PaperPreferences {
  try {
    const stored = localStorage.getItem('zzdiary-paper-prefs');
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...DEFAULTS, ...parsed };
    }
  } catch { /* ignore corrupt localStorage */ }
  return DEFAULTS;
}

function savePreferences(prefs: PaperPreferences): void {
  try {
    localStorage.setItem('zzdiary-paper-prefs', JSON.stringify(prefs));
  } catch { /* ignore quota errors */ }
}

export const usePaperStore = create<PaperState>((set, get) => ({
  ...loadPreferences(),

  setMaterial: (material) => {
    set({ material });
    savePreferences({ ...get(), material });
  },

  setColor: (color) => {
    set({ color });
    savePreferences({ ...get(), color });
  },

  reset: () => {
    set(DEFAULTS);
    savePreferences(DEFAULTS);
  },
}));
