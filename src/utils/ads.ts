/**
 * ALLVID - Premium AdMob Ads Integration
 * Supported Platforms: Android & iOS native via Capacitor AdMob plugin
 * Includes Web / Dev fallback simulation so features can be tested in browser & emulator.
 */

import { Capacitor } from '@capacitor/core';
import {
  AdMob,
  BannerAdOptions,
  BannerAdSize,
  BannerAdPosition,
  AdOptions,
  RewardAdOptions,
  RewardItem,
} from '@capacitor-community/admob';

// ============================================================================
// ADMOB AD UNIT IDS
// NOTE: Google Test IDs are pre-configured below.
// REPLACE WITH YOUR PRODUCTION ADMOB AD UNIT IDS BEFORE PUBLISHING TO GOOGLE PLAY!
// ============================================================================
export const AD_UNIT_IDS = {
  // Test Android App ID: ca-app-pub-3940256099942544~3347511713
  // REPLACE with your real App ID in AndroidManifest.xml / capacitor.config.json

  // Sticky Bottom Banner Test ID
  // REPLACE WITH REAL BANNER ID: e.g. "ca-app-pub-XXXXXXXXXXXXXXXX/YYYYYYYYYY"
  BANNER: 'ca-app-pub-3940256099942544/6300978111',

  // Interstitial Ad (Shown every 2 downloads or on daily quota exceed)
  // REPLACE WITH REAL INTERSTITIAL ID: e.g. "ca-app-pub-XXXXXXXXXXXXXXXX/YYYYYYYYYY"
  INTERSTITIAL: 'ca-app-pub-3940256099942544/1033173712',

  // Rewarded Video Ad ("Watch Ad to Unlock Batch Download (10 URLs)" & "Unlock 4K")
  // REPLACE WITH REAL REWARDED ID: e.g. "ca-app-pub-XXXXXXXXXXXXXXXX/YYYYYYYYYY"
  REWARDED: 'ca-app-pub-3940256099942544/5224354917',

  // App Open Ad (Triggered on launch)
  // REPLACE WITH REAL APP OPEN ID: e.g. "ca-app-pub-XXXXXXXXXXXXXXXX/YYYYYYYYYY"
  APP_OPEN: 'ca-app-pub-3940256099942544/9257395915',
};

// Monetization state counters
let downloadCount = 0;
let isAdsInitialized = false;

/**
 * Initialize AdMob SDK and configure consent / test devices
 */
export async function initializeAds(): Promise<void> {
  if (isAdsInitialized) return;

  if (Capacitor.isNativePlatform()) {
    try {
      await AdMob.initialize({
        testingDevices: ['EMULATOR'],
        initializeForTesting: true,
      });
      isAdsInitialized = true;
      console.log('[AdMob] Initialized successfully on native platform');

      // Pre-load App Open ad on start
      await showAppOpen();
      // Show sticky banner at bottom
      await showBanner();
    } catch (error) {
      console.error('[AdMob] Native initialization failed:', error);
    }
  } else {
    console.info('[AdMob] Non-native environment detected. Running in simulated ads mode.');
    isAdsInitialized = true;
  }
}

// Alias for backward compatibility
export const initAds = initializeAds;

/**
 * Show Sticky Bottom Banner
 */
export async function showBanner(): Promise<void> {
  if (!Capacitor.isNativePlatform()) {
    console.log('[AdMob Simulated] Sticky Banner displayed at bottom');
    return;
  }

  try {
    const options: BannerAdOptions = {
      adId: AD_UNIT_IDS.BANNER, // <-- Replace with REAL BANNER ID
      adSize: BannerAdSize.ADAPTIVE_BANNER,
      position: BannerAdPosition.BOTTOM_CENTER,
      margin: 0,
      isTesting: true,
    };
    await AdMob.showBanner(options);
  } catch (error) {
    console.error('[AdMob] Failed to show banner:', error);
  }
}

/**
 * Hide Bottom Banner
 */
export async function hideBanner(): Promise<void> {
  if (Capacitor.isNativePlatform()) {
    try {
      await AdMob.hideBanner();
    } catch (e) {
      console.error('[AdMob] Error hiding banner:', e);
    }
  }
}

/**
 * Show Interstitial Ad (automatically triggered after 2 downloads)
 */
export async function showInterstitial(force: boolean = false): Promise<boolean> {
  downloadCount++;
  // Trigger after every 2 downloads or when forced (e.g. daily limit hit)
  if (!force && downloadCount % 2 !== 0) {
    console.log(`[AdMob] Download count: ${downloadCount}. Interstitial scheduled for next download.`);
    return false;
  }

  console.log('[AdMob] Triggering Interstitial Ad...');

  if (!Capacitor.isNativePlatform()) {
    console.log('[AdMob Simulated] Interstitial Ad shown. Simulating 1.5s user view.');
    await new Promise((resolve) => setTimeout(resolve, 1500));
    return true;
  }

  try {
    const options: AdOptions = {
      adId: AD_UNIT_IDS.INTERSTITIAL, // <-- Replace with REAL INTERSTITIAL ID
      isTesting: true,
    };
    await AdMob.prepareInterstitial(options);
    await AdMob.showInterstitial();
    return true;
  } catch (error) {
    console.error('[AdMob] Interstitial failed:', error);
    return false;
  }
}

/**
 * Show Rewarded Ad to unlock premium capabilities:
 * - "Watch Ad to Unlock Batch Download (10 URLs)"
 * - "Watch Ad to Unlock 4K Ultra HD"
 * - "Watch Ad to get +1 Daily Download"
 */
export async function showRewarded(
  rewardDescription: string = 'Premium Feature'
): Promise<boolean> {
  console.log(`[AdMob] Requesting Rewarded Ad for: ${rewardDescription}`);

  if (!Capacitor.isNativePlatform()) {
    // Web / Emulator fallback: simulate watching a rewarded video
    const confirmed = window.confirm(
      `[AdMob Sponsored Ad] Watch a quick video to unlock: "${rewardDescription}"?\n\nPress OK to watch and claim reward.`
    );
    if (confirmed) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return true;
    }
    return false;
  }

  try {
    const options: RewardAdOptions = {
      adId: AD_UNIT_IDS.REWARDED, // <-- Replace with REAL REWARDED ID
      isTesting: true,
    };
    await AdMob.prepareRewardVideoAd(options);
    const rewardItem: RewardItem = await AdMob.showRewardVideoAd();

    if (rewardItem) {
      console.log(`[AdMob] Reward granted for ${rewardDescription}:`, rewardItem);
      return true;
    }
    return false;
  } catch (error) {
    console.error('[AdMob] Rewarded Ad failed:', error);
    // Graceful fallback for test environments:
    return true;
  }
}

/**
 * Show App Open Ad on App Launch
 */
export async function showAppOpen(): Promise<void> {
  if (!Capacitor.isNativePlatform()) {
    console.log('[AdMob Simulated] App Open Ad triggered on launch.');
    return;
  }

  try {
    // Interstitial used as launch interstitial if AppOpen ad type is mapped
    const options: AdOptions = {
      adId: AD_UNIT_IDS.APP_OPEN, // <-- Replace with REAL APP OPEN ID
      isTesting: true,
    };
    await AdMob.prepareInterstitial(options);
    await AdMob.showInterstitial();
  } catch (error) {
    console.warn('[AdMob] App Open Ad not shown or already dismissed:', error);
  }
}
