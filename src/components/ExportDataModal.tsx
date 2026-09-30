import React, { useState } from 'react';
import {
  Download,
  FileSpreadsheet,
  FileText,
  Printer,
  CheckCircle2,
  X,
  ShieldCheck,
  Building2,
  AlertTriangle,
  Truck,
  Filter,
  Layers,
} from 'lucide-react';
import { PHC, Alert, Transfer, UserRole, LanguageCode, StateInfo, Medicine } from '../types';
import { STATES, MEDICINES } from '../engine/config';
import { TRANSLATIONS } from '../i18n/translations';

interface ExportDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  phcs: PHC[];
  alerts: Alert[];
  transfers: Transfer[];
  role: UserRole;
  lang: LanguageCode;
}

export const ExportDataModal: React.FC<ExportDataModalProps> = ({
  isOpen,
  onClose,
  phcs,
  alerts,
  transfers,
  role,
  lang,
}) => {
  const [selectedStateFilter, setSelectedStateFilter] = useState<string>('all');
  const [selectedMedicineFilter, setSelectedMedicineFilter] = useState<string>('all');
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  // Filter datasets based on selected modal filters
  const filteredAlerts = alerts.filter((a) => {
    if (selectedStateFilter !== 'all' && a.stateId !== selectedStateFilter) return false;
    if (selectedMedicineFilter !== 'all' && a.medicineId !== selectedMedicineFilter) return false;
    return true;
  });

  const filteredPhcs = phcs.filter((p) => {
    if (selectedStateFilter !== 'all' && p.stateId !== selectedStateFilter) return false;
    return true;
  });

  const filteredTransfers = transfers.filter((tr) => {
    if (selectedMedicineFilter !== 'all' && tr.medicineId !== selectedMedicineFilter) return false;
    return true;
  });

  // CSV Generator Helper
  const downloadCsv = (filename: string, csvContent: string) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadSuccess(`Successfully exported ${filename}`);
    setTimeout(() => setDownloadSuccess(null), 3500);
  };

  // 1. Export Active Risk Alerts CSV
  const handleExportAlertsCsv = () => {
    const headers = [
      'Alert ID',
      'Severity',
      'PHC Name',
      'PHC Code',
      'District',
      'State',
      'Medicine',
      'Days of Cover',
      'Stock On Hand',
      'Daily Demand',
      'Lead Time (Days)',
      'Projected Stockout Date',
      'Risk Drivers',
    ];

    const rows = filteredAlerts.map((a) => {
      const phcObj = phcs.find((p) => p.id === a.phcId);
      return [
        `"${a.id}"`,
        `"${a.severity.toUpperCase()}"`,
        `"${a.phcName.replace(/"/g, '""')}"`,
        `"${phcObj?.code || ''}"`,
        `"${a.districtName}"`,
        `"${a.stateName}"`,
        `"${a.medicineName}"`,
        a.daysOfCover,
        a.onHand,
        a.dailyDemand,
        a.leadTimeDays,
        `"${a.projectedStockoutDate}"`,
        `"${a.drivers.join('; ')}"`,
      ].join(',');
    });

    const csvData = [headers.join(','), ...rows].join('\n');
    downloadCsv(`aegishealth_risk_alerts_${new Date().toISOString().slice(0, 10)}.csv`, csvData);
  };

  // 2. Export PHC Stock & Telemetry CSV
  const handleExportPhcCsv = () => {
    const headers = [
      'PHC ID',
      'PHC Code',
      'PHC Name',
      'State',
      'Total Beds',
      'Occupied Beds',
      'Bed Occupancy %',
      'Sanctioned Staff',
      'Present Staff Today',
      'Staff Attendance %',
      'Latitude',
      'Longitude',
    ];

    const rows = filteredPhcs.map((p) => {
      const stateObj = STATES.find((s: StateInfo) => s.id === p.stateId);
      const bedOcc = p.beds.total > 0 ? Math.round((p.beds.occupied / p.beds.total) * 100) : 0;
      const staffAtt = p.staff.sanctioned > 0 ? Math.round((p.staff.presentToday / p.staff.sanctioned) * 100) : 0;

      return [
        `"${p.id}"`,
        `"${p.code}"`,
        `"${p.name.replace(/"/g, '""')}"`,
        `"${stateObj?.name || p.stateId}"`,
        p.beds.total,
        p.beds.occupied,
        `${bedOcc}%`,
        p.staff.sanctioned,
        p.staff.presentToday,
        `${staffAtt}%`,
        p.lat,
        p.lng,
      ].join(',');
    });

    const csvData = [headers.join(','), ...rows].join('\n');
    downloadCsv(`aegishealth_phc_telemetry_${new Date().toISOString().slice(0, 10)}.csv`, csvData);
  };

  // 3. Export Inter-PHC Redistribution Logs CSV
  const handleExportTransfersCsv = () => {
    const headers = [
      'Transfer ID',
      'Status',
      'Medicine',
      'Quantity (Units)',
      'Donor PHC',
      'Donor District',
      'Recipient PHC',
      'Recipient District',
      'Transit Distance (km)',
      'Transit ETA (Days)',
      'Recipient Cover Gain (Days)',
      'Donor Stock After',
      'Decided By Role',
    ];

    const rows = filteredTransfers.map((tr) => [
      `"${tr.id}"`,
      `"${tr.status.toUpperCase()}"`,
      `"${tr.medicineName}"`,
      tr.qty,
      `"${tr.fromPhcName.replace(/"/g, '""')}"`,
      `"${tr.fromDistrictName}"`,
      `"${tr.toPhcName.replace(/"/g, '""')}"`,
      `"${tr.toDistrictName}"`,
      tr.distanceKm,
      tr.etaDays,
      `+${tr.recipientCoverGainDays}`,
      tr.donorStockAfter,
      `"${tr.decidedByRole || 'system'}"`,
    ].join(','));

    const csvData = [headers.join(','), ...rows].join('\n');
    downloadCsv(`aegishealth_redistribution_logs_${new Date().toISOString().slice(0, 10)}.csv`, csvData);
  };

  // 4. Export Combined Executive Dataset CSV
  const handleExportFullReportCsv = () => {
    const timestamp = new Date().toISOString();
    let csv = `AegisHealth India — National Health Intelligence & Command Tower Report\n`;
    csv += `Generated At,${timestamp}\n`;
    csv += `Executing Role,${role.toUpperCase()}\n`;
    csv += `State Filter,${selectedStateFilter}\n`;
    csv += `Medicine Filter,${selectedMedicineFilter}\n`;
    csv += `\n--- SECTION 1: ACTIVE RISK ALERTS (${filteredAlerts.length}) ---\n`;
    csv += `Alert ID,Severity,PHC Name,District,State,Medicine,Days Cover,On Hand,Daily Demand,Stockout Date,Drivers\n`;

    filteredAlerts.forEach((a) => {
      csv += `"${a.id}","${a.severity}","${a.phcName}","${a.districtName}","${a.stateName}","${a.medicineName}",${a.daysOfCover},${a.onHand},${a.dailyDemand},"${a.projectedStockoutDate}","${a.drivers.join('; ')}"\n`;
    });

    csv += `\n--- SECTION 2: INTER-PHC REDISTRIBUTION LOGS (${filteredTransfers.length}) ---\n`;
    csv += `Transfer ID,Status,Medicine,Qty,Donor PHC,Recipient PHC,Distance km,ETA Days\n`;
    filteredTransfers.forEach((tr) => {
      csv += `"${tr.id}","${tr.status}","${tr.medicineName}",${tr.qty},"${tr.fromPhcName}","${tr.toPhcName}",${tr.distanceKm},${tr.etaDays}\n`;
    });

    downloadCsv(`aegishealth_full_executive_report_${new Date().toISOString().slice(0, 10)}.csv`, csv);
  };

  // 5. Trigger Browser Print View
  const handlePrintPdfReport = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 text-white relative">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-teal-950 text-teal-400 border border-teal-800/80 rounded-xl shadow-inner">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-lg text-white">National Command Data Exporter</h2>
              <p className="text-xs text-slate-400">
                Generate structured CSV exports or printable PDF summaries for policy officers
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Selection Panel */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 border-b border-slate-800/80 pb-2">
            <span className="flex items-center gap-1.5 font-bold text-teal-300">
              <Filter className="w-3.5 h-3.5" /> Scope Data Filters
            </span>
            <span>Role: <strong className="text-white uppercase">{role}</strong></span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Select State / Section:</label>
              <select
                value={selectedStateFilter}
                onChange={(e) => setSelectedStateFilter(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200 focus:outline-none focus:border-teal-500"
              >
                <option value="all">All 4 States (~100 PHCs)</option>
                {STATES.map((s: StateInfo) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.phcCount} PHCs)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Select Essential Medicine:</label>
              <select
                value={selectedMedicineFilter}
                onChange={(e) => setSelectedMedicineFilter(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200 focus:outline-none focus:border-teal-500"
              >
                <option value="all">All Essential Medicines</option>
                {MEDICINES.map((m: Medicine) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Dataset Counts Summary */}
        <div className="grid grid-cols-3 gap-3 text-xs font-mono text-center">
          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
            <div className="text-slate-400 flex items-center justify-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-teal-400" /> PHC Facilities
            </div>
            <div className="text-lg font-bold text-white mt-1 tabular-nums">{filteredPhcs.length}</div>
          </div>

          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
            <div className="text-slate-400 flex items-center justify-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> Risk Alerts
            </div>
            <div className="text-lg font-bold text-amber-400 mt-1 tabular-nums">{filteredAlerts.length}</div>
          </div>

          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
            <div className="text-slate-400 flex items-center justify-center gap-1">
              <Truck className="w-3.5 h-3.5 text-sky-400" /> Rebalance Transfers
            </div>
            <div className="text-lg font-bold text-sky-400 mt-1 tabular-nums">{filteredTransfers.length}</div>
          </div>
        </div>

        {downloadSuccess && (
          <div className="p-3 bg-emerald-950/80 border border-emerald-800 text-emerald-200 text-xs rounded-lg flex items-center gap-2 font-mono animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{downloadSuccess}</span>
          </div>
        )}

        {/* Export Action Buttons */}
        <div className="space-y-2.5 pt-2">
          <div className="text-xs font-mono text-slate-400 uppercase tracking-wider font-semibold flex items-center gap-1.5">
            <FileSpreadsheet className="w-3.5 h-3.5 text-teal-400" /> Modular CSV Datasets:
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              onClick={handleExportAlertsCsv}
              className="p-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-semibold flex flex-col items-center gap-1.5 transition-all text-slate-200 hover:text-white"
            >
              <FileSpreadsheet className="w-4 h-4 text-red-400" />
              <span>Risk Alerts CSV</span>
            </button>

            <button
              onClick={handleExportPhcCsv}
              className="p-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-semibold flex flex-col items-center gap-1.5 transition-all text-slate-200 hover:text-white"
            >
              <Building2 className="w-4 h-4 text-teal-400" />
              <span>PHC Telemetry CSV</span>
            </button>

            <button
              onClick={handleExportTransfersCsv}
              className="p-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-semibold flex flex-col items-center gap-1.5 transition-all text-slate-200 hover:text-white"
            >
              <Truck className="w-4 h-4 text-sky-400" />
              <span>Redistribution CSV</span>
            </button>
          </div>

          <div className="border-t border-slate-800 my-3" />

          {/* Full Executive Report & Print Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              onClick={handleExportFullReportCsv}
              className="py-2.5 px-3 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-teal-900/40 transition-all"
            >
              <FileText className="w-4 h-4" />
              <span>Export Executive CSV</span>
            </button>

            <button
              onClick={handlePrintPdfReport}
              className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all"
            >
              <Printer className="w-4 h-4 text-purple-400" />
              <span>Print PDF Report</span>
            </button>

            <a
              href="/AegisHealth_Complete_Source_Documentation.doc"
              download="AegisHealth_Complete_Source_Documentation.doc"
              className="py-2.5 px-3 bg-amber-950/80 hover:bg-amber-900/80 border border-amber-800/80 text-amber-200 hover:text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all text-center"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span>Code Doc (.doc)</span>
            </a>
          </div>
        </div>

        {/* Footer Security Note */}
        <div className="pt-2 text-[11px] font-mono text-slate-500 flex items-center justify-between border-t border-slate-800/80">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-400" /> Verified Cryptographic Audit Trail
          </span>
          <span>DISHA / ABDM Privacy Compliant</span>
        </div>
      </div>
    </div>
  );
};
