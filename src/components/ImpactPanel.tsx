import React, { useState } from 'react';
import {
  TrendingUp,
  ShieldCheck,
  Users,
  Building2,
  Calculator,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { ImpactEstimate, LanguageCode } from '../types';
import { TRANSLATIONS } from '../i18n/translations';

interface ImpactPanelProps {
  impact: ImpactEstimate;
  lang: LanguageCode;
}

export const ImpactPanel: React.FC<ImpactPanelProps> = ({ impact, lang }) => {
  const [dailyVisitsPerPhc, setDailyVisitsPerPhc] = useState<number>(18);
  const [popPerPhc, setPopPerPhc] = useState<number>(25000);

  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  const adjustedVisits = impact.stockoutDaysPrevented * dailyVisitsPerPhc;
  const adjustedPopulation = impact.phcsCovered * popPerPhc;

  return (
    <div className="space-y-5">
      {/* Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-teal-600/20 text-teal-400 border border-teal-800/50 rounded-lg">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-base text-white">{t.impactPanel}</h2>
              <span className="px-2 py-0.5 bg-teal-950 text-teal-300 border border-teal-800 text-[10px] font-mono rounded">
                ESTIMATES FROM SYNTHETIC DATA
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Quantifiable health impact metrics derived transparently from redistribution decision logs
            </p>
          </div>
        </div>
      </div>

      {/* 4 Core Impact Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2 shadow-md">
          <div className="text-slate-400 text-xs font-semibold flex items-center justify-between">
            <span>Stockout Days Prevented</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-bold font-mono text-white">
            {impact.stockoutDaysPrevented.toLocaleString()} <span className="text-sm font-normal text-slate-400">Days</span>
          </div>
          <p className="text-[11px] text-slate-400 font-mono">
            Across {impact.transfersCount} approved cross-district transfers
          </p>
        </div>

        {/* Card 2 */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2 shadow-md">
          <div className="text-slate-400 text-xs font-semibold flex items-center justify-between">
            <span>Patient Visits Protected</span>
            <Users className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-3xl font-bold font-mono text-sky-400">
            {adjustedVisits.toLocaleString()} <span className="text-sm font-normal text-slate-400">Visits</span>
          </div>
          <p className="text-[11px] text-slate-400 font-mono">
            {dailyVisitsPerPhc} avg daily PHC patient footfall
          </p>
        </div>

        {/* Card 3 */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2 shadow-md">
          <div className="text-slate-400 text-xs font-semibold flex items-center justify-between">
            <span>PHCs Network Coverage</span>
            <Building2 className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-3xl font-bold font-mono text-white">
            {impact.phcsCovered} <span className="text-sm font-normal text-slate-400">PHCs</span>
          </div>
          <p className="text-[11px] text-slate-400 font-mono">
            Across 4 states (TN, UP, Assam, Rajasthan)
          </p>
        </div>

        {/* Card 4 */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2 shadow-md">
          <div className="text-slate-400 text-xs font-semibold flex items-center justify-between">
            <span>Approx Population Served</span>
            <Users className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-3xl font-bold font-mono text-teal-300">
            {(adjustedPopulation / 1000000).toFixed(2)}M <span className="text-sm font-normal text-slate-400">People</span>
          </div>
          <p className="text-[11px] text-slate-400 font-mono">
            ~{popPerPhc.toLocaleString()} per PHC catchment area
          </p>
        </div>
      </div>

      {/* Transparent Formula & Parameter Tuning Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-lg">
        <div className="font-bold text-xs text-white flex items-center gap-2">
          <Calculator className="w-4 h-4 text-teal-400" /> Transparent Calculation Formula & Parameter Controls
        </div>

        <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-300 leading-relaxed">
          {impact.formulaDetails}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono pt-1">
          <div>
            <label className="block text-slate-400 mb-1">
              Average Daily Patient Footfall per PHC:
            </label>
            <input
              type="number"
              value={dailyVisitsPerPhc}
              onChange={(e) => setDailyVisitsPerPhc(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white font-bold focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">
              Average Population Catchment per PHC:
            </label>
            <input
              type="number"
              value={popPerPhc}
              onChange={(e) => setPopPerPhc(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white font-bold focus:outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
