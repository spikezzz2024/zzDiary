import { Link } from 'react-router';
import type { AnalyzeResponse } from '../../types/shared';
import { EMOTION_COLORS, DEFAULT_EMOTION_META } from '../../lib/constants/emotions';

interface Props {
  result: AnalyzeResponse;
  onDismiss: () => void;
}

export default function AnalysisSidebar({ result, onDismiss }: Props) {
  const intensityPercent = (result.intensity ?? 5) * 10;

  return (
    <aside
      className="sidebar-panel flex flex-col h-full rounded-r-lg border-t border-r border-b overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b shrink-0"
        style={{ borderColor: 'var(--paper-border)' }}>
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"
            style={{ color: 'var(--paper-accent)' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <h3 className="text-sm font-semibold" style={{ color: 'var(--paper-text)' }}>
            随笔分析
          </h3>
        </div>
        <button
          onClick={onDismiss}
          className="p-1 rounded-md transition-colors cursor-pointer hover:opacity-70"
          style={{ color: 'var(--paper-text-secondary)' }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
        {/* Emotion tags */}
        <section>
          <p className="text-xs mb-2.5 tracking-wide" style={{ color: 'var(--paper-text-secondary)' }}>
            感受到的情绪
          </p>
          <div className="flex flex-wrap gap-1.5">
            {result.emotionTags?.map((tag) => {
              const meta = EMOTION_COLORS[tag] ?? DEFAULT_EMOTION_META;
              return (
                <span
                  key={tag}
                  className="inline-flex rounded-full px-3 py-1 text-xs font-medium border"
                  style={{
                    backgroundColor: meta.bg === 'bg-amber-100' ? '#fef3c7' :
                      meta.bg === 'bg-red-100' ? '#fee2e2' :
                      meta.bg === 'bg-blue-100' ? '#dbeafe' :
                      meta.bg === 'bg-green-100' ? '#dcfce7' :
                      meta.bg === 'bg-purple-100' ? '#f3e8ff' :
                      meta.bg === 'bg-pink-100' ? '#fce7f3' :
                      meta.bg === 'bg-teal-100' ? '#ccfbf1' :
                      meta.bg === 'bg-rose-100' ? '#ffe4e6' :
                      meta.bg === 'bg-slate-100' ? '#f1f5f9' :
                      meta.bg === 'bg-emerald-100' ? '#d1fae5' :
                      meta.bg === 'bg-orange-100' ? '#ffedd5' :
                      '#f3f4f6',
                    color: meta.color === 'text-amber-700' ? '#92400e' :
                      meta.color === 'text-red-700' ? '#991b1b' :
                      meta.color === 'text-blue-700' ? '#1e40af' :
                      meta.color === 'text-green-700' ? '#166534' :
                      meta.color === 'text-purple-700' ? '#6b21a8' :
                      meta.color === 'text-pink-700' ? '#9d174d' :
                      meta.color === 'text-teal-700' ? '#115e59' :
                      meta.color === 'text-rose-700' ? '#9f1239' :
                      meta.color === 'text-slate-700' ? '#334155' :
                      meta.color === 'text-emerald-700' ? '#065f46' :
                      meta.color === 'text-orange-700' ? '#9a3412' :
                      '#4b5563',
                    borderColor: 'transparent',
                  }}
                >
                  {meta.label}
                </span>
              );
            })}
            {(!result.emotionTags || result.emotionTags.length === 0) && (
              <span className="text-xs" style={{ color: 'var(--paper-text-secondary)' }}>
                未检测到明显情绪
              </span>
            )}
          </div>
        </section>

        {/* Intensity */}
        <section>
          <p className="text-xs mb-2.5 tracking-wide" style={{ color: 'var(--paper-text-secondary)' }}>
            情绪强度
          </p>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--paper-border)' }}>
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${intensityPercent}%`,
                  backgroundColor:
                    (result.intensity ?? 5) >= 7 ? '#ef4444' :
                    (result.intensity ?? 5) >= 4 ? '#f59e0b' : '#22c55e',
                }}
              />
            </div>
            <span className="text-xs font-medium tabular-nums" style={{ color: 'var(--paper-text)' }}>
              {result.intensity ?? 5}/10
            </span>
          </div>
        </section>

        {/* Root cause — presented gently */}
        {result.possibleRootCause && (
          <section>
            <p className="text-xs mb-2 tracking-wide" style={{ color: 'var(--paper-text-secondary)' }}>
              可能的缘由
            </p>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--paper-text)' }}>
              {result.possibleRootCause}
            </p>
          </section>
        )}

        {/* Cognitive biases — softened */}
        {result.cognitiveBiases && result.cognitiveBiases.length > 0 && (
          <section>
            <p className="text-xs mb-2 tracking-wide" style={{ color: 'var(--paper-text-secondary)' }}>
              思维习惯
            </p>
            <div className="flex flex-wrap gap-1.5">
              {result.cognitiveBiases.map((bias) => (
                <span
                  key={bias}
                  className="inline-flex rounded-md px-2.5 py-1 text-xs border"
                  style={{
                    backgroundColor: '#fffbeb',
                    color: '#92400e',
                    borderColor: '#fde68a',
                  }}
                >
                  {bias}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Family connection */}
        {result.familyConnection && (
          <section
            className="rounded-lg px-4 py-3 border"
            style={{
              backgroundColor: '#eef2ff',
              borderColor: '#c7d2fe',
              color: '#4338ca',
            }}
          >
            <p className="text-xs font-medium mb-1">与过往经历有关</p>
            <p className="text-xs leading-relaxed opacity-80">
              你当前的情绪或许与过去的家庭经历有所关联。
            </p>
          </section>
        )}

        {/* Mindfulness suggestion */}
        {result.mindfulnessSuggestion && (
          <Link
            to="/mindfulness"
            className="block rounded-lg px-4 py-3 border cursor-pointer no-underline transition-shadow hover:shadow-sm"
            style={{
              backgroundColor: '#ecfdf5',
              borderColor: '#a7f3d0',
              color: '#065f46',
            }}
          >
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-medium">此刻可以做</p>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
            <p className="text-xs leading-relaxed opacity-80">
              {result.mindfulnessSuggestion}
            </p>
          </Link>
        )}
      </div>
    </aside>
  );
}
