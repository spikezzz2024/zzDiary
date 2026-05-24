export type ExerciseType = 'breathing' | 'gratitude' | 'emotion_awareness';

export interface MindfulnessRecommendResponse {
  id: number;
  exerciseType: ExerciseType;
  recommendationText: string;
  createdAt: string;
}

export interface MindfulnessExerciseLog {
  exerciseId: number;
  durationSeconds?: number;
  userContent?: string;
}

export interface ProgressStats {
  totalCompleted: number;
  currentStreak: number;
  totalDurationSeconds: number;
  breathingCount: number;
  gratitudeCount: number;
  awarenessCount: number;
}

export const EXERCISE_META: Record<ExerciseType, { label: string; color: string; description: string }> = {
  breathing: {
    label: '呼吸练习',
    color: '#4a90d9',
    description: '通过有节奏的呼吸调节自主神经系统，快速缓解焦虑和紧张',
  },
  gratitude: {
    label: '感恩日记',
    color: '#e8a87c',
    description: '记录值得感恩的事，培养积极关注的习惯，提升心理韧性',
  },
  emotion_awareness: {
    label: '情绪觉察',
    color: '#7aaa7a',
    description: '观察并命名当下情绪，培养非评判的自我觉察能力',
  },
};
