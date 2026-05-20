import { useEffect, useState } from 'react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import { useSettingsStore } from './settings.store';

export default function AiSettingsPage() {
  const { ai, ollamaAvailable, loading, saving, fetchAiSettings, updateAiSettings, checkOllama } =
    useSettingsStore();

  const [deepseekKey, setDeepseekKey] = useState('');
  const [ollamaModel, setOllamaModel] = useState('');

  useEffect(() => {
    fetchAiSettings();
    checkOllama();
  }, []);

  useEffect(() => {
    if (ai) {
      setDeepseekKey(ai.deepseekApiKey ?? '');
      setOllamaModel(ai.ollamaModel);
    }
  }, [ai]);

  const handleModeChange = async (mode: 'ollama' | 'deepseek') => {
    await updateAiSettings({ mode });
  };

  const handleSaveDeepseek = async () => {
    await updateAiSettings({ mode: 'deepseek', deepseekApiKey: deepseekKey });
  };

  const handleSaveOllama = async () => {
    await updateAiSettings({ ollamaModel });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">AI 模型设置</h2>
        <p className="mt-1 text-sm text-gray-500">选择情绪分析使用的 AI 引擎</p>
      </div>

      {/* Mode selection */}
      <Card>
        <div className="space-y-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="radio"
              name="mode"
              checked={ai?.mode === 'ollama'}
              onChange={() => handleModeChange('ollama')}
              className="mt-0.5 h-4 w-4 text-indigo-600"
            />
            <div className="flex-1">
              <span className="font-medium text-gray-900">Ollama 本地模型（推荐）</span>
              <p className="text-sm text-gray-500">
                完全免费，数据不出本机。首次使用需要安装 Ollama 并下载模型。
              </p>
            </div>
          </label>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="radio"
              name="mode"
              checked={ai?.mode === 'deepseek'}
              onChange={() => handleModeChange('deepseek')}
              className="mt-0.5 h-4 w-4 text-indigo-600"
            />
            <div className="flex-1">
              <span className="font-medium text-gray-900">DeepSeek 云端 API</span>
              <p className="text-sm text-gray-500">
                分析质量更高，需要联网。新用户注册即送免费额度。
              </p>
            </div>
          </label>
        </div>
      </Card>

      {/* Ollama section */}
      {ai?.mode === 'ollama' && (
        <Card>
          <h3 className="mb-3 font-medium text-gray-900">Ollama 配置</h3>

          <div className="mb-4 flex items-center gap-2 text-sm">
            <span
              className={`h-2 w-2 rounded-full ${ollamaAvailable ? 'bg-green-500' : 'bg-red-400'}`}
            />
            <span className="text-gray-600">
              {ollamaAvailable ? 'Ollama 服务已连接' : 'Ollama 服务未连接'}
            </span>
          </div>

          <div className="space-y-4">
            <Input
              label="模型名称"
              value={ollamaModel}
              onChange={(e) => setOllamaModel(e.target.value)}
              placeholder="qwen2.5:7b"
            />
            <Button onClick={handleSaveOllama} loading={saving} variant="secondary">
              保存配置
            </Button>
          </div>

          {!ollamaAvailable && (
            <div className="mt-4 rounded-lg bg-amber-50 p-4 text-sm text-amber-800">
              <p className="font-medium">Ollama 未连接 — 安装指引：</p>
              <ol className="mt-2 list-inside list-decimal space-y-1">
                <li>
                  访问{' '}
                  <a
                    href="https://ollama.com/download"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    ollama.com/download
                  </a>{' '}
                  下载安装
                </li>
                <li>
                  打开终端运行：
                  <code className="mx-1 rounded bg-amber-100 px-1 py-0.5 text-xs">
                    ollama pull {ollamaModel || 'qwen2.5:7b'}
                  </code>
                </li>
                <li>等待下载完成后，刷新本页状态</li>
              </ol>
              <Button
                variant="ghost"
                className="mt-3 text-xs"
                onClick={() => checkOllama()}
              >
                刷新状态
              </Button>
            </div>
          )}
        </Card>
      )}

      {/* Deepseek section */}
      {ai?.mode === 'deepseek' && (
        <Card>
          <h3 className="mb-3 font-medium text-gray-900">DeepSeek API 配置</h3>

          <div className="space-y-4">
            <Input
              label="API Key"
              type="password"
              value={deepseekKey}
              onChange={(e) => setDeepseekKey(e.target.value)}
              placeholder="sk-..."
            />
            <Button onClick={handleSaveDeepseek} loading={saving} variant="secondary">
              保存并切换
            </Button>
          </div>

          <div className="mt-4 rounded-lg bg-blue-50 p-4 text-sm text-blue-800">
            <p className="font-medium">如何获取免费 API Key：</p>
            <ol className="mt-2 list-inside list-decimal space-y-1">
              <li>
                访问{' '}
                <a
                  href="https://platform.deepseek.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  platform.deepseek.com
                </a>{' '}
                注册账号
              </li>
              <li>新用户即送 500 万 token 免费额度</li>
              <li>在 API Keys 页面创建 Key，粘贴到上方输入框</li>
            </ol>
          </div>
        </Card>
      )}
    </div>
  );
}
