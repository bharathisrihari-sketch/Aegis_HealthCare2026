import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Sparkles,
  Send,
  Building2,
  HelpCircle,
  X,
  Bot,
  User,
  Zap,
  Cpu,
  RotateCcw,
} from 'lucide-react';
import { Alert, LanguageCode, PHC, UserRole } from '../types';
import { askAssistant } from '../gemini/client';
import { TRANSLATIONS } from '../i18n/translations';

interface AssistantChatProps {
  phcs: PHC[];
  alerts: Alert[];
  onSelectPhcById: (phcId: string) => void;
  role: UserRole;
  lang: LanguageCode;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  citedPhcs?: string[];
  mode?: string;
  modelUsed?: string;
  timestamp: string;
}

// Role-Based Model Access Configuration
const ROLE_MODEL_PERMISSIONS: Record<UserRole, { models: { id: string; name: string; desc: string }[]; badgeText: string; badgeColor: string }> = {
  phc: {
    badgeText: 'PHC Officer: Fast Telemetry Tier',
    badgeColor: 'bg-teal-950 text-teal-300 border-teal-800',
    models: [
      { id: 'gemini-3.1-flash-lite', name: 'gemini-3.1-flash-lite', desc: 'Fast Local Telemetry & Stock Ping' },
    ],
  },
  district: {
    badgeText: 'District Officer: Regional Logistics Tier',
    badgeColor: 'bg-sky-950 text-sky-300 border-sky-800',
    models: [
      { id: 'gemini-3.5-flash', name: 'gemini-3.5-flash', desc: 'Regional Redistribution & Stockouts' },
      { id: 'gemini-3.1-flash-lite', name: 'gemini-3.1-flash-lite', desc: 'Fast Local Telemetry & Stock Ping' },
    ],
  },
  state: {
    badgeText: 'State Director: Multi-District Analytics Tier',
    badgeColor: 'bg-indigo-950 text-indigo-300 border-indigo-800',
    models: [
      { id: 'gemini-3.8-flash', name: 'gemini-3.8-flash', desc: 'Statewide Emergency Forecasting' },
      { id: 'gemini-3.5-flash', name: 'gemini-3.5-flash', desc: 'Regional Redistribution & Stockouts' },
      { id: 'gemini-3.1-flash-lite', name: 'gemini-3.1-flash-lite', desc: 'Fast Local Telemetry & Stock Ping' },
    ],
  },
  national: {
    badgeText: 'National Director: Full Pro Strategic Tier',
    badgeColor: 'bg-purple-950 text-purple-300 border-purple-800',
    models: [
      { id: 'gemini-3.1-pro-preview', name: 'gemini-3.1-pro-preview', desc: 'Pro Tier Deep Strategic Reasoning' },
      { id: 'gemini-3.8-flash', name: 'gemini-3.8-flash', desc: 'Statewide Emergency Forecasting' },
      { id: 'gemini-3.5-flash', name: 'gemini-3.5-flash', desc: 'Regional Redistribution & Stockouts' },
      { id: 'gemini-3.1-flash-lite', name: 'gemini-3.1-flash-lite', desc: 'Fast Local Telemetry & Stock Ping' },
    ],
  },
};

