import React, { useState, useRef } from 'react';
import { Upload, X, FileImage, FileVideo, Send, Mic, Trash2, Activity, Keyboard, AlignLeft } from 'lucide-react';
import { MAX_FILE_SIZE_MB, TRANSLATIONS } from '../constants';

interface SymptomFormProps {
  onSubmit: (text: string, files: File[], audioBlob: Blob | null) => void;
  language: 'es' | 'en';
}

type InputMode = 'audio' | 'text';

export const SymptomForm: React.FC<SymptomFormProps> = ({ onSubmit, language }) => {
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [inputMode, setInputMode] = useState<InputMode>('text');
  
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = TRANSLATIONS[language];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files) as File[];
      const validFiles = newFiles.filter(file => {
        const isValidSize = file.size / 1024 / 1024 <= MAX_FILE_SIZE_MB;
        return isValidSize;
      });
      setFiles(prev => [...prev, ...validFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Microphone access required.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const deleteRecording = () => {
    setAudioBlob(null);
    setAudioUrl(null);
    chunksRef.current = [];
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() && !audioBlob && files.length === 0) return;
    onSubmit(description, files, audioBlob);
  };

  return (
    <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm relative h-full flex flex-col">
      <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
        
        {/* 1. Visual Evidence */}
        <div className="space-y-3">
          <label className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
            <Activity className="w-4 h-4 text-teal-600" />
            {t.upload_title}
          </label>
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-200 hover:border-teal-400/50 bg-slate-50/50 rounded-2xl py-10 px-6 flex flex-col items-center justify-center cursor-pointer transition-all group hover:bg-slate-50 relative overflow-hidden"
          >
            <div className="bg-white p-3 rounded-full mb-3 group-hover:scale-110 transition-transform shadow-sm border border-slate-100 relative z-10">
              <Upload className="w-5 h-5 text-teal-500" />
            </div>
            <p className="text-slate-500 font-medium text-center relative z-10 group-hover:text-slate-700 transition-colors text-sm">{t.upload_box_title}</p>
            <input 
              ref={fileInputRef}
              type="file" 
              accept="image/*,video/*" 
              multiple 
              className="hidden" 
              onChange={handleFileChange}
            />
          </div>

          {/* File Chips */}
          {files.length > 0 && (
            <div className="flex flex-wrap gap-2 animate-fade-in">
              {files.map((file, idx) => (
                <div key={idx} className="bg-slate-100 rounded-lg p-2 pr-8 flex items-center gap-3 border border-slate-200">
                  {file.type.startsWith('video') ? (
                    <FileVideo className="w-4 h-4 text-purple-500" />
                  ) : (
                    <FileImage className="w-4 h-4 text-teal-500" />
                  )}
                  <span className="text-xs text-slate-600 truncate max-w-[150px]">{file.name}</span>
                  <button 
                    type="button"
                    onClick={(e) => { e.stopPropagation(); removeFile(idx); }}
                    className="absolute right-2 text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Input Method Tabs */}
        <div className="space-y-4">
           <label className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
            <AlignLeft className="w-4 h-4 text-teal-600" />
            Detalles Clínicos
          </label>
          
          <div className="bg-slate-100 p-1 rounded-xl flex gap-1 border border-slate-200">
             <button
               type="button"
               onClick={() => setInputMode('text')}
               className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all ${
                 inputMode === 'text' 
                 ? 'bg-white text-teal-700 shadow-sm border border-slate-200' 
                 : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
               }`}
             >
               <Keyboard className="w-4 h-4" />
               {language === 'es' ? 'Texto' : 'Text'}
               {description && <div className="w-1.5 h-1.5 rounded-full bg-teal-500 ml-1"></div>}
             </button>
             <button
               type="button"
               onClick={() => setInputMode('audio')}
               className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all ${
                 inputMode === 'audio' 
                 ? 'bg-white text-teal-700 shadow-sm border border-slate-200' 
                 : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
               }`}
             >
               <Mic className="w-4 h-4" />
               {language === 'es' ? 'Audio' : 'Voice'}
               {(audioBlob || isRecording) && <div className="w-1.5 h-1.5 rounded-full bg-red-400 ml-1 animate-pulse"></div>}
             </button>
          </div>

          {/* Dynamic Input Area */}
          <div className="min-h-[160px] animate-fade-in">
            {inputMode === 'text' ? (
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t.desc_placeholder}
                className="w-full h-[160px] p-5 rounded-2xl bg-white border border-slate-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none resize-none text-slate-800 placeholder:text-slate-400 text-sm transition-all shadow-inner bg-slate-50/30"
                autoFocus
              />
            ) : (
              <div className="h-[160px] bg-slate-50/50 rounded-2xl p-6 border border-slate-200 flex flex-col items-center justify-center gap-4 relative overflow-hidden">
                 {/* Background Animation for Audio */}
                 {isRecording && (
                   <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                     <div className="w-32 h-32 bg-red-100 rounded-full animate-ping"></div>
                   </div>
                 )}

                 {!isRecording && !audioBlob && (
                   <button
                     type="button"
                     onClick={startRecording}
                     className="w-12 h-12 rounded-full bg-white border border-red-100 flex items-center justify-center shadow-sm text-red-500 hover:scale-110 hover:text-red-600 transition-all group"
                   >
                     <Mic className="w-6 h-6 group-hover:animate-pulse" />
                   </button>
                 )}
                 
                 {isRecording && (
                   <div className="flex flex-col items-center gap-3 z-10">
                     <div className="flex gap-1 h-8 items-center">
                        {[...Array(5)].map((_, i) => (
                           <div key={i} className="w-1.5 bg-red-400 rounded-full animate-bounce" style={{height: '20px', animationDelay: `${i * 0.1}s`}}></div>
                        ))}
                     </div>
                     <button
                       type="button"
                       onClick={stopRecording}
                       className="px-6 py-2 bg-white border border-red-200 text-red-500 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-red-50 transition-colors shadow-sm"
                     >
                       {t.stop_btn}
                     </button>
                   </div>
                 )}
    
                 {audioBlob && (
                   <div className="flex items-center gap-3 w-full max-w-xs z-10">
                      <div className="flex-1 bg-white rounded-lg p-2 flex items-center justify-center border border-slate-200 shadow-sm">
                         <span className="text-xs text-slate-600 font-mono">Audio Clip Ready</span>
                      </div>
                      <button 
                        type="button"
                        onClick={deleteRecording}
                        className="p-3 text-slate-400 hover:text-red-500 hover:bg-white rounded-full transition-colors border border-transparent hover:border-red-100 hover:shadow-sm"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                   </div>
                 )}
                 
                 <p className="text-xs text-slate-400 font-medium">
                   {isRecording ? "Recording..." : audioBlob ? "Recording saved" : t.audio_title}
                 </p>
              </div>
            )}
          </div>
        </div>

        {/* Submit Button - Cyan/Blue */}
        <button
          type="submit"
          disabled={!description.trim() && !audioBlob && files.length === 0}
          className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-[0_4px_20px_-5px_rgba(6,182,212,0.4)] active:scale-[0.98] mt-4"
        >
          <Send className="w-5 h-5" />
          {t.analyze_btn}
        </button>
      </form>
    </div>
  );
};