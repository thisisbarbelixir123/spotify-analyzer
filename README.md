# 🎵 Playlist Analyzer

A web application that analyzes the audio fingerprint of your Spotify playlists and top tracks — built with React, Vite, and Vercel serverless functions.

**Live demo:** https://spotify-analyzer-blond.vercel.app

---

## Features

- **Analyze Top Tracks** — See the audio profile of your most-played songs across 3 time ranges: 4 Weeks, 6 Months, and All Time
- **Analyze Playlists** — Select up to 3 of your own playlists and compare them side by side
- **InfoCard** — Each analysis is displayed as an interactive card showing Energy, Danceability, Positive Mood, Tempo (BPM), Top Artists, Top Genres, Mood, and Musical Key
- **Audio Feature Detail** — Click any feature to see the top and bottom tracks for that metric
- **Save to Spotify** — Save your top tracks analysis as a new playlist directly to your Spotify account
- **Secure Login** — OAuth 2.0 Authorization Code Flow with PKCE — no passwords stored

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite |
| Backend | Vercel Serverless Functions (Node.js) |
| Auth | Spotify OAuth 2.0 PKCE |
| Music Data | Spotify Web API |
| Audio Features | FreqBlog Music Metadata API |
| State Management | Zustand |
| Deployment | Vercel |

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Spotify Developer](https://developer.spotify.com/dashboard) account with an app registered
- A [FreqBlog API](https://freqblog.com/music-api.html) key (free tier available)

### Installation

```bash
# Clone the repository
git clone https://github.com/thisisbarbelixir123/spotify-analyzer.git
cd spotify-analyzer

# Install dependencies
cd client
npm install
```

### Environment Variables

Create a `.env` file in the `client/` directory:

```env
VITE_SPOTIFY_CLIENT_ID=your_spotify_client_id
VITE_REDIRECT_URI=http://localhost:5173/callback
```

Create a `.env` file in the root directory:

```env
FREQBLOG_API_KEY=your_freqblog_api_key
```

### Running Locally

```bash
# From the client/ directory
npm run dev
```

Then open http://localhost:5173 in your browser.

> **Note:** Add `http://localhost:5173/callback` to your Spotify app's Redirect URIs in the Developer Dashboard.

---

## Project Structure

```
spotify-analyzer/
├── api/
│   └── freqblog.js          # Serverless proxy for FreqBlog API
├── client/
│   ├── src/
│   │   ├── components/      # UI components (InfoCard, Modals, Navbar)
│   │   ├── hooks/           # Custom hooks (useSpotify, usePlaylistAnalysis, useSavePlaylist)
│   │   ├── pages/           # Page components (HomePage, AnalyzePage, CallbackPage)
│   │   ├── services/        # API clients (spotifyApi, freqblogApi)
│   │   ├── store/           # Zustand global state
│   │   └── utils/           # Helper functions (audioFeatures)
│   └── vite.config.js
└── vercel.json
```

---

## How It Works

1. User logs in via **Spotify OAuth 2.0 PKCE** — no client secret exposed
2. App fetches the user's top tracks or playlist tracks from **Spotify Web API**
3. Track names are sent to **FreqBlog API** (via a Vercel serverless proxy) to retrieve audio features: Energy, Danceability, Valence, BPM, Key, Mood, Genre, and more
4. Results are averaged and displayed as an **InfoCard** with interactive overlays
5. User can save the analyzed tracks as a new Spotify playlist via **POST /me/playlists**

> FreqBlog API is used as a replacement for Spotify's deprecated `/audio-features` endpoint (deprecated November 2024).

---

## Testing

```bash
cd client
npx vitest run
```

Test coverage includes:

| File | Tests |
|---|---|
| `audioFeatures.test.js` | 10 unit tests (mean, mode) |
| `freqblogApi.test.js` | 35 white box tests (normalizeFeatures, calculateAverages, bulkLookup) |
| `useSpotify.test.js` | 28 white box tests (PKCE helpers, exchangeToken, login) |

---

## Known Limitations

- Only playlists **created by you** can be analyzed (Spotify API restriction since Nov 2024)
- Audio feature values may differ slightly from Spotify's original data as they are provided by FreqBlog API
- Analysis time depends on FreqBlog API response speed (~1–2 seconds per 10 tracks)

---

## License

This project was developed as an undergraduate thesis project at **Bina Nusantara University** (2025).

---

## Author

**Sebastian Haryo Pradipta Panjisasongko**  
Computer Science — Bina Nusantara University  
[GitHub](https://github.com/thisisbarbelixir123) · [LinkedIn](https://linkedin.com/in/sebastian-haryo)
