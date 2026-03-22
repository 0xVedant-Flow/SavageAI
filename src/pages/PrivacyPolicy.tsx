import React from 'react';
import { ArrowLeft } from 'lucide-react';

export function PrivacyPolicy({ onBack }: { onBack: () => void }) {
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
        <h1 className="text-xl font-bold">Privacy Policy</h1>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 pb-24">
        <div className="prose prose-invert max-w-none">
          <p className="text-zinc-400 text-sm mb-6">Last Updated: March 2026</p>

          <section className="mb-8">
            <h2 className="text-lg font-bold text-purple-400 mb-3">1. Introduction</h2>
            <p className="text-zinc-300 leading-relaxed">
              Welcome to SavageAI Bangla - AI Roaster Chat App. We provide AI-generated entertainment (roasts) and respect your privacy. This policy explains how we handle information when you use our app.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-bold text-purple-400 mb-3">Privacy</h2>
            <p className="text-zinc-300 leading-relaxed">
              We do not collect personal user data. All interactions are handled securely.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-bold text-purple-400 mb-3">3. How We Use Information</h2>
            <ul className="list-disc pl-5 text-zinc-300 space-y-2">
              <li>To generate AI responses and roasts based on your input.</li>
              <li>To improve app performance and fix bugs.</li>
              <li>To provide a better overall user experience.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-bold text-purple-400 mb-3">4. Advertising (IMPORTANT)</h2>
            <p className="text-zinc-300 leading-relaxed mb-2">
              The app uses Google AdMob to show ads and keep the service free.
            </p>
            <p className="text-zinc-300 leading-relaxed mb-2">
              AdMob may collect:
            </p>
            <ul className="list-disc pl-5 text-zinc-300 space-y-1 mb-3">
              <li>Device information</li>
              <li>Advertising ID</li>
              <li>Usage data</li>
            </ul>
            <p className="text-zinc-300 font-medium italic">
              "We do not control third-party ad data collection."
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-bold text-purple-400 mb-3">5. Cookies & Tracking</h2>
            <p className="text-zinc-300 leading-relaxed">
              Third-party services integrated into our app (like advertising networks) may use cookies or similar tracking technologies to provide relevant content and ads.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-bold text-purple-400 mb-3">6. Data Security</h2>
            <p className="text-zinc-300 leading-relaxed">
              We take reasonable steps to protect user data from unauthorized access, alteration, or destruction.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-bold text-purple-400 mb-3">7. Children's Privacy</h2>
            <p className="text-zinc-300 leading-relaxed">
              This app is intended for mature audiences and is not intended for children under 13 years of age.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-bold text-purple-400 mb-3">8. Changes to Policy</h2>
            <p className="text-zinc-300 leading-relaxed">
              We may update this Privacy Policy from time to time. Any changes will be reflected in the app, and the policy may update anytime.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-bold text-purple-400 mb-3">9. Contact</h2>
            <p className="text-zinc-300 leading-relaxed">
              If you have any questions about this Privacy Policy, please contact us at:<br/>
              <a href="mailto:support@savageai.app" className="text-purple-400 hover:underline">support@savageai.app</a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
