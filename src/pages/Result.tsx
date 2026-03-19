import React from 'react';
import { motion } from 'motion/react';
import { Copy, Share2, RefreshCw, ChevronLeft, Quote } from 'lucide-react';
import { RoastMode } from '../services/geminiService';
import { cn } from '../lib/utils';

interface ResultProps {
  roast: { input: string, output: string, mode: RoastMode } | null;
  onBack: () => void;
}

export default function Result({ roast, onBack }: ResultProps) {
  if (!roast) return null;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(roast.output);
    // Could add a toast here
  };

  const shareRoast = () => {
    if (navigator.share) {
      navigator.share({
        title: 'SavageAI Roast',
        text: roast.output,
        url: window.location.href,
      });
    }
  };

  return (
    <div className="p-6 flex flex-col gap-8 h-full">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors w-fit"
      >
        <ChevronLeft className="w-5 h-5" />
        <span className="text-sm font-bold uppercase tracking-widest">Back to Home</span>
      </button>

      <div className="flex-1 flex flex-col justify-center gap-8">
        {/* Roast Card */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative group"
        >
          {/* Decorative elements */}
          <div className="absolute -top-4 -left-4 w-12 h-12 bg-purple-600/20 blur-2xl rounded-full" />
          <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-pink-600/20 blur-2xl rounded-full" />
          
          <div className="relative bg-zinc-900 border border-white/10 rounded-3xl p-8 shadow-2xl overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Quote className="w-24 h-24 rotate-180" />
            </div>
            
            <div className="space-y-6 relative z-10">
              <div className="flex items-center gap-2">
                <div className={cn(
                  "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                  roast.mode === 'savage' ? "bg-red-500/20 text-red-500" :
                  roast.mode === 'funny' ? "bg-yellow-500/20 text-yellow-500" :
                  roast.mode === 'dark' ? "bg-zinc-500/20 text-zinc-400" :
                  "bg-pink-500/20 text-pink-500"
                )}>
                  {roast.mode} Mode
                </div>
              </div>

              <p className="text-2xl font-bold leading-tight italic">
                "{roast.output}"
              </p>

              <div className="pt-6 border-t border-white/5 flex flex-col gap-1">
                <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Roasting:</span>
                <span className="text-sm text-zinc-400">{roast.input}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={copyToClipboard}
            className="flex items-center justify-center gap-3 py-4 rounded-2xl bg-zinc-900 border border-white/10 font-bold hover:bg-zinc-800 transition-all active:scale-95"
          >
            <Copy className="w-5 h-5" />
            Copy
          </button>
          <button
            onClick={shareRoast}
            className="flex items-center justify-center gap-3 py-4 rounded-2xl bg-zinc-900 border border-white/10 font-bold hover:bg-zinc-800 transition-all active:scale-95"
          >
            <Share2 className="w-5 h-5" />
            Share
          </button>
        </div>

        <button
          onClick={onBack}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 font-black text-lg flex items-center justify-center gap-3 shadow-xl shadow-purple-500/20 active:scale-95 transition-all"
        >
          <RefreshCw className="w-5 h-5" />
          ROAST AGAIN
        </button>
      </div>
    </div>
  );
}
