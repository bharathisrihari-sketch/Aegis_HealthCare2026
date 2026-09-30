import React from 'react';
import {
  Share2,
  ShieldCheck,
  Cpu,
  TrendingDown,
  Database,
  Lock,
  ArrowRight,
  Info,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { FedRound, LanguageCode } from '../types';
import { TRANSLATIONS } from '../i18n/translations';

interface FederatedMonitorProps {
  fedRounds: FedRound[];
  onTriggerNewRound: () => void;
  lang: LanguageCode;
}

export const FederatedMonitor: React.FC<FederatedMonitorProps> = ({
  fedRounds,
  onTriggerNewRound,
  lang,
}) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;
  const latestRound = fedRounds[fedRounds.length - 1];

  // Chart Data format for Recharts
  const chartData = fedRounds.map((r) => {
    const entry: any = { round: `Round ${r.round}`, Global: (r.globalWape * 100).toFixed(1) };
    r.nodes.forEach((n) => {
      entry[n.stateName] = (n.federatedWape * 100).toFixed(1);
    });
    return entry;
  });

  return (
    <div className="space-y-5">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-600/20 text-indigo-400 border border-indigo-800/50 rounded-lg">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-base text-white">{t.federatedMonitor}</h2>
              <span className="px-2 py-0.5 bg-indigo-950 text-indigo-300 border border-indigo-800 text-[10px] font-mono font-bold rounded">
                SIMULATED FEDERATION PROTOTYPE
              </span>
            </div>
            <p className="text-xs text-slate-400">
              FedAvg parameter aggregation across 4 state health nodes without raw patient/consumption data pooling
            </p>
          </div>
        </div>

        <button
          onClick={onTriggerNewRound}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg shadow-md transition-colors flex items-center gap-1.5"
        >
          <Cpu className="w-4 h-4" /> Run Federated Aggregation Round
        </button>
      </div>

      {/* Data Residency Isolation Notice */}
      <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex items-start gap-3 text-xs">
        <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-bold text-white flex items-center gap-2">
            Strict Data Residency Guarantee
            <span className="text-[10px] font-mono text-emerald-400 font-normal">
              [Raw Consumption Records Bounded Within State Boundaries]
            </span>
          </div>
          <p className="text-slate-400 leading-relaxed">
            In compliance with state digital governance, raw daily PHC consumption logs never cross state server boundaries. Each state node independently fits its local exponential smoothing parameters (`levelWeight`, `trendWeight`, `seasonalIndices`) on local hardware. Only encrypted floating-point parameter weights are exchanged with the National Control Tower for weighted FedAvg aggregation.
          </p>
        </div>
      </div>

      {/* Convergence Chart & Performance Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Convergence Line Chart */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-indigo-400" />
              <h3 className="font-bold text-xs text-white">Round-by-Round Forecast Error Convergence (WAPE %)</h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">Lower % = Higher Accuracy</span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis dataKey="round" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} unit="%" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Line type="monotone" dataKey="Global" stroke="#a855f7" strokeWidth={3} name="National Aggregated Model" />
                <Line type="monotone" dataKey="Tamil Nadu" stroke="#0d9488" strokeWidth={1.5} />
                <Line type="monotone" dataKey="Uttar Pradesh" stroke="#38bdf8" strokeWidth={1.5} />
                <Line type="monotone" dataKey="Assam" stroke="#f43f5e" strokeWidth={2} name="Assam (Data-Poor Node)" />
                <Line type="monotone" dataKey="Rajasthan" stroke="#f59e0b" strokeWidth={1.5} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* State Node Nodes Summary */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3 shadow-lg">
          <div className="flex items-center gap-2 font-bold text-xs text-white">
            <Database className="w-4 h-4 text-sky-400" /> Active State Nodes ({latestRound?.nodes.length})
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {latestRound?.nodes.map((node) => (
              <div key={node.stateId} className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs space-y-1">
                <div className="flex justify-between font-bold text-white">
                  <span>{node.stateName}</span>
                  <span className="font-mono text-teal-400">
                    {(node.federatedWape * 100).toFixed(1)}% WAPE
                  </span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                  <span>Training Samples: {node.sampleCount.toLocaleString()}</span>
                  <span className="text-slate-500">Local-Only: {(node.localWape * 100).toFixed(1)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Proof of Benefit for Data-Poor State (Assam) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3 shadow-lg">
        <div className="font-bold text-xs text-white flex items-center gap-2">
          <Lock className="w-4 h-4 text-emerald-400" /> Empirical Benefit Demonstration: Isolated Local Model vs Shared Federated Model
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono text-left divide-y divide-slate-800">
            <thead>
              <tr className="text-slate-400 bg-slate-950">
                <th className="p-2.5">State Node</th>
                <th className="p-2.5">History Window</th>
                <th className="p-2.5">Local-Only Model WAPE</th>
                <th className="p-2.5">Shared Federated WAPE</th>
                <th className="p-2.5">Forecast Error Reduction</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {latestRound?.nodes.map((node) => {
                const diff = (node.localWape - node.federatedWape) * 100;
                const isAssam = node.stateId === 'as';

                return (
                  <tr key={node.stateId} className={isAssam ? 'bg-indigo-950/40 font-bold' : ''}>
                    <td className="p-2.5 text-white flex items-center gap-1.5">
                      {node.stateName}
                      {isAssam && (
                        <span className="px-1.5 py-0.5 bg-indigo-900 text-indigo-300 rounded text-[10px]">
                          Data-Constrained
                        </span>
                      )}
                    </td>
                    <td className="p-2.5 text-slate-300">{isAssam ? '45 Days (Short)' : '90 Days'}</td>
                    <td className="p-2.5 text-red-400">{(node.localWape * 100).toFixed(1)}% Error</td>
                    <td className="p-2.5 text-emerald-400">{(node.federatedWape * 100).toFixed(1)}% Error</td>
                    <td className="p-2.5 text-teal-300 font-bold flex items-center gap-1">
                      <ArrowRight className="w-3.5 h-3.5 text-teal-400" />
                      +{diff.toFixed(1)}% Accuracy Boost
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
