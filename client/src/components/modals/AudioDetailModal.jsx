import React, { useEffect, useMemo } from 'react'
import './AudioDetailModal.css'

const FEATURE_META = {
  energy:           { label: 'Energy',       emoji: '⚡', color: '#FF6B35' },
  danceability:     { label: 'Danceability',  emoji: '🕺', color: '#1DB954' },
  valence:          { label: 'Positive Mood', emoji: '😊', color: '#FFD93D' },
  acousticness:     { label: 'Acoustic',      emoji: '🎸', color: '#A8D8EA' },
  instrumentalness: { label: 'Instrumental',  emoji: '🎹', color: '#C77DFF' },
  speechiness:      { label: 'Vocal',         emoji: '🎤', color: '#FF8FAB' },
  liveness:         { label: 'Live Feel',     emoji: '🎪', color: '#00B4D8' },
}

const AudioDetailModal = ({ featureKey, tracks, audioFeatures, onClose }) => {
  const meta = FEATURE_META[featureKey] ?? {
    label: featureKey, emoji: '🎵', color: '#1DB954',
  }

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const sorted = useMemo(() => {
    if (!tracks || !audioFeatures) return []
    return tracks
      .map((track, i) => {
        const f = audioFeatures[i]
        const value = f?.[featureKey] ?? null
        return { track, value }
      })
      .filter((t) => t.value != null && t.track?.name)
      .sort((a, b) => b.value - a.value)
  }, [tracks, audioFeatures, featureKey])

  const top3    = sorted.slice(0, 3)
  const bottom3 = [...sorted].slice(-3).reverse()

  const fmt = (val) => `${Math.round(val)}%`

  const TrackRow = ({ track, value, color }) => (
    <div className="admodal-track">
      <div className="admodal-track-cover">
        {track.album?.images?.[0]?.url
          ? <img src={track.album.images[0].url} alt={track.name} />
          : <div className="admodal-track-cover-placeholder">🎵</div>
        }
      </div>
      <div className="admodal-track-info">
        <span className="admodal-track-name">{track.name}</span>
        <span className="admodal-track-artist">
          {track.artists?.map((a) => a.name).join(', ')}
        </span>
      </div>
      <span className="admodal-track-value" style={{ color }}>
        {fmt(value)}
      </span>
    </div>
  )

  return (
    <div className="admodal-overlay" onClick={onClose}>
      <div className="admodal" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="admodal-header" style={{ borderBottomColor: meta.color }}>
          <div className="admodal-header-left">
            <span className="admodal-emoji">{meta.emoji}</span>
            <div>
              <h2 className="admodal-title">{meta.label}</h2>
              <p className="admodal-subtitle">Top & bottom tracks in this playlist</p>
            </div>
          </div>
          <button className="admodal-close" onClick={onClose}>✕</button>
        </div>

        <div className="admodal-body">

          {sorted.length === 0 && (
            <p className="admodal-empty">No data available for this feature.</p>
          )}

          {/* Highest */}
          {top3.length > 0 && (
            <div className="admodal-section">
              <div className="admodal-section-label" style={{ color: meta.color }}>
                ▲ Highest
              </div>
              {top3.map(({ track, value }, i) => (
                <TrackRow key={i} track={track} value={value} color={meta.color} />
              ))}
            </div>
          )}

          {top3.length > 0 && bottom3.length > 0 && (
            <div className="admodal-divider" />
          )}

          {/* Lowest */}
          {bottom3.length > 0 && (
            <div className="admodal-section">
              <div className="admodal-section-label" style={{ color: '#888' }}>
                ▼ Lowest
              </div>
              {bottom3.map(({ track, value }, i) => (
                <TrackRow key={i} track={track} value={value} color="#888" />
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

export default AudioDetailModal