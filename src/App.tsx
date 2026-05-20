import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate } from 'react-router';
import { useAuthStore } from './features/auth/auth.store';
import SetupScreen from './features/auth/SetupScreen';
import UnlockScreen from './features/auth/UnlockScreen';
import AiSettingsPage from './features/settings/AiSettingsPage';

function AuthGate({ children }: { children: React.ReactNode }) {
  const { initialized, unlocked, loading, checkStatus } = useAuthStore();

  useEffect(() => {
    checkStatus();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  if (!initialized) {
    return <SetupScreen />;
  }

  if (!unlocked) {
    return <UnlockScreen />;
  }

  return <>{children}</>;
}

function MainLayout() {
  const { email, lock } = useAuthStore();
  const navigate = useNavigate();

  const handleLock = async () => {
    await lock();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="border-b bg-white px-6 py-3">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <h1 className="text-lg font-semibold tracking-tight">zzDiary</h1>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>{email}</span>
            <Link to="/" className="hover:text-gray-700">日记</Link>
            <Link to="/settings" className="hover:text-gray-700">AI 设置</Link>
            <button onClick={handleLock} className="hover:text-gray-700 cursor-pointer">
              锁定
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-6 py-8">
        <Routes>
          <Route
            path="/"
            element={
              <div className="flex flex-col items-center justify-center gap-4 py-20">
                <h2 className="text-2xl font-medium">欢迎使用 zzDiary</h2>
                <p className="text-gray-500">你的正念日记伴侣</p>
              </div>
            }
          />
          <Route path="/settings" element={<AiSettingsPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthGate>
        <MainLayout />
      </AuthGate>
    </BrowserRouter>
  );
}
