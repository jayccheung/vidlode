/* ============================================
   VidLode API Layer
   Communicates with Cloudflare Worker → VPS backend
   ============================================ */

const API_BASE = 'https://api.vidlode.com';

const VidLodeAPI = {
  /**
   * Parse a video URL — extract metadata and available formats
   * @param {string} url
   * @returns {Promise<{title, author, duration, thumbnail, formats: Array, platform: string}>}
   */
  async parse(url) {
    const res = await fetch(API_BASE + '/parse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to parse video');
    }
    return res.json();
  },

  /**
   * Trigger download of a format — returns direct download URL
   * @param {string} url - original video URL
   * @param {string} formatId - selected format ID
   * @returns {Promise<{downloadUrl: string}>}
   */
  async getDownload(url, formatId) {
    const res = await fetch(API_BASE + '/download', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, formatId })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Download failed');
    }
    return res.json();
  },

  /** Supported platforms list */
  PLATFORMS: [
    { id: 'youtube',   name: 'YouTube',   icon: 'smart_display', color: '#FF0000' },
    { id: 'twitter',   name: 'Twitter/X', icon: 'flutter_dash',  color: '#1DA1F2' },
    { id: 'instagram', name: 'Instagram', icon: 'camera',         color: '#E4405F' },
    { id: 'bilibili',  name: 'Bilibili',  icon: 'tv',             color: '#FB7299' },
    { id: 'douyin',    name: 'Douyin',    icon: 'music_note',     color: '#000000' },
    { id: 'weishi',    name: 'WeChat Ch.', icon: 'chat',          color: '#07C160' },
    { id: 'tiktok',    name: 'TikTok',    icon: 'music_video',    color: '#000000' },
    { id: 'reddit',    name: 'Reddit',    icon: 'forum',          color: '#FF4500' }
  ],

  detectPlatform(url) {
    const u = url.toLowerCase();
    for (const p of this.PLATFORMS) {
      if (u.includes(p.id + '.com') || u.includes(p.id + '.app') ||
          (p.id === 'douyin' && u.includes('douyin.com')) ||
          (p.id === 'weishi' && (u.includes('weishi.qq.com') || u.includes('finder.video.qq.com'))) ||
          (p.id === 'twitter' && (u.includes('x.com') || u.includes('twitter.com'))) ||
          (p.id === 'bilibili' && u.includes('bilibili.com'))) {
        return p;
      }
    }
    return null;
  }
};
