import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAppStore from '../store/useAppStore'
import { usePlaylistAnalysis } from '../hooks/usePlaylistAnalysis'
import InfoCard from '../components/playlist/InfoCard'
import './AnalyzePage.css'
import { useRef } from 'react'

const TIME_RANGES = [
  { value: 'short_term',  label: '4 Weeks' },
  { value: 'medium_term', label: '6 Months' },
  { value: 'long_term',   label: 'All Time' },
]

const AnalyzePage = () => {
  const { accessToken } = useAppStore()
  const navigate = useNavigate()
  const {
    isLoading,
    error,
    userPlaylists,
    fetchUserPlaylists,
    analyzePlaylist,
    analyzeTopTracks,
  } = usePlaylistAnalysis()

  // Selection state
  const [selectedTopTracks, setSelectedTopTracks] = useState([]) // array of time_range strings
  const [selectedPlaylists, setSelectedPlaylists]   = useState([]) // array of playlist objects
  const [showPlaylistPicker, setShowPlaylistPicker] = useState(false)

  // Results state
  const [results, setResults]       = useState([])   // array of analyzed items
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const totalSelected = selectedTopTracks.length + selectedPlaylists.length

  useEffect(() => {
    if (!accessToken) navigate('/')
  }, [accessToken])

  useEffect(() => {
    if (showPlaylistPicker && userPlaylists.length === 0) {
      fetchUserPlaylists()
    }
  }, [showPlaylistPicker])

  // Toggle top track time range
  const toggleTopTrack = (value) => {
    setSelectedTopTracks((prev) => {
      const exists = prev.includes(value)
      if (exists) return prev.filter((v) => v !== value)
      if (totalSelected >= 3) return prev
      return [...prev, value]
    })
  }

  // Toggle playlist selection
  const togglePlaylist = (playlist) => {
    setSelectedPlaylists((prev) => {
      const exists = prev.find((p) => p.id === playlist.id)
      if (exists) return prev.filter((p) => p.id !== playlist.id)
      if (totalSelected >= 3) return prev
      return [...prev, playlist]
    })
  }

  const isTopTrackSelected  = (value) => selectedTopTracks.includes(value)
  const isPlaylistSelected  = (p)     => selectedPlaylists.some((s) => s.id === p.id)
  const isAnalyzingRef = useRef(false)

  // Run analysis
  const handleAnalyze = async () => {
    // Edge case #5 — prevent double click
    if (isAnalyzingRef.current) return
    isAnalyzingRef.current = true
    setIsAnalyzing(true)

    const analysisResults = []
    const failedPlaylists = []

    try {
      for (const timeRange of selectedTopTracks) {
        const data = await analyzeTopTracks(timeRange)
        if (data) {
          analysisResults.push({
            id:        `top_${timeRange}`,
            type:      'top_tracks',
            timeRange,
            label:     TIME_RANGES.find((t) => t.value === timeRange)?.label,
            ...data,
          })
        }
      }

      for (const playlist of selectedPlaylists) {
        const data = await analyzePlaylist(playlist.id)
        if (data) {
          analysisResults.push({
            id:    `playlist_${playlist.id}`,
            type:  'playlist',
            label: playlist.name,
            ...data,
          })
        } else {
          failedPlaylists.push(playlist.name)
        }
      }

      if (failedPlaylists.length > 0) {
        alert(`Could not access: ${failedPlaylists.join(', ')}. Try a different playlist.`)
      }

      setResults(analysisResults)
      setShowPlaylistPicker(false)

      if (analysisResults.length === 0) {
        // Edge case #6 — semua gagal
        setAnalyzeError(
          failedPlaylists.length > 0
            ? `Could not access: ${failedPlaylists.join(', ')}. Try a different playlist.`
            : 'Analysis failed. Please try again.'
        )
      } else {
        setAnalyzeError(null)
        if (failedPlaylists.length > 0) {
          alert(`Some playlists could not be accessed: ${failedPlaylists.join(', ')}`)
        }
        setResults(analysisResults)
        setShowPlaylistPicker(false)
      }
    } finally {
      // Edge case #5 — reset flag setelah selesai
      isAnalyzingRef.current = false
      setIsAnalyzing(false)
    }
  }
  // Add more (from results view)
  const handleAddMore = () => {
    setShowPlaylistPicker(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Remove a result card
  const handleRemove = (id) => {
    setResults((prev) => prev.filter((r) => r.id !== id))
    // Also deselect
    if (id.startsWith('top_')) {
      const range = id.replace('top_', '')
      setSelectedTopTracks((prev) => prev.filter((v) => v !== range))
    } else {
      const pid = id.replace('playlist_', '')
      setSelectedPlaylists((prev) => prev.filter((p) => p.id !== pid))
    }
  }

  const canAnalyze = totalSelected > 0
  const hasResults = results.length > 0

  const [analyzeError, setAnalyzeError] = useState(null)

  return (
    <div className="analyze-page">

      {/* ── HEADER ── */}
      <div className="analyze-header">
        <h1 className="analyze-title">Analyze</h1>
        <p className="analyze-sub">
          Mix and match — pick top tracks by time range and/or your playlists. Up to 3 total.
        </p>
      </div>

      {/* ── SELECTOR ── */}
      {(!hasResults || showPlaylistPicker) && (
        <div className="analyze-selector">

          {/* Slot counter */}
          <div className="analyze-slot-bar">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`analyze-slot ${i < totalSelected ? 'filled' : ''}`}
              />
            ))}
            <span className="analyze-slot-label">{totalSelected} / 3 selected</span>
          </div>

          {/* Top Tracks */}
          <div className="analyze-group">
            <div className="analyze-group-title">🎧 My Top Tracks</div>
            <div className="analyze-chips">
              {TIME_RANGES.map((t) => (
                <button
                  key={t.value}
                  className={`analyze-chip ${isTopTrackSelected(t.value) ? 'active' : ''} ${totalSelected >= 3 && !isTopTrackSelected(t.value) ? 'dimmed' : ''}`}
                  onClick={() => toggleTopTrack(t.value)}
                >
                  {isTopTrackSelected(t.value) && <span className="analyze-chip-check">✓</span>}
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* My Playlists toggle */}
          <div className="analyze-group">
            <div className="analyze-group-title">📂 My Playlists</div>
            <button
              className="analyze-playlist-toggle"
              onClick={() => setShowPlaylistPicker((v) => !v)}
              disabled={totalSelected >= 3 && selectedPlaylists.length === 0}
            >
              {showPlaylistPicker ? 'Hide playlists ↑' : 'Browse playlists ↓'}
            </button>

            {showPlaylistPicker && (
              <div className="analyze-section">
                {isLoading && (
                  <div className="analyze-loading">
                    <div className="analyze-spinner" />
                    <span>Loading playlists…</span>
                  </div>
                )}
                {error && <p className="analyze-error">{error}</p>}
                {!isLoading && (
                  <div className="analyze-playlist-grid">
                    {userPlaylists.map((playlist) => (
                      <button
                        key={playlist.id}
                        className={`analyze-playlist-card
                          ${isPlaylistSelected(playlist) ? 'selected' : ''}
                          ${totalSelected >= 3 && !isPlaylistSelected(playlist) ? 'disabled' : ''}
                        `}
                        onClick={() => togglePlaylist(playlist)}
                      >
                        <div className="analyze-playlist-cover">
                          {playlist.images?.[0] ? (
                            <img src={playlist.images[0].url} alt={playlist.name} />
                          ) : (
                            <div className="analyze-playlist-cover-placeholder">🎵</div>
                          )}
                          {isPlaylistSelected(playlist) && (
                            <div className="analyze-playlist-check">✓</div>
                          )}
                        </div>
                        <div className="analyze-playlist-info">
                          <span className="analyze-playlist-name">{playlist.name}</span>
                          <span className="analyze-playlist-tracks">
                            {playlist.tracks?.total ?? 0} tracks
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Analyze button */}
          <div className="analyze-cta">
            <button
              className={`analyze-btn ${!canAnalyze || isAnalyzing ? 'disabled' : ''}`}
              onClick={handleAnalyze}
              disabled={!canAnalyze || isAnalyzing}
            >
              {isAnalyzing
                ? <><span className="analyze-btn-spinner" /> Analyzing…</>
                : 'Analyze →'
              }
            </button>
          </div>

        </div>
      )}

      {/* ── Analyze Error ── */}
      {analyzeError && (
        <div className="analyze-error-banner">
          <span>⚠️ {analyzeError}</span>
          <button onClick={() => setAnalyzeError(null)}>✕</button>
        </div>
      )}
      
      {/* ── RESULTS ── */}
      {hasResults && !showPlaylistPicker && (
        <div className="analyze-results">
          <div className="analyze-results-header">
            <h2 className="analyze-results-title">Results</h2>
            {results.length < 3 && (
              <button className="analyze-add-btn" onClick={handleAddMore}>
                + Add more
              </button>
            )}
          </div>

          <div className="analyze-cards-row">
            {results.map((result) => (
              <InfoCard
                key={result.id}
                result={result}
                onRemove={() => handleRemove(result.id)}
              />
            ))}
          </div>
        </div>
      )}

    </div>
  )
}

export default AnalyzePage