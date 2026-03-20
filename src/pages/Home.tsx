import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Sparkles, Flame, Ghost, Heart, AlertCircle, Smile } from 'lucide-react';
import { Page, UserData } from '../App';
import { generateRoast } from '../services/openaiService';
import { RoastMode } from '../services/geminiService';
import { cn } from '../lib/utils';
import { doc, updateDoc, increment, collection, addDoc, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { handleFirestoreError, OperationType } from '../lib/firestore-error';
import { AdService } from '../services/AdService';
import { toast } from 'react-hot-toast';

interface HomeProps {
  user: UserData | null;
  onResult: (input: string, output: string, mode: RoastMode) => void;
  setActiveTab: (tab: Page) => void;
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: number;
}

const MODES: { id: RoastMode, label: string, icon: React.ReactNode, color: string }[] = [
  { id: 'funny', label: 'Funny 😂', icon: <Sparkles className="w-4 h-4" />, color: 'from-yellow-400 to-orange-500' },
  { id: 'savage', label: 'Savage 😈', icon: <Flame className="w-4 h-4" />, color: 'from-blue-600 to-purple-600' },
  { id: 'dark', label: 'Dark 🌚', icon: <Ghost className="w-4 h-4" />, color: 'from-zinc-700 to-black' },
  { id: 'friendly', label: 'Friendly 🙂', icon: <Heart className="w-4 h-4" />, color: 'from-pink-400 to-rose-500' },
];

export default function Home({ user, onResult, setActiveTab }: HomeProps) {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<RoastMode>(user?.defaultMode || 'savage');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const remainingRoasts = (user?.daily_limit || 10) - (user?.used_messages || 0) + (user?.reward_balance || 0);

  useEffect(() => {
    if (user?.defaultMode) setMode(user.defaultMode);
  }, [user?.defaultMode]);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'roasts'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newMessages: Message[] = [];
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        newMessages.push({
          id: doc.id + '_user',
          text: data.input,
          sender: 'user',
          timestamp: new Date(data.createdAt).getTime()
        });
        newMessages.push({
          id: doc.id + '_ai',
          text: data.output,
          sender: 'ai',
          timestamp: new Date(data.createdAt).getTime() + 1
        });
      });
      setMessages(newMessages.sort((a, b) => a.timestamp - b.timestamp));
    }, (error) => handleFirestoreError(error, OperationType.GET, 'roasts'));

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    
    // Daily Limit Check
    if (remainingRoasts <= 0) {
      toast.error("Limit শেষ 😈\nAd দেখে চালাও অথবা কাল আসো", {
        icon: '😈',
        duration: 4000
      });
      setActiveTab('rewards');
      return;
    }

    const userInput = input;
    setInput('');
    setLoading(true);
    setError(null);

    // Add user message to UI immediately
    const tempMessage: Message = {
      id: 'temp_' + Date.now(),
      text: userInput,
      sender: 'user',
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, tempMessage]);

    try {
      const roast = await generateRoast(userInput, mode, user?.language || 'bn');
      
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        
        // Handle Reward Balance vs Daily Limit
        if (user.used_messages < user.daily_limit) {
          await updateDoc(userRef, {
            used_messages: increment(1)
          }).catch(error => handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`));
        } else {
          await updateDoc(userRef, {
            reward_balance: increment(-1)
          }).catch(error => handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`));
        }

        await addDoc(collection(db, 'roasts'), {
          userId: user.uid,
          input: userInput,
          output: roast,
          mode,
          createdAt: new Date().toISOString()
        }).catch(error => handleFirestoreError(error, OperationType.CREATE, 'roasts'));

        // Interstitial Ad Logic: Every 5 messages
        const count = AdService.incrementInterstitialCounter();
        if (count >= 5) {
          await AdService.showInterstitial();
          AdService.resetInterstitialCounter();
        }
      }
    } catch (err) {
      console.error("Roast Error:", err);
      setError("আজকে roast server ছুটি নিয়েছে 😴");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-black relative">
      {/* Mode Selector Bar */}
      <div className="flex items-center gap-2 px-4 py-2 overflow-x-auto no-scrollbar border-b border-white/5 bg-zinc-900/20">
        {MODES.map((m) => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-full border whitespace-nowrap transition-all duration-200",
              mode === m.id 
                ? `bg-gradient-to-r ${m.color} border-transparent text-white font-bold text-xs` 
                : "bg-zinc-900/50 border-white/5 text-zinc-500 text-xs"
            )}
          >
            {m.icon}
            {m.label}
          </button>
        ))}
      </div>

      {/* Chat Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
      >
        {messages.length === 0 && !loading && (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center">
              <Smile className="w-8 h-8 text-zinc-700" />
            </div>
            <p className="text-zinc-500 text-sm font-medium">
              কি নিয়ে roast চাও? <br /> চ্যাটে লিখে পাঠাও! 😈
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className={cn(
              "flex w-full",
              msg.sender === 'user' ? "justify-end" : "justify-start"
            )}
          >
            <div className={cn(
              "max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed",
              msg.sender === 'user' 
                ? "bg-blue-600 text-white rounded-tr-none" 
                : "bg-zinc-800 text-zinc-100 rounded-tl-none"
            )}>
              {msg.text}
            </div>
          </motion.div>
        ))}

        {loading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="bg-zinc-800 text-zinc-400 px-4 py-2.5 rounded-2xl rounded-tl-none text-xs font-medium flex items-center gap-2">
              <div className="flex gap-1">
                <div className="w-1 h-1 bg-zinc-500 rounded-full animate-bounce" />
                <div className="w-1 h-1 bg-zinc-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-1 h-1 bg-zinc-500 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
              AI roast করছে...
            </div>
          </motion.div>
        )}

        {error && (
          <div className="flex justify-center">
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-2 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-black border-t border-white/10">
        <div className="flex items-center gap-2 mt-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="কি নিয়ে roast চাও?"
              className="w-full bg-zinc-900 border border-white/10 rounded-full px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className={cn(
              "w-11 h-11 rounded-full flex items-center justify-center transition-all active:scale-90",
              !input.trim() || loading
                ? "bg-zinc-800 text-zinc-600"
                : "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/20"
            )}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
