import React, { useState } from 'react';
import { Play, CheckCircle2, ChevronRight, Sparkles, RotateCcw } from 'lucide-react';

interface GuidedDemoBarProps {
  onStepChange: (stepId: number) => void;
  activeDemoStep: number;
}

export const GuidedDemoBar: React.FC<GuidedDemoBarProps> = ({
  onStepChange,
  activeDemoStep,
}) => {
  const steps = [
    { id: 1, title: '1. Spoken Report', desc: 'Voice-to-JSON Data Entry' },
    { id: 2, title: '2. Explain Alert', desc: 'Gemini Plain Language Reasoning' },
    { id: 3, title: '3. Approve Transfer', desc: 'Cross-District Redistribution' },
    { id: 4, title: '4. Federated Benefit', desc: 'Data Residency & Assam Accuracy' },
    { id: 5, title: '5. Emergency Mode', desc: 'Flood Surge Scenario' },
    { id: 6, title: '6. Impact Panel', desc: 'Stockout Days Prevented' },
  ];

  return (
    <div className="bg-slate-900 border-y border-slate-800 py-2.5 px-4 sm:px-6 lg:px-8 shadow-md">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-teal-400" />
          <span className="font-bold text-xs text-white">3-Minute Guided Walkthrough:</span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
          {steps.map((s) => (
            <button
              key={s.id}
              onClick={() => onStepChange(s.id)}
              className={`px-2.5 py-1 rounded text-xs font-mono transition-colors flex items-center gap-1 shrink-0 ${
                activeDemoStep === s.id
                  ? 'bg-teal-600 text-white font-bold shadow-sm'
                  : activeDemoStep > s.id
                  ? 'bg-slate-800 text-teal-400 border border-slate-700'
                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              {activeDemoStep > s.id && <CheckCircle2 className="w-3 h-3 text-teal-400" />}
              <span>{s.title}</span>
            </button>
          ))}
        </div>

        <button
          onClick={() => onStepChange((activeDemoStep % steps.length) + 1)}
          className="px-3 py-1 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded flex items-center gap-1 transition-colors shrink-0"
        >
          Next Step <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
