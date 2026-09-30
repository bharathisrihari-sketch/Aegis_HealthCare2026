import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Sparkles,
  Send,
  X,
  Bot,
  User,
  RotateCcw,
  ChevronUp,
  ChevronDown,
  Building2,
  Compass,
  Database,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { Alert, LanguageCode, PHC, UserRole } from '../types';
import { askAssistant } from '../gemini/client';
import { TRANSLATIONS } from '../i18n/translations';

interface FrontPageChatWidgetProps {
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

export const FrontPageChatWidget: React.FC<FrontPageChatWidgetProps> = ({
  phcs,
  alerts,
  onSelectPhcById,
  role,
  lang,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [inputQuery, setInputQuery] = useState<string>('');
  const [isThinking, setIsThinking] = useState<boolean>(false);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Namaste! I am Sanjeevani AI Copilot — your intelligent health supply chain assistant. Ask me anything about site functionalities, navigation, 4 user login personas, or our ~100 PHC dataset across India!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isThinking, isOpen]);

  const presetQuestions = [
    'How do I navigate & filter by state?',
    'What data is fed into this site?',
    'Explain the 4 user login personas',
    'How does AI voice & photo stock entry work?',
    'How does automated stock redistribution work?',
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
      criticalAlertsCount: alerts.filter((a) => a.severity === 'critical').length,
    };

    const historyPayload = newMessages.map((m) => ({
      sender: m.sender,
      text: m.text,
    }));

    const res = await askAssistant(q, compactSummary, lang, historyPayload, 'gemini-3.5-flash', role);
    setIsThinking(false);

    if (res.data) {
      const assistantMsg: ChatMessage = {
        id: `ast-${Date.now()}`,
        sender: 'assistant',
        text: res.data.answer,
        citedPhcs: res.data.citedPhcs,
        mode: res.mode,
        modelUsed: res.enforcedModel || 'gemini-3.5-flash',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    }
  };

  const handleReset = () => {
    setMessages([
      {
        id: 'welcome-reset',
        sender: 'assistant',
        text: 'Chat history reset. How can I help you navigate or understand the site data?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <div className="fixed bottom-4 right-4 z-40 max-w-sm w-full px-2 sm:px-0">
      {!isOpen ? (
        /* Floating Chat Launcher Button */
        <button
          onClick={() => setIsOpen(true)}
          className="w-full sm:w-auto ml-auto flex items-center justify-between gap-3 px-4 py-3 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold rounded-2xl shadow-2xl border border-teal-400/30 transition-all transform hover:scale-105 group"
        >
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <Bot className="w-5 h-5 text-white" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
            </div>
            <div className="text-left">
              <div className="text-xs font-bold leading-tight">Sanjeevani AI Copilot</div>
              <div className="text-[10px] text-teal-100/90 font-mono">Ask Site Features, Data & Navigation</div>
            </div>
          </div>
          <ChevronUp className="w-4 h-4 text-teal-200 group-hover:translate-y-[-2px] transition-transform" />
        </button>
      ) : (
        /* Expanded Floating Chat Panel */
        <div className="bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[520px] text-white animate-fadeIn">
          {/* Header */}
          <div className="bg-slate-950 p-3 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-teal-950 text-teal-400 border border-teal-800 rounded-lg">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-xs text-white flex items-center gap-1.5">
                  Sanjeevani AI Copilot <Sparkles className="w-3 h-3 text-amber-400" />
                </h3>
                <p className="text-[10px] text-slate-400 font-mono">Health Supply Chain Assistant</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleReset}
                className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
                title="Reset Chat"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Preset Chips */}
          <div className="p-2 bg-slate-950/80 border-b border-slate-800/80 flex items-center gap-1.5 overflow-x-auto scrollbar-none text-[10px]">
            <span className="text-slate-500 font-mono shrink-0 pl-1">Ask:</span>
            {presetQuestions.map((pq, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(pq)}
                className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-teal-300 border border-slate-800 rounded-md shrink-0 transition-colors whitespace-nowrap"
              >
                {pq}
              </button>
            ))}
          </div>

          {/* Messages Thread */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 text-xs scrollbar-thin scrollbar-thumb-slate-800">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'assistant' && (
                  <div className="w-6 h-6 rounded-md bg-teal-600/20 text-teal-400 border border-teal-800/50 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-xl p-3 space-y-1.5 shadow-sm ${
                    m.sender === 'user'
                      ? 'bg-teal-600 text-white rounded-br-none'
                      : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-bl-none'
                  }`}
                >
                  <p className="leading-relaxed font-sans text-[11px] whitespace-pre-wrap">{m.text}</p>

                  {m.citedPhcs && m.citedPhcs.length > 0 && (
                    <div className="pt-1.5 border-t border-slate-800/80 space-y-1">
                      <span className="text-[9px] font-mono text-slate-400">Cited Records:</span>
                      <div className="flex flex-wrap gap-1">
                        {m.citedPhcs.map((phcTag, idx) => {
                          const match = phcTag.match(/phc-[a-z]+-\d+/);
                          const phcId = match ? match[0] : null;

                          return (
                            <button
                              key={idx}
                              onClick={() => phcId && onSelectPhcById(phcId)}
                              className="px-1.5 py-0.5 bg-slate-900 text-teal-400 border border-teal-900 rounded text-[9px] font-mono flex items-center gap-1"
                            >
                              <Building2 className="w-2.5 h-2.5" />
                              {phcTag}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="text-[8px] font-mono text-slate-500 text-right pt-0.5">
                    {m.timestamp}
                  </div>
                </div>

                {m.sender === 'user' && (
                  <div className="w-6 h-6 rounded-md bg-slate-800 text-slate-300 border border-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}

            {isThinking && (
              <div className="flex gap-2 justify-start">
                <div className="w-6 h-6 rounded-md bg-teal-600/20 text-teal-400 border border-teal-800/50 flex items-center justify-center shrink-0">
                  <Sparkles className="w-3.5 h-3.5 animate-spin text-teal-400" />
                </div>
                <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-400 font-mono text-[10px] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />
                  <span>Gemini Agent analyzing query...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <div className="p-2.5 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
            <input
              type="text"
              placeholder="Ask about site features, data, navigation..."
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
            />
            <button
              onClick={() => handleSend()}
              disabled={!inputQuery.trim() || isThinking}
              className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-lg text-xs flex items-center gap-1 transition-colors disabled:opacity-50"
            >
              <Send className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
