import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signInAnonymously, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import Layout from './components/Layout';
import Home from './pages/Home';
import { Welcome } from './pages/Welcome';
import Rewards from './pages/Rewards';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Result from './pages/Result';
import SplashScreen from './pages/SplashScreen';
import { RoastMode } from './services/geminiService';
import { AlertCircle, LogIn } from 'lucide-react';

import { Toaster } from 'react-hot-toast';
import { AdService } from './services/AdService';

import { handleFirestoreError, OperationType } from './lib/firestore-error';

export type Page = 'home' | 'rewards' | 'profile' | 'settings' | 'result' | 'splash' | 'login' | 'welcome';

export interface UserData {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  role: 'admin' | 'client';
  used_messages: number;
  daily_limit: number;
  reward_balance: number;
  last_reset_date: string;
  isPremium?: boolean;
  language: 'bn' | 'en';
  safeMode: boolean;
  defaultMode: RoastMode;
  notificationsEnabled: boolean;
  is_first_time: boolean;
}

export default function App() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Page>('splash');
  const [lastRoast, setLastRoast] = useState<{ input: string, output: string, mode: RoastMode } | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      setAuthError(null);
    } catch (err: any) {
      setAuthError(err.message);
    }
  };

  useEffect(() => {
    AdService.initialize();

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userRef = doc(db, 'users', firebaseUser.uid);
        
        const unsubDoc = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data() as UserData;
            const today = new Date().toLocaleDateString();
            const lastReset = data.last_reset_date ? new Date(data.last_reset_date).toLocaleDateString() : today;
            
            if (today !== lastReset) {
              setDoc(userRef, {
                ...data,
                used_messages: 0,
                last_reset_date: new Date().toISOString()
              }, { merge: true }).catch(err => handleFirestoreError(err, OperationType.WRITE, `users/${firebaseUser.uid}`));
            }
            setUser(data);
            setLoading(false);
            if (activeTab === 'login' || activeTab === 'splash') {
              if (data?.is_first_time) setActiveTab('welcome');
              else setActiveTab('home');
            }
          } else {
            const newUser: UserData = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || 'Savage User',
              photoURL: firebaseUser.photoURL || '',
              role: 'client',
              used_messages: 0,
              daily_limit: 10,
              last_reset_date: new Date().toISOString(),
              reward_balance: 0,
              is_first_time: true,
              language: 'bn',
              safeMode: true,
              defaultMode: 'funny',
              notificationsEnabled: true
            };
            setDoc(userRef, newUser).catch(err => handleFirestoreError(err, OperationType.WRITE, `users/${firebaseUser.uid}`));
            setUser(newUser);
            setLoading(false);
            if (activeTab === 'login' || activeTab === 'splash') setActiveTab('welcome');
          }
        }, (error) => {
          handleFirestoreError(error, OperationType.GET, `users/${firebaseUser.uid}`);
        });

        return () => unsubDoc();
      } else {
        setLoading(false);
        if (activeTab !== 'splash') setActiveTab('login');
      }
    });

    const timer = setTimeout(() => {
      if (activeTab === 'splash') {
        if (auth.currentUser) setActiveTab('home');
        else setActiveTab('login');
      }
    }, 2500);

    return () => {
      unsubscribe();
      clearTimeout(timer);
    };
  }, [activeTab]);

  if (activeTab === 'welcome') {
    return <Welcome onStart={async () => {
      if (user) {
        await updateDoc(doc(db, 'users', user.uid), { is_first_time: false });
        setActiveTab('home');
      }
    }} />;
  }

  if (activeTab === 'splash') {
    return <SplashScreen />;
  }

  if (activeTab === 'login') {
    return (
      <div className="h-screen bg-black flex flex-col items-center justify-center p-6 text-white text-center">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center mb-8 shadow-lg shadow-purple-500/20">
          <LogIn className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl font-black tracking-tighter mb-2">Welcome to SavageAI</h1>
        <p className="text-zinc-500 mb-8 max-w-xs">Sign in to start roasting and track your savage stats.</p>
        
        <div className="w-full max-w-xs space-y-4">
          <button 
            onClick={handleGoogleLogin}
            className="w-full py-4 rounded-2xl bg-white text-black font-bold flex items-center justify-center gap-3 hover:bg-zinc-200 transition-all active:scale-95"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
            Continue with Google
          </button>
        </div>

        {authError && (
          <div className="mt-8 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex flex-col items-center gap-2 text-red-400 text-xs max-w-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span className="font-bold uppercase tracking-widest">Auth Error</span>
            </div>
            <p>{authError}</p>
          </div>
        )}
      </div>
    );
  }

  const remainingRoasts = (user?.daily_limit || 10) - (user?.used_messages || 0) + (user?.reward_balance || 0);

  const renderPage = () => {
    switch (activeTab) {
      case 'home':
        return <Home 
          user={user} 
          onResult={(input, output, mode) => {
            setLastRoast({ input, output, mode });
            setActiveTab('result');
          }} 
          setActiveTab={setActiveTab}
        />;
      case 'rewards':
        return <Rewards user={user} />;
      case 'profile':
        return <Profile user={user} />;
      case 'settings':
        return <Settings user={user} />;
      case 'result':
        return <Result 
          roast={lastRoast} 
          onBack={() => setActiveTab('home')} 
        />;
      default:
        return <Home user={user} onResult={() => {}} setActiveTab={setActiveTab} />;
    }
  };

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <Layout 
        activeTab={activeTab === 'result' ? 'home' : activeTab} 
        setActiveTab={(tab) => setActiveTab(tab as Page)}
        roastCount={Math.max(0, remainingRoasts)}
      >
        {renderPage()}
      </Layout>
    </>
  );
}
