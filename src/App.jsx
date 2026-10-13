import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import PortfolioPage from './pages/PortfolioPage.jsx'
import AdminLayout from './layouts/AdminLayout.jsx'
import PublicLayout from './layouts/PublicLayout.jsx'
import AdminPasskeyGate from './components/AdminPasskeyGate.jsx'
import LoginPage from './pages/LoginPage.jsx'
import SignupPage from './pages/SignupPage.jsx'
import AdminChoicePage from './pages/AdminChoicePage.jsx'

const AdminPage = lazy(() => import('./pages/AdminPage.jsx'))

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/admin-choice" element={<AdminChoicePage />} />
      <Route element={<PublicLayout />}>
        <Route index element={<PortfolioPage />} />
      </Route>
      <Route element={<AdminPasskeyGate />}>
        <Route element={<AdminLayout />}>
          <Route
            path="/admin"
            element={
              <Suspense fallback={<div className="py-24 text-center text-sm text-white/50">Loading studio dashboard…</div>}>
                <AdminPage />
              </Suspense>
            }
          />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
