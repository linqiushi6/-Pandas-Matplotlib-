import React from 'react';
import { Sparkles, Loader2 } from 'lucide-react';

interface InsightBubbleProps {
  insight: string | null;
  isLoading: boolean;
  onGenerate: () => void;
  hasKey: boolean;
}

export const InsightBubble: React.FC<InsightBubbleProps> = ({ insight, isLoading, onGenerate, hasKey }) => {
  if (!hasKey) {
     return (
        <div className="mt-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
             <p className="text-slate-400 text-sm flex items-center gap-2">
                <Sparkles size={16} />
                <span>Add API Key to unlock AI Data Insights</span>
             </p>
        </div>
     )
  }

  if (!insight && !isLoading) {
    return (
      <div className="mt-4 flex justify-end">
        <button
          onClick={onGenerate}
          className="flex items-center gap-2 text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-colors bg-emerald-950/30 px-3 py-1.5 rounded-full border border-emerald-900/50"
        >
          <Sparkles size={14} />
          Ask AI to Analyze
        </button>
      </div>
    );
  }

  return (
    <div className="mt-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700 relative overflow-hidden group transition-all duration-500">
      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-purple-500 to-blue-500"></div>
      
      {isLoading ? (
        <div className="flex items-center gap-3 text-slate-400">
          <Loader2 className="animate-spin text-purple-400" size={18} />
          <span className="text-sm font-light">Reading the charts...</span>
        </div>
      ) : (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="text-purple-400" size={16} />
            <span className="text-xs font-bold text-purple-300 uppercase tracking-wider">AI Insight</span>
          </div>
          <p className="text-slate-200 text-sm leading-relaxed font-light">
            {insight}
          </p>
        </div>
      )}
    </div>
  );
};
