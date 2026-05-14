import { create } from 'zustand'

const useAppStore = create((set) => ({
  accessToken: localStorage.getItem('spotify_access_token') || null,
  user: null,
  selectedPlaylists: [],
  activeMode: null,
  timeRange: 'medium_term',
  isLoading: false,
  error: null,

  setAccessToken: (token) => {
    if (token) localStorage.setItem('spotify_access_token', token)
    else localStorage.removeItem('spotify_access_token')
    set({ accessToken: token })
  },
  setUser: (user) => set({ user }),
  setActiveMode: (mode) => set({ activeMode: mode }),
  setTimeRange: (range) => set({ timeRange: range }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  addPlaylist: (playlist) =>
    set((state) => {
      if (state.selectedPlaylists.length >= 3) return state
      if (state.selectedPlaylists.find((p) => p.id === playlist.id)) return state
      return { selectedPlaylists: [...state.selectedPlaylists, playlist] }
    }),
  removePlaylist: (id) =>
    set((state) => ({
      selectedPlaylists: state.selectedPlaylists.filter((p) => p.id !== id),
    })),
  clearPlaylists: () => set({ selectedPlaylists: [] }),
  logout: () => {
    localStorage.removeItem('spotify_access_token')
    localStorage.removeItem('spotify_refresh_token')
    set({ accessToken: null, user: null, selectedPlaylists: [], activeMode: null })
  },
}))

export default useAppStore