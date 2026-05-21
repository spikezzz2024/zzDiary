import type { AnalyzeResponse } from '../../types/shared';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { EMOTION_COLORS, DEFAULT_EMOTION_META } from '../../lib/constants/emotions';

interface Props {
  result: AnalyzeResponse;
  onDismiss: () => void;
}

export default function EmotionResult({ result, onDismiss }: Props) {
  const intensityPercent = (result.intensity ?? 5) * 10;

  return (
    <Card className="space-y-5 animate-in">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">情绪分析结果</h3>
        <button
          onClick={onDismiss}
          className="text-gray-400 hover:text-gray-600 text-sm cursor-pointer"
        >
          关闭
        </button>
      </div>

      {/* Emotion Tags */}
      <div>
        <p className="text-xs font-medium text-gray-500 mb-2">情绪标签</p>
        <div className="flex flex-wrap gap-2">
          {result.emotionTags?.map((tag) => {
            const meta = EMOTION_COLORS[tag] ?? DEFAULT_EMOTION_META;
            return <Badge key={tag} label={meta.label} color={meta.color} bg={meta.bg} />;
          })}
          {(!result.emotionTags || result.emotionTags.length === 0) && (
            <span className="text-sm text-gray-400">暂无情绪标签</span>
          )}
        </div>
      </div>

      {/* Intensity Bar */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <p className="text-xs font-medium text-gray-500">情绪强度</p>
          <span className="text-sm font-semibold text-gray-700">{result.intensity ?? 5} / 10</span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${intensityPercent}%`,
              backgroundColor:
                (result.intensity ?? 5) >= 7 ? '#ef4444' :
                (result.intensity ?? 5) >= 4 ? '#f59e0b' : '#22c55e',
            }}
          />
        </div>
      </div>

      {/* Cognitive Biases */}
      {result.cognitiveBiases && result.cognitiveBiases.length > 0 && (
        <div>
          <p className="text-xs font-medium text-gray-500 mb-2">可能的认知偏差</p>
          <div className="flex flex-wrap gap-1.5">
            {result.cognitiveBiases.map((bias) => (
              <span
                key={bias}
                className="inline-flex rounded-md bg-amber-50 px-2 py-0.5 text-xs text-amber-700 border border-amber-200"
              >
                {bias}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Family Connection */}
      {result.familyConnection && (
        <div className="rounded-lg bg-indigo-50 border border-indigo-100 px-4 py-3">
          <p className="text-xs font-medium text-indigo-700 mb-1">可能关联原生家庭</p>
          <p className="text-sm text-indigo-600">
            你当前的情绪可能与你过去的家庭经历有关。可以到"原生家庭"模块了解更多。
          </p>
        </div>
      )}

      {/* Root Cause */}
      {result.possibleRootCause && (
        <div>
          <p className="text-xs font-medium text-gray-500 mb-1">可能的根本原因</p>
          <p className="text-sm text-gray-700 leading-relaxed">{result.possibleRootCause}</p>
        </div>
      )}

      {/* Mindfulness Suggestion */}
      {result.mindfulnessSuggestion && (
        <div className="rounded-lg bg-green-50 border border-green-100 px-4 py-3">
          <p className="text-xs font-medium text-green-700 mb-1">正念建议</p>
          <p className="text-sm text-green-700 leading-relaxed">
            {result.mindfulnessSuggestion}
          </p>
        </div>
      )}
    </Card>
  );
}
