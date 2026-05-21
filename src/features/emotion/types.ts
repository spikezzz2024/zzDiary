export interface EmotionTagMeta {
  label: string;
  color: string;
  bg: string;
}

export interface TrendPoint {
  date: string;
  dominantEmotion: string;
  avgIntensity: number;
}
