import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router';
import ThemeProvider from './features/theme/ThemeProvider';
import ThemeToggle from './features/theme/ThemeToggle';
import AiSettingsPage from './features/settings/AiSettingsPage';
import DiaryPage from './features/diary/DiaryPage';
import DiaryHistoryPage from './features/diary/DiaryHistoryPage';
import DiaryDetailPage from './features/diary/DiaryDetailPage';
import EmotionDashboard from './features/emotion/EmotionDashboard';
import MindfulnessPage from './features/mindfulness/MindfulnessPage';
import FamilyPage from './features/family/FamilyPage';
import StatsPage from './features/stats/StatsPage';

const NAV_LINK = 'text-sm transition-colors cursor-pointer';
const NAV_ACTIVE = 'font-medium';

function MainLayout() {
  const location = useLocation();
  const path = location.pathname;

  function linkClass(href: string) {
    return `${NAV_LINK} ${path === href ? NAV_ACTIVE : 'opacity-60 hover:opacity-100'}`;
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--app-bg)' }}>
      {/* Header */}
      <header
        className="border-b px-6 py-2.5 flex items-center justify-between shrink-0"
        style={{ backgroundColor: 'var(--app-surface)', borderColor: 'var(--app-border)' }}
      >
        <div className="flex items-center gap-6">
          <Link to="/" className="text-base font-semibold tracking-tight no-underline"
            style={{ color: 'var(--app-text)' }}>
            zzDiary
          </Link>
          <nav className="flex items-center gap-5">
            <Link to="/" className={linkClass('/')} style={{ color: 'var(--app-text)' }}>
              书写
            </Link>
            <Link to="/history" className={linkClass('/history')} style={{ color: 'var(--app-text)' }}>
              日记本
            </Link>
            <Link to="/family" className={linkClass('/family')} style={{ color: 'var(--app-text)' }}>
              家庭
            </Link>
            <Link to="/emotion" className={linkClass('/emotion')} style={{ color: 'var(--app-text)' }}>
              情绪
            </Link>
            <Link to="/mindfulness" className={linkClass('/mindfulness')} style={{ color: 'var(--app-text)' }}>
              正念
            </Link>
            <Link to="/settings" className={linkClass('/settings')} style={{ color: 'var(--app-text)' }}>
              设置
            </Link>
            <Link to="/stats" className={linkClass('/stats')} style={{ color: 'var(--app-text)' }}>
              统计
            </Link>
          </nav>
        </div>
        <ThemeToggle />
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-[1280px] px-6 py-4">
        <Routes>
          <Route path="/" element={<DiaryPage />} />
          <Route path="/history" element={<DiaryHistoryPage />} />
          <Route path="/diary/:id" element={<DiaryDetailPage />} />
          <Route path="/family" element={<FamilyPage />} />
          <Route path="/emotion" element={<EmotionDashboard />} />
          <Route path="/mindfulness" element={<MindfulnessPage />} />
          <Route path="/settings" element={<AiSettingsPage />} />
          <Route path="/stats" element={<StatsPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App(): React.ReactElement {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <MainLayout />
      </ThemeProvider>
    </BrowserRouter>
  );
}
