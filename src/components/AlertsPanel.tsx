import React, { useState } from 'react';
import {
  AlertTriangle,
  ShieldAlert,
  Sparkles,
  Truck,
  Filter,
  Search,
  Calendar,
  Building2,
  Clock,
  ArrowRight,
  Info,
} from 'lucide-react';
import { Alert, AlertSeverity, LanguageCode } from '../types';
import { getAlertExplanation } from '../gemini/client';
import { TRANSLATIONS } from '../i18n/translations';

interface AlertsPanelProps {
  alerts: Alert[];
  onSelectPhcById: (phcId: string) => void;
  onTriggerRedistribution: (alert: Alert) => void;
  lang: LanguageCode;
}

export const AlertsPanel: React.FC<AlertsPanelProps> = ({
  alerts,
  onSelectPhcById,
  onTriggerRedistribution,
  lang,
}) => {
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [explanations, setExplanations] = useState<Record<string, { text: string; action: string; mode: string }>>({});
  const [loadingExpl, setLoadingExpl] = useState<Record<string, boolean>>({});

  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  const filteredAlerts = alerts.filter((a) => {
    if (selectedSeverity !== 'all' && a.severity !== selectedSeverity) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      if (
        !a.phcName.toLowerCase().includes(q) &&
        !a.medicineName.toLowerCase().includes(q) &&
        !a.districtName.toLowerCase().includes(q)
      ) {
        return false;
      }
    }
    return true;
  });

  const handleExplainAlert = async (alert: Alert) => {
    setLoadingExpl((prev) => ({ ...prev, [alert.id]: true }));
    const res = await getAlertExplanation(alert, lang);
    setLoadingExpl((prev) => ({ ...prev, [alert.id]: false }));

    if (res.data) {
      setExplanations((prev) => ({
        ...prev,
        [alert.id]: {
          text: res.data.text,
          action: res.data.action,
          mode: res.mode,
        },
      }));
    }
  };

  return (
    <div className="space-y-4">
      {/* Header & Filter Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-red-400" />
          <div>
            <h2 className="font-bold text-base text-white">{t.alertsOverview}</h2>
            <p className="text-xs text-slate-400">
              Predictive 14-day stock-out early warnings powered by exponential demand smoothing
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap text-xs">
          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5">
            <Filter className="w-3.5 h-3.5 text-teal-400" />
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="bg-transparent text-slate-200 font-medium focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-slate-900">All Alert Tiers ({alerts.length})</option>
              <option value="critical" className="bg-slate-900">Critical ({alerts.filter((a) => a.severity === 'critical').length})</option>
              <option value="warning" className="bg-slate-900">Warning ({alerts.filter((a) => a.severity === 'warning').length})</option>
              <option value="watch" className="bg-slate-900">Watch ({alerts.filter((a) => a.severity === 'watch').length})</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Filter PHC or Medicine..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-slate-100 placeholder-slate-500 focus:outline-none w-40"
            />
          </div>
        </div>
      </div>

      {/* Alerts Grid / List */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="p-8 bg-slate-900 border border-slate-800 rounded-xl text-center text-slate-400 text-xs">
            No active risk alerts matching current filters. All stock buffers stable.
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const expl = explanations[alert.id];
            const isLoading = loadingExpl[alert.id];

            return (
              <div
                key={alert.id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md hover:border-slate-700 transition-colors space-y-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {renderSeverityBadge(alert.severity, t)}
                      <h3 className="font-bold text-sm text-white">{alert.medicineName}</h3>
                      <span className="text-slate-400 text-xs">at</span>
                      <button
                        onClick={() => onSelectPhcById(alert.phcId)}
                        className="font-semibold text-xs text-teal-400 hover:underline flex items-center gap-1"
                      >
                        <Building2 className="w-3.5 h-3.5" />
                        {alert.phcName} ({alert.districtName}, {alert.stateName})
                      </button>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-400 font-mono pt-1">
                      <span>Days of Cover: <strong className="text-white font-bold">{alert.daysOfCover} days</strong></span>
                      <span>Stock on Hand: <strong className="text-white">{alert.onHand} units</strong></span>
                      <span>Daily Demand: <strong className="text-white">{alert.dailyDemand} units/day</strong></span>
                      <span>Lead Time: <strong className="text-white">{alert.leadTimeDays} days</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleExplainAlert(alert)}
                      disabled={isLoading}
                      className="px-3 py-1.5 bg-indigo-950 hover:bg-indigo-900 text-indigo-300 border border-indigo-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                      {isLoading ? 'Reasoning...' : 'Gemini AI Explain'}
                    </button>

                    <button
                      onClick={() => onTriggerRedistribution(alert)}
                      className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      Redistribute
                    </button>
                  </div>
                </div>

                {/* Driver Tags */}
                {alert.drivers.length > 0 && (
                  <div className="flex items-center gap-2 text-[11px] font-mono flex-wrap pt-1">
                    <span className="text-slate-500">Risk Drivers:</span>
                    {alert.drivers.map((d, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 bg-slate-950 text-slate-300 border border-slate-800 rounded-md"
                      >
                        {d}
                      </span>
                    ))}
                  </div>
                )}

                {/* Gemini AI Plain Language Explanation Drawer */}
                {expl && (
                  <div className="p-3 bg-slate-950 border border-indigo-900/60 rounded-lg text-xs space-y-2 animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-indigo-300 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                        Gemini Explainable Intelligence
                      </span>
                      <span className="text-[10px] font-mono px-1.5 bg-indigo-950 text-indigo-400 border border-indigo-800 rounded">
                        Mode: {expl.mode.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-slate-300 leading-relaxed">{expl.text}</p>
                    <div className="pt-1 font-semibold text-teal-400 flex items-center gap-1">
                      <ArrowRight className="w-3.5 h-3.5" /> Recommended Action: {expl.action}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

function renderSeverityBadge(severity: AlertSeverity, t: any) {
  switch (severity) {
    case 'critical':
      return (
        <span className="px-2 py-0.5 bg-red-950 text-red-300 border border-red-800 rounded-md text-[11px] font-bold flex items-center gap-1">
          <span className="w-2 h-2 bg-red-500 rounded-sm transform rotate-45" />
          {t.critical}
        </span>
      );
    case 'warning':
      return (
        <span className="px-2 py-0.5 bg-amber-950 text-amber-300 border border-amber-800 rounded-md text-[11px] font-bold flex items-center gap-1">
          <span className="w-2 h-2 bg-amber-500 rounded-full" />
          {t.warning}
        </span>
      );
    case 'watch':
      return (
        <span className="px-2 py-0.5 bg-blue-950 text-blue-300 border border-blue-800 rounded-md text-[11px] font-bold flex items-center gap-1">
          <span className="w-2 h-2 bg-blue-500 rounded-sm" />
          {t.watch}
        </span>
      );
    default:
      return null;
  }
}
