import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('usePaperStore', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.resetModules();
  });

  it('default values are grid and classic', async () => {
    const { usePaperStore } = await import('../paper.store');
    const state = usePaperStore.getState();
    expect(state.material).toBe('grid');
    expect(state.color).toBe('classic');
  });

  it('setMaterial updates state', async () => {
    const { usePaperStore } = await import('../paper.store');
    usePaperStore.getState().setMaterial('lined');
    expect(usePaperStore.getState().material).toBe('lined');
  });

  it('setColor updates state', async () => {
    const { usePaperStore } = await import('../paper.store');
    usePaperStore.getState().setColor('dark');
    expect(usePaperStore.getState().color).toBe('dark');
  });

  it('reset restores defaults', async () => {
    const { usePaperStore } = await import('../paper.store');
    usePaperStore.getState().setMaterial('blank');
    usePaperStore.getState().setColor('blue');
    usePaperStore.getState().reset();
    expect(usePaperStore.getState().material).toBe('grid');
    expect(usePaperStore.getState().color).toBe('classic');
  });

  it('persists to localStorage', async () => {
    const { usePaperStore } = await import('../paper.store');
    usePaperStore.getState().setMaterial('lined');
    const stored = localStorage.getItem('zzdiary-paper-prefs');
    expect(stored).toBeTruthy();
    const parsed = JSON.parse(stored!);
    expect(parsed.material).toBe('lined');
  });

  it('loads from localStorage on init', async () => {
    localStorage.setItem('zzdiary-paper-prefs', JSON.stringify({ material: 'blank', color: 'dark' }));
    const { usePaperStore } = await import('../paper.store');
    expect(usePaperStore.getState().material).toBe('blank');
    expect(usePaperStore.getState().color).toBe('dark');
  });
});
