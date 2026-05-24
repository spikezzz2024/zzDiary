export interface AnalyzeRequest {
  content: string;
}

export interface AnalyzeResponse {
  entryId: number;
  emotionTags: string[];
  intensity: number;
  cognitiveBiases: string[];
  possibleRootCause: string;
  familyConnection: boolean;
  mindfulnessSuggestion: string;
}

export interface DiaryEntryDto {
  id: number;
  content: string;
  mode: 'guided' | 'free';
  emotionTags: string[];
  emotionIntensity: number;
  createdAt: string;
}

export interface EmotionDistribution {
  emotion: string;
  count: number;
}

export interface AiSettings {
  mode: 'ollama' | 'deepseek';
  deepseekApiKey: string | null;
  ollamaModel: string;
  ollamaBaseUrl: string;
}

export interface SearchResult {
  id: number;
  snippet: string;
  score: number;
  emotionTags: string[];
  createdAt: string;
}

export interface FamilyBackground {
  id: number;
  childhoodSummary: string;
  parentalRelationship: string;
  significantEvents: string;
  skillSummary: string | null;
  createdAt: string;
  updatedAt: string;
}
