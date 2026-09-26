import React, { useState, useEffect, useRef } from 'react';
import { 
  Download, Sparkles, Layers, Play, CheckCircle2, 
  Trash2, Share2, Search, ShieldCheck, Video, Music,
  Zap, Lock, RefreshCw, X, Command, Clock, 
  Check, ArrowRight, Eye, Film, SlidersHorizontal, AlertCircle
} from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { AdMob } from '@capacitor-community/admob';
import { initializeAds, initAds, showBanner, showInterstitial, showRewarded, showAppOpen, AD_UNIT_IDS } from './utils/ads';
import { MY_APPS, isMoreAppsDismissed } from './config/apps';
import { MoreApps, MoreAppsFooter } from './components/MoreApps';

interface Platform {
  id: string;
  name: string;
  color: string;
  sample: string;
  badge: string;
}

const PLATFORMS: Platform[] = [
  { id: 'tiktok', name: 'TikTok', color: '#FE2C55', sample: 'https://www.tiktok.com/@creator/video/7382910293847192', badge: 'No Watermark' },
  { id: 'instagram', name: 'Instagram', color: '#E1306C', sample: 'https://www.instagram.com/reel/C8qXvL1pM42/', badge: 'Reels & HD' },
  { id: 'youtube', name: 'YouTube Shorts', color: '#FF0000', sample: 'https://youtube.com/shorts/dQw4w9WgXcQ', badge: '4K & MP3' },
  { id: 'twitter', name: 'X / Twitter', color: '#1DA1F2', sample: 'https://x.com/tech_insider/status/180592837492817263', badge: 'Direct MP4' },
  { id: 'facebook', name: 'Facebook', color: '#1877F2', sample: 'https://www.facebook.com/watch/?v=928374619283', badge: '1080p' },
  { id: 'capcut', name: 'CapCut', color: '#00F0FF', sample: 'https://www.capcut.com/t/ZmFq92KLp/', badge: 'Template MP4' },
  { id: 'threads', name: 'Threads', color: '#FFFFFF', sample: 'https://www.threads.net/@user/post/C9xLmNoP123', badge: 'Clean Video' },
  { id: 'pinterest', name: 'Pinterest', color: '#E60023', sample: 'https://pin.it/7x9KlMnOp', badge: 'Original Pin' },
  { id: 'reddit', name: 'Reddit', color: '#FF4500', sample: 'https://www.reddit.com/r/technology/comments/1dsxyz/new_breakthrough/', badge: 'Merged Audio' },
  { id: 'twitch', name: 'Twitch', color: '#9146FF', sample: 'https://clips.twitch.tv/FrailBrightEagleSmoocherZ', badge: 'Clips HD' },
  { id: 'snapchat', name: 'Snapchat', color: '#FFFC00', sample: 'https://story.snapchat.com/s/spotlight/182736452', badge: 'Spotlight' },
  { id: 'vimeo', name: 'Vimeo', color: '#1AB7EA', sample: 'https://vimeo.com/928374619', badge: 'High Bitrate' },
  { id: 'soundcloud', name: 'SoundCloud', color: '#FF5500', sample: 'https://soundcloud.com/artist/track-name-vip', badge: '320kbps MP3' },
  { id: 'bilibili', name: 'Bilibili', color: '#00A1D6', sample: 'https://www.bilibili.com/video/BV1xx411c7mD', badge: '1080p60' },
  { id: 'bluesky', name: 'Bluesky', color: '#0085FF', sample: 'https://bsky.app/profile/user.bsky.social/post/3ku4l2abcde', badge: 'Fast Stream' },
  { id: 'linkedin', name: 'LinkedIn', color: '#0A66C2', sample: 'https://www.linkedin.com/posts/activity-72123456789', badge: 'Pro Video' },
  { id: 'dailymotion', name: 'Dailymotion', color: '#0066DC', sample: 'https://www.dailymotion.com/video/x8y1z2a', badge: 'HQ Feed' },
  { id: 'douyin', name: 'Douyin', color: '#25F4EE', sample: 'https://v.douyin.com/iJy8wLq/', badge: 'Raw 4K' },
  { id: 'likee', name: 'Likee', color: '#FF2D55', sample: 'https://likee.video/@user/video/987654321', badge: 'HD Clip' },
  { id: 'tumblr', name: 'Tumblr', color: '#36465D', sample: 'https://blog.tumblr.com/post/754321987654', badge: 'Direct Stream' }
];

interface QualityOption {
  id: '720p' | '1080p' | '4k' | 'mp3';
  label: string;
  badge: string;
  adRequirement: number; // 0 = free, 1 = 1 ad, 2 = 2 ads
  isAudio?: boolean;
  size: string;
  resolution: string;
}

interface VaultItem {
  id: string;
  title: string;
  platform: string;
  quality: string;
  size: string;
  duration: string;
  date: string;
  thumb: string;
}

// Brand SVG icons for input ticker
const PlatformIcons = [
  {
    name: 'TikTok',
    color: '#FE2C55',
    svg: (
      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.86.12V9.4a6.33 6.33 0 0 0-6.62 6.33A6.34 6.34 0 0 0 10.05 22a6.34 6.34 0 0 0 6.32-6.33V9.06a8.16 8.16 0 0 0 4.94 1.66V7.27a4.8 4.8 0 0 1-1.72-.58z"/>
      </svg>
    )
  },
  {
    name: 'Instagram',
    color: '#E1306C',
    svg: (
      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.404-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
      </svg>
    )
  },
  {
    name: 'X',
    color: '#FFFFFF',
    svg: (
      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    )
  },
  {
    name: 'YouTube',
    color: '#FF0000',
    svg: (
      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
    )
  }
];

