// Tambahkan di paling atas file
export const config = {
  maxDuration: 30, // extend ke 30 detik (butuh Vercel Pro)
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const tracks = req.body
  if (!Array.isArray(tracks) || tracks.length === 0) {
    return res.status(400).json({ error: 'Invalid payload' })
  }

  try {
    // Tambahkan AbortController untuk timeout
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 25000) // 25 detik

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

export default async function handler(req, res) {
  // Hanya terima POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const tracks = req.body
  if (!Array.isArray(tracks) || tracks.length === 0) {
    return res.status(400).json({ error: 'Invalid payload' })
  }

  try {
    const response = await fetch('https://api.freqblog.com/bulk', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': process.env.FREQBLOG_API_KEY,
      },
      body: JSON.stringify(tracks),
    })

    if (!response.ok) {
      const text = await response.text()
      return res.status(response.status).json({ error: text })
    }

    const data = await response.json()
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: 'FreqBlog request failed' })
  }
}