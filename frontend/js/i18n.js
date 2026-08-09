/* ============================================
   VidLode i18n — Chinese & English Translation System
   Auto-detects browser language, saves preference to localStorage
   ============================================ */

const VidLodeI18n = {
  _lang: null,

  /* All translation strings */
  _dict: {
    en: {
      /* Nav */
      "nav.home": "Home",
      "nav.download": "Download",
      "nav.history": "History",
      "nav.settings": "Settings",

      /* Index */
      "index.title": "VidLode — Free Online Video Downloader for 8+ Platforms",
      "index.desc": "Download videos from YouTube, TikTok, Instagram, Twitter, Bilibili, Douyin, WeChat Channels and more. Free, fast, no registration needed.",
      "index.heading": "Download Any Video",
      "index.subtitle": "Paste a link from YouTube, TikTok, Instagram &amp; more — download instantly",
      "index.placeholder": "Paste any link — auto-detect platform",
      "index.cta": "Parse &amp; Download",
      "index.platforms": "8 Platforms Supported",
      "index.how": "How It Works",
      "index.step1_title": "Copy Video Link",
      "index.step1_desc": "Open YouTube, TikTok, Instagram or any supported platform and copy the video URL from the share menu or address bar.",
      "index.step2_title": "Paste &amp; Parse",
      "index.step2_desc": "Paste the link above and tap Parse. Our engine instantly retrieves all available quality options — up to 4K.",
      "index.step3_title": "Choose Quality &amp; Download",
      "index.step3_desc": "Pick your preferred resolution or extract audio, then hit download. The file saves directly to your device.",
      "index.fast": "Fast Parse",
      "index.fast_desc": "Results in seconds",
      "index.quality": "Up to 4K",
      "index.quality_desc": "Highest quality",
      "index.noaccount": "No Account",
      "index.noaccount_desc": "No registration",
      "index.devices": "All Devices",
      "index.devices_desc": "Mobile &amp; Desktop",

      /* Download */
      "download.title": "Download — VidLode",
      "download.select": "Select Quality",
      "download.btn": "Download",
      "download.calc": "Calculating…",
      "download.pause": "Pause",
      "download.cancel": "Cancel",
      "download.complete": "Complete",

      /* History */
      "history.title": "History — VidLode",
      "history.empty_title": "No downloads yet",
      "history.empty_desc": "Your download history will appear here",
      "history.empty_cta": "Download a video",
      "history.heading": "Download History",
      "history.clear": "Clear All",
      "history.group_today": "Today",
      "history.group_yesterday": "Yesterday",
      "history.group_week": "This Week",
      "history.group_earlier": "Earlier",
      "history.done": "Done",

      /* Settings */
      "settings.title": "Settings — VidLode",
      "settings.heading": "Settings",
      "settings.general": "General",
      "settings.language": "Language",
      "settings.download": "Download",
      "settings.quality": "Default Quality",
      "settings.audio": "Audio Only Mode",
      "settings.data": "Data & Storage",
      "settings.clear_cache": "Clear History Cache",
      "settings.about": "About",
      "settings.version": "Version",

      /* Quality options */
      "quality.best": "Best Available",
      "quality.1080p": "1080p",
      "quality.720p": "720p",
      "quality.480p": "480p",
      "quality.audio": "Audio Only (MP3)",

      /* Toast messages */
      "toast.paste_platform": "Paste a {platform} link to start",
      "toast.empty_url": "Please paste a video link first",
      "toast.unsupported": "Unsupported platform. Try YouTube, TikTok, Instagram, etc.",
      "toast.select_quality": "Please select a quality",
      "toast.download_complete": "Download complete!",
      "toast.download_failed": "Download failed: {error}",
      "toast.paste_manually": "Please paste manually",
      "toast.lang_saved": "Language set to {lang}",
      "toast.quality_saved": "Default quality updated",
      "toast.audio_on": "Audio-only mode on",
      "toast.audio_off": "Full video mode",
      "toast.cache_cleared": "Cache cleared",
      "toast.parse_failed": "Failed to parse video",
      "toast.parsing": "Parsing video…",
      "toast.network": "Network error. Please check your connection.",

      /* Confirm dialogs */
      "confirm.clear_history": "Clear all download history?",
      "confirm.clear_cache": "Clear all download history and cached data?",

      /* Progress */
      "progress.starting": "Starting…",
      "progress.remaining_m": "{n}m remaining",
      "progress.remaining_s": "{n}s remaining",
    },

    zh: {
      /* Nav */
      "nav.home": "首页",
      "nav.download": "下载",
      "nav.history": "历史",
      "nav.settings": "设置",

      /* Index */
      "index.title": "VidLode — 免费在线视频下载器，支持8+平台",
      "index.desc": "从 YouTube、TikTok、Instagram、Twitter/X、Bilibili、抖音、微信视频号等平台下载视频。免费、快速、无需注册。",
      "index.heading": "下载任意视频",
      "index.subtitle": "粘贴 YouTube、TikTok、Instagram 等链接 — 即刻下载",
      "index.placeholder": "在此粘贴链接，自动识别平台…",
      "index.cta": "解析并下载",
      "index.platforms": "支持 8 个平台",
      "index.how": "使用步骤",
      "index.step1_title": "复制视频链接",
      "index.step1_desc": "打开 YouTube、TikTok、Instagram 等任意支持的平台，从分享菜单或地址栏复制视频链接。",
      "index.step2_title": "粘贴并解析",
      "index.step2_desc": "将链接粘贴到上方输入框，点击解析。引擎会立即获取所有可用的画质选项——最高支持 4K。",
      "index.step3_title": "选择画质并下载",
      "index.step3_desc": "选择你喜欢的分辨率或提取音频，然后点击下载。文件会直接保存到你的设备。",
      "index.fast": "极速解析",
      "index.fast_desc": "秒级返回结果",
      "index.quality": "最高 4K",
      "index.quality_desc": "最佳画质",
      "index.noaccount": "无需账号",
      "index.noaccount_desc": "无需注册",
      "index.devices": "全设备",
      "index.devices_desc": "手机 &amp; 电脑通用",

      /* Download */
      "download.title": "下载 — VidLode",
      "download.select": "选择画质",
      "download.btn": "下载",
      "download.calc": "计算中…",
      "download.pause": "暂停",
      "download.cancel": "取消",
      "download.complete": "完成",

      /* History */
      "history.title": "历史记录 — VidLode",
      "history.empty_title": "暂无下载记录",
      "history.empty_desc": "你的下载记录会出现在这里",
      "history.empty_cta": "去下载一个视频",
      "history.heading": "下载历史",
      "history.clear": "清空全部",
      "history.group_today": "今天",
      "history.group_yesterday": "昨天",
      "history.group_week": "本周",
      "history.group_earlier": "更早",
      "history.done": "已完成",

      /* Settings */
      "settings.title": "设置 — VidLode",
      "settings.heading": "设置",
      "settings.general": "通用",
      "settings.language": "语言",
      "settings.download": "下载",
      "settings.quality": "默认画质",
      "settings.audio": "仅音频模式",
      "settings.data": "数据与存储",
      "settings.clear_cache": "清除历史缓存",
      "settings.about": "关于",
      "settings.version": "版本",

      /* Quality options */
      "quality.best": "最佳可用",
      "quality.1080p": "1080p",
      "quality.720p": "720p",
      "quality.480p": "480p",
      "quality.audio": "纯音频 (MP3)",

      /* Toast messages */
      "toast.paste_platform": "粘贴 {platform} 链接即可开始",
      "toast.empty_url": "请先粘贴视频链接",
      "toast.unsupported": "不支持的平台。请尝试 YouTube、TikTok、Instagram 等",
      "toast.select_quality": "请选择画质",
      "toast.download_complete": "下载完成！",
      "toast.download_failed": "下载失败：{error}",
      "toast.paste_manually": "请手动粘贴",
      "toast.lang_saved": "语言已切换为 {lang}",
      "toast.quality_saved": "默认画质已更新",
      "toast.audio_on": "仅音频模式已开启",
      "toast.audio_off": "完整视频模式",
      "toast.cache_cleared": "缓存已清除",
      "toast.parse_failed": "视频解析失败",
      "toast.parsing": "正在解析视频…",
      "toast.network": "网络错误，请检查网络连接",

      /* Confirm dialogs */
      "confirm.clear_history": "确认清空所有下载记录？",
      "confirm.clear_cache": "确认清除所有下载记录和缓存数据？",

      /* Progress */
      "progress.starting": "启动中…",
      "progress.remaining_m": "剩余 {n} 分钟",
      "progress.remaining_s": "剩余 {n} 秒",
    }
  },

  /**
   * Get current language. Checks localStorage first, falls back
   * to browser language (zh/en only), defaults to 'en'.
   */
  get lang() {
    if (this._lang) return this._lang;
    const saved = localStorage.getItem("vidlode_lang");
    if (saved && this._dict[saved]) {
      this._lang = saved;
      return this._lang;
    }
    const nav = navigator.language || "";
    if (nav.startsWith("zh")) {
      this._lang = "zh";
    } else {
      this._lang = "en";
    }
    return this._lang;
  },

  /**
   * Set language and persist. Refreshes page content.
   */
  setLang(lang) {
    if (!this._dict[lang]) return;
    this._lang = lang;
    localStorage.setItem("vidlode_lang", lang);
    this.translatePage();
  },

  /**
   * Translate a key. Supports {placeholder} replacement.
   */
  t(key, params) {
    const dict = this._dict[this.lang] || this._dict["en"];
    let text = dict[key];
    if (text === undefined) {
      text = (this._dict["en"] || {})[key] || key;
    }
    if (params) {
      Object.keys(params).forEach(k => {
        text = text.replace("{" + k + "}", params[k]);
      });
    }
    return text;
  },

  /**
   * Walk the DOM and replace all [data-i18n] and [data-i18n-placeholder].
   */
  translatePage() {
    const lang = this.lang;
    document.documentElement.lang = lang;
    document.documentElement.dir = "ltr";

    /* Update page title */
    const titleMeta = document.querySelector('meta[name="description"]');
    if (titleMeta) {
      const key = document.querySelector("title")?.dataset?.i18n;
      if (key) document.title = this.t(key);
    }

    document.querySelectorAll("[data-i18n]").forEach(el => {
      const key = el.dataset.i18n;
      if (el.tagName === "TITLE") {
        document.title = this.t(key);
      } else if (el.tagName === "META" && el.name === "description") {
        el.content = this.t(key);
      } else {
        el.textContent = this.t(key);
      }
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
      el.placeholder = this.t(el.dataset.i18nPlaceholder);
    });

    document.querySelectorAll("[data-i18n-html]").forEach(el => {
      el.innerHTML = this.t(el.dataset.i18nHtml);
    });
  },

  /** Initialize */
  init() {
    this.translatePage();
  }
};

/* Shortcut */
const t = (key, params) => VidLodeI18n.t(key, params);