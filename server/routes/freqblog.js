import express from 'express'

const router = express.Router()

router.post('/bulk', async (req, res) => {
  const FREQBLOG_KEY = process.env.FREQBLOG_API_KEY
  console.log('KEY inside handler:', JSON.stringify(FREQBLOG_KEY))
  console.log('Tracks count:', req.body?.length)

  const tracks = req.body
  if (!Array.isArray(tracks) || tracks.length === 0) {
    return res.status(400).json({ error: 'Invalid payload' })
  }

  try {
    const response = await fetch('https://api.freqblog.com/bulk', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': FREQBLOG_KEY,
      },
      body: JSON.stringify(tracks),
    })

    if (!response.ok) {
      const text = await response.text()
      console.error('FreqBlog error:', response.status, text)
      return res.status(response.status).json({ error: text })
    }

    const data = await response.json()
    // Response format: { results: [...], found, not_found, requests_used }
    res.json(data)
  } catch (err) {
    console.error('FreqBlog proxy error:', err)
    res.status(500).json({ error: 'FreqBlog request failed' })
  }
})

export default router