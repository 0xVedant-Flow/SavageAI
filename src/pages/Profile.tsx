import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { History, BarChart3, Award, Trash2, Clock, Flame } from 'lucide-react';
import { UserData } from '../App';
import { collection, query, where, orderBy, limit, getDocs, deleteDoc, doc, writeBatch } from 'firebase/firestore';
import { db } from '../firebase';
import { toast } from 'react-hot-toast';
import { handleFirestoreError, OperationType } from '../lib/firestore-error';

interface ProfileProps {
  user: UserData | null;
}

interface RoastHistory {
  id: string;
  input: string;
  output: string;
  mode: string;
  createdAt: string;
}

export default function Profile({ user }: ProfileProps) {
  const [history, setHistory] = useState<RoastHistory[]>([]);
  const [loading, setLoading] = useState(true);

  const savageLevel = Math.floor((user?.used_messages || 0) / 5) + 1;

  useEffect(() => {
    if (!user) return;

    const fetchHistory = async () => {
      const q = query(
        collection(db, 'roasts'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc'),
        limit(20)
      );

      const querySnapshot = await getDocs(q);
      const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RoastHistory));
      setHistory(docs);
      setLoading(false);
    };

    fetchHistory();
  }, [user]);

  const clearHistory = async () => {
    if (!user) return;
    if (!window.confirm('সব chat delete করতে চাও?')) return;
    
    setLoading(true);
    try {
      const q = query(collection(db, 'roasts'), where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      const batch = writeBatch(db);
      querySnapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();
      setHistory([]);
      toast.success('History cleared!');
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, 'roasts');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h2 className="text-3xl font-black tracking-tighter">Profile 👤</h2>
          <p className="text-zinc-500 text-sm">তোমার রোস্টিং জার্নি।</p>
        </div>
        <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center">
          <Award className="w-8 h-8 text-blue-500" />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard 
          icon={<BarChart3 className="w-4 h-4 text-blue-500" />}
          label="Used Today"
          value={user?.used_messages || 0}
          color="blue"
        />
        <StatCard 
          icon={<Flame className="w-4 h-4 text-purple-500" />}
          label="Savage Level"
          value={`Level ${savageLevel}`}
          color="purple"
        />
        <StatCard 
          icon={<Award className="w-4 h-4 text-emerald-500" />}
          label="Remaining"
          value={(user?.daily_limit || 10) - (user?.used_messages || 0) + (user?.reward_balance || 0)}
          color="emerald"
        />
        <StatCard 
          icon={<Clock className="w-4 h-4 text-orange-500" />}
          label="Bonus"
          value={`+${user?.reward_balance || 0}`}
          color="orange"
        />
      </div>

      {/* History Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
            <History className="w-3 h-3" />
            Recent Roasts
          </h3>
          <button 
            onClick={clearHistory}
            className="text-[10px] font-bold uppercase tracking-widest text-red-500/70 hover:text-red-500 flex items-center gap-1"
          >
            <Trash2 className="w-3 h-3" />
            Clear
          </button>
        </div>

        <div className="space-y-3">
          {loading ? (
            [0, 1, 2].map(i => <div key={i} className="h-24 rounded-2xl bg-zinc-900/50 animate-pulse" />)
          ) : history.length > 0 ? (
            history.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-4 rounded-2xl bg-zinc-900 border border-white/5 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-purple-500">{item.mode}</span>
                  <span className="text-[10px] text-zinc-600 flex items-center gap-1">
                    <Clock className="w-2 h-2" />
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm font-medium line-clamp-2 italic text-zinc-300">"{item.output}"</p>
                <p className="text-[10px] text-zinc-600 truncate">Target: {item.input}</p>
              </motion.div>
            ))
          ) : (
            <div className="py-12 text-center space-y-2">
              <p className="text-zinc-600 font-bold uppercase tracking-widest text-xs">No roasts yet</p>
              <p className="text-zinc-700 text-[10px]">Start roasting to build your history!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: string | number, color: string }) {
  return (
    <div className="p-4 rounded-2xl bg-zinc-900 border border-white/5 space-y-2">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{label}</span>
      </div>
      <div className="text-2xl font-black">{value}</div>
    </div>
  );
}
