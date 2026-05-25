import { useDiaryStore } from './diary.store';
import { usePaperStore } from './paper.store';
import type { PaperMaterial } from './paper.store';
import { useTypingSound, SOUND_PROFILE_KEYS } from '../../hooks/useTypingSound';

const PAPER_LABELS: Record<PaperMaterial, string> = {
  grid: '作文纸',
  lined: '横线纸',
  blank: '素白纸',
};

export default function PaperEditor() {
  const { content, analyzing, setContent, analyze } = useDiaryStore();
  const { material, color } = usePaperStore();
  const { play, profile, setProfile, enabled, setEnabled, volume, setVolume } = useTypingSound();

  const handleAnalyze = () => {
    if (content.trim().length === 0) return;
    analyze();
  };

  const handleKeyDown = () => {
    play();
  };

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Paper area */}
      <div
        data-paper-color={color}
        className={`relative flex-1 min-h-0 rounded-lg border overflow-hidden paper-texture ${
          material === 'grid' ? 'paper-grid' :
          material === 'lined' ? 'paper-lined' : 'paper-blank'
        }`}
        style={{
          borderColor: 'var(--paper-border)',
          boxShadow: `0 1px 4px rgba(0,0,0,0.06), inset 0 0 80px rgba(0,0,0,0.02)`,
        }}
      >
        {/* Red margin indicator for grid/lined */}
        {material !== 'blank' && (
          <div
            className="absolute top-0 bottom-0 w-[2px] z-10 opacity-60"
            style={{
              left: '40px',
              backgroundColor: material === 'grid'
                ? 'transparent'
                : 'var(--paper-margin)',
              borderLeft: material === 'grid'
                ? '1px solid var(--paper-margin)'
                : 'none',
            }}
          />
        )}

        <textarea
          className="absolute inset-0 w-full h-full resize-none bg-transparent text-lg leading-8 placeholder-gray-400/60 focus:outline-none"
          style={{
            color: 'var(--paper-text)',
            fontFamily: "'KaiTi', 'STKaiti', 'Noto Serif SC', 'SimSun', serif",
            fontSize: '18px',
            lineHeight: material === 'grid' ? '32px' : '29px',
            padding: material === 'grid' ? '16px 24px 16px 48px' : '20px 24px 20px 48px',
          }}
          placeholder="今天发生了什么？在这里自由地写下来..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={analyzing}
        />
      </div>

      {/* Bottom bar */}
      <div className="flex items-center justify-between text-sm shrink-0">
        <div className="flex items-center gap-2">
          <span
            className="text-xs"
            style={{ color: 'var(--paper-text-secondary)' }}
          >
            {PAPER_LABELS[material]}
          </span>
          <span className="text-xs" style={{ color: '#d0c8b8' }}>|</span>
          {/* Sound toggle */}
          <button
            onClick={() => setEnabled(!enabled)}
            className="text-xs cursor-pointer transition-colors hover:opacity-80"
            style={{ color: 'var(--paper-text-secondary)' }}
            title={enabled ? '关闭音效' : '开启音效'}
          >
            {enabled ? (
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M15.536 8.464a5 5 0 010 7.072M17.95 6.05a8 8 0 010 11.9M6.5 8.8l3.7-3.7c.5-.5 1.7-.2 1.7.6v12.6c0 .8-1.2 1.1-1.7.6l-3.7-3.7H4.3c-.7 0-1.3-.6-1.3-1.3v-4.8c0-.7.6-1.3 1.3-1.3h2.2z" />
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
              </svg>
            )}
          </button>
          {/* Profile selector */}
          <select
            value={profile}
            onChange={(e) => setProfile(e.target.value as typeof profile)}
            className="text-xs bg-transparent border rounded px-1.5 py-0.5 cursor-pointer focus:outline-none"
            style={{ color: 'var(--paper-text-secondary)', borderColor: '#d0c8b8' }}
          >
            {SOUND_PROFILE_KEYS.map(k => (
              <option key={k} value={k}>
                {k === 'mechanical' ? '机械键盘' :
                 k === 'mech1' ? '机械键盘1' :
                 k === 'mech2' ? '机械键盘2' :
                 k === 'old-mech' ? '老式机械' : '笔记本键盘'}
              </option>
            ))}
          </select>
          {/* Volume slider */}
          <input
            type="range"
            min={0}
            max={100}
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="w-16 h-1 cursor-pointer"
            style={{ accentColor: '#8b7355' }}
          />
          <span
            className="text-xs"
            style={{ color: 'var(--paper-text-secondary)' }}
          >
            {content.length} 字
          </span>
        </div>

        <div className="flex items-center gap-2">
          <p
            className="text-xs hidden sm:block"
            style={{ color: 'var(--paper-text-secondary)' }}
          >
            日记仅存储本地 · 分析前脱敏
          </p>
          <button
            onClick={handleAnalyze}
            disabled={content.trim().length === 0 || analyzing}
            className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              backgroundColor: 'var(--paper-accent)',
              color: '#fff',
            }}
          >
            {analyzing ? (
              <>
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                分析中...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                分析情绪
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
