import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useSpotify } from '../../hooks/useSpotify'
import useAppStore from '../../store/useAppStore'
import './Navbar.css'

const Navbar = () => {
  const { login, logout } = useSpotify()
  const { user, accessToken } = useAppStore()
  const location = useLocation()
  const navigate = useNavigate()

  const isHomePage = location.pathname === '/'

  return (
    <nav className="navbar">
      <span
        className="navbar-logo"
        onClick={() => navigate('/')}
        style={{ cursor: 'pointer' }}
      >
        Spotify Analyzer
      </span>

      {/* Belum login — tampilkan Login di semua halaman */}
      {!accessToken && (
        <button className="navbar-btn-login" onClick={login}>
          Login with Spotify
        </button>
      )}

      {/* Sudah login di homepage — tampilkan Go to Analyze */}
      {accessToken && isHomePage && (
        <button className="navbar-btn-login" onClick={() => navigate('/analyze')}>
          Go to Analyze →
        </button>
      )}

      {/* Sudah login di halaman lain — tampilkan nama + logout */}
      {accessToken && !isHomePage && (
        <div className="navbar-right">
          {user && <span className="navbar-user">{user.display_name}</span>}
          <button className="navbar-btn-ghost" onClick={logout}>Logout</button>
        </div>
      )}
    </nav>
  )
}

export default Navbar