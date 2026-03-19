import React from 'react';
import { motion } from 'motion/react';
import { Zap } from 'lucide-react';

export default function SplashScreen() {
  return (
    <div className="h-screen bg-black flex flex-col items-center justify-center text-white p-6">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ 
          type: "spring",
          stiffness: 260,
          damping: 20,
          duration: 0.8 
        }}
        className="relative"
      >
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-[0_0_40px_rgba(168,85,247,0.4)]">
          <Zap className="w-14 h-14 text-white" fill="currentColor" />
        </div>
        
        {/* Glow effect */}
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 bg-purple-500 blur-3xl -z-10 rounded-full"
        />
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="mt-8 text-center"
      >
        <h1 className="text-4xl font-black tracking-tighter bg-gradient-to-r from-white via-blue-200 to-zinc-500 bg-clip-text text-transparent">
          SAVAGE AI BANGLA
        </h1>
        <p className="text-zinc-500 font-medium tracking-widest mt-2 uppercase text-xs">
          AI Roaster Chat 😈
        </p>
      </motion.div>

      <div className="absolute bottom-12 flex flex-col items-center gap-4">
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ 
                scale: [1, 1.5, 1],
                opacity: [0.3, 1, 0.3]
              }}
              transition={{ 
                duration: 1, 
                repeat: Infinity, 
                delay: i * 0.2 
              }}
              className="w-1.5 h-1.5 rounded-full bg-blue-500"
            />
          ))}
        </div>
        <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-[0.2em]">
          Savage Energy Loading...
        </span>
      </div>
    </div>
  );
}
