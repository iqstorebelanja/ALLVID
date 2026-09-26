/**
 * Ecosystem Apps Configuration
 * 4 Dedicated Video/Audio Downloader Apps
 */

export interface EcosystemApp {
  id: 'ytsave' | 'savetok' | 'reelssave' | 'xsave' | 'allvid';
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  packageId: string;
  webUrl: string;
  color: string;
  gradient: string;
  badge: string;
  rating: string;
  downloads: string;
  features: string[];
}

export const CURRENT_APP_ID = 'allvid';

export const MY_APPS: EcosystemApp[] = [
  {
    id: 'ytsave',
    name: 'YTSave',
    shortName: 'YouTube HD',
    tagline: 'YouTube 4K & MP3 Extractor',
    description: 'Fastest 4K 60FPS video and 320kbps MP3 audio extractor for YouTube Shorts & Videos.',
    packageId: 'com.ytsave.downloader',
    webUrl: 'https://ytsave.app',
    color: '#FF0000',
    gradient: 'from-[#FF0000] to-[#CC0000]',
    badge: '4K & MP3',
    rating: '4.9',
    downloads: '1.2M+',
    features: ['4K Ultra HD', '320kbps MP3', 'Shorts Downloader']
  },
  {
    id: 'savetok',
    name: 'SaveTok',
    shortName: 'TikTok Clean',
    tagline: 'No Watermark TikTok Saver',
    description: 'Save crystal clear HD TikTok videos, stories, and background audio without watermarks.',
    packageId: 'com.savetok.downloader',
    webUrl: 'https://savetok.app',
    color: '#FE2C55',
    gradient: 'from-[#FE2C55] to-[#25F4EE]',
    badge: 'No Watermark',
    rating: '4.9',
    downloads: '2.5M+',
    features: ['Zero Watermark', 'HD Original', 'Direct MP4 & MP3']
  },
  {
    id: 'reelssave',
    name: 'ReelsSave',
    shortName: 'Instagram Reels',
    tagline: 'Instagram Reels & Stories Saver',
    description: 'Instant HD download for Instagram Reels, Stories, Carousels, and audio tracks.',
    packageId: 'com.reelssave.downloader',
    webUrl: 'https://reelssave.app',
    color: '#E1306C',
    gradient: 'from-[#F58529] via-[#DD2A7B] to-[#8134AF]',
    badge: 'Reels & HD',
    rating: '4.8',
    downloads: '1.8M+',
    features: ['Reels & Stories', 'High Bitrate', 'Audio Extractor']
  },
  {
    id: 'xsave',
    name: 'XSave',
    shortName: 'X / Twitter',
    tagline: 'X & Twitter HD Video Downloader',
    description: 'Direct multi-resolution MP4 downloads and GIFs from X (Twitter) in one click.',
    packageId: 'com.xsave.downloader',
    webUrl: 'https://xsave.app',
    color: '#1DA1F2',
    gradient: 'from-[#1DA1F2] to-[#0D8BD9]',
    badge: 'Direct MP4',
    rating: '4.9',
    downloads: '950K+',
    features: ['Direct MP4', 'GIF Conversion', 'Multi-Bitrate']
  }
];

/**
 * Helper to get the other 3 apps in the ecosystem
 */
export function getCrossPromoApps(currentAppId: string = CURRENT_APP_ID): EcosystemApp[] {
  return MY_APPS.filter(app => app.id !== currentAppId);
}

/**
 * Handle APK / Play Store download link
 */
export function openAppDownload(packageId: string): void {
  const marketUrl = `market://details?id=${packageId}`;
  const webStoreUrl = `https://play.google.com/store/apps/details?id=${packageId}`;

  // Try market URL first (opens native Google Play Store if on Android device)
  try {
    const isAndroid = /Android/i.test(navigator.userAgent);
    if (isAndroid) {
      window.location.href = marketUrl;
      // Fallback timeout in case market:// is unhandled
      setTimeout(() => {
        window.open(webStoreUrl, '_blank');
      }, 500);
    } else {
      window.open(webStoreUrl, '_blank');
    }
  } catch {
    window.open(webStoreUrl, '_blank');
  }
}

/**
 * Handle Web application link
 */
export function openAppWeb(webUrl: string): void {
  window.open(webUrl, '_blank', 'noopener,noreferrer');
}

/**
 * LocalStorage 24-hour dismiss check
 */
const DISMISS_KEY = 'allvid_more_apps_dismissed_until';

export function isMoreAppsDismissed(): boolean {
  try {
    const dismissedUntil = localStorage.getItem(DISMISS_KEY);
    if (!dismissedUntil) return false;
    const expiry = parseInt(dismissedUntil, 10);
    return Date.now() < expiry;
  } catch {
    return false;
  }
}

export function dismissMoreAppsFor24h(): void {
  try {
    const expiry = Date.now() + 24 * 60 * 60 * 1000;
    localStorage.setItem(DISMISS_KEY, expiry.toString());
  } catch (e) {
    console.warn('Failed to save dismissal state to localStorage', e);
  }
}
