import type { EmotionTagMeta } from '../../features/emotion/types';

export const EMOTION_COLORS: Record<string, EmotionTagMeta> = {
  焦虑: { label: '焦虑', color: 'text-amber-700', bg: 'bg-amber-100' },
  愤怒: { label: '愤怒', color: 'text-red-700', bg: 'bg-red-100' },
  悲伤: { label: '悲伤', color: 'text-blue-700', bg: 'bg-blue-100' },
  羞耻: { label: '羞耻', color: 'text-pink-700', bg: 'bg-pink-100' },
  恐惧: { label: '恐惧', color: 'text-purple-700', bg: 'bg-purple-100' },
  喜悦: { label: '喜悦', color: 'text-green-700', bg: 'bg-green-100' },
  平静: { label: '平静', color: 'text-teal-700', bg: 'bg-teal-100' },
  内疚: { label: '内疚', color: 'text-rose-700', bg: 'bg-rose-100' },
  孤独: { label: '孤独', color: 'text-slate-700', bg: 'bg-slate-100' },
  感激: { label: '感激', color: 'text-emerald-700', bg: 'bg-emerald-100' },
  困惑: { label: '困惑', color: 'text-orange-700', bg: 'bg-orange-100' },
  失望: { label: '失望', color: 'text-gray-700', bg: 'bg-gray-100' },
};

export const DEFAULT_EMOTION_META: EmotionTagMeta = {
  label: '未知',
  color: 'text-gray-600',
  bg: 'bg-gray-100',
};
