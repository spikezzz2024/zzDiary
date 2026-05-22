import { BrowserRouter, Routes, Route, Link } from 'react-router';
import AiSettingsPage from './features/settings/AiSettingsPage';
import DiaryPage from './features/diary/DiaryPage';
import DiaryHistoryPage from './features/diary/DiaryHistoryPage';
import DiaryDetailPage from './features/diary/DiaryDetailPage';

function MainLayout() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="border-b bg-white px-6 py-3">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <h1 className="text-lg font-semibold tracking-tight">zzDiary</h1>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <Link to="/" className="hover:text-gray-700">日记</Link>
            <Link to="/history" className="hover:text-gray-700">历史</Link>
            <Link to="/settings" className="hover:text-gray-700">AI 设置</Link>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-6 py-8">
        <Routes>
          <Route path="/" element={<DiaryPage />} />
          <Route path="/history" element={<DiaryHistoryPage />} />
          <Route path="/diary/:id" element={<DiaryDetailPage />} />
          <Route path="/settings" element={<AiSettingsPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <MainLayout />
    </BrowserRouter>
  );
}
