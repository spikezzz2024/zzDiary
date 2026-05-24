import { useState, useEffect, useCallback } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, ResponsiveContainer,
} from 'recharts';
import { emotionApi } from '../../lib/api';
import { EMOTION_COLORS, DEFAULT_EMOTION_META } from '../../lib/constants/emotions';
import type { TrendPoint } from './types';
import type { EmotionDistribution } from '../../types/shared';

type Status = 'loading' | 'loaded' | 'empty' | 'error';

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

const PIE_COLORS = [
  '#e8a87c', '#d4a574', '#c1906b', '#b08060',
  '#a07055', '#90604a', '#805040', '#704036',
  '#60402c', '#503020',
];

type EmotionMeta = { label: string; color: string; bg: string };

const EMOTION_META_MAP: Record<string, EmotionMeta> = {
  ...EMOTION_COLORS,
  焦虑: { label: '焦虑', color: '#d4a574', bg: 'bg-amber-100' },
  愤怒: { label: '愤怒', color: '#c87858', bg: 'bg-red-100' },
  悲伤: { label: '悲伤', color: '#6b8aab', bg: 'bg-blue-100' },
  羞耻: { label: '羞耻', color: '#c08090', bg: 'bg-pink-100' },
  恐惧: { label: '恐惧', color: '#8b6b9e', bg: 'bg-purple-100' },
  喜悦: { label: '喜悦', color: '#7aaa7a', bg: 'bg-green-100' },
  平静: { label: '平静', color: '#5a9e96', bg: 'bg-teal-100' },
  内疚: { label: '内疚', color: '#b07078', bg: 'bg-rose-100' },
  孤独: { label: '孤独', color: '#8b8b8b', bg: 'bg-slate-100' },
  感激: { label: '感激', color: '#6aaa7a', bg: 'bg-emerald-100' },
  困惑: { label: '困惑', color: '#c09060', bg: 'bg-orange-100' },
  失望: { label: '失望', color: '#9b9b9b', bg: 'bg-gray-100' },
  疲惫: { label: '疲惫', color: '#9b8b7b', bg: 'bg-stone-100' },
};

function emotionColor(label: string): string {
  return EMOTION_META_MAP[label]?.color ?? DEFAULT_EMOTION_META.color;
}

function emotionLabel(label: string): string {
  return EMOTION_META_MAP[label]?.label ?? label;
}

