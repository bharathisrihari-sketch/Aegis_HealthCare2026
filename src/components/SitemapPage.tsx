import React from 'react';
import {
  Map,
  Compass,
  ArrowRight,
  ShieldAlert,
  Info,
  Layers,
  Users,
  Building2,
  Code2,
  GitFork,
  ExternalLink,
  Bot,
  Activity,
  Truck,
  Database,
  Mic,
  FileCheck,
  CheckCircle2,
  Workflow,
} from 'lucide-react';
import { LanguageCode } from '../types';
import { TRANSLATIONS } from '../i18n/translations';

interface SitemapPageProps {
  onNavigate: (tabId: string) => void;
  lang: LanguageCode;
}

export const SitemapPage: React.FC<SitemapPageProps> = ({ onNavigate, lang }) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  const activeModules = [
    {
      id: 'map',
      title: 'National Visibility Map',
      category: 'Control Tower',
      desc: 'Real-time GIS map of 100+ PHCs across 4 states with live stock risk, bed occupancy & staff layers.',
      icon: Map,
      color: 'border-teal-800 bg-teal-950/40 text-teal-400',
    },
    {
      id: 'alerts',
      title: 'Early Warning Alerts',
      category: 'Predictive Analytics',
      desc: '14-day stockout prediction desk for ORS, ASV, Paracetamol, and Oxytocin.',
      icon: Activity,
      color: 'border-red-800 bg-red-950/40 text-red-400',
    },
    {
      id: 'transfers',
      title: 'Resource Redistribution Engine',
      category: 'Logistics Rebalancing',
      desc: 'Automated inter-PHC drug transfer recommendations based on distance & lead times.',
      icon: Truck,
      color: 'border-sky-800 bg-sky-950/40 text-sky-400',
    },
    {
      id: 'federated',
      title: 'Federated Learning Monitor',
      category: 'Privacy Preserving AI',
      desc: 'Secure local edge training metrics (loss, accuracy, privacy budget ε = 1.2).',
      icon: Database,
      color: 'border-purple-800 bg-purple-950/40 text-purple-400',
    },
    {
      id: 'emergency',
      title: 'Emergency Surge Scenario Mode',
      category: 'Crisis Response',
      desc: 'Simulate monsoon flood, heatwave, or outbreak demand surges across affected states.',
      icon: ShieldAlert,
      color: 'border-amber-800 bg-amber-950/40 text-amber-400',
    },
    {
      id: 'assistant',
      title: 'Gemini AI Command Assistant',
      category: 'Multi-turn Conversational AI',
      desc: 'Role-based Gemini assistant (PHC, District, State, National) with grounded context.',
      icon: Bot,
      color: 'border-indigo-800 bg-indigo-950/40 text-indigo-400',
    },
    {
      id: 'report',
      title: 'Voice & Vision Stock Reporting',
      category: 'Multimodal Telemetry',
      desc: 'Offline-capable audio stock updates and register camera snapshot extraction.',
      icon: Mic,
      color: 'border-emerald-800 bg-emerald-950/40 text-emerald-400',
    },
    {
      id: 'impact',
      title: 'Impact Estimates & ROI Panel',
      category: 'Metrics & Governance',
      desc: 'Quantifiable metrics on stockout days prevented and patient visits protected.',
      icon: FileCheck,
      color: 'border-blue-800 bg-blue-950/40 text-blue-400',
    },
    {
      id: 'about',
      title: 'About & Contacts',
      category: 'System Info & Directory',
      desc: 'App purpose, 24x7 emergency hotlines, state cells, and nodal officer directory.',
      icon: Info,
      color: 'border-slate-800 bg-slate-900 text-slate-300',
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/70 to-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-3 relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-950 text-indigo-300 border border-indigo-800 text-xs font-mono rounded-full">
            <Compass className="w-3.5 h-3.5 text-indigo-400" />
            <span>App Architecture & Navigation Flow</span>
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Site Map & User Navigation Flows
          </h1>

          <p className="text-slate-300 text-sm leading-relaxed font-sans">
            Comprehensive architectural layout, persona-based movement flows, and instant direct access to all AegisHealth India modules.
          </p>
        </div>
      </div>

      {/* Direct Interactive Module Access Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-teal-400" />
            <h2 className="text-lg font-bold text-white">Active App Modules (Click to Launch)</h2>
          </div>
          <span className="text-xs font-mono text-slate-400">{activeModules.length} Functional Views</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeModules.map((mod) => {
            const Icon = mod.icon;
            return (
              <div
                key={mod.id}
                onClick={() => onNavigate(mod.id)}
                className={`p-4 border rounded-xl space-y-2 cursor-pointer transition-all hover:scale-[1.02] hover:shadow-xl group ${mod.color}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono tracking-wider uppercase font-semibold text-slate-400">
                    {mod.category}
                  </span>
                  <Icon className="w-4 h-4 text-slate-300 group-hover:text-white transition-colors" />
                </div>

                <h3 className="font-bold text-sm text-white group-hover:text-teal-300 transition-colors flex items-center gap-1.5">
                  <span>{mod.title}</span>
                  <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </h3>

                <p className="text-xs text-slate-300 font-sans leading-relaxed">
                  {mod.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 1: Visual Navigation Flow (User Movement Across Pages) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6 shadow-xl">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <Workflow className="w-5 h-5 text-sky-400" />
          <div>
            <h2 className="text-lg font-bold text-white">1) Visual Navigation Flow (User Movement Across Pages)</h2>
            <p className="text-xs text-slate-400">Core entry points and primary system routing pipeline</p>
          </div>
        </div>

        {/* Entry Points & Primary Flow Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-3">
            <h3 className="text-sm font-bold text-teal-400 font-mono uppercase tracking-wide flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> Entry Points
            </h3>
            <ul className="space-y-2 text-xs text-slate-300 font-sans">
              <li className="p-2 bg-slate-900 border border-slate-800/80 rounded flex items-center justify-between">
                <span>National Health Portal Direct Deep Link</span>
                <span className="text-[10px] font-mono text-teal-400">/portal-access</span>
              </li>
              <li className="p-2 bg-slate-900 border border-slate-800/80 rounded flex items-center justify-between">
                <span>Search Engine Landing (Emergency Stockout Query)</span>
                <span className="text-[10px] font-mono text-teal-400">/search-landing</span>
              </li>
              <li className="p-2 bg-slate-900 border border-slate-800/80 rounded flex items-center justify-between">
                <span>State Monsoon Surge Campaign Landing</span>
                <span className="text-[10px] font-mono text-teal-400">/surge-campaign</span>
              </li>
            </ul>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-3">
            <h3 className="text-sm font-bold text-sky-400 font-mono uppercase tracking-wide flex items-center gap-2">
              <GitFork className="w-4 h-4" /> Primary Navigation Pipeline
            </h3>
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
              {['Home', 'Platform', 'Solutions', 'Control Tower', 'Federated AI', 'Resources', 'Contact'].map(
                (step, i, arr) => (
                  <React.Fragment key={step}>
                    <span className="px-2.5 py-1 bg-slate-900 text-slate-200 border border-slate-800 rounded font-semibold">
                      {step}
                    </span>
                    {i < arr.length - 1 && <ArrowRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />}
                  </React.Fragment>
                )
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Persona-Based Flows */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          <Users className="w-5 h-5 text-purple-400" />
          <h2 className="text-lg font-bold text-white">2) Persona-Based Movement Flows</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Persona A: Government Health Official */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-xl border-t-2 border-t-teal-500">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-teal-400" />
              <h3 className="font-bold text-sm text-white">A) Government Health Official</h3>
            </div>
            <p className="text-xs text-slate-400 font-sans">
              National & State Health Mission Directors tracking stockouts, bed occupancy, and approving inter-district transfers.
            </p>
            <div className="space-y-2 text-xs font-mono">
              {[
                'Home',
                'Control Tower',
                'National Health Command Center',
                'District Drilldown',
                'Predictive Insights',
                'Contact for Deployment',
              ].map((step, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 bg-slate-950 border border-slate-800/80 rounded text-slate-200">
                  <span className="text-[10px] font-bold text-teal-400 w-4">{idx + 1}.</span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Persona B: Hospital Administrator */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-xl border-t-2 border-t-sky-500">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-sky-400" />
              <h3 className="font-bold text-sm text-white">B) Hospital & PHC Administrator</h3>
            </div>
            <p className="text-xs text-slate-400 font-sans">
              District Officers and PHC Medical In-charges monitoring local bed capacity, staff attendance, and stock logs.
            </p>
            <div className="space-y-2 text-xs font-mono">
              {[
                'Home',
                'Solutions → Hospital Operations',
                'Resource Availability',
                'Workforce & Bed Management',
                'Deployment Options',
                'Request Demo',
              ].map((step, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 bg-slate-950 border border-slate-800/80 rounded text-slate-200">
                  <span className="text-[10px] font-bold text-sky-400 w-4">{idx + 1}.</span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Persona C: Data Scientist / Developer */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-xl border-t-2 border-t-purple-500">
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-purple-400" />
              <h3 className="font-bold text-sm text-white">C) Data Scientist & Developer</h3>
            </div>
            <p className="text-xs text-slate-400 font-sans">
              AI researchers and system architects inspecting privacy budgets (ε = 1.2), model convergence, and REST APIs.
            </p>
            <div className="space-y-2 text-xs font-mono">
              {[
                'Home',
                'Platform → Architecture',
                'Federated AI → Secure Model Training',
                'API Reference',
                'Developer Portal',
                'Sandbox Access',
              ].map((step, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 bg-slate-950 border border-slate-800/80 rounded text-slate-200">
                  <span className="text-[10px] font-bold text-purple-400 w-4">{idx + 1}.</span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Cross-Linking Patterns */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4 shadow-xl">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <GitFork className="w-5 h-5 text-amber-400" />
          <h2 className="text-lg font-bold text-white">3) Cross-Linking Architecture Patterns</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-amber-400 mt-1.5 shrink-0" />
            <div>
              <strong className="text-white block font-mono">Solution Pages → Platform Architecture</strong>
              <span className="text-slate-400">Every solution module links directly to Platform → Architecture for technical validation.</span>
            </div>
          </div>

          <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-amber-400 mt-1.5 shrink-0" />
            <div>
              <strong className="text-white block font-mono">Control Tower → Public Health Surveillance</strong>
              <span className="text-slate-400">Control Tower views cross-link to Solutions → Public Health Surveillance for epidemiological context.</span>
            </div>
          </div>

          <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-amber-400 mt-1.5 shrink-0" />
            <div>
              <strong className="text-white block font-mono">Federated AI → Technical Documentation</strong>
              <span className="text-slate-400">Federated Learning monitoring pages link directly to Differential Privacy & SDK Documentation.</span>
            </div>
          </div>

          <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-amber-400 mt-1.5 shrink-0" />
            <div>
              <strong className="text-white block font-mono">Homepage CTAs → Platform + Contact</strong>
              <span className="text-slate-400">All primary call-to-action triggers route directly to Platform Overview and Deployment Contact.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
