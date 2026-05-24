import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router';
import AiSettingsPage from './features/settings/AiSettingsPage';
import DiaryPage from './features/diary/DiaryPage';
import DiaryHistoryPage from './features/diary/DiaryHistoryPage';
import DiaryDetailPage from './features/diary/DiaryDetailPage';
import EmotionDashboard from './features/emotion/EmotionDashboard';
import FamilyPage from './features/family/FamilyPage';

const NAV_LINK = 'text-sm transition-colors cursor-pointer';
const NAV_ACTIVE = 'font-medium';

function MainLayout() {
  const location = useLocation();
  const path = location.pathname;

  function linkClass(href: string) {
    return `${NAV_LINK} ${path === href ? NAV_ACTIVE : 'opacity-60 hover:opacity-100'}`;
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f5f0e8' }}>
      {/* Header */}
      <header
        className="border-b px-6 py-2.5 flex items-center justify-between shrink-0"
        style={{ backgroundColor: '#faf7f2', borderColor: '#e0d8c8' }}
      >
        <div className="flex items-center gap-6">
          <Link to="/" className="text-base font-semibold tracking-tight no-underline"
            style={{ color: '#5c4a2e' }}>
            zzDiary
          </Link>
          <nav className="flex items-center gap-5">
            <Link to="/" className={linkClass('/')} style={{ color: '#5c4a2e' }}>
              书写
            </Link>
            <Link to="/history" className={linkClass('/history')} style={{ color: '#5c4a2e' }}>
              日记本
            </Link>
            <Link to="/family" className={linkClass('/family')} style={{ color: '#5c4a2e' }}>
              家庭
            </Link>
            <Link to="/emotion" className={linkClass('/emotion')} style={{ color: '#5c4a2e' }}>
              情绪
            </Link>
            <Link to="/settings" className={linkClass('/settings')} style={{ color: '#5c4a2e' }}>
              设置
            </Link>
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-[1280px] px-6 py-4">
        <Routes>
          <Route path="/" element={<DiaryPage />} />
          <Route path="/history" element={<DiaryHistoryPage />} />
          <Route path="/diary/:id" element={<DiaryDetailPage />} />
          <Route path="/family" element={<FamilyPage />} />
          <Route path="/emotion" element={<EmotionDashboard />} />
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