export default function EmotionDashboard() {
  const [status, setStatus] = useState<Status>('loading');
  const [error, setError] = useState('');
  const [trend, setTrend] = useState<TrendPoint[]>([]);
  const [distribution, setDistribution] = useState<EmotionDistribution[]>([]);
  const [from, setFrom] = useState(daysAgo(30));
  const [to, setTo] = useState(todayStr());

  const fetchData = useCallback(async () => {
    setStatus('loading');
    try {
      const [trendData, distData] = await Promise.all([
        emotionApi.getTrend(from, to),
        emotionApi.getDistribution(),
      ]);
      if (trendData.length === 0 && distData.length === 0) {
        setStatus('empty');
      } else {
        setTrend(trendData);
        setDistribution(distData);
        setStatus('loaded');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : '加载失败');
      setStatus('error');
    }
  }, [from, to]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="space-y-5">
      {/* Date range picker */}
      <div className="flex items-center gap-3 flex-wrap">
        <label className="text-sm" style={{ color: 'var(--paper-text-secondary)' }}>
          日期范围
        </label>
        <input
          type="date"
          value={from}
          onChange={e => setFrom(e.target.value)}
          className="border rounded px-2 py-1 text-sm"
          style={{
            borderColor: 'var(--paper-border)',
            backgroundColor: 'var(--paper-bg)',
            color: 'var(--paper-text)',
          }}
        />
        <span style={{ color: 'var(--paper-text-secondary)' }}>至</span>
        <input
          type="date"
          value={to}
          onChange={e => setTo(e.target.value)}
          className="border rounded px-2 py-1 text-sm"
          style={{
            borderColor: 'var(--paper-border)',
            backgroundColor: 'var(--paper-bg)',
            color: 'var(--paper-text)',
          }}
        />
        <button
          onClick={fetchData}
          className="px-3 py-1 rounded text-sm cursor-pointer"
          style={{
            backgroundColor: 'var(--paper-accent)',
            color: '#fff',
          }}
        >
          查询
        </button>
      </div>

      {status === 'loading' && <Skeleton />}
      {status === 'error' && <ErrorBox message={error} onRetry={fetchData} />}
      {status === 'empty' && <EmptyGuide />}

      {status === 'loaded' && (
        <>
          {/* Trend chart */}
          <section
            className="border rounded-lg p-4"
            style={{
              borderColor: 'var(--paper-border)',
              backgroundColor: 'var(--sidebar-bg)',
            }}
          >
            <h2
              className="text-base font-medium mb-4"
              style={{ color: 'var(--paper-text)' }}
            >
              情绪趋势
            </h2>
            {trend.length < 2 ? (
              <p className="text-sm" style={{ color: 'var(--paper-text-secondary)' }}>
                需要至少两天数据才能绘制趋势图，请分析更多日记。
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={trend} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--paper-grid)" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12, fill: 'var(--paper-text-secondary)' }}
                    tickFormatter={(d: string) => d.slice(5)}
                  />
                  <YAxis
                    domain={[0, 10]}
                    tick={{ fontSize: 12, fill: 'var(--paper-text-secondary)' }}
                    tickCount={6}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--sidebar-bg)',
                      borderColor: 'var(--paper-border)',
                      borderRadius: 8,
                      fontSize: 13,
                    }}
                    labelFormatter={(d: string) => `📅 ${d}`}
                    formatter={(value: number, _name: string, props: { payload: TrendPoint }) => {
                      const emotion = props.payload.dominantEmotion;
                      return [`${emotionLabel(emotion)} (${value})`, '主导情绪'];
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="avgIntensity"
                    stroke="var(--paper-accent)"
                    strokeWidth={2}
                    dot={{ r: 4, fill: 'var(--paper-accent)' }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
            {/* Legend: recent dominant emotions shown as tags */}
            <div className="flex gap-2 mt-3 flex-wrap">
              {trend.slice(-7).map((p) => (
                <span
                  key={p.date}
                  className="text-xs px-1.5 py-0.5 rounded"
                  style={{
                    backgroundColor: emotionColor(p.dominantEmotion) + '20',
                    color: emotionColor(p.dominantEmotion),
                    border: `1px solid ${emotionColor(p.dominantEmotion)}40`,
                  }}
                >
                  {p.date.slice(5)} {emotionLabel(p.dominantEmotion)}
                </span>
              ))}
            </div>
          </section>

          {/* Distribution chart */}
          <section
            className="border rounded-lg p-4"
            style={{
              borderColor: 'var(--paper-border)',
              backgroundColor: 'var(--sidebar-bg)',
            }}
          >
            <h2
              className="text-base font-medium mb-4"
              style={{ color: 'var(--paper-text)' }}
            >
              情绪分布
            </h2>
            {distribution.length === 0 ? (
              <p className="text-sm" style={{ color: 'var(--paper-text-secondary)' }}>
                暂无情绪数据。
              </p>
            ) : (
              <div className="flex items-center gap-4 flex-wrap">
                <ResponsiveContainer width={240} height={240}>
                  <PieChart>
                    <Pie
                      data={distribution}
                      dataKey="count"
                      nameKey="emotion"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={90}
                      paddingAngle={2}
                    >
                      {distribution.map((d, i) => (
                        <Cell
                          key={d.emotion}
                          fill={emotionColor(d.emotion) || PIE_COLORS[i % PIE_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--sidebar-bg)',
                        borderColor: 'var(--paper-border)',
                        borderRadius: 8,
                        fontSize: 13,
                      }}
                      formatter={(count: number, name: string) => [
                        `${count} 次`,
                        emotionLabel(name),
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Legend */}
                <div className="flex flex-col gap-1 text-sm">
                  {distribution.map((d) => (
                    <div key={d.emotion} className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full inline-block"
                        style={{
                          backgroundColor:
                            emotionColor(d.emotion) ||
                            PIE_COLORS[distribution.indexOf(d) % PIE_COLORS.length],
                        }}
                      />
                      <span style={{ color: 'var(--paper-text)' }}>
                        {emotionLabel(d.emotion)}
                      </span>
                      <span
                        className="tabular-nums"
                        style={{ color: 'var(--paper-text-secondary)' }}
                      >
                        {d.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

function Skeleton() {
  return (
    <div className="space-y-5 animate-pulse">
      <div
        className="border rounded-lg p-4"
        style={{ borderColor: 'var(--paper-border)' }}
      >
        <div className="h-4 w-24 rounded mb-4" style={{ backgroundColor: 'var(--paper-grid)' }} />
        <div className="h-60 rounded" style={{ backgroundColor: 'var(--paper-grid)', opacity: 0.3 }} />
      </div>
      <div
        className="border rounded-lg p-4"
        style={{ borderColor: 'var(--paper-border)' }}
      >
        <div className="h-4 w-24 rounded mb-4" style={{ backgroundColor: 'var(--paper-grid)' }} />
        <div className="flex items-center gap-4">
          <div
            className="rounded-full"
            style={{
              width: 240,
              height: 240,
              backgroundColor: 'var(--paper-grid)',
              opacity: 0.3,
            }}
          />
          <div className="flex flex-col gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-3 rounded"
                style={{
                  width: 80 + Math.random() * 40,
                  backgroundColor: 'var(--paper-grid)',
                  opacity: 0.3,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ErrorBox({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div
      className="border rounded-lg p-6 text-center"
      style={{ borderColor: 'var(--paper-border)', backgroundColor: 'var(--sidebar-bg)' }}
    >
      <p className="text-sm mb-3" style={{ color: '#c87858' }}>
        {message}
      </p>
      <button
        onClick={onRetry}
        className="px-3 py-1 rounded text-sm cursor-pointer"
        style={{ backgroundColor: 'var(--paper-accent)', color: '#fff' }}
      >
        重试
      </button>
    </div>
  );
}

function EmptyGuide() {
  return (
    <div
      className="border rounded-lg p-8 text-center"
      style={{ borderColor: 'var(--paper-border)', backgroundColor: 'var(--sidebar-bg)' }}
    >
      <p
        className="text-base mb-2"
        style={{ color: 'var(--paper-text)' }}
      >
        还没有情绪分析数据
      </p>
      <p
        className="text-sm mb-4"
        style={{ color: 'var(--paper-text-secondary)' }}
      >
        请先在书写页面写完日记后点击「分析情绪」，或在日记本中为历史日记执行 AI 分析。
      </p>
      <a
        href="/"
        className="inline-block px-4 py-1.5 rounded text-sm no-underline"
        style={{ backgroundColor: 'var(--paper-accent)', color: '#fff' }}
      >
        去书写
      </a>
    </div>
  );
}
