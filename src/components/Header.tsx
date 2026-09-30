import React, { useState } from 'react';
import {
  ShieldAlert,
  Activity,
  Globe,
  UserCheck,
  Zap,
  Info,
  Server,
  X,
  Volume2,
  Sparkles,
  Compass,
  Download,
  Sun,
  Moon,
  Eye,
  LayoutGrid,
  MapPin,
  AlertTriangle,
  Truck,
  ChevronDown,
  BookOpen,
  Sliders,
} from 'lucide-react';
import { LanguageCode, UserRole } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { GeminiStatusIndicator } from './GeminiStatusIndicator';
import { HealthCheckResult } from './GeminiDiagnosticModal';

interface HeaderProps {
  role: UserRole;
  setRole: (r: UserRole) => void;
  lang: LanguageCode;
  setLang: (l: LanguageCode) => void;
  activeScenarioName?: string;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  geminiMode: 'live' | 'cache' | 'fallback';
  healthStatus: HealthCheckResult;
  onOpenDiagnosticModal: () => void;
  onOpenExportModal?: () => void;
  theme: 'command' | 'field';
  setTheme: (t: 'command' | 'field') => void;
  isLaymanMode: boolean;
  setIsLaymanMode: (b: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  role,
  setRole,
  lang,
  setLang,
  activeScenarioName,
  activeTab,
  setActiveTab,
  geminiMode,
  healthStatus,
  onOpenDiagnosticModal,
  onOpenExportModal,
  theme,
  setTheme,
  isLaymanMode,
  setIsLaymanMode,
}) => {
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  // Simple / Layman Primary Tabs
  const laymanTabs = [
    { id: 'map', label: '1. Map & Stock View', sub: 'See Health Centres & Medicines', icon: MapPin },
    { id: 'alerts', label: '2. Urgent Stock Alerts', sub: 'Centres running low', icon: AlertTriangle },
    { id: 'transfers', label: '3. Stock Transfers', sub: 'Move surplus medicine', icon: Truck },
    { id: 'assistant', label: '4. Ask Sanjeevani AI', sub: 'Plain language helper', icon: Sparkles, isAi: true },
  ];

  // Full Navigation Items
  const navItems = [
    { id: 'map', label: t.nationalMap, icon: MapPin },
    { id: 'alerts', label: t.alertsOverview, icon: AlertTriangle },
    { id: 'transfers', label: t.redistribution, icon: Truck },
    { id: 'federated', label: t.federatedMonitor, icon: Activity },
    { id: 'assistant', label: t.assistant, isHighlighted: true, icon: Sparkles },
    { id: 'emergency', label: 'Disaster Simulator', icon: ShieldAlert },
    { id: 'impact', label: t.impactPanel, icon: LayoutGrid },
    { id: 'methodology', label: t.methodology, icon: BookOpen },
    { id: 'pilot', label: t.pathToPilot, icon: Compass },
  ];

  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 shadow-lg">
      {/* Top Banner Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Brand Lockup */}
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-teal-600 flex items-center justify-center text-white shadow-md shadow-teal-900/40 font-bold text-lg">
            AH
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight text-white">{t.appTitle}</span>
              <span className="text-xs text-slate-400 font-mono">· {t.syntheticBadge}</span>
              {activeScenarioName && (
                <span className="px-2 py-0.5 text-[11px] font-semibold bg-red-950 text-red-300 border border-red-800 rounded-md flex items-center gap-1 animate-pulse">
                  <Zap className="w-3 h-3 text-red-400" />
                  EMERGENCY: {activeScenarioName}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 tracking-wide font-mono hidden sm:block">
              {t.nationalCommand}
            </p>
          </div>
        </div>

        {/* Control Tools Line */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Gemini API Diagnostic Status Indicator */}
          <GeminiStatusIndicator
            healthStatus={healthStatus}
            onOpenDiagnosticModal={onOpenDiagnosticModal}
          />

          {/* System Status Indicator */}
          <button
            onClick={() => setShowStatusModal(true)}
            className={`px-2.5 py-1 text-xs font-mono rounded-md border flex items-center gap-1.5 transition-colors ${
              geminiMode === 'live'
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800/80 hover:bg-emerald-900/80'
                : 'bg-amber-950/80 text-amber-300 border-amber-800/80 hover:bg-amber-900/80'
            }`}
            title="Click to view AI Gateway & Control Tower Status"
          >
            <Server className="w-3.5 h-3.5" />
            <span>AI Gateway: {geminiMode.toUpperCase()}</span>
          </button>

          {/* Role Switcher with Persona Selector */}
          <div className="flex items-center gap-1 bg-slate-800/90 border border-slate-700 rounded-lg p-1 text-xs">
            <UserCheck className="w-3.5 h-3.5 text-teal-400 ml-1" />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer pr-1"
            >
              <option value="phc" className="bg-slate-900 text-slate-100">
                1. {t.phcView} (Frontline)
              </option>
              <option value="district" className="bg-slate-900 text-slate-100">
                2. {t.districtView} (DHO)
              </option>
              <option value="state" className="bg-slate-900 text-slate-100">
                3. {t.stateView} (Directorate)
              </option>
              <option value="national" className="bg-slate-900 text-slate-100">
                4. {t.nationalView} (Command Tower)
              </option>
            </select>
            <span className="text-[10px] text-amber-400 font-mono bg-amber-950/80 border border-amber-800/80 px-1.5 py-0.5 rounded ml-1 whitespace-nowrap">
              Demo role switcher — not authentication
            </span>
            <button
              onClick={() => setShowRoleModal(true)}
              className="px-1.5 py-0.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded text-[10px] font-mono transition-colors"
              title="View 4 User Persona Access Permissions"
            >
              Info
            </button>
          </div>

          {/* Language Switcher */}
          <div className="flex items-center gap-1.5 bg-slate-800/90 border border-slate-700 rounded-lg p-1 text-xs">
            <Globe className="w-3.5 h-3.5 text-sky-400 ml-1" />
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value as LanguageCode)}
              className="bg-transparent text-slate-200 font-medium focus:outline-none cursor-pointer pr-1"
            >
              <option value="en" className="bg-slate-900 text-slate-100">
                English
              </option>
              <option value="hi" className="bg-slate-900 text-slate-100">
                हिन्दी (Hindi)
              </option>
              <option value="ta" className="bg-slate-900 text-slate-100">
                தமிழ் (Tamil)
              </option>
              <option value="bn" className="bg-slate-900 text-slate-100">
                বাংলা (Bengali)
              </option>
              <option value="as" className="bg-slate-900 text-slate-100">
                অসমীয়া (Assamese)
              </option>
              <option value="mr" className="bg-slate-900 text-slate-100">
                मराठी (Marathi)
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* Priority Action Row (Below Language Selection Line) */}
      <div className="bg-slate-950/90 border-t border-b border-slate-800/80 px-4 sm:px-6 lg:px-8 py-1.5 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
            Priority Mode & Info:
          </span>

          <button
            onClick={() => setActiveTab('emergency')}
            className={`px-3 py-1 font-bold rounded-md border flex items-center gap-1.5 transition-all text-xs ${
              activeTab === 'emergency'
                ? 'bg-red-600 text-white border-red-500 shadow-md shadow-red-900/40 font-mono'
                : 'bg-red-950/60 text-red-300 border-red-800/80 hover:bg-red-900/80 font-mono'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
            <span>{t.emergencyMode}</span>
          </button>

          <button
            onClick={() => setActiveTab('about')}
            className={`px-3 py-1 font-bold rounded-md border flex items-center gap-1.5 transition-all text-xs ${
              activeTab === 'about'
                ? 'bg-teal-600 text-white border-teal-500 shadow-md shadow-teal-900/40 font-mono'
                : 'bg-teal-950/60 text-teal-300 border-teal-800/80 hover:bg-teal-900/80 font-mono'
            }`}
          >
            <Info className="w-3.5 h-3.5 text-teal-400" />
            <span>{t.aboutContacts}</span>
          </button>

          <button
            onClick={() => setActiveTab('sitemap')}
            className={`px-3 py-1 font-bold rounded-md border flex items-center gap-1.5 transition-all text-xs ${
              activeTab === 'sitemap'
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-900/40 font-mono'
                : 'bg-indigo-950/60 text-indigo-300 border-indigo-800/80 hover:bg-indigo-900/80 font-mono'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-indigo-400" />
            <span>{t.sitemap}</span>
          </button>

          {onOpenExportModal && (
            <button
              onClick={onOpenExportModal}
              className="px-3 py-1 font-bold rounded-md border border-emerald-800/80 bg-emerald-950/60 text-emerald-300 hover:bg-emerald-900/80 font-mono flex items-center gap-1.5 transition-all text-xs"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export Data</span>
            </button>
          )}

          <button
            onClick={() => setTheme(theme === 'command' ? 'field' : 'command')}
            className={`px-3 py-1 font-bold rounded-md border flex items-center gap-1.5 transition-all text-xs font-mono ${
              theme === 'field'
                ? 'bg-amber-100 text-amber-900 border-amber-300 shadow-md font-bold'
                : 'bg-slate-800/90 text-slate-200 border-slate-700 hover:bg-slate-700'
            }`}
            title={theme === 'command' ? 'Switch to Field Duty Light Mode (High Sunlight Visibility)' : 'Switch to Command Room Dark Mode'}
          >
            {theme === 'command' ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span>Field Duty (Light)</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-sky-400" />
                <span>Command Room (Dark)</span>
              </>
            )}
          </button>

          {/* Simple Layman View Toggle */}
          <button
            onClick={() => setIsLaymanMode(!isLaymanMode)}
            className={`px-3 py-1 font-bold rounded-md border flex items-center gap-1.5 transition-all text-xs font-mono ${
              isLaymanMode
                ? 'bg-teal-950 text-teal-300 border-teal-500 shadow-md ring-1 ring-teal-500/50'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
            title="Toggle between Simple Layman Navigation and Expert Control Room"
          >
            <Eye className="w-3.5 h-3.5 text-teal-400" />
            <span>{isLaymanMode ? 'Simple Layman View: ON' : 'Expert Control View'}</span>
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-400 font-mono">
          <span>AegisHealth Control Tower</span>
          <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
        </div>
      </div>

      {/* Primary Navigation Tabs Row (3rd Line) */}
      <div className="bg-slate-900/95 px-4 sm:px-6 lg:px-8 border-t border-slate-800 py-1.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 overflow-x-auto scrollbar-none">
          {isLaymanMode ? (
            /* SIMPLE LAYMAN NAVIGATION (4 Clear Primary Cards + More Dropdown) */
            <nav className="flex items-center gap-2 w-full justify-between sm:justify-start">
              <div className="flex items-center gap-2 flex-wrap">
                {laymanTabs.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`px-3 py-1.5 rounded-xl border text-left transition-all flex items-center gap-2.5 ${
                        isActive
                          ? item.isAi
                            ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-purple-400 shadow-md shadow-purple-900/50'
                            : 'bg-teal-600 text-white border-teal-400 shadow-md shadow-teal-900/50'
                          : item.isAi
                          ? 'bg-purple-950/40 text-purple-200 border-purple-800/60 hover:bg-purple-900/60'
                          : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : item.isAi ? 'text-purple-300' : 'text-teal-400'}`} />
                      <div>
                        <div className="text-xs font-bold leading-tight">{item.label}</div>
                        <div className={`text-[10px] font-sans ${isActive ? 'text-teal-100' : 'text-slate-400'}`}>
                          {item.sub}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Advanced / More Tools Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowMoreMenu(!showMoreMenu)}
                  className="px-3 py-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Sliders className="w-3.5 h-3.5 text-amber-400" />
                  <span>More Tools ▾</span>
                </button>

                {showMoreMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 p-2 space-y-1 text-xs font-sans">
                    <div className="text-[10px] font-mono text-slate-400 px-2 py-1 uppercase tracking-wider border-b border-slate-800">
                      Advanced Control Modules
                    </div>

                    <button
                      onClick={() => {
                        setActiveTab('federated');
                        setShowMoreMenu(false);
                      }}
                      className="w-full text-left px-2.5 py-1.5 hover:bg-slate-800 text-slate-200 rounded-lg flex items-center gap-2"
                    >
                      <Activity className="w-3.5 h-3.5 text-sky-400" />
                      <span>Federated AI Monitor</span>
                    </button>

                    <button
                      onClick={() => {
                        setActiveTab('emergency');
                        setShowMoreMenu(false);
                      }}
                      className="w-full text-left px-2.5 py-1.5 hover:bg-slate-800 text-slate-200 rounded-lg flex items-center gap-2"
                    >
                      <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                      <span>Disaster Simulator</span>
                    </button>

                    <button
                      onClick={() => {
                        setActiveTab('impact');
                        setShowMoreMenu(false);
                      }}
                      className="w-full text-left px-2.5 py-1.5 hover:bg-slate-800 text-slate-200 rounded-lg flex items-center gap-2"
                    >
                      <LayoutGrid className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Impact Analytics</span>
                    </button>

                    <button
                      onClick={() => {
                        setActiveTab('methodology');
                        setShowMoreMenu(false);
                      }}
                      className="w-full text-left px-2.5 py-1.5 hover:bg-slate-800 text-slate-200 rounded-lg flex items-center gap-2"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Methodology & Models</span>
                    </button>
                  </div>
                )}
              </div>
            </nav>
          ) : (
            /* FULL EXPERT NAVIGATION ROW */
            <nav className="flex items-center gap-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg whitespace-nowrap transition-all flex items-center gap-1.5 border ${
                      isActive
                        ? 'bg-teal-600 text-white border-teal-400 shadow-md shadow-teal-900/50'
                        : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 text-teal-400" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          )}
        </div>
      </div>

      {/* System Status Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-lg w-full text-slate-200 shadow-2xl relative">
            <button
              onClick={() => setShowStatusModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-teal-400" />
              <h3 className="font-bold text-lg text-white">System Status & Architecture</h3>
            </div>
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                <div className="flex justify-between font-mono mb-1">
                  <span className="text-slate-400">Gemini SDK Gateway:</span>
                  <span className="text-teal-400 font-bold">
                    {geminiMode === 'live' ? 'ONLINE (Google GenAI SDK)' : 'CACHED FALLBACK MODE'}
                  </span>
                </div>
                <p className="text-slate-400">
                  Model: <span className="text-slate-200 font-mono">gemini-3.8-flash</span> via server proxy (`/api/gemini/*`). Zero browser key exposure.
                </p>
              </div>

              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
                <div className="font-semibold text-white">Data Authenticity Disclaimer</div>
                <p className="text-slate-400 leading-relaxed">
                  All PHC stock levels, bed occupancy, footfall series, and federated learning curves are generated in-app with a deterministic seed for hackathon live demo reproducibility.
                </p>
              </div>

              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
                <div className="font-semibold text-white">Production Path Target</div>
                <p className="text-slate-400 leading-relaxed">
                  Target architecture for pilot deployment includes Firebase Authentication, Cloud Run microservices, BigQuery data warehouse, and Vertex AI model serving.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowStatusModal(false)}
              className="mt-5 w-full py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-semibold"
            >
              Close Status Window
            </button>
          </div>
        </div>
      )}

      {/* 4 Persona Login / Access Permissions Modal */}
      {showRoleModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-2xl w-full text-slate-200 shadow-2xl relative space-y-4">
            <button
              onClick={() => setShowRoleModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <UserCheck className="w-5 h-5 text-teal-400" />
              <div>
                <h3 className="font-bold text-base text-white">4 User Login Personas & Access Permissions</h3>
                <p className="text-xs text-slate-400">Select any role to instantly switch active workspace scope and RBAC filters</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* Persona 1: PHC Officer */}
              <div
                onClick={() => {
                  setRole('phc');
                  setShowRoleModal(false);
                }}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all space-y-1.5 ${
                  role === 'phc'
                    ? 'bg-teal-950/80 border-teal-500 ring-1 ring-teal-500'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between font-bold">
                  <span className="text-teal-300">1. PHC Medical Officer</span>
                  <span className="px-1.5 py-0.5 bg-teal-900/60 text-teal-300 rounded text-[10px] font-mono">Frontline</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Local PHC stock entry, Voice & Vision photo OCR reports, local risk alerts.
                </p>
                <div className="text-[10px] font-mono text-slate-500 pt-1 border-t border-slate-800">
                  Model: <strong className="text-teal-400">gemini-3.1-flash-lite</strong>
                </div>
              </div>

              {/* Persona 2: District Health Officer */}
              <div
                onClick={() => {
                  setRole('district');
                  setShowRoleModal(false);
                }}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all space-y-1.5 ${
                  role === 'district'
                    ? 'bg-sky-950/80 border-sky-500 ring-1 ring-sky-500'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between font-bold">
                  <span className="text-sky-300">2. District Officer (DHO)</span>
                  <span className="px-1.5 py-0.5 bg-sky-900/60 text-sky-300 rounded text-[10px] font-mono">District Hub</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  District alert desk, approving inter-PHC medicine redistributions, audit logs.
                </p>
                <div className="text-[10px] font-mono text-slate-500 pt-1 border-t border-slate-800">
                  Model: <strong className="text-sky-400">gemini-3.5-flash</strong>
                </div>
              </div>

              {/* Persona 3: State Mission Director */}
              <div
                onClick={() => {
                  setRole('state');
                  setShowRoleModal(false);
                }}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all space-y-1.5 ${
                  role === 'state'
                    ? 'bg-amber-950/80 border-amber-500 ring-1 ring-amber-500'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between font-bold">
                  <span className="text-amber-300">3. State Mission Director</span>
                  <span className="px-1.5 py-0.5 bg-amber-900/60 text-amber-300 rounded text-[10px] font-mono">Directorate</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Statewide health surveillance, flood/outbreak scenario simulation, PHC onboarding.
                </p>
                <div className="text-[10px] font-mono text-slate-500 pt-1 border-t border-slate-800">
                  Model: <strong className="text-amber-400">gemini-3.8-flash</strong>
                </div>
              </div>

              {/* Persona 4: National Command Tower */}
              <div
                onClick={() => {
                  setRole('national');
                  setShowRoleModal(false);
                }}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all space-y-1.5 ${
                  role === 'national'
                    ? 'bg-purple-950/80 border-purple-500 ring-1 ring-purple-500'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between font-bold">
                  <span className="text-purple-300">4. National Command Tower</span>
                  <span className="px-1.5 py-0.5 bg-purple-900/60 text-purple-300 rounded text-[10px] font-mono">Full Access</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  All 4 states (~100 PHCs), Federated Learning Monitor, Impact Analytics, Data Exporter.
                </p>
                <div className="text-[10px] font-mono text-slate-500 pt-1 border-t border-slate-800">
                  Model: <strong className="text-purple-400">gemini-3.1-pro-preview</strong>
                </div>
              </div>
            </div>

            <div className="pt-2 text-[11px] font-mono text-slate-400 flex items-center justify-between border-t border-slate-800">
              <span>Currently Active: <strong className="text-white uppercase">{role}</strong></span>
              <span>RBAC Role Enforcement Active</span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
