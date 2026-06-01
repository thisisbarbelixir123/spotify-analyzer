export const AUDIO_FEATURES = {
  energy: {
    label: 'Energy',
    emoji: '⚡',
    color: '#FF6B35',
    description: 'How intense and active the track feels. High energy = fast, loud, and noisy.',
  },
  danceability: {
    label: 'Danceability',
    emoji: '🕺',
    color: '#1DB954',
    description: 'How suitable the track is for dancing based on tempo, rhythm, and beat strength.',
  },
  valence: {
    label: 'Positive Mood',
    emoji: '😊',
    color: '#FFD93D',
    description: 'How positive or happy the track sounds. High = cheerful, low = sad or angry.',
  },
  acousticness: {
    label: 'Acoustic',
    emoji: '🎸',
    color: '#A8D8EA',
    description: 'How acoustic (non-electronic) the track is. High = unplugged, low = electronic.',
  },
  instrumentalness: {
    label: 'Instrumental',
    emoji: '🎹',
    color: '#C77DFF',
    description: 'How likely the track has no vocals. High = mostly instruments, low = has singing.',
  },
  speechiness: {
    label: 'Vocal',
    emoji: '🎤',
    color: '#FF8FAB',
    description: 'How much spoken word is in the track. High = rap or podcast-like, low = music.',
  },
  liveness: {
    label: 'Live Feel',
    emoji: '🎪',
    color: '#00B4D8',
    description: 'How likely the track was recorded live in front of an audience.',
  },
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