import React from 'react';
import { ArrowLeft, Flame, MessageSquare, Share2, ShieldAlert } from 'lucide-react';

export function About({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex flex-col h-full bg-black text-white overflow-hidden">
      {/* Header */}
      <header className="flex items-center p-4 border-b border-white/10 bg-zinc-900/50 backdrop-blur-md sticky top-0 z-10">
        <button 
          onClick={onBack}
          className="p-2 -ml-2 mr-2 rounded-full hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold">About Us</h1>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8 pb-24">
        
        {/* Hero Section */}
        <div className="flex flex-col items-center text-center space-y-4 mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-purple-600 to-pink-600 rounded-3xl flex items-center justify-center shadow-lg shadow-purple-500/20 mb-2">
            <Flame className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-3xl font-black tracking-tight bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
            SavageAI Bangla
          </h2>
          <p className="text-zinc-400 font-medium">AI Roaster Chat App v1.0.0</p>
        </div>

        {/* Description */}
        <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6">
          <p className="text-zinc-300 leading-relaxed text-center">
            SavageAI Bangla is a fun AI chat application that provides funny and entertaining roast-style responses in Bangla. You can chat with AI in a simple and smooth interface and receive instant humorous replies. The app is designed for entertainment purposes only.
          </p>
        </div>

        {/* Features */}
        <div>
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-purple-400" />
            Features
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-4 bg-zinc-900/30 p-4 rounded-xl border border-white/5">
              <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0">
                <MessageSquare className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h4 className="font-semibold text-zinc-200">Bangla AI Chat System</h4>
                <p className="text-sm text-zinc-500">Interactive and engaging AI conversations in Bangla.</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 bg-zinc-900/30 p-4 rounded-xl border border-white/5">
              <div className="w-10 h-10 rounded-full bg-pink-500/20 flex items-center justify-center shrink-0">
                <Flame className="w-5 h-5 text-pink-400" />
              </div>
              <div>
                <h4 className="font-semibold text-zinc-200">Funny & Light Roast Replies</h4>
                <p className="text-sm text-zinc-500">Humorous replies designed for entertainment.</p>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-zinc-900/30 p-4 rounded-xl border border-white/5">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                <Share2 className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h4 className="font-semibold text-zinc-200">Clean & Easy-to-use Interface</h4>
                <p className="text-sm text-zinc-500">Fast performance and lightweight design.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Ad Info */}
        <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6 text-center">
          <p className="text-zinc-400 text-sm">
            This app uses Google AdMob ads to support free usage.
          </p>
        </div>

        {/* Mission */}
        <div className="text-center py-6 border-y border-white/5">
          <h3 className="text-sm uppercase tracking-widest text-zinc-500 font-bold mb-2">Our Mission</h3>
          <p className="text-lg font-medium text-zinc-200 italic">
            "To make people laugh with AI-powered humor."
          </p>
        </div>

        {/* Contact */}
        <div className="text-center pb-8">
          <p className="text-zinc-400 mb-2">Have feedback or need help?</p>
          <a 
            href="mailto:support@savageai.app" 
            className="inline-flex items-center justify-center px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-medium text-white transition-colors"
          >
            support@savageai.app
          </a>
        </div>

      </div>
    </div>
  );
}
