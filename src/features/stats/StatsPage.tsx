import { useEffect, useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useStatsStore } from './stats.store';
import type { HeatmapPoint } from './types';

type TimeRange = 'week' | 'month' | 'year' | 'all';

const CARD_CONFIG = [
  { key: 'totalEntries' as const, label: '总篇数', unit: '篇' },
  { key: 'totalChars' as const, label: '总字数', unit: '字' },
  { key: 'avgCharsPerEntry' as const, label: '日均字数', unit: '字/篇' },
  { key: 'activeDays' as const, label: '活跃天数', unit: '天' },
  { key: 'currentStreak' as const, label: '当前连续', unit: '天' },
  { key: 'longestStreak' as const, label: '最长连续', unit: '天' },
];

function getColor(count: number): string {
  if (count === 0) return '#e7e5e4';
  if (count === 1) return '#d4a574';
  if (count === 2) return '#c4956a';
  if (count === 3) return '#b07d51';
  return '#9a653a';
}

function formatNum(n: number): string {
  if (n >= 10000) return (n / 10000).toFixed(1) + 'w';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
  return String(n);
}

function getDateRange(range: TimeRange): { start: Date; end: Date } {
  const now = new Date();
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let start: Date;
  switch (range) {
    case 'week': {
      start = new Date(end);
      start.setDate(end.getDate() - end.getDay() + 1); // Monday
      if (start > end) start.setDate(start.getDate() - 7);
      break;
    }
    case 'month':
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'year':
      start = new Date(now.getFullYear(), 0, 1);
      break;
    default:
      start = new Date(2000, 0, 1);
      break;
  }
  return { start, end };
}

