import { useState, useCallback } from 'react'
import { spotifyApi } from '../services/spotifyApi'
import useAppStore from '../store/useAppStore'

export function useSavePlaylist() {
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState(null)
  const [savedUrl, setSavedUrl] = useState(null)
  const { user } = useAppStore()

  const saveToSpotify = useCallback(async (tracks, playlistName) => {
    // ── Debug logs ──
    console.log('user:', user)
    console.log('user.id:', user?.id)
    console.log('tracks count:', tracks?.length)
    console.log('playlistName:', playlistName)

    if (!user?.id) {
      console.log('ERROR: no user id')
      setSaveStatus('error')
      return
    }

    setIsSaving(true)
    setSaveStatus(null)
    setSavedUrl(null)

    try {
      console.log('Creating playlist...')
      const createRes = await spotifyApi.createPlaylist(user.id, playlistName, true)
      console.log('createPlaylist response:', createRes.data)

      const playlistId  = createRes.data.id
      const playlistUrl = createRes.data.external_urls?.spotify

      const trackUris = tracks
        .filter((t) => t && !t.is_local && t.uri)
        .map((t) => t.uri)

      console.log('trackUris count:', trackUris.length)
      console.log('trackUris sample:', trackUris.slice(0, 3))

      if (trackUris.length > 0) {
        console.log('Adding tracks...')
        await spotifyApi.addTracksToPlaylist(playlistId, trackUris)
        console.log('Tracks added!')
      }

      setSavedUrl(playlistUrl)
      setSaveStatus('success')
      setTimeout(() => setSaveStatus(null), 5000)

    } catch (err) {
      console.error('Save playlist error:', err)
      console.error('Error response:', err.response?.data)
      console.error('Error status:', err.response?.status)
      setSaveStatus('error')
      setTimeout(() => setSaveStatus(null), 4000)
    } finally {
      setIsSaving(false)
    }
  }, [user])

  return { isSaving, saveStatus, savedUrl, saveToSpotify }
}