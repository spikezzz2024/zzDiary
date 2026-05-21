import { useEffect } from 'react';
import { useDiaryStore } from './diary.store';
import { useEmotionStore } from '../emotion/emotion.store';
import Editor from './Editor';
import GuidedChat from './GuidedChat';
import EmotionResult from '../emotion/EmotionResult';

export default function DiaryPage() {
  const { mode, setMode, currentResult, clearResult, analyzing } = useDiaryStore();
  const addToHistory = useEmotionStore((s) => s.addToHistory);

  // Sync analysis result to emotion store
  useEffect(() => {
    if (currentResult) {
      addToHistory(currentResult);
    }
  }, [currentResult, addToHistory]);

  return (
    <div className="flex flex-col gap-6">
      {/* Mode Toggle */}
      <div className="flex gap-1 rounded-lg bg-gray-100 p-1 w-fit">
        <button
          onClick={() => setMode('free')}
          className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors cursor-pointer ${
            mode === 'free'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          自由书写
        </button>
        <button
          onClick={() => setMode('guided')}
          className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors cursor-pointer ${
            mode === 'guided'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          AI 引导
        </button>
      </div>

      {/* Writing Area */}
      {mode === 'free' ? <Editor /> : <GuidedChat />}

      {/* Error */}
      {useDiaryStore.getState().error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3">
          <p className="text-sm text-red-600">
            分析失败：{useDiaryStore((s) => s.error)}
          </p>
        </div>
      )}

      {/* Loading Skeleton */}
      {analyzing && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm animate-pulse">
          <div className="h-5 w-32 bg-gray-200 rounded mb-4" />
          <div className="flex gap-2 mb-4">
            <div className="h-5 w-14 bg-gray-200 rounded-full" />
            <div className="h-5 w-14 bg-gray-200 rounded-full" />
          </div>
          <div className="h-2 w-full bg-gray-200 rounded-full mb-4" />
          <div className="h-4 w-3/4 bg-gray-200 rounded mb-2" />
          <div className="h-4 w-1/2 bg-gray-200 rounded" />
        </div>
      )}

      {/* Analysis Result */}
      {currentResult && !analyzing && (
        <EmotionResult
          result={currentResult}
          onDismiss={clearResult}
        />
      )}
    </div>
  );
}
