import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  AlertOctagon,
  RefreshCw,
  X,
  Key,
  Activity,
  Server,
  Sparkles,
  Wifi,
  ShieldCheck,
} from 'lucide-react';

export interface HealthCheckResult {
  status: 'connected' | 'fallback' | 'error' | 'loading';
  hasApiKey: boolean;
  message: string;
  responsePreview?: string;
  errorDetails?: string;
  model: string;
  latencyMs: number;
  timestamp: string;
}

interface GeminiDiagnosticModalProps {
  isOpen: boolean;
  onClose: () => void;
  healthStatus: HealthCheckResult;
  onReCheck: () => Promise<void>;
}

export const GeminiDiagnosticModal: React.FC<GeminiDiagnosticModalProps> = ({
  isOpen,
  onClose,
  healthStatus,
  onReCheck,
}) => {
  const [isChecking, setIsChecking] = useState(false);

  const handleTestConnection = async () => {
    setIsChecking(true);
    await onReCheck();
    setIsChecking(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-lg w-full text-slate-200 shadow-2xl relative space-y-5">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Title */}
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-teal-600/20 text-teal-400 border border-teal-800/50 rounded-lg">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-white">Gemini API Diagnostic Tool</h3>
            <p className="text-xs text-slate-400">
              Verifies GEMINI_API_KEY environment authorization & connectivity
            </p>
          </div>
        </div>

        {/* Overall Connectivity Status Banner */}
        <div
          className={`p-4 rounded-xl border flex items-start gap-3 text-xs ${
            healthStatus.status === 'connected'
              ? 'bg-emerald-950/60 border-emerald-800/80 text-emerald-200'
              : healthStatus.status === 'fallback'
              ? 'bg-amber-950/60 border-amber-800/80 text-amber-200'
              : healthStatus.status === 'loading' || isChecking
              ? 'bg-sky-950/60 border-sky-800/80 text-sky-200'
              : 'bg-red-950/60 border-red-800/80 text-red-200'
          }`}
        >
          {healthStatus.status === 'connected' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          ) : healthStatus.status === 'fallback' ? (
            <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          ) : healthStatus.status === 'loading' || isChecking ? (
            <RefreshCw className="w-5 h-5 text-sky-400 animate-spin shrink-0 mt-0.5" />
          ) : (
            <AlertOctagon className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          )}

          <div className="space-y-1">
            <div className="font-bold text-sm">
              Status:{' '}
              {isChecking
                ? 'TESTING CONNECTIVITY...'
                : healthStatus.status === 'connected'
                ? 'CONNECTED & AUTHORIZED'
                : healthStatus.status === 'fallback'
                ? 'AUTHORIZED (LOAD SPIKE / CACHE ACTIVE)'
                : 'ERROR / UNAUTHORIZED'}
            </div>
            <p className="text-slate-300 leading-relaxed font-sans">{healthStatus.message}</p>
          </div>
        </div>

        {/* Diagnostics Table */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2.5 text-xs font-mono">
          <div className="flex justify-between items-center py-1 border-b border-slate-800">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-teal-400" /> Environment API Key:
            </span>
            <span
              className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                healthStatus.hasApiKey
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                  : 'bg-red-950 text-red-400 border border-red-800'
              }`}
            >
              {healthStatus.hasApiKey ? 'PRESENT (GEMINI_API_KEY)' : 'MISSING'}
            </span>
          </div>

          <div className="flex justify-between items-center py-1 border-b border-slate-800">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-sky-400" /> Tested Model Name:
            </span>
            <span className="text-white font-bold">{healthStatus.model}</span>
          </div>

          <div className="flex justify-between items-center py-1 border-b border-slate-800">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Wifi className="w-3.5 h-3.5 text-indigo-400" /> Latency:
            </span>
            <span className="text-teal-300 font-bold">{healthStatus.latencyMs} ms</span>
          </div>

          <div className="flex justify-between items-center py-1">
            <span className="text-slate-400">Last Verified:</span>
            <span className="text-slate-400 text-[11px]">
              {healthStatus.timestamp ? new Date(healthStatus.timestamp).toLocaleTimeString() : 'N/A'}
            </span>
          </div>
        </div>

        {/* Error Details Log if failed */}
        {healthStatus.errorDetails && (
          <div className="p-3 bg-slate-950 border border-red-900/60 rounded-lg text-xs font-mono space-y-1">
            <span className="text-red-400 font-bold">API Response Error Log:</span>
            <p className="text-red-300/90 text-[11px] break-all leading-tight">
              {healthStatus.errorDetails}
            </p>
          </div>
        )}

        {/* Re-test Action Button */}
        <div className="space-y-2 pt-1">
          <button
            onClick={handleTestConnection}
            disabled={isChecking}
            className="w-full py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-2 shadow-md transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
            {isChecking ? 'Testing Gemini API Authorization...' : 'Re-test Gemini API Connection'}
          </button>

          <p className="text-[11px] text-slate-400 text-center font-sans">
            AI Studio automatically manages user keys via Settings &gt; Secrets. If authorization fails due to upstream 503 load spikes, our backend proxy will automatically fall back to resilient cached responses.
          </p>
        </div>
      </div>
    </div>
  );
};
