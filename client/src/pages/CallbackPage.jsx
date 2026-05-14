import React, { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSpotify } from '../hooks/useSpotify'

const CallbackPage = () => {
  const { exchangeToken } = useSpotify()
  const navigate = useNavigate()
  const called = useRef(false)

  useEffect(() => {
    if (called.current) return
    called.current = true

    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')
    const error = params.get('error')

    console.log('CODE:', code)
    console.log('ERROR:', error)

    if (error || !code) {
      navigate('/')
      return
    }

    exchangeToken(code)
      .then(() => console.log('Token exchange SUCCESS'))
      .catch((err) => console.error('Token exchange FAILED:', err))
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: '16px' }}>
      <div style={{ width: '40px', height: '40px', border: '4px solid #1DB954', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <p style={{ color: '#B3B3B3' }}>Logging you in…</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}

export default CallbackPage