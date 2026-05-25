import { useThemeStore } from './theme.store';
import type { ThemeMode } from './theme.store';

const NEXT_MODE: Record<ThemeMode, ThemeMode> = {
  light: 'dark',
  dark: 'system',
  system: 'light',
};

const ICONS: Record<ThemeMode, string> = {
  light: 'M12 3v1m0 16v1m8-9h1M3 12H2m15.364-6.364l-.707.707M7.05 16.95l-.707.707m12.728 0l-.707-.707M7.757 7.05l-.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z',
  dark: 'M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z',
  system: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
};

const LABELS: Record<ThemeMode, string> = {
  light: '日间模式',
  dark: '夜间模式',
  system: '跟随系统',
};

export default function ThemeToggle(): React.ReactElement {
  const mode = useThemeStore((s) => s.mode);
  const setMode = useThemeStore((s) => s.setMode);

  const handleClick = (): void => {
    setMode(NEXT_MODE[mode]);
  };

  return (
    <button
      onClick={handleClick}
      className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs transition-colors cursor-pointer border"
      style={{
        color: 'var(--app-text-secondary)',
        borderColor: 'var(--app-border)',
        backgroundColor: 'var(--app-surface)',
      }}
      title={LABELS[mode]}
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d={ICONS[mode]} />
      </svg>
      <span>{LABELS[mode]}</span>
    </button>
  );
}
