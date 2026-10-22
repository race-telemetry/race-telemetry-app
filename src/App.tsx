import type { ReactNode } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'

import { Layout } from './components/Layout'
import { Spinner } from './components/ui'
import Feed from './pages/Feed'
import Landing from './pages/Landing'
import Login from './pages/Login'
import NotFound from './pages/NotFound'
import PersonalBests from './pages/PersonalBests'
import Profile from './pages/Profile'
import RaceDetail from './pages/RaceDetail'
import Register from './pages/Register'
import Settings from './pages/Settings'
import { useAuth } from './state/auth'

/** Halaman yang butuh login (mis. Setelan). */
function RequireAuth({ children }: { children: ReactNode }) {
  const { ready, user } = useAuth()
  const location = useLocation()

  if (!ready) {
    return (
      <div className="flex justify-center py-20">
        <Spinner className="h-6 w-6" />
      </div>
    )
  }
  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }
  return <>{children}</>
}

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/feed" element={<Feed />} />
        {/* Halaman Balapan dihapus — akses sesi lewat Timeline/Profil. */}
        <Route path="/races" element={<Navigate to="/feed" replace />} />
        <Route
          path="/races/:id"
          element={
            <RequireAuth>
              <RaceDetail />
            </RequireAuth>
          }
        />
        <Route
          path="/pb"
          element={
            <RequireAuth>
              <PersonalBests />
            </RequireAuth>
          }
        />
        {/* Timeline & profil publik: bisa dibuka siapa saja yang punya link. */}
        <Route path="/u/:id" element={<Profile />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/settings"
          element={
            <RequireAuth>
              <Settings />
            </RequireAuth>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  )
}
