import React, { useState } from 'react'
import { formatDuration } from '../../hooks/usePlaylistAnalysis'
import TopListModal from '../modals/TopListModal'
import AudioDetailModal from '../modals/AudioDetailModal'
import { useSavePlaylist } from '../../hooks/useSavePlaylist'
import './InfoCard.css'

const MAIN_FEATURES = [
  { key: 'energy',       label: 'Energy',       emoji: '⚡', color: '#FF6B35' },
  { key: 'danceability', label: 'Danceability',  emoji: '🕺', color: '#1DB954' },
  { key: 'valence',      label: 'Positive Mood', emoji: '😊', color: '#FFD93D' },
]

const MORE_FEATURES = [
  { key: 'acousticness',     label: 'Acoustic',      emoji: '🎸', color: '#A8D8EA' },
  { key: 'instrumentalness', label: 'Instrumental',  emoji: '🎹', color: '#C77DFF' },
  { key: 'speechiness',      label: 'Vocal',         emoji: '🎤', color: '#FF8FAB' },
  { key: 'liveness',         label: 'Live Feel',     emoji: '🎪', color: '#00B4D8' },
]

const MOOD_EMOJI = {
  happy:       '😄',
  calm:        '😌',
  sad:         '😢',
  tense:       '😬',
  energetic:   '⚡',
  melancholic: '🌧️',
  neutral:     '😐',
}

