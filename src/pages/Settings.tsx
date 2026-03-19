import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Globe, Shield, Bell, Database, 
  CreditCard, FileText, Mail, ChevronRight, 
  Trash2, AlertTriangle, Check, ExternalLink,
  Settings as SettingsIcon, Info, MessageSquare
} from 'lucide-react';
import { doc, updateDoc, collection, query, where, getDocs, deleteDoc, writeBatch, limit } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { UserData } from '../App';
import { RoastMode } from '../services/geminiService';
import { cn } from '../lib/utils';
import { toast } from 'react-hot-toast';
import { AdService } from '../services/AdService';
import { handleFirestoreError, OperationType } from '../lib/firestore-error';
import { PrivacyPolicy } from './PrivacyPolicy';
import { TermsConditions } from './TermsConditions';
import { About } from './About';

interface SettingsProps {
  user: UserData | null;
}

export default function Settings({ user }: SettingsProps) {
  const [isClearing, setIsClearing] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [activePage, setActivePage] = useState<'settings' | 'privacy' | 'terms' | 'about'>('settings');

  const updateSetting = async (field: keyof UserData, value: any) => {
    if (!user) return;
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { [field]: value });
      toast.success('Settings updated!');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const handleClearHistory = async () => {
    if (!user) return;
    setIsClearing(true);
    try {
      const q = query(collection(db, 'roasts'), where('userId', '==', user.uid), limit(500));
      const snapshot = await getDocs(q);
      const batch = writeBatch(db);
      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();
      toast.success('Chat history cleared!');
      setShowClearConfirm(false);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, 'roasts');
    } finally {
      setIsClearing(false);
    }
  };

  const [isAdLoading, setIsAdLoading] = useState(false);

  const handleWatchAd = async () => {
    if (!user || isAdLoading) return;
    setIsAdLoading(true);
    try {
      const success = await AdService.showRewarded();
      if (success) {
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
          reward_balance: (user.reward_balance || 0) + 5
        });
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
    } finally {
      setIsAdLoading(false);
    }
  };

  const handleReportProblem = () => {
    toast.success('Report feature coming soon! 🚀\nFor now, please email us.', {
      duration: 4000,
      icon: '📬'
    });
  };

  const handleGoPremium = () => {
    toast.success('Premium is coming soon! 💎\nStay tuned for unlimited roasts.', {
      duration: 4000,
      icon: '💎'
    });
  };

  const handleShareApp = () => {
    if (navigator.share) {
      navigator.share({
        title: 'SavageAI Bangla',
        text: 'Check out this savage AI roaster! 😈',
        url: window.location.origin
      }).catch(() => {
        toast.error('Could not share. Copy the link manually!');
      });
    } else {
      navigator.clipboard.writeText(window.location.origin);
      toast.success('Link copied to clipboard! 📋');
    }
  };

  if (activePage === 'privacy') return <PrivacyPolicy onBack={() => setActivePage('settings')} />;
  if (activePage === 'terms') return <TermsConditions onBack={() => setActivePage('settings')} />;
  if (activePage === 'about') return <About onBack={() => setActivePage('settings')} />;

  const SettingCard = ({ icon: Icon, title, children }: { icon: any, title: string, children: React.ReactNode }) => (
    <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-4 space-y-4">
      <div className="flex items-center gap-3 text-zinc-400">
        <Icon className="w-4 h-4" />
        <span className="text-xs font-bold uppercase tracking-widest">{title}</span>
      </div>
      {children}
    </div>
  );

  const Toggle = ({ enabled, onToggle, label }: { enabled: boolean, onToggle: () => void, label: string }) => (
    <div className="flex items-center justify-between py-1">
      <span className="text-sm text-zinc-300 font-medium">{label}</span>
      <button 
        onClick={onToggle}
        className={cn(
          "w-12 h-6 rounded-full p-1 transition-all duration-300 relative",
          enabled ? "bg-purple-600 shadow-[0_0_10px_rgba(147,51,234,0.5)]" : "bg-zinc-800"
        )}
      >
        <div className={cn(
          "w-4 h-4 rounded-full bg-white transition-all duration-300",
          enabled ? "translate-x-6" : "translate-x-0"
        )} />
      </button>
    </div>
  );

  const Select = ({ value, options, onChange, label }: { value: string, options: { id: string, label: string }[], onChange: (val: any) => void, label: string }) => (
    <div className="space-y-2">
      <span className="text-sm text-zinc-300 font-medium">{label}</span>
      <div className="grid grid-cols-2 gap-2">
        {options.map(opt => (
          <button
            key={opt.id}
            onClick={() => onChange(opt.id)}
            className={cn(
              "py-2.5 px-4 rounded-xl text-xs font-bold transition-all border",
              value === opt.id 
                ? "bg-white text-black border-white" 
                : "bg-zinc-800/50 text-zinc-500 border-white/5 hover:border-white/10"
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-black overflow-y-auto no-scrollbar pb-24">
      <div className="p-6 space-y-8">
        <header className="flex items-center justify-between">
          <h1 className="text-3xl font-black tracking-tighter text-white">Settings ⚙️</h1>
        </header>

        {/* Go Premium Section */}
        <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-3xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <CreditCard className="w-24 h-24 text-purple-500" />
          </div>
          <div className="relative z-10">
            <h2 className="text-xl font-black text-white mb-2">Go Premium 💎</h2>
            <p className="text-zinc-400 text-xs mb-6 leading-relaxed max-w-[200px]">
              Unlock unlimited roasts, exclusive modes, and remove all ads forever.
            </p>
            <button 
              onClick={handleGoPremium}
              className="px-6 py-2.5 bg-white text-black text-xs font-black rounded-full hover:scale-105 transition-all active:scale-95"
            >
              UPGRADE NOW
            </button>
          </div>
        </div>

        {/* Section 1: General */}
        <SettingCard icon={Globe} title="General">
          <Select 
            label="Language"
            value={user?.language || 'bn'}
            options={[
              { id: 'bn', label: 'Bangla 🇧🇩' },
              { id: 'en', label: 'English 🇺🇸' }
            ]}
            onChange={(val) => updateSetting('language', val)}
          />
          <div className="pt-2">
            <span className="text-sm text-zinc-300 font-medium block mb-2">Default Roast Mode</span>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'funny', label: 'Funny 😂' },
                { id: 'savage', label: 'Savage 😈' },
                { id: 'friendly', label: 'Friendly 🙂' },
                { id: 'dark', label: 'Dark 🌚' }
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => updateSetting('defaultMode', opt.id)}
                  className={cn(
                    "py-2.5 px-4 rounded-xl text-[10px] font-bold transition-all border",
                    user?.defaultMode === opt.id 
                      ? "bg-purple-600 text-white border-purple-500 shadow-[0_0_15px_rgba(147,51,234,0.3)]" 
                      : "bg-zinc-800/50 text-zinc-500 border-white/5"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </SettingCard>

        {/* Section 2: Safety */}
        <SettingCard icon={Shield} title="Safety">
          <Toggle 
            label="Safe Mode"
            enabled={user?.safeMode ?? true}
            onToggle={() => updateSetting('safeMode', !(user?.safeMode ?? true))}
          />
          <p className="text-[10px] text-zinc-500 leading-relaxed">
            {user?.safeMode 
              ? "Safe Mode is ON. Strong/sensitive roasts are filtered." 
              : "Safe Mode is OFF. More savage roasts are allowed."}
          </p>
        </SettingCard>

        {/* Section 3: Notifications */}
        <SettingCard icon={Bell} title="Notifications">
          <Toggle 
            label="Daily Roast Reminder"
            enabled={user?.notificationsEnabled ?? false}
            onToggle={() => updateSetting('notificationsEnabled', !(user?.notificationsEnabled ?? false))}
          />
          <Toggle 
            label="Reward Reminder"
            enabled={true}
            onToggle={() => {}}
          />
        </SettingCard>

        {/* Section 4: Data */}
        <SettingCard icon={Database} title="Data">
          <button 
            onClick={() => setShowClearConfirm(true)}
            className="w-full py-3 px-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-bold flex items-center justify-center gap-2 hover:bg-red-500/20 transition-all"
          >
            <Trash2 className="w-4 h-4" />
            Clear Chat History
          </button>
        </SettingCard>

        {/* Section 5: Rewards */}
        <SettingCard icon={CreditCard} title="Rewards">
          <div className="flex items-center justify-between bg-zinc-800/50 p-4 rounded-xl border border-white/5">
            <div>
              <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mb-1">Remaining Roasts</p>
              <p className="text-xl font-black text-white">
                {(user?.daily_limit || 10) - (user?.used_messages || 0) + (user?.reward_balance || 0)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mb-1">Bonus Balance</p>
              <p className="text-xl font-black text-purple-500">+{user?.reward_balance || 0}</p>
            </div>
          </div>
          <button 
            onClick={handleWatchAd}
            disabled={isAdLoading}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black text-sm shadow-lg shadow-purple-500/20 hover:scale-[1.02] transition-all active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
          >
            {isAdLoading ? 'Ad Loading... ⏳' : 'Ad দেখে +5 roast আনলক করো 😈'}
          </button>
        </SettingCard>

        {/* Section 6: Legal */}
        <SettingCard icon={FileText} title="Legal">
          <div className="space-y-1">
            <button onClick={() => setActivePage('privacy')} className="w-full flex items-center justify-between py-3 text-sm text-zinc-300 hover:text-white transition-colors group">
              Privacy Policy
              <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-white transition-colors" />
            </button>
            <button onClick={() => setActivePage('terms')} className="w-full flex items-center justify-between py-3 text-sm text-zinc-300 hover:text-white transition-colors group">
              Terms & Conditions
              <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-white transition-colors" />
            </button>
            <button onClick={() => setActivePage('about')} className="w-full flex items-center justify-between py-3 text-sm text-zinc-300 hover:text-white transition-colors group">
              About App
              <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-white transition-colors" />
            </button>
            <button 
              onClick={handleShareApp}
              className="w-full flex items-center justify-between py-3 text-sm text-zinc-300 hover:text-white transition-colors group"
            >
              Share App
              <ExternalLink className="w-4 h-4 text-zinc-600 group-hover:text-white transition-colors" />
            </button>
          </div>
        </SettingCard>

        {/* Section 7: Support */}
        <SettingCard icon={Mail} title="Support">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-300">Contact Email</span>
              <span className="text-sm text-purple-500 font-medium">support@savageai.app</span>
            </div>
            <button 
              onClick={handleReportProblem}
              className="w-full py-3 rounded-xl bg-zinc-800 border border-white/5 text-zinc-300 text-sm font-bold hover:bg-zinc-700 transition-all"
            >
              Report a Problem
            </button>
          </div>
        </SettingCard>

        <div className="text-center space-y-2 pt-4">
          <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-[0.2em]">SavageAI Bangla v1.2.0</p>
          <p className="text-[10px] text-zinc-700">Made with 😈 in Bangladesh</p>
        </div>
      </div>

      {/* Clear History Confirmation Modal */}
      <AnimatePresence>
        {showClearConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowClearConfirm(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-xs bg-zinc-900 border border-white/10 rounded-3xl p-6 shadow-2xl"
            >
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-xl font-black text-white mb-2">সব chat delete করতে চাও?</h3>
              <p className="text-zinc-500 text-sm mb-6 leading-relaxed">
                এই কাজ আর ফেরত আনা যাবে না। আপনার সব রোস্ট হিস্ট্রি মুছে যাবে।
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 py-3 rounded-xl bg-zinc-800 text-white font-bold text-sm"
                >
                  না
                </button>
                <button 
                  onClick={handleClearHistory}
                  disabled={isClearing}
                  className="flex-1 py-3 rounded-xl bg-red-600 text-white font-bold text-sm disabled:opacity-50"
                >
                  {isClearing ? 'মুছছে...' : 'হ্যাঁ, মুছো'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
