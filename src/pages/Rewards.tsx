import React from 'react';
import { motion } from 'motion/react';
import { Gift, Zap, Star, TrendingUp, Clock } from 'lucide-react';
import { UserData } from '../App';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../firebase';
import { AdService } from '../services/AdService';
import { handleFirestoreError, OperationType } from '../lib/firestore-error';
import { toast } from 'react-hot-toast';

interface RewardsProps {
  user: UserData | null;
}

export default function Rewards({ user }: RewardsProps) {
  const remainingRoasts = (user?.daily_limit || 10) - (user?.used_messages || 0) + (user?.reward_balance || 0);

  const [isLoading, setIsLoading] = React.useState(false);

  const handleReward = async () => {
    if (!user || isLoading) return;
    setIsLoading(true);
    try {
      const success = await AdService.showRewarded();
      if (success) {
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
          reward_balance: increment(5)
        });
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 flex flex-col gap-8">
      <div className="space-y-2">
        <h2 className="text-3xl font-black tracking-tighter">Rewards 🎁</h2>
        <p className="text-zinc-500 text-sm">Ad দেখে extra roast আনলক করো।</p>
      </div>

      {/* Current Balance Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Zap className="w-24 h-24" fill="currentColor" />
        </div>
        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
              <Star className="w-5 h-5 text-white fill-current" />
            </div>
            <span className="text-sm font-bold uppercase tracking-widest">Message Limit</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-black">{Math.max(0, remainingRoasts)}</span>
            <span className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Available</span>
          </div>
        </div>
      </div>

      {/* Reward Tasks */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 px-1">Daily Tasks</h3>
        
        <div className="space-y-3">
          <div className="p-4 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <h4 className="font-bold">Daily Login</h4>
                <p className="text-xs text-zinc-500">Claimed automatically</p>
              </div>
            </div>
            <span className="text-sm font-black text-blue-500">+10 Roasts</span>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-900 border border-white/5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <h4 className="font-bold">Watch Ad</h4>
                  <p className="text-xs text-zinc-500">Ad দেখে ৫টা extra roast আনলক করো</p>
                </div>
              </div>
              <span className="text-sm font-black text-purple-500">+5 Roasts</span>
            </div>
            
            <button 
              onClick={handleReward}
              disabled={isLoading}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black text-sm shadow-lg shadow-purple-500/20 hover:scale-[1.02] transition-all active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
            >
              {isLoading ? 'Ad Loading... ⏳' : 'Ad দেখে +5 roast আনলক করো 😈'}
            </button>
          </div>
        </div>
      </div>

      {/* Premium Banner */}
      <div 
        onClick={() => toast.success('Premium is coming soon! 💎')}
        className="mt-4 p-6 rounded-3xl bg-zinc-900 border border-white/5 flex items-center justify-between group cursor-pointer hover:border-purple-500/50 transition-all"
      >
        <div className="space-y-1">
          <h4 className="font-black text-lg group-hover:text-purple-400 transition-colors">Go Premium</h4>
          <p className="text-xs text-zinc-500">Unlimited roasts & No Ads</p>
        </div>
        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-purple-500/20 transition-all">
          <Gift className="w-6 h-6 text-zinc-400 group-hover:text-purple-400" />
        </div>
      </div>
    </div>
  );
}
