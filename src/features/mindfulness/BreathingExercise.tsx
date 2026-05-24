import { useState, useRef, useEffect, useCallback } from 'react';
import { EXERCISE_META } from './types';

type BreathingMode = '4-7-8' | 'box';
type Phase = 'inhale' | 'hold' | 'exhale' | 'hold2';

interface ModeConfig {
  label: string;
  phases: { name: Phase; duration: number; label: string }[];
}

const MODES: Record<BreathingMode, ModeConfig> = {
  '4-7-8': {
    label: '4-7-8 呼吸',
    phases: [
      { name: 'inhale', duration: 4, label: '吸气' },
      { name: 'hold', duration: 7, label: '屏息' },
      { name: 'exhale', duration: 8, label: '呼气' },
    ],
  },
  box: {
    label: '盒式呼吸',
    phases: [
      { name: 'inhale', duration: 4, label: '吸气' },
      { name: 'hold', duration: 4, label: '屏息' },
      { name: 'exhale', duration: 4, label: '呼气' },
      { name: 'hold2', duration: 4, label: '屏息' },
    ],
  },
};

interface Props {
  exerciseId: number;
  recommendationText: string;
  onComplete: (durationSeconds: number) => void;
}

export default function BreathingExercise({ exerciseId, recommendationText, onComplete }: Props) {
  const [mode, setMode] = useState<BreathingMode>('4-7-8');
  const [running, setRunning] = useState(false);
  const [paused, setPaused] = useState(false);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [phaseSecond, setPhaseSecond] = useState(0);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [rounds, setRounds] = useState(0);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const config = MODES[mode];
  const currentPhase = config.phases[phaseIdx];

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const tick = useCallback(() => {
    setPhaseSecond((s) => {
      const next = s + 1;
      if (next >= currentPhase.duration) {
        setPhaseIdx((p) => {
          const nextPhaseIdx = p + 1;
          if (nextPhaseIdx >= config.phases.length) {
            setRounds((r) => r + 1);
            return 0;
          }
          return nextPhaseIdx;
        });
        return 0;
      }
      return next;
    });
    setTotalSeconds((t) => t + 1);
  }, [currentPhase.duration, config.phases.length]);

  useEffect(() => {
    if (running && !paused) {
      timerRef.current = setInterval(tick, 1000);
      return () => stopTimer();
    }
    stopTimer();
  }, [running, paused, tick, stopTimer]);

  const handleStart = () => {
    setRunning(true);
    setPaused(false);
  };

  const handleTogglePause = () => {
    setPaused((p) => !p);
  };

  const handleReset = () => {
    stopTimer();
    setRunning(false);
    setPaused(false);
    setPhaseIdx(0);
    setPhaseSecond(0);
    setTotalSeconds(0);
    setRounds(0);
  };

  const handleComplete = () => {
    stopTimer();
    setRunning(false);
    setCompleted(true);
    onComplete(totalSeconds);
  };

  const scaleValue = currentPhase.name === 'inhale' ? 1.2
    : currentPhase.name === 'exhale' ? 0.75
    : currentPhase.name === 'hold' ? 1.2
    : 0.75;

  return (
    <div className="rounded-xl border p-6 space-y-5"
      style={{ backgroundColor: 'var(--paper-bg)', borderColor: 'var(--paper-border)' }}>
      {/* Mode selector */}
      <div className="flex gap-2">
        {(Object.keys(MODES) as BreathingMode[]).map((m) => (
          <button key={m} onClick={() => { if (!running) setMode(m); }} disabled={running}
            className={`px-3 py-1 rounded text-sm cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              mode === m ? '' : 'border'
            }`}
            style={mode === m
              ? { backgroundColor: EXERCISE_META.breathing.color, color: '#fff', borderColor: EXERCISE_META.breathing.color }
              : { borderColor: 'var(--paper-border)', color: 'var(--paper-text)' }}>
            {MODES[m].label}
          </button>
        ))}
      </div>

      {/* Recommendation text */}
      <p className="text-sm leading-relaxed" style={{ color: 'var(--paper-text-secondary)' }}>
        {recommendationText}
      </p>

      {/* Breathing circle */}
      <div className="flex flex-col items-center gap-4">
        <div className="relative flex items-center justify-center"
          style={{ width: 200, height: 200 }}>
          {/* Outer ring */}
          <div
            className="absolute rounded-full transition-transform duration-1000 ease-in-out"
            style={{
              width: 200,
              height: 200,
              transform: `scale(${running && !completed ? scaleValue : 0.85})`,
              backgroundColor: EXERCISE_META.breathing.color + '18',
              border: `3px solid ${EXERCISE_META.breathing.color}40`,
            }}
          />
          {/* Inner circle */}
          <div
            className="absolute rounded-full transition-transform duration-1000 ease-in-out"
            style={{
              width: 120,
              height: 120,
              transform: `scale(${running && !completed ? scaleValue : 0.85})`,
              backgroundColor: EXERCISE_META.breathing.color + '25',
              border: `2px solid ${EXERCISE_META.breathing.color}60`,
            }}
          />
          {/* Phase text */}
          <span
            className="relative z-10 text-lg font-medium select-none"
            style={{ color: EXERCISE_META.breathing.color }}
          >
            {running ? currentPhase.label : completed ? '完成' : '准备'}
          </span>
        </div>

        {/* Phase counter */}
        {running && (
          <p className="text-sm" style={{ color: 'var(--paper-text-secondary)' }}>
            {currentPhase.label} · {currentPhase.duration - phaseSecond}s · 共 {rounds} 轮
          </p>
        )}

        {/* Timer */}
        <p className="text-xs tabular-nums" style={{ color: 'var(--paper-text-secondary)' }}>
          {Math.floor(totalSeconds / 60)}:{(totalSeconds % 60).toString().padStart(2, '0')}
        </p>
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-3">
        {!running && !completed && (
          <button onClick={handleStart}
            className="px-5 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors"
            style={{ backgroundColor: EXERCISE_META.breathing.color, color: '#fff' }}>
            开始
          </button>
        )}
        {running && (
          <>
            <button onClick={handleTogglePause}
              className="px-4 py-2 rounded-lg text-sm font-medium cursor-pointer border transition-colors"
              style={{ borderColor: 'var(--paper-border)', color: 'var(--paper-text)' }}>
              {paused ? '继续' : '暂停'}
            </button>
            <button onClick={handleReset}
              className="px-4 py-2 rounded-lg text-sm cursor-pointer border"
              style={{ borderColor: 'var(--paper-border)', color: 'var(--paper-text-secondary)' }}>
              重置
            </button>
          </>
        )}
        {(running || (!running && totalSeconds > 0)) && !completed && (
          <button onClick={handleComplete}
            className="px-5 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors"
            style={{ backgroundColor: '#5c4a2e', color: '#faf7f2' }}>
            完成练习
          </button>
        )}
        {completed && (
          <p className="text-sm" style={{ color: '#7aaa7a' }}>
            已完成 ✓
          </p>
        )}
      </div>
    </div>
  );
}
