import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useDiaryHistoryStore } from './diaryHistory.store';
import Badge from '../../components/ui/Badge';

import { EMOTION_COLORS, DEFAULT_EMOTION_META } from '../../lib/constants/emotions';

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
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
    hasMore,
    page,
    error,
    fetchList,
    deleteEntry,
  } = useDiaryHistoryStore();

  useEffect(() => {
    fetchList(0);
  }, []);

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (!window.confirm('确定删除这篇日记吗？')) return;
    await deleteEntry(id);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">历史日记</h2>
        <button
          onClick={() => navigate('/')}
          className="text-sm text-indigo-600 hover:text-indigo-700 cursor-pointer"
        >
          ← 返回书写
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && entries.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <svg className="w-16 h-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
          <p className="text-sm">还没有写过日记</p>
          <button
            onClick={() => navigate('/')}
            className="mt-3 text-sm text-indigo-600 hover:text-indigo-700 cursor-pointer"
          >
            去写第一篇 →
          </button>
        </div>
      )}

      {/* Entry List */}
      <div className="flex flex-col gap-3">
        {entries.map((entry) => {
          const intensityPercent = (entry.emotionIntensity ?? 5) * 10;

          return (
            <div
              key={entry.id}
              onClick={() => navigate(`/diary/${entry.id}`)}
              className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md hover:border-gray-300 transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  {/* Date & Mode */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-gray-400">
                      {formatDate(entry.createdAt)}
                    </span>
                    <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">
                      {entry.mode === 'guided' ? 'AI 引导' : '自由书写'}
                    </span>
                  </div>

                  {/* Content Preview */}
                  <p className="text-sm text-gray-600 leading-relaxed mb-3">
                    {truncate(entry.content, 120)}
                  </p>

                  {/* Emotion Tags & Intensity */}
                  <div className="flex items-center gap-3 flex-wrap">
                    {entry.emotionTags && entry.emotionTags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {entry.emotionTags.map((tag) => {
                          const tagMeta = EMOTION_COLORS[tag] ?? DEFAULT_EMOTION_META;
                          return (
                            <Badge key={tag} label={tagMeta.label} color={tagMeta.color} bg={tagMeta.bg} />
                          );
                        })}
                      </div>
                    )}
                    {entry.emotionIntensity != null && (
                      <div className="flex items-center gap-1.5">
                        <div className="w-12 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${intensityPercent}%`,
                              backgroundColor:
                                entry.emotionIntensity >= 7 ? '#ef4444' :
                                entry.emotionIntensity >= 4 ? '#f59e0b' : '#22c55e',
                            }}
                          />
                        </div>
                        <span className="text-xs text-gray-400">{entry.emotionIntensity}/10</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Delete */}
                <button
                  onClick={(e) => handleDelete(e, entry.id)}
                  className="ml-3 p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer shrink-0"
                  title="删除"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Load More */}
      {hasMore && entries.length > 0 && (
        <button
          onClick={() => fetchList(page + 1)}
          disabled={loading}
          className="w-full py-2.5 text-sm text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? '加载中...' : '加载更多'}
        </button>
      )}

      {/* Loading Skeleton (initial) */}
      {loading && entries.length === 0 && (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl border border-gray-200 bg-white p-5 animate-pulse">
              <div className="h-3 w-24 bg-gray-200 rounded mb-3" />
              <div className="h-4 w-full bg-gray-200 rounded mb-2" />
              <div className="h-4 w-2/3 bg-gray-200 rounded mb-3" />
              <div className="flex gap-2">
                <div className="h-4 w-12 bg-gray-200 rounded-full" />
                <div className="h-4 w-12 bg-gray-200 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
