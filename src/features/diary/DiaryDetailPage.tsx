import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useDiaryHistoryStore } from './diaryHistory.store';
import Badge from '../../components/ui/Badge';
import Card from '../../components/ui/Card';
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
  const { currentEntry, loadingDetail, error, fetchDetail, deleteEntry, clearDetail } =
    useDiaryHistoryStore();

  useEffect(() => {
    if (id) {
      fetchDetail(Number(id));
    }
    return () => clearDetail();
  }, [id]);

  const handleDelete = async () => {
    if (!currentEntry || !window.confirm('确定删除这篇日记吗？')) return;
    await deleteEntry(currentEntry.id);
    navigate('/history');
  };

  // Loading
  if (loadingDetail) {
    return (
      <div className="flex flex-col gap-4 animate-pulse">
        <div className="h-4 w-16 bg-gray-200 rounded" />
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="h-4 w-40 bg-gray-200 rounded mb-4" />
          <div className="h-4 w-full bg-gray-200 rounded mb-2" />
          <div className="h-4 w-full bg-gray-200 rounded mb-2" />
          <div className="h-4 w-3/4 bg-gray-200 rounded mb-4" />
          <div className="flex gap-2">
            <div className="h-5 w-12 bg-gray-200 rounded-full" />
            <div className="h-5 w-12 bg-gray-200 rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <p className="text-sm text-red-600">{error}</p>
        <button
          onClick={() => navigate('/history')}
          className="text-sm text-indigo-600 hover:text-indigo-700 cursor-pointer"
        >
          ← 返回历史列表
        </button>
      </div>
    );
  }

  // Not Found
  if (!currentEntry) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4 text-gray-400">
        <p className="text-sm">日记不存在或已删除</p>
        <button
          onClick={() => navigate('/history')}
          className="text-sm text-indigo-600 hover:text-indigo-700 cursor-pointer"
        >
          ← 返回历史列表
        </button>
      </div>
    );
  }

  const intensityPercent = (currentEntry.emotionIntensity ?? 5) * 10;

  return (
    <div className="flex flex-col gap-4">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/history')}
          className="text-sm text-indigo-600 hover:text-indigo-700 cursor-pointer"
        >
          ← 返回历史列表
        </button>
        <button
          onClick={handleDelete}
          className="text-sm text-red-500 hover:text-red-600 cursor-pointer"
        >
          删除这篇
        </button>
      </div>

      {/* Entry Content */}
      <Card>
        <div className="space-y-4">
          {/* Meta */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-gray-400">{formatDate(currentEntry.createdAt)}</span>
            <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-500">
              {currentEntry.mode === 'guided' ? 'AI 引导' : '自由书写'}
            </span>
          </div>

          {/* Full Content */}
          <div className="prose prose-sm max-w-none">
            {currentEntry.content.split('\n').map((line, i) => (
              <p key={i} className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {line}
              </p>
            ))}
          </div>
        </div>
      </Card>

      {/* Emotion Analysis */}
      <Card className="space-y-4">
        <h3 className="text-base font-semibold text-gray-800">情绪分析</h3>

        {/* Emotion Tags */}
        {currentEntry.emotionTags && currentEntry.emotionTags.length > 0 && (
          <div>
            <p className="text-xs font-medium text-gray-500 mb-2">情绪标签</p>
            <div className="flex flex-wrap gap-2">
              {currentEntry.emotionTags.map((tag) => {
                const meta = EMOTION_COLORS[tag] ?? DEFAULT_EMOTION_META;
                return <Badge key={tag} label={meta.label} color={meta.color} bg={meta.bg} />;
              })}
            </div>
          </div>
        )}

        {/* Intensity */}
        {currentEntry.emotionIntensity != null && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-medium text-gray-500">情绪强度</p>
              <span className="text-sm font-semibold text-gray-700">
                {currentEntry.emotionIntensity} / 10
              </span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${intensityPercent}%`,
                  backgroundColor:
                    currentEntry.emotionIntensity >= 7
                      ? '#ef4444'
                      : currentEntry.emotionIntensity >= 4
                        ? '#f59e0b'
                        : '#22c55e',
                }}
              />
            </div>
          </div>
        )}

        {/* No analysis */}
        {(!currentEntry.emotionTags || currentEntry.emotionTags.length === 0) &&
          currentEntry.emotionIntensity == null && (
            <p className="text-sm text-gray-400">暂无情绪分析数据</p>
          )}
      </Card>
    </div>
  );
}
