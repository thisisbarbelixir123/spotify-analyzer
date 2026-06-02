export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const tracks = req.body
  if (!Array.isArray(tracks) || tracks.length === 0) {
    return res.status(400).json({ error: 'Invalid payload' })
  }

  // Debug log
  console.log('Tracks count:', tracks.length)
  console.log('Sample track:', JSON.stringify(tracks[0]))

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 9000)

    const response = await fetch('https://api.freqblog.com/bulk', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': process.env.FREQBLOG_API_KEY,
      },
      body: JSON.stringify(tracks),
      signal: controller.signal,
    })

    clearTimeout(timeout)

    if (!response.ok) {
      const text = await response.text()
      console.error('FreqBlog error status:', response.status)
      console.error('FreqBlog error body:', text)
      return res.status(response.status).json({ error: text })
    }

    const data = await response.json()
    res.json(data)
  } catch (err) {
    if (err.name === 'AbortError') {
      return res.status(504).json({ error: 'FreqBlog API timeout' })
    }
    console.error('FreqBlog proxy error:', err)
    res.status(500).json({ error: 'FreqBlog request failed' })
  }
}