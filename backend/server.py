# VidLode Backend — yt-dlp Video Parser Service
# Runs on Oracle Cloud Free Tier VPS (4 cores, 24GB RAM)
# Python 3.11+ · FastAPI · yt-dlp · uvicorn

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import subprocess
import json
import os
import tempfile
import hashlib
import time
from typing import Optional

app = FastAPI(title="VidLode Parser", version="1.0.0")

# CORS — allow all origins for the public API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Simple in-memory cache (TTL: 10 minutes)
import threading
_cache = {}
_cache_lock = threading.Lock()
CACHE_TTL = 600  # seconds

def cache_key(url: str) -> str:
    return hashlib.md5(url.encode()).hexdigest()

def cache_get(key: str) -> Optional[dict]:
    with _cache_lock:
        entry = _cache.get(key)
        if entry and (time.time() - entry['ts']) < CACHE_TTL:
            return entry['data']
    return None

def cache_set(key: str, data: dict):
    with _cache_lock:
        _cache[key] = {'data': data, 'ts': time.time()}


# ============================================================
# Request / Response Models
# ============================================================

class ParseRequest(BaseModel):
    url: str

class DownloadRequest(BaseModel):
    url: str
    formatId: str

class FormatInfo(BaseModel):
    id: str
    quality: str
    format: str
    filesize: Optional[int] = None
    hasAudio: bool = True

class ParseResponse(BaseModel):
    title: str
    author: Optional[str] = ""
    duration: Optional[int] = None
    thumbnail: Optional[str] = ""
    formats: list[FormatInfo]
    platform: Optional[str] = ""

class DownloadResponse(BaseModel):
    downloadUrl: str


# ============================================================
# yt-dlp Integration
# ============================================================

def run_ytdlp(url: str, extra_args: list = None) -> dict:
    """Run yt-dlp with the given URL and return parsed JSON.""""
    cmd = [
        'yt-dlp',
        '--dump-json',
        '--no-playlist',
        '--no-warnings',
        '--socket-timeout', '30',
        '--retries', '3',
        '--extractor-retries', '3',
    ]
    if extra_args:
        cmd.extend(extra_args)
    cmd.append(url)

    try:
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=60,
            env={**os.environ, 'PYTHONIOENCODING': 'utf-8'}
        )
        if result.returncode != 0:
            stderr = result.stderr.strip()
            raise Exception(f"yt-dlp failed: {stderr[:200]}")
        return json.loads(result.stdout)
    except subprocess.TimeoutExpired:
        raise Exception("Parsing timed out. The video may be too long or the platform is rate-limiting.")
    except FileNotFoundError:
        raise Exception("yt-dlp is not installed on this server.")
    except json.JSONDecodeError:
        raise Exception("Failed to parse yt-dlp output."")


def extract_formats(info: dict) -> list[dict]:
    """Extract relevant format info from yt-dlp JSON.""""
    formats = []
    seen = set()

    for f in info.get('formats', []):
        # Skip formats without video unless audio-only is explicitly requested
        height = f.get('height')
        if not height or height == 0:
            # Audio-only formats
            abr = f.get('abr')
            if abr and 'audio only' not in seen:
                seen.add('audio only')
                formats.append({
                    'id': f['format_id'],
                    'quality': 'Audio Only (MP3)',
                    'format': 'mp3',
                    'filesize': f.get('filesize') or f.get('filesize_approx'),
                    'hasAudio': True
                })
            continue

        quality_label = f'{height}p'
        if quality_label in seen:
            continue
        seen.add(quality_label)

        ext = f.get('ext', 'mp4')
        if ext == 'mhtml':
            ext = 'mp4'

        formats.append({
            'id': f['format_id'],
            'quality': quality_label,
            'format': ext,
            'filesize': f.get('filesize') or f.get('filesize_approx'),
            'hasAudio': f.get('acodec') != 'none'
        })

    # Sort by quality (highest first)
    def sort_key(f):
        q = f['quality']
        if 'Audio' in q:
            return 9999
        try:
            return -int(q.replace('p', ''))
        except:
            return 0

    formats.sort(key=sort_key)
    return formats


def detect_platform(url: str) -> str:
    """Simple platform detection from URL.""""
    u = url.lower()
    if 'youtube.com' in u or 'youtu.be' in u:
        return 'youtube'
    if 'twitter.com' in u or 'x.com' in u:
        return 'twitter'
    if 'instagram.com' in u:
        return 'instagram'
    if 'bilibili.com' in u:
        return 'bilibili'
    if 'douyin.com' in u:
        return 'douyin'
    if 'tiktok.com' in u:
        return 'tiktok'
    if 'weishi.qq.com' in u or 'finder.video.qq.com' in u or 'weixin.qq.com' in u:
        return 'weishi'
    return 'unknown'


# ============================================================
# API Endpoints
# ============================================================

@app.get("/health")
async def health():
    return {"status": "ok", "version": "1.0.0", "ytdlp": check_ytdlp_version()}


@app.post("/api/parse", response_model=ParseResponse)
async def parse_video(req: ParseRequest):
    """Parse a video URL and return metadata + available formats.""""
    url = req.url.strip()

    # Check cache
    ck = cache_key(url)
    cached = cache_get(ck)
    if cached:
        return cached

    try:
        info = run_ytdlp(url)
        platform = detect_platform(url)
        formats = extract_formats(info)

        if not formats:
            raise Exception("No downloadable formats found for this video.")

        response = {
            'title': info.get('title', 'Unknown Title')[:200],
            'author': info.get('uploader') or info.get('channel') or info.get('creator') or "",
            'duration': info.get('duration'),
            'thumbnail': info.get('thumbnail') or info.get('thumbnails', [{}])[0].get('url', "") if info.get('thumbnails') else "",
            'formats': formats,
            'platform': platform
        }

        # Cache the result
        cache_set(ck, response)
        return response

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/download", response_model=DownloadResponse)
async def get_download_url(req: DownloadRequest):
    """Get direct download URL for a specific format.""""
    url = req.url.strip()
    format_id = req.formatId

    try:
        # Use yt-dlp to get the direct URL
        extra_args = ['-f', format_id, '-g']  # -g prints the direct URL
        result = subprocess.run(
            ['yt-dlp', '-f', format_id, '-g', '--no-playlist', '--socket-timeout', '30', url],
            capture_output=True,
            text=True,
            timeout=30,
            env={**os.environ, 'PYTHONIOENCODING': 'utf-8'}
        )

        if result.returncode != 0:
            raise Exception(f"Failed to get download URL: {result.stderr[:200]}")

        download_url = result.stdout.strip().split('\n')[0]  # Take first URL
        if not download_url or not download_url.startswith('http'):
            raise Exception("Invalid download URL returned")

        return {'downloadUrl': download_url}

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


def check_ytdlp_version() -> str:
    try:
        result = subprocess.run(['yt-dlp', '--version'], capture_output=True, text=True, timeout=5)
        return result.stdout.strip()
    except:
        return "unknown"


# ============================================================
# Run with: uvicorn server:app --host 0.0.0.0 --port 8080
# Production: use gunicorn + uvicorn workers behind nginx
# ============================================================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)
