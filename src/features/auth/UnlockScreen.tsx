import { useState, type FormEvent } from 'react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import { useAuthStore } from './auth.store';
import { APP_NAME } from '../../lib/constants/ui';

export default function UnlockScreen() {
  const { email, unlock, loading, error, clearError } = useAuthStore();
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await unlock(password);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <Card className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold text-gray-900">{APP_NAME}</h1>
          <p className="mt-1 text-sm text-gray-500">
            {email ? `欢迎回来，${email}` : '请输入密码解锁'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="启动密码"
            type="password"
            placeholder="输入密码解锁应用"
            value={password}
            onChange={(e) => { setPassword(e.target.value); clearError(); }}
            required
            autoFocus
            error={error ?? undefined}
          />

          <Button type="submit" loading={loading} className="w-full">
            解锁
          </Button>
        </form>
      </Card>
    </div>
  );
}
