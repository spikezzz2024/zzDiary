import { describe, it, expect } from 'vitest';
import { EMOTION_COLORS, DEFAULT_EMOTION_META } from '../emotions';

describe('EMOTION_COLORS', () => {
  it('has all 12 emotion keys', () => {
    const keys = Object.keys(EMOTION_COLORS);
    expect(keys).toHaveLength(12);
    expect(keys).toEqual([
      '焦虑', '愤怒', '悲伤', '羞耻', '恐惧', '喜悦',
      '平静', '内疚', '孤独', '感激', '困惑', '失望',
    ]);
  });

  it('each meta has required fields', () => {
    for (const [key, meta] of Object.entries(EMOTION_COLORS)) {
      expect(meta.label, `${key}: label`).toBeTruthy();
      expect(meta.color, `${key}: color`).toMatch(/^text-\w+-\d{3}$/);
      expect(meta.bg, `${key}: bg`).toMatch(/^bg-\w+-\d{2,3}$/);
    }
  });
});

describe('DEFAULT_EMOTION_META', () => {
  it('has required fields', () => {
    expect(DEFAULT_EMOTION_META.label).toBe('未知');
    expect(DEFAULT_EMOTION_META.color).toBe('text-gray-600');
    expect(DEFAULT_EMOTION_META.bg).toBe('bg-gray-100');
  });
});
