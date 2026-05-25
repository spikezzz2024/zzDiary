import { useState, useRef, useCallback } from 'react';
import { EXERCISE_META } from './types';

interface Props {
  exerciseId: number;
  recommendationText: string;
  onComplete: (content: string, durationSeconds: number) => void;
}

export default function GratitudeJournal({ exerciseId, recommendationText, onComplete }: Props) {
  const [items, setItems] = useState(['', '', '']);
  const [started, setStarted] = useState(false);
  const [completed, setCompleted] = useState(false);
  const startRef = useRef<number>(0);

  const handleChange = useCallback((idx: number, value: string) => {
    if (!started) {
      setStarted(true);
      startRef.current = Date.now();
    }
    setItems((prev) => {
      const next = [...prev];
      next[idx] = value;
      return next;
    });
  }, [started]);

  const allFilled = items.every((i) => i.trim().length > 0);

  const handleComplete = () => {
    const duration = Math.round((Date.now() - startRef.current) / 1000);
    const content = items.map((i, idx) => `${idx + 1}. ${i.trim()}`).join('\n');
    setCompleted(true);
    onComplete(content, duration);
  };

  const inputClass = `w-full rounded-lg border px-4 py-3 text-sm leading-relaxed resize-none outline-none transition-colors
    bg-[var(--paper-bg)] border-[var(--paper-border)] text-[var(--paper-text)]
    placeholder:text-[var(--paper-text-secondary)] focus:border-[var(--app-accent)] focus:ring-1 focus:ring-[var(--app-accent)]`;

  return (
    <div className="rounded-xl border p-6 space-y-5"
      style={{ backgroundColor: 'var(--paper-bg)', borderColor: 'var(--paper-border)' }}>
      {/* Recommendation prompt */}
      <div className="rounded-lg px-4 py-3 border"
        style={{ backgroundColor: EXERCISE_META.gratitude.color + '10', borderColor: EXERCISE_META.gratitude.color + '30' }}>
        <p className="text-xs font-medium mb-1" style={{ color: EXERCISE_META.gratitude.color }}>
          AI 推荐主题
        </p>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--paper-text)' }}>
          {recommendationText}
        </p>
      </div>

      {/* Three gratitude items */}
      <div className="space-y-3">
        {['今天值得感恩的第一件事', '今天值得感恩的第二件事', '今天值得感恩的第三件事'].map((placeholder, idx) => (
          <div key={idx}>
            <p className="text-xs font-medium mb-1.5" style={{ color: 'var(--paper-text-secondary)' }}>
              第{idx + 1}件
            </p>
            <textarea
              className={inputClass}
              rows={2}
              value={items[idx]}
              onChange={(e) => handleChange(idx, e.target.value)}
              placeholder={placeholder}
              disabled={completed}
            />
          </div>
        ))}
      </div>

      {/* Complete button */}
      <div className="flex justify-center">
        {!completed ? (
          <button onClick={handleComplete} disabled={!allFilled}
            className="px-5 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: EXERCISE_META.gratitude.color, color: '#fff' }}>
            记录完成
          </button>
        ) : (
          <p className="text-sm" style={{ color: '#7aaa7a' }}>
            已完成 ✓
          </p>
        )}
      </div>
    </div>
  );
}
