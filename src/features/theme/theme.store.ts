import { create } from 'zustand';

export type ThemeMode = 'light' | 'dark' | 'system';
export type FontSize = 'small' | 'medium' | 'large';
export type FontFamily = 'song' | 'kai' | 'hei' | 'serif';
export type LineSpacing = 'compact' | 'normal' | 'relaxed';

export const ACCENT_PRESETS = [
  '#b8860b', // darkgoldenrod
  '#6366f1', // indigo
  '#10b981', // emerald
  '#f43f5e', // rose
  '#f59e0b', // amber
  '#8b5cf6', // violet
] as const;

export const FONT_FAMILY_MAP: Record<FontFamily, string> = {
  song: "'SimSun', 'STSong', 'Noto Serif SC', serif",
  kai: "'KaiTi', 'STKaiti', 'Noto Serif SC', serif",
  hei: "'SimHei', 'STHeiti', 'Noto Sans SC', sans-serif",
  serif: "'Noto Serif SC', 'Source Han Serif SC', serif",
};

interface ThemeState {
  mode: ThemeMode;
  resolvedMode: 'light' | 'dark';
  fontSize: FontSize;
  fontFamily: FontFamily;
  lineSpacing: LineSpacing;
  accentColor: string;

  setMode: (mode: ThemeMode) => void;
  setFontSize: (size: FontSize) => void;
  setFontFamily: (family: FontFamily) => void;
  setLineSpacing: (spacing: LineSpacing) => void;
  setAccentColor: (color: string) => void;
  reset: () => void;
}

const DEFAULTS = {
  mode: 'light' as ThemeMode,
  resolvedMode: 'light' as const,
  fontSize: 'medium' as FontSize,
  fontFamily: 'kai' as FontFamily,
  lineSpacing: 'normal' as LineSpacing,
  accentColor: '#b8860b',
};

function resolveSystemMode(): 'light' | 'dark' {
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
}

function loadPreferences() {
  try {
    const stored = localStorage.getItem('zzdiary-theme-prefs');
    if (stored) {
      const parsed = JSON.parse(stored);
      const mode = parsed.mode ?? DEFAULTS.mode;
      return {
        ...DEFAULTS,
        ...parsed,
        mode,
        resolvedMode: mode === 'system' ? resolveSystemMode() : mode,
      };
    }
  } catch { /* ignore corrupt localStorage */ }
  return DEFAULTS;
}

function savePreferences(state: ThemeState): void {
  try {
    localStorage.setItem('zzdiary-theme-prefs', JSON.stringify({
      mode: state.mode,
      fontSize: state.fontSize,
      fontFamily: state.fontFamily,
      lineSpacing: state.lineSpacing,
      accentColor: state.accentColor,
    }));
  } catch { /* ignore quota errors */ }
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  ...loadPreferences(),

  setMode: (mode) => {
    const resolvedMode = mode === 'system' ? resolveSystemMode() : mode;
    set({ mode, resolvedMode });
    savePreferences(get());
  },

  setFontSize: (fontSize) => {
    set({ fontSize });
    savePreferences(get());
  },

  setFontFamily: (fontFamily) => {
    set({ fontFamily });
    savePreferences(get());
  },

  setLineSpacing: (lineSpacing) => {
    set({ lineSpacing });
    savePreferences(get());
  },

  setAccentColor: (accentColor) => {
    set({ accentColor });
    savePreferences(get());
  },

  reset: () => {
    set(DEFAULTS);
    savePreferences(DEFAULTS);
  },
}));
