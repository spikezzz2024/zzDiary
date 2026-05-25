import { useEffect, useState } from 'react';
import { useFamilyStore } from './family.store';

export default function FamilyPage() {
  const {
    background,
    loading,
    saving,
    distilling,
    error,
    fetchBackground,
    saveBackground,
    distill,
    clearError,
  } = useFamilyStore();

  const [childhoodSummary, setChildhoodSummary] = useState('');
  const [parentalRelationship, setParentalRelationship] = useState('');
  const [significantEvents, setSignificantEvents] = useState('');
  const [started, setStarted] = useState(false);

  useEffect(() => {
    fetchBackground();
  }, [fetchBackground]);

  useEffect(() => {
    if (background) {
      setChildhoodSummary(background.childhoodSummary);
      setParentalRelationship(background.parentalRelationship);
      setSignificantEvents(background.significantEvents);
      setStarted(true);
    }
  }, [background]);

  const handleSave = async () => {
    if (!childhoodSummary.trim() || !significantEvents.trim()) return;
    await saveBackground({
      childhoodSummary: childhoodSummary.trim(),
      parentalRelationship: parentalRelationship.trim(),
      significantEvents: significantEvents.trim(),
    });
  };

  const inputClass = `w-full rounded-lg border px-4 py-3 text-sm leading-relaxed resize-y outline-none transition-colors
    bg-[var(--paper-bg)] border-[var(--paper-border)] text-[var(--paper-text)]
    placeholder:text-[var(--paper-text-secondary)] focus:border-[var(--app-accent)] focus:ring-1 focus:ring-[var(--app-accent)]`;

  const labelClass = 'text-sm font-medium';
  const hintClass = 'text-xs text-[var(--paper-text-secondary)] mt-1';

  // --- Loading ---
  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-pulse">
        <div className="h-7 w-48 rounded" style={{ backgroundColor: 'var(--paper-border)' }} />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-xl border p-5 space-y-3"
              style={{ backgroundColor: 'var(--paper-bg)', borderColor: 'var(--paper-border)' }}>
              <div className="h-4 w-20 rounded" style={{ backgroundColor: 'var(--paper-border)' }} />
              <div className="h-24 rounded-lg" style={{ backgroundColor: 'var(--paper-border)' }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // --- Error ---
  if (error && !background) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="rounded-xl border p-8 text-center space-y-3"
          style={{ borderColor: '#e8c4c4', backgroundColor: '#fef5f5' }}>
          <p className="text-sm" style={{ color: '#b53b3b' }}>{error}</p>
          <button onClick={() => { clearError(); fetchBackground(); }}
            className="text-sm underline cursor-pointer"
            style={{ color: '#b53b3b' }}>
            重试
          </button>
        </div>
      </div>
    );
  }

  // --- Empty ---
  if (!started && !background) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="rounded-xl border p-12 text-center space-y-5"
          style={{ backgroundColor: 'var(--paper-bg)', borderColor: 'var(--paper-border)' }}>
          <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'var(--paper-border)' }}>
            <svg className="w-8 h-8" style={{ color: 'var(--paper-text-secondary)' }}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold" style={{ color: 'var(--paper-text)' }}>
              尚未填写家庭背景
            </h2>
            <p className="text-sm mt-2 leading-relaxed" style={{ color: 'var(--paper-text-secondary)' }}>
              填写原生家庭信息，AI 将据此生成家庭影响洞察，<br />
              并在每次日记分析中提供更有针对性的解读。
            </p>
          </div>
          <button onClick={() => setStarted(true)}
            className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium cursor-pointer transition-colors"
            style={{ backgroundColor: 'var(--app-accent)', color: 'var(--app-accent-text)' }}>
            开始填写
          </button>
        </div>
      </div>
    );
  }

  // --- Loaded ---
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-lg font-semibold" style={{ color: 'var(--paper-text)' }}>
          原生家庭背景
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--paper-text-secondary)' }}>
          填写后可使用 AI 提炼家庭影响洞察，帮助日记分析更精准地理解你的情绪模式。
        </p>
      </div>

      {/* Form card */}
      <div className="rounded-xl border p-6 space-y-5"
        style={{ backgroundColor: 'var(--paper-bg)', borderColor: 'var(--paper-border)' }}>
        <div>
          <label className={labelClass} style={{ color: 'var(--paper-text)' }}>
            童年经历总结
          </label>
          <p className={hintClass}>概括你的童年成长环境、与父母的关系、家庭氛围等</p>
          <textarea className={inputClass} rows={4} value={childhoodSummary}
            onChange={(e) => setChildhoodSummary(e.target.value)}
            placeholder="例如：在传统家庭长大，父亲严格，母亲温柔但常妥协，家庭氛围表面和睦但缺乏情感表达..." />
        </div>

        <div>
          <label className={labelClass} style={{ color: 'var(--paper-text)' }}>
            父母关系
          </label>
          <p className={hintClass}>简单描述父母之间的关系状态</p>
          <textarea className={inputClass} rows={2} value={parentalRelationship}
            onChange={(e) => setParentalRelationship(e.target.value)}
            placeholder="例如：经常争吵但未离婚、和睦恩爱、离异分居、一方早逝..." />
        </div>

        <div>
          <label className={labelClass} style={{ color: 'var(--paper-text)' }}>
            重要家庭事件
          </label>
          <p className={hintClass}>对你产生重大影响的家庭事件（时间、事件、你的感受）</p>
          <textarea className={inputClass} rows={4} value={significantEvents}
            onChange={(e) => setSignificantEvents(e.target.value)}
            placeholder="例如：10岁时父母离异，我跟了母亲，此后很少见到父亲；初中被寄养在祖父母家，感觉被抛弃..." />
        </div>

        <div className="flex items-center gap-3 pt-1">
          <button onClick={handleSave} disabled={saving || !childhoodSummary.trim() || !significantEvents.trim()}
            className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: 'var(--app-accent)', color: 'var(--app-accent-text)' }}>
            {saving && (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <circle cx="12" cy="12" r="10" strokeOpacity={0.25} />
                <path strokeLinecap="round" d="M12 2a10 10 0 019.95 9" />
              </svg>
            )}
            {saving ? '保存中...' : '保存'}
          </button>

          <button onClick={distill} disabled={distilling || !background}
            className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed border"
            style={{
              color: 'var(--app-accent)',
              borderColor: 'var(--app-accent)',
              backgroundColor: 'transparent',
            }}>
            {distilling && (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <circle cx="12" cy="12" r="10" strokeOpacity={0.25} />
                <path strokeLinecap="round" d="M12 2a10 10 0 019.95 9" />
              </svg>
            )}
            {distilling ? '提炼中...' : 'AI 提炼'}
          </button>
        </div>

        {error && (
          <div className="rounded-lg border p-3 flex items-center justify-between"
            style={{ borderColor: '#e8c4c4', backgroundColor: '#fef5f5' }}>
            <p className="text-sm" style={{ color: '#b53b3b' }}>{error}</p>
            <button onClick={clearError}
              className="text-sm underline cursor-pointer shrink-0 ml-3"
              style={{ color: '#b53b3b' }}>
              关闭
            </button>
          </div>
        )}
      </div>

      {/* Skill display card */}
      {background?.skillSummary && (
        <div className="rounded-xl border p-6 space-y-3"
          style={{ backgroundColor: 'var(--paper-bg)', borderColor: 'var(--paper-border)' }}>
          <div className="flex items-center gap-2.5">
            <svg className="w-5 h-5" style={{ color: 'var(--app-accent)' }} fill="none" viewBox="0 0 24 24"
              stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
            </svg>
            <span className="text-sm font-medium" style={{ color: 'var(--app-text)' }}>
              AI 家庭影响洞察
            </span>
          </div>
          <blockquote className="text-sm leading-relaxed pl-4 border-l-2"
            style={{ color: 'var(--paper-text)', borderColor: 'var(--app-accent)' }}>
            {background.skillSummary}
          </blockquote>
        </div>
      )}
    </div>
  );
}
