import { useNavigate } from 'react-router-dom'
import { useSpotify } from '../hooks/useSpotify'
import useAppStore from '../store/useAppStore'
import './HomePage.css'

const FEATURES = [
  {
    icon: '⚡',
    title: 'Top Tracks Analysis',
    desc: 'See what you have been listening to over the past 4 weeks, 6 months, or all time.',
  },
  {
    icon: '🎵',
    title: 'Playlist Insights',
    desc: 'Load any playlist you created or saved and break down its audio DNA.',
  },
  {
    icon: '📊',
    title: 'Compare & Contrast',
    desc: 'Stack up to 3 playlists side by side and see how they differ.',
  },
]

const HomePage = () => {
  const { login } = useSpotify()

  return (
    <div className="home-page">
      <div className="home-glow" />
      <div className="home-grain" />

      <section className="home-hero">
        <div className="home-hero-eyebrow">Spotify Playlist Analyzer</div>
        <h1 className="home-hero-title">
          <span className="home-hero-title-line">ANALYZE</span>
          <span className="home-hero-title-line accent">YOUR</span>
          <span className="home-hero-title-line">SOUND</span>
        </h1>
        <p className="home-hero-sub">
          Discover the audio fingerprint of your music taste.<br />
          Energy, mood, danceability — all laid bare.
        </p>
        <button className="home-login-btn" onClick={login}>
          <svg className="home-login-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
          </svg>
          Login with Spotify
        </button>
        <p className="home-login-note">Free & Premium accounts supported</p>
      </section>

      <section className="home-features">
        <div className="home-features-label">What you get</div>
        <div className="home-features-grid">
          {FEATURES.map((f, i) => (
            <div className="home-feature-card" key={i}>
              <div className="home-feature-icon">{f.icon}</div>
              <h3 className="home-feature-title">{f.title}</h3>
              <p className="home-feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="home-footer">
        Not affiliated with Spotify AB. Built for personal use.
      </footer>
    </div>
  )
}

export default HomePage