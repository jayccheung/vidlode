/**
 * VidLode Cloudflare Worker — API Gateway v1.0
 *
 * Routes:
 *   POST /parse     → forward to VPS backend, return video metadata
 *   POST /download  → return direct download URL
 *   GET  /health    → health check
 */

// VPS backend URL (set via wrangler secret or env var)
const BACKEND_URL = 'https://yt-dlp.vidlode.com';

// CORS headers
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
};

// Simple in-memory rate limiter (per-IP, resets on Worker cold start)
const RATE_LIMIT = new Map();
const RATE_MAX = 20;   // max requests per minute per IP
const RATE_WINDOW = 60000; // 1 minute

function rateLimited(ip) {
  const now = Date.now();
  const record = RATE_LIMIT.get(ip);
  if (!record || now - record.reset > RATE_WINDOW) {
    RATE_LIMIT.set(ip, { count: 1, reset: now });
    return false;
  }
  record.count++;
  return record.count > RATE_MAX;
}

// Simple URL validation
function isValidUrl(str) {
  try {
    const url = new URL(str);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const method = request.method;

    // Handle CORS preflight
    if (method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS });
    }

    // Health check
    if (url.pathname === '/health' && method === 'GET') {
      return new Response(JSON.stringify({ status: 'ok', version: '1.0.0' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...CORS }
      });
    }

    // Rate limiting
    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    if (rateLimited(ip)) {
      return new Response(JSON.stringify({ error: 'Too many requests. Please wait.' }), {
        status: 429,
        headers: { 'Content-Type': 'application/json', ...CORS }
      });
    }

    const backend = env.BACKEND_URL || BACKEND_URL;

    // POST /parse — extract video metadata
    if (url.pathname === '/parse' && method === 'POST') {
      try {
        const body = await request.json();
        const videoUrl = body.url;

        if (!videoUrl || !isValidUrl(videoUrl)) {
          return new Response(JSON.stringify({ error: 'Invalid or missing video URL' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...CORS }
          });
        }

        // Forward to VPS backend
        const backendResp = await fetch(backend + '/api/parse', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: videoUrl })
        });

        if (!backendResp.ok) {
          const errText = await backendResp.text();
          console.error('Backend parse error:', backendResp.status, errText);
          return new Response(JSON.stringify({
            error: 'Failed to parse video. The platform may have changed its format, or the link may not be a valid video URL.'
          }), {
            status: 502,
            headers: { 'Content-Type': 'application/json', ...CORS }
          });
        }

        const data = await backendResp.json();

        // Return parsed metadata to frontend
        return new Response(JSON.stringify(data), {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...CORS }
        });

      } catch (err) {
        console.error('Parse error:', err.message);
        return new Response(JSON.stringify({ error: 'Internal server error. Please try again.' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...CORS }
        });
      }
    }

    // POST /download — get direct download URL
    if (url.pathname === '/download' && method === 'POST') {
      try {
        const body = await request.json();
        const videoUrl = body.url;
        const formatId = body.formatId;

        if (!videoUrl || !formatId) {
          return new Response(JSON.stringify({ error: 'Missing url or formatId' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...CORS }
          });
        }

        const backendResp = await fetch(backend + '/api/download', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: videoUrl, formatId })
        });

        if (!backendResp.ok) {
          const errText = await backendResp.text();
          console.error('Backend download error:', backendResp.status, errText);
          return new Response(JSON.stringify({ error: 'Failed to get download URL' }), {
            status: 502,
            headers: { 'Content-Type': 'application/json', ...CORS }
          });
        }

        const data = await backendResp.json();

        return new Response(JSON.stringify(data), {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...CORS }
        });

      } catch (err) {
        console.error('Download error:', err.message);
        return new Response(JSON.stringify({ error: 'Internal server error' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...CORS }
        });
      }
    }

    // 404 for unknown routes
    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json', ...CORS }
    });
  }
};
