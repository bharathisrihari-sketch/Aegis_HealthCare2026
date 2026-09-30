import React from 'react';
import {
  MapPin,
  AlertTriangle,
  Truck,
  FileText,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Download,
  Building2,
  Package,
  Activity,
} from 'lucide-react';
import { Alert, LanguageCode, PHC, Transfer } from '../types';

interface LaymanCardNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  phcs: PHC[];
  alerts: Alert[];
  transfers: Transfer[];
  onOpenExportModal: () => void;
  lang: LanguageCode;
}

export const LaymanCardNavigation: React.FC<LaymanCardNavigationProps> = ({
  activeTab,
  setActiveTab,
  phcs,
  alerts,
  transfers,
  onOpenExportModal,
  lang,
}) => {
  const criticalAlertsCount = alerts.filter((a) => a.severity === 'critical').length;
  const pendingTransfersCount = transfers.length;

  const cards = [
    {
      id: 'map',
      title: 'View Stock & Map',
      badge: `${phcs.length} Health Centres`,
      badgeColor: 'bg-teal-950/80 text-teal-300 border-teal-800',
      desc: 'Check live medicine stock levels, bed availability, and staff attendance across centres.',
      icon: MapPin,
      gradient: 'from-teal-600/20 to-emerald-600/20 hover:from-teal-600/30 hover:to-emerald-600/30',
      borderColor: activeTab === 'map' ? 'border-teal-400 ring-2 ring-teal-500/50' : 'border-slate-800 hover:border-teal-500/50',
      iconColor: 'text-teal-400',
      actionText: 'Open Map & Stock View',
    },
    {
      id: 'alerts',
      title: 'Fix Low Stock Issues',
      badge: `${criticalAlertsCount} Critical Warnings`,
      badgeColor: criticalAlertsCount > 0 ? 'bg-red-950/80 text-red-300 border-red-800' : 'bg-slate-900 text-slate-400 border-slate-800',
      desc: 'See which healthcare centres are running out of essential medicines and need immediate replenishment.',
      icon: AlertTriangle,
      gradient: 'from-amber-600/20 to-red-600/20 hover:from-amber-600/30 hover:to-red-600/30',
      borderColor: activeTab === 'alerts' ? 'border-amber-400 ring-2 ring-amber-500/50' : 'border-slate-800 hover:border-amber-500/50',
      iconColor: 'text-amber-400',
      actionText: 'Review Stock Warnings',
    },
    {
      id: 'transfers',
      title: 'Rebalance Medicine Stock',
      badge: `${pendingTransfersCount} Recommended Transfers`,
      badgeColor: 'bg-sky-950/80 text-sky-300 border-sky-800',
      desc: 'Approve automated inter-centre medicine transfers to send surplus stock to low-stock centres.',
      icon: Truck,
      gradient: 'from-sky-600/20 to-indigo-600/20 hover:from-sky-600/30 hover:to-indigo-600/30',
      borderColor: activeTab === 'transfers' ? 'border-sky-400 ring-2 ring-sky-500/50' : 'border-slate-800 hover:border-sky-500/50',
      iconColor: 'text-sky-400',
      actionText: 'Manage Stock Transfers',
    },
    {
      id: 'export',
      title: 'Generate & Download Reports',
      badge: 'CSV & PDF Exporter',
      badgeColor: 'bg-purple-950/80 text-purple-300 border-purple-800',
      desc: 'Download CSV stock datasets or print executive summary reports for district health meetings.',
      icon: FileText,
      gradient: 'from-purple-600/20 to-fuchsia-600/20 hover:from-purple-600/30 hover:to-fuchsia-600/30',
      borderColor: 'border-slate-800 hover:border-purple-500/50',
      iconColor: 'text-purple-400',
      actionText: 'Export Reports Now',
      isCustomAction: true,
      onClick: onOpenExportModal,
    },
    {
      id: 'assistant',
      title: 'Ask Sanjeevani AI Helper',
      badge: 'Multi-turn AI Assistant',
      badgeColor: 'bg-indigo-950/80 text-indigo-300 border-indigo-800',
      desc: 'Ask questions in plain English or local Indian languages about stock, instructions, and navigation.',
      icon: Sparkles,
      gradient: 'from-indigo-600/20 to-purple-600/20 hover:from-indigo-600/30 hover:to-purple-600/30',
      borderColor: activeTab === 'assistant' ? 'border-indigo-400 ring-2 ring-indigo-500/50' : 'border-slate-800 hover:border-indigo-500/50',
      iconColor: 'text-indigo-400',
      actionText: 'Talk to AI Assistant',
    },
  ];

  return (
    <div className="space-y-3">
      {/* Layman Navigation Header Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-teal-950 border border-teal-800 rounded-xl text-teal-400 shrink-0">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-base text-white flex items-center gap-2">
              Simplified Field Action Centre
            </h2>
            <p className="text-xs text-slate-400">
              Select an action card below to easily browse stock, fix issues, transfer medicine, or export reports
            </p>
          </div>
        </div>

        <div className="px-3 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-teal-300">
          Mode: <strong className="text-white">Simplified Layman View</strong>
        </div>
      </div>

      {/* Action Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.id}
              onClick={() => {
                if (card.isCustomAction && card.onClick) {
                  card.onClick();
                } else {
                  setActiveTab(card.id);
                }
              }}
              className={`bg-slate-900 border rounded-2xl p-4 space-y-3 cursor-pointer transition-all duration-200 transform hover:-translate-y-1 shadow-lg bg-gradient-to-br ${card.gradient} ${card.borderColor}`}
            >
              <div className="flex items-center justify-between">
                <div className={`p-2 bg-slate-950/80 border border-slate-800 rounded-xl ${card.iconColor}`}>
                  <Icon className="w-5 h-5" />
                </div>

                <span className={`px-2 py-0.5 border rounded-md text-[10px] font-mono font-semibold ${card.badgeColor}`}>
                  {card.badge}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-sm text-white">{card.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed mt-1">{card.desc}</p>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs font-bold text-teal-300 group">
                <span>{card.actionText}</span>
                <ArrowRight className="w-4 h-4 text-teal-400 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
