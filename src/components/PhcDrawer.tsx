import React, { useState } from 'react';
import {
  X,
  Building2,
  BedDouble,
  Users,
  AlertTriangle,
  Mic,
  Camera,
  Calendar,
  Truck,
  TrendingUp,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Area,
  ComposedChart,
} from 'recharts';
import { Alert, LanguageCode, PHC, StockRecord } from '../types';
import { MEDICINES } from '../engine/config';
import { computeDemandForecast } from '../engine/forecast';
import { TRANSLATIONS } from '../i18n/translations';

interface PhcDrawerProps {
  phc: PHC | null;
  onClose: () => void;
  stockRecords: Record<string, StockRecord>;
  alerts: Alert[];
  onOpenVoiceModal: () => void;
  onOpenVisionModal: () => void;
  onProposeTransferForPhc: (phcId: string, medicineId: string) => void;
  lang: LanguageCode;
}

export const PhcDrawer: React.FC<PhcDrawerProps> = ({
  phc,
  onClose,
  stockRecords,
  alerts,
  onOpenVoiceModal,
  onOpenVisionModal,
  onProposeTransferForPhc,
  lang,
}) => {
  if (!phc) return null;

  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;
  const [selectedMedId, setSelectedMedId] = useState<string>('ors');

  const phcAlerts = alerts.filter((a) => a.phcId === phc.id);

  // Get stock for selected medicine
  const currentStock = stockRecords[`${phc.id}_${selectedMedId}`];
  const selectedMedInfo = MEDICINES.find((m) => m.id === selectedMedId) || MEDICINES[0];

  // Calculate 14-day forecast for selected medicine
  const forecast = computeDemandForecast(
    currentStock?.consumptionDaily || Array(90).fill(15),
    phc.id,
    selectedMedId
  );

  // Prepare chart data (Last 14 days history + 14 days forecast)
  const historySlice = (currentStock?.consumptionDaily || Array(90).fill(15)).slice(-14);
  const chartData = [
    ...historySlice.map((val, idx) => ({
      day: `Hist D-${14 - idx}`,
      actual: val,
      forecast: null,
      lower: null,
      upper: null,
    })),
    ...forecast.dailyForecast.map((val, idx) => ({
      day: `Fcst +${idx + 1}`,
      actual: null,
      forecast: val,
      lower: forecast.lowerBound[idx],
      upper: forecast.upperBound[idx],
    })),
  ];

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[540px] bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col text-slate-100 overflow-hidden">
      {/* Drawer Header */}
      <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-teal-600/20 text-teal-400 border border-teal-800/50 rounded-lg">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-white">{phc.name}</h3>
            <p className="text-xs text-slate-400 font-mono">
              Code: {phc.code} · Coordinates: {phc.lat}, {phc.lng}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Drawer Body Scrollable */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Quick Metrics Bar */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-slate-400">Bed Occupancy:</span>
              <div className="font-mono text-base font-bold text-white mt-0.5">
                {phc.beds.occupied} / {phc.beds.total} ({Math.round((phc.beds.occupied / phc.beds.total) * 100)}%)
              </div>
            </div>
            <BedDouble className="w-5 h-5 text-sky-400" />
          </div>

          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-slate-400">Staff Present:</span>
              <div className="font-mono text-base font-bold text-white mt-0.5">
                {phc.staff.presentToday} / {phc.staff.sanctioned} ({Math.round((phc.staff.presentToday / phc.staff.sanctioned) * 100)}%)
              </div>
            </div>
            <Users className="w-5 h-5 text-indigo-400" />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onOpenVoiceModal}
            className="py-2.5 px-3 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 shadow-md transition-colors"
          >
            <Mic className="w-4 h-4" /> {t.recordVoice}
          </button>
          <button
            onClick={onOpenVisionModal}
            className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <Camera className="w-4 h-4" /> {t.uploadStockPhoto}
          </button>
        </div>

        {/* Active Alerts Section */}
        {phcAlerts.length > 0 && (
          <div className="p-3 bg-red-950/40 border border-red-800/60 rounded-lg space-y-2">
            <div className="flex items-center gap-1.5 text-red-400 text-xs font-semibold">
              <AlertTriangle className="w-4 h-4" /> Active Risk Alerts for this PHC ({phcAlerts.length})
            </div>
            {phcAlerts.map((a) => (
              <div key={a.id} className="text-xs bg-slate-900/80 p-2.5 rounded border border-red-900/50 flex items-center justify-between">
                <div>
                  <span className="font-bold text-white">{a.medicineName}</span>
                  <p className="text-slate-400 font-mono text-[11px] mt-0.5">
                    Cover: {a.daysOfCover} days · Depletion by {a.projectedStockoutDate}
                  </p>
                </div>
                <button
                  onClick={() => onProposeTransferForPhc(phc.id, a.medicineId)}
                  className="px-2.5 py-1 bg-red-600 hover:bg-red-500 text-white font-semibold rounded text-[11px] flex items-center gap-1"
                >
                  <Truck className="w-3 h-3" /> Redistribute
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Forecast Chart & Medicine Selector */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-teal-400" />
              <span className="font-bold text-xs text-white">Demand Forecast Horizon (14 Days)</span>
            </div>
            <select
              value={selectedMedId}
              onChange={(e) => setSelectedMedId(e.target.value)}
              className="bg-slate-900 text-slate-200 border border-slate-800 text-xs rounded px-2 py-1 focus:outline-none"
            >
              {MEDICINES.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          <div className="h-44 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData}>
                <XAxis dataKey="day" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                />
                <Area type="monotone" dataKey="upper" fill="#0d9488" stroke="none" opacity={0.15} />
                <Line type="monotone" dataKey="actual" stroke="#38bdf8" strokeWidth={2} dot={false} name="Actual Consumption" />
                <Line type="monotone" dataKey="forecast" stroke="#10b981" strokeWidth={2} strokeDasharray="4 4" dot={false} name="Forecast Demand" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-1">
            <span>Avg Daily Forecast: {forecast.avgDailyDemand} {selectedMedInfo.unit}/day</span>
            <span>Forecast Error WAPE: {(forecast.wape * 100).toFixed(1)}%</span>
          </div>
        </div>

        {/* 12 Essential Medicines Inventory Table */}
        <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
          <div className="p-3 bg-slate-900 border-b border-slate-800 font-bold text-xs text-white">
            Essential Medicine Stock Inventory
          </div>
          <div className="divide-y divide-slate-800/80 max-h-64 overflow-y-auto">
            {MEDICINES.map((med) => {
              const stock = stockRecords[`${phc.id}_${med.id}`];
              const dailyDemand = Math.max(1, Math.round((stock?.onHand || 100) / 15));
              const daysCover = stock ? Number((stock.onHand / dailyDemand).toFixed(1)) : 10;

              let badgeBg = 'bg-teal-950 text-teal-300 border-teal-800';
              if (daysCover <= (stock?.leadTimeDays || 5)) {
                badgeBg = 'bg-red-950 text-red-300 border-red-800';
              } else if (daysCover <= (stock?.leadTimeDays || 5) + 4) {
                badgeBg = 'bg-amber-950 text-amber-300 border-amber-800';
              }

              return (
                <div key={med.id} className="p-2.5 flex items-center justify-between text-xs hover:bg-slate-900/60 transition-colors">
                  <div>
                    <div className="font-semibold text-white flex items-center gap-1.5">
                      {med.name}
                      {med.coldChain && (
                        <span className="text-[10px] px-1 bg-sky-950 text-sky-400 border border-sky-800 rounded">
                          Cold Chain
                        </span>
                      )}
                    </div>
                    <span className="text-slate-400 text-[11px] font-mono">
                      Lead Time: {stock?.leadTimeDays || 5} days · Safety: {stock?.safetyStock || 50} {med.unit}
                    </span>
                  </div>
                  <div className="text-right font-mono">
                    <div className="font-bold text-white">
                      {stock?.onHand || 0} {med.unit}
                    </div>
                    <span className={`inline-block px-1.5 py-0.5 text-[10px] font-semibold border rounded mt-0.5 ${badgeBg}`}>
                      {daysCover} Days Cover
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
