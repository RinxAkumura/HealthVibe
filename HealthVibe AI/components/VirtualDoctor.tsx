import React, { useState } from 'react';
import { Volume2, Sparkles, Activity, ShieldCheck } from 'lucide-react';
import { generateWelcomeSpeech } from '../services/geminiService';
import { TRANSLATIONS } from '../constants';

interface VirtualDoctorProps {
  language: 'es' | 'en';
}

export const VirtualDoctor: React.FC<VirtualDoctorProps> = ({ language }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [loadingAudio, setLoadingAudio] = useState(false);
  
  const t = TRANSLATIONS[language];

  // Decode Raw PCM
  const playAudio = async (base64String: string) => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const binaryString = atob(base64String);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);
      
      const int16Data = new Int16Array(bytes.buffer);
      const float32Data = new Float32Array(int16Data.length);
      for (let i = 0; i < int16Data.length; i++) float32Data[i] = int16Data[i] / 32768.0;

      const audioBuffer = audioContext.createBuffer(1, float32Data.length, 24000);
      audioBuffer.getChannelData(0).set(float32Data);

      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      source.onended = () => setIsPlaying(false);
      source.start();
      setIsPlaying(true);
      setHasPlayed(true);
    } catch (e) {
      console.error("Audio playback failed", e);
      setIsPlaying(false);
    }
  };

  const handleWelcomeClick = async () => {
    if (isPlaying) return;
    setLoadingAudio(true);
    const audioData = await generateWelcomeSpeech(language); // Pass language
    setLoadingAudio(false);
    if (audioData) {
      playAudio(audioData);
    }
  };

  return (
    <div className="h-full flex flex-col items-center justify-center p-8 relative">
      {/* NEW: Minimalist Header Badge */}
      <div className="absolute top-12 left-0 right-0 flex flex-col items-center animate-fade-in z-20">
         <div className="bg-white/80 backdrop-blur-md px-5 py-2 rounded-full border border-slate-200/50 shadow-sm flex items-center gap-2.5 hover:scale-105 transition-transform cursor-default">
             <div className="bg-teal-50 p-1 rounded-full border border-teal-100">
               <ShieldCheck className="w-4 h-4 text-teal-600" />
             </div>
             <div>
               <h1 className="text-sm font-bold text-slate-800 leading-none">{t.tagline}</h1>
               <p className="text-[10px] text-slate-400 font-semibold tracking-wide uppercase mt-0.5">{t.sub_tagline}</p>
             </div>
         </div>
      </div>

      {/* Subtle Background Rings (Light) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] border border-slate-100 rounded-full pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[250px] h-[250px] border border-dashed border-slate-200 rounded-full pointer-events-none"></div>

      <div className="relative z-10 text-center w-full max-w-md mt-12">
        
        {/* Profile Avatar */}
        <div className="relative mx-auto mb-6 w-48 h-48 group cursor-pointer" onClick={handleWelcomeClick}>
          <div className={`absolute inset-0 rounded-full border-2 border-teal-100 transition-all duration-700 ${isPlaying ? 'scale-105 border-teal-400 opacity-100' : 'opacity-0'}`}></div>
          <div className="w-full h-full rounded-full overflow-hidden border-4 border-white relative z-10 shadow-lg shadow-slate-200">
             <img 
              src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=1000&auto=format&fit=crop" 
              alt="AI Doctor" 
              className="w-full h-full object-cover grayscale-[10%] group-hover:grayscale-0 transition-all duration-700"
            />
          </div>
          
          {/* Status Indicator */}
          <div className="absolute bottom-3 right-3 bg-white border border-emerald-200 text-emerald-600 px-3 py-1 rounded-full z-30 flex items-center gap-2 shadow-sm">
            <div className={`w-2 h-2 rounded-full bg-emerald-500 ${isPlaying ? 'animate-pulse' : ''}`}></div>
            <span className="text-[10px] font-bold font-mono tracking-widest text-emerald-700">ONLINE</span>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-slate-800 mb-1 tracking-tight">{t.doctor_name}</h2>
        <p className="text-teal-600 mb-8 flex items-center justify-center gap-2 text-sm font-medium tracking-wide">
          <Sparkles className="w-4 h-4" />
          {t.doctor_role}
        </p>

        {/* Speech Bubble (Light) */}
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 relative">
           <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-4 h-4 bg-slate-50 border-t border-l border-slate-200 rotate-45 transform"></div>
           
           <p className="text-slate-600 leading-relaxed mb-6 font-normal">
             "{t.doctor_welcome}"
           </p>

           <button 
             onClick={handleWelcomeClick}
             disabled={loadingAudio || isPlaying}
             className={`w-full py-4 px-6 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-3 ${
               isPlaying 
                 ? 'bg-teal-500 shadow-sm' 
                 : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:scale-[1.01] shadow-md shadow-blue-500/20'
             }`}
           >
             {loadingAudio ? (
               <Activity className="w-5 h-5 animate-spin" />
             ) : isPlaying ? (
               <>
                 <Volume2 className="w-5 h-5 animate-pulse" />
                 {t.doctor_btn_listening}
               </>
             ) : (
               <>
                 <Volume2 className="w-5 h-5" />
                 {t.doctor_btn_listen}
               </>
             )}
           </button>
           
           {!hasPlayed && (
             <p className="text-[10px] uppercase tracking-widest text-slate-400 mt-3">{t.doctor_click_hint}</p>
           )}
        </div>
      </div>
    </div>
  );
};