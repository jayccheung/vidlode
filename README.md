# VidLode — Free Online Video Downloader

Download videos from YouTube, Twitter/X, Instagram, Bilibili, Douyin, WeChat Channels, TikTok, and Reddit. No registration, no software install, completely free.

## Architecture

```
Browser → Cloudflare Pages (frontend) → Cloudflare Worker (API gateway) → Oracle VPS (yt-dlp) → Platform CDN → User Device
```

- **Frontend**: Vanilla HTML/CSS/JS, PWA with offline history (IndexedDB)
- **API Gateway**: Cloudflare Worker (free tier: 100k req/day)
- **Parser**: Python FastAPI + yt-dlp on Oracle Cloud Free Tier VPS
- **Video data**: Streams directly from platform CDN to user — our servers never touch the video bytes

## Project Structure

```
vidlode/
├── frontend/          # Cloudflare Pages static site
│   ├── index.html     # Home page
│   ├── download.html  # Download / parse result
│   ├── history.html   # Download history (IndexedDB)
│   ├── settings.html  # Settings page
│   ├── css/app.css    # Cyber-Global design system
│   ├── js/            # Client-side JS
│   ├── seo/           # SEO landing pages
│   ├── manifest.json  # PWA manifest
│   └── _headers       # Cloudflare Pages headers
├── worker/            # Cloudflare Worker (API gateway)
│   └── src/index.js
└── backend/           # VPS yt-dlp service
    ├── server.py      # FastAPI app
    └── deploy.sh      # One-command VPS setup
```

## Deployment

### Frontend (Cloudflare Pages)
1. Push to GitHub
2. Connect repo to Cloudflare Pages
3. Set build output directory: `frontend/`
4. Deploy

### Worker (Cloudflare Workers)
```bash
cd worker
npm install
npx wrangler deploy
```

### Backend (Oracle Cloud VPS)
```bash
# Copy files to VPS
scp backend/server.py backend/requirements.txt backend/deploy.sh user@vps:/tmp/

# Run setup
ssh user@vps "cd /tmp && bash deploy.sh"
```

## Cost: $0/month (Free Tier)
| Service | Free Tier |
|---|---|
| Cloudflare Pages | Unlimited |
| Cloudflare Workers | 100k req/day |
| Oracle Cloud VPS | 4 cores, 24GB RAM |
| GitHub | Unlimited |
