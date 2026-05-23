import { useEffect, useRef } from 'react';
import { useDiaryStore } from './diary.store';
import { useEmotionStore } from '../emotion/emotion.store';
import { usePaperStore } from './paper.store';
import PaperEditor from './PaperEditor';
import AnalysisSidebar from './AnalysisSidebar';
import PaperStylePicker from './PaperStylePicker';

export default function DiaryPage() {
  const { content, draftLoaded, currentResult, saving, analyzing, error,
    loadTodayDraft, saveDraft, clearResult } = useDiaryStore();
  const addToHistory = useEmotionStore((s) => s.addToHistory);
  const color = usePaperStore((s) => s.color);

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const contentRef = useRef(content);
  contentRef.current = content;

  // Load today's draft on mount
  useEffect(() => {
    loadTodayDraft();
  }, []);

  // Debounced auto-save: 2s after user stops typing
  useEffect(() => {
    if (!draftLoaded || !content.trim()) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveDraft();
    }, 2000);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [content, draftLoaded]);

  // Save on tab/window close
  useEffect(() => {
    function handleBeforeUnload() {
      const current = contentRef.current;
      if (!current.trim()) return;
      // Use sendBeacon for reliable fire-and-forget save
      const blob = new Blob(
        [JSON.stringify({ content: current })],
        { type: 'application/json' },
      );
      navigator.sendBeacon('/api/diary/save', blob);
    }
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // Track analysis results in emotion store
  useEffect(() => {
    if (currentResult) {
      addToHistory(currentResult);
    }
  }, [currentResult, addToHistory]);

  return (
    <div data-paper-color={color} className="flex flex-col h-[calc(100vh-97px)] gap-3">
      {/* Top toolbar */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"
            style={{ color: 'var(--paper-text-secondary)' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
          </svg>
          <h2 className="text-sm font-medium" style={{ color: 'var(--paper-text-secondary)' }}>
            今日日记
          </h2>
          {saving && (
            <span className="text-xs" style={{ color: 'var(--paper-text-secondary)' }}>
              保存中...
            </span>
          )}
        </div>
        <PaperStylePicker />
      </div>

      {/* Main area: editor + optional sidebar */}
      <div className="flex-1 min-h-0 flex gap-0 rounded-xl overflow-hidden border"
        style={{ borderColor: 'var(--paper-border)' }}>
        {/* Editor pane */}
        <div
          className={`flex-1 min-w-0 p-4 transition-all duration-300 ${currentResult && !analyzing ? 'rounded-l-xl' : 'rounded-xl'}`}
        >
          <PaperEditor />
        </div>

        {/* Analysis sidebar */}
        {analyzing && (
          <div
            className="w-80 shrink-0 sidebar-panel border-l flex flex-col"
            style={{ borderColor: 'var(--paper-border)' }}
          >
            <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--paper-border)' }}>
              <div className="h-4 w-20 rounded animate-pulse" style={{ backgroundColor: 'var(--paper-border)' }} />
            </div>
            <div className="flex-1 px-5 py-4 space-y-4">
              <div className="h-3 w-16 rounded animate-pulse" style={{ backgroundColor: 'var(--paper-border)' }} />
              <div className="flex gap-1.5">
                <div className="h-5 w-12 rounded-full animate-pulse" style={{ backgroundColor: 'var(--paper-border)' }} />
                <div className="h-5 w-12 rounded-full animate-pulse" style={{ backgroundColor: 'var(--paper-border)' }} />
              </div>
              <div className="h-3 w-16 rounded animate-pulse mt-4" style={{ backgroundColor: 'var(--paper-border)' }} />
              <div className="h-1.5 w-full rounded-full animate-pulse" style={{ backgroundColor: 'var(--paper-border)' }} />
              <div className="h-3 w-16 rounded animate-pulse mt-4" style={{ backgroundColor: 'var(--paper-border)' }} />
              <div className="h-4 w-full rounded animate-pulse" style={{ backgroundColor: 'var(--paper-border)' }} />
              <div className="h-4 w-3/4 rounded animate-pulse" style={{ backgroundColor: 'var(--paper-border)' }} />
            </div>
          </div>
        )}

        {currentResult && !analyzing && (
          <div className="w-80 shrink-0">
            <AnalysisSidebar result={currentResult} onDismiss={clearResult} />
          </div>
        )}
      </div>

      {/* Error toast */}
      {error && (
        <div
          className="shrink-0 rounded-lg border px-4 py-3 flex items-center justify-between"
          style={{
            backgroundColor: '#fef2f2',
            borderColor: '#fecaca',
            color: '#991b1b',
          }}
        >
          <p className="text-sm">{error}</p>
          <button
            onClick={() => useDiaryStore.setState({ error: null })}
            className="text-xs underline cursor-pointer ml-3 shrink-0"
          >
            关闭
          </button>
        </div>
      )}
    </div>
  );
}
