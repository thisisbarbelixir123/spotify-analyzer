import axios from 'axios'

const spotify = axios.create({ baseURL: 'https://api.spotify.com/v1' })

// Flag untuk hindari multiple refresh sekaligus
let isRefreshing = false
let refreshQueue = []

function processQueue(error, token = null) {
  refreshQueue.forEach((prom) => {
    if (error) prom.reject(error)
    else prom.resolve(token)
  })
  refreshQueue = []
}

async function refreshAccessToken() {
  const refreshToken = localStorage.getItem('spotify_refresh_token')
  if (!refreshToken) throw new Error('No refresh token')

  const params = new URLSearchParams({
    grant_type:    'refresh_token',
    refresh_token: refreshToken,
    client_id:     import.meta.env.VITE_SPOTIFY_CLIENT_ID,
  })

  const res = await fetch('https://accounts.spotify.com/api/token', {
    method:  'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body:    params,
  })

  if (!res.ok) throw new Error('Token refresh failed')

  const data = await res.json()
  localStorage.setItem('spotify_access_token', data.access_token)
  if (data.refresh_token) {
    localStorage.setItem('spotify_refresh_token', data.refresh_token)
  }
  return data.access_token
}

// Inject token into every request
spotify.interceptors.request.use((config) => {
  const token = localStorage.getItem('spotify_access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Handle 401 — try refresh, then retry original request
spotify.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config

    if (err.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue requests while refreshing
        return new Promise((resolve, reject) => {
          refreshQueue.push({ resolve, reject })
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return spotify(originalRequest)
        }).catch((e) => Promise.reject(e))
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const newToken = await refreshAccessToken()
        processQueue(null, newToken)
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return spotify(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError)
        // Refresh failed — logout
        localStorage.removeItem('spotify_access_token')
        localStorage.removeItem('spotify_refresh_token')
        window.location.href = '/'
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(err)
  }
)

export const spotifyApi = {
  getMe: () => spotify.get('/me'),

  getTopTracks: (timeRange = 'medium_term', limit = 50) =>
    spotify.get('/me/top/tracks', { params: { time_range: timeRange, limit } }),

  getUserPlaylists: (limit = 50, offset = 0) =>
    spotify.get('/me/playlists', { params: { limit, offset } }),

  getPlaylistTracks: (playlistId, limit = 50) =>
    spotify.get(`/playlists/${playlistId}/items`, { params: { limit } }),

  getPlaylist: (playlistId) =>
    spotify.get(`/playlists/${playlistId}`),

  getArtists: (artistIds) =>
    spotify.get('/artists', { params: { ids: artistIds.slice(0, 50).join(',') } }),

  // Tambahkan di dalam spotifyApi object:
  getAllPlaylistTracks: async (playlistId) => {
    const limit  = 50
    let   offset = 0
    let   allItems = []
    let   total  = null

    do {
      const res = await spotify.get(`/playlists/${playlistId}/items`, {
        params: { limit, offset },
      })
      const data = res.data
      total = data.total
      allItems = [...allItems, ...data.items]
      offset += limit
    } while (allItems.length < total && allItems.length < 200) // max 200 untuk hemat quota FreqBlog

    return allItems
  },

  // Create a new playlist
  createPlaylist: (userId, name, isPublic = true) =>
    spotify.post(`/me/playlists`, {
      name,
      public: isPublic,
      description: 'Created by Spotify Analyzer',
    }),

  // Add tracks to playlist (max 100 per request)
  addTracksToPlaylist: (playlistId, trackUris) =>
    spotify.post(`/playlists/${playlistId}/items`, {
      uris: trackUris.slice(0, 100),
    }),
}

//test

export default spotifyApi