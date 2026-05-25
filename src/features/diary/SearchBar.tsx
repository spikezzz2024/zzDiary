import { useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { useSearchStore } from './search.store';

export default function SearchBar() {
  const navigate = useNavigate();
  const {
    query, results, loading, error,
    modelName, modelSizeMB, ollamaAvailable, modelPulled, modelChecked,
    pulling, pullError, indexedCount,
    setQuery, search, clear, checkModelStatus, pullModel,
  } = useSearchStore();
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);
  const isFirstSearch = useRef(true);

  useEffect(() => {
    checkModelStatus();
  }, []);

  const debouncedSearch = useCallback((q: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!q.trim()) {
      clear();
      return;
    }
    const delay = isFirstSearch.current ? 0 : 300;
    isFirstSearch.current = false;
    debounceRef.current = setTimeout(() => search(q), delay);
  }, [search, clear]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    debouncedSearch(val);
  };

  const handleClear = () => {
    clear();
    isFirstSearch.current = true;
  };

  // ---- Model not pulled prompt ----
  if (modelChecked && ollamaAvailable && !modelPulled && !pulling) {
    return (
      <div
        className="rounded-xl border p-5 flex flex-col items-center gap-3"
        style={{
          backgroundColor: 'var(--app-surface-alt)',
          borderColor: 'var(--paper-border)',
        }}
      >
        <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"
          style={{ color: 'var(--paper-text-secondary)' }}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
        </svg>
        <div className="text-center">
          <p className="text-sm font-medium mb-1" style={{ color: 'var(--paper-text)' }}>
            启用语义搜索
          </p>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--paper-text-secondary)' }}>
            下载 AI 嵌入模型后，可以用日常语言搜索日记——比如搜"和妈妈吵架那次"
            就能找到相关日记，而不只是匹配关键词。
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--paper-text-secondary)' }}>
          <span>模型: {modelName}</span>
          <span>·</span>
          <span>约 {modelSizeMB} MB</span>
          <span>·</span>
          <span>仅需下载一次</span>
        </div>
        <button
          onClick={pullModel}
          className="px-4 py-1.5 text-sm rounded-lg cursor-pointer transition-colors"
          style={{ backgroundColor: 'var(--paper-accent)', color: '#fff' }}
        >
          下载模型
        </button>
      </div>
    );
  }

  // ---- Pulling (downloading) ----
  if (pulling) {
    return (
      <div className="flex flex-col items-center gap-3 py-6">
        <svg className="w-8 h-8 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"
            style={{ color: 'var(--paper-text-secondary)' }} />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            style={{ color: 'var(--paper-accent)' }} />
        </svg>
        <p className="text-sm" style={{ color: 'var(--paper-text-secondary)' }}>
          正在下载 {modelName}（约 {modelSizeMB} MB），请稍候...
        </p>
        {pullError && (
          <p className="text-xs" style={{ color: '#dc2626' }}>{pullError}</p>
        )}
      </div>
    );
  }

  // ---- Ollama not running ----
  if (modelChecked && !ollamaAvailable) {
    return (
      <div
        className="rounded-lg border px-3 py-2.5 text-xs"
        style={{
          backgroundColor: '#fef2f2', borderColor: '#fecaca', color: '#991b1b',
        }}
      >
        语义搜索需要本地运行 Ollama。请启动 Ollama 后刷新页面。
      </div>
    );
  }

  // ---- Checking status ----
  if (!modelChecked) {
    return (
      <div className="h-10 rounded-lg animate-pulse" style={{ backgroundColor: 'var(--paper-border)' }} />
    );
  }

  // ---- Normal search bar ----
  return (
    <div className="flex flex-col gap-3">
      {/* Search input */}
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
          style={{ color: 'var(--paper-text-secondary)' }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={handleInput}
          placeholder={`搜索日记内容...` + (indexedCount > 0 ? `（已索引 ${indexedCount} 篇）` : '')}
          className="w-full pl-9 pr-8 py-2 text-sm rounded-lg border outline-none transition-colors"
          style={{
            backgroundColor: 'var(--paper-bg)',
            borderColor: 'var(--paper-border)',
            color: 'var(--paper-text)',
            fontFamily: "'KaiTi', 'STKaiti', 'Noto Serif SC', serif",
          }}
          onFocus={(e) => {
            (e.target as HTMLElement).style.borderColor = 'var(--paper-accent)';
          }}
          onBlur={(e) => {
            (e.target as HTMLElement).style.borderColor = 'var(--paper-border)';
          }}
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded cursor-pointer"
            style={{ color: 'var(--paper-text-secondary)' }}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--paper-text-secondary)' }}>
          <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          搜索中...
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-lg border px-3 py-2 text-xs" style={{
          backgroundColor: '#fef2f2', borderColor: '#fecaca', color: '#991b1b',
        }}>
          {error}
        </div>
      )}

      {/* Results */}
      {!loading && query.trim() && results.length > 0 && (
        <>
          <p className="text-xs" style={{ color: 'var(--paper-text-secondary)' }}>
            找到 {results.length} 篇相关日记
          </p>
          <div className="flex flex-col gap-2">
            {results.map((r) => (
              <div
                key={r.id}
                onClick={() => navigate(`/diary/${r.id}`)}
                className="rounded-lg border px-3 py-2.5 cursor-pointer transition-colors"
                style={{ backgroundColor: 'var(--paper-bg)', borderColor: 'var(--paper-border)' }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--paper-accent)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--paper-border)';
                }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs" style={{ color: 'var(--paper-text-secondary)' }}>
                    {r.createdAt.split('T')[0]}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded" style={{
                    backgroundColor: 'var(--paper-accent)',
                    color: '#fff',
                    opacity: 0.8,
                  }}>
                    {Math.round(r.score * 100)}%
                  </span>
                </div>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: 'var(--paper-text)', fontFamily: "'KaiTi', 'STKaiti', 'Noto Serif SC', serif" }}
                >
                  {r.snippet}
                </p>
              </div>
            ))}
          </div>
        </>
      )}

      {/* No results */}
      {!loading && query.trim() && results.length === 0 && !error && (
        <div className="flex flex-col items-center py-6 gap-1">
          <p className="text-sm" style={{ color: 'var(--paper-text-secondary)' }}>未找到相关日记</p>
          <p className="text-xs" style={{ color: 'var(--paper-text-secondary)' }}>换个关键词试试</p>
        </div>
      )}
    </div>
  );
}
