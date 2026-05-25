import { useState } from 'react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { exportApi } from '../../lib/api';

export default function ExportSection() {
  const [format, setFormat] = useState<'markdown' | 'json'>('markdown');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    setError(null);
    setDone(false);
    try {
      await exportApi.download(format, from || undefined, to || undefined);
      setDone(true);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setExporting(false);
    }
  };

  const today = new Date().toISOString().slice(0, 10);

  return (
    <Card>
      <h3 className="mb-1 font-medium text-gray-900">数据导出</h3>
      <p className="mb-4 text-sm text-gray-500">
        将日记导出为文件保存到本地，支持按日期范围筛选。
      </p>

      <div className="space-y-4">
        {/* Format selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">导出格式</label>
          <div className="flex gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="exportFormat"
                checked={format === 'markdown'}
                onChange={() => setFormat('markdown')}
                className="h-4 w-4"
                style={{ accentColor: '#c4956a' }}
              />
              <span className="text-sm text-gray-700">Markdown</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="exportFormat"
                checked={format === 'json'}
                onChange={() => setFormat('json')}
                className="h-4 w-4"
                style={{ accentColor: '#c4956a' }}
              />
              <span className="text-sm text-gray-700">JSON</span>
            </label>
          </div>
        </div>

        {/* Date range */}
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">开始日期</label>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              max={to || today}
              className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-200"
              style={{ color: '#5c4a2e' }}
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">结束日期</label>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              min={from || undefined}
              max={today}
              className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-200"
              style={{ color: '#5c4a2e' }}
            />
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-600">导出失败: {error}</p>
        )}
        {done && (
          <p className="text-sm text-green-700">导出成功，文件已开始下载。</p>
        )}

        <Button onClick={handleExport} loading={exporting} variant="secondary">
          导出日记
        </Button>
      </div>
    </Card>
  );
}
