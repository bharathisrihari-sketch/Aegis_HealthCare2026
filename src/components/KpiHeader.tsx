import React from 'react';
import {
  AlertTriangle,
  Building2,
  BedDouble,
  Users,
  TrendingDown,
  CheckCircle2,
  ShieldAlert,
} from 'lucide-react';
import { Alert, LanguageCode, PHC } from '../types';
import { TRANSLATIONS } from '../i18n/translations';

interface KpiHeaderProps {
  phcs: PHC[];
  alerts: Alert[];
  lang: LanguageCode;
}

export const KpiHeader: React.FC<KpiHeaderProps> = ({ phcs, alerts, lang }) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  const totalPhcs = phcs.length;
  const reportingPhcs = phcs.length; // 100% active reporting in synthetic world

  const criticalAlerts = alerts.filter((a) => a.severity === 'critical').length;
  const warningAlerts = alerts.filter((a) => a.severity === 'warning').length;
  const watchAlerts = alerts.filter((a) => a.severity === 'watch').length;

  const totalBeds = phcs.reduce((sum, p) => sum + p.beds.total, 0);
  const occupiedBeds = phcs.reduce((sum, p) => sum + p.beds.occupied, 0);
  const bedOccupancyPct = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

  const sanctionedStaff = phcs.reduce((sum, p) => sum + p.staff.sanctioned, 0);
  const presentStaff = phcs.reduce((sum, p) => sum + p.staff.presentToday, 0);
  const staffAttendancePct = sanctionedStaff > 0 ? Math.round((presentStaff / sanctionedStaff) * 100) : 0;

  return (
    <section className="bg-slate-950 border-b border-slate-800/80 py-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* KPI 1: PHCs Reporting */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>{t.phcReporting}</span>
            <Building2 className="w-4 h-4 text-teal-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono tabular-nums text-white">
              {reportingPhcs}<span className="text-sm font-normal text-slate-400">/{totalPhcs}</span>
            </span>
            <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-0.5">
              <CheckCircle2 className="w-3 h-3" /> 100% Active
            </span>
          </div>
        </div>

        {/* KPI 2: Active Risk Alerts */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>{t.activeAlerts}</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-white">{alerts.length}</span>
            <div className="flex items-center gap-1.5 text-[11px] font-mono">
              <span className="px-1.5 py-0.5 bg-red-950 text-red-400 border border-red-800 rounded font-bold">
                {criticalAlerts} C
              </span>
              <span className="px-1.5 py-0.5 bg-amber-950 text-amber-400 border border-amber-800 rounded font-bold">
                {warningAlerts} W
              </span>
            </div>
          </div>
        </div>

        {/* KPI 3: 14-Day Projected Stockouts */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>{t.stockoutProjected}</span>
            <TrendingDown className="w-4 h-4 text-red-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-red-400">{criticalAlerts}</span>
            <span className="text-[11px] text-slate-400 font-mono">Imminent Action Required</span>
          </div>
        </div>

        {/* KPI 4: Bed Occupancy */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>{t.bedOccupancy}</span>
            <BedDouble className="w-4 h-4 text-sky-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-white">{bedOccupancyPct}%</span>
            <span className="text-[11px] text-slate-400 font-mono">
              {occupiedBeds}/{totalBeds} Beds
            </span>
          </div>
        </div>

        {/* KPI 5: Staff Attendance */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 flex flex-col justify-between col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>{t.staffAttendance}</span>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-white">{staffAttendancePct}%</span>
            <span className="text-[11px] text-slate-400 font-mono">
              {presentStaff}/{sanctionedStaff} Staff
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