const InfoCard = ({ result, onRemove }) => {
  const [showMore,     setShowMore]     = useState(false)
  const [topListModal, setTopListModal] = useState(null)
  const [audioModal,   setAudioModal]   = useState(null)

  const { isSaving, saveStatus, savedUrl, saveToSpotify } = useSavePlaylist()

  const {
    averages, tracks, audioFeatures,
    topArtists, topGenres,
    totalDuration, spotifyUrl,
    type, label, timeRange,
  } = result

  const isTopTracks = type === 'top_tracks'

  const TIME_LABEL = {
    short_term:  '4 Weeks',
    medium_term: '6 Months',
    long_term:   'All Time',
  }

  const cardTitle = isTopTracks
    ? `Top Tracks — ${TIME_LABEL[timeRange]}`
    : label

  // Coverage info
  const coverage = averages?._coverage ?? 0
  const total    = averages?._total    ?? 0

  return (
    <div className="infocard">

      {/* ── Header ── */}
      <div className="infocard-header">
        <div className="infocard-header-left">
          <span className="infocard-badge">
            {isTopTracks ? '🎧 Top Tracks' : '📂 Playlist'}
          </span>
          <h2 className="infocard-title">{cardTitle}</h2>
        </div>
        {onRemove && (
          <button className="infocard-remove" onClick={onRemove}>✕</button>
        )}
      </div>

      {/* ── Stats ── */}
      <div className="infocard-stats">
        <span>🎵 {tracks?.length ?? 0} tracks</span>
        <span className="infocard-dot">·</span>
        <span>⏱ {formatDuration(totalDuration ?? 0)}</span>
        {coverage < (result.totalTracks ?? tracks?.length ?? 0) && (
          <>
            <span className="infocard-dot">·</span>
            <span className="infocard-coverage">
              {coverage}/{result.totalTracks ?? tracks?.length} analyzed
              {result.totalTracks > 50 && ' (first 50)'}
            </span>
          </>
        )}
      </div>

      <div className="infocard-divider" />

      {/* ── Top Artist ── */}
      <div className="infocard-row">
        <span className="infocard-row-label">Top Artist</span>
        <button
          className="infocard-row-value clickable"
          onClick={() => setTopListModal({
            title: 'Top Artists',
            items: (topArtists ?? []).slice(0, 10).map((a) => ({
              name: a.name,
              sub: `${a.count} track${a.count > 1 ? 's' : ''}`,
            })),
          })}
        >
          {topArtists?.[0]?.name ?? '—'}
          <span className="infocard-see-more">Top 10 →</span>
        </button>
      </div>

      {/* ── Top Genre ── */}
      <div className="infocard-row">
        <span className="infocard-row-label">Top Genre</span>
        <button
          className="infocard-row-value clickable"
          onClick={() => setTopListModal({
            title: 'Top Genres',
            items: (topGenres ?? []).slice(0, 10).map((g) => ({
              name: g.genre,
              sub: `${g.count} track${g.count > 1 ? 's' : ''}`,
            })),
          })}
        >
          {topGenres?.[0]?.genre ?? averages?.genre ?? '—'}
          <span className="infocard-see-more">Top 10 →</span>
        </button>
      </div>

      {/* ── Mood & Key ── */}
      {(averages?.mood || averages?.key) && (
        <>
          <div className="infocard-divider" />
          <div className="infocard-moodkey-row">
            {averages?.mood && (
              <div className="infocard-moodkey-item">
                <span className="infocard-row-label">Mood</span>
                <span className="infocard-moodkey-value">
                  {MOOD_EMOJI[averages.mood] ?? '🎵'} {averages.mood}
                </span>
              </div>
            )}
            {averages?.key && (
              <div className="infocard-moodkey-item">
                <span className="infocard-row-label">Key</span>
                <span className="infocard-moodkey-value">🎹 {averages.key}</span>
              </div>
            )}
          </div>
        </>
      )}

      <div className="infocard-divider" />

      {/* ── Audio Features ── */}
      <div className="infocard-features-label">Audio Features</div>

      {/* Main 3 */}
      {MAIN_FEATURES.map(({ key, label, emoji, color }) => {
        const val = averages?.[key] ?? 0
        return (
          <button
            key={key}
            className="infocard-feature"
            onClick={() => setAudioModal({ featureKey: key,})}
          >
            <div className="infocard-feature-top">
              <span className="infocard-feature-name">{emoji} {label}</span>
              <span className="infocard-feature-pct">{val != null ? `${val}%` : '—'}</span>
            </div>
            <div className="infocard-feature-bar">
              <div
                className="infocard-feature-fill"
                style={{ width: `${val ?? 0}%`, background: color }}
              />
            </div>
          </button>
        )
      })}

      {/* BPM */}
      <div className="infocard-feature infocard-feature-bpm">
        <div className="infocard-feature-top">
          <span className="infocard-feature-name">🥁 Tempo</span>
          <span className="infocard-feature-pct">
            {averages?.bpm != null ? `${averages.bpm} BPM` : '—'}
          </span>
        </div>
      </div>

      {/* See more */}
      <button
        className="infocard-seemore-btn"
        onClick={() => setShowMore((v) => !v)}
      >
        {showMore ? 'See less ↑' : 'See more ↓'}
      </button>

      {showMore && MORE_FEATURES.map(({ key, label, emoji, color }) => {
        const val = averages?.[key] ?? 0
        return (
          <button
            key={key}
            className="infocard-feature"
            onClick={() => setAudioModal({ featureKey: key, featureMeta: { label, emoji, color } })}
          >
            <div className="infocard-feature-top">
              <span className="infocard-feature-name">{emoji} {label}</span>
              <span className="infocard-feature-pct">{val != null ? `${val}%` : '—'}</span>
            </div>
            <div className="infocard-feature-bar">
              <div
                className="infocard-feature-fill"
                style={{ width: `${val ?? 0}%`, background: color }}
              />
            </div>
          </button>
        )
      })}

      <div className="infocard-divider" />

      {/* ── Disclaimer ── */}
      <p className="infocard-disclaimer">
        ⚠️ Audio features provided by FreqBlog API. Values may differ slightly from Spotify's original data.
      </p>

      {/* ── Footer ── */}
      <div className="infocard-footer">
        {spotifyUrl ? (
          
            <a className="infocard-spotify-btn"
            href={spotifyUrl}
            target="_blank"
            rel="noreferrer"
          >
            View on Spotify ↗
          </a>
        ) : (
          <div className="infocard-save-wrapper">
            <button
              className={`infocard-save-btn ${isSaving ? 'loading' : ''} ${saveStatus === 'success' ? 'success' : ''} ${saveStatus === 'error' ? 'error' : ''}`}
              onClick={() => saveToSpotify(
                tracks,
                `My Top Tracks — ${
                  { short_term: '4 Weeks', medium_term: '6 Months', long_term: 'All Time' }[timeRange]
                }`
              )}
              disabled={isSaving}
            >
              {isSaving
                ? <><span className="infocard-btn-spinner" /> Saving…</>
                : saveStatus === 'success'
                ? '✓ Saved to Spotify!'
                : saveStatus === 'error'
                ? '✕ Failed, try again'
                : '+ Save to Spotify'
              }
            </button>
            {saveStatus === 'success' && savedUrl && (
              
                <a className="infocard-saved-link"
                href={savedUrl}
                target="_blank"
                rel="noreferrer"
              >
                Open playlist ↗
              </a>
            )}
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      {topListModal && (
        <TopListModal
          title={topListModal.title}
          items={topListModal.items}
          onClose={() => setTopListModal(null)}
        />
      )}

      {audioModal && (
        <AudioDetailModal
          featureKey={audioModal.featureKey}
          tracks={tracks}
          audioFeatures={audioFeatures}
          onClose={() => setAudioModal(null)}
        />
      )}

    </div>
  )
}

export default InfoCard