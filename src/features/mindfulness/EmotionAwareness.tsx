import { useState, useRef } from 'react';
import { EXERCISE_META } from './types';

const BODY_ZONES = [
  { key: 'head', label: '头部', cx: 100, cy: 30, r: 18 },
  { key: 'chest', label: '胸部', cx: 100, cy: 70, r: 22 },
  { key: 'stomach', label: '腹部', cx: 100, cy: 108, r: 18 },
  { key: 'hands', label: '双手', cx: 60, cy: 90, r: 14 },
  { key: 'feet', label: '双脚', cx: 100, cy: 160, r: 14 },
];

interface Props {
  exerciseId: number;
  recommendationText: string;
  onComplete: (content: string, durationSeconds: number) => void;
}

export default function EmotionAwareness({ exerciseId, recommendationText, onComplete }: Props) {
  const [activeZones, setActiveZones] = useState<Set<string>>(new Set());
  const [reflection, setReflection] = useState('');
  const [started, setStarted] = useState(false);
  const [completed, setCompleted] = useState(false);
  const startRef = useRef<number>(0);

  const toggleZone = (key: string) => {
    if (!started) {
      setStarted(true);
      startRef.current = Date.now();
    }
    setActiveZones((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handleComplete = () => {
    const duration = Math.round((Date.now() - startRef.current) / 1000);
    const zoneSummary = BODY_ZONES
      .filter((z) => activeZones.has(z.key))
      .map((z) => z.label)
      .join('、');
    const content = `觉察部位：${zoneSummary}\n感受记录：${reflection.trim()}`;
    setCompleted(true);
    onComplete(content, duration);
  };

  const allZonesActive = activeZones.size === BODY_ZONES.length;

  const textareaClass = `w-full rounded-lg border px-4 py-3 text-sm leading-relaxed resize-none outline-none transition-colors
    bg-[var(--paper-bg)] border-[var(--paper-border)] text-[var(--paper-text)]
    placeholder:text-[var(--paper-text-secondary)] focus:border-[var(--app-accent)] focus:ring-1 focus:ring-[var(--app-accent)]`;

  return (
    <div className="rounded-xl border p-6 space-y-5"
      style={{ backgroundColor: 'var(--paper-bg)', borderColor: 'var(--paper-border)' }}>
      {/* Recommendation prompt */}
      <div className="rounded-lg px-4 py-3 border"
        style={{ backgroundColor: EXERCISE_META.emotion_awareness.color + '10', borderColor: EXERCISE_META.emotion_awareness.color + '30' }}>
        <p className="text-xs font-medium mb-1" style={{ color: EXERCISE_META.emotion_awareness.color }}>
          AI 引导
        </p>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--paper-text)' }}>
          {recommendationText}
        </p>
      </div>

      {/* Body scan SVG */}
      <div className="flex justify-center">
        <svg viewBox="0 0 200 200" className="w-48 h-48">
          {/* Body outline */}
          <ellipse cx="100" cy="30" rx="20" ry="22" fill="none"
            stroke="var(--paper-border)" strokeWidth={1.5} />
          <line x1="100" y1="52" x2="100" y2="55" stroke="var(--paper-border)" strokeWidth={1.5} />
          <rect x="80" y="55" width="40" height="15" rx="3" fill="none"
            stroke="var(--paper-border)" strokeWidth={1.5} />
          <rect x="70" y="70" width="60" height="60" rx="8" fill="none"
            stroke="var(--paper-border)" strokeWidth={1.5} />
          <line x1="70" y1="88" x2="48" y2="95" stroke="var(--paper-border)" strokeWidth={2} />
          <line x1="130" y1="88" x2="152" y2="95" stroke="var(--paper-border)" strokeWidth={2} />
          <line x1="100" y1="130" x2="85" y2="162" stroke="var(--paper-border)" strokeWidth={2} />
          <line x1="100" y1="130" x2="115" y2="162" stroke="var(--paper-border)" strokeWidth={2} />

          {/* Interactive zones */}
          {BODY_ZONES.map((zone) => {
            const active = activeZones.has(zone.key);
            return (
              <circle
                key={zone.key}
                cx={zone.cx}
                cy={zone.cy}
                r={zone.r}
                fill={active ? EXERCISE_META.emotion_awareness.color + '30' : 'transparent'}
                stroke={active ? EXERCISE_META.emotion_awareness.color : 'var(--paper-border)'}
                strokeWidth={1.5}
                className="cursor-pointer transition-colors"
                onClick={() => toggleZone(zone.key)}
              />
            );
          })}

          {/* Zone labels for active zones */}
          {BODY_ZONES.map((zone) => {
            const active = activeZones.has(zone.key);
            if (!active) return null;
            return (
              <text key={`label-${zone.key}`} x={zone.cx} y={zone.cy + 1}
                textAnchor="middle" dominantBaseline="central"
                className="text-xs" style={{ fill: EXERCISE_META.emotion_awareness.color }}
                fontSize={9}>
                {zone.label}
              </text>
            );
          })}
        </svg>
      </div>

      <p className="text-xs text-center" style={{ color: 'var(--paper-text-secondary)' }}>
        点击身体部位，觉察并标注你感受到情绪的部位 · 已觉察 {activeZones.size}/{BODY_ZONES.length}
      </p>

      {/* Reflection textarea */}
      <div>
        <p className="text-xs font-medium mb-1.5" style={{ color: 'var(--paper-text)' }}>
          记录感受
        </p>
        <textarea
          className={textareaClass}
          rows={3}
          value={reflection}
          onChange={(e) => {
            if (!started) { setStarted(true); startRef.current = Date.now(); }
            setReflection(e.target.value);
          }}
          placeholder="描述你在这些部位感受到什么...（紧张、温暖、沉重、空旷等）"
          disabled={completed}
        />
      </div>

      {/* Complete button */}
      <div className="flex justify-center">
        {!completed ? (
          <button onClick={handleComplete} disabled={!allZonesActive && !reflection.trim()}
            className="px-5 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: EXERCISE_META.emotion_awareness.color, color: '#fff' }}>
            完成练习
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