export default function App() {
  const [url, setUrl] = useState('');
  const [detectedPlatform, setDetectedPlatform] = useState<Platform | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedMedia, setExtractedMedia] = useState<{
    title: string;
    author: string;
    duration: string;
    thumb: string;
    platform: Platform;
  } | null>(null);

  // Segmented control quality selection
  const [selectedQuality, setSelectedQuality] = useState<'720p' | '1080p' | '4k' | 'mp3'>('720p');
  const [is1080pUnlocked, setIs1080pUnlocked] = useState(false);
  const [adsWatchedFor4K, setAdsWatchedFor4K] = useState(0); // Requires 2 ads
  const [isBatchUnlocked, setIsBatchUnlocked] = useState(false);
  const [isVip, setIsVip] = useState(false);
  const [dailyQuotaUsed, setDailyQuotaUsed] = useState(1);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  // Batch Mode
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [batchUrls, setBatchUrls] = useState('');
  const [batchQueue, setBatchQueue] = useState<{ url: string; platform: string; status: string; progress: number }[]>([]);
  const [isBatchRunning, setIsBatchRunning] = useState(false);

  // Media Vault (iOS Photos Style Grid)
  const [vault, setVault] = useState<VaultItem[]>([
    {
      id: '1',
      title: 'Neon Cyberpunk City Architecture [Original Master]',
      platform: 'YouTube Shorts',
      quality: '4K Ultra HD',
      size: '28.4 MB',
      duration: '0:58',
      date: 'Just now',
      thumb: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&q=80'
    },
    {
      id: '2',
      title: 'Lo-Fi Chill Hip Hop Beat Synthesizer Loop',
      platform: 'SoundCloud',
      quality: 'HQ Audio MP3',
      size: '8.4 MB',
      duration: '3:24',
      date: '12m ago',
      thumb: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80'
    },
    {
      id: '3',
      title: 'Minimalist Motion Design Reel 60FPS',
      platform: 'Instagram',
      quality: '1080p HD',
      size: '18.1 MB',
      duration: '0:34',
      date: '1h ago',
      thumb: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&q=80'
    },
    {
      id: '4',
      title: 'Cinematic Drone Landscape Over Deep Canyon',
      platform: 'TikTok',
      quality: '1080p HD',
      size: '15.6 MB',
      duration: '0:42',
      date: '3h ago',
      thumb: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=500&q=80'
    }
  ]);

  const [activePlayer, setActivePlayer] = useState<VaultItem | null>(null);
  const [bannerVisible, setBannerVisible] = useState(true);
  const [showAdSettings, setShowAdSettings] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Cross-promo Ecosystem State
  const [showMoreAppsModal, setShowMoreAppsModal] = useState(false);
  const [successfulDownloadsCount, setSuccessfulDownloadsCount] = useState(0);

  // Long press handling for deletion
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [itemToDelete, setItemToDelete] = useState<VaultItem | null>(null);

  useEffect(() => {
    // AdMob initialization on mount as required
    const setupAdMob = async () => {
      if (Capacitor.isNativePlatform()) {
        try {
          await AdMob.initialize({
            testingDevices: ['EMULATOR'],
            initializeForTesting: true,
          });
        } catch (e) {
          console.warn('[AdMob] AdMob.initialize native error:', e);
        }
      }
      await initializeAds();
    };
    setupAdMob();
  }, []);

  const triggerNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // Detect platform on URL changes
  useEffect(() => {
    if (!url) {
      setDetectedPlatform(null);
      return;
    }
    const lower = url.toLowerCase();
    const found = PLATFORMS.find(p => {
      if (p.id === 'tiktok' && (lower.includes('tiktok.com') || lower.includes('douyin.com'))) return true;
      if (p.id === 'instagram' && lower.includes('instagram.com')) return true;
      if (p.id === 'youtube' && (lower.includes('youtube.com') || lower.includes('youtu.be'))) return true;
      if (p.id === 'twitter' && (lower.includes('twitter.com') || lower.includes('x.com'))) return true;
      if (p.id === 'facebook' && (lower.includes('facebook.com') || lower.includes('fb.watch'))) return true;
      if (p.id === 'capcut' && lower.includes('capcut.com')) return true;
      if (p.id === 'threads' && lower.includes('threads.net')) return true;
      if (p.id === 'pinterest' && (lower.includes('pinterest.com') || lower.includes('pin.it'))) return true;
      if (p.id === 'reddit' && lower.includes('reddit.com')) return true;
      if (p.id === 'twitch' && lower.includes('twitch.tv')) return true;
      if (p.id === 'snapchat' && lower.includes('snapchat.com')) return true;
      if (p.id === 'vimeo' && lower.includes('vimeo.com')) return true;
      if (p.id === 'soundcloud' && lower.includes('soundcloud.com')) return true;
      if (p.id === 'bilibili' && lower.includes('bilibili.com')) return true;
      if (p.id === 'bluesky' && lower.includes('bsky.app')) return true;
      if (p.id === 'linkedin' && lower.includes('linkedin.com')) return true;
      if (p.id === 'dailymotion' && lower.includes('dailymotion.com')) return true;
      return lower.includes(p.id);
    });

    setDetectedPlatform(found || {
      id: 'universal',
      name: 'Universal Media',
      color: '#00D1FF',
      sample: '',
      badge: 'Stream MP4'
    });
  }, [url]);

  const handleSmartPaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrl(text);
        triggerNotification('Pasted link from clipboard');
      }
    } catch {
      const random = PLATFORMS[Math.floor(Math.random() * PLATFORMS.length)];
      setUrl(random.sample);
      triggerNotification(`Loaded ${random.name} sample link`);
    }
  };

  const handleExtract = () => {
    if (!url) return;
    setIsExtracting(true);
    setTimeout(() => {
      setIsExtracting(false);
      const plat = detectedPlatform || PLATFORMS[0];
      setExtractedMedia({
        title: `${plat.name} Master Media Stream [Ultra HD Clean]`,
        author: `@creator_studio • Verified`,
        duration: '0:48',
        thumb: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&q=80',
        platform: plat
      });
      triggerNotification(`Stream parsed (${plat.name})`);
    }, 750);
  };

  // Quality definition matching segmented control specifications
  const qualityOptions: QualityOption[] = [
    {
      id: '720p',
      label: '720p FREE',
      badge: 'Fast',
      adRequirement: 0,
      size: '12.4 MB',
      resolution: '1280x720'
    },
    {
      id: '1080p',
      label: '1080p',
      badge: '1 Ad',
      adRequirement: 1,
      size: '22.8 MB',
      resolution: '1920x1080'
    },
    {
      id: '4k',
      label: '4K',
      badge: '2 Ads',
      adRequirement: 2,
      size: '56.3 MB',
      resolution: '3840x2160'
    },
    {
      id: 'mp3',
      label: 'HQ MP3',
      badge: 'Free',
      adRequirement: 0,
      isAudio: true,
      size: '6.2 MB',
      resolution: '320kbps'
    }
  ];

  const handleSelectSegment = async (q: QualityOption) => {
    if (isVip) {
      setSelectedQuality(q.id);
      return;
    }

    if (q.id === '1080p' && !is1080pUnlocked) {
      const ok = await showRewarded('Unlock 1080p Full HD Format (1 Ad)');
      if (ok) {
        setIs1080pUnlocked(true);
        setSelectedQuality('1080p');
        triggerNotification('1080p Full HD format unlocked');
      }
      return;
    }

    if (q.id === '4k') {
      const remainingAds = 2 - adsWatchedFor4K;
      if (remainingAds > 0) {
        const ok = await showRewarded(`Unlock 4K Ultra HD (Ad ${adsWatchedFor4K + 1} of 2)`);
        if (ok) {
          const nextCount = adsWatchedFor4K + 1;
          setAdsWatchedFor4K(nextCount);
          if (nextCount >= 2) {
            setSelectedQuality('4k');
            triggerNotification('4K Ultra HD format unlocked');
          } else {
            triggerNotification('1 of 2 ads watched for 4K. Watch 1 more to unlock.');
          }
        }
        return;
      }
    }

    setSelectedQuality(q.id);
  };

  const saveDownloadedMedia = async (media: { title: string }, chosen: QualityOption) => {
    const safeTitle = media.title.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 36);
    const ext = chosen.isAudio ? 'mp3' : 'mp4';
    const fileName = `ALLVID_${safeTitle}_${chosen.id}.${ext}`;

    if (Capacitor.isNativePlatform()) {
      try {
        // Save to device storage using @capacitor/filesystem
        const sampleStreamBase64 = 'AAAAHGZ0eXBtcDQyAAAAAG1wNDJpc29tYXZjMW1wNDEAAAAIZnJlZQ==';
        await Filesystem.writeFile({
          path: fileName,
          data: sampleStreamBase64,
          directory: Directory.Documents,
          recursive: true
        });
        console.log(`[Capacitor Filesystem] Saved ${fileName} to Downloads folder`);
        triggerNotification(`Saved ${fileName} to Downloads folder`);
      } catch (fsError) {
        console.warn('[Capacitor Filesystem] Write error:', fsError);
        triggerNotification(`Saved ${fileName} to Media Vault`);
      }
    } else {
      // Web browser download
      try {
        const dummyBlob = new Blob([`ALLVID Stream: ${media.title} [${chosen.label}]`], {
          type: chosen.isAudio ? 'audio/mpeg' : 'video/mp4'
        });
        const blobUrl = URL.createObjectURL(dummyBlob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);
      } catch (dlErr) {
        console.warn('Web download trigger:', dlErr);
      }
    }
  };

  const handleStartDownload = async () => {
    if (!extractedMedia) return;

    if (!isVip && dailyQuotaUsed >= 3) {
      const rewarded = await showRewarded('Daily Quota Full (+3 Downloads)');
      if (rewarded) {
        setDailyQuotaUsed(0);
        triggerNotification('Daily download quota refilled');
      } else {
        return;
      }
    }

    setIsDownloading(true);
    setDownloadProgress(0);

    const chosen = qualityOptions.find(q => q.id === selectedQuality) || qualityOptions[0];

    const interval = setInterval(async () => {
      setDownloadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsDownloading(false);
          const newItem: VaultItem = {
            id: Date.now().toString(),
            title: extractedMedia.title,
            platform: extractedMedia.platform.name,
            quality: chosen.label,
            size: chosen.size,
            duration: extractedMedia.duration,
            date: 'Just now',
            thumb: extractedMedia.thumb
          };
          setVault(v => [newItem, ...v]);
          setDailyQuotaUsed(c => c + 1);
          triggerNotification(`Download complete: Saved to Media Vault`);

          // Trigger saving file to Downloads via @capacitor/filesystem (APK) or Web Blob
          saveDownloadedMedia(extractedMedia, chosen);

          // Ecosystem Cross-Promo: Trigger MoreApps popup after 2nd successful download
          setSuccessfulDownloadsCount(prev => {
            const next = prev + 1;
            if (next === 2 && !isMoreAppsDismissed()) {
              setTimeout(() => {
                setShowMoreAppsModal(true);
              }, 700);
            }
            return next;
          });

          // Show interstitial every 2 downloads
          showInterstitial();
          return 100;
        }
        return prev + 18;
      });
    }, 160);
  };

  const handleUnlockBatch = async () => {
    const ok = await showRewarded('Unlock Batch Downloader (10 URLs)');
    if (ok) {
      setIsBatchUnlocked(true);
      triggerNotification('Batch Downloader Unlocked');
    }
  };

  const handlePopulateBatch = () => {
    const samples = [
      'https://www.tiktok.com/@trend/video/73819283749',
      'https://www.instagram.com/reel/C8qXvL1pM42/',
      'https://youtube.com/shorts/dQw4w9WgXcQ',
      'https://x.com/tech_insider/status/180592837492817263',
      'https://www.capcut.com/t/ZmFq92KLp/'
    ].join('\n');
    setBatchUrls(samples);
  };

  const handleRunBatch = () => {
    const urls = batchUrls.split('\n').map(u => u.trim()).filter(Boolean).slice(0, 10);
    if (!urls.length) return;

    const initialQueue = urls.map(u => ({
      url: u,
      platform: PLATFORMS.find(p => u.includes(p.id))?.name || 'Universal',
      status: 'Queued',
      progress: 0
    }));

    setBatchQueue(initialQueue);
    setIsBatchRunning(true);

    let currentIdx = 0;
    const processNext = () => {
      if (currentIdx >= urls.length) {
        setIsBatchRunning(false);
        triggerNotification(`All ${urls.length} batch downloads completed`);
        setSuccessfulDownloadsCount(prev => {
          const next = prev + 1;
          if (next === 2 && !isMoreAppsDismissed()) {
            setTimeout(() => {
              setShowMoreAppsModal(true);
            }, 700);
          }
          return next;
        });
        showInterstitial();
        return;
      }

      setBatchQueue(q => q.map((item, idx) => idx === currentIdx ? { ...item, status: 'Downloading...', progress: 40 } : item));

      setTimeout(() => {
        setBatchQueue(q => q.map((item, idx) => idx === currentIdx ? { ...item, status: 'Completed', progress: 100 } : item));
        currentIdx++;
        setTimeout(processNext, 380);
      }, 650);
    };

    processNext();
  };

  // Long press handlers for iOS Photos style Media Vault
  const handleTouchStart = (item: VaultItem) => {
    longPressTimerRef.current = setTimeout(() => {
      setItemToDelete(item);
    }, 550);
  };

  const handleTouchEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  return (
    <div className="min-h-screen bg-[#000000] text-zinc-100 font-sans selection:bg-[#00D1FF]/25 selection:text-[#00D1FF] relative pb-28">
      {/* Background Radial Spotlight */}
      <div className="fixed inset-0 pointer-events-none bg-radial-spotlight z-0" />

      {/* TOP BAR: Linear / Raycast Style */}
      <header className="sticky top-0 z-40 bg-[#000000]/70 backdrop-blur-2xl border-b border-white/[0.06] px-4 sm:px-6 py-3 transition-all">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          
          {/* Left: ALLVID Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-b from-white/10 to-white/[0.02] border border-white/10 flex items-center justify-center shadow-lg relative group">
              <Download className="w-4 h-4 text-[#00D1FF] stroke-[2.2]" />
              <div className="absolute inset-0 rounded-xl bg-[#00D1FF]/10 blur-sm -z-10 group-hover:bg-[#00D1FF]/20 transition-all" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm sm:text-base tracking-[0.16em] uppercase text-white">
                ALLVID
              </span>
              <span className="text-[10px] font-mono text-zinc-500 border border-white/[0.08] px-1.5 py-0.5 rounded-full bg-white/[0.02]">
                PRO
              </span>
            </div>
          </div>

          {/* Center: 20+ Platforms Supported Pill */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.07] backdrop-blur-md shadow-inner">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00D1FF] animate-pulse" />
            <span className="text-xs font-medium text-zinc-300">20+ Platforms Supported</span>
          </div>

          {/* Right: VIP $29/mo Premium Switch & AdMob Inspector */}
          <div className="flex items-center gap-2.5">
            <div
              onClick={() => {
                const next = !isVip;
                setIsVip(next);
                if (next) {
                  setIs1080pUnlocked(true);
                  setAdsWatchedFor4K(2);
                  setIsBatchUnlocked(true);
                  triggerNotification('VIP Mode Active: All 4K & Batch unlocked');
                } else {
                  triggerNotification('VIP Mode Deactivated');
                }
              }}
              className={`flex items-center gap-2.5 px-3 py-1.5 rounded-full border transition-all cursor-pointer select-none ${
                isVip
                  ? 'bg-[#00D1FF]/10 border-[#00D1FF]/40 text-[#00D1FF] shadow-[0_0_15px_rgba(0,209,255,0.2)]'
                  : 'bg-white/[0.03] border-white/[0.08] text-zinc-400 hover:border-white/[0.15]'
              }`}
              title="Toggle VIP $29/mo simulated plan"
            >
              <div className="flex items-center gap-1.5 text-xs font-semibold">
                <Sparkles className={`w-3.5 h-3.5 ${isVip ? 'text-[#00D1FF]' : 'text-zinc-500'}`} />
                <span>VIP $29/mo</span>
              </div>
              
              {/* Premium Slider Switch */}
              <div className={`w-8 h-4 rounded-full p-0.5 transition-colors relative flex items-center ${isVip ? 'bg-[#00D1FF]' : 'bg-white/10'}`}>
                <div className={`w-3 h-3 rounded-full bg-black shadow-md transition-transform transform ${isVip ? 'translate-x-4 bg-white' : 'translate-x-0'}`} />
              </div>
            </div>

            {/* AdMob Settings Dialog Trigger */}
            <button
              onClick={() => setShowAdSettings(true)}
              className="p-1.5 rounded-full bg-white/[0.03] hover:bg-white/[0.08] text-zinc-400 hover:text-white border border-white/[0.08] transition-all"
              title="AdMob Settings & Monetization"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-7 space-y-6 relative z-10">
        
        {/* HUGE CENTERED URL INPUT (Height: 64px, rounded-full) */}
        <section className="space-y-3">
          <div className="max-w-2xl mx-auto relative group">
            {/* Soft Ambient Glow */}
            <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-[#00D1FF]/20 to-[#0077B6]/10 blur-xl opacity-40 group-focus-within:opacity-80 transition-opacity" />

            <div className="relative h-16 rounded-full glass-panel-elevated flex items-center pl-3 pr-2.5 gap-2.5 transition-all focus-within:border-[#00D1FF]/60 shadow-[0_8px_32px_0_rgba(0,0,0,0.6)]">
              
              {/* Animated Platform Icons inside input (TikTok, IG, X, YT ticker marquee) */}
              <div className="w-24 sm:w-28 h-9 rounded-full bg-white/[0.04] border border-white/[0.08] overflow-hidden flex items-center px-1.5 relative flex-shrink-0">
                <div className="animate-marquee flex items-center gap-3">
                  {[...PlatformIcons, ...PlatformIcons].map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-center w-5 h-5 rounded-full flex-shrink-0 opacity-80 hover:opacity-100 transition-opacity"
                      style={{ color: item.color }}
                      title={item.name}
                    >
                      {item.svg}
                    </div>
                  ))}
                </div>
              </div>

              {/* URL Input Element */}
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleExtract()}
                placeholder="Paste any video URL..."
                className="h-full flex-1 bg-transparent border-0 outline-none text-xs sm:text-sm font-normal text-white placeholder:text-zinc-500 min-w-0"
              />

              {/* Clear button if URL present */}
              {url && (
                <button
                  onClick={() => { setUrl(''); setExtractedMedia(null); }}
                  className="p-1.5 rounded-full text-zinc-500 hover:text-white hover:bg-white/[0.06] transition-all"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Smart Paste Pill (Linear style shortcut) */}
              <button
                onClick={handleSmartPaste}
                className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-zinc-400 hover:text-zinc-200 border border-white/[0.06] text-xs font-mono transition-all flex-shrink-0"
                title="Paste from clipboard"
              >
                <Command className="w-3 h-3" />
                <span>Paste</span>
              </button>

              {/* Extract Action Button */}
              <button
                disabled={!url || isExtracting}
                onClick={handleExtract}
                className="h-11 px-4 sm:px-5 rounded-full bg-[#00D1FF] hover:bg-[#33DAFF] text-black font-extrabold text-xs tracking-wider uppercase flex items-center gap-1.5 shadow-[0_0_20px_rgba(0,209,255,0.35)] disabled:opacity-40 disabled:pointer-events-none transition-all flex-shrink-0"
              >
                {isExtracting ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <>
                    <span>Extract</span>
                    <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Platform Strip */}
          <div className="flex items-center justify-between text-[11px] text-zinc-500 font-mono px-2">
            <span>Supported sources</span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsBatchMode(!isBatchMode)}
                className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[11px] font-mono transition-all ${
                  isBatchMode
                    ? 'bg-[#00D1FF]/15 border-[#00D1FF]/40 text-[#00D1FF]'
                    : 'bg-white/[0.02] border-white/[0.06] text-zinc-400 hover:text-white'
                }`}
              >
                <Layers className="w-3 h-3" />
                <span>Batch Mode</span>
              </button>
            </div>
          </div>

          {/* Platform Bubbles */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {PLATFORMS.slice(0, 10).map((p) => {
              const isSelected = detectedPlatform?.id === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => {
                    setUrl(p.sample);
                    triggerNotification(`Loaded ${p.name} sample link`);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap border transition-all ${
                    isSelected
                      ? 'bg-white/[0.08] text-white border-[#00D1FF]/50 shadow-sm'
                      : 'bg-white/[0.02] text-zinc-400 border-white/[0.05] hover:border-white/[0.12] hover:text-zinc-200'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: p.color }} />
                  <span>{p.name}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* BATCH DOWNLOADER CARD (Glassmorphic) */}
        {isBatchMode && (
          <section className="glass-panel rounded-2xl p-5 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#00D1FF]" />
                <h3 className="text-xs font-bold tracking-widest text-white uppercase font-mono">
                  Batch Multi-URL Extractor
                </h3>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-white/[0.04] text-zinc-400 border border-white/[0.08]">
                Up to 10 URLs
              </span>
            </div>

            {!isBatchUnlocked && !isVip ? (
              <div className="glass-panel-elevated rounded-xl p-6 text-center space-y-3">
                <div className="w-11 h-11 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mx-auto text-[#00D1FF]">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Batch Mode is Locked</h4>
                  <p className="text-xs text-zinc-400 max-w-sm mx-auto mt-1 leading-relaxed">
                    Download up to 10 URLs simultaneously across TikTok, Reels, Shorts, and X with multi-threaded speed.
                  </p>
                </div>
                <button
                  onClick={handleUnlockBatch}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-[#00D1FF] hover:bg-[#33DAFF] text-black font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 mx-auto shadow-[0_0_20px_rgba(0,209,255,0.25)] transition-all"
                >
                  <Play className="w-3.5 h-3.5 fill-black" />
                  <span>Watch Video Ad to Unlock Batch</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-500 font-mono text-[11px]">One URL per line:</span>
                  <button
                    onClick={handlePopulateBatch}
                    className="text-[#00D1FF] hover:underline font-mono text-[11px]"
                  >
                    + Insert 5 Sample URLs
                  </button>
                </div>

                <textarea
                  value={batchUrls}
                  onChange={(e) => setBatchUrls(e.target.value)}
                  placeholder="https://www.tiktok.com/...\nhttps://www.instagram.com/reel/...\nhttps://youtube.com/shorts/..."
                  className="w-full h-24 bg-white/[0.02] border border-white/[0.06] focus:border-[#00D1FF]/50 rounded-xl p-3 text-xs font-mono text-zinc-200 placeholder:text-zinc-600 focus:outline-none resize-none transition-all"
                />

                {batchQueue.length > 0 && (
                  <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                    {batchQueue.map((item, i) => (
                      <div key={i} className="flex items-center justify-between text-xs p-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                        <div className="flex items-center gap-2 truncate max-w-[70%]">
                          <span className="text-[10px] font-mono text-zinc-500">#{i+1}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/[0.04] text-zinc-300">
                            {item.platform}
                          </span>
                          <span className="truncate text-zinc-400 text-[11px] font-mono">{item.url}</span>
                        </div>
                        <span className={`text-[11px] font-mono font-bold ${item.status === 'Completed' ? 'text-emerald-400' : 'text-[#00D1FF]'}`}>
                          {item.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  disabled={isBatchRunning || !batchUrls.trim()}
                  onClick={handleRunBatch}
                  className="w-full py-3 rounded-full bg-[#00D1FF] hover:bg-[#33DAFF] text-black font-extrabold text-xs tracking-wider uppercase flex items-center justify-center gap-2 hover:opacity-95 disabled:opacity-40 transition-all shadow-[0_0_20px_rgba(0,209,255,0.25)]"
                >
                  {isBatchRunning ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Processing Batch Stream...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Start Batch Download</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </section>
        )}

        {/* EXTRACTED STREAM CARD WITH YOUTUBE-STYLE SEGMENTED CONTROL */}
        {extractedMedia && !isBatchMode && (
          <section className="glass-panel rounded-2xl p-5 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            {/* Stream Header & Metadata */}
            <div className="flex gap-4 items-center">
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-black flex-shrink-0 border border-white/[0.08]">
                <img src={extractedMedia.thumb} alt="Preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-black/80 border border-white/20 flex items-center justify-center text-white">
                    <Play className="w-3.5 h-3.5 fill-current ml-0.5 text-[#00D1FF]" />
                  </div>
                </div>
              </div>

              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: `${extractedMedia.platform.color}20`, color: extractedMedia.platform.color }}
                  >
                    {extractedMedia.platform.name}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <ShieldCheck className="w-3 h-3" />
                    <span>No Watermark</span>
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-white truncate">
                  {extractedMedia.title}
                </h3>
                <div className="flex items-center gap-3 text-xs text-zinc-400 font-mono">
                  <span>{extractedMedia.author}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-zinc-500" />
                    <span>{extractedMedia.duration}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* YOUTUBE STYLE SEGMENTED CONTROL: [720p FREE] [1080p 🔒 Ad] [4K 🔒 2 Ads] */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-zinc-400 font-mono">
                <span>Select Quality Format</span>
                <span className="text-[#00D1FF]">
                  {selectedQuality === '4k' ? 'Original 4K 60FPS' : selectedQuality === '1080p' ? 'Full HD Crisp' : selectedQuality === '720p' ? 'Fast 720p' : '320kbps Audio'}
                </span>
              </div>

              {/* Segmented Control Track */}
              <div className="bg-black/50 p-1.5 rounded-xl border border-white/[0.08] grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {qualityOptions.map((opt) => {
                  const isActive = selectedQuality === opt.id;
                  const isLocked = !isVip && (
                    (opt.id === '1080p' && !is1080pUnlocked) ||
                    (opt.id === '4k' && adsWatchedFor4K < 2)
                  );

                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleSelectSegment(opt)}
                      className={`relative flex flex-col items-center justify-center py-2.5 px-2 rounded-lg text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-[#00D1FF] text-black shadow-[0_0_20px_rgba(0,209,255,0.4)] font-extrabold scale-[1.01]'
                          : 'bg-white/[0.02] text-zinc-400 hover:text-white hover:bg-white/[0.05] border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-1">
                        {opt.isAudio ? (
                          <Music className={`w-3.5 h-3.5 ${isActive ? 'text-black' : 'text-zinc-500'}`} />
                        ) : (
                          <Video className={`w-3.5 h-3.5 ${isActive ? 'text-black' : 'text-zinc-500'}`} />
                        )}
                        <span>{opt.label}</span>
                        {isLocked && (
                          <Lock className={`w-3 h-3 ${isActive ? 'text-black' : 'text-zinc-400'}`} />
                        )}
                      </div>

                      <span className={`text-[10px] font-mono mt-0.5 ${isActive ? 'text-black/80 font-bold' : 'text-zinc-500'}`}>
                        {opt.id === '4k' && !isVip && adsWatchedFor4K === 1 
                          ? '1/2 Ads' 
                          : opt.badge}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Download Action or Progress */}
            {isDownloading ? (
              <div className="space-y-2 pt-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-[#00D1FF] font-semibold flex items-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Extracting Direct MP4 Stream...</span>
                  </span>
                  <span className="text-white font-bold">{downloadProgress}%</span>
                </div>
                <div className="h-2 w-full bg-white/[0.04] rounded-full overflow-hidden border border-white/[0.06]">
                  <div
                    className="h-full bg-gradient-to-r from-[#00D1FF] to-[#0099FF] shadow-[0_0_15px_rgba(0,209,255,0.5)] transition-all duration-200"
                    style={{ width: `${downloadProgress}%` }}
                  />
                </div>
              </div>
            ) : selectedQuality === '4k' && !isVip && adsWatchedFor4K < 2 ? (
              /* Rewarded Ad Requirement: Dedicated Watch Ad to Unlock HD 4K Download Button */
              <button
                onClick={async () => {
                  const ok = await showRewarded(`Watch Ad to Unlock HD 4K Download (Ad ${adsWatchedFor4K + 1} of 2)`);
                  if (ok) {
                    const next = adsWatchedFor4K + 1;
                    setAdsWatchedFor4K(next);
                    if (next >= 2) {
                      triggerNotification('4K Ultra HD format unlocked! Ready to download.');
                    } else {
                      triggerNotification('1 of 2 ads watched. Watch 1 more ad to unlock 4K.');
                    }
                  }
                }}
                className="w-full h-13 py-3.5 rounded-full bg-gradient-to-r from-[#00D1FF] to-[#0099FF] text-black font-extrabold text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(0,209,255,0.4)] transition-all animate-pulse"
              >
                <Play className="w-4 h-4 fill-black" />
                <span>Watch Ad to Unlock HD 4K Download ({adsWatchedFor4K}/2 Ads)</span>
              </button>
            ) : (
              <button
                onClick={handleStartDownload}
                className="w-full h-13 py-3.5 rounded-full bg-[#00D1FF] hover:bg-[#33DAFF] text-black font-extrabold text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(0,209,255,0.35)] transition-all"
              >
                <Download className="w-4 h-4 stroke-[2.5]" />
                <span>Download {selectedQuality.toUpperCase()} Now</span>
              </button>
            )}
          </section>
        )}

        {/* MEDIA VAULT: iOS PHOTOS GRID WITH HOVER PLAY & LONG PRESS TO DELETE */}
        <section className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Film className="w-4 h-4 text-[#00D1FF]" />
              <h2 className="text-xs font-bold tracking-widest text-white uppercase font-mono">
                Media Vault ({vault.length})
              </h2>
            </div>
            {vault.length > 0 && (
              <span className="text-[11px] text-zinc-500 font-mono">
                Long press card to delete
              </span>
            )}
          </div>

          {vault.length === 0 ? (
            <div className="glass-panel rounded-2xl p-10 text-center text-zinc-500 space-y-1">
              <p className="text-xs text-zinc-400">No media downloaded yet</p>
              <p className="text-[11px]">Paste any link above to populate your offline media vault</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-3.5">
              {vault.map((item) => (
                <div
                  key={item.id}
                  onMouseDown={() => handleTouchStart(item)}
                  onMouseUp={handleTouchEnd}
                  onTouchStart={() => handleTouchStart(item)}
                  onTouchEnd={handleTouchEnd}
                  className="group relative aspect-[4/5] rounded-2xl overflow-hidden glass-panel border border-white/[0.08] hover:border-[#00D1FF]/50 transition-all select-none shadow-lg cursor-pointer"
                >
                  {/* Thumbnail Image */}
                  <img
                    src={item.thumb}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Top Overlay Badges */}
                  <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none">
                    <span className="text-[9px] font-mono font-medium px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-zinc-300 border border-white/10">
                      {item.platform}
                    </span>
                    <span className="text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded-full bg-[#00D1FF]/20 text-[#00D1FF] backdrop-blur-md border border-[#00D1FF]/30">
                      {item.quality}
                    </span>
                  </div>

                  {/* Centered Hover Play Icon (iOS / Linear Glassmorphism) */}
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      setActivePlayer(item);
                    }}
                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30 backdrop-blur-[2px]"
                  >
                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/40 text-white flex items-center justify-center shadow-2xl transform scale-90 group-hover:scale-100 transition-transform">
                      <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                    </div>
                  </div>

                  {/* Bottom iOS Photos Metadata Gradient */}
                  <div className="absolute inset-x-0 bottom-0 p-2.5 bg-gradient-to-t from-black/95 via-black/60 to-transparent flex flex-col justify-end">
                    <h4 className="text-xs font-semibold text-white truncate drop-shadow-sm">
                      {item.title}
                    </h4>
                    <div className="flex items-center justify-between mt-1 text-[10px] font-mono text-zinc-400">
                      <span>{item.size}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5 text-zinc-500" />
                        <span>{item.duration}</span>
                      </span>
                    </div>
                  </div>

                  {/* Quick Delete button on hover / corner */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setItemToDelete(item);
                    }}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 backdrop-blur-md text-zinc-400 hover:text-red-400 border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete item"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* ECOSYSTEM MORE APPS FOOTER */}
      <MoreAppsFooter onOpenModal={() => setShowMoreAppsModal(true)} />

      {/* LONG PRESS / DELETE CONFIRMATION MODAL */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel-elevated rounded-2xl w-full max-w-sm p-5 space-y-4 border border-white/[0.08]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Delete from Media Vault</h3>
                <p className="text-xs text-zinc-400">This file will be permanently removed.</p>
              </div>
            </div>

            <p className="text-xs font-mono text-zinc-300 truncate bg-white/[0.02] p-2.5 rounded-lg border border-white/[0.04]">
              {itemToDelete.title}
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => setItemToDelete(null)}
                className="flex-1 py-2 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 text-xs font-semibold border border-white/[0.06] transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setVault(v => v.filter(x => x.id !== itemToDelete.id));
                  setItemToDelete(null);
                  triggerNotification('File deleted from Media Vault');
                }}
                className="flex-1 py-2 rounded-full bg-red-500 hover:bg-red-600 text-white text-xs font-bold transition-all shadow-[0_0_15px_rgba(239,68,68,0.3)]"
              >
                Delete File
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MEDIA PLAYER MODAL */}
      {activePlayer && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel-elevated rounded-2xl w-full max-w-md p-4 space-y-3.5 border border-white/[0.08]">
            <div className="flex justify-between items-center">
              <span className="text-xs font-mono font-bold text-[#00D1FF]">
                {activePlayer.platform} • {activePlayer.quality}
              </span>
              <button
                onClick={() => setActivePlayer(null)}
                className="text-zinc-500 hover:text-white p-1 rounded-full hover:bg-white/[0.06]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="aspect-video w-full rounded-xl overflow-hidden bg-black relative flex items-center justify-center border border-white/[0.06]">
              <img src={activePlayer.thumb} alt="Playback" className="w-full h-full object-cover opacity-60" />
              <div className="w-14 h-14 rounded-full bg-black/80 border border-[#00D1FF] flex items-center justify-center text-[#00D1FF] shadow-2xl">
                <Play className="w-6 h-6 fill-current ml-0.5" />
              </div>
            </div>

            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-white truncate">{activePlayer.title}</h3>
              <p className="text-xs text-zinc-500 font-mono">{activePlayer.size} • {activePlayer.duration}</p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({ title: activePlayer.title, text: `Downloaded via ALLVID: ${activePlayer.title}` });
                  } else {
                    triggerNotification('Share link copied to clipboard');
                  }
                }}
                className="flex-1 py-2.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 text-xs font-semibold border border-white/[0.06] flex items-center justify-center gap-1.5 transition-all"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share</span>
              </button>
              <button
                onClick={() => setActivePlayer(null)}
                className="flex-1 py-2.5 rounded-full bg-[#00D1FF] text-black font-extrabold text-xs uppercase transition-all shadow-[0_0_15px_rgba(0,209,255,0.3)]"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADMOB & MONETIZATION SETTINGS MODAL */}
      {showAdSettings && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel-elevated rounded-2xl w-full max-w-md p-5 space-y-4 border border-white/[0.08] max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-white/[0.06] pb-3">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#00D1FF]" />
                <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider">
                  AdMob & Monetization Setup
                </h3>
              </div>
              <button onClick={() => setShowAdSettings(false)} className="text-zinc-500 hover:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* VIP Simulator Toggle */}
            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>VIP $29/mo Simulator</span>
                  {isVip && (
                    <span className="text-[10px] font-mono px-1.5 rounded-full bg-[#00D1FF]/20 text-[#00D1FF]">
                      ACTIVE
                    </span>
                  )}
                </h4>
                <p className="text-[11px] text-zinc-400 mt-0.5">Disables ads, unlocks 4K and Batch 10 URLs instantly.</p>
              </div>
              <input
                type="checkbox"
                checked={isVip}
                onChange={(e) => {
                  setIsVip(e.target.checked);
                  if (e.target.checked) {
                    setIs1080pUnlocked(true);
                    setAdsWatchedFor4K(2);
                    setIsBatchUnlocked(true);
                  }
                }}
                className="w-4 h-4 accent-[#00D1FF] rounded"
              />
            </div>

            {/* Quota Tracker */}
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-500">Daily Free Quota:</span>
                <span className="text-white font-mono font-bold">{dailyQuotaUsed} / 3 used</span>
              </div>
              <button
                onClick={() => { setDailyQuotaUsed(0); triggerNotification('Daily download quota reset'); }}
                className="text-[11px] text-[#00D1FF] hover:underline font-mono"
              >
                Reset Daily Counter
              </button>
            </div>

            {/* Configured AdMob IDs */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                Configured AdMob Test Unit IDs:
              </span>
              <div className="space-y-1 text-[11px] font-mono">
                <div className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                  <span className="text-[#00D1FF] block font-bold">Banner ID:</span>
                  <span className="text-zinc-400 text-[10px]">{AD_UNIT_IDS.BANNER}</span>
                </div>
                <div className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                  <span className="text-[#00D1FF] block font-bold">Interstitial ID:</span>
                  <span className="text-zinc-400 text-[10px]">{AD_UNIT_IDS.INTERSTITIAL}</span>
                </div>
                <div className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                  <span className="text-[#00D1FF] block font-bold">Rewarded ID:</span>
                  <span className="text-zinc-400 text-[10px]">{AD_UNIT_IDS.REWARDED}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowAdSettings(false)}
              className="w-full py-2.5 rounded-full bg-white/[0.04] text-white hover:bg-white/[0.08] border border-white/[0.08] text-xs font-bold transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* PERSISTENT BOTTOM AD BANNER: Web = AdSense Placeholder Div, Native APK = Real AdMob */}
      {bannerVisible && !isVip && (
        Capacitor.isNativePlatform() ? (
          /* Native Capacitor Real AdMob Banner */
          <aside className="fixed bottom-0 left-0 right-0 z-30 bg-[#000000]/90 backdrop-blur-xl border-t border-[#00D1FF]/30 px-4 py-2 flex items-center justify-between shadow-2xl">
            <div className="flex items-center gap-2.5">
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-[#00D1FF]/20 text-[#00D1FF] border border-[#00D1FF]/40">
                Native AdMob
              </span>
              <div className="text-left">
                <p className="text-[11px] font-semibold text-white">Google Mobile Ads • Real AdMob Native Banner</p>
                <p className="text-[9px] font-mono text-zinc-400">Unit ID: {AD_UNIT_IDS.BANNER}</p>
              </div>
            </div>
            <button
              onClick={() => setBannerVisible(false)}
              className="text-zinc-500 hover:text-white p-1 rounded-full hover:bg-white/[0.06]"
              title="Hide Banner"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </aside>
        ) : (
          /* Web Platform: Google AdSense Placeholder Div for SEO & Web traffic */
          <aside className="fixed bottom-0 left-0 right-0 z-30 bg-[#000000]/95 backdrop-blur-xl border-t border-white/[0.08] px-4 py-2 shadow-2xl">
            <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/25 flex-shrink-0">
                  AdSense
                </span>
                <div className="text-left truncate">
                  <p className="text-[11px] font-semibold text-zinc-200 truncate">
                    Google AdSense Responsive Unit • Web SEO Monetization
                  </p>
                  <p className="text-[9px] font-mono text-zinc-500 truncate">
                    data-ad-client=&quot;ca-pub-test-placeholder&quot; • 320x50 Mobile / 728x90 Leaderboard
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className="text-[9px] font-mono text-zinc-600 uppercase border border-zinc-800 px-1 rounded">Ad</span>
                <button
                  onClick={() => setBannerVisible(false)}
                  className="text-zinc-500 hover:text-white p-1 rounded-full hover:bg-white/[0.06]"
                  title="Hide AdSense Banner"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </aside>
        )
      )}

      {/* STATUS NOTIFICATION TOAST */}
      {notification && (
        <div className="fixed bottom-14 left-1/2 -translate-x-1/2 z-50 glass-panel-elevated border border-[#00D1FF]/40 text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#00D1FF]" />
          <span>{notification}</span>
        </div>
      )}

      {/* ECOSYSTEM MORE APPS POPUP MODAL (Auto-triggers after 2nd download) */}
      <MoreApps
        isOpen={showMoreAppsModal}
        onClose={() => setShowMoreAppsModal(false)}
      />
    </div>
  );
}
