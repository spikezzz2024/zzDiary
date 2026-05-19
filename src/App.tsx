import { BrowserRouter, Routes, Route } from 'react-router'

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 text-gray-900">
        <header className="border-b bg-white px-6 py-4">
          <h1 className="text-xl font-semibold tracking-tight">zzDiary</h1>
        </header>
        <main className="mx-auto max-w-4xl px-6 py-8">
          <Routes>
            <Route path="/" element={
              <div className="flex flex-col items-center justify-center gap-4 py-20">
                <h2 className="text-2xl font-medium">欢迎使用 zzDiary</h2>
                <p className="text-gray-500">你的正念日记伴侣</p>
              </div>
            } />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
