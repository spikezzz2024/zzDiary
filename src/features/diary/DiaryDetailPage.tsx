import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useDiaryHistoryStore } from './diaryHistory.store';
import { EMOTION_COLORS, DEFAULT_EMOTION_META } from '../../lib/constants/emotions';

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function DiaryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    currentEntry,
    loadingDetail,
    error,
    fetchDetail,
    deleteEntry,
    clearDetail,
    analyzeEntry,
    analyzingEntryId,
    entryAnalysis,
    clearAnalysis,
  } = useDiaryHistoryStore();

  useEffect(() => {
    if (id) {
      fetchDetail(Number(id));
    }
    return () => {
      clearDetail();
      clearAnalysis();
    };
  }, [id]);

  const handleDelete = async () => {
    if (!currentEntry || !window.confirm('确定删除这篇日记吗？')) return;
    await deleteEntry(currentEntry.id);
    navigate('/history');
  };

  const handleAnalyze = () => {
    if (!currentEntry) return;
    clearAnalysis();
    analyzeEntry(currentEntry.id);
  };

  const isAnalyzing = analyzingEntryId === (currentEntry?.id ?? null);

  // Loading
  if (loadingDetail) {
    return (
      <div className="flex flex-col gap-4 animate-pulse">
        <div className="h-4 w-16 rounded" style={{ backgroundColor: 'var(--paper-border)' }} />
        <div className="rounded-xl border p-6" style={{ backgroundColor: 'var(--paper-bg)', borderColor: 'var(--paper-border)' }}>
          <div className="h-4 w-40 rounded mb-4" style={{ backgroundColor: 'var(--paper-border)' }} />
          <div className="h-4 w-full rounded mb-2" style={{ backgroundColor: 'var(--paper-border)' }} />
          <div className="h-4 w-full rounded mb-2" style={{ backgroundColor: 'var(--paper-border)' }} />
          <div className="h-4 w-3/4 rounded" style={{ backgroundColor: 'var(--paper-border)' }} />
        </div>
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <p className="text-sm" style={{ color: '#991b1b' }}>{error}</p>
        <button
          onClick={() => navigate('/history')}
          className="text-sm transition-colors cursor-pointer"
          style={{ color: 'var(--paper-accent)' }}
        >
          ← 返回日记本
        </button>
      </div>
    );
  }

  // Not Found
  if (!currentEntry) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <p className="text-sm" style={{ color: 'var(--paper-text-secondary)' }}>日记不存在或已删除</p>
        <button
          onClick={() => navigate('/history')}
          className="text-sm transition-colors cursor-pointer"
          style={{ color: 'var(--paper-accent)' }}
        >
          ← 返回日记本
        </button>
      </div>
    );
  }

  const intensityPercent = (entryAnalysis?.intensity ?? 5) * 10;

  return (
    <div className="flex flex-col gap-5">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/history')}
          className="text-sm transition-colors cursor-pointer"
          style={{ color: 'var(--paper-accent)' }}
        >
          ← 返回日记本
        </button>
        <button
          onClick={handleDelete}
          className="text-sm transition-colors cursor-pointer"
          style={{ color: '#ef4444' }}
        >
          删除这篇
        </button>
      </div>

      {/* Entry Content */}
      <div
        className="rounded-xl border p-6"
        style={{
          backgroundColor: 'var(--paper-bg)',
          borderColor: 'var(--paper-border)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}
      >
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"
              style={{ color: 'var(--paper-text-secondary)' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M12 6v6h4.5m6 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm" style={{ color: 'var(--paper-text-secondary)' }}>
              {formatDate(currentEntry.createdAt)}
            </span>
          </div>

          <div className="prose prose-sm max-w-none">
            {currentEntry.content.split('\n').map((line, i) => (
              <p
                key={i}
                className="leading-relaxed whitespace-pre-wrap text-base"
                style={{
                  color: 'var(--paper-text)',
                  fontFamily: "'KaiTi', 'STKaiti', 'Noto Serif SC', serif",
                }}
              >
                {line}
              </p>
            ))}
          </div>
        </div>
      </div>

      {/* Analyze trigger */}
      {!entryAnalysis && (
        <div className="flex justify-center">
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              backgroundColor: 'var(--paper-accent)',
              color: '#fff',
            }}
          >
            {isAnalyzing ? (
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
      )}

      {/* Analysis Result */}
      {entryAnalysis && (
        <div
          className="rounded-xl border overflow-hidden"
          style={{
            backgroundColor: 'var(--sidebar-bg)',
            borderColor: 'var(--paper-border)',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b"
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
              onClick={clearAnalysis}
              className="p-1 rounded-md transition-colors cursor-pointer hover:opacity-70"
              style={{ color: 'var(--paper-text-secondary)' }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="px-5 py-4 space-y-5">
            {/* Emotion tags */}
            <section>
              <p className="text-xs mb-2.5 tracking-wide" style={{ color: 'var(--paper-text-secondary)' }}>
                感受到的情绪
              </p>
              <div className="flex flex-wrap gap-1.5">
                {entryAnalysis.emotionTags?.map((tag) => {
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
                          meta.bg === 'bg-orange-100' ? '#ffedd5' : '#f3f4f6',
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
                          meta.color === 'text-orange-700' ? '#9a3412' : '#4b5563',
                        borderColor: 'transparent',
                      }}
                    >
                      {meta.label}
                    </span>
                  );
                })}
                {(!entryAnalysis.emotionTags || entryAnalysis.emotionTags.length === 0) && (
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
                        (entryAnalysis.intensity ?? 5) >= 7 ? '#ef4444' :
                        (entryAnalysis.intensity ?? 5) >= 4 ? '#f59e0b' : '#22c55e',
                    }}
                  />
                </div>
                <span className="text-xs font-medium tabular-nums" style={{ color: 'var(--paper-text)' }}>
                  {entryAnalysis.intensity ?? 5}/10
                </span>
              </div>
            </section>

            {/* Root cause */}
            {entryAnalysis.possibleRootCause && (
              <section>
                <p className="text-xs mb-2 tracking-wide" style={{ color: 'var(--paper-text-secondary)' }}>
                  可能的缘由
                </p>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--paper-text)' }}>
                  {entryAnalysis.possibleRootCause}
                </p>
              </section>
            )}

            {/* Cognitive biases */}
            {entryAnalysis.cognitiveBiases && entryAnalysis.cognitiveBiases.length > 0 && (
              <section>
                <p className="text-xs mb-2 tracking-wide" style={{ color: 'var(--paper-text-secondary)' }}>
                  思维习惯
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {entryAnalysis.cognitiveBiases.map((bias) => (
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
            {entryAnalysis.familyConnection && (
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
            {entryAnalysis.mindfulnessSuggestion && (
              <section
                className="rounded-lg px-4 py-3 border"
                style={{
                  backgroundColor: '#ecfdf5',
                  borderColor: '#a7f3d0',
                  color: '#065f46',
                }}
              >
                <p className="text-xs font-medium mb-1">此刻可以做</p>
                <p className="text-xs leading-relaxed opacity-80">
                  {entryAnalysis.mindfulnessSuggestion}
                </p>
              </section>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
