import { useState, useCallback } from 'react'
import { spotifyApi } from '../services/spotifyApi'
import useAppStore from '../store/useAppStore'

export function useSavePlaylist() {
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState(null) // 'success' | 'error' | null
  const [savedUrl, setSavedUrl] = useState(null)
  const { user } = useAppStore()

  const saveToSpotify = useCallback(async (tracks, playlistName) => {
    if (!user?.id) {
      setSaveStatus('error')
      return
    }

    setIsSaving(true)
    setSaveStatus(null)
    setSavedUrl(null)

    try {
      // 1. Create playlist
      const createRes = await spotifyApi.createPlaylist(
        user.id,
        playlistName,
        true
      )
      const playlistId  = createRes.data.id
      const playlistUrl = createRes.data.external_urls?.spotify

      // 2. Add tracks (filter out local files, get URIs)
      const trackUris = tracks
        .filter((t) => t && !t.is_local && t.uri)
        .map((t) => t.uri)

      if (trackUris.length > 0) {
        await spotifyApi.addTracksToPlaylist(playlistId, trackUris)
      }

      setSavedUrl(playlistUrl)
      setSaveStatus('success')

      // Auto-clear success after 5 seconds
      setTimeout(() => setSaveStatus(null), 5000)

    } catch (err) {
      console.error('Save playlist error:', err)
      setSaveStatus('error')
      setTimeout(() => setSaveStatus(null), 4000)
    } finally {
      setIsSaving(false)
    }
  }, [user])

  return { isSaving, saveStatus, savedUrl, saveToSpotify }
}