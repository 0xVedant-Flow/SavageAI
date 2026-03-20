import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, MessageSquare, Zap } from 'lucide-react';

export const Welcome = ({ onStart }: { onStart: () => void }) => {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-6 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="w-24 h-24 bg-zinc-900 rounded-3xl flex items-center justify-center mb-6 shadow-2xl shadow-purple-500/20">
          <span className="text-5xl">😈</span>
        </div>
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
          Roast Yourself 😈
        </h1>
        <p className="text-zinc-400 text-lg">AI তোমাকে roast করবে 😂</p>
      </motion.div>

      <div className="space-y-6 mb-10 w-full max-w-sm">
        <Feature icon={<Sparkles />} text="Funny & Savage Roast" />
        <Feature icon={<MessageSquare />} text="Bangla + English" />
        <Feature icon={<Zap />} text="Chat like Messenger" />
      </div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onStart}
        className="w-full max-w-sm py-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl font-bold text-lg shadow-lg shadow-purple-500/20"
      >
        Start Roasting 🔥
      </motion.button>
      
      <p className="mt-4 text-zinc-500 text-sm">Free 10 roasts daily</p>
    </div>
  );
};

const Feature = ({ icon, text }: { icon: React.ReactNode; text: string }) => (
  <div className="flex items-center gap-4 bg-zinc-900 p-4 rounded-2xl">
    <div className="text-purple-400">{icon}</div>
    <span className="font-medium">{text}</span>
  </div>
);
