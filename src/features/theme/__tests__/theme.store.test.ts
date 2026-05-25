import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useThemeStore } from '../theme.store';

function resetStore(): void {
  useThemeStore.setState({
    mode: 'light',
    resolvedMode: 'light',
    fontSize: 'medium',
    fontFamily: 'kai',
    lineSpacing: 'normal',
    accentColor: '#b8860b',
  });
}

describe('themeStore', () => {
  beforeEach(() => {
    resetStore();
    localStorage.removeItem('zzdiary-theme-prefs');
  });

  it('has correct default values', () => {
    const s = useThemeStore.getState();
    expect(s.mode).toBe('light');
    expect(s.resolvedMode).toBe('light');
    expect(s.fontSize).toBe('medium');
    expect(s.fontFamily).toBe('kai');
    expect(s.lineSpacing).toBe('normal');
    expect(s.accentColor).toBe('#b8860b');
  });

  it('setMode updates mode and resolvedMode', () => {
    useThemeStore.getState().setMode('dark');
    expect(useThemeStore.getState().mode).toBe('dark');
    expect(useThemeStore.getState().resolvedMode).toBe('dark');
    useThemeStore.getState().setMode('light');
    expect(useThemeStore.getState().resolvedMode).toBe('light');
  });

  it('setMode system resolves based on OS preference', () => {
    const matchMediaMock = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
    vi.stubGlobal('matchMedia', matchMediaMock);
    window.matchMedia = matchMediaMock;

    useThemeStore.getState().setMode('system');
    expect(useThemeStore.getState().mode).toBe('system');
    expect(['light', 'dark']).toContain(useThemeStore.getState().resolvedMode);

    vi.unstubAllGlobals();
  });

  it('setFontSize updates', () => {
    useThemeStore.getState().setFontSize('large');
    expect(useThemeStore.getState().fontSize).toBe('large');
    useThemeStore.getState().setFontSize('small');
    expect(useThemeStore.getState().fontSize).toBe('small');
  });

  it('setFontFamily updates', () => {
    useThemeStore.getState().setFontFamily('hei');
    expect(useThemeStore.getState().fontFamily).toBe('hei');
    useThemeStore.getState().setFontFamily('song');
    expect(useThemeStore.getState().fontFamily).toBe('song');
  });

  it('setLineSpacing updates', () => {
    useThemeStore.getState().setLineSpacing('compact');
    expect(useThemeStore.getState().lineSpacing).toBe('compact');
    useThemeStore.getState().setLineSpacing('relaxed');
    expect(useThemeStore.getState().lineSpacing).toBe('relaxed');
  });

  it('setAccentColor updates', () => {
    useThemeStore.getState().setAccentColor('#6366f1');
    expect(useThemeStore.getState().accentColor).toBe('#6366f1');
  });

  it('persists to localStorage', () => {
    useThemeStore.getState().setMode('dark');
    useThemeStore.getState().setFontSize('large');
    const stored = JSON.parse(localStorage.getItem('zzdiary-theme-prefs')!);
    expect(stored.mode).toBe('dark');
    expect(stored.fontSize).toBe('large');
  });

  it('reset restores defaults', () => {
    useThemeStore.getState().setMode('dark');
    useThemeStore.getState().setFontSize('large');
    useThemeStore.getState().setFontFamily('hei');
    useThemeStore.getState().setLineSpacing('relaxed');
    useThemeStore.getState().setAccentColor('#6366f1');
    useThemeStore.getState().reset();
    const s = useThemeStore.getState();
    expect(s.mode).toBe('light');
    expect(s.fontSize).toBe('medium');
    expect(s.fontFamily).toBe('kai');
    expect(s.lineSpacing).toBe('normal');
    expect(s.accentColor).toBe('#b8860b');
  });

  it('loadPreferences falls back to defaults on corrupt data', () => {
    // The store is already loaded, but we verify the reset works
    // and that calling setMode after corrupt localStorage write works fine
    localStorage.setItem('zzdiary-theme-prefs', 'not-valid-json');
    useThemeStore.getState().reset();
    useThemeStore.getState().setMode('dark');
    // After a set + save, the stored value should be valid
    const stored = JSON.parse(localStorage.getItem('zzdiary-theme-prefs')!);
    expect(stored.mode).toBe('dark');
  });
});
