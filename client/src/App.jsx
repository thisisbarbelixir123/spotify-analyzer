import React, { useEffect } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import HomePage from './pages/HomePage'
import CallbackPage from './pages/CallbackPage'
import AnalyzePage from './pages/AnalyzePage'
import Navbar from './components/layout/Navbar'
import useAppStore from './store/useAppStore'
import { spotifyApi } from './services/spotifyApi'

function ProtectedRoute({ children }) {
  const { accessToken } = useAppStore()
  if (!accessToken) return <Navigate to="/" replace />
  return children
}

function TokenWatcher() {
  const { accessToken, logout } = useAppStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (!accessToken) return

    // Cek token setiap 30 detik
    const interval = setInterval(() => {
      const token = localStorage.getItem('spotify_access_token')
      if (!token) {
        logout()
        navigate('/', { replace: true })
      }
    }, 30000)

    // Cek saat tab kembali aktif setelah lama ditutup
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const token = localStorage.getItem('spotify_access_token')
        if (!token) {
          logout()
          navigate('/', { replace: true })
        } else {
          // Verifikasi token masih valid dengan ping ke Spotify
          spotifyApi.getMe().catch(() => {
            logout()
            navigate('/', { replace: true })
          })
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [accessToken])

  return null
}

function App() {
  const { accessToken, user, setUser, logout } = useAppStore()

  // Restore user profile on refresh if token exists but user is null
  useEffect(() => {
    if (accessToken && !user) {
      spotifyApi.getMe()
        .then((res) => setUser(res.data))
        .catch(() => {
          // Token invalid atau expired — logout
          logout()
        })
    }

    // Kalau tidak ada token sama sekali, pastikan state bersih
    if (!accessToken) {
      logout()
    }
  }, [accessToken])

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#121212', color: 'white' }}>
      <Navbar />
      <TokenWatcher />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/callback" element={<CallbackPage />} />
        <Route path="/analyze" element={
          <ProtectedRoute>
            <AnalyzePage />
          </ProtectedRoute>
        } />
      </Routes>
    </div>
  )
}

export default App