import React, { useState, useMemo } from 'react';
import { Header } from './components/Header';
import { KpiHeader } from './components/KpiHeader';
import { NationalMap } from './components/NationalMap';
import { PhcDrawer } from './components/PhcDrawer';
import { AlertsPanel } from './components/AlertsPanel';
import { RedistributionPanel } from './components/RedistributionPanel';
import { FederatedMonitor } from './components/FederatedMonitor';
import { EmergencySimulator } from './components/EmergencySimulator';
import { AssistantChat } from './components/AssistantChat';
import { VoiceReportModal } from './components/VoiceReportModal';
import { VisionReportModal } from './components/VisionReportModal';
import { ImpactPanel } from './components/ImpactPanel';
import { MethodologyPage } from './components/MethodologyPage';
import { PathToPilotPage } from './components/PathToPilotPage';
import { AboutPage } from './components/AboutPage';
import { SitemapPage } from './components/SitemapPage';
import { StateOnboardingWizard } from './components/StateOnboardingWizard';
import { GuidedDemoBar } from './components/GuidedDemoBar';
import { GeminiDiagnosticModal, HealthCheckResult } from './components/GeminiDiagnosticModal';
import { ExportDataModal } from './components/ExportDataModal';
import { FrontPageChatWidget } from './components/FrontPageChatWidget';
import { OfflineIndicator } from './components/OfflineIndicator';
import { LaymanCardNavigation } from './components/LaymanCardNavigation';
import { savePhcsToDB, saveStockRecordsToDB, getPhcsFromDB, getStockRecordsFromDB } from './engine/offlineStore';

import { generateSyntheticWorld } from './engine/generator';
import { computeDemandForecast, ForecastResult } from './engine/forecast';
import { computeAlerts } from './engine/risk';
import { generateTransferProposals, applyApprovedTransfer } from './engine/redistribute';
import { runFederatedSimulation } from './engine/federated';
import { computeImpactEstimates } from './engine/impact';
import { Alert, LanguageCode, PHC, ScenarioPreset, StockRecord, Transfer, UserRole } from './types';

