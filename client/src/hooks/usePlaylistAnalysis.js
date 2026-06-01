import { useState, useCallback } from 'react'
import { spotifyApi } from '../services/spotifyApi'
import { bulkLookup, normalizeFeatures, calculateAverages } from '../services/freqblogApi'

// ── Helpers ──────────────────────────────────────────────

function extractTopArtists(tracks) {
  const counts = {}
  tracks.forEach((track) => {
    track.artists?.forEach((artist) => {
      counts[artist.id] = counts[artist.id]
        ? { ...counts[artist.id], count: counts[artist.id].count + 1 }
        : { id: artist.id, name: artist.name, count: 1 }
    })
  })
  return Object.values(counts).sort((a, b) => b.count - a.count)
}

function getTotalDuration(tracks) {
  return tracks.reduce((sum, t) => sum + (t.duration_ms || 0), 0)
}

export function formatDuration(ms) {
  const totalMin = Math.floor(ms / 60000)
  const h = Math.floor(totalMin / 60)
  const m = totalMin % 60
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

// ── Core analysis function ────────────────────────────────

async function analyzeTracks(tracks) {
  // 1. Fetch audio features from FreqBlog
  const rawFeatures  = await bulkLookup(tracks)
  const normalized   = rawFeatures.map((f) => normalizeFeatures(f))
  const averages     = calculateAverages(normalized)

  // 2. Top artists
  const topArtists = extractTopArtists(tracks)

  // 3. Top genres dari FreqBlog audio features
  const genreCounts = {}
  normalized.forEach((f) => {
    if (f?.genre) {
      genreCounts[f.genre] = (genreCounts[f.genre] || 0) + 1
    }
  })
  const topGenres = Object.entries(genreCounts)
    .sort(([, a], [, b]) => b - a)
    .map(([genre, count]) => ({ genre, count }))

  // 4. Total duration
  const totalDuration = getTotalDuration(tracks)

  return {
    tracks,
    audioFeatures: normalized,
    averages,
    topArtists,
    topGenres,
    totalDuration,
  }
}

// ── Hook ─────────────────────────────────────────────────

export function usePlaylistAnalysis() {
  const [isLoading,      setIsLoading]      = useState(false)
  const [error,          setError]          = useState(null)
  const [userPlaylists,  setUserPlaylists]  = useState([])

  const fetchUserPlaylists = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await spotifyApi.getUserPlaylists(50)
      console.log('Playlist sample:', res.data.items[0])
      setUserPlaylists(res.data.items.filter(Boolean))
    } catch {
      setError('Failed to load playlists.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const analyzePlaylist = useCallback(async (playlistId) => {
    setError(null)
    try {
      const [playlistRes, allItems] = await Promise.all([
        spotifyApi.getPlaylist(playlistId),
        spotifyApi.getAllPlaylistTracks(playlistId),
      ])

      const tracks = allItems
        .map((i) => i.item || i.track)
        .filter((t) => t && t.id && t.type === 'track')

      if (tracks.length === 0) {
        setError(`"${playlistRes.data.name}" has no playable tracks.`)
        return null
      }

      // Edge case #4 — kalau > 50 tracks, ambil max 50 untuk FreqBlog
      // tapi tetap tampilkan total tracks yang sebenarnya
      const totalTracks    = tracks.length
      const tracksForFreq  = tracks.slice(0, 50) // FreqBlog limit per bulk

      const analysis = await analyzeTracks(tracksForFreq)

      return {
        ...analysis,
        tracks,                          // semua tracks untuk display
        totalTracks,                     // total sebenarnya
        analyzedCount: tracksForFreq.length,
        playlist:   playlistRes.data,
        spotifyUrl: playlistRes.data.external_urls?.spotify,
      }
    } catch (err) {
      console.warn('analyzePlaylist error:', err)
      setError(
        err.response?.status === 403
          ? 'This playlist is restricted by Spotify.'
          : 'Failed to analyze playlist.'
      )
      return null
    }
  }, [])

  const analyzeTopTracks = useCallback(async (timeRange = 'medium_term') => {
    setError(null)
    try {
      const res    = await spotifyApi.getTopTracks(timeRange, 50)
      const tracks = res.data.items

      const analysis = await analyzeTracks(tracks)

      return {
        ...analysis,
        spotifyUrl: null,
      }
    } catch (err) {
      console.warn('analyzeTopTracks error:', err)
      setError('Failed to analyze top tracks.')
      return null
    }
  }, [])

  return {
    isLoading,
    error,
    userPlaylists,
    fetchUserPlaylists,
    analyzePlaylist,
    analyzeTopTracks,
  }
}