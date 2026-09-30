import React from 'react';
import {
  CheckCircle2,
  AlertOctagon,
  RefreshCw,
  ShieldCheck,
  Activity,
  Sparkles,
  Wifi,
} from 'lucide-react';
import { HealthCheckResult } from './GeminiDiagnosticModal';

interface GeminiStatusIndicatorProps {
  healthStatus: HealthCheckResult;
  onOpenDiagnosticModal: () => void;
}

export const GeminiStatusIndicator: React.FC<GeminiStatusIndicatorProps> = ({
  healthStatus,
  onOpenDiagnosticModal,
}) => {
  const getBadgeStyle = () => {
    switch (healthStatus.status) {
      case 'connected':
        return 'bg-emerald-950/90 text-emerald-300 border-emerald-800/90 hover:bg-emerald-900/90';
      case 'fallback':
        return 'bg-amber-950/90 text-amber-300 border-amber-800/90 hover:bg-amber-900/90';
      case 'error':
        return 'bg-red-950/90 text-red-300 border-red-800/90 hover:bg-red-900/90';
      case 'loading':
      default:
        return 'bg-sky-950/90 text-sky-300 border-sky-800/90 hover:bg-sky-900/90';
    }
  };

  const renderIcon = () => {
    switch (healthStatus.status) {
      case 'connected':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />;
      case 'fallback':
        return <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />;
      case 'error':
        return <AlertOctagon className="w-3.5 h-3.5 text-red-400" />;
      case 'loading':
      default:
        return <RefreshCw className="w-3.5 h-3.5 text-sky-400 animate-spin" />;
    }
  };

  const getLabel = () => {
    switch (healthStatus.status) {
      case 'connected':
        return 'Gemini API: Connected';
      case 'fallback':
        return 'Gemini API: Key OK (Cache Mode)';
      case 'error':
        return 'Gemini API: Error';
      case 'loading':
      default:
        return 'Gemini API: Checking...';
    }
  };

  return (
    <button
      onClick={onOpenDiagnosticModal}
      className={`px-2.5 py-1 text-xs font-mono rounded-md border flex items-center gap-1.5 transition-all shadow-sm ${getBadgeStyle()}`}
      title="Click to open Gemini API Diagnostic Tool & Test Connection"
    >
      {renderIcon()}
      <span>{getLabel()}</span>
      {healthStatus.status === 'connected' && (
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
      )}
      {healthStatus.status === 'fallback' && (
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 ml-0.5" />
      )}
    </button>
  );
};
