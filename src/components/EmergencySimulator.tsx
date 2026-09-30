import React, { useState } from 'react';
import {
  Zap,
  CloudRain,
  Biohazard,
  SunMedium,
  Sparkles,
  AlertTriangle,
  Play,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';
import { Alert, LanguageCode, ScenarioPreset } from '../types';
import { SCENARIO_PRESETS } from '../engine/scenarios';
import { getEmergencyBrief } from '../gemini/client';
import { TRANSLATIONS } from '../i18n/translations';

interface EmergencySimulatorProps {
  activePreset: ScenarioPreset | null;
  onActivatePreset: (preset: ScenarioPreset, severity: number) => void;
  onDeactivatePreset: () => void;
  topAlerts: Alert[];
  lang: LanguageCode;
}

export const EmergencySimulator: React.FC<EmergencySimulatorProps> = ({
  activePreset,
  onActivatePreset,
  onDeactivatePreset,
  topAlerts,
  lang,
}) => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>('dengue_flood');
  const [severityVal, setSeverityVal] = useState<number>(0.8);
  const [briefText, setBriefText] = useState<{ summary: string; priorities: string[]; mode: string } | null>(null);
  const [isGeneratingBrief, setIsGeneratingBrief] = useState<boolean>(false);

  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;
  const currentPreset = SCENARIO_PRESETS.find((p) => p.id === selectedPresetId) || SCENARIO_PRESETS[0];

  const handleActivate = async () => {
    onActivatePreset(currentPreset, severityVal);

    setIsGeneratingBrief(true);
    const res = await getEmergencyBrief(
      currentPreset.name,
      severityVal,
      currentPreset.affectedStates,
      topAlerts,
      lang
    );
    setIsGeneratingBrief(false);

    if (res.data) {
      setBriefText({
        summary: res.data.summary,
        priorities: res.data.priorities,
        mode: res.mode,
      });
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-red-600/20 text-red-400 border border-red-800/50 rounded-lg">
            <Zap className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h2 className="font-bold text-base text-white">{t.emergencyMode} — Health Emergency Simulator</h2>
            <p className="text-xs text-slate-400">
              Stress-test the PHC supply network under rapid disease spikes, climate floods, or heatwaves
            </p>
          </div>
        </div>

        {activePreset && (
          <button
            onClick={onDeactivatePreset}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Deactivate Scenario
          </button>
        )}
      </div>

      {/* Preset Cards Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {SCENARIO_PRESETS.map((preset) => {
          const isSelected = selectedPresetId === preset.id;
          const isActive = activePreset?.id === preset.id;

          return (
            <div
              key={preset.id}
              onClick={() => setSelectedPresetId(preset.id)}
              className={`p-4 rounded-xl border cursor-pointer transition-all space-y-2 ${
                isActive
                  ? 'bg-red-950/60 border-red-600 shadow-lg shadow-red-950/50'
                  : isSelected
                  ? 'bg-slate-900 border-teal-500/80 shadow-md'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-white flex items-center gap-1.5">
                  {renderPresetIcon(preset.iconName)}
                  {preset.name}
                </span>
                {isActive && (
                  <span className="px-1.5 py-0.5 bg-red-600 text-white font-bold text-[9px] rounded animate-pulse">
                    ACTIVE
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                {preset.description}
              </p>
              <div className="text-[10px] font-mono text-slate-500 pt-1">
                Affected States: {preset.affectedStates.map((s) => s.toUpperCase()).join(', ')}
              </div>
            </div>
          );
        })}
      </div>

      {/* Configuration & Trigger Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-lg">
        <div className="font-bold text-xs text-white">
          Configure Scenario Severity & Impact Multipliers
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-slate-300 font-mono">
              <span>Severity Intensity:</span>
              <strong className="text-teal-400">{(severityVal * 100).toFixed(0)}%</strong>
            </div>
            <input
              type="range"
              min="0.2"
              max="1.0"
              step="0.05"
              value={severityVal}
              onChange={(e) => setSeverityVal(Number(e.target.value))}
              className="w-full accent-teal-500 cursor-pointer"
            />
          </div>

          <div className="text-xs font-mono text-slate-400 space-y-0.5">
            <div>Demand Scaling Effect:</div>
            <div className="text-white font-semibold flex items-center gap-2 flex-wrap">
              {Object.entries(currentPreset.multipliers).map(([med, mult]) => (
                <span key={med} className="px-1.5 py-0.5 bg-slate-950 border border-slate-800 rounded">
                  {med.toUpperCase()}: +{((mult * severityVal - 1) * 100).toFixed(0)}%
                </span>
              ))}
            </div>
          </div>

          <div className="text-right">
            <button
              onClick={handleActivate}
              className="w-full md:w-auto px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-red-950/60 transition-colors"
            >
              <Play className="w-4 h-4 fill-white" /> Activate Emergency Mode
            </button>
          </div>
        </div>
      </div>

      {/* Gemini AI Emergency Situation Brief */}
      {isGeneratingBrief ? (
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl text-center space-y-2 text-xs">
          <Sparkles className="w-6 h-6 text-red-400 animate-spin mx-auto" />
          <p className="text-slate-400">Gemini Scenario Reasoning drafting situation brief & prioritized action plan...</p>
        </div>
      ) : (
        briefText && (
          <div className="p-5 bg-slate-900 border border-red-800/80 rounded-xl space-y-4 shadow-xl animate-fadeIn">
            <div className="flex items-center justify-between border-b border-red-900/60 pb-2">
              <span className="font-bold text-sm text-red-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-red-400" /> Official Emergency Situation Brief
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 bg-red-950 text-red-300 border border-red-800 rounded">
                Mode: {briefText.mode.toUpperCase()}
              </span>
            </div>

            <p className="text-xs text-slate-200 leading-relaxed font-sans">{briefText.summary}</p>

            <div className="space-y-2">
              <div className="font-bold text-xs text-white">Prioritized Command Action Plan:</div>
              <div className="space-y-1.5 text-xs">
                {briefText.priorities.map((item, idx) => (
                  <div key={idx} className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
};

function renderPresetIcon(name: string) {
  switch (name) {
    case 'CloudRain':
      return <CloudRain className="w-4 h-4 text-sky-400" />;
    case 'Biohazard':
      return <Biohazard className="w-4 h-4 text-amber-400" />;
    case 'SunMedium':
      return <SunMedium className="w-4 h-4 text-orange-400" />;
    default:
      return <Zap className="w-4 h-4 text-red-400" />;
  }
}
