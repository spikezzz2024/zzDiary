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

export interface AiSettings {
  mode: 'ollama' | 'deepseek';
  deepseekApiKey: string | null;
  ollamaModel: string;
  ollamaBaseUrl: string;
}
