import React, { useState } from 'react';
import { Header } from './components/Header';
import { SymptomForm } from './components/SymptomForm';
import { AnalysisResult } from './components/AnalysisResult';
import { Disclaimer } from './components/Disclaimer';
import { VirtualDoctor } from './components/VirtualDoctor';
import { AnalysisResponse, AnalysisState } from './types';
import { analyzeSymptoms } from './services/geminiService';
import { AlertCircle, BrainCircuit } from 'lucide-react';
import { TRANSLATIONS } from './constants';

const App: React.FC = () => {
  const [status, setStatus] = useState<AnalysisState>('idle');
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState<'es' | 'en'>('es');

  const t = TRANSLATIONS[language];

  const handleAnalysis = async (text: string, files: File[], audioBlob: Blob | null) => {
    setStatus('analyzing');
    setError(null);
    setResult(null);

    try {
      // Pass language to service
      const response = await analyzeSymptoms(text, files, audioBlob, language);
      setResult(response);
      setStatus('complete');
    } catch (err: any) {
      console.error(err);
      setError(t.error_title);
      setStatus('error');
    }
  };

  const handleReset = () => {
    setStatus('idle');
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-teal-100 selection:text-teal-900 overflow-x-hidden">
      {/* Background Subtle Patterns (Light Mode) */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-40">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-100/50 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-teal-100/40 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/4"></div>
      </div>

      <Header language={language} setLanguage={setLanguage} />
      
      <main className="flex-grow container mx-auto px-4 py-8 max-w-7xl relative z-10 flex flex-col justify-center">

        {/* SPLIT LAYOUT FOR IDLE STATE */}
        {status === 'idle' && (
          <div className="animate-fade-in grid lg:grid-cols-12 gap-8 items-start min-h-[750px]">
            
            {/* LEFT PANEL: FORM (7 Columns - Balanced Wide) */}
            <div className="lg:col-span-7 flex flex-col h-full">
              <SymptomForm onSubmit={handleAnalysis} language={language} />
            </div>

            {/* RIGHT PANEL: VIRTUAL DOCTOR (5 Columns - Balanced Narrow) */}
            <div className="hidden lg:block lg:col-span-5 h-[750px] sticky top-24">
               <div className="h-full bg-white rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
                  <VirtualDoctor language={language} />
               </div>
            </div>

            {/* Mobile View for Doctor (Simplified) */}
             <div className="lg:hidden col-span-12 bg-white p-4 rounded-xl border border-slate-200 mb-8 flex items-center gap-4 shadow-sm">
                <div className="relative">
                  <img 
                    src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=200&auto=format&fit=crop" 
                    className="w-16 h-16 rounded-full object-cover border-2 border-slate-100"
                  />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{t.doctor_name}</h3>
                  <p className="text-xs text-teal-600 font-medium">{t.doctor_role}</p>
                </div>
             </div>

          </div>
        )}

        {status === 'analyzing' && (
          <div className="flex flex-col items-center justify-center py-32 max-w-2xl mx-auto text-center">
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-teal-100 blur-2xl opacity-60 animate-pulse"></div>
              <div className="bg-white p-8 rounded-full border border-teal-100 relative z-10 shadow-sm">
                <BrainCircuit className="w-20 h-20 text-teal-500 animate-pulse" />
              </div>
              <div className="absolute top-0 left-0 w-full h-full border-4 border-teal-500/20 rounded-full animate-spin-slow border-t-transparent"></div>
            </div>
            <h2 className="text-3xl font-bold text-slate-900 tracking-wide">{t.analyzing_title}</h2>
            <p className="text-slate-500 mt-4 text-lg">{t.analyzing_desc}</p>
          </div>
        )}

        {status === 'error' && (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-8 text-center max-w-2xl mx-auto mt-8">
            <div className="flex justify-center mb-6">
              <AlertCircle className="w-16 h-16 text-red-500" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">{t.error_title}</h3>
            <p className="text-slate-600 mb-8">{error}</p>
            <button 
              onClick={handleReset}
              className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all font-bold shadow-sm"
            >
              {t.retry_btn}
            </button>
          </div>
        )}

        {status === 'complete' && result && (
          <div className="max-w-6xl mx-auto">
             <AnalysisResult result={result} onReset={handleReset} language={language} />
          </div>
        )}
      </main>

      {/* Footer / Disclaimer */}
      <footer className="container mx-auto px-4 pb-6 relative z-10">
        <Disclaimer text={t.disclaimer} />
      </footer>
    </div>
  );
};

export default App;