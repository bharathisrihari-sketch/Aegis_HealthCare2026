import React, { useState } from 'react';
import {
  Truck,
  CheckCircle2,
  XCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  FileText,
  Clock,
  Printer,
  X,
  History,
} from 'lucide-react';
import { LanguageCode, Transfer, UserRole } from '../types';
import { getTransferJustification } from '../gemini/client';
import { TRANSLATIONS } from '../i18n/translations';

interface RedistributionPanelProps {
  transfers: Transfer[];
  onApproveTransfer: (transfer: Transfer) => void;
  onRejectTransfer: (transferId: string) => void;
  approvedLogs: Transfer[];
  role: UserRole;
  lang: LanguageCode;
}

export const RedistributionPanel: React.FC<RedistributionPanelProps> = ({
  transfers,
  onApproveTransfer,
  onRejectTransfer,
  approvedLogs,
  role,
  lang,
}) => {
  const [activeDispatchModal, setActiveDispatchModal] = useState<Transfer | null>(null);
  const [dispatchOrderText, setDispatchOrderText] = useState<{ justification: string; order: string; mode: string } | null>(null);
  const [isLoadingOrder, setIsLoadingOrder] = useState<boolean>(false);

  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  const handleOpenDispatchModal = async (transfer: Transfer) => {
    setActiveDispatchModal(transfer);
    setIsLoadingOrder(true);
    const res = await getTransferJustification(transfer, lang);
    setIsLoadingOrder(false);

    if (res.data) {
      setDispatchOrderText({
        justification: res.data.justification,
        order: res.data.dispatchOrder,
        mode: res.mode,
      });
    }
  };

  return (
    <div className="space-y-5">
      {/* Panel Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-teal-600/20 text-teal-400 border border-teal-800/50 rounded-lg">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-base text-white">{t.redistribution}</h2>
            <p className="text-xs text-slate-400">
              Automated cross-district & cross-state matching algorithm protecting donor safety buffers
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-2.5 py-1 bg-slate-950 text-slate-300 border border-slate-800 rounded-lg">
            Proposals: <strong className="text-white">{transfers.length}</strong>
          </span>
          <span className="px-2.5 py-1 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded-lg">
            Approved Log: <strong className="text-emerald-400">{approvedLogs.length}</strong>
          </span>
        </div>
      </div>

      {/* Proposals List */}
      <div className="space-y-3">
        {transfers.length === 0 ? (
          <div className="p-8 bg-slate-900 border border-slate-800 rounded-xl text-center text-slate-400 text-xs">
            No active transfer proposals required. All Primary Health Centres have adequate safety stock.
          </div>
        ) : (
          transfers.map((tItem) => (
            <div
              key={tItem.id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md hover:border-slate-700 transition-colors space-y-3"
            >
              {/* Transfer Match Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-0.5 bg-teal-950 text-teal-300 border border-teal-800 rounded text-[11px] font-mono font-bold">
                    Score: {tItem.score}
                  </span>
                  <h3 className="font-bold text-sm text-white">
                    Move <span className="text-teal-400 font-mono">{tItem.qty} units</span> of {tItem.medicineName}
                  </h3>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="text-slate-400">Distance: <strong className="text-white">{tItem.distanceKm} km</strong></span>
                  <span className="text-slate-400">Transit ETA: <strong className="text-white">{tItem.etaDays} Day(s)</strong></span>
                </div>
              </div>

              {/* Donor to Recipient Route */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {/* Donor PHC Card */}
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
                  <span className="text-slate-500 font-mono text-[11px]">DONOR PHC (Surplus)</span>
                  <div className="font-bold text-white text-sm">{tItem.fromPhcName}</div>
                  <div className="text-slate-400 text-[11px]">
                    District: {tItem.fromDistrictName}
                  </div>
                  <div className="text-emerald-400 font-mono text-[11px] pt-1">
                    Stock After Transfer: {tItem.donorStockAfter} units (Donor Safety Buffer Retained)
                  </div>
                </div>

                {/* Recipient PHC Card */}
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
                  <span className="text-slate-500 font-mono text-[11px]">RECIPIENT PHC (At-Risk)</span>
                  <div className="font-bold text-white text-sm">{tItem.toPhcName}</div>
                  <div className="text-slate-400 text-[11px]">
                    District: {tItem.toDistrictName}
                  </div>
                  <div className="text-teal-400 font-mono text-[11px] pt-1">
                    Stock Cover Impact: +{tItem.recipientCoverGainDays} Days Gain (Prevents Impending Stockout)
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-2 pt-2">
                <button
                  onClick={() => handleOpenDispatchModal(tItem)}
                  className="px-3 py-1.5 bg-indigo-950 hover:bg-indigo-900 text-indigo-300 border border-indigo-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  Gemini Dispatch Order
                </button>

                <div className="flex items-center gap-2">
                  {role === 'phc' ? (
                    <span className="text-[11px] font-mono text-amber-400 bg-amber-950/60 border border-amber-800/80 px-2.5 py-1 rounded-lg">
                      Requires District/State Role Clearance to Approve
                    </span>
                  ) : (
                    <>
                      <button
                        onClick={() => onRejectTransfer(tItem.id)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                      >
                        <XCircle className="w-3.5 h-3.5 text-slate-400" />
                        {t.reject}
                      </button>

                      <button
                        onClick={() => onApproveTransfer(tItem)}
                        className="px-4 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-md transition-colors"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                        {t.approve}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Audit Log Table */}
      {approvedLogs.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3 shadow-lg">
          <div className="flex items-center gap-2 font-bold text-xs text-white">
            <History className="w-4 h-4 text-emerald-400" /> Decision Change Log (Approved Transfers)
          </div>
          <div className="divide-y divide-slate-800 text-xs font-mono">
            {approvedLogs.map((log) => (
              <div key={log.id} className="py-2.5 flex items-center justify-between">
                <div>
                  <span className="text-white font-bold">{log.qty} units {log.medicineName}</span>
                  <p className="text-slate-400 text-[11px]">
                    From: {log.fromPhcName} → To: {log.toPhcName}
                  </p>
                </div>
                <div className="text-right">
                  <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded font-bold text-[10px]">
                    APPROVED ({log.decidedByRole?.toUpperCase()})
                  </span>
                  <div className="text-[10px] text-slate-500">{log.decidedAt}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Gemini Dispatch Order Modal */}
      {activeDispatchModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-lg w-full text-slate-200 shadow-2xl relative space-y-4">
            <button
              onClick={() => setActiveDispatchModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-white">
              <FileText className="w-5 h-5 text-teal-400" />
              <h3 className="font-bold text-base">Official Dispatch Order & AI Justification</h3>
            </div>

            {isLoadingOrder ? (
              <div className="py-8 text-center text-xs text-slate-400 space-y-2">
                <Sparkles className="w-6 h-6 text-indigo-400 animate-spin mx-auto" />
                <p>Generating official dispatch order & AI justification...</p>
              </div>
            ) : (
              dispatchOrderText && (
                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1">
                    <span className="font-semibold text-indigo-300">AI Safety Justification:</span>
                    <p className="text-slate-300 leading-relaxed">{dispatchOrderText.justification}</p>
                  </div>

                  <div className="p-3 bg-slate-950 border border-teal-800/80 rounded-lg font-mono text-[11px] whitespace-pre-wrap text-teal-200">
                    {dispatchOrderText.order}
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[10px] text-slate-500 font-mono">
                      Gateway Mode: {dispatchOrderText.mode.toUpperCase()}
                    </span>
                    <button
                      onClick={() => window.print()}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded text-xs font-semibold flex items-center gap-1"
                    >
                      <Printer className="w-3.5 h-3.5" /> Print Order
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
};
