import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface DisclaimerProps {
  text: string;
}

export const Disclaimer: React.FC<DisclaimerProps> = ({ text }) => {
  return (
    <div className="flex items-center justify-center">
      <div className="bg-white border border-slate-200 rounded-full px-4 py-2 flex items-center gap-3 transition-all hover:bg-slate-50 hover:border-yellow-400 group cursor-help max-w-fit shadow-sm">
        <AlertTriangle className="h-4 w-4 text-yellow-500 group-hover:text-yellow-600 transition-colors" />
        <p className="text-[10px] sm:text-xs font-medium text-slate-500 group-hover:text-slate-700 uppercase tracking-widest transition-colors">
          {text}
        </p>
      </div>
    </div>
  );
};