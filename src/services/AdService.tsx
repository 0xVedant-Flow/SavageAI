import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { cn } from '../lib/utils';
import { Capacitor } from '@capacitor/core';
import { AdMob, BannerAdPosition, BannerAdSize, RewardAdOptions, AdOptions, RewardAdPluginEvents, InterstitialAdPluginEvents } from '@capacitor-community/admob';

export class AdService {
  private static interstitialCount = 0;
  
  // Production AdMob IDs
  static readonly ANDROID_APP_ID = "ca-app-pub-9959295541500635~9918955950";
  static readonly BANNER_ID = "ca-app-pub-9959295541500635/2470743171";
  static readonly INTERSTITIAL_ID = "ca-app-pub-9959295541500635/8844579831";
  static readonly REWARDED_ID = "ca-app-pub-9959295541500635/9225388633";

  private static isInterstitialLoaded = false;
  private static isRewardedLoaded = false;
  private static isNative = Capacitor.isNativePlatform();

  static async initialize() {
    if (this.isNative) {
      try {
        await AdMob.requestTrackingAuthorization();
        await AdMob.initialize({
          initializeForTesting: false,
        });
      } catch (e) {
        console.error('AdMob Init Error:', e);
      }
    }
    this.preloadInterstitial();
    this.preloadRewarded();
  }

  static async preloadInterstitial() {
    if (this.isNative) {
      try {
        const options: AdOptions = {
          adId: this.INTERSTITIAL_ID,
          isTesting: false,
        };
        await AdMob.prepareInterstitial(options);
        this.isInterstitialLoaded = true;
      } catch (e) {
        console.error('Failed to preload interstitial', e);
      }
    } else {
      setTimeout(() => {
        this.isInterstitialLoaded = true;
      }, 2000);
    }
  }

  static async preloadRewarded() {
    if (this.isNative) {
      try {
        const options: RewardAdOptions = {
          adId: this.REWARDED_ID,
          isTesting: false,
        };
        await AdMob.prepareRewardVideoAd(options);
        this.isRewardedLoaded = true;
      } catch (e) {
        console.error('Failed to preload rewarded', e);
      }
    } else {
      setTimeout(() => {
        this.isRewardedLoaded = true;
      }, 2000);
    }
  }

  static async showInterstitial(): Promise<boolean> {
    if (!this.isInterstitialLoaded) {
      await this.preloadInterstitial();
    }

    if (this.isNative) {
      return new Promise(async (resolve) => {
        let closeListener: any;
        
        try {
          closeListener = await AdMob.addListener(InterstitialAdPluginEvents.Dismissed, () => {
            if (closeListener) closeListener.remove();
            this.isInterstitialLoaded = false;
            this.preloadInterstitial();
            resolve(true);
          });
          
          await AdMob.showInterstitial();
        } catch (e) {
          console.error('Failed to show interstitial', e);
          if (closeListener) closeListener.remove();
          resolve(false);
        }
      });
    } else {
      return new Promise((resolve) => {
        setTimeout(() => {
          const confirmed = window.confirm('[AD SIMULATION] Interstitial Ad\n\nThis would be a full-screen ad in a real app.\n\nClick OK to close.');
          this.isInterstitialLoaded = false;
          this.preloadInterstitial(); // Preload next one
          resolve(confirmed);
        }, 500);
      });
    }
  }

  static async showRewarded(): Promise<boolean> {
    if (!this.isRewardedLoaded) {
      toast.error('Ad is loading, please wait... ⏳');
      return false;
    }

    if (this.isNative) {
      return new Promise(async (resolve) => {
        let rewardListener: any;
        let closeListener: any;
        
        try {
          rewardListener = await AdMob.addListener(RewardAdPluginEvents.Rewarded, () => {
            toast.success('🔥 +5 roast unlocked!', {
              icon: '🔥',
              style: { borderRadius: '10px', background: '#333', color: '#fff' },
            });
            resolve(true);
          });
          
          closeListener = await AdMob.addListener(RewardAdPluginEvents.Dismissed, () => {
            if (rewardListener) rewardListener.remove();
            if (closeListener) closeListener.remove();
            this.isRewardedLoaded = false;
            this.preloadRewarded();
            resolve(false); // If they closed without reward, it resolves false (or true if rewardListener fired first)
          });

          await AdMob.showRewardVideoAd();
        } catch (e) {
          console.error('Failed to show rewarded ad', e);
          if (rewardListener) rewardListener.remove();
          if (closeListener) closeListener.remove();
          resolve(false);
        }
      });
    } else {
      return new Promise((resolve) => {
        const confirmed = window.confirm('[AD SIMULATION] Rewarded Ad\n\nWatch this ad to unlock 5 more roasts!\n\nClick OK to finish watching.');
        if (confirmed) {
          toast.success('🔥 +5 roast unlocked!', {
            icon: '🔥',
            style: {
              borderRadius: '10px',
              background: '#333',
              color: '#fff',
            },
          });
          this.isRewardedLoaded = false;
          this.preloadRewarded(); // Preload next one
          resolve(true);
        } else {
          toast.error('Ad complete না করলে reward পাবেন না 😅');
          resolve(false);
        }
      });
    }
  }

  static incrementInterstitialCounter(): number {
    this.interstitialCount++;
    return this.interstitialCount;
  }

  static resetInterstitialCounter() {
    this.interstitialCount = 0;
  }

  static getInterstitialCount() {
    return this.interstitialCount;
  }
}

export const BannerAd = ({ placement = 'chat' }: { placement?: 'chat' | 'settings' | 'bottom' }) => {
  const [isNative, setIsNative] = useState(false);

  useEffect(() => {
    const checkNative = async () => {
      if (Capacitor.isNativePlatform()) {
        setIsNative(true);
        try {
          await AdMob.showBanner({
            adId: AdService.BANNER_ID,
            adSize: BannerAdSize.BANNER,
            position: BannerAdPosition.BOTTOM_CENTER,
            margin: 0,
            isTesting: false,
          });
        } catch (e) {
          console.error('Failed to show banner ad', e);
        }
      }
    };
    checkNative();

    return () => {
      if (Capacitor.isNativePlatform()) {
        AdMob.hideBanner().catch(console.error);
      }
    };
  }, []);

  if (isNative) {
    // Native banner overlays the screen, so we just return an empty placeholder
    return <div className="h-12 w-full bg-black"></div>;
  }

  const heightClass = placement === 'settings' ? 'h-16 rounded-xl border' : 'h-12';
  
  return (
    <div className={cn(
      "w-full bg-zinc-900/50 border-t border-white/5 flex items-center justify-center p-2",
      heightClass
    )}>
      <div className="flex flex-col items-center">
        <span className="text-[8px] uppercase tracking-widest text-zinc-600 font-bold mb-1">Sponsored Ad</span>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-purple-600/20 rounded flex items-center justify-center">
            <div className="w-3 h-3 bg-purple-500 rounded-sm animate-pulse" />
          </div>
          <span className="text-[10px] text-zinc-400 font-medium">SavageAI Premium - No Ads, More Roasts!</span>
        </div>
      </div>
    </div>
  );
};
