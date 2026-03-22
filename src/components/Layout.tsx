import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, Trophy, User, Settings, Zap, LogOut } from 'lucide-react';
import { cn } from '../lib/utils';
import { BannerAd } from '../services/AdService';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  roastCount: number;
}

export default function Layout({ children, activeTab, setActiveTab, roastCount }: LayoutProps) {
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-black text-white font-sans overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-black/80 backdrop-blur-md z-50">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Zap className="w-6 h-6 text-white" fill="currentColor" />
            </div>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-black rounded-full" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight">
              SavageAI Bangla 😈
            </h1>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-green-500 font-bold uppercase tracking-wider">Active Now</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10">
            <span className="text-[10px] font-bold text-purple-400 uppercase">Limit:</span>
            <span className="text-xs font-black">{roastCount}</span>
          </div>
          <button onClick={handleLogout} className="p-2 rounded-full bg-zinc-900 border border-white/5 hover:bg-red-500/10 hover:border-red-500/30 transition-all text-zinc-400 hover:text-red-500">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Navigation Bar */}
      <nav className="bg-black/80 backdrop-blur-xl border-t border-white/10 px-8 py-2 flex items-center justify-between z-50">
        <NavButton
          icon={<MessageCircle className="w-6 h-6" />}
          label="Chat"
          active={activeTab === 'home'}
          onClick={() => setActiveTab('home')}
        />
        <NavButton
          icon={<Trophy className="w-6 h-6" />}
          label="Rewards"
          active={activeTab === 'rewards'}
          onClick={() => setActiveTab('rewards')}
        />
        <NavButton
          icon={<User className="w-6 h-6" />}
          label="Profile"
          active={activeTab === 'profile'}
          onClick={() => setActiveTab('profile')}
        />
        <NavButton
          icon={<Settings className="w-6 h-6" />}
          label="Settings"
          active={activeTab === 'settings'}
          onClick={() => setActiveTab('settings')}
        />
      </nav>

      {/* Banner Ad at the bottom */}
      <div className="bg-black border-t border-white/5">
        <BannerAd />
      </div>
    </div>
  );
}

function NavButton({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1 transition-all duration-200",
        active ? "text-purple-500 scale-110" : "text-zinc-500 hover:text-zinc-300"
      )}
    >
      {icon}
      <span className="text-[10px] font-bold uppercase tracking-tighter">{label}</span>
      {active && (
        <motion.div
          layoutId="nav-indicator"
          className="absolute -bottom-1 w-1 h-1 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]"
        />
      )}
    </button>
  );
}