export default function App() {
  // 1. App State
  const [role, setRole] = useState<UserRole>('national');
  const [lang, setLang] = useState<LanguageCode>('en');
  const [theme, setTheme] = useState<'command' | 'field'>('command');
  const [isLaymanMode, setIsLaymanMode] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('map');
  const [activeDemoStep, setActiveDemoStep] = useState<number>(1);

  // Initial Seeded World
  const initialWorld = useMemo(() => generateSyntheticWorld(2026), []);
  const [phcs, setPhcs] = useState<PHC[]>(initialWorld.phcs);
  const [stockRecords, setStockRecords] = useState<Record<string, StockRecord>>(initialWorld.stockRecords);

  // Sync state to IndexedDB for offline persistence
  React.useEffect(() => {
    savePhcsToDB(phcs);
  }, [phcs]);

  React.useEffect(() => {
    saveStockRecordsToDB(stockRecords);
  }, [stockRecords]);

  // Selected PHC for side drawer
  const [selectedPhc, setSelectedPhc] = useState<PHC | null>(null);

  // Emergency Scenario State
  const [activeScenario, setActiveScenario] = useState<{ preset: ScenarioPreset; severity: number } | null>(null);

  // Approved Transfers Log
  const [approvedTransferLogs, setApprovedTransferLogs] = useState<Transfer[]>([]);

  // Modals state
  const [showVoiceModal, setShowVoiceModal] = useState<boolean>(false);
  const [showVisionModal, setShowVisionModal] = useState<boolean>(false);
  const [showOnboardingWizard, setShowOnboardingWizard] = useState<boolean>(false);
  const [showDiagnosticModal, setShowDiagnosticModal] = useState<boolean>(false);
  const [showExportModal, setShowExportModal] = useState<boolean>(false);

  // Health Check State
  const [healthStatus, setHealthStatus] = useState<HealthCheckResult>({
    status: 'loading',
    hasApiKey: false,
    message: 'Checking Gemini API environment key authorization...',
    model: 'gemini-flash-latest',
    latencyMs: 0,
    timestamp: new Date().toISOString(),
  });

  const checkGeminiHealth = async () => {
    try {
      const res = await fetch('/api/gemini/health-check');
      if (res.ok) {
        const data = await res.json();
        setHealthStatus(data);
      } else {
        setHealthStatus({
          status: 'error',
          hasApiKey: false,
          message: `HTTP ${res.status}: Failed to reach health-check endpoint.`,
          errorDetails: res.statusText,
          model: 'gemini-flash-latest',
          latencyMs: 0,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (err: any) {
      setHealthStatus({
        status: 'error',
        hasApiKey: false,
        message: 'Network error or backend offline while checking API status.',
        errorDetails: String(err),
        model: 'gemini-flash-latest',
        latencyMs: 0,
        timestamp: new Date().toISOString(),
      });
    }
  };

  React.useEffect(() => {
    checkGeminiHealth();
  }, []);

  // 2. Compute Demand Forecasts for all PHCs x Medicines
  const forecasts = useMemo(() => {
    const fMap: Record<string, ForecastResult> = {};
    const multMap = activeScenario ? activeScenario.preset.multipliers : {};
    const severity = activeScenario ? activeScenario.severity : 1.0;

    phcs.forEach((phc) => {
      Object.values(stockRecords)
        .filter((sr) => sr.phcId === phc.id)
        .forEach((sr) => {
          const mult = multMap[sr.medicineId]
            ? 1.0 + (multMap[sr.medicineId] - 1.0) * severity
            : 1.0;

          fMap[`${phc.id}_${sr.medicineId}`] = computeDemandForecast(
            sr.consumptionDaily,
            phc.id,
            sr.medicineId,
            14,
            mult
          );
        });
    });
    return fMap;
  }, [phcs, stockRecords, activeScenario]);

  // 3. Compute Risk Alerts
  const alerts = useMemo(() => {
    return computeAlerts({
      phcs,
      stockRecords,
      forecasts,
      scenarioName: activeScenario?.preset.name,
    });
  }, [phcs, stockRecords, forecasts, activeScenario]);

  // 4. Compute Automated Redistribution Proposals
  const transferProposals = useMemo(() => {
    return generateTransferProposals({
      phcs,
      stockRecords,
      alerts,
      forecasts,
    });
  }, [phcs, stockRecords, alerts, forecasts]);

  // 5. Federated Rounds Simulation
  const [fedRounds, setFedRounds] = useState(() => runFederatedSimulation({ phcs, stockRecords, roundsCount: 5 }));

  // 6. Impact Calculations
  const impactEstimates = useMemo(() => {
    return computeImpactEstimates(approvedTransferLogs, phcs.length);
  }, [approvedTransferLogs, phcs.length]);

  // Actions
  const handleApproveTransfer = (transfer: Transfer) => {
    const updatedStock = applyApprovedTransfer(stockRecords, transfer);
    setStockRecords(updatedStock);

    const logEntry: Transfer = {
      ...transfer,
      status: 'approved',
      decidedByRole: role,
      decidedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setApprovedTransferLogs((prev) => [logEntry, ...prev]);
  };

  const handleRejectTransfer = (transferId: string) => {
    // Dismiss transfer proposal from view
  };

  const handleVoiceReportConfirm = (data: {
    medicineId: string;
    quantity: number;
    bedsOccupied: number;
    staffPresent: number;
    transcript: string;
  }) => {
    if (!selectedPhc) return;

    // Update PHC beds & staff
    setPhcs((prev) =>
      prev.map((p) =>
        p.id === selectedPhc.id
          ? {
              ...p,
              beds: { ...p.beds, occupied: data.bedsOccupied },
              staff: { ...p.staff, presentToday: data.staffPresent },
            }
          : p
      )
    );

    // Update stock record on hand
    const key = `${selectedPhc.id}_${data.medicineId}`;
    const existing = stockRecords[key];
    if (existing) {
      setStockRecords((prev) => ({
        ...prev,
        [key]: {
          ...existing,
          onHand: existing.onHand + data.quantity,
          consumptionDaily: [...existing.consumptionDaily.slice(1), data.quantity],
        },
      }));
    }
  };

  const handleVisionConfirmItems = (items: { medicineId: string; count: number }[]) => {
    if (!selectedPhc) return;

    setStockRecords((prev) => {
      const updated = { ...prev };
      items.forEach((item) => {
        const key = `${selectedPhc.id}_${item.medicineId}`;
        const existing = updated[key];
        if (existing) {
          updated[key] = {
            ...existing,
            onHand: item.count,
          };
        }
      });
      return updated;
    });
  };

  const handleTriggerNewFedRound = () => {
    setFedRounds((prev) => runFederatedSimulation({ phcs, stockRecords, roundsCount: prev.length + 1 }));
  };

  // Guided Walkthrough Step Handler
  const handleGuidedStepChange = (stepId: number) => {
    setActiveDemoStep(stepId);
    switch (stepId) {
      case 1:
        // Spoken report
        setSelectedPhc(phcs[0]);
        setShowVoiceModal(true);
        setActiveTab('map');
        break;
      case 2:
        // Explain Alert
        setActiveTab('alerts');
        break;
      case 3:
        // Approve transfer
        setActiveTab('transfers');
        break;
      case 4:
        // Federated benefit
        setActiveTab('federated');
        break;
      case 5:
        // Emergency mode
        setActiveTab('emergency');
        break;
      case 6:
        // Impact panel
        setActiveTab('impact');
        break;
      default:
        setActiveTab('map');
    }
  };

  return (
    <div
      className={`min-h-screen font-sans flex flex-col antialiased transition-colors duration-300 ${
        theme === 'field' ? 'bg-slate-100 text-slate-900' : 'bg-slate-950 text-slate-100'
      }`}
    >
      {/* Header */}
      <Header
        role={role}
        setRole={setRole}
        lang={lang}
        setLang={setLang}
        activeScenarioName={activeScenario?.preset.name}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        geminiMode={healthStatus.status === 'connected' ? 'live' : 'fallback'}
        healthStatus={healthStatus}
        onOpenDiagnosticModal={() => setShowDiagnosticModal(true)}
        onOpenExportModal={() => setShowExportModal(true)}
        theme={theme}
        setTheme={setTheme}
        isLaymanMode={isLaymanMode}
        setIsLaymanMode={setIsLaymanMode}
      />

      {/* 3-Minute Guided Walkthrough Bar */}
      <GuidedDemoBar
        onStepChange={handleGuidedStepChange}
        activeDemoStep={activeDemoStep}
      />

      {/* KPI Header Strip */}
      <KpiHeader phcs={phcs} alerts={alerts} lang={lang} />

      {/* Primary Workspace Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Simplified Layman Action Cards Panel */}
        {isLaymanMode && (
          <LaymanCardNavigation
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            phcs={phcs}
            alerts={alerts}
            transfers={transferProposals}
            onOpenExportModal={() => setShowExportModal(true)}
            lang={lang}
          />
        )}
        {activeTab === 'map' && (
          <div className="space-y-6">
            <NationalMap
              phcs={phcs}
              alerts={alerts}
              selectedPhc={selectedPhc}
              onSelectPhc={(p) => setSelectedPhc(p)}
              lang={lang}
            />

            {/* Side-by-Side Quick Views */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AlertsPanel
                alerts={alerts.slice(0, 4)}
                onSelectPhcById={(phcId) => {
                  const target = phcs.find((p) => p.id === phcId);
                  if (target) setSelectedPhc(target);
                }}
                onTriggerRedistribution={() => setActiveTab('transfers')}
                lang={lang}
              />

              <RedistributionPanel
                transfers={transferProposals.slice(0, 3)}
                onApproveTransfer={handleApproveTransfer}
                onRejectTransfer={handleRejectTransfer}
                approvedLogs={approvedTransferLogs}
                role={role}
                lang={lang}
              />
            </div>
          </div>
        )}

        {activeTab === 'alerts' && (
          <AlertsPanel
            alerts={alerts}
            onSelectPhcById={(phcId) => {
              const target = phcs.find((p) => p.id === phcId);
              if (target) setSelectedPhc(target);
            }}
            onTriggerRedistribution={() => setActiveTab('transfers')}
            lang={lang}
          />
        )}

        {activeTab === 'transfers' && (
          <RedistributionPanel
            transfers={transferProposals}
            onApproveTransfer={handleApproveTransfer}
            onRejectTransfer={handleRejectTransfer}
            approvedLogs={approvedTransferLogs}
            role={role}
            lang={lang}
          />
        )}

        {activeTab === 'federated' && (
          <FederatedMonitor
            fedRounds={fedRounds}
            onTriggerNewRound={handleTriggerNewFedRound}
            lang={lang}
          />
        )}

        {activeTab === 'emergency' && (
          <EmergencySimulator
            activePreset={activeScenario?.preset || null}
            onActivatePreset={(preset, severity) => setActiveScenario({ preset, severity })}
            onDeactivatePreset={() => setActiveScenario(null)}
            topAlerts={alerts}
            lang={lang}
          />
        )}

        {activeTab === 'assistant' && (
          <AssistantChat
            phcs={phcs}
            alerts={alerts}
            onSelectPhcById={(phcId) => {
              const target = phcs.find((p) => p.id === phcId);
              if (target) setSelectedPhc(target);
            }}
            role={role}
            lang={lang}
          />
        )}

        {activeTab === 'report' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-center space-y-4">
              <h2 className="font-bold text-lg text-white">Voice & Vision Data Entry</h2>
              <p className="text-xs text-slate-400 max-w-lg mx-auto">
                Select a Primary Health Centre to record spoken stock updates or upload a photo of a physical stock register log.
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => {
                    setSelectedPhc(phcs[0]);
                    setShowVoiceModal(true);
                  }}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-bold shadow-md"
                >
                  Open Voice Entry
                </button>
                <button
                  onClick={() => {
                    setSelectedPhc(phcs[0]);
                    setShowVisionModal(true);
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-bold"
                >
                  Open Stock Photo Entry
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'impact' && <ImpactPanel impact={impactEstimates} lang={lang} />}

        {activeTab === 'about' && <AboutPage lang={lang} />}

        {activeTab === 'sitemap' && <SitemapPage onNavigate={(tab) => setActiveTab(tab)} lang={lang} />}

        {activeTab === 'methodology' && <MethodologyPage />}

        {activeTab === 'pilot' && <PathToPilotPage />}
      </main>

      {/* Selected PHC Side Drawer */}
      <PhcDrawer
        phc={selectedPhc}
        onClose={() => setSelectedPhc(null)}
        stockRecords={stockRecords}
        alerts={alerts}
        onOpenVoiceModal={() => setShowVoiceModal(true)}
        onOpenVisionModal={() => setShowVisionModal(true)}
        onProposeTransferForPhc={(phcId, medId) => setActiveTab('transfers')}
        lang={lang}
      />

      {/* Voice Report Modal */}
      {showVoiceModal && selectedPhc && (
        <VoiceReportModal
          phc={selectedPhc}
          onClose={() => setShowVoiceModal(false)}
          onConfirmReport={handleVoiceReportConfirm}
          lang={lang}
        />
      )}

      {/* Vision Report Modal */}
      {showVisionModal && selectedPhc && (
        <VisionReportModal
          phc={selectedPhc}
          onClose={() => setShowVisionModal(false)}
          onConfirmVisionItems={handleVisionConfirmItems}
          lang={lang}
        />
      )}

      {/* State Onboarding Wizard */}
      {showOnboardingWizard && (
        <StateOnboardingWizard
          onClose={() => setShowOnboardingWizard(false)}
          onStateAdded={(name, code) => {
            // State added successfully
          }}
        />
      )}

      {/* Gemini Diagnostic Modal */}
      <GeminiDiagnosticModal
        isOpen={showDiagnosticModal}
        onClose={() => setShowDiagnosticModal(false)}
        healthStatus={healthStatus}
        onReCheck={checkGeminiHealth}
      />

      {/* Export Data Modal */}
      <ExportDataModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        phcs={phcs}
        alerts={alerts}
        transfers={transferProposals}
        role={role}
        lang={lang}
      />

      {/* Offline Connectivity & IndexedDB Indicator */}
      <OfflineIndicator />

      {/* Front Page Gemini Agent Chatbot Floating Widget */}
      <FrontPageChatWidget
        phcs={phcs}
        alerts={alerts}
        onSelectPhcById={(phcId) => {
          const phc = phcs.find((p) => p.id === phcId);
          if (phc) setSelectedPhc(phc);
        }}
        role={role}
        lang={lang}
      />
    </div>
  );
}
