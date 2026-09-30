import React from 'react';
import { Rocket, Server, Database, Shield, Cpu, Calendar, CheckCircle2 } from 'lucide-react';

export const PathToPilotPage: React.FC = () => {
  return (
    <div className="space-y-6 max-w-5xl mx-auto text-xs text-slate-300">
      {/* Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2 shadow-lg">
        <div className="flex items-center gap-2 text-white font-bold text-base">
          <Rocket className="w-5 h-5 text-teal-400" />
          Path to Pilot — 4-Week State Health Department Rollout Plan
        </div>
        <p className="text-slate-400 leading-relaxed">
          Production architecture specifications, security governance, and deployment roadmap for onboarding a state health mission.
        </p>
      </div>

      {/* Production Architecture Diagram */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-lg">
        <h3 className="font-bold text-sm text-white flex items-center gap-2">
          <Server className="w-4 h-4 text-teal-400" /> Target Production Cloud Architecture
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono text-[11px]">
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1">
            <div className="font-bold text-sky-400">Firebase Auth & Sync</div>
            <p className="text-slate-400 text-[10px]">
              Role-based access control, offline PWA queue sync, and multi-device session state.
            </p>
          </div>

          <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1">
            <div className="font-bold text-teal-400">Google Cloud Run</div>
            <p className="text-slate-400 text-[10px]">
              Serverless containerized backend running Express/FastAPI and Gemini API Gateway.
            </p>
          </div>

          <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1">
            <div className="font-bold text-indigo-400">BigQuery Data Warehouse</div>
            <p className="text-slate-400 text-[10px]">
              National supply chain data lake for historical demand analytics and SQL queries.
            </p>
          </div>

          <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1">
            <div className="font-bold text-purple-400">Vertex AI Pipeline</div>
            <p className="text-slate-400 text-[10px]">
              Production time-series model training and automated federated parameter aggregation.
            </p>
          </div>
        </div>
      </div>

      {/* 4-Week Pilot Rollout Timeline */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-lg">
        <h3 className="font-bold text-sm text-white flex items-center gap-2">
          <Calendar className="w-4 h-4 text-amber-400" /> 4-Week Pilot Execution Roadmap
        </h3>

        <div className="space-y-3 font-mono text-[11px]">
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1">
            <div className="font-bold text-teal-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-400" /> Week 1: Data Contract & e-Aushadhi API Adapter
            </div>
            <p className="text-slate-400">
              Establish secure REST connectors with state DVDMS/e-Aushadhi database. Verify medicine master catalog mapping and district PHC coordinates.
            </p>
          </div>

          <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1">
            <div className="font-bold text-sky-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-sky-400" /> Week 2: Mobile Voice Onboarding for Pharmacists
            </div>
            <p className="text-slate-400">
              Deploy voice-first PWA reporting app to 100 PHC pharmacists in 4 focus districts. Conduct regional voice accent tuning for local vernaculars.
            </p>
          </div>

          <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1">
            <div className="font-bold text-indigo-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-indigo-400" /> Week 3: District Officer Control Tower Setup
            </div>
            <p className="text-slate-400">
              Train District Health Officers on automated cross-district transfer approval workflows, Gemini alert explanations, and dispatch order generation.
            </p>
          </div>

          <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1">
            <div className="font-bold text-purple-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-purple-400" /> Week 4: Federated Model Aggregation Handshake
            </div>
            <p className="text-slate-400">
              Connect state node parameters to national aggregator. Evaluate 14-day stockout prediction accuracy improvement and impact metrics.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
