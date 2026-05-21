import { useDiaryStore } from './diary.store';
import Button from '../../components/ui/Button';

export default function Editor() {
  const { content, analyzing, setContent, analyze } = useDiaryStore();

  const handleAnalyze = () => {
    if (content.trim().length === 0) return;
    analyze();
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="relative">
        <textarea
          className="w-full min-h-[240px] rounded-xl border border-gray-200 bg-white p-5 text-gray-800 placeholder-gray-400 resize-y text-base leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-shadow"
          placeholder="今天发生了什么？你感觉怎么样？在这里自由地写下来..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={analyzing}
        />
        <span className="absolute bottom-4 right-4 text-xs text-gray-400">
          {content.length} 字
        </span>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-400">
          日记内容仅存储在本地，发送给 AI 前会脱敏处理
        </p>
        <Button
          onClick={handleAnalyze}
          loading={analyzing}
          disabled={content.trim().length === 0}
        >
          {analyzing ? 'AI 分析中...' : '分析情绪'}
        </Button>
      </div>
    </div>
  );
}
