import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Film, Zap, AlertTriangle } from 'lucide-react';
import { AdService } from '../services/AdService';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../firebase';
import { UserData } from '../App';
import { toast } from 'react-hot-toast';

export const Reward = ({ user }: { user: UserData }) => {
  const [loading, setLoading] = useState(false);

  const handleRewardAd = async () => {
    setLoading(true);
    const success = await AdService.showRewarded();
    
    if (success) {
      try {
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
          reward_balance: increment(5),
          daily_limit: increment(5)
        });
        toast.success('🔥 +5 roast unlocked!', {
          style: { background: '#18181b', color: '#fff' }
        });
      } catch (error) {
        console.error('Error updating reward:', error);
        toast.error('Error updating reward balance.');
      }
    } else {
      toast.error('Ad complete না করলে reward পাবেন না 😅', {
        style: { background: '#18181b', color: '#fff' }
      });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-8 text-purple-400">Get More Roasts 😈</h1>

      <div className="w-full max-w-sm bg-zinc-900 p-6 rounded-3xl mb-6 shadow-xl border border-zinc-800">
        <div className="text-center mb-4">
          <p className="text-zinc-400">Remaining roasts today</p>
          <p className="text-4xl font-bold text-white">{user.daily_limit - user.used_messages} 😏</p>
        </div>
        <div className="text-center">
          <p className="text-zinc-400">Reward balance</p>
          <p className="text-2xl font-semibold text-purple-400">{user.reward_balance}</p>
        </div>
      </div>

      <motion.div 
        whileHover={{ scale: 1.02 }}
        className="w-full max-w-sm bg-gradient-to-br from-purple-900 to-blue-900 p-8 rounded-3xl text-center shadow-2xl border border-purple-500/30"
      >
        <h2 className="text-2xl font-bold mb-2">Watch Ad & Unlock More 🔥</h2>
        <p className="text-purple-200 mb-6">+5 Roasts</p>
        
        <button 
          onClick={handleRewardAd}
          disabled={loading}
          className="w-full py-4 bg-white text-purple-900 rounded-2xl font-bold text-lg flex items-center justify-center gap-2"
        >
          <Film className="w-6 h-6" />
          {loading ? 'Loading...' : 'Watch Ad 🎬'}
        </button>
      </motion.div>
    </div>
  );
};
