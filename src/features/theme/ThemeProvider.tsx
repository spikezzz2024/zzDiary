import { useEffect, type ReactNode } from 'react';
import { useThemeStore, FONT_FAMILY_MAP } from './theme.store';

interface Props {
  children: ReactNode;
}

export default function ThemeProvider({ children }: Props): React.ReactElement {
  const { mode, resolvedMode, fontSize, fontFamily, lineSpacing, accentColor } = useThemeStore();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme-mode', resolvedMode);
  }, [resolvedMode]);

  useEffect(() => {
    document.documentElement.setAttribute('data-font-size', fontSize);
  }, [fontSize]);

  useEffect(() => {
    document.documentElement.setAttribute('data-font-family', fontFamily);
    document.documentElement.style.setProperty('--font-family-body', FONT_FAMILY_MAP[fontFamily]);
    document.documentElement.style.setProperty('--font-family-editor', FONT_FAMILY_MAP[fontFamily]);
  }, [fontFamily]);

  useEffect(() => {
    document.documentElement.setAttribute('data-line-spacing', lineSpacing);
  }, [lineSpacing]);

  useEffect(() => {
    document.documentElement.style.setProperty('--app-accent', accentColor);
  }, [accentColor]);

  useEffect(() => {
    if (mode !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent): void => {
      useThemeStore.setState({ resolvedMode: e.matches ? 'dark' : 'light' });
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [mode]);

  return <>{children}</>;
}
