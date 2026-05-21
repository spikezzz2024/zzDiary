export type WriteMode = 'guided' | 'free';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}
