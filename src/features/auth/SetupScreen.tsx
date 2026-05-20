import { useState, type FormEvent } from 'react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import { useAuthStore } from './auth.store';
import { APP_NAME, APP_SUBTITLE } from '../../lib/constants/ui';

export default function SetupScreen() {
  const { setup, loading, error, clearError } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (password.length < 6) return;
    await setup(email, password);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <Card className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold text-gray-900">{APP_NAME}</h1>
          <p className="mt-1 text-sm text-gray-500">{APP_SUBTITLE}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="rounded-lg bg-indigo-50 px-4 py-3 text-xs text-indigo-700">
            数据仅存储在本地，不会上传到任何服务器。请设置你的账户信息。
          </div>

          <Input
            label="邮箱"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => { setEmail(e.target.value); clearError(); }}
            required
            autoFocus
          />

          <Input
            label="启动密码"
            type="password"
            placeholder="至少6位密码"
            value={password}
            onChange={(e) => { setPassword(e.target.value); clearError(); }}
            required
            minLength={6}
            error={error ?? undefined}
          />

          <Button type="submit" loading={loading} className="w-full">
            创建账户并开始
          </Button>
        </form>
      </Card>
    </div>
  );
}
