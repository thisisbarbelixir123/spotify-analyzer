const BASE_URL = '/api'

export async function bulkLookup(tracks) {
  if (!tracks || tracks.length === 0) return []

  const chunks = []
  for (let i = 0; i < tracks.length; i += 5) {
    chunks.push(tracks.slice(i, i + 5))
  }

  const results = []

  for (const chunk of chunks) {
    const payload = chunk.map((t) => ({
      track:  t.name,
      artist: t.artists?.[0]?.name ?? '',
    }))

    try {
      const res = await fetch(`${BASE_URL}/freqblog`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        console.error('FreqBlog /bulk error:', res.status, await res.text())
        results.push(...chunk.map(() => null))
        continue
      }

      const data = await res.json()
      const items = data.results ?? []
      items.forEach((item) => {
        results.push(item.found ? item.result : null)
      })
    } catch (err) {
      console.error('FreqBlog fetch error:', err)
      results.push(...chunk.map(() => null))
    }
  }

  return results
}

// Normalize FreqBlog response to internal format
// Percentage fields (0-1) → (0-100)
export function normalizeFeatures(f) {
  if (!f) return null

  const pct = (val) => (val != null ? Math.round(val * 100) : null)

  return {
    // Percentage fields
    energy:           pct(f.energy),
    danceability:     pct(f.danceability),
    valence:          pct(f.valence),
    acousticness:     pct(f.acousticness),
    instrumentalness: pct(f.instrumentalness),
    liveness:         pct(f.liveness),
    speechiness:      pct(f.speechiness),

    // Raw fields
    bpm:              f.bpm              ?? null,
    bpm_confidence:   f.bpm_confidence   ?? null,
    key:              f.key              ?? null,
    camelot:          f.camelot          ?? null,
    mood:             f.mood             ?? null,
    mood_vector:      f.mood_vector      ?? null,
    genre:            f.genre            ?? null,
    loudness_db:      f.loudness_db      ?? null,
    time_signature:   f.time_signature   ?? null,
  }
}

// Calculate averages from array of normalized features
export function calculateAverages(normalizedFeatures) {
  const valid = normalizedFeatures.filter(Boolean)
  if (valid.length === 0) return null

  const PCT_FIELDS = [
    'energy', 'danceability', 'valence',
    'acousticness', 'instrumentalness', 'liveness', 'speechiness',
  ]

  const averages = {}

  PCT_FIELDS.forEach((key) => {
    const values = valid.map((f) => f[key]).filter((v) => v != null)
    // Edge case #3 — kalau semua null, set null bukan 0
    averages[key] = values.length > 0
      ? Math.round(values.reduce((s, v) => s + v, 0) / values.length)
      : null
  })

  const bpmValues = valid.map((f) => f.bpm).filter((v) => v != null)
  averages.bpm = bpmValues.length > 0
    ? Math.round(bpmValues.reduce((s, v) => s + v, 0) / bpmValues.length)
    : null

  const moodCounts = {}
  valid.forEach((f) => {
    if (f.mood) moodCounts[f.mood] = (moodCounts[f.mood] || 0) + 1
  })
  averages.mood = Object.keys(moodCounts).length > 0
    ? Object.entries(moodCounts).sort(([,a],[,b]) => b - a)[0][0]
    : null

  const keyCounts = {}
  valid.forEach((f) => {
    if (f.key) keyCounts[f.key] = (keyCounts[f.key] || 0) + 1
  })
  averages.key = Object.keys(keyCounts).length > 0
    ? Object.entries(keyCounts).sort(([,a],[,b]) => b - a)[0][0]
    : null

  const genreCounts = {}
  valid.forEach((f) => {
    if (f.genre) genreCounts[f.genre] = (genreCounts[f.genre] || 0) + 1
  })
  averages.genre = Object.keys(genreCounts).length > 0
    ? Object.entries(genreCounts).sort(([,a],[,b]) => b - a)[0][0]
    : null

  averages._coverage = valid.length
  averages._total    = normalizedFeatures.length

  return averages
}