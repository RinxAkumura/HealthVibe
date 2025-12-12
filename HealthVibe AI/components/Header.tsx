import React from 'react';
import { HeartPulse, Sparkles } from 'lucide-react';

interface HeaderProps {
  language: 'es' | 'en';
  setLanguage: (lang: 'es' | 'en') => void;
}

export const Header: React.FC<HeaderProps> = ({ language, setLanguage }) => {
  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-teal-50 p-2 rounded-xl border border-teal-100">
            <HeartPulse className="w-6 h-6 text-teal-600" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold text-slate-900 tracking-tight">
              HealthVibe AI
            </span>
            <span className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">
              Medical Triage v5
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
           {/* Language Toggle */}
           <div className="flex items-center bg-slate-100 rounded-full p-1 border border-slate-200">
              <button 
                onClick={() => setLanguage('es')}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${language === 'es' ? 'bg-white text-teal-700 shadow-sm border border-slate-200' : 'text-slate-400 hover:text-slate-600'}`}
              >
                ES
              </button>
              <button 
                onClick={() => setLanguage('en')}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${language === 'en' ? 'bg-white text-teal-700 shadow-sm border border-slate-200' : 'text-slate-400 hover:text-slate-600'}`}
              >
                EN
              </button>
           </div>

          <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-teal-700 bg-teal-50 px-4 py-2 rounded-full border border-teal-100">
            <Sparkles className="w-3 h-3 text-teal-500" />
            Gemini 3 Pro Active
          </div>
        </div>
      </div>
    </header>
  );
};