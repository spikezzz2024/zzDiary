import { useMemo } from 'react';

interface Props {
  selectedDate: string | null;
  datesWithEntries: string[];
  onSelectDate: (date: string) => void;
}

const WEEKDAYS = ['一', '二', '三', '四', '五', '六', '日'];

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function firstDayOfMonth(year: number, month: number): number {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
}

export default function Calendar({ selectedDate, datesWithEntries, onSelectDate }: Props) {
  const today = todayStr();

  const [viewYear, viewMonth] = useMemo(() => {
    if (selectedDate) {
      const [y, m] = selectedDate.split('-').map(Number);
      return [y, m - 1];
    }
    const d = new Date();
    return [d.getFullYear(), d.getMonth()];
  }, [selectedDate]);

  const entrySet = useMemo(() => new Set(datesWithEntries), [datesWithEntries]);

  const goTo = (year: number, month: number) => {
    const d = new Date(year, month, 1);
    const lastDay = daysInMonth(year, month);
    const day = Math.min(
      selectedDate ? parseInt(selectedDate.split('-')[2]) : lastDay,
      lastDay,
    );
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const da = String(day).padStart(2, '0');
    onSelectDate(`${y}-${m}-${da}`);
  };

  const prevMonth = () => goTo(viewYear, viewMonth - 1);
  const nextMonth = () => goTo(viewYear, viewMonth + 1);

  const totalDays = daysInMonth(viewYear, viewMonth);
  const startDay = firstDayOfMonth(viewYear, viewMonth);

  const selectedDay = selectedDate?.startsWith(
    `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}`,
  )
    ? parseInt(selectedDate.split('-')[2])
    : null;

  const monthLabel = `${viewYear}年${viewMonth + 1}月`;

  return (
    <div
      className="rounded-xl border overflow-hidden select-none"
      style={{
        backgroundColor: 'var(--paper-bg)',
        borderColor: 'var(--paper-border)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}
    >
      {/* Month header */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{ borderColor: 'var(--paper-border)' }}
      >
        <button
          onClick={prevMonth}
          className="p-1.5 rounded-md transition-colors cursor-pointer hover:opacity-60"
          style={{ color: 'var(--paper-text-secondary)' }}
          aria-label="上一月"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h3
          className="text-base font-medium tracking-wider"
          style={{ color: 'var(--paper-text)', fontFamily: "'KaiTi', 'STKaiti', 'Noto Serif SC', serif" }}
        >
          {monthLabel}
        </h3>
        <button
          onClick={nextMonth}
          className="p-1.5 rounded-md transition-colors cursor-pointer hover:opacity-60"
          style={{ color: 'var(--paper-text-secondary)' }}
          aria-label="下一月"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 px-2 pt-3 pb-1">
        {WEEKDAYS.map((wd) => (
          <div
            key={wd}
            className="text-center text-xs py-1 tracking-wider"
            style={{ color: 'var(--paper-text-secondary)' }}
          >
            {wd}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 px-2 pb-3">
        {Array.from({ length: startDay }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}
        {Array.from({ length: totalDays }).map((_, i) => {
          const day = i + 1;
          const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const isToday = dateStr === today;
          const isSelected = day === selectedDay;
          const hasEntry = entrySet.has(dateStr);

          return (
            <button
              key={day}
              onClick={() => onSelectDate(dateStr)}
              className="relative aspect-square flex flex-col items-center justify-center rounded-full transition-all cursor-pointer hover:opacity-70"
              style={{
                backgroundColor: isSelected ? 'var(--paper-accent)' : 'transparent',
                color: isSelected ? '#fff' : isToday ? '#c87878' : 'var(--paper-text)',
              }}
            >
              <span
                className="text-sm leading-none"
                style={{
                  fontFamily: "'KaiTi', 'STKaiti', 'Noto Serif SC', serif",
                  fontWeight: isToday || isSelected ? 600 : 400,
                }}
              >
                {day}
              </span>
              {hasEntry && !isSelected && (
                <span
                  className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                  style={{ backgroundColor: 'var(--paper-accent)' }}
                />
              )}
              {isToday && !isSelected && (
                <span
                  className="absolute inset-0 rounded-full border opacity-50"
                  style={{ borderColor: '#c87878' }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
