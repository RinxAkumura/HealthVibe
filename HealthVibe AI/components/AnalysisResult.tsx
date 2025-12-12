import React, { useState, useMemo } from 'react';
import { AnalysisResponse } from '../types';
import { createMedicalChat } from '../services/geminiService';
import { URGENCY_COLORS, TRANSLATIONS } from '../constants';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { AlertCircle, CheckCircle, RefreshCcw, Stethoscope, HelpCircle, ShieldAlert, Clock, Activity, List, FileText, Copy } from 'lucide-react';
import { MedicalChat } from './MedicalChat';

interface AnalysisResultProps {
  result: AnalysisResponse;
  onReset: () => void;
  language: 'es' | 'en';
}

export const AnalysisResult: React.FC<AnalysisResultProps> = ({ result, onReset, language }) => {
  // Safe urgency color fallback
  const urgencyKey = result.urgency as keyof typeof URGENCY_COLORS;
  const urgencyColor = URGENCY_COLORS[urgencyKey] || URGENCY_COLORS.Medium;
  
  const [showLetter, setShowLetter] = useState(false);
  
  const t = TRANSLATIONS[language];

  // Initialize chat session only once
  const chatSession = useMemo(() => createMedicalChat(result, language), [result, language]);

  const chartData = result.diagnoses.map(d => ({
    name: d.condition,
    confidence: d.confidence
  }));

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result.referralLetter);
    alert("Copied!");
  };

  return (
    <div className="space-y-6 animate-slide-up pb-12">
      {/* Header Result Card */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className={`p-8 border-b border-slate-100`}>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-3xl font-bold text-slate-900">{t.result_title}</h2>
              <p className="text-slate-500 text-sm mt-1 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                {t.result_subtitle}
              </p>
            </div>
            <div className={`px-6 py-3 rounded-full border font-bold flex items-center gap-3 ${urgencyColor}`}>
              <AlertCircle className="w-5 h-5" />
              {result.urgency.toUpperCase()}
            </div>
          </div>
        </div>

        <div className="p-8 space-y-10">

          {/* Clinical Summary */}
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">{t.patient_summary}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex items-start gap-4">
                <div className="bg-blue-100 p-2 rounded-lg"><Clock className="w-5 h-5 text-blue-600" /></div>
                <div>
                  <p className="text-xs text-slate-500 font-medium uppercase">{t.duration}</p>
                  <p className="text-slate-900 font-bold text-lg">{result.clinicalSummary.duration}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-red-100 p-2 rounded-lg"><Activity className="w-5 h-5 text-red-600" /></div>
                <div>
                  <p className="text-xs text-slate-500 font-medium uppercase">{t.pain_level}</p>
                  <p className="text-slate-900 font-bold text-lg">{result.clinicalSummary.painLevel}</p>
                </div>
              </div>
               <div className="flex items-start gap-4">
                <div className="bg-purple-100 p-2 rounded-lg"><List className="w-5 h-5 text-purple-600" /></div>
                <div>
                  <p className="text-xs text-slate-500 font-medium uppercase">{t.symptoms}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {result.clinicalSummary.keySymptoms.map((s, i) => (
                      <span key={i} className="text-xs bg-white px-3 py-1 rounded-full border border-slate-200 text-slate-600 font-medium">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Referral Letter */}
          <div className="flex justify-end">
            <button 
              onClick={() => setShowLetter(!showLetter)}
              className="flex items-center gap-2 text-sm font-bold text-teal-700 bg-teal-50 px-4 py-2 rounded-lg border border-teal-200 transition-all hover:bg-teal-100"
            >
              <FileText className="w-4 h-4" />
              {showLetter ? t.hide_letter : t.view_letter}
            </button>
          </div>

          {showLetter && (
            <div className="bg-white text-slate-800 p-8 rounded-xl relative animate-fade-in shadow-lg border border-slate-100 font-serif">
               <button onClick={copyToClipboard} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-blue-600">
                 <Copy className="w-5 h-5" />
               </button>
               <h3 className="font-bold mb-6 uppercase tracking-widest text-xs border-b border-slate-200 pb-2">{t.referral_letter}</h3>
               <div className="prose prose-sm max-w-none whitespace-pre-wrap leading-relaxed">
                 {result.referralLetter}
               </div>
            </div>
          )}
          
          {/* Warning Signs */}
          {result.warningSigns && result.warningSigns.length > 0 && (
            <div className="bg-red-50 border border-red-200 p-6 rounded-2xl relative overflow-hidden">
              <div className="flex items-start relative z-10">
                <ShieldAlert className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                <div className="ml-4">
                  <h3 className="text-sm font-bold text-red-700 uppercase tracking-wide">{t.warning_signs}</h3>
                  <ul className="mt-3 space-y-2">
                    {result.warningSigns.map((sign, idx) => (
                      <li key={idx} className="text-red-800 text-sm flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span> {sign}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Advice & Routing */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100 flex flex-col justify-between">
               <div>
                 <h3 className="font-bold text-blue-800 flex items-center gap-2 mb-4">
                   <Stethoscope className="w-5 h-5" />
                   {t.recommendation}
                 </h3>
                 <p className="text-slate-700 leading-relaxed font-medium mb-6">
                   {result.medicalAdvice}
                 </p>
               </div>
               
               <div className="bg-white rounded-xl p-4 border border-blue-100 shadow-sm">
                 <p className="text-xs text-blue-600 font-bold uppercase mb-1">{t.specialist}</p>
                 <p className="text-xl font-bold text-slate-900">{result.recommendedSpecialist}</p>
               </div>
            </div>
            
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
              <h3 className="font-semibold text-slate-800 mb-4">{t.reasoning}</h3>
              <p className="text-slate-600 leading-relaxed text-sm">
                {result.urgencyReason}
              </p>
            </div>
          </div>

          {/* Diagnoses Chart */}
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Activity className="w-5 h-5 text-teal-600" />
                {t.differential}
            </h3>
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="h-[300px] w-full bg-white rounded-2xl p-4 border border-slate-200">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} layout="vertical" margin={{ left: 0 }}>
                    <XAxis type="number" domain={[0, 100]} hide />
                    <YAxis dataKey="name" type="category" width={120} tick={{fontSize: 12, fill: '#475569'}} />
                    <Tooltip cursor={{fill: 'rgba(0,0,0,0.02)'}} contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#0f172a', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                    <Bar dataKey="confidence" radius={[0, 4, 4, 0]} barSize={20}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? '#0d9488' : '#cbd5e1'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-3">
                {result.diagnoses.map((d, idx) => (
                  <div key={idx} className="group p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:shadow-sm transition-all">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-slate-800">{d.condition}</h4>
                      <span className="text-xs font-bold text-white bg-teal-500 px-2 py-1 rounded">{d.confidence}%</span>
                    </div>
                    <p className="text-sm text-slate-600 leading-snug">{d.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <hr className="border-slate-100" />

          {/* Chat Only - No Map */}
          <div className="w-full">
            <MedicalChat chatSession={chatSession} />
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-4">{t.immediate_care}</h3>
              <ul className="space-y-3">
                {result.homeCareSteps.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-3 p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800 text-sm">
                    <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-emerald-600" />
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>

            {result.followUpQuestions && result.followUpQuestions.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                   <HelpCircle className="w-5 h-5 text-purple-600" />
                   {t.follow_up}
                </h3>
                <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
                  <ul className="space-y-4">
                    {result.followUpQuestions.map((q, idx) => (
                      <li key={idx} className="text-sm text-purple-900 flex items-start gap-3">
                        <span className="font-bold text-purple-500 text-lg leading-none">•</span> {q}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-8 py-6 border-t border-slate-200 flex justify-between items-center">
            <button 
              onClick={onReset}
              className="px-6 py-3 bg-white border border-slate-200 rounded-xl text-slate-600 text-sm font-bold hover:bg-slate-100 hover:text-slate-900 transition-all flex items-center gap-2"
            >
              <RefreshCcw className="w-4 h-4" />
              {t.new_analysis}
            </button>
        </div>
      </div>
    </div>
  );
};