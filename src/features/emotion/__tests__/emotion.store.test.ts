import { describe, it, expect, beforeEach } from 'vitest';
import { useEmotionStore } from '../emotion.store';

const sampleResult = {
  entryId: 1,
  emotionTags: ['焦虑'],
  intensity: 6,
  cognitiveBiases: ['灾难化'],
  possibleRootCause: '工作压力',
  familyConnection: false,
  mindfulnessSuggestion: '深呼吸',
};

const anotherResult = {
  entryId: 2,
  emotionTags: ['喜悦'],
  intensity: 8,
  cognitiveBiases: [],
  possibleRootCause: null,
  familyConnection: false,
  mindfulnessSuggestion: null,
};

describe('useEmotionStore', () => {
  beforeEach(() => {
    useEmotionStore.setState({ history: [], latest: null });
  });

  it('initial state is empty', () => {
    const state = useEmotionStore.getState();
    expect(state.history).toEqual([]);
    expect(state.latest).toBeNull();
  });

  it('setLatest updates latest only', () => {
    useEmotionStore.getState().setLatest(sampleResult);
    const state = useEmotionStore.getState();
    expect(state.latest).toEqual(sampleResult);
    expect(state.history).toEqual([]);
  });

  it('addToHistory appends to history and sets latest', () => {
    useEmotionStore.getState().addToHistory(sampleResult);
    const state = useEmotionStore.getState();
    expect(state.history).toHaveLength(1);
    expect(state.history[0]).toEqual(sampleResult);
    expect(state.latest).toEqual(sampleResult);
  });

  it('addToHistory accumulates entries', () => {
    useEmotionStore.getState().addToHistory(sampleResult);
    useEmotionStore.getState().addToHistory(anotherResult);
    const state = useEmotionStore.getState();
    expect(state.history).toHaveLength(2);
    expect(state.latest).toEqual(anotherResult);
  });

  it('clear resets to initial state', () => {
    useEmotionStore.getState().addToHistory(sampleResult);
    useEmotionStore.getState().clear();
    const state = useEmotionStore.getState();
    expect(state.history).toEqual([]);
    expect(state.latest).toBeNull();
  });
});
