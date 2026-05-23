import { useState, useRef, useEffect } from 'react';
import { usePaperStore } from './paper.store';
import type { PaperMaterial, PaperColor } from './paper.store';

const MATERIALS: { key: PaperMaterial; label: string; desc: string }[] = [
  { key: 'grid', label: '作文纸', desc: '方格如田字' },
  { key: 'lined', label: '横线纸', desc: '行线如信笺' },
  { key: 'blank', label: '素白纸', desc: '留白任自由' },
];

const COLORS: { key: PaperColor; label: string; preview: string }[] = [
  { key: 'classic', label: '经典米黄', preview: '#fdf5e6' },
  { key: 'rice', label: '宣纸素白', preview: '#faf8f5' },
  { key: 'dark', label: '暗夜暖灯', preview: '#2c2416' },
  { key: 'blue', label: '护眼青绿', preview: '#e8f0e8' },
];

export default function PaperStylePicker() {
  const { material, color, setMaterial, setColor } = usePaperStore();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const currentColor = COLORS.find((c) => c.key === color)!;

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors cursor-pointer border"
        style={{
          color: 'var(--paper-text-secondary)',
          borderColor: 'var(--paper-border)',
          backgroundColor: 'var(--paper-bg)',
        }}
        title="纸张风格"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
        纸张
        <svg className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-64 rounded-xl border shadow-lg z-50 overflow-hidden"
          style={{
            backgroundColor: 'var(--sidebar-bg)',
            borderColor: 'var(--paper-border)',
          }}
        >
          {/* Material selector */}
          <div className="px-4 pt-4 pb-2">
            <p className="text-xs tracking-wide mb-2.5" style={{ color: 'var(--paper-text-secondary)' }}>
              纸张材质
            </p>
            <div className="grid grid-cols-3 gap-2">
              {MATERIALS.map((m) => (
                <button
                  key={m.key}
                  onClick={() => setMaterial(m.key)}
                  className={`flex flex-col items-center gap-1 rounded-lg px-2 py-2.5 text-xs transition-all cursor-pointer border ${
                    material === m.key ? 'ring-1' : ''
                  }`}
                  style={{
                    borderColor: material === m.key ? 'var(--paper-accent)' : 'var(--paper-border)',
                    backgroundColor: material === m.key ? 'var(--paper-bg)' : 'transparent',
                    color: material === m.key ? 'var(--paper-text)' : 'var(--paper-text-secondary)',
                  }}
                >
                  {/* Mini preview */}
                  <div
                    className="w-10 h-8 rounded border"
                    style={{
                      backgroundColor: 'var(--paper-bg)',
                      borderColor: 'var(--paper-border)',
                      backgroundImage: m.key === 'grid'
                        ? `repeating-linear-gradient(to bottom, transparent, transparent 6px, var(--paper-grid) 6px, var(--paper-grid) 7px), repeating-linear-gradient(to right, transparent, transparent 6px, var(--paper-grid) 6px, var(--paper-grid) 7px)`
                        : m.key === 'lined'
                          ? `repeating-linear-gradient(to bottom, transparent, transparent 6px, var(--paper-line) 6px, var(--paper-line) 7px)`
                          : 'none',
                    }}
                  />
                  <span>{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Color selector */}
          <div className="px-4 py-3 border-t" style={{ borderColor: 'var(--paper-border)' }}>
            <p className="text-xs tracking-wide mb-2.5" style={{ color: 'var(--paper-text-secondary)' }}>
              纸张颜色
            </p>
            <div className="flex gap-2">
              {COLORS.map((c) => (
                <button
                  key={c.key}
                  onClick={() => setColor(c.key)}
                  className="flex-1 flex flex-col items-center gap-1.5"
                >
                  <div
                    className={`w-8 h-8 rounded-full border-2 transition-all cursor-pointer ${
                      color === c.key ? 'scale-110' : ''
                    }`}
                    style={{
                      backgroundColor: c.preview,
                      borderColor: color === c.key ? 'var(--paper-accent)' : 'var(--paper-border)',
                      boxShadow: color === c.key ? '0 0 0 2px rgba(0,0,0,0.05)' : 'none',
                    }}
                    title={c.label}
                  />
                  <span
                    className="text-[10px] leading-tight text-center"
                    style={{ color: color === c.key ? 'var(--paper-text)' : 'var(--paper-text-secondary)' }}
                  >
                    {c.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
