import { useMindfulnessStore } from './mindfulness.store';
import { EXERCISE_META } from './types';
import type { ExerciseType } from './types';
import BreathingExercise from './BreathingExercise';
import GratitudeJournal from './GratitudeJournal';
import EmotionAwareness from './EmotionAwareness';
import ProgressTracker from './ProgressTracker';

export default function MindfulnessPage() {
  const {
    recommendation,
    recommending,
    logging,
    error,
    getRecommendation,
    logExercise,
    fetchProgress,
    clearRecommendation,
    clearError,
  } = useMindfulnessStore();

  const handleGetRecommendation = async (type?: ExerciseType) => {
    await getRecommendation(type);
  };

  const handleComplete = async (durationSeconds?: number, userContent?: string) => {
    if (!recommendation) return;
    const ok = await logExercise(recommendation.id, durationSeconds, userContent);
    if (ok) {
      clearRecommendation();
      fetchProgress();
    }
  };

  const inputClass = `w-full rounded-lg border px-4 py-3 text-sm leading-relaxed resize-y outline-none transition-colors
    bg-[var(--paper-bg)] border-[var(--paper-border)] text-[var(--paper-text)]
    placeholder:text-[var(--paper-text-secondary)] focus:border-[#c4b89a] focus:ring-1 focus:ring-[#c4b89a]`;

  // --- Empty state (no recommendation active) ---
  if (!recommendation) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-lg font-semibold" style={{ color: 'var(--paper-text)' }}>
            正念练习
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--paper-text-secondary)' }}>
            AI 根据你近期的情绪状态，推荐个性化的正念练习，帮助你建立觉察和调节的习惯。
          </p>
        </div>

        {/* Exercise type selector */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {(Object.entries(EXERCISE_META) as [ExerciseType, typeof EXERCISE_META[ExerciseType]][]).map(
            ([type, meta]) => (
              <button
                key={type}
                onClick={() => handleGetRecommendation(type)}
                disabled={recommending}
                className="rounded-xl border p-5 text-left cursor-pointer transition-all hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: 'var(--paper-bg)', borderColor: 'var(--paper-border)' }}
              >
                <p className="text-sm font-medium mb-1" style={{ color: meta.color }}>
                  {meta.label}
                </p>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--paper-text-secondary)' }}>
                  {meta.description}
                </p>
              </button>
            ),
          )}
        </div>

        {/* Auto-recommend */}
        <div className="text-center">
          <button
            onClick={() => handleGetRecommendation()}
            disabled={recommending}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#5c4a2e', color: '#faf7f2' }}
          >
            {recommending && (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <circle cx="12" cy="12" r="10" strokeOpacity={0.25} />
                <path strokeLinecap="round" d="M12 2a10 10 0 019.95 9" />
              </svg>
            )}
            {recommending ? '生成中...' : 'AI 智能推荐'}
          </button>
          <p className="text-xs mt-2" style={{ color: 'var(--paper-text-secondary)' }}>
            AI 将根据你的近期情绪自动选择最合适的练习类型
          </p>
        </div>

        {error && (
          <div className="rounded-lg border p-3 flex items-center justify-between"
            style={{ borderColor: '#e8c4c4', backgroundColor: '#fef5f5' }}>
            <p className="text-sm" style={{ color: '#b53b3b' }}>{error}</p>
            <button onClick={clearError}
              className="text-sm underline cursor-pointer shrink-0 ml-3"
              style={{ color: '#b53b3b' }}>
              关闭
            </button>
          </div>
        )}

        <ProgressTracker />
      </div>
    );
  }

  // --- Exercising state ---
  const meta = EXERCISE_META[recommendation.exerciseType];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold" style={{ color: 'var(--paper-text)' }}>
            {meta.label}
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--paper-text-secondary)' }}>
            AI 根据你的情绪状态为你推荐了以下练习
          </p>
        </div>
        <button onClick={clearRecommendation}
          className="text-sm cursor-pointer underline"
          style={{ color: 'var(--paper-text-secondary)' }}>
          返回列表
        </button>
      </div>

      {error && (
        <div className="rounded-lg border p-3 flex items-center justify-between"
          style={{ borderColor: '#e8c4c4', backgroundColor: '#fef5f5' }}>
          <p className="text-sm" style={{ color: '#b53b3b' }}>{error}</p>
          <button onClick={clearError}
            className="text-sm underline cursor-pointer shrink-0 ml-3"
            style={{ color: '#b53b3b' }}>
            关闭
          </button>
        </div>
      )}

      {recommendation.exerciseType === 'breathing' && (
        <BreathingExercise
          exerciseId={recommendation.id}
          recommendationText={recommendation.recommendationText}
          onComplete={(duration) => handleComplete(duration)}
        />
      )}
      {recommendation.exerciseType === 'gratitude' && (
        <GratitudeJournal
          exerciseId={recommendation.id}
          recommendationText={recommendation.recommendationText}
          onComplete={(content, duration) => handleComplete(duration, content)}
        />
      )}
      {recommendation.exerciseType === 'emotion_awareness' && (
        <EmotionAwareness
          exerciseId={recommendation.id}
          recommendationText={recommendation.recommendationText}
          onComplete={(content, duration) => handleComplete(duration, content)}
        />
      )}
    </div>
  );
}