function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function CalendarHeatmap({ data, range }: { data: HeatmapPoint[]; range: TimeRange }) {
  const countMap = useMemo(() => {
    const m = new Map<string, number>();
    data.forEach(d => m.set(d.date, d.count));
    return m;
  }, [data]);

  const { weeks, monthLabels } = useMemo(() => {
    const { start, end } = getDateRange(range);
    // Align start to Monday
    const gridStart = new Date(start);
    const dayOfWeek = gridStart.getDay();
    const offset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    gridStart.setDate(gridStart.getDate() + offset);

    // Align end to Sunday
    const gridEnd = new Date(end);
    gridEnd.setDate(gridEnd.getDate() + (7 - gridEnd.getDay()) % 7);

    const weeks: string[][] = [];
    const labels: { weekIdx: number; label: string }[] = [];
    let current = new Date(gridStart);
    let week: string[] = [];
    let weekIdx = 0;
    let lastMonth = -1;

    while (current <= gridEnd) {
      const dateStr = formatDate(current);
      if (week.length === 0) {
        const month = current.getMonth();
        if (month !== lastMonth) {
          labels.push({ weekIdx, label: `${current.getMonth() + 1}月` });
          lastMonth = month;
        }
      }
      week.push(dateStr);
      if (week.length === 7) {
        weeks.push(week);
        week = [];
        weekIdx++;
      }
      current.setDate(current.getDate() + 1);
    }
    if (week.length > 0) {
      weeks.push(week);
    }

    return { weeks, monthLabels: labels };
  }, [range]);

  const dayLabels = ['一', '二', '三', '四', '五', '六', '日'];

  return (
    <div className="overflow-x-auto">
      {/* Month labels */}
      <div className="flex mb-1 ml-8">
        {monthLabels.map((m, i) => (
          <span
            key={i}
            className="text-xs"
            style={{
              color: 'var(--app-text-secondary)',
              marginLeft: i === 0 ? `${m.weekIdx * 14}px` : `${(m.weekIdx - monthLabels[i - 1].weekIdx) * 14}px`,
              marginRight: '2px',
            }}
          >
            {m.label}
          </span>
        ))}
      </div>
      <div className="flex">
        {/* Day labels */}
        <div className="flex flex-col mr-1.5 gap-0.5">
          {dayLabels.map((d, i) => (
            <span key={i} className="text-[10px] leading-[12px] h-3 w-6 text-right" style={{ color: 'var(--app-text-secondary)' }}>
              {i % 2 === 0 ? d : ''}
            </span>
          ))}
        </div>
        {/* Heatmap grid */}
        <div className="flex gap-0.5">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-0.5">
              {week.map(dateStr => {
                const count = countMap.get(dateStr) ?? 0;
                return (
                  <div
                    key={dateStr}
                    className="w-3 h-3 rounded-sm"
                    style={{ backgroundColor: getColor(count) }}
                    title={`${dateStr}: ${count}篇`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
      {/* Legend */}
      <div className="flex items-center gap-1 mt-2 ml-8">
        <span className="text-[10px]" style={{ color: 'var(--app-text-secondary)' }}>少</span>
        {[0, 0, 1, 2, 3, 4].map((level, i) => (
          <div
            key={i}
            className="w-3 h-3 rounded-sm"
            style={{ backgroundColor: getColor(level) }}
          />
        ))}
        <span className="text-[10px]" style={{ color: 'var(--app-text-secondary)' }}>多</span>
      </div>
    </div>
  );
}

export default function StatsPage() {
  const { overview, heatmap, timeDistribution, loading, error, fetchAll, fetchHeatmap } = useStatsStore();
  const [range, setRange] = useState<TimeRange>('year');

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  useEffect(() => {
    if (range === 'all') {
      fetchHeatmap();
    } else {
      const { start, end } = getDateRange(range);
      fetchHeatmap(formatDate(start), formatDate(end));
    }
  }, [range, fetchHeatmap]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <span style={{ color: 'var(--app-text-secondary)' }}>加载中...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <span style={{ color: '#b91c1c' }}>加载失败: {error}</span>
      </div>
    );
  }

  const rangeOptions: { v: TimeRange; label: string }[] = [
    { v: 'week', label: '周' },
    { v: 'month', label: '月' },
    { v: 'year', label: '年' },
    { v: 'all', label: '全部' },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-medium" style={{ color: 'var(--app-text)' }}>书写统计</h2>

      {/* Overview Cards */}
      {overview && (
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {CARD_CONFIG.map(c => {
            const value = overview[c.key];
            return (
              <div
                key={c.key}
                className="rounded-lg p-4 text-center"
                style={{ backgroundColor: 'var(--app-surface)', border: '1px solid var(--app-border)' }}
              >
                <div className="text-2xl font-semibold" style={{ color: 'var(--app-text)' }}>
                  {formatNum(value)}
                </div>
                <div className="text-xs mt-1" style={{ color: 'var(--app-text-secondary)' }}>
                  {c.label}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Calendar Heatmap */}
      <div
        className="rounded-lg p-5"
        style={{ backgroundColor: 'var(--app-surface)', border: '1px solid var(--app-border)' }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium" style={{ color: 'var(--app-text)' }}>书写日历</h3>
          <div className="flex gap-1">
            {rangeOptions.map(o => (
              <button
                key={o.v}
                onClick={() => setRange(o.v)}
                className="px-2.5 py-0.5 text-xs rounded transition-colors"
                style={{
                  backgroundColor: range === o.v ? 'var(--app-accent)' : 'transparent',
                  color: range === o.v ? 'var(--app-accent-text)' : 'var(--app-text-secondary)',
                  border: range === o.v ? 'none' : '1px solid var(--app-border)',
                }}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
        <CalendarHeatmap data={heatmap} range={range} />
      </div>

      {/* Time Distribution */}
      <div
        className="rounded-lg p-5"
        style={{ backgroundColor: 'var(--app-surface)', border: '1px solid var(--app-border)' }}
      >
        <h3 className="text-sm font-medium mb-4" style={{ color: 'var(--app-text)' }}>书写时段分布</h3>
        {timeDistribution.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={timeDistribution} margin={{ top: 4, left: -20, right: 4, bottom: 0 }}>
              <XAxis
                dataKey="hour"
                tickFormatter={(h: number) => (h % 2 === 0 ? `${h}时` : '')}
                tick={{ fontSize: 11, fill: 'var(--app-text-secondary)' }}
                axisLine={{ stroke: 'var(--app-border)' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: 'var(--app-text-secondary)' }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--app-surface)',
                  border: '1px solid var(--app-border)',
                  borderRadius: 8,
                  fontSize: 12,
                }}
                labelFormatter={(h: number) => `${h}:00 - ${h}:59`}
                formatter={(val: number) => [`${val} 篇`, '书写次数']}
              />
              <Bar dataKey="count" radius={[3, 3, 0, 0]}>
                {timeDistribution.map((_, i) => (
                  <Cell key={i} fill="#c4956a" />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-sm text-center py-8" style={{ color: 'var(--app-text-secondary)' }}>暂无数据</p>
        )}
      </div>
    </div>
  );
}
