/* ============================================
   VidLode Shared App Logic
   Navigation, PWA, Toast, Utils
   ============================================ */

(function () {
  'use strict';

  /* ---- Current page detection ---- */
  const path = window.location.pathname;
  const page = path.split('/').pop().replace('.html', '') || 'index';

  /* ---- Navigation ---- */
  function initNav() {
    const currentTab = page === 'index' || page === '' ? 'home' :
                       page === 'download' ? 'download' :
                       page === 'history' ? 'history' : 'settings';

    document.querySelectorAll('.nav-item').forEach(item => {
      const tab = item.dataset.tab;
      if (tab === currentTab) {
        item.classList.add('active');
      }
    });

    /* Click handling */
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const href = item.getAttribute('href');
        if (href) window.location.href = href;
      });
    });
  }

  /* ---- Toast ---- */
  window.showToast = function (message, type = '') {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'toast' + (type ? ' ' + type : '');
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  };

  /* ---- PWA Registration ---- */
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/js/sw.js').catch(() => {});
    });
  }

  /* ---- Clipboard ---- */
  window.pasteFromClipboard = async function (inputEl) {
    try {
      const text = await navigator.clipboard.readText();
      if (inputEl) {
        inputEl.value = text;
        inputEl.dispatchEvent(new Event('input'));
      }
      return text;
    } catch {
      showToast('Please paste manually', 'error');
      return '';
    }
  };

  /* ---- Debounce ---- */
  window.debounce = function (fn, delay = 300) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  };

  /* ---- Format file size ---- */
  window.formatSize = function (bytes) {
    if (!bytes) return 'Unknown';
    const units = ['B', 'KB', 'MB', 'GB'];
    let i = 0;
    let size = bytes;
    while (size >= 1024 && i < units.length - 1) { size /= 1024; i++; }
    return size.toFixed(i === 0 ? 0 : 1) + ' ' + units[i];
  };

  /* ---- Format duration ---- */
  window.formatDuration = function (seconds) {
    if (!seconds) return '';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return m + ':' + s.toString().padStart(2, '0');
  };

  /* ---- Group by date label ---- */
  window.groupByDate = function (items) {
    const groups = { 'Today': [], 'Yesterday': [], 'This Week': [], 'Earlier': [] };
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today - 86400000);

    for (const item of items) {
      const d = new Date(item.date);
      const day = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      if (day >= today) groups['Today'].push(item);
      else if (day >= yesterday) groups['Yesterday'].push(item);
      else if (day >= new Date(today - 7 * 86400000)) groups['This Week'].push(item);
      else groups['Earlier'].push(item);
    }
    return Object.entries(groups).filter(([_, v]) => v.length > 0);
  };

  /* ---- Init ---- */
  document.addEventListener('DOMContentLoaded', initNav);
})();
