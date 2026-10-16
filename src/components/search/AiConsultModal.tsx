import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Bot,
  Send,
  User,
  ChevronLeft,
  X,
  RotateCcw,
  Calculator,
  Camera,
  PhoneCall,
  FileText,
  Copy,
  Check,
  ThumbsUp,
  ThumbsDown,
  ArrowUpRight,
  ShieldCheck,
  Activity,
  Cpu,
  Mic,
  Volume2,
  Square,
  Loader2,
  Radio,
  Trash2,
  Share2,
  Link2,
  Globe,
  Paperclip,
  Lightbulb,
  HelpCircle,
  Languages,
  PanelLeftClose,
  PanelLeft,
  Plus,
  ChevronDown,
  Settings,
  Database,
  Compass,
  MoreHorizontal,
  ExternalLink,
} from 'lucide-react';
import { STORE_ASSETS } from '../../assets/images';
import { apiUrl } from '../../config/apiConfig';
import { toPersianDigits } from '../../utils/formatters';
import { analyzePersianSentenceCompletion, calculateAudioMetrics } from '../../utils/silenceDetector';
import { renderEngineeringMarkdown } from '../../utils/engineeringMarkdown';
import { AiForzaFaceToFaceModal } from './AiForzaFaceToFaceModal';
import { CognivoGeometricLogo } from '../common/AiFloatingButton';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
  onOpenVisualSearch?: () => void;
}

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  time: string;
  isVoice?: boolean;
  suggestedAction?: {
    label: string;
    link?: string;
  };
  category?: string;
}

interface HistoryItem {
  id: string;
  title: string;
  prompt: string;
}

const CHAT_HISTORY_SECTIONS: { section: string; items: HistoryItem[] }[] = [
  {
    section: 'امروز (TODAY)',
    items: [
      {
        id: 'h1',
        title: 'خلاصه‌سازی مشخصات فنی تسمه‌ها...',
        prompt: 'خلاصه‌ای جامع از دسته‌بندی و مشخصات فنی انواع تسمه‌های انتقال قدرت صنعتی اطلس ارائه دهید.',
      },
      {
        id: 'h2',
        title: 'پیش‌نویس استعلام رسمی خرید کارخانه...',
        prompt: 'پیش‌نویس استعلام قیمت رسمی و فاکتور سامانه مودیان برای خرید عمده تسمه و پولی صادر کنید.',
      },
      {
        id: 'h3',
        title: 'محاسبه نسبت دور و پولی‌های کوره...',
        prompt: 'چگونه نسبت دور انتقال قدرت بین دو پولی با قطرهای ۲۰۰ و ۱۰۰ میلیمتر را بهینه کنم؟',
      },
    ],
  },
  {
    section: 'دیروز (YESTERDAY)',
    items: [
      {
        id: 'h4',
        title: 'راهنمای تخصصی تسمه‌های نسوز کوره...',
        prompt: 'تسمه و رولیک مناسب برای کوره رولری پخت کاشی با دمای کارکرد بالا چیست؟',
      },
      {
        id: 'h5',
        title: 'مشخصات فنی تسمه‌های PU نساجی...',
        prompt: 'مشخصات تسمه‌های تخت ضدالکتریسیته ساکن و تسمه جوشی PU برای خطوط نساجی و ریسندگی چیست؟',
      },
      {
        id: 'h6',
        title: 'کاتالوگ یاتاقان و بلبرینگ‌های دور بالا...',
        prompt: 'کاتالوگ و راهنمای بلبرینگ‌های دور بالای NSK و یاتاقان‌های صنعتی برای الکتروموتورها',
      },
      {
        id: 'h7',
        title: 'فرمول محاسبه طول تسمه DIN 2215...',
        prompt: 'فرمول دقیق محاسبه طول اسمی تسمه بر مبنای فاصله مراکز شفت (C) و قطرهای پولی (D و d) چیست؟',
      },
      {
        id: 'h8',
        title: 'تفاوت تسمه تایم رابر و پلی‌یورتان...',
        prompt: 'تفاوت تسمه تایمینگ پلی‌یورتان با سیم مفتول استیل در مقایسه با رابر کلروپرن چیست؟',
      },
    ],
  },
  {
    section: 'ماه‌های گذشته (AUGUST)',
    items: [
      {
        id: 'h9',
        title: 'بررسی رولیک و زنجیر نقاله کارخانجات...',
        prompt: 'بررسی مشخصات فنی رولیک‌های فولادی و زنجیرهای نقاله خطوط سرامیک و لعاب',
      },
      {
        id: 'h10',
        title: 'استعلام قیمت برندهای SWR و FORZA...',
        prompt: 'شرایط خرید، گارانتی و استعلام قیمت برندهای انحصاری SWR آلمان و FORZA ایتالیا چیست؟',
      },
      {
        id: 'h11',
        title: 'صدور پیش‌فاکتور سامانه مودیان اطلس...',
        prompt: 'نحوه دریافت پیش‌فاکتور رسمی مودیان با ارزش افزوده برای خرید عمده کارخانه',
      },
    ],
  },
];

export const AiConsultModal: React.FC<Props> = ({
  isOpen,
  onClose,
  initialQuery,
  onOpenVisualSearch,
}) => {
  const navigate = useNavigate();
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [feedbackState, setFeedbackState] = useState<Record<string, 'up' | 'down'>>({});
  const [isFaceToFaceOpen, setIsFaceToFaceOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeModel, setActiveModel] = useState<'cognivo-v1' | 'gemini-flash' | 'atlas-pro'>('cognivo-v1');
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);
  const [showCalculatorModal, setShowCalculatorModal] = useState(false);
  const [isDeeperResearchActive, setIsDeeperResearchActive] = useState(false);

  const openedFromDeskRef = useRef(false);
  const streamAbortControllerRef = useRef<AbortController | null>(null);

  // Messages State
  const [messages, setMessages] = useState<Message[]>([]);

  // Text-To-Speech (TTS) State
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [audioLoadingId, setAudioLoadingId] = useState<string | null>(null);
  const [autoPlayAudio, setAutoPlayAudio] = useState(false);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  // Speech-To-Text (STT / Voice Input) State
  const [isRecording, setIsRecording] = useState(false);
  const isRecordingRef = useRef(false);
  isRecordingRef.current = isRecording;

  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [micError, setMicError] = useState<string | null>(null);
  const [liveTranscript, setLiveTranscript] = useState('');
  const liveTranscriptRef = useRef('');
  liveTranscriptRef.current = liveTranscript;

  const [audioLevels, setAudioLevels] = useState<number[]>([25, 45, 75, 55, 85, 60, 30]);
  const [silenceProgress, setSilenceProgress] = useState(0);
  const [silenceReason, setSilenceReason] = useState<string>('');

  const [voiceTurnState, setVoiceTurnState] = useState<
    'idle' | 'listening' | 'userSpeaking' | 'silenceWaiting' | 'transcribing' | 'consulting' | 'aiSpeaking'
  >('idle');
  const voiceTurnStateRef = useRef(voiceTurnState);
  voiceTurnStateRef.current = voiceTurnState;

  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const silenceProgressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const targetSilenceMsRef = useRef<number>(1500);
  const hasUserSpokenRef = useRef(false);
  const lastVocalTimestampRef = useRef(0);
  const ambientNoiseFloorRef = useRef(0.015);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const micAnimFrameRef = useRef<number | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const liveSpeechRecognitionRef = useRef<any>(null);
  const recognizedTextRef = useRef<string>('');

  // Interactive Belt Length Calculator State
  const [calcC, setCalcC] = useState<string>('500');
  const [calcD, setCalcD] = useState<string>('200');
  const [calcd, setCalcd] = useState<string>('100');
  const [calcResult, setCalcResult] = useState<{
    length: number;
    ratio: number;
  } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSyncMessageFromForza = (userText: string, aiText: string) => {
    const timeNow = new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
    setMessages(prev => [
      ...prev,
      {
        id: 'u-' + Date.now(),
        sender: 'user',
        text: userText,
        time: timeNow,
        isVoice: true,
      },
      {
        id: 'ai-' + (Date.now() + 1),
        sender: 'ai',
        text: aiText,
        time: timeNow,
      },
    ]);
  };

  // Keyboard shortcut listener for Escape & Cmd+N / Ctrl+N
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onClose();
      }
      if ((e.metaKey || e.ctrlKey) && (e.key === 'n' || e.key === 'N')) {
        e.preventDefault();
        handleStartNewChat();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Handle Initial Query if supplied
  useEffect(() => {
    if (isOpen && initialQuery && initialQuery.trim()) {
      handleSend(initialQuery.trim());
    }
  }, [isOpen, initialQuery]);

  // Recalculate Belt Formula
  useEffect(() => {
    const C = parseFloat(calcC);
    const D = parseFloat(calcD);
    const d = parseFloat(calcd);
    if (!isNaN(C) && !isNaN(D) && !isNaN(d) && C > 0 && D > 0 && d > 0 && D >= d) {
      const length = 2 * C + 1.57 * (D + d) + Math.pow(D - d, 2) / (4 * C);
      const ratio = D / d;
      setCalcResult({
        length: Math.round(length),
        ratio: Math.round(ratio * 100) / 100,
      });
    } else {
      setCalcResult(null);
    }
  }, [calcC, calcD, calcd]);

  // Cleanup on close
  useEffect(() => {
    if (!isOpen) {
      stopRecordingCleanly();
      stopCurrentAudio();
    }
  }, [isOpen]);

  const stopCurrentAudio = () => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    setPlayingAudioId(null);
    setAudioLoadingId(null);
  };

  const clearSilenceTimers = () => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (silenceProgressIntervalRef.current) {
      clearInterval(silenceProgressIntervalRef.current);
      silenceProgressIntervalRef.current = null;
    }
    setSilenceProgress(0);
  };

  const stopRecordingCleanly = () => {
    clearSilenceTimers();
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    if (micAnimFrameRef.current) {
      cancelAnimationFrame(micAnimFrameRef.current);
      micAnimFrameRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch {}
    }
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach(track => track.stop());
      audioStreamRef.current = null;
    }
    if (liveSpeechRecognitionRef.current) {
      try {
        liveSpeechRecognitionRef.current.stop();
      } catch {}
      liveSpeechRecognitionRef.current = null;
    }
    setIsRecording(false);
    setVoiceTurnState('idle');
  };

  const startVoiceRecording = async () => {
    stopCurrentAudio();
    stopRecordingCleanly();
    setMicError(null);
    setRecordingSeconds(0);
    setLiveTranscript('');
    audioChunksRef.current = [];
    recognizedTextRef.current = '';
    hasUserSpokenRef.current = false;
    lastVocalTimestampRef.current = Date.now();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      audioStreamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = e => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.start(250);
      setIsRecording(true);
      setVoiceTurnState('listening');

      // Native SpeechRecognition if available
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        try {
          const recognition = new SpeechRecognition();
          recognition.lang = 'fa-IR';
          recognition.continuous = true;
          recognition.interimResults = true;

          recognition.onresult = (event: any) => {
            let interimTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
              const transcript = event.results[i][0].transcript;
              if (event.results[i].isFinal) {
                recognizedTextRef.current += transcript + ' ';
              } else {
                interimTranscript += transcript;
              }
            }
            const fullText = (recognizedTextRef.current + interimTranscript).trim();
            setLiveTranscript(fullText);
            liveTranscriptRef.current = fullText;
          };

          recognition.start();
          liveSpeechRecognitionRef.current = recognition;
        } catch {}
      }

      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.warn('Microphone access denied:', err);
      setMicError('دسترسی به میکروفون امکان‌پذیر نشد. لطفاً مجوز مرورگر را بررسی نمایید.');
      setIsRecording(false);
    }
  };

  const finishVoiceRecordingAndSend = async () => {
    const transcript = (liveTranscriptRef.current || recognizedTextRef.current).trim();
    stopRecordingCleanly();

    if (transcript) {
      handleSend(transcript, true);
      return;
    }

    // Fallback: If no transcript, upload audio blob to STT endpoint
    if (audioChunksRef.current.length > 0) {
      setIsTranscribing(true);
      try {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const formData = new FormData();
        formData.append('audio', audioBlob, 'voice.webm');

        const res = await fetch(apiUrl('/api/ai/stt'), {
          method: 'POST',
          body: formData,
        });
        if (res.ok) {
          const data = await res.json();
          if (data.text && data.text.trim()) {
            handleSend(data.text.trim(), true);
            return;
          }
        }
      } catch {} finally {
        setIsTranscribing(false);
      }
    }

    setMicError('صدایی تشخیص داده نشد. لطفاً دوباره تلاش کنید.');
  };

  const playAiSpeech = async (text: string, messageId: string) => {
    if (playingAudioId === messageId) {
      stopCurrentAudio();
      return;
    }
    stopCurrentAudio();
    setAudioLoadingId(messageId);

    try {
      const res = await fetch(apiUrl('/api/ai/tts'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.audioBase64) {
          const audio = new Audio(`data:${data.mimeType || 'audio/mp3'};base64,${data.audioBase64}`);
          currentAudioRef.current = audio;
          audio.onended = () => {
            setPlayingAudioId(null);
            currentAudioRef.current = null;
          };
          audio.onerror = () => {
            setPlayingAudioId(null);
            currentAudioRef.current = null;
          };
          await audio.play();
          setPlayingAudioId(messageId);
          setAudioLoadingId(null);
          return;
        }
      }
    } catch {}

    // Fallback: browser speech synthesis
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'fa-IR';
      utterance.onend = () => {
        setPlayingAudioId(null);
      };
      setPlayingAudioId(messageId);
      window.speechSynthesis.speak(utterance);
    }
    setAudioLoadingId(null);
  };

  const handleSend = async (queryText?: string, isVoiceSent = false) => {
    const textToSend = (queryText || inputQuery).trim();
    if (!textToSend) return;

    if (streamAbortControllerRef.current) {
      streamAbortControllerRef.current.abort();
      streamAbortControllerRef.current = null;
    }
    const abortCtrl = new AbortController();
    streamAbortControllerRef.current = abortCtrl;

    const userMessageId = 'u-' + Date.now();
    const uniqueResponseId = `resp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const timeNow = new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });

    const newUserMessage: Message = {
      id: userMessageId,
      sender: 'user',
      text: textToSend,
      time: timeNow,
      isVoice: isVoiceSent,
    };

    const aiMessageId = `ai-${uniqueResponseId}`;
    const initialAiMessage: Message = {
      id: aiMessageId,
      sender: 'ai',
      text: '',
      time: timeNow,
    };

    setMessages(prev => [...prev, newUserMessage, initialAiMessage]);
    setInputQuery('');
    setLoading(true);

    try {
      const historyPayload = messages
        .filter(m => m.id !== aiMessageId)
        .slice(-6)
        .map(m => ({
          role: m.sender === 'user' ? 'user' : 'model',
          text: m.text,
        }));

      let streamSucceeded = false;
      try {
        const res = await fetch(apiUrl('/api/ai/consult-stream'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: abortCtrl.signal,
          body: JSON.stringify({
            query: isDeeperResearchActive ? `[تحقیق عمیق مهندسی و تحلیل استانداردها] ${textToSend}` : textToSend,
            history: historyPayload,
            responseId: uniqueResponseId,
            includeAudio: true,
          }),
        });

        if (res.ok && res.body) {
          const reader = res.body.getReader();
          const decoder = new TextDecoder('utf-8');
          let accumulatedText = '';
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
                  setMessages(prev =>
                    prev.map(m => (m.id === aiMessageId ? { ...m, text: accumulatedText } : m))
                  );
                } else if (data.type === 'done') {
                  streamSucceeded = true;
                  accumulatedText = data.fullText || accumulatedText;
                  setMessages(prev =>
                    prev.map(m =>
                      m.id === aiMessageId
                        ? {
                            ...m,
                            text: accumulatedText,
                            suggestedAction: data.suggestedAction,
                          }
                        : m
                    )
                  );
                }
              } catch {}
            }
          }
        }
      } catch {}

      if (streamSucceeded) return;

      // Fallback REST endpoint
      const res = await fetch(apiUrl('/api/ai/consult'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: textToSend,
          history: historyPayload,
          includeSpeech: isVoiceSent || autoPlayAudio,
        }),
      });

      if (!res.ok) throw new Error('Failed to consult AI');
      const data = await res.json();
      const aiReplyText =
        data.reply ||
        'توصیه مهندسی: با توجه به کاتالوگ صنعتی اطلس، استفاده از تسمه‌ها و پولی‌های استاندارد با مقاومت کششی و حرارتی منطبق بر DIN 2215 توصیه می‌شود.';

      setMessages(prev =>
        prev.map(m =>
          m.id === aiMessageId
            ? {
                ...m,
                text: aiReplyText,
                suggestedAction: data.suggestedAction,
                category: data.category,
              }
            : m
        )
      );
    } catch {
      const fallbackText = `### پاسخ مشاور هوشمند صنعت پیش (پیش به صنعت):
در انتخاب قطعات صنعتی، توان الکتروموتور (kW)، دور ورودی و خروجی (RPM)، فاصله مراکز شفت‌ها و دمای محیطی کارکرد تعیین‌کننده است.

برای استعلام موجودی انبار مرکزی ۳۰,۰۰۰ قلمی یزد و پیش‌فاکتور رسمی مودیان با شماره ۰۳۵-۳۵۲۵۴۷۰۳ تماس حاصل فرمایید.`;

      setMessages(prev =>
        prev.map(m =>
          m.id === aiMessageId
            ? {
                ...m,
                text: fallbackText,
                suggestedAction: {
                  label: 'مشاهده کاتالوگ تسمه‌ها',
                  link: '/category/industrial-belts',
                },
              }
            : m
        )
      );
    } finally {
      setLoading(false);
      setTimeout(scrollToBottom, 100);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleStartNewChat = () => {
    stopCurrentAudio();
    stopRecordingCleanly();
    setMessages([]);
    setInputQuery('');
  };

  const handleCopyChatLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setShowShareToast(true);
    setTimeout(() => setShowShareToast(false), 2500);
  };

  if (!isOpen && !isFaceToFaceOpen) return null;

  return (
    <>
      {isOpen && !isFaceToFaceOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-0 lg:p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200"
          dir="rtl"
        >
          {/* Main Full-Size Modal Container (Light Mode Theme) */}
          <div className="relative w-full h-full lg:h-[92vh] lg:max-w-7xl bg-[#FFFFFF] lg:rounded-3xl shadow-2xl flex overflow-hidden border border-slate-200">
            {/* ================================================================= */}
            {/* 1. LEFT / RIGHT SIDEBAR (Matching Cognivo Reference Layout)       */}
            {/* ================================================================= */}
            <div
              className={`${
                isSidebarOpen ? 'w-72 lg:w-80' : 'w-0 hidden'
              } transition-all duration-300 ease-in-out bg-[#F8FAFC] border-l border-slate-200 flex flex-col shrink-0 select-none overflow-hidden z-20`}
            >
              {/* Sidebar Header: Brand Logo & Title & Collapse */}
              <div className="p-4.5 border-b border-slate-200/80 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center">
                    <CognivoGeometricLogo className="w-5 h-5 text-[#E06518]" />
                  </div>
                  <div>
                    <span className="font-black text-base tracking-tight text-slate-900">
                      Cognivo
                    </span>
                    <span className="block text-[10px] text-slate-400 font-medium">
                      مشاور هوشمند صنعت پیش (پیش به صنعت)
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsSidebarOpen(false)}
                  title="بستن سایدبار"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
                >
                  <PanelLeftClose className="w-4 h-4" />
                </button>
              </div>

              {/* + New Chat Button (Vibrant Orange with Keyboard Badge) */}
              <div className="p-3">
                <button
                  type="button"
                  onClick={handleStartNewChat}
                  className="w-full py-2.5 px-3.5 rounded-xl bg-[#E06518] hover:bg-[#C95210] active:scale-98 text-white font-bold text-xs flex items-center justify-between shadow-sm shadow-orange-900/10 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    <span>گفتگوی جدید (+ New Chat)</span>
                  </div>
                  <span className="px-1.5 py-0.5 rounded-md bg-white/20 text-white font-mono text-[10px] tracking-wide">
                    ⌘ N
                  </span>
                </button>
              </div>

              {/* Navigation Menu Options */}
              <div className="px-3 py-1 space-y-1 text-xs font-semibold text-slate-600">
                <button
                  type="button"
                  onClick={() => handleStartNewChat()}
                  className="w-full py-2 px-3 rounded-lg hover:bg-slate-200/50 flex items-center gap-2.5 transition-colors text-right cursor-pointer"
                >
                  <Compass className="w-4 h-4 text-slate-500" />
                  <span>کاوش هوش مصنوعی (Explore Cognivo AI)</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleSend(
                      'پایگاه دانش فنی صنعت پیش و بازرگانی تسمه اطلس: استانداردهای DIN و کاتالوگ تسمه‌ها و قطعات خطوط تولید'
                    )
                  }
                  className="w-full py-2 px-3 rounded-lg hover:bg-slate-200/50 flex items-center gap-2.5 transition-colors text-right cursor-pointer"
                >
                  <Database className="w-4 h-4 text-slate-500" />
                  <span>پایگاه دانش مهندسی (Knowledge Base)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowCalculatorModal(true)}
                  className="w-full py-2 px-3 rounded-lg hover:bg-slate-200/50 flex items-center gap-2.5 transition-colors text-right cursor-pointer text-[#E06518]"
                >
                  <Calculator className="w-4 h-4 text-[#E06518]" />
                  <span>الگوها و فرمول‌ها (Templates & DIN)</span>
                </button>
              </div>

              {/* Chat History Grouped by Date */}
              <div className="flex-1 overflow-y-auto px-3 py-2 space-y-4">
                {CHAT_HISTORY_SECTIONS.map(section => (
                  <div key={section.section} className="space-y-1">
                    <div className="px-3 text-[10px] font-bold text-slate-400 tracking-wider">
                      {section.section}
                    </div>
                    {section.items.map(item => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSend(item.prompt)}
                        className="w-full py-2 px-3 rounded-lg text-right text-xs text-slate-700 hover:text-slate-900 hover:bg-white hover:shadow-2xs transition-all truncate block cursor-pointer"
                        title={item.prompt}
                      >
                        {item.title}
                      </button>
                    ))}
                  </div>
                ))}
              </div>

              {/* Settings & User Profile Bottom Card */}
              <div className="p-3 border-t border-slate-200/80 bg-white space-y-2">
                <button
                  type="button"
                  onClick={() => setShowCalculatorModal(true)}
                  className="w-full py-1.5 px-2.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 flex items-center gap-2 text-xs font-medium transition-colors cursor-pointer"
                >
                  <Settings className="w-4 h-4 text-slate-400" />
                  <span>تنظیمات و ابزارهای مهندسی (Settings)</span>
                </button>

                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/70">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-200 border border-slate-300">
                      <img
                        src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
                        alt="کاربر"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="text-right leading-tight">
                      <div className="font-bold text-xs text-slate-800">مهندس ناظر کارخانه</div>
                      <span className="text-[10px] text-[#E06518] font-bold">طرح رایگان (Free Plan)</span>
                    </div>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            </div>

            {/* ================================================================= */}
            {/* 2. MAIN CENTER WORKSPACE (Header, Conversation / Hero, Input)    */}
            {/* ================================================================= */}
            <div className="flex-1 flex flex-col bg-[#FFFFFF] overflow-hidden">
              {/* Top Navigation Bar: Model Switcher & Quick Actions */}
              <div className="h-14 px-4 sm:px-6 border-b border-slate-200 flex items-center justify-between shrink-0 bg-white z-10">
                <div className="flex items-center gap-2 sm:gap-3">
                  {!isSidebarOpen && (
                    <button
                      type="button"
                      onClick={() => setIsSidebarOpen(true)}
                      title="باز کردن سایدبار"
                      className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      <PanelLeft className="w-4 h-4" />
                    </button>
                  )}

                  {/* Model Dropdown (Cognivo Core v1) */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                      className="px-3 py-1.5 rounded-xl hover:bg-slate-100 text-slate-800 text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer border border-transparent hover:border-slate-200"
                    >
                      <span>
                        {activeModel === 'cognivo-v1'
                          ? 'Cognivo Core v1'
                          : activeModel === 'gemini-flash'
                          ? 'Gemini 2.5 Flash'
                          : 'Atlas Industrial Core Pro'}
                      </span>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                    </button>

                    {isModelDropdownOpen && (
                      <div className="absolute top-full right-0 mt-1.5 w-56 bg-white border border-slate-200 rounded-xl shadow-xl p-1.5 z-30 space-y-1">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveModel('cognivo-v1');
                            setIsModelDropdownOpen(false);
                          }}
                          className={`w-full py-2 px-2.5 rounded-lg text-right text-xs font-bold flex items-center justify-between ${
                            activeModel === 'cognivo-v1'
                              ? 'bg-orange-50 text-[#E06518]'
                              : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <span>Cognivo Core v1</span>
                          {activeModel === 'cognivo-v1' && <Check className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveModel('gemini-flash');
                            setIsModelDropdownOpen(false);
                          }}
                          className={`w-full py-2 px-2.5 rounded-lg text-right text-xs font-bold flex items-center justify-between ${
                            activeModel === 'gemini-flash'
                              ? 'bg-orange-50 text-[#E06518]'
                              : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <span>Gemini 2.5 Flash</span>
                          {activeModel === 'gemini-flash' && <Check className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveModel('atlas-pro');
                            setIsModelDropdownOpen(false);
                          }}
                          className={`w-full py-2 px-2.5 rounded-lg text-right text-xs font-bold flex items-center justify-between ${
                            activeModel === 'atlas-pro'
                              ? 'bg-orange-50 text-[#E06518]'
                              : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <span>Atlas Industrial Core Pro</span>
                          {activeModel === 'atlas-pro' && <Check className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Action Icons: Options, Link, Share, Close */}
                <div className="flex items-center gap-1.5">
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
                      title="گزینه‌ها"
                      className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                    {isMoreMenuOpen && (
                      <div className="absolute top-full left-0 mt-1.5 w-48 bg-white border border-slate-200 rounded-xl shadow-xl p-1.5 z-30 space-y-1">
                        <button
                          type="button"
                          onClick={() => {
                            handleStartNewChat();
                            setIsMoreMenuOpen(false);
                          }}
                          className="w-full py-2 px-2.5 rounded-lg text-right text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                        >
                          <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                          <span>شروع مجدد گفتگو</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setAutoPlayAudio(!autoPlayAudio);
                            setIsMoreMenuOpen(false);
                          }}
                          className="w-full py-2 px-2.5 rounded-lg text-right text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center justify-between"
                        >
                          <span>پخش خودکار صدا</span>
                          <span className="text-[10px] font-bold text-[#E06518]">
                            {autoPlayAudio ? 'روشن' : 'خاموش'}
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsFaceToFaceOpen(true);
                            setIsMoreMenuOpen(false);
                          }}
                          className="w-full py-2 px-2.5 rounded-lg text-right text-xs font-medium text-orange-600 hover:bg-orange-50 flex items-center gap-2"
                        >
                          <PhoneCall className="w-3.5 h-3.5 text-[#E06518]" />
                          <span>مکالمه تصویری FORZA</span>
                        </button>
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleCopyChatLink}
                    title="کپی لینک گفتگو"
                    className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <Link2 className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyChatLink}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5 text-slate-500" />
                    <span>Share</span>
                  </button>

                  <button
                    type="button"
                    onClick={onClose}
                    title="بستن پنجره"
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer mr-1"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Share Toast */}
              {showShareToast && (
                <div className="absolute top-16 left-1/2 -translate-x-1/2 px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-full shadow-xl flex items-center gap-2 z-40 animate-in fade-in">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>لینک گفتگو با موفقیت کپی شد!</span>
                </div>
              )}

              {/* Main Body: Welcome Hero (if no messages) OR Message List */}
              <div className="flex-1 overflow-y-auto flex flex-col justify-between">
                {messages.length === 0 ? (
                  /* =========================================================== */
                  /* 3. INITIAL WELCOME HERO (Matching Reference Image Pixel-Perfect) */
                  /* =========================================================== */
                  <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto w-full">
                    {/* Top Upgrade Pill Badge */}
                    <div className="mb-6 sm:mb-8">
                      <div className="px-4 py-1.5 rounded-full bg-orange-50 border border-orange-200/80 text-[#E06518] text-xs font-bold flex items-center gap-2 shadow-2xs">
                        <Sparkles className="w-3.5 h-3.5 text-[#E06518]" />
                        <span>Upgrade free plan to full access</span>
                        <span className="text-[10px] text-slate-400 font-normal">
                          (دسترسی نامحدود مهندسی)
                        </span>
                      </div>
                    </div>

                    {/* Futuristic RZA FORZA Energy Emblem */}
                    <div className="mb-6 flex items-center justify-center">
                      <img
                        src={STORE_ASSETS.forzaEmblem}
                        alt="FORZA Energy Emblem"
                        className="h-28 sm:h-36 w-auto max-w-[320px] object-contain drop-shadow-xl"
                      />
                    </div>

                    {/* Elevated Prompt Input Card */}
                    <div className="w-full bg-white rounded-3xl border-2 border-slate-200/90 shadow-xl shadow-slate-200/50 p-4 transition-all focus-within:border-[#E06518] focus-within:ring-4 focus-within:ring-orange-500/10 mb-4">
                      <textarea
                        ref={textareaRef}
                        value={inputQuery}
                        onChange={e => setInputQuery(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSend();
                          }
                        }}
                        rows={3}
                        placeholder="Ask me anything... (هر سوالی درباره تسمه‌ها، یاتاقان‌ها، محاسبات و استعلام دارید بپرسید)"
                        className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 resize-none focus:outline-none leading-relaxed"
                      />

                      {/* Input Inner Toolbar: Left and Right Controls */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-2">
                        {/* Left Action Buttons */}
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setIsDeeperResearchActive(!isDeeperResearchActive)}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                              isDeeperResearchActive
                                ? 'bg-orange-500 text-white'
                                : 'bg-orange-50 text-[#E06518] border border-orange-200 hover:bg-orange-100'
                            }`}
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Deeper Research</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              onClose();
                              if (onOpenVisualSearch) onOpenVisualSearch();
                            }}
                            title="شناسایی تصویری قطعه"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                          >
                            <Camera className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setShowCalculatorModal(true)}
                            title="فرمول‌ها و محاسبات فنی"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                          >
                            <Lightbulb className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Right Tools: CPU, Globe, Attach, Waveform, Circular Orange Send */}
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                            title="تنظیمات مدل محاسباتی"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                          >
                            <Cpu className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleSend('جستجوی آنلاین کاتالوگ و مقایسه برندهای اروپایی SWR و FORZA')
                            }
                            title="جستجوی کاتالوگ"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                          >
                            <Globe className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              onClose();
                              if (onOpenVisualSearch) onOpenVisualSearch();
                            }}
                            title="ضمیمه کردن فایل یا عکس"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                          >
                            <Paperclip className="w-4 h-4" />
                          </button>

                          {/* Voice Waveform / Mic Button */}
                          <button
                            type="button"
                            onClick={startVoiceRecording}
                            title="مکالمه صوتی زنده با تشخیص سکوت"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-[#E06518] hover:bg-orange-50 transition-colors cursor-pointer"
                          >
                            <Radio className="w-4 h-4" />
                          </button>

                          {/* Circular Orange Send Button with Arrow */}
                          <button
                            type="button"
                            onClick={() => handleSend()}
                            disabled={!inputQuery.trim() || loading}
                            className="w-8 h-8 rounded-full bg-[#E06518] hover:bg-[#C95210] disabled:bg-slate-200 text-white flex items-center justify-center transition-all cursor-pointer shadow-md shadow-orange-950/20 active:scale-95"
                          >
                            <Send className="w-3.5 h-3.5 -rotate-45" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Upgrade to connect all your tools banner */}
                    <div className="w-full flex items-center justify-between px-3 py-2 text-xs text-slate-500 mb-6">
                      <span className="font-medium text-slate-600">
                        Upgrade to connect all your tools to Cognivo
                      </span>
                      <div className="flex items-center gap-1.5 text-slate-400">
                        {/* Tool icons badges */}
                        <span className="w-5 h-5 rounded-md bg-blue-100 text-blue-600 text-[9px] font-bold flex items-center justify-center">
                          G
                        </span>
                        <span className="w-5 h-5 rounded-md bg-purple-100 text-purple-600 text-[9px] font-bold flex items-center justify-center">
                          N
                        </span>
                        <span className="w-5 h-5 rounded-md bg-amber-100 text-amber-600 text-[9px] font-bold flex items-center justify-center">
                          S
                        </span>
                        <span className="w-5 h-5 rounded-md bg-emerald-100 text-emerald-600 text-[9px] font-bold flex items-center justify-center">
                          X
                        </span>
                        <ChevronLeft className="w-4 h-4" />
                      </div>
                    </div>

                    {/* 3 Suggestion Cards in a Row */}
                    <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-3.5">
                      {/* Card 1: Summarize Text */}
                      <button
                        type="button"
                        onClick={() =>
                          handleSend(
                            'خلاصه‌سازی و استخراج مشخصات فنی: لیست قطعات و کدهای فنی تسمه و پولی را با توضیحات خلاصه ارائه دهید.'
                          )
                        }
                        className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-md text-right transition-all cursor-pointer group"
                      >
                        <div className="w-7 h-7 rounded-lg bg-slate-100 group-hover:bg-orange-50 flex items-center justify-center mb-2.5 transition-colors">
                          <FileText className="w-4 h-4 text-slate-600 group-hover:text-[#E06518]" />
                        </div>
                        <h4 className="font-black text-xs text-slate-900 mb-1">Summarize Text</h4>
                        <p className="text-[11px] text-slate-500 leading-relaxed font-normal">
                          Turn long articles into easy summaries. (خلاصه‌سازی استعلام و کدهای فنی)
                        </p>
                      </button>

                      {/* Card 2: Creative Writing */}
                      <button
                        type="button"
                        onClick={() =>
                          handleSend(
                            'محاسبه و طراحی فنی: فرمول و پیشنهاد فنی برای تسمه انتقال قدرت خط تولید با دور بالا'
                          )
                        }
                        className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-md text-right transition-all cursor-pointer group"
                      >
                        <div className="w-7 h-7 rounded-lg bg-slate-100 group-hover:bg-orange-50 flex items-center justify-center mb-2.5 transition-colors">
                          <Calculator className="w-4 h-4 text-slate-600 group-hover:text-[#E06518]" />
                        </div>
                        <h4 className="font-black text-xs text-slate-900 mb-1">Creative Writing</h4>
                        <p className="text-[11px] text-slate-500 leading-relaxed font-normal">
                          Generate stories, blog posts, or fresh ideas. (طراحی و محاسبات فرمولی)
                        </p>
                      </button>

                      {/* Card 3: Answer Questions */}
                      <button
                        type="button"
                        onClick={() =>
                          handleSend(
                            'پاسخ تخصصی: شرایط نگهداری، طول عمر و دمای کارکرد تسمه‌های صنعتی در کوره کاشی چیست؟'
                          )
                        }
                        className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-md text-right transition-all cursor-pointer group"
                      >
                        <div className="w-7 h-7 rounded-lg bg-slate-100 group-hover:bg-orange-50 flex items-center justify-center mb-2.5 transition-colors">
                          <HelpCircle className="w-4 h-4 text-slate-600 group-hover:text-[#E06518]" />
                        </div>
                        <h4 className="font-black text-xs text-slate-900 mb-1">Answer Questions</h4>
                        <p className="text-[11px] text-slate-500 leading-relaxed font-normal">
                          Ask me anything—from facts to advice—and get instant answers.
                        </p>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* =========================================================== */
                  /* 4. ACTIVE CHAT CONVERSATION STREAM (Light Theme)           */
                  /* =========================================================== */
                  <div className="flex-1 p-4 sm:p-6 space-y-4 max-w-4xl mx-auto w-full">
                    {messages.map(m => (
                      <div
                        key={m.id}
                        className={`flex items-start gap-3.5 ${
                          m.sender === 'user' ? 'flex-row-reverse' : ''
                        }`}
                      >
                        {/* Avatar */}
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-sm shadow-xs ${
                            m.sender === 'user'
                              ? 'bg-slate-800 text-white'
                              : 'bg-orange-50 border border-orange-200 text-[#E06518]'
                          }`}
                        >
                          {m.sender === 'user' ? (
                            <User className="w-4 h-4" />
                          ) : (
                            <CognivoGeometricLogo className="w-4 h-4 text-[#E06518]" />
                          )}
                        </div>

                        {/* Bubble */}
                        <div
                          className={`max-w-[85%] rounded-3xl p-4.5 space-y-2.5 shadow-sm transition-all ${
                            m.sender === 'user'
                              ? 'bg-slate-900 text-white rounded-tr-xs'
                              : 'bg-white text-slate-800 border border-slate-200 rounded-tl-xs'
                          }`}
                        >
                          <div className="flex items-center justify-between text-[11px] pb-1 border-b border-current/10">
                            <span className="font-bold">
                              {m.sender === 'user' ? 'شما' : 'Cognivo AI Core'}
                            </span>
                            <span className="opacity-60">{m.time}</span>
                          </div>

                          <div className="text-xs sm:text-sm leading-relaxed font-normal">
                            {m.sender === 'ai' ? (
                              renderEngineeringMarkdown(m.text, false)
                            ) : (
                              <div className="whitespace-pre-wrap">{m.text}</div>
                            )}
                          </div>

                          {m.suggestedAction && m.suggestedAction.link && (
                            <div className="pt-2">
                              <button
                                type="button"
                                onClick={() => {
                                  onClose();
                                  navigate(m.suggestedAction!.link!);
                                }}
                                className="w-full py-2 px-3 rounded-xl bg-orange-50 hover:bg-orange-100 text-[#E06518] font-bold text-xs flex items-center justify-between border border-orange-200 transition-colors cursor-pointer"
                              >
                                <span>{m.suggestedAction.label}</span>
                                <ChevronLeft className="w-4 h-4" />
                              </button>
                            </div>
                          )}

                          {m.sender === 'ai' && (
                            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                              <button
                                type="button"
                                onClick={() => playAiSpeech(m.text, m.id)}
                                disabled={audioLoadingId === m.id}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                                  playingAudioId === m.id
                                    ? 'bg-rose-50 text-rose-600 border border-rose-200'
                                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                }`}
                              >
                                {audioLoadingId === m.id ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#E06518]" />
                                ) : playingAudioId === m.id ? (
                                  <>
                                    <Square className="w-3.5 h-3.5 fill-rose-600" />
                                    <span>قطع صدا</span>
                                  </>
                                ) : (
                                  <>
                                    <Volume2 className="w-3.5 h-3.5 text-[#E06518]" />
                                    <span>شنیدن پاسخ</span>
                                  </>
                                )}
                              </button>

                              <div className="flex items-center gap-1 text-slate-400">
                                <button
                                  type="button"
                                  onClick={() => copyToClipboard(m.text, m.id)}
                                  className="p-1 hover:text-slate-800 rounded transition-colors"
                                  title="کپی متن"
                                >
                                  {copiedId === m.id ? (
                                    <span className="text-emerald-600 font-bold text-[10px]">کپی شد</span>
                                  ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                  )}
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setFeedbackState(prev => ({ ...prev, [m.id]: 'up' }))
                                  }
                                  className={`p-1 rounded transition-colors ${
                                    feedbackState[m.id] === 'up'
                                      ? 'text-emerald-600'
                                      : 'hover:text-slate-800'
                                  }`}
                                >
                                  <ThumbsUp className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setFeedbackState(prev => ({ ...prev, [m.id]: 'down' }))
                                  }
                                  className={`p-1 rounded transition-colors ${
                                    feedbackState[m.id] === 'down'
                                      ? 'text-rose-600'
                                      : 'hover:text-slate-800'
                                  }`}
                                >
                                  <ThumbsDown className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}

                    {loading && (
                      <div className="flex items-center gap-2.5 p-3.5 bg-orange-50/60 rounded-2xl border border-orange-200 text-xs text-[#E06518] font-bold animate-pulse">
                        <Sparkles className="w-4 h-4 animate-spin text-[#E06518]" />
                        <span>Cognivo AI در حال تفکر و پردازش پاسخ مهندسی...</span>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                )}

                {/* Persistent Bottom Input Bar in Chat Mode */}
                {messages.length > 0 && (
                  <div className="p-4 bg-white border-t border-slate-200 shrink-0">
                    <div className="max-w-4xl mx-auto w-full bg-white rounded-2xl border-2 border-slate-200 p-3 shadow-md focus-within:border-[#E06518] focus-within:ring-2 focus-within:ring-orange-500/10">
                      <div className="flex items-end gap-2">
                        <textarea
                          value={inputQuery}
                          onChange={e => setInputQuery(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSend();
                            }
                          }}
                          rows={2}
                          placeholder="Ask Cognivo anything..."
                          className="flex-1 bg-transparent text-xs sm:text-sm text-slate-800 placeholder-slate-400 resize-none focus:outline-none"
                        />
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={startVoiceRecording}
                            className="p-2 rounded-xl text-slate-400 hover:text-[#E06518] hover:bg-orange-50 transition-colors cursor-pointer"
                          >
                            <Mic className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSend()}
                            disabled={!inputQuery.trim() || loading}
                            className="w-8 h-8 rounded-xl bg-[#E06518] hover:bg-[#C95210] disabled:bg-slate-200 text-white flex items-center justify-center transition-all cursor-pointer"
                          >
                            <Send className="w-3.5 h-3.5 -rotate-45" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Footer Disclaimer */}
              <div className="px-6 py-2.5 border-t border-slate-100 bg-[#FFFFFF] flex items-center justify-between text-[11px] text-slate-400">
                <span className="truncate">
                  Cognivo can make mistakes. Check important info. See{' '}
                  <span className="underline cursor-pointer">Cookie Preferences</span>.
                </span>

                <div className="flex items-center gap-3 shrink-0">
                  <button
                    type="button"
                    title="تغییر زبان"
                    className="flex items-center gap-1 hover:text-slate-700 transition-colors cursor-pointer"
                  >
                    <Languages className="w-3.5 h-3.5" />
                    <span>فارسی</span>
                  </button>

                  <button
                    type="button"
                    title="راهنما و مستندات"
                    onClick={() => setShowCalculatorModal(true)}
                    className="hover:text-slate-700 transition-colors cursor-pointer"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Voice Recording Drawer Modal Overlay if Recording */}
      {isRecording && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-orange-50 border-2 border-orange-200 text-[#E06518] mx-auto flex items-center justify-center animate-pulse">
              <Mic className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-base font-black text-slate-900">در حال دریافت صدای شما...</h3>
              <p className="text-xs text-slate-500 mt-1">
                {liveTranscript ? `« ${liveTranscript} »` : 'صحبت بفرمایید؛ سیستم گفتار را تحلیل می‌کند'}
              </p>
            </div>

            <div className="flex justify-center gap-1.5 h-5 items-center">
              {audioLevels.map((lvl, idx) => (
                <div
                  key={idx}
                  style={{ height: `${lvl}%` }}
                  className="w-1.5 bg-[#E06518] rounded-full transition-all"
                />
              ))}
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={stopRecordingCleanly}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold"
              >
                لغو
              </button>
              <button
                type="button"
                onClick={finishVoiceRecordingAndSend}
                className="px-6 py-2 rounded-xl bg-[#E06518] hover:bg-[#C95210] text-white text-xs font-black shadow-md shadow-orange-900/10"
              >
                ارسال به مشاور ↵
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mini Calculator & Formulas Modal (DIN 2215) */}
      {showCalculatorModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4 text-right">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-[#E06518]" />
                <h3 className="font-black text-sm text-slate-900">
                  فرمول محاسبه طول تسمه (DIN 2215)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCalculatorModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-600 font-bold block mb-1">
                  فاصله مراکز شفت (C mm):
                </label>
                <input
                  type="number"
                  value={calcC}
                  onChange={e => setCalcC(e.target.value)}
                  className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-center focus:outline-none focus:border-[#E06518]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-600 font-bold block mb-1">پولی بزرگ (D mm):</label>
                  <input
                    type="number"
                    value={calcD}
                    onChange={e => setCalcD(e.target.value)}
                    className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-center focus:outline-none focus:border-[#E06518]"
                  />
                </div>
                <div>
                  <label className="text-slate-600 font-bold block mb-1">پولی کوچک (d mm):</label>
                  <input
                    type="number"
                    value={calcd}
                    onChange={e => setCalcd(e.target.value)}
                    className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-center focus:outline-none focus:border-[#E06518]"
                  />
                </div>
              </div>

              {calcResult && (
                <div className="p-3 bg-orange-50 border border-orange-200 rounded-2xl space-y-1.5 text-xs text-slate-800">
                  <div className="flex justify-between">
                    <span className="font-medium text-slate-600">طول اسمی تسمه ($L_p$):</span>
                    <span className="font-mono font-black text-[#E06518]">
                      {toPersianDigits(calcResult.length)} mm
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-slate-600">نسبت دور (Ratio):</span>
                    <span className="font-mono font-bold text-slate-800">
                      ۱ به {toPersianDigits(calcResult.ratio)}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCalculatorModal(false);
                      handleSend(
                        `لطفاً تسمه مناسب با طول نامی ${calcResult.length} میلیمتر و نسبت دور ۱:${calcResult.ratio} را از کاتالوگ صنعت پیش و بازرگانی تسمه اطلس پیشنهاد دهید.`
                      );
                    }}
                    className="w-full mt-2 py-2 bg-[#E06518] hover:bg-[#C95210] text-white font-bold rounded-xl text-center cursor-pointer shadow-xs"
                  >
                    ارسال این مقادیر به مشاور هوشمند ↵
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Face-to-Face Voice Call Modal with AI FORZA */}
      <AiForzaFaceToFaceModal
        isOpen={isFaceToFaceOpen}
        onClose={() => {
          setIsFaceToFaceOpen(false);
          if (!openedFromDeskRef.current) {
            onClose();
          }
        }}
        onSwitchToWorkspace={() => {
          openedFromDeskRef.current = true;
          setIsFaceToFaceOpen(false);
        }}
        onSyncMessage={handleSyncMessageFromForza}
      />
    </>
  );
};
