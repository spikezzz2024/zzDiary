import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useDiaryHistoryStore } from './diaryHistory.store';
import { useSearchStore } from './search.store';
import Calendar from './Calendar';
import SearchBar from './SearchBar';

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
}

function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  });
}

function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen) + '...';
}

export default function DiaryHistoryPage() {
  const navigate = useNavigate();
  const {
    entries,
    loading,
    error,
    datesWithEntries,
    selectedDate,
    fetchByDate,
    fetchDates,
    deleteEntry,
    setSelectedDate,
  } = useDiaryHistoryStore();
  const searchQuery = useSearchStore((s) => s.query);

  useEffect(() => {
    fetchDates();
    const today = todayStr();
    setSelectedDate(today);
    fetchByDate(today);
  }, []);

  const handleSelectDate = (date: string) => {
    setSelectedDate(date);
    fetchByDate(date);
  };

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (!window.confirm('确定删除这篇日记吗？')) return;
    await deleteEntry(id);
    if (selectedDate) {
      fetchByDate(selectedDate);
      fetchDates();
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h2
          className="text-lg font-medium"
          style={{ color: 'var(--paper-text)', fontFamily: "'KaiTi', 'STKaiti', 'Noto Serif SC', serif" }}
        >
          日记本
        </h2>
        <button
          onClick={() => navigate('/')}
          className="text-sm transition-colors cursor-pointer"
          style={{ color: 'var(--paper-accent)' }}
        >
          ← 返回书写
        </button>
      </div>

      {/* Search bar */}
      <SearchBar />

      {/* When searching, hide calendar and entries — SearchBar shows its own results */}
      {searchQuery.trim() ? null : (
        <>
          {/* Calendar */}
          <Calendar
            selectedDate={selectedDate}
            datesWithEntries={datesWithEntries}
            onSelectDate={handleSelectDate}
          />

          {/* Selected date header */}
          {selectedDate && (
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"
            style={{ color: 'var(--paper-text-secondary)' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-sm" style={{ color: 'var(--paper-text-secondary)' }}>
            {formatDateLabel(selectedDate)}
          </span>
          {!loading && (
            <span className="text-xs" style={{ color: 'var(--paper-text-secondary)' }}>
              · {entries.length} 篇日记
            </span>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-lg border px-4 py-3" style={{
          backgroundColor: '#fef2f2', borderColor: '#fecaca', color: '#991b1b',
        }}>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex flex-col gap-3">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="rounded-xl border p-4 animate-pulse"
              style={{ backgroundColor: 'var(--paper-bg)', borderColor: 'var(--paper-border)' }}
            >
              <div className="h-3 w-16 rounded mb-3" style={{ backgroundColor: 'var(--paper-border)' }} />
              <div className="h-4 w-full rounded mb-2" style={{ backgroundColor: 'var(--paper-border)' }} />
              <div className="h-4 w-2/3 rounded" style={{ backgroundColor: 'var(--paper-border)' }} />
            </div>
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && entries.length === 0 && selectedDate && (
        <div className="flex flex-col items-center justify-center py-12 gap-2">
          <svg className="w-10 h-10 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"
            style={{ color: 'var(--paper-border)' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
              d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
          <p className="text-sm" style={{ color: 'var(--paper-text-secondary)' }}>
            这一天没有日记
          </p>
          <button
            onClick={() => navigate('/')}
            className="text-sm mt-1 transition-colors cursor-pointer"
            style={{ color: 'var(--paper-accent)' }}
          >
            去写一篇 →
          </button>
        </div>
      )}

      {/* Entry cards */}
      {!loading && entries.length > 0 && (
        <div className="flex flex-col gap-3">
          {entries.map((entry) => (
            <div
              key={entry.id}
              onClick={() => navigate(`/diary/${entry.id}`)}
              className="rounded-xl border p-4 transition-all cursor-pointer group"
              style={{
                backgroundColor: 'var(--paper-bg)',
                borderColor: 'var(--paper-border)',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--paper-accent)';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--paper-border)';
                (e.currentTarget as HTMLElement).style.boxShadow = '';
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                      style={{ color: 'var(--paper-text-secondary)' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M12 6v6h4.5m6 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-xs" style={{ color: 'var(--paper-text-secondary)' }}>
                      {formatTime(entry.createdAt)}
                    </span>
                  </div>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: 'var(--paper-text)', fontFamily: "'KaiTi', 'STKaiti', 'Noto Serif SC', serif" }}
                  >
                    {truncate(entry.content, 150)}
                  </p>
                </div>

                <button
                  onClick={(e) => handleDelete(e, entry.id)}
                  className="ml-3 p-1.5 rounded-lg transition-all cursor-pointer shrink-0 opacity-0 group-hover:opacity-100"
                  style={{ color: 'var(--paper-text-secondary)' }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.backgroundColor = '#fef2f2';
                    (e.currentTarget as HTMLElement).style.color = '#ef4444';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.backgroundColor = '';
                    (e.currentTarget as HTMLElement).style.color = 'var(--paper-text-secondary)';
                  }}
                  title="删除"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
        </>
      )}
    </div>
  );
}