export const AssistantChat: React.FC<AssistantChatProps> = ({
  phcs,
  alerts,
  onSelectPhcById,
  role,
  lang,
}) => {
  const currentRoleConfig = ROLE_MODEL_PERMISSIONS[role] || ROLE_MODEL_PERMISSIONS.national;
  const [selectedModel, setSelectedModel] = useState<string>(currentRoleConfig.models[0].id);

  // Auto-switch selected model if active user role changes
  useEffect(() => {
    if (!currentRoleConfig.models.some((m) => m.id === selectedModel)) {
      setSelectedModel(currentRoleConfig.models[0].id);
    }
  }, [role]);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Namaste Officer! I am Sanjeevani AI Copilot [Logged in as ${role.toUpperCase()} User]. I maintain multi-turn context across our national PHC network using role-authorized Gemini models. Ask me any question regarding PHC stock levels, stockout risks, bed availability, or redistribution plans.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      modelUsed: currentRoleConfig.models[0].id,
    },
  ]);

  const [inputQuery, setInputQuery] = useState<string>('');
  const [isThinking, setIsThinking] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking]);

  const presetQuestions = [
    'Which districts in Assam may run out of ORS within 10 days, and what should we move?',
    'Show top 3 critical stockout alerts in Uttar Pradesh',
    'What is our current bed occupancy and staff attendance in Tamil Nadu?',
    'Recommend immediate transfers for Anti-Snake Venom (ASV)',
  ];

  const handleSend = async (queryText?: string) => {
    const q = queryText || inputQuery;
    if (!q.trim()) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    if (!queryText) setInputQuery('');
    setIsThinking(true);

    const compactSummary = {
      totalPhcs: phcs.length,
      activeAlertsCount: alerts.length,
      criticalAlerts: alerts
        .filter((a) => a.severity === 'critical')
        .slice(0, 5)
        .map((a) => ({
          phcId: a.phcId,
          phcName: a.phcName,
          district: a.districtName,
          state: a.stateName,
          medicine: a.medicineName,
          daysOfCover: a.daysOfCover,
          stockOnHand: a.onHand,
        })),
    };

    const historyPayload = newMessages.map((m) => ({
      sender: m.sender,
      text: m.text,
    }));

    const res = await askAssistant(q, compactSummary, lang, historyPayload, selectedModel, role);
    setIsThinking(false);

    if (res.data) {
      const assistantMsg: ChatMessage = {
        id: `ast-${Date.now()}`,
        sender: 'assistant',
        text: res.data.answer,
        citedPhcs: res.data.citedPhcs,
        mode: res.mode,
        modelUsed: res.enforcedModel || selectedModel,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: 'welcome-reset',
        sender: 'assistant',
        text: 'Conversation history reset. Ready for a new query.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: selectedModel,
      },
    ]);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4 shadow-xl flex flex-col h-[640px]">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-3 gap-2">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-teal-400" />
          <div>
            <h2 className="font-bold text-base text-white">{t.assistant}</h2>
            <p className="text-xs text-slate-400">
              Multi-turn conversational AI grounded on real-time PHC telemetry
            </p>
          </div>
        </div>

        {/* Model Selector & Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* RBAC Role Tier Badge */}
          <span
            className={`px-2 py-1 border text-[11px] font-semibold rounded-md font-mono ${currentRoleConfig.badgeColor}`}
          >
            {currentRoleConfig.badgeText}
          </span>

          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs font-mono">
            <Cpu className="w-3.5 h-3.5 text-sky-400" />
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer text-xs"
            >
              {currentRoleConfig.models.map((m) => (
                <option key={m.id} value={m.id} className="bg-slate-900 text-slate-100">
                  {m.name} ({m.desc})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleClearHistory}
            className="p-1.5 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 rounded-lg text-xs flex items-center gap-1 transition-colors"
            title="Reset Conversation History"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Preset Suggestion Chips */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1 text-xs">
        <span className="text-slate-500 font-mono shrink-0">Sample Queries:</span>
        {presetQuestions.map((pq, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(pq)}
            className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-lg shrink-0 transition-colors"
          >
            {pq}
          </button>
        ))}
      </div>

      {/* Scrollable Thread Messages Area */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs scrollbar-thin scrollbar-thumb-slate-800">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {m.sender === 'assistant' && (
              <div className="w-7 h-7 rounded-lg bg-teal-600/20 text-teal-400 border border-teal-800/50 flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-[82%] rounded-xl p-3.5 space-y-2 shadow-sm ${
                m.sender === 'user'
                  ? 'bg-teal-600 text-white rounded-br-none'
                  : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-bl-none'
              }`}
            >
              <p className="leading-relaxed font-sans whitespace-pre-wrap">{m.text}</p>

              {/* Cited PHCs Badges */}
              {m.citedPhcs && m.citedPhcs.length > 0 && (
                <div className="pt-2 border-t border-slate-800/80 space-y-1">
                  <span className="text-[10px] font-mono text-slate-400">Cited PHC Records:</span>
                  <div className="flex flex-wrap gap-1">
                    {m.citedPhcs.map((phcTag, idx) => {
                      const match = phcTag.match(/phc-[a-z]+-\d+/);
                      const phcId = match ? match[0] : null;

                      return (
                        <button
                          key={idx}
                          onClick={() => phcId && onSelectPhcById(phcId)}
                          className="px-2 py-0.5 bg-slate-900 hover:bg-slate-800 text-teal-400 border border-teal-900 rounded text-[10px] font-mono flex items-center gap-1"
                        >
                          <Building2 className="w-3 h-3" />
                          {phcTag}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="text-[9px] font-mono text-slate-500 flex items-center justify-between pt-1 border-t border-slate-900">
                <span>{m.modelUsed && `Model: ${m.modelUsed}`}</span>
                <span>
                  {m.timestamp} {m.mode && `· Mode: ${m.mode.toUpperCase()}`}
                </span>
              </div>
            </div>

            {m.sender === 'user' && (
              <div className="w-7 h-7 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {isThinking && (
          <div className="flex gap-3 justify-start">
            <div className="w-7 h-7 rounded-lg bg-teal-600/20 text-teal-400 border border-teal-800/50 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 animate-spin text-teal-400" />
            </div>
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-400 font-mono text-xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />
              <span>{selectedModel} analyzing multi-turn conversation & control tower state...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
        <input
          type="text"
          placeholder="Ask a question or follow up on previous answers..."
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
        />
        <button
          onClick={() => handleSend()}
          disabled={!inputQuery.trim() || isThinking}
          className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
        >
          <Send className="w-3.5 h-3.5" /> Send
        </button>
      </div>
    </div>
  );
};

