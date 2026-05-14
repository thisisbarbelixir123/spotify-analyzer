export const AUDIO_FEATURES = {
  danceability:     { label: 'Danceable',    emoji: '🕺', color: '#1DB954' },
  energy:           { label: 'Energetic',     emoji: '⚡', color: '#FF6B35' },
  valence:          { label: 'Positive Mood', emoji: '😊', color: '#FFD93D' },
  acousticness:     { label: 'Acoustic',      emoji: '🎸', color: '#A8D8EA' },
  instrumentalness: { label: 'Instrumental',  emoji: '🎹', color: '#C77DFF' },
  speechiness:      { label: 'Vocal',         emoji: '🎤', color: '#FF8FAB' },
  liveness:         { label: 'Live Feel',     emoji: '🎪', color: '#00B4D8' },
}

export function calculateAverageFeatures(featuresArray) {
  if (!featuresArray || featuresArray.length === 0) return null
  const valid = featuresArray.filter(Boolean)
  return Object.keys(AUDIO_FEATURES).reduce((acc, key) => {
    acc[key] = Math.round(valid.reduce((s, f) => s + (f[key] || 0), 0) / valid.length * 100)
    return acc
  }, {})
}

export function getTopFeatures(avg, count = 3) {
  if (!avg) return []
  return Object.entries(avg)
    .sort(([, a], [, b]) => b - a)
    .slice(0, count)
    .map(([key, value]) => ({ key, value, ...AUDIO_FEATURES[key] }))
}

export function getAllFeatures(avg) {
  if (!avg) return []
  return Object.entries(AUDIO_FEATURES).map(([key, meta]) => ({
    key, value: avg[key] || 0, ...meta,
  }))
}

export const TIME_RANGE_LABELS = {
  short_term:  '4 Weeks',
  medium_term: '6 Months',
  long_term:   'All Time',
}