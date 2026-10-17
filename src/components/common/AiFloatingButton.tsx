import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Send,
  X,
  PhoneCall,
  LayoutDashboard,
  Trash2,
  ExternalLink,
  RefreshCw,
  ChevronDown,
  ArrowLeft,
} from 'lucide-react';
import { apiUrl } from '../../config/apiConfig';
import { renderEngineeringMarkdown } from '../../utils/engineeringMarkdown';
import { STORE_ASSETS } from '../../assets/images';

// Geometric Cognivo orange logo icon matching the reference design
export const CognivoGeometricLogo: React.FC<{ className?: string; size?: number }> = ({
  className = 'w-5 h-5',
  size,
}) => (
  <svg
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
  >
    <rect x="5" y="11" width="17" height="5" rx="1.5" fill="#E06518" />
    <rect x="11" y="5" width="5" height="17" rx="1.5" fill="#E06518" />
    <rect x="18" y="24" width="17" height="5" rx="1.5" fill="#E06518" />
    <rect x="24" y="18" width="5" height="17" rx="1.5" fill="#E06518" />
    <rect x="24" y="11" width="11" height="5" rx="1.5" fill="#E06518" />
    <rect x="5" y="24" width="11" height="5" rx="1.5" fill="#E06518" />
    <rect x="11" y="24" width="5" height="11" rx="1.5" fill="#E06518" />
    <rect x="24" y="5" width="5" height="11" rx="1.5" fill="#E06518" />
  </svg>
);

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  time: string;
}

const STORAGE_KEY = 'forza_industrial_chat_sessions_v2';
const ACTIVE_SESSION_KEY = 'forza_active_session_id_v2';
const POPUP_SESSION_KEY = 'forza_popup_session_id_v2';

const PRESET_PROMPTS = [
  'مشاوره خرید تسمه و بلبرینگ',
  'استعلام قیمت و کاتالوگ',
  'فرمول‌های محاسباتی صنعتی',
  'راهنمای سفارشات اطلس',
];

export const AiFloatingButton: React.FC = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const streamAbortRef = useRef<AbortController | null>(null);

  // Get or initialize popup session ID
  const getOrCreatePopupSessionId = (): string => {
    let popupId = localStorage.getItem(POPUP_SESSION_KEY);
    if (!popupId) {
      popupId = 'session-popup-' + Date.now();
      localStorage.setItem(POPUP_SESSION_KEY, popupId);
    }
    return popupId;
  };

  // Sync messages into the FORZA workspace chat history (localStorage)
  const savePopupMessagesToStorage = (newMessages: ChatMessage[]) => {
    const popupId = getOrCreatePopupSessionId();
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      let sessions: any[] = stored ? JSON.parse(stored) : [];
      if (!Array.isArray(sessions)) sessions = [];

      const existingIndex = sessions.findIndex(s => s.id === popupId);
      const firstUserMsg = newMessages.find(m => m.sender === 'user');
      const sessionTitle = firstUserMsg
        ? `چت پاپ‌آپ: ${firstUserMsg.text.slice(0, 24)}${firstUserMsg.text.length > 24 ? '...' : ''}`
        : 'گفتگوی پاپ‌آپ FORZA';

      const updatedSession = {
        id: popupId,
        title: sessionTitle,
        timestamp: Date.now(),
        messages: newMessages,
      };

      if (existingIndex >= 0) {
        sessions[existingIndex] = updatedSession;
      } else {
        sessions.unshift(updatedSession);
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
      localStorage.setItem(ACTIVE_SESSION_KEY, popupId);
      window.dispatchEvent(new Event('forza_chat_updated'));
    } catch (err) {
      console.error('Failed to sync popup chat to storage:', err);
    }
  };

  // Load existing popup chat history on mount
  useEffect(() => {
    const popupId = localStorage.getItem(POPUP_SESSION_KEY);
    if (popupId) {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const sessions = JSON.parse(stored);
          if (Array.isArray(sessions)) {
            const popupSession = sessions.find((s: any) => s.id === popupId);
            if (popupSession && popupSession.messages) {
              setMessages(popupSession.messages);
            }
          }
        }
      } catch {}
    }
  }, []);

  // Auto scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages]);

  // Send message and stream Gemini AI response
  const handleSendMessage = async (textOverride?: string) => {
    const textToSend = (textOverride || inputQuery).trim();
    if (!textToSend || loading) return;

    if (streamAbortRef.current) {
      streamAbortRef.current.abort();
    }
    const abortCtrl = new AbortController();
    streamAbortRef.current = abortCtrl;

    const timeNow = new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
    const userMsgId = 'u-' + Date.now();
    const aiMsgId = 'ai-' + Date.now();

    const userMsg: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      text: textToSend,
      time: timeNow,
    };

    const aiMsg: ChatMessage = {
      id: aiMsgId,
      sender: 'ai',
      text: '',
      time: timeNow,
    };

    const initialMessages = [...messages, userMsg, aiMsg];
    setMessages(initialMessages);
    savePopupMessagesToStorage(initialMessages);

    setInputQuery('');
    setLoading(true);

    try {
      const historyPayload = messages.slice(-4).map(m => ({
        role: m.sender === 'user' ? 'user' : 'model',
        text: m.text,
      }));

      let streamSucceeded = false;
      let accumulatedText = '';

      try {
        const res = await fetch(apiUrl('/api/ai/consult-stream'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: abortCtrl.signal,
          body: JSON.stringify({
            query: textToSend,
            history: historyPayload,
            responseId: `popup-${Date.now()}`,
            includeAudio: false,
          }),
        });

        if (res.ok && res.body) {
          const reader = res.body.getReader();
          const decoder = new TextDecoder('utf-8');
          let buffer = '';

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed.startsWith('data:')) continue;
              try {
                const data = JSON.parse(trimmed.slice(5).trim());
                if (data.type === 'text_chunk') {
                  streamSucceeded = true;
                  accumulatedText = data.textSoFar || accumulatedText + (data.chunk || '');
                  setMessages(prev => {
                    const updated = prev.map(m => (m.id === aiMsgId ? { ...m, text: accumulatedText } : m));
                    savePopupMessagesToStorage(updated);
                    return updated;
                  });
                } else if (data.type === 'done') {
                  streamSucceeded = true;
                  accumulatedText = data.fullText || accumulatedText;
                  setMessages(prev => {
                    const updated = prev.map(m => (m.id === aiMsgId ? { ...m, text: accumulatedText } : m));
                    savePopupMessagesToStorage(updated);
                    return updated;
                  });
                }
              } catch {}
            }
          }
        }
      } catch {}

      // Fallback if streaming endpoint is unavailable
      if (!streamSucceeded) {
        const res = await fetch(apiUrl('/api/ai/consult'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: textToSend }),
        });
        const data = await res.json();
        const finalText = data && data.text ? data.text : 'پاسخی از سرور دریافت نشد. لطفاً دوباره تلاش کنید.';
        setMessages(prev => {
          const updated = prev.map(m => (m.id === aiMsgId ? { ...m, text: finalText } : m));
          savePopupMessagesToStorage(updated);
          return updated;
        });
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        const errText = 'خطا در برقراری ارتباط با هوش مصنوعی FORZA. لطفاً مجدداً تلاش نمایید.';
        setMessages(prev => {
          const updated = prev.map(m => (m.id === aiMsgId ? { ...m, text: errText } : m));
          savePopupMessagesToStorage(updated);
          return updated;
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    const newPopupId = 'session-popup-' + Date.now();
    localStorage.setItem(POPUP_SESSION_KEY, newPopupId);
    savePopupMessagesToStorage([]);
  };

  const handleOpenWorkspace = () => {
    const popupId = getOrCreatePopupSessionId();
    localStorage.setItem(ACTIVE_SESSION_KEY, popupId);
    setIsOpen(false);
    navigate('/ai-consult');
  };

  const handleOpenCall = () => {
    setIsOpen(false);
    navigate('/ai-forza');
  };

  return (
    <div dir="rtl" className="store-assistant fixed bottom-20 lg:bottom-6 right-3 sm:right-6 z-40 select-none">
      {/* ─────────────────────────────────────────────────────────────
          POPUP WINDOW (COMPACT ELEGANT AI CHAT PANEL)
      ────────────────────────────────────────────────────────────── */}
      {isOpen && (
        <div className="absolute bottom-12 sm:bottom-14 right-0 w-[90vw] sm:w-[360px] md:w-[380px] h-[490px] max-h-[80vh] bg-white rounded-2xl shadow-2xl border border-slate-200/90 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          
          {/* POPUP HEADER */}
          <div className="p-2.5 bg-gradient-to-r from-[#1E2530] via-[#2B313A] to-[#1E2530] text-white flex flex-col gap-2 shrink-0 shadow-md">
            {/* QUICK LINK BAR AT VERY TOP OF POPUP HEADER */}
            <div className="grid grid-cols-2 gap-1.5 pb-1.5 border-b border-white/10">
              <button
                type="button"
                onClick={handleOpenWorkspace}
                className="flex items-center justify-center gap-1.5 py-1 px-2 rounded-lg bg-white/10 hover:bg-[#E06518] text-white text-[11px] font-bold transition-all border border-white/15 group cursor-pointer"
              >
                <LayoutDashboard className="w-3 h-3 text-[#E06518] group-hover:text-white transition-colors" />
                <span>میزکار FORZA</span>
                <ExternalLink className="w-2.5 h-2.5 opacity-60" />
              </button>

              <button
                type="button"
                onClick={handleOpenCall}
                className="flex items-center justify-center gap-1.5 py-1 px-2 rounded-lg bg-white/10 hover:bg-emerald-600 text-white text-[11px] font-bold transition-all border border-white/15 group cursor-pointer"
              >
                <PhoneCall className="w-3 h-3 text-emerald-400 group-hover:text-white transition-colors animate-pulse" />
                <span>تماس تصویری</span>
                <ExternalLink className="w-2.5 h-2.5 opacity-60" />
              </button>
            </div>

            <div className="flex items-center justify-between pt-0.5">
              {/* ONLY Emblem Icon (Properly Sized, No Text) */}
              <div className="flex items-center gap-2">
                <img
                  src={STORE_ASSETS.forzaEmblem}
                  alt="FORZA Emblem"
                  className="h-8 sm:h-9 w-auto max-w-[180px] object-contain drop-shadow-md"
                />
              </div>

              {/* Header Actions */}
              <div className="flex items-center gap-1">
                {messages.length > 0 && (
                  <button
                    type="button"
                    onClick={clearChat}
                    title="پاک‌سازی گفتگو"
                    className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  title="بستن"
                  className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* CHAT MESSAGES BODY */}
          <div className="flex-1 p-3 overflow-y-auto space-y-2.5 bg-[#F8FAFC]">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col justify-center items-center text-center p-2">
                {/* Emblem Icon Only (Text Removed, Properly Sized) */}
                <img
                  src={STORE_ASSETS.forzaEmblem}
                  alt="FORZA Energy Emblem"
                  className="h-28 sm:h-32 w-auto max-w-[260px] object-contain drop-shadow-xl mb-3 animate-in fade-in zoom-in-95 duration-300"
                />

                {/* PRESET PROMPTS */}
                <div className="w-full space-y-1 mt-1">
                  <div className="grid grid-cols-1 gap-1">
                    {PRESET_PROMPTS.map((prompt, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSendMessage(prompt)}
                        className="text-right text-[11px] font-medium text-slate-700 bg-white hover:bg-orange-50 border border-slate-200 hover:border-orange-300 px-2.5 py-1.5 rounded-lg transition-all shadow-2xs hover:shadow-xs flex items-center justify-between group cursor-pointer"
                      >
                        <span>{prompt}</span>
                        <ArrowLeft className="w-3 h-3 text-slate-400 group-hover:text-[#E06518] group-hover:-translate-x-0.5 transition-all" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              messages.map(m => (
                <div
                  key={m.id}
                  className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-1 mb-0.5 px-1">
                    <span className="text-[9px] font-semibold text-slate-400">
                      {m.sender === 'user' ? 'شما' : 'هوش مصنوعی FORZA'}
                    </span>
                    <span className="text-[8px] text-slate-300">{m.time}</span>
                  </div>

                  <div
                    className={`max-w-[88%] p-2.5 rounded-xl text-xs leading-relaxed ${
                      m.sender === 'user'
                        ? 'bg-[#E06518] text-white rounded-tl-xs shadow-md font-medium'
                        : 'bg-white text-slate-800 border border-slate-200/90 rounded-tr-xs shadow-sm'
                    }`}
                  >
                    {m.sender === 'user' ? (
                      <p className="whitespace-pre-wrap">{m.text}</p>
                    ) : m.text ? (
                      <div className="prose prose-xs max-w-none text-slate-800">
                        {renderEngineeringMarkdown(m.text)}
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-slate-400 py-0.5">
                        <RefreshCw className="w-3 h-3 animate-spin text-[#E06518]" />
                        <span className="text-[10px] font-medium">در حال تحلیل و پاسخ‌دهی...</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* CHAT INPUT AREA */}
          <div className="p-2 bg-white border-t border-slate-200/80 shrink-0">
            <form
              onSubmit={e => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-1.5"
            >
              <input
                ref={inputRef}
                type="text"
                value={inputQuery}
                onChange={e => setInputQuery(e.target.value)}
                placeholder="پیام یا سؤال فنی خود را بنویسید..."
                disabled={loading}
                className="flex-1 bg-slate-100 focus:bg-white text-xs font-medium text-slate-800 placeholder-slate-400 px-2.5 py-2 rounded-lg border border-transparent focus:border-[#E06518] focus:outline-none transition-all"
              />

              <button
                type="submit"
                disabled={!inputQuery.trim() || loading}
                className="p-2 rounded-lg bg-[#E06518] hover:bg-[#c85510] disabled:opacity-40 disabled:hover:bg-[#E06518] text-white transition-all shadow-md active:scale-95 shrink-0 cursor-pointer"
              >
                {loading ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5 rotate-180" />
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TRIGGER FLOATING BUTTON AT BOTTOM RIGHT
      ────────────────────────────────────────────────────────────── */}
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        aria-label="چت هوشمند FORZA"
        title={isOpen ? 'بستن چت FORZA' : 'گفتگو با هوش مصنوعی FORZA'}
        className={`relative flex items-center justify-center transition-all duration-200 cursor-pointer active:scale-95 ${
          isOpen
            ? 'px-3.5 py-2 bg-[#1E2530] hover:bg-[#2B313A] border border-[#E06518] text-white rounded-xl ring-2 ring-orange-500/20 gap-2 shadow-xl'
            : 'p-0 bg-transparent border-0 shadow-none hover:opacity-95'
        }`}
      >
        {/* Pulsing Live Dot */}
        <span className="absolute -top-1 -right-1 flex h-3 w-3 z-10">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E06518] opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-[#E06518] border-2 border-white" />
        </span>

        {isOpen ? (
          <>
            <div className="w-5 h-5 rounded-lg bg-orange-500/20 border border-orange-500/40 flex items-center justify-center shrink-0">
              <ChevronDown className="w-3.5 h-3.5 text-[#E06518]" />
            </div>
            <div className="flex flex-col text-right leading-none">
              <span className="font-extrabold text-[11px] tracking-tight text-white">
                بستن چت
              </span>
            </div>
          </>
        ) : (
          /* Normal / Closed State: ONLY the Transparent Emblem Logo */
          <img
            src={STORE_ASSETS.forzaEmblem}
            alt="FORZA Emblem"
            className="h-14 sm:h-16 w-auto max-w-[180px] object-contain filter drop-shadow-[0_6px_18px_rgba(224,101,24,0.5)] hover:scale-108 transition-transform duration-200"
          />
        )}
      </button>
    </div>
  );
};
