import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import freqblogRoutes from './routes/freqblog.js'

// Load .env dari root folder
const __dirname = dirname(fileURLToPath(import.meta.url))
const envPath = resolve(__dirname, '../.env')
console.log('Loading .env from:', envPath)
dotenv.config({ path: envPath })
console.log('FREQBLOG_KEY:', process.env.FREQBLOG_API_KEY ? 'FOUND' : 'NOT FOUND')

// Debug
console.log('FREQBLOG_KEY loaded:', process.env.FREQBLOG_API_KEY ? 'YES' : 'NO')

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors({ origin: 'http://127.0.0.1:5173', credentials: true }))
app.use(express.json())

app.use('/freqblog', freqblogRoutes)

app.get('/health', (req, res) => res.json({ status: 'ok' }))

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})