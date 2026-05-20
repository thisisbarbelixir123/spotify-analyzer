import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { spotifyApi } from '../services/spotifyApi'
import useAppStore from '../store/useAppStore'

const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID
const REDIRECT_URI = import.meta.env.VITE_REDIRECT_URI

const SCOPES = [
  'user-read-private',
  'user-read-email',
  'user-top-read',
  'playlist-read-private',
  'playlist-read-collaborative',
  'playlist-modify-public',
].join(' ')

function generateRandomString(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const array = new Uint8Array(length)
  crypto.getRandomValues(array)
  return Array.from(array, (b) => chars[b % chars.length]).join('')
}

async function sha256(plain) {
  const data = new TextEncoder().encode(plain)
  return crypto.subtle.digest('SHA-256', data)
}

function base64urlencode(buffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

export function useSpotify() {
  const { setAccessToken, setUser, logout } = useAppStore()
  const navigate = useNavigate()

  const login = useCallback(async () => {
    const codeVerifier = generateRandomString(128)
    const hashed = await sha256(codeVerifier)
    const codeChallenge = base64urlencode(hashed)

    localStorage.setItem('pkce_code_verifier', codeVerifier)

    const params = new URLSearchParams({
      client_id: CLIENT_ID,
      response_type: 'code',
      redirect_uri: REDIRECT_URI,
      scope: SCOPES,
      code_challenge_method: 'S256',
      code_challenge: codeChallenge,
    })

    window.location.href = `https://accounts.spotify.com/authorize?${params}`
  }, [])

  const exchangeToken = useCallback(async (code) => {
    const codeVerifier = localStorage.getItem('pkce_code_verifier')
    if (!codeVerifier) throw new Error('No code verifier found')

    // Exchange directly with Spotify — no server needed
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: REDIRECT_URI,
      client_id: CLIENT_ID,
      code_verifier: codeVerifier,
    })

    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params,
    })

    if (!response.ok) throw new Error('Token exchange failed')

    const data = await response.json()
    setAccessToken(data.access_token)
    if (data.refresh_token) {
      localStorage.setItem('spotify_refresh_token', data.refresh_token)
    }
    localStorage.removeItem('pkce_code_verifier')

    const userRes = await spotifyApi.getMe()
    setUser(userRes.data)

    navigate('/analyze')
  }, [setAccessToken, setUser, navigate])

  return { login, exchangeToken, logout }
}

export default useSpotify