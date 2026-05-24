import { useEffect } from 'react';
import { useMindfulnessStore } from './mindfulness.store';
import { EXERCISE_META } from './types';

export default function ProgressTracker() {
  const { progress, progressLoading, fetchProgress } = useMindfulnessStore();

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  if (progressLoading) {
    return (
      <div className="rounded-xl border p-6 animate-pulse space-y-4"
        style={{ borderColor: 'var(--paper-border)', backgroundColor: 'var(--paper-bg)' }}>
        <div className="h-4 w-20 rounded" style={{ backgroundColor: 'var(--paper-border)' }} />
        <div className="flex gap-6">
          <div className="h-16 w-16 rounded-full" style={{ backgroundColor: 'var(--paper-border)' }} />
          <div className="h-16 w-16 rounded-full" style={{ backgroundColor: 'var(--paper-border)' }} />
          <div className="h-16 w-16 rounded-full" style={{ backgroundColor: 'var(--paper-border)' }} />
        </div>
      </div>
    );
  }

  if (!progress || progress.totalCompleted === 0) {
    return (
      <div className="rounded-xl border p-6 text-center"
        style={{ borderColor: 'var(--paper-border)', backgroundColor: 'var(--paper-bg)' }}>
        <p className="text-sm" style={{ color: 'var(--paper-text-secondary)' }}>
          完成首次练习后，将在此显示你的正念进度
        </p>
      </div>
    );
  }

  const formatDuration = (sec: number) => {
    if (sec < 60) return `${sec}秒`;
    const m = Math.floor(sec / 60);
    if (m < 60) return `${m}分钟`;
    const h = Math.floor(m / 60);
    return `${h}小时${m % 60}分钟`;
  };

  const StatItem = ({ value, label }: { value: string | number; label: string }) => (
    <div className="flex flex-col items-center">
      <span className="text-xl font-semibold tabular-nums" style={{ color: 'var(--paper-text)' }}>
        {value}
      </span>
      <span className="text-xs mt-0.5" style={{ color: 'var(--paper-text-secondary)' }}>
        {label}
      </span>
    </div>
  );

  const typeEntries = [
    { key: 'breathing', count: progress.breathingCount },
    { key: 'gratitude', count: progress.gratitudeCount },
    { key: 'emotion_awareness', count: progress.awarenessCount },
  ] as const;

  return (
    <div className="rounded-xl border p-6 space-y-5"
      style={{ borderColor: 'var(--paper-border)', backgroundColor: 'var(--paper-bg)' }}>
      <h2 className="text-sm font-medium" style={{ color: 'var(--paper-text)' }}>
        练习进度
      </h2>

      {/* Key stats */}
      <div className="flex justify-around">
        <StatItem value={progress.totalCompleted} label="总完成次数" />
        <StatItem value={`${progress.currentStreak}天`} label="连续天数" />
        <StatItem value={formatDuration(progress.totalDurationSeconds)} label="累计时长" />
      </div>

      {/* By-type breakdown */}
      <div className="space-y-2">
        {typeEntries.map(({ key, count }) => {
          const meta = EXERCISE_META[key];
          const max = Math.max(1, progress.totalCompleted);
          const pct = Math.round((count / max) * 100);
          return (
            <div key={key} className="flex items-center gap-3">
              <span className="text-xs w-16 shrink-0" style={{ color: 'var(--paper-text)' }}>
                {meta.label}
              </span>
              <div className="flex-1 h-2 rounded-full" style={{ backgroundColor: 'var(--paper-border)' }}>
                <div className="h-2 rounded-full transition-all duration-500"
                  style={{ width: `${pct}%`, backgroundColor: meta.color }} />
              </div>
              <span className="text-xs tabular-nums w-8 text-right"
                style={{ color: 'var(--paper-text-secondary)' }}>
                {count}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
