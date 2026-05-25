import Card from '../../components/ui/Card';
import { useThemeStore, ACCENT_PRESETS, FONT_FAMILY_MAP } from './theme.store';
import { usePaperStore } from '../diary/paper.store';

const MODE_OPTIONS = [
  { key: 'light' as const, label: '日间', desc: '浅色背景，适合白天书写' },
  { key: 'dark' as const, label: '夜间', desc: '深色背景，护眼舒适' },
  { key: 'system' as const, label: '跟随系统', desc: '自动跟随系统外观设置' },
];

const SIZE_OPTIONS = [
  { key: 'small' as const, label: '小' },
  { key: 'medium' as const, label: '中' },
  { key: 'large' as const, label: '大' },
];

const FONT_OPTIONS = [
  { key: 'song' as const, label: '宋体' },
  { key: 'kai' as const, label: '楷体' },
  { key: 'hei' as const, label: '黑体' },
  { key: 'serif' as const, label: '衬线' },
];

const SPACING_OPTIONS = [
  { key: 'compact' as const, label: '紧凑' },
  { key: 'normal' as const, label: '标准' },
  { key: 'relaxed' as const, label: '宽松' },
];

const PAPER_COLORS = [
  { key: 'classic' as const, label: '米黄', hex: '#fdf5e6' },
  { key: 'rice' as const, label: '素白', hex: '#faf8f5' },
  { key: 'warm' as const, label: '暖桃', hex: '#fef7f0' },
  { key: 'forest' as const, label: '林间', hex: '#f2f5ee' },
  { key: 'lavender' as const, label: '薰衣', hex: '#f6f3fa' },
  { key: 'slate' as const, label: '素灰', hex: '#f5f4f2' },
  { key: 'dark' as const, label: '暗夜', hex: '#2c2416' },
  { key: 'blue' as const, label: '护眼', hex: '#e8f0e8' },
];

function RadioGroup<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { key: T; label: string; desc?: string }[];
  value: T;
  onChange: (key: T) => void;
}): React.ReactElement {
  return (
    <div>
      <p className="text-xs font-medium mb-2" style={{ color: 'var(--app-text-secondary)' }}>
        {label}
      </p>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt.key}
            onClick={() => onChange(opt.key)}
            className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-all cursor-pointer"
            style={{
              borderColor: value === opt.key ? 'var(--app-accent)' : 'var(--app-border)',
              backgroundColor: value === opt.key ? 'var(--app-accent)' : 'var(--app-surface)',
              color: value === opt.key ? 'var(--app-accent-text)' : 'var(--app-text-secondary)',
            }}
            title={opt.desc}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function AppearanceSection(): React.ReactElement {
  const {
    mode, fontSize, fontFamily, lineSpacing, accentColor,
    setMode, setFontSize, setFontFamily, setLineSpacing, setAccentColor,
  } = useThemeStore();
  const paperColor = usePaperStore((s) => s.color);
  const setPaperColor = usePaperStore((s) => s.setColor);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold" style={{ color: 'var(--app-text)' }}>外观</h2>
        <p className="mt-1 text-sm" style={{ color: 'var(--app-text-secondary)' }}>
          自定义界面主题与纸张风格
        </p>
      </div>

      {/* Theme mode */}
      <Card>
        <RadioGroup label="主题模式" options={MODE_OPTIONS} value={mode} onChange={setMode} />
      </Card>

      {/* Accent color */}
      <Card>
        <p className="text-xs font-medium mb-3" style={{ color: 'var(--app-text-secondary)' }}>
          强调色
        </p>
        <div className="flex flex-wrap items-center gap-3">
          {ACCENT_PRESETS.map((hex) => (
            <button
              key={hex}
              onClick={() => setAccentColor(hex)}
              className="w-8 h-8 rounded-full border-2 transition-all cursor-pointer"
              style={{
                backgroundColor: hex,
                borderColor: accentColor === hex ? 'var(--app-text)' : 'transparent',
                boxShadow: accentColor === hex ? '0 0 0 2px rgba(0,0,0,0.1)' : 'none',
                transform: accentColor === hex ? 'scale(1.15)' : 'scale(1)',
              }}
              title={hex}
            />
          ))}
          <div className="w-px h-6 mx-1" style={{ backgroundColor: 'var(--app-border)' }} />
          <input
            type="color"
            value={accentColor}
            onChange={(e) => setAccentColor(e.target.value)}
            className="w-8 h-8 rounded-full border-2 cursor-pointer appearance-none p-0"
            style={{
              borderColor: accentColor === accentColor ? 'var(--app-text)' : 'var(--app-border)',
              backgroundColor: accentColor,
            }}
            title="自定义颜色"
          />
        </div>
      </Card>

      {/* Font size */}
      <Card>
        <RadioGroup label="字号" options={SIZE_OPTIONS} value={fontSize} onChange={setFontSize} />
      </Card>

      {/* Font family */}
      <Card>
        <RadioGroup label="字体" options={FONT_OPTIONS} value={fontFamily} onChange={setFontFamily} />
        <p className="mt-2 text-xs" style={{ color: 'var(--app-text-secondary)' }}>
          预览：<span style={{ fontFamily: FONT_FAMILY_MAP[fontFamily], fontSize: '1.125rem' }}>
            春江潮水连海平，海上明月共潮生。
          </span>
        </p>
      </Card>

      {/* Line spacing */}
      <Card>
        <RadioGroup label="行间距" options={SPACING_OPTIONS} value={lineSpacing} onChange={setLineSpacing} />
      </Card>

      {/* Paper colors */}
      <Card>
        <p className="text-xs font-medium mb-3" style={{ color: 'var(--app-text-secondary)' }}>
          默认纸张颜色
        </p>
        <div className="flex flex-wrap gap-2">
          {PAPER_COLORS.map((pc) => (
            <button
              key={pc.key}
              onClick={() => setPaperColor(pc.key)}
              className="flex flex-col items-center gap-1.5 group"
              title={pc.label}
            >
              <div
                className="w-8 h-8 rounded-full border-2 transition-all cursor-pointer"
                style={{
                  backgroundColor: pc.hex,
                  borderColor: paperColor === pc.key ? 'var(--app-accent)' : 'var(--app-border)',
                  transform: paperColor === pc.key ? 'scale(1.15)' : 'scale(1)',
                }}
              />
              <span
                className="text-[10px]"
                style={{ color: paperColor === pc.key ? 'var(--app-text)' : 'var(--app-text-secondary)' }}
              >
                {pc.label}
              </span>
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}
