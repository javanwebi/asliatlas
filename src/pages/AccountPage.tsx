import { ProductImage } from '../components/product/ProductImage';
import React, { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useClubPoints } from '../context/ClubPointsContext';
import { generateMockProducts, getProductByCode } from '../data/mockGenerator';
import { MOCK_CUSTOMERS, MOCK_TICKETS } from '../data/mockData';
import { toPersianDigits, formatPrice } from '../utils/formatters';
import { STORE_ASSETS } from '../assets/images';
import {
  Home,
  TrendingUp,
  CreditCard,
  DollarSign,
  AlertCircle,
  Sparkles,
  BarChart3,
  Settings,
  Bell,
  MessageSquare,
  Search,
  Users,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Package,
  Truck,
  Plus,
  RefreshCw,
  Printer,
  ChevronLeft,
  Store,
  Layers,
  ShoppingBag,
  ExternalLink,
  Trash2,
  Edit2,
  Send,
  Building,
  Heart,
  MapPin,
  Cpu,
  Gift,
  BookOpen,
  Share2,
  Wrench,
  Coins,
  Check,
  LogOut,
  Sliders,
  FileText,
  HelpCircle,
  Award,
  PhoneCall,
  Menu,
  X,
  Compass,
  ArrowLeft,
  Maximize2,
  Minimize2,
  Phone,
  MessageCircle,
  SlidersHorizontal,
  PanelLeftClose,
  PanelLeftOpen,
  Palette
} from 'lucide-react';
import { Order, OrderStatus, Address, Ticket, TicketMessage } from '../types';
import { PrintableInvoiceModal } from '../components/account/PrintableInvoiceModal';
import { DedicatedEngineerCard } from '../components/account/DedicatedEngineerCard';
import { PlantMachineryPassport } from '../components/account/PlantMachineryPassport';
import { CustomerMarketingHub } from '../components/account/CustomerMarketingHub';
import { TechnicalDocsVault } from '../components/account/TechnicalDocsVault';
import { RetailCountertopLookup } from '../components/account/RetailCountertopLookup';
import { RetailFastMovingPacks } from '../components/account/RetailFastMovingPacks';
import { RetailPosMerchandising } from '../components/account/RetailPosMerchandising';
import { B2bVerificationGate } from '../components/account/B2bVerificationGate';
import { AccountMobileBottomNav } from '../components/account/AccountMobileBottomNav';
import { AccountMobileSearchModal } from '../components/account/AccountMobileSearchModal';
import { AccountMobileSupportSheet } from '../components/account/AccountMobileSupportSheet';
import { POINT_VALUE_TOMAN } from '../services/clubService';

export const AccountPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'dashboard';

  const {
    currentUser,
    roleTitle,
    activeRole,
    logout,
    updateProfile,
    getUserAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
  } = useAuth();

  const activeUser = currentUser || MOCK_CUSTOMERS[0];

  const { orders, inquiries, addToCart, removeFromCart } = useCart();
  const { wishlist, toggleWishlist } = useWishlist();
  const { points, tier } = useClubPoints();

  // Full-Screen and Responsive Desktop Sidebar State
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Dashboard Background Mood (Soft, Gentle & User-Friendly Ambiance)
  const [bgMood, setBgMood] = useState<'pearl' | 'lavender' | 'sky' | 'clean'>(() => {
    return (localStorage.getItem('dashboard_bg_mood') as any) || 'pearl';
  });
  const [isMoodPickerOpen, setIsMoodPickerOpen] = useState(false);

  const handleSetBgMood = (mood: 'pearl' | 'lavender' | 'sky' | 'clean') => {
    setBgMood(mood);
    localStorage.setItem('dashboard_bg_mood', mood);
    setIsMoodPickerOpen(false);
  };

  // Dedicated Mobile Search & Support Sheets
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isMobileSupportSheetOpen, setIsMobileSupportSheetOpen] = useState(false);

  // Mobile Drawer State
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // Toggle true browser fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Selected Order for Timeline Modal & Invoice Modal
  const [selectedOrderForTimeline, setSelectedOrderForTimeline] = useState<Order | null>(null);
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState<Order | null>(null);
  const [reorderOrderFeedback, setReorderOrderFeedback] = useState<string | null>(null);

  // Activity Table Filter Tab
  const [activityFilter, setActivityFilter] = useState<'7d' | '30d' | 'all'>('7d');

  // Address CRUD Modal State
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [addressFormData, setAddressFormData] = useState<Omit<Address, 'id'>>({
    title: '',
    recipientName: '',
    recipientPhone: '',
    province: 'یزد',
    city: 'یزد',
    fullAddress: '',
    postalCode: '',
    isDefault: false,
  });

  // Tickets State
  const [tickets, setTickets] = useState<Ticket[]>(() => {
    return MOCK_TICKETS.map(t => ({
      ...t,
      messages: [
        {
          id: 'msg-1',
          sender: 'user',
          senderName: currentUser?.fullName || 'فروشگاه ابزار و قطعات اطلس',
          message: `سلام و عرض ادب، در خصوص ${t.subject} سوال داشتم. ممنون می‌شوم کاتالوگ فنی یا شرایط تسویه چکی را بفرمایید.`,
          timestamp: t.createdAt + ' - ۱۰:۱۵',
        },
        {
          id: 'msg-2',
          sender: 'support',
          senderName: 'سرپرست فروش و پخش بازرگانی اطلس (مهندس زارع)',
          message: 'با سلام، درخواست فروشگاه شما در واحد امور همکاران خرده‌فروشی بررسی شد. سهمیه کارتن و تخفیف همکاری اعمال گردید.',
          timestamp: t.lastReplyAt + ' - ۱۱:۳۰',
        },
      ],
    }));
  });

  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null);
  const [newTicketSubject, setNewTicketSubject] = useState('');
  const [newTicketDept, setNewTicketDept] = useState<'sales' | 'technical' | 'support' | 'agency'>('sales');
  const [newTicketPriority, setNewTicketPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newTicketMsg, setNewTicketMsg] = useState('');
  const [isCreatingTicket, setIsCreatingTicket] = useState(false);
  const [ticketReplyText, setTicketReplyText] = useState('');

  // Profile Edit State
  const [profileName, setProfileName] = useState(activeUser.fullName || '');
  const [profileEmail, setProfileEmail] = useState(activeUser.email || '');
  const [profileCompany, setProfileCompany] = useState(activeUser.companyName || 'ابزار و قطعات صنعتی پارس (شعبه مرکزی)');
  const [profileEconomicCode, setProfileEconomicCode] = useState(activeUser.economicCode || '');
  const [profileSavedFeedback, setProfileSavedFeedback] = useState(false);

  // Global search input in top bar
  const [headerSearchQuery, setHeaderSearchQuery] = useState('');

  // Orders Filter
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');

  const addresses = getUserAddresses();

  // Wishlist products
  const allProducts = useMemo(() => generateMockProducts(), []);
  const wishlistProducts = useMemo(() => {
    return wishlist
      .map(code => getProductByCode(code) || allProducts.find(p => p.code.toLowerCase() === code.toLowerCase()))
      .filter((p): p is (typeof allProducts)[0] => Boolean(p));
  }, [allProducts, wishlist]);

  const setTab = (tab: string) => {
    setSearchParams({ tab });
    setIsMobileDrawerOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Close drawer on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileDrawerOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Address Modal helpers
  const handleOpenAddAddress = () => {
    setEditingAddress(null);
    setAddressFormData({
      title: '',
      recipientName: currentUser?.fullName || '',
      recipientPhone: currentUser?.phone || '',
      province: 'یزد',
      city: 'یزد',
      fullAddress: '',
      postalCode: '',
      isDefault: addresses.length === 0,
    });
    setIsAddressModalOpen(true);
  };

  const handleOpenEditAddress = (addr: Address) => {
    setEditingAddress(addr);
    setAddressFormData({
      title: addr.title,
      recipientName: addr.recipientName,
      recipientPhone: addr.recipientPhone,
      province: addr.province,
      city: addr.city,
      fullAddress: addr.fullAddress,
      postalCode: addr.postalCode,
      isDefault: !!addr.isDefault,
    });
    setIsAddressModalOpen(true);
  };

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAddress) {
      updateAddress(editingAddress.id, addressFormData);
    } else {
      addAddress(addressFormData);
    }
    setIsAddressModalOpen(false);
  };

  // Ticket handlers
  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicketSubject.trim() || !newTicketMsg.trim()) return;

    const ticketNum = 'TCK-' + Math.floor(100 + Math.random() * 900);
    const newT: Ticket = {
      id: 'tkt-' + Date.now(),
      ticketNumber: ticketNum,
      subject: newTicketSubject,
      department: newTicketDept,
      priority: newTicketPriority,
      status: 'open',
      createdAt: new Date().toLocaleDateString('fa-IR'),
      lastReplyAt: new Date().toLocaleDateString('fa-IR'),
      messages: [
        {
          id: 'msg-' + Date.now(),
          sender: 'user',
          senderName: currentUser?.fullName || 'فروشگاه همکار',
          message: newTicketMsg,
          timestamp: new Date().toLocaleDateString('fa-IR') + ' - ' + new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
        },
      ],
    };

    setTickets(prev => [newT, ...prev]);
    setIsCreatingTicket(false);
    setNewTicketSubject('');
    setNewTicketMsg('');
    setActiveTicket(newT);
  };

  const handleSendTicketReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTicket || !ticketReplyText.trim()) return;

    const userMsg: TicketMessage = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      senderName: currentUser?.fullName || 'فروشگاه همکار',
      message: ticketReplyText,
      timestamp: new Date().toLocaleDateString('fa-IR') + ' - ' + new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
    };

    const updated = {
      ...activeTicket,
      messages: [...(activeTicket.messages || []), userMsg],
      lastReplyAt: new Date().toLocaleDateString('fa-IR'),
      status: 'open' as const,
    };

    setTickets(prev => prev.map(t => (t.id === activeTicket.id ? updated : t)));
    setActiveTicket(updated);
    setTicketReplyText('');

    setTimeout(() => {
      const botMsg: TicketMessage = {
        id: 'msg-' + (Date.now() + 1),
        sender: 'support',
        senderName: 'امور فروشگاه‌های اطلس (مهندس زارع)',
        message: 'پیام دریافت شد. درخواست شما در خصوص سهمیه کارتن و استعلام قیمت همکار بررسی می‌گردد.',
        timestamp: new Date().toLocaleDateString('fa-IR') + ' - ' + new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
      };
      setTickets(prev =>
        prev.map(t => (t.id === updated.id ? { ...t, messages: [...(t.messages || []), botMsg] } : t))
      );
      setActiveTicket(curr =>
        curr && curr.id === updated.id ? { ...curr, messages: [...(curr.messages || []), botMsg] } : curr
      );
    }, 1200);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      fullName: profileName,
      email: profileEmail,
      companyName: profileCompany,
      economicCode: profileEconomicCode,
    });
    setProfileSavedFeedback(true);
    setTimeout(() => setProfileSavedFeedback(false), 3000);
  };

  const handleReorderPastOrder = (order: Order) => {
    let count = 0;
    order.items.forEach(item => {
      const prod = getProductByCode(item.productCode) || allProducts.find(p => p.code === item.productCode);
      if (prod) {
        addToCart(prod, item.quantity);
        count += item.quantity;
      }
    });
    setReorderOrderFeedback(`اقلام سفارش شماره ${order.orderNumber} (${toPersianDigits(count)} قلم کالا) به سبد سفارش قفسه فروشگاه افزوده شدند!`);
    setTimeout(() => setReorderOrderFeedback(null), 3500);
  };

  const filteredOrders = orders.filter(o => {
    if (orderStatusFilter === 'all') return true;
    return o.status === orderStatusFilter;
  });

  const pendingInquiriesCount = inquiries.filter(i => i.status === 'pending').length;

  // Dynamic Background Mood Styles Configuration
  const moodStyles = {
    pearl: {
      wrapper: 'bg-gradient-to-b from-[#F8FAFD] via-[#F2F5F9] to-[#ECF1F7]',
      orbs: (
        <>
          <div className="fixed -top-28 right-0 w-[700px] h-[700px] bg-gradient-to-bl from-orange-200/40 via-amber-100/30 to-transparent rounded-full blur-[150px] pointer-events-none -z-0" />
          <div className="fixed bottom-0 -left-24 w-[800px] h-[800px] bg-gradient-to-tr from-sky-200/35 via-blue-100/25 to-transparent rounded-full blur-[160px] pointer-events-none -z-0" />
          <div className="fixed top-1/4 -left-20 w-[650px] h-[650px] bg-gradient-to-br from-emerald-100/35 via-teal-50/25 to-transparent rounded-full blur-[150px] pointer-events-none -z-0" />
          <div className="fixed top-2/3 right-1/4 w-[550px] h-[550px] bg-gradient-to-r from-rose-100/25 via-pink-50/20 to-transparent rounded-full blur-[150px] pointer-events-none -z-0" />
        </>
      ),
      glowLine: 'via-[#E06518]/30',
    },
    lavender: {
      wrapper: 'bg-gradient-to-b from-[#FAF8FD] via-[#F4F1FA] to-[#EDE8F6]',
      orbs: (
        <>
          <div className="fixed -top-28 right-0 w-[720px] h-[720px] bg-gradient-to-bl from-purple-200/40 via-violet-100/30 to-transparent rounded-full blur-[150px] pointer-events-none -z-0" />
          <div className="fixed bottom-0 -left-24 w-[800px] h-[800px] bg-gradient-to-tr from-emerald-200/30 via-teal-100/25 to-transparent rounded-full blur-[160px] pointer-events-none -z-0" />
          <div className="fixed top-1/3 -left-20 w-[620px] h-[620px] bg-gradient-to-br from-pink-200/30 via-rose-100/20 to-transparent rounded-full blur-[150px] pointer-events-none -z-0" />
        </>
      ),
      glowLine: 'via-purple-400/35',
    },
    sky: {
      wrapper: 'bg-gradient-to-b from-[#F6FAFD] via-[#EFF6FC] to-[#E6F0F8]',
      orbs: (
        <>
          <div className="fixed -top-28 right-0 w-[720px] h-[720px] bg-gradient-to-bl from-sky-200/45 via-cyan-100/35 to-transparent rounded-full blur-[150px] pointer-events-none -z-0" />
          <div className="fixed bottom-0 -left-24 w-[800px] h-[800px] bg-gradient-to-tr from-blue-200/35 via-indigo-100/25 to-transparent rounded-full blur-[160px] pointer-events-none -z-0" />
          <div className="fixed top-1/3 -left-20 w-[620px] h-[620px] bg-gradient-to-br from-teal-100/35 via-emerald-50/25 to-transparent rounded-full blur-[150px] pointer-events-none -z-0" />
        </>
      ),
      glowLine: 'via-sky-400/35',
    },
    clean: {
      wrapper: 'bg-gradient-to-b from-[#FAFAFA] via-[#F4F5F7] to-[#EDEDF0]',
      orbs: (
        <>
          <div className="fixed -top-28 right-0 w-[680px] h-[680px] bg-gradient-to-bl from-slate-200/35 via-gray-100/25 to-transparent rounded-full blur-[150px] pointer-events-none -z-0" />
          <div className="fixed bottom-0 -left-24 w-[750px] h-[750px] bg-gradient-to-tr from-slate-200/30 via-zinc-100/20 to-transparent rounded-full blur-[160px] pointer-events-none -z-0" />
        </>
      ),
      glowLine: 'via-slate-400/25',
    },
  };

  // B2B Verification Gate Check for unapproved accounts
  if (currentUser && currentUser.approvedB2B === false) {
    return <B2bVerificationGate />;
  }

  return (
    <div className={`min-h-screen w-full ${moodStyles[bgMood].wrapper} text-slate-800 pb-28 lg:pb-10 relative selection:bg-[#E06518] selection:text-white overflow-x-hidden transition-colors duration-500`}>
      
      {/* Subtle Micro-Dot Tactile Grid Overlay */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.38] -z-0 transition-opacity"
        style={{
          backgroundImage: `radial-gradient(rgba(100, 116, 139, 0.22) 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />

      {/* Ambient Pastel Glow Orbs */}
      {moodStyles[bgMood].orbs}

      {/* Subtle Top Luminous Beam Line */}
      <div className={`fixed top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent ${moodStyles[bgMood].glowLine} to-transparent pointer-events-none z-50`} />

      {/* FULL-SCREEN STICKY GLASS HEADER (Edge-to-Edge) */}
      <header className="sticky top-0 z-40 w-full bg-white/85 backdrop-blur-2xl border-b border-white/90 shadow-[0_4px_25px_rgba(0,0,0,0.03)] px-3 sm:px-6 lg:px-8 py-2.5 transition-all">
        <div className="w-full flex items-center justify-between gap-2 sm:gap-6">

          {/* Right/Start: Mobile Controls + Brand Identity */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Mobile Hamburger Drawer Toggle (Dedicated for Mobile) */}
            <button
              type="button"
              onClick={() => setIsMobileDrawerOpen(true)}
              className="lg:hidden p-2 rounded-2xl bg-slate-100/90 text-slate-700 hover:text-[#E06518] hover:bg-white border border-slate-200/80 transition-all cursor-pointer shadow-2xs active:scale-95"
              title="منوی ناوبری"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Desktop Sidebar Collapse Toggle */}
            <button
              type="button"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="hidden lg:flex p-2 rounded-2xl bg-slate-100/80 hover:bg-white text-slate-600 hover:text-[#E06518] border border-slate-200/70 transition-all cursor-pointer shadow-2xs"
              title={isSidebarCollapsed ? 'گسترش منوی سایدبار' : 'جمع کردن سایدبار (نمای تمام‌صفحه)'}
            >
              {isSidebarCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
            </button>

            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-[#E06518] to-orange-400 text-white flex items-center justify-center font-black text-lg shadow-md shadow-orange-500/25 shrink-0 group-hover:scale-105 transition-transform">
                <Store className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="text-right leading-tight">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="font-black text-xs sm:text-base text-slate-900 tracking-tight truncate max-w-[130px] sm:max-w-none">
                    {activeUser.companyName || 'فروشگاه ابزار و قطعات پارس'}
                  </span>
                  <span className="inline-block px-1.5 sm:px-2 py-0.5 rounded-full bg-orange-100 text-[#E06518] border border-orange-200 text-[9px] sm:text-[10px] font-black">
                    عاملیت خرده‌فروشی
                  </span>
                </div>
                <p className="hidden sm:block text-[10px] sm:text-[11px] text-slate-500">
                  پرتال اختصاصی فروشگاه | کد عاملیت: <span className="font-mono font-bold text-slate-700">ATL-9842</span>
                </p>
              </div>
            </Link>
          </div>

          {/* Center: Search Bar (Desktop) */}
          <div className="relative flex-1 max-w-lg hidden md:block mx-4">
            <input
              type="text"
              value={headerSearchQuery}
              onChange={e => setHeaderSearchQuery(e.target.value)}
              placeholder="جستجوی استعلام قطعه، شماره بارنامه، سفارش یا کد فنی..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-100/70 hover:bg-slate-100/90 focus:bg-white border border-slate-200/80 focus:border-[#E06518] rounded-2xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none transition-all shadow-inner"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          </div>

          {/* Left/End: Actions + Mobile-Dedicated Tools + Profile */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* Mobile Fast Search Modal Trigger (Dedicated Mobile UI) */}
            <button
              type="button"
              onClick={() => setIsMobileSearchOpen(true)}
              className="md:hidden p-2 rounded-2xl bg-slate-100/90 hover:bg-white text-slate-700 hover:text-[#E06518] border border-slate-200/80 transition-all cursor-pointer shadow-2xs active:scale-95"
              title="جستجوی سریع قطعه"
            >
              <Search className="w-4 h-4 text-[#E06518]" />
            </button>

            {/* Mobile Quick Support Call Trigger (Dedicated Mobile UI) */}
            <button
              type="button"
              onClick={() => setIsMobileSupportSheetOpen(true)}
              className="lg:hidden p-2 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/80 transition-all cursor-pointer shadow-2xs active:scale-95"
              title="تماس با مهندس ناظر"
            >
              <Phone className="w-4 h-4 text-emerald-600" />
            </button>

            {/* Background Mood / Theme Selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsMoodPickerOpen(!isMoodPickerOpen)}
                className={`p-2 sm:p-2.5 rounded-2xl border transition-all cursor-pointer active:scale-95 flex items-center gap-1.5 ${
                  isMoodPickerOpen
                    ? 'bg-orange-50 border-orange-300 text-[#E06518] shadow-xs'
                    : 'bg-slate-100/80 hover:bg-white text-slate-600 hover:text-[#E06518] border border-slate-200/70 shadow-2xs'
                }`}
                title="تغییر پس‌زمینه و حال‌وهوای پرتال"
              >
                <Palette className="w-4 h-4" />
                <span className="hidden 2xl:inline text-xs font-bold">تم پس‌زمینه</span>
              </button>

              {/* Mood Popover Dropdown */}
              {isMoodPickerOpen && (
                <div className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-56 p-2 bg-white/95 backdrop-blur-2xl rounded-2xl border border-white/90 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-right space-y-1">
                  <div className="px-2.5 py-1.5 text-[10px] font-black text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    رنگ‌بندی و پس‌زمینه داشبورد
                  </div>
                  {[
                    { id: 'pearl', label: 'مرواریدی گرم (اطلس)', desc: 'کهربایی ملایم و صیقلی', dot: 'bg-orange-400' },
                    { id: 'lavender', label: 'آرامش اسطوخودوس', desc: 'یاسی و نعنایی لطیف', dot: 'bg-purple-400' },
                    { id: 'sky', label: 'آسمان صبحگاهی', desc: 'زلال، خنک و آرام‌بخش', dot: 'bg-sky-400' },
                    { id: 'clean', label: 'بلورین مینیمال', desc: 'خاکستری روشن و شفاف', dot: 'bg-slate-400' },
                  ].map(m => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => handleSetBgMood(m.id as any)}
                      className={`w-full text-right p-2 rounded-xl transition-all flex items-center justify-between cursor-pointer ${
                        bgMood === m.id
                          ? 'bg-orange-50 text-[#E06518] font-black'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-full ${m.dot} shadow-2xs`} />
                        <div className="leading-tight">
                          <span className="text-xs font-bold block">{m.label}</span>
                          <span className="text-[10px] text-slate-400 block">{m.desc}</span>
                        </div>
                      </div>
                      {bgMood === m.id && <Check className="w-3.5 h-3.5 text-[#E06518]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Part Lookup Shortcut Button (Desktop & Tablet) */}
            <button
              type="button"
              onClick={() => setTab('countertop')}
              className="hidden sm:flex px-3 sm:px-4 py-2 bg-gradient-to-r from-orange-50 to-amber-50 hover:from-orange-100 hover:to-amber-100 text-[#E06518] border border-orange-200/90 rounded-2xl text-xs font-bold items-center gap-1.5 transition-all shadow-2xs cursor-pointer shrink-0"
            >
              <Search className="w-3.5 h-3.5" />
              <span>استعلام پشت دخل</span>
            </button>

            {/* Fullscreen Toggle Button (Desktop & Mobile) */}
            <button
              type="button"
              onClick={toggleFullscreen}
              className="p-2 sm:p-2.5 rounded-2xl bg-slate-100/80 hover:bg-white text-slate-600 hover:text-[#E06518] border border-slate-200/70 transition-all shadow-2xs cursor-pointer active:scale-95"
              title={isFullscreen ? 'خروج از حالت تمام‌صفحه' : 'حالت تمام‌صفحه پیشرفته (F11)'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Link to Public Storefront (Desktop) */}
            <Link
              to="/"
              className="hidden xl:flex items-center gap-1.5 px-3 py-2 bg-slate-100/80 hover:bg-white text-slate-700 hover:text-slate-900 border border-slate-200/80 rounded-2xl text-xs font-bold transition-all shadow-2xs"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-[#E06518]" />
              <span>فروشگاه اصلی</span>
            </Link>

            {/* Notification Bell */}
            <button
              type="button"
              onClick={() => setTab('tickets')}
              className="relative p-2 sm:p-2.5 rounded-2xl bg-slate-100/80 hover:bg-white text-slate-600 hover:text-slate-900 border border-slate-200/70 transition-all shadow-2xs cursor-pointer active:scale-95"
              title="اعلان‌ها"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#E06518] rounded-full ring-2 ring-white" />
            </button>

            {/* Profile Avatar Pill */}
            <div className="flex items-center gap-1.5 sm:gap-2 pl-1 pr-1.5 sm:pr-3 py-1 bg-white/90 border border-slate-200/80 rounded-2xl shadow-2xs">
              <div className="text-right leading-tight hidden xl:block">
                <span className="text-xs font-bold text-slate-800 block truncate max-w-[120px]">{activeUser.fullName}</span>
                <span className="text-[10px] text-emerald-600 font-semibold block">آنلاین</span>
              </div>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-tr from-[#E06518] to-orange-400 text-white flex items-center justify-center font-black text-xs shadow-xs">
                {activeUser.fullName ? activeUser.fullName.slice(0, 1) : 'م'}
              </div>
              <button
                type="button"
                onClick={logout}
                className="p-1 sm:p-1.5 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                title="خروج"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* FULL-SCREEN EXPANSIVE CONTENT CONTAINER */}
      <div className="w-full px-3 sm:px-6 lg:px-8 xl:px-10 py-4 sm:py-6 relative z-10 space-y-6">

        {reorderOrderFeedback && (
          <div className="p-4 bg-emerald-50/90 border border-emerald-300 rounded-2xl text-emerald-800 text-xs flex items-center justify-between gap-3 shadow-sm backdrop-blur-sm">
            <div className="flex items-center gap-2 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{reorderOrderFeedback}</span>
            </div>
            <Link
              to="/cart"
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs shrink-0 shadow-xs"
            >
              مشاهده سبد خرید و صدور فاکتور
            </Link>
          </div>
        )}

        {/* FULL-SCREEN EXPANSIVE WORKSPACE: Desktop Collapsible Sidebar + Full-Width Main Canvas */}
        <div className="w-full flex flex-col lg:flex-row gap-5 xl:gap-6 items-start">

          {/* DESKTOP GLASS SIDEBAR (Collapsible to icon rail or expanded) */}
          <aside
            className={`hidden lg:block shrink-0 transition-all duration-300 sticky top-20 z-20 ${
              isSidebarCollapsed ? 'w-20' : 'w-72 xl:w-80'
            }`}
          >
            <div className="bg-white/75 backdrop-blur-xl rounded-3xl border border-white/90 p-3.5 sm:p-4 shadow-[0_8px_30px_rgba(0,0,0,0.03)] space-y-4">

              {/* Sidebar Header with Collapse Toggle */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                {!isSidebarCollapsed && (
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#E06518] animate-pulse" />
                    <span className="text-xs font-black text-slate-800 tracking-tight">ناوبری پرتال فروشگاه</span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                  className={`p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-[#E06518] transition-colors cursor-pointer ${
                    isSidebarCollapsed ? 'mx-auto' : ''
                  }`}
                  title={isSidebarCollapsed ? 'گسترش منو' : 'جمع کردن منو (حالت آیکونی)'}
                >
                  {isSidebarCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
                </button>
              </div>

              {/* SECTION 1: GENERAL */}
              <div>
                {!isSidebarCollapsed && (
                  <div className="px-3 py-1 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    عمومی و دخل فروشگاه (General)
                  </div>
                )}
                <div className="space-y-1 mt-1">
                  {[
                    { id: 'dashboard', label: 'داشبورد فروشگاهی', icon: Home },
                    { id: 'countertop', label: 'استعلام سریع پشت دخل', icon: Search, badge: 'حالت مشتری' },
                    { id: 'shelf_packs', label: 'کارتن‌های پرفروش قفسه', icon: Package, badge: '۳۰٪ سود' },
                    { id: 'orders', label: 'سفارش‌ها و بارنامه باربری', icon: Truck, count: orders.length },
                  ].map(item => {
                    const Icon = item.icon;
                    const isActive = currentTab === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setTab(item.id)}
                        className={`w-full flex items-center rounded-2xl text-xs font-bold transition-all cursor-pointer relative group ${
                          isSidebarCollapsed
                            ? 'justify-center p-3'
                            : 'justify-between px-3.5 py-2.5'
                        } ${
                          isActive
                            ? 'bg-[#E06518] text-white shadow-md shadow-orange-500/20'
                            : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                        }`}
                        title={isSidebarCollapsed ? item.label : undefined}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className="w-4 h-4 shrink-0" />
                          {!isSidebarCollapsed && <span>{item.label}</span>}
                        </div>

                        {!isSidebarCollapsed && (
                          <div className="flex items-center gap-1.5">
                            {item.badge && (
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                isActive ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'
                              }`}>
                                {item.badge}
                              </span>
                            )}
                            {item.count !== undefined && item.count > 0 && (
                              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                                isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                              }`}>
                                {toPersianDigits(item.count)}
                              </span>
                            )}
                            {isActive && !item.badge && !item.count && <ChevronLeft className="w-4 h-4 opacity-70" />}
                          </div>
                        )}

                        {/* Collapsed Tooltip on Hover */}
                        {isSidebarCollapsed && (
                          <div className="absolute right-full mr-2 px-2.5 py-1 bg-slate-900 text-white text-[11px] font-bold rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-lg z-50">
                            {item.label}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SECTION 2: AI & INSIGHTS */}
              <div className="pt-2 border-t border-slate-200/60">
                {!isSidebarCollapsed && (
                  <div className="px-3 py-1 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    هوش مصنوعی و تحلیل بازار (AI & Insights)
                  </div>
                )}
                <div className="space-y-1 mt-1">
                  {[
                    { id: 'pricing', label: 'کرید اعتباری و تسویه چکی', icon: CreditCard, badge: '۴۵ روزه' },
                    { id: 'machinery', label: 'شناسنامه خطوط کارخانجات', icon: Cpu },
                    { id: 'marketing', label: 'معرف همکاران و پاداش ۲٪', icon: Share2, badge: 'کش‌بک' },
                    { id: 'merchandising', label: 'استند و تابلوی رایگان مغازه', icon: Sparkles, badge: 'رایگان' },
                  ].map(item => {
                    const Icon = item.icon;
                    const isActive = currentTab === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setTab(item.id)}
                        className={`w-full flex items-center rounded-2xl text-xs font-bold transition-all cursor-pointer relative group ${
                          isSidebarCollapsed
                            ? 'justify-center p-3'
                            : 'justify-between px-3.5 py-2.5'
                        } ${
                          isActive
                            ? 'bg-[#E06518] text-white shadow-md shadow-orange-500/20'
                            : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                        }`}
                        title={isSidebarCollapsed ? item.label : undefined}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className="w-4 h-4 shrink-0" />
                          {!isSidebarCollapsed && <span>{item.label}</span>}
                        </div>

                        {!isSidebarCollapsed && (
                          <div className="flex items-center gap-1.5">
                            {item.badge && (
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                isActive ? 'bg-white/20 text-white' : 'bg-orange-100 text-[#E06518]'
                              }`}>
                                {item.badge}
                              </span>
                            )}
                            {isActive && !item.badge && <ChevronLeft className="w-4 h-4 opacity-70" />}
                          </div>
                        )}

                        {/* Collapsed Tooltip on Hover */}
                        {isSidebarCollapsed && (
                          <div className="absolute right-full mr-2 px-2.5 py-1 bg-slate-900 text-white text-[11px] font-bold rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-lg z-50">
                            {item.label}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SECTION 3: REPORTS & SETTINGS */}
              <div className="pt-2 border-t border-slate-200/60">
                {!isSidebarCollapsed && (
                  <div className="px-3 py-1 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    گزارش‌ها و مدارک فنی (Reports & Settings)
                  </div>
                )}
                <div className="space-y-1 mt-1">
                  {[
                    { id: 'technical_docs', label: 'جدول گام تسمه‌ها و اسناد CAD', icon: BookOpen },
                    { id: 'inquiries', label: 'استعلام‌های قیمت همکار', icon: PhoneCall, count: pendingInquiriesCount },
                    { id: 'wishlist', label: 'اقلام نشان‌شده قفسه', icon: Heart, count: wishlist.length },
                    { id: 'tickets', label: 'پیام‌ها و پشتیبانی فروش', icon: MessageSquare, count: tickets.length },
                    { id: 'addresses', label: 'آدرس‌های مغازه و انبار', icon: MapPin },
                    { id: 'profile', label: 'پروانه کسب و مشخصات مغازه', icon: Building },
                  ].map(item => {
                    const Icon = item.icon;
                    const isActive = currentTab === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setTab(item.id)}
                        className={`w-full flex items-center rounded-2xl text-xs font-bold transition-all cursor-pointer relative group ${
                          isSidebarCollapsed
                            ? 'justify-center p-3'
                            : 'justify-between px-3.5 py-2.5'
                        } ${
                          isActive
                            ? 'bg-[#E06518] text-white shadow-md shadow-orange-500/20'
                            : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                        }`}
                        title={isSidebarCollapsed ? item.label : undefined}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className="w-4 h-4 shrink-0" />
                          {!isSidebarCollapsed && <span>{item.label}</span>}
                        </div>

                        {!isSidebarCollapsed && (
                          <div className="flex items-center gap-1.5">
                            {item.count !== undefined && item.count > 0 && (
                              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                                isActive ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800'
                              }`}>
                                {toPersianDigits(item.count)}
                              </span>
                            )}
                            {isActive && !item.count && <ChevronLeft className="w-4 h-4 opacity-70" />}
                          </div>
                        )}

                        {/* Collapsed Tooltip on Hover */}
                        {isSidebarCollapsed && (
                          <div className="absolute right-full mr-2 px-2.5 py-1 bg-slate-900 text-white text-[11px] font-bold rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-lg z-50">
                            {item.label}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* UPGRADE PRO CARD IN SIDEBAR (Expanded Only) */}
              {!isSidebarCollapsed && (
                <div className="pt-2">
                  <div className="rounded-3xl p-4 bg-gradient-to-br from-orange-50 via-amber-50/70 to-orange-100/60 border border-orange-200/80 shadow-[0_4px_20px_rgba(224,101,24,0.08)] space-y-2.5 text-right relative overflow-hidden">
                    <div className="flex items-center gap-2 text-slate-800 font-black text-xs">
                      <span className="p-1.5 rounded-xl bg-[#E06518] text-white shadow-xs">
                        <Award className="w-4 h-4" />
                      </span>
                      <span>ارتقا به عاملیت طلایی!</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      با افزایش سقف خرید چکی به ۲۵۰ میلیون تومان و تخفیف مضاعف ۵٪ کارتنی، سود فروشگاه خود را به اوج برسانید.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setTab('tickets');
                        setIsCreatingTicket(true);
                        setNewTicketSubject('درخواست ارتقا به عاملیت طلایی و افزایش سقف چک صیادی');
                      }}
                      className="w-full py-2.5 bg-gradient-to-r from-[#E06518] to-orange-500 hover:from-[#C95210] hover:to-orange-600 text-white font-bold text-xs rounded-xl shadow-md shadow-orange-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>ارتقای آنی عاملیت</span>
                    </button>
                  </div>
                </div>
              )}

            </div>
          </aside>

          {/* MAIN VIEW CANVAS (Expands to 100% full screen width) */}
          <main className="flex-1 min-w-0 w-full space-y-6">

            {/* TAB: DASHBOARD (Matching image.png Architecture) */}
            {currentTab === 'dashboard' && (
              <div className="space-y-6">

                {/* 0. DEDICATED MOBILE STORE IDENTITY & CREDIT STATUS CARD (Mobile Exclusive UI/UX) */}
                <div className="lg:hidden bg-gradient-to-br from-white via-orange-50/30 to-white backdrop-blur-xl p-4 rounded-3xl border border-orange-200/80 shadow-[0_8px_25px_rgba(224,101,24,0.06)] space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#E06518] to-orange-400 text-white flex items-center justify-center font-black text-sm shadow-md shadow-orange-500/20">
                        <Store className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-black text-slate-900 block truncate max-w-[150px]">
                            {activeUser.companyName || 'فروشگاه ابزار و قطعات پارس'}
                          </span>
                          <span className="text-[9px] bg-orange-100 text-[#E06518] px-1.5 py-0.2 rounded-md font-bold">
                            خرده‌فروش
                          </span>
                        </div>
                        <span className="text-[10px] text-emerald-600 font-bold block">
                          کد عاملیت: ATL-9842 | شعبه مرکزی
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsMobileSupportSheetOpen(true)}
                      className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-[10px] font-bold flex items-center gap-1 active:scale-95 transition-all cursor-pointer"
                    >
                      <Phone className="w-3 h-3 text-emerald-600" />
                      <span>تماس ناظر</span>
                    </button>
                  </div>

                  {/* Cheque Credit Usage Bar */}
                  <div className="bg-white/80 p-3 rounded-2xl border border-slate-100 space-y-1.5">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-slate-500 font-medium">سقف اعتبار چک صیادی (۴۵ روزه):</span>
                      <span className="font-mono font-black text-slate-900">۱۵۰,۰۰۰,۰۰۰ تومان</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-emerald-500 via-amber-400 to-[#E06518] rounded-full w-[65%]" />
                    </div>
                    <div className="flex justify-between items-center text-[9px] text-slate-400">
                      <span>استفاده‌شده: ۹۷.۵ م.ت</span>
                      <span className="text-emerald-600 font-bold">باقیمانده آزاد: ۵۲.۵ م.ت</span>
                    </div>
                  </div>

                  {/* 2 Quick Mobile Action Buttons */}
                  <div className="grid grid-cols-2 gap-2 pt-0.5">
                    <button
                      type="button"
                      onClick={() => setTab('countertop')}
                      className="py-2.5 px-3 bg-gradient-to-r from-[#E06518] to-orange-500 hover:from-[#C95210] active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Search className="w-3.5 h-3.5" />
                      <span>استعلام دخل مغازه</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setTab('shelf_packs')}
                      className="py-2.5 px-3 bg-white hover:bg-orange-50 active:scale-95 text-[#E06518] border border-orange-200 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                    >
                      <Package className="w-3.5 h-3.5" />
                      <span>کارتن‌های جور ۳۰٪</span>
                    </button>
                  </div>
                </div>

                {/* 1. TOP 4 GLASS METRIC CARDS (Responsive 2x2 on Mobile, 4x1 on Large) */}
                <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
                  {/* Metric Card 1: Gross Purchases / Turnover */}
                  <div className="bg-white/80 backdrop-blur-md rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-white/90 shadow-[0_10px_30px_rgba(0,0,0,0.03)] hover:shadow-[0_15px_35px_rgba(224,101,24,0.06)] transition-all space-y-2 sm:space-y-3 relative overflow-hidden text-right">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] sm:text-xs font-bold text-slate-500 truncate">گردش خرید (ARR)</span>
                      <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl sm:rounded-2xl bg-orange-50 text-[#E06518] border border-orange-200/60 flex items-center justify-center shadow-xs shrink-0">
                        <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </div>
                    </div>
                    <div className="space-y-0.5 sm:space-y-1">
                      <div className="text-lg sm:text-2xl font-black text-slate-900 font-mono tracking-tight">
                        ۴۸.۵ <span className="text-xs sm:text-sm font-bold text-slate-600">میلیون</span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-emerald-600">
                        <ArrowUpRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        <span>رشد ۱۰۰٪ پایدار</span>
                      </div>
                    </div>
                  </div>

                  {/* Metric Card 2: Registered Retail Customers / Customers */}
                  <div className="bg-white/80 backdrop-blur-md rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-white/90 shadow-[0_10px_30px_rgba(0,0,0,0.03)] hover:shadow-[0_15px_35px_rgba(0,0,0,0.05)] transition-all space-y-2 sm:space-y-3 relative overflow-hidden text-right">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] sm:text-xs font-bold text-slate-500 truncate">مشتریان مغازه</span>
                      <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl sm:rounded-2xl bg-blue-50 text-blue-600 border border-blue-200/60 flex items-center justify-center shadow-xs shrink-0">
                        <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </div>
                    </div>
                    <div className="space-y-0.5 sm:space-y-1">
                      <div className="text-lg sm:text-2xl font-black text-slate-900 font-mono tracking-tight">
                        ۲,۳۱۰ <span className="text-xs sm:text-sm font-bold text-slate-600">نفر</span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-emerald-600">
                        <ArrowUpRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        <span>+۴.۸٪ وفادار</span>
                      </div>
                    </div>
                  </div>

                  {/* Metric Card 3: Shop Spend / Spend */}
                  <div className="bg-white/80 backdrop-blur-md rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-white/90 shadow-[0_10px_30px_rgba(0,0,0,0.03)] hover:shadow-[0_15px_35px_rgba(0,0,0,0.05)] transition-all space-y-2 sm:space-y-3 relative overflow-hidden text-right">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] sm:text-xs font-bold text-slate-500 truncate">میانگین فاکتور</span>
                      <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl sm:rounded-2xl bg-amber-50 text-amber-600 border border-amber-200/60 flex items-center justify-center shadow-xs shrink-0">
                        <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </div>
                    </div>
                    <div className="space-y-0.5 sm:space-y-1">
                      <div className="text-lg sm:text-2xl font-black text-slate-900 font-mono tracking-tight">
                        ۵.۳ <span className="text-xs sm:text-sm font-bold text-slate-600">میلیون</span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-rose-600">
                        <ArrowDownRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        <span>-۲٪ خواب سرمایه</span>
                      </div>
                    </div>
                  </div>

                  {/* Metric Card 4: Net Retail Profit / Net Profit */}
                  <div className="bg-white/80 backdrop-blur-md rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-white/90 shadow-[0_10px_30px_rgba(0,0,0,0.03)] hover:shadow-[0_15px_35px_rgba(224,101,24,0.06)] transition-all space-y-2 sm:space-y-3 relative overflow-hidden text-right">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] sm:text-xs font-bold text-slate-500 truncate">حاشیه سود مغازه</span>
                      <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl sm:rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200/60 flex items-center justify-center shadow-xs shrink-0">
                        <PieChart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </div>
                    </div>
                    <div className="space-y-0.5 sm:space-y-1">
                      <div className="text-lg sm:text-2xl font-black text-[#E06518] font-mono tracking-tight">
                        ۲۸.۴٪ <span className="text-xs sm:text-sm font-bold text-slate-600">مارجین</span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-emerald-600">
                        <ArrowUpRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        <span>+۱.۲٪ سالیانه</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. MAIN SECTION (2-Column Grid matching image.png) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                  {/* LEFT COLUMN: Revenue Forecast Chart + Recent Activity (8 Cols) */}
                  <div className="lg:col-span-8 space-y-6">

                    {/* CHART CARD: Revenue Forecast / پیش‌بینی درآمد و تقاضای قطعات */}
                    <div className="bg-white/80 backdrop-blur-md rounded-3xl p-5 sm:p-6 border border-white/90 shadow-[0_10px_30px_rgba(0,0,0,0.03)] space-y-5 text-right">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                        <div className="space-y-0.5">
                          <h3 className="font-black text-sm text-slate-900">
                            روند فروش و پیش‌بینی تقاضای قطعات مغازه (Revenue Forecast)
                          </h3>
                          <p className="text-[11px] text-slate-400">
                            مقایسه ۶ ماه اخیر با پیش‌بینی هوش مصنوعی اطلس (Last 6 Months vs. AI Prediction)
                          </p>
                        </div>

                        {/* Legend Pills from image.png */}
                        <div className="flex items-center gap-3 text-xs font-bold flex-wrap">
                          <span className="flex items-center gap-1.5 text-slate-700">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#E06518]" />
                            <span>فروش واقعی (Actual)</span>
                          </span>
                          <span className="flex items-center gap-1.5 text-slate-700">
                            <span className="w-2.5 h-2.5 rounded-full bg-pink-500" />
                            <span>پیش‌بینی هوش مصنوعی (AI Prediction)</span>
                          </span>
                        </div>
                      </div>

                      {/* Smooth Bezier Curve Chart in SVG */}
                      <div className="relative pt-2 pb-2">
                        <div className="h-44 sm:h-48 w-full">
                          <svg className="w-full h-full overflow-visible" viewBox="0 0 600 180" preserveAspectRatio="none">
                            <defs>
                              <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#E06518" stopOpacity="0.25" />
                                <stop offset="100%" stopColor="#E06518" stopOpacity="0.0" />
                              </linearGradient>

                              <linearGradient id="aiGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#EC4899" stopOpacity="0.18" />
                                <stop offset="100%" stopColor="#EC4899" stopOpacity="0.0" />
                              </linearGradient>
                            </defs>

                            <line x1="0" y1="30" x2="600" y2="30" stroke="#E2E8F0" strokeDasharray="3 3" strokeWidth="1" />
                            <line x1="0" y1="75" x2="600" y2="75" stroke="#E2E8F0" strokeDasharray="3 3" strokeWidth="1" />
                            <line x1="0" y1="120" x2="600" y2="120" stroke="#E2E8F0" strokeDasharray="3 3" strokeWidth="1" />
                            <line x1="0" y1="165" x2="600" y2="165" stroke="#E2E8F0" strokeWidth="1" />

                            <path
                              d="M 10 140 C 90 145, 140 100, 200 95 C 260 90, 290 85, 340 70 C 390 55, 450 65, 510 40 C 550 25, 580 20, 595 18 L 595 165 L 10 165 Z"
                              fill="url(#aiGradient)"
                            />
                            <path
                              d="M 10 140 C 90 145, 140 100, 200 95 C 260 90, 290 85, 340 70 C 390 55, 450 65, 510 40 C 550 25, 580 20, 595 18"
                              fill="none"
                              stroke="#EC4899"
                              strokeWidth="3"
                              strokeLinecap="round"
                            />

                            <path
                              d="M 10 150 C 70 140, 130 115, 180 110 C 230 105, 280 120, 335 80 C 390 45, 430 75, 490 65 C 540 55, 575 50, 595 48 L 595 165 L 10 165 Z"
                              fill="url(#actualGradient)"
                            />
                            <path
                              d="M 10 150 C 70 140, 130 115, 180 110 C 230 105, 280 120, 335 80 C 390 45, 430 75, 490 65 C 540 55, 575 50, 595 48"
                              fill="none"
                              stroke="#E06518"
                              strokeWidth="3.5"
                              strokeLinecap="round"
                            />

                            <circle cx="335" cy="80" r="4.5" fill="#E06518" stroke="#FFFFFF" strokeWidth="2.5" />
                            <circle cx="340" cy="70" r="4.5" fill="#EC4899" stroke="#FFFFFF" strokeWidth="2.5" />
                            <circle cx="595" cy="48" r="5" fill="#E06518" stroke="#FFFFFF" strokeWidth="2.5" />
                            <circle cx="595" cy="18" r="5" fill="#EC4899" stroke="#FFFFFF" strokeWidth="2.5" />
                          </svg>
                        </div>

                        {/* Months Horizontal Axis */}
                        <div className="flex justify-between text-[10px] sm:text-[11px] font-bold text-slate-400 pt-2 px-1">
                          <span>فروردین (Jan)</span>
                          <span>اردیبهشت (Feb)</span>
                          <span>خرداد (Mar)</span>
                          <span>تیر (Apr)</span>
                          <span>مرداد (May)</span>
                          <span>شهریور (Jun)</span>
                        </div>
                      </div>
                    </div>

                    {/* RECENT ACTIVITY TABLE CARD (Matching image.png) */}
                    <div className="bg-white/80 backdrop-blur-md rounded-3xl p-5 sm:p-6 border border-white/90 shadow-[0_10px_30px_rgba(0,0,0,0.03)] space-y-4 text-right">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                        <div className="space-y-0.5">
                          <h3 className="font-black text-sm text-slate-900">
                            فعالیت‌ها و تراکنش‌های اخیر فروشگاه (Recent Activity)
                          </h3>
                          <p className="text-[11px] text-slate-400">
                            پایش خودکار رویدادها، بارنامه‌ها و سفارش‌های قفسه توسط هوش مصنوعی
                          </p>
                        </div>

                        {/* Filter Pills from image.png */}
                        <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-2xl border border-slate-200/60 self-start sm:self-auto">
                          <button
                            type="button"
                            onClick={() => setActivityFilter('7d')}
                            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              activityFilter === '7d' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                            }`}
                          >
                            ۷ روز گذشته
                          </button>
                          <button
                            type="button"
                            onClick={() => setActivityFilter('30d')}
                            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              activityFilter === '30d' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                            }`}
                          >
                            ۳۰ روز گذشته
                          </button>
                          <button
                            type="button"
                            onClick={() => setActivityFilter('all')}
                            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              activityFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                            }`}
                          >
                            همه
                          </button>
                        </div>
                      </div>

                      {/* Clean Activity Data Table */}
                      <div className="overflow-x-auto">
                        <table className="w-full text-right text-xs">
                          <thead>
                            <tr className="text-slate-400 border-b border-slate-100 text-[11px]">
                              <th className="pb-2.5 font-bold">تاریخ</th>
                              <th className="pb-2.5 font-bold">رویداد / سفارش</th>
                              <th className="pb-2.5 font-bold">تحلیل هوش مصنوعی (AI Note)</th>
                              <th className="pb-2.5 font-bold text-left">مبلغ فاکتور</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            <tr className="hover:bg-slate-50/60 transition-colors">
                              <td className="py-3 font-mono text-slate-500 text-[11px]">۱۴۰۴/۰۷/۱۰</td>
                              <td className="py-3 font-bold text-slate-800">
                                ثبت سفارش کارتن جور تسمه FORZA
                              </td>
                              <td className="py-3 text-emerald-700 font-medium">
                                پیش‌بینی حاشیه سود +۲۶٪ با فروش در بازار محلی
                              </td>
                              <td className="py-3 font-mono font-bold text-slate-900 text-left">
                                {formatPrice(9800000)}
                              </td>
                            </tr>
                            <tr className="hover:bg-slate-50/60 transition-colors">
                              <td className="py-3 font-mono text-slate-500 text-[11px]">۱۴۰۴/۰۷/۰۵</td>
                              <td className="py-3 font-bold text-slate-800">
                                صدور بارنامه باربری وطن (BR-84920)
                              </td>
                              <td className="py-3 text-blue-700 font-medium">
                                تحویل سریع به انبار باربری؛ بدون هزینه ترابری
                              </td>
                              <td className="py-3 font-mono font-bold text-slate-900 text-left">
                                {formatPrice(14500000)}
                              </td>
                            </tr>
                            <tr className="hover:bg-slate-50/60 transition-colors">
                              <td className="py-3 font-mono text-slate-500 text-[11px]">۱۴۰۴/۰۶/۲۸</td>
                              <td className="py-3 font-bold text-slate-800">
                                ثبت چک صیادی بنفش ۴۵ روزه
                              </td>
                              <td className="py-3 text-amber-700 font-medium">
                                سقف اعتبار باز باقیمانده: ۱۱۰ میلیون تومان
                              </td>
                              <td className="py-3 font-mono font-bold text-slate-900 text-left">
                                {formatPrice(40000000)}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                  </div>

                  {/* RIGHT COLUMN: AI Alerts & Recommendations (4 Cols matching image.png) */}
                  <div className="lg:col-span-4 space-y-4">
                    <div className="bg-white/80 backdrop-blur-md rounded-3xl p-5 sm:p-6 border border-white/90 shadow-[0_10px_30px_rgba(0,0,0,0.03)] space-y-4 text-right">
                      <div className="border-b border-slate-100 pb-3 space-y-0.5">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-[#E06518]" />
                          <h3 className="font-black text-sm text-slate-900">
                            هشدارهای هوشمند و توصیه‌ها (AI Alerts & Recs)
                          </h3>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          پایش زنده و مستمر تقاضا، کسری قفسه و نوسان قیمت بازار ابزار
                        </p>
                      </div>

                      {/* Stack of AI Alert Cards with High/Medium Priority Badges */}
                      <div className="space-y-3">
                        <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200/80 space-y-2 hover:bg-rose-50 transition-colors">
                          <div className="flex items-center justify-between">
                            <span className="font-black text-xs text-rose-900">افزایش ناگهانی تقاضای تسمه A-45</span>
                            <span className="px-2 py-0.5 rounded-full bg-rose-200 text-rose-800 font-bold text-[10px]">
                              High
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 leading-relaxed">
                            تقاضای کارخانجات نساجی و کاشی منطقه برای سایزهای A-45 تا A-54 افزایش یافته؛ موجودی قفسه شما تا ۳ روز دیگر به اتمام می‌رسد.
                          </p>
                          <div className="pt-1 flex items-center justify-between text-xs">
                            <button
                              type="button"
                              onClick={() => setTab('shelf_packs')}
                              className="font-bold text-[#E06518] hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <span>سفارش سریع کارتن جور</span>
                              <ChevronLeft className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-2 hover:bg-emerald-50 transition-colors">
                          <div className="flex items-center justify-between">
                            <span className="font-black text-xs text-emerald-900">تخفیف کارتنی فصل اورهال (۱۲٪)</span>
                            <span className="px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-800 font-bold text-[10px]">
                              High
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 leading-relaxed">
                            با پیش‌خرید پکیج ۳۰ عددی بلبرینگ‌های شیارعمیق، سود ناخالص هر قطعه از ۲۲٪ به ۳۱٪ افزایش خواهد یافت.
                          </p>
                          <div className="pt-1">
                            <button
                              type="button"
                              onClick={() => setTab('shelf_packs')}
                              className="font-bold text-emerald-700 hover:underline flex items-center gap-1 cursor-pointer text-xs"
                            >
                              <span>مشاهده پکیج‌های تخفیف‌دار</span>
                              <ChevronLeft className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-2 hover:bg-amber-50 transition-colors">
                          <div className="flex items-center justify-between">
                            <span className="font-black text-xs text-amber-900">سررسید چک صیادی ۴۵ روزه</span>
                            <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-800 font-bold text-[10px]">
                              Medium
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 leading-relaxed">
                            چک صیادی فاکتور شماره INV-772 تا ۱۰ روز کاری دیگر سررسید می‌شود. امکان تمدید اعتبار با ثبت چک جدید در سامانه صیاد.
                          </p>
                          <div className="pt-1">
                            <button
                              type="button"
                              onClick={() => setTab('pricing')}
                              className="font-bold text-amber-800 hover:underline flex items-center gap-1 cursor-pointer text-xs"
                            >
                              <span>مدیریت تراز اعتباری</span>
                              <ChevronLeft className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200/80 space-y-2 hover:bg-blue-50 transition-colors">
                          <div className="flex items-center justify-between">
                            <span className="font-black text-xs text-blue-900">درخواست استند ایستاده FORZA</span>
                            <span className="px-2 py-0.5 rounded-full bg-blue-200 text-blue-800 font-bold text-[10px]">
                              Free
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 leading-relaxed">
                            استند ۴ ردیفه فلزی چرخ‌دار ویژه مغازه شما آماده ارسال رایگان با محموله باربری بعدی می‌باشد.
                          </p>
                          <div className="pt-1">
                            <button
                              type="button"
                              onClick={() => setTab('merchandising')}
                              className="font-bold text-blue-700 hover:underline flex items-center gap-1 cursor-pointer text-xs"
                            >
                              <span>تأیید ارسال استند مغازه</span>
                              <ChevronLeft className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <DedicatedEngineerCard
                      onOpenTicketWithEmergency={() => {
                        setTab('tickets');
                        setIsCreatingTicket(true);
                        setNewTicketSubject('استعلام کسری قطعه مشتری داخل مغازه');
                      }}
                    />
                  </div>

                </div>

              </div>
            )}

            {/* TAB: COUNTERTOP LOOKUP */}
            {currentTab === 'countertop' && (
              <RetailCountertopLookup />
            )}

            {/* TAB: FAST-MOVING SHELF PACKS */}
            {currentTab === 'shelf_packs' && (
              <RetailFastMovingPacks />
            )}

            {/* TAB: POS & MERCHANDISING */}
            {currentTab === 'merchandising' && (
              <RetailPosMerchandising />
            )}

            {/* TAB: ORDERS & FREIGHT */}
            {currentTab === 'orders' && (
              <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-white/90 p-5 sm:p-6 shadow-[0_10px_30px_rgba(0,0,0,0.03)] space-y-5 text-right">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Truck className="w-5 h-5 text-[#E06518]" />
                    <h2 className="font-black text-sm text-slate-800">سفارش‌های فروشگاه، بارنامه باربری و تحویل بار</h2>
                  </div>

                  <div className="flex flex-wrap gap-1.5 text-xs">
                    {[
                      { id: 'all', label: 'همه سفارش‌ها' },
                      { id: 'registered', label: 'ثبت‌شده' },
                      { id: 'processing', label: 'آماده‌سازی کارتن در انبار' },
                      { id: 'shipped', label: 'ارسال‌شده به باربری' },
                      { id: 'delivered', label: 'تحویل‌شده در مغازه' },
                    ].map(f => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setOrderStatusFilter(f.id)}
                        className={`px-3 py-1.5 rounded-xl font-bold text-[11px] transition-all cursor-pointer ${
                          orderStatusFilter === f.id
                            ? 'bg-[#E06518] text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                {filteredOrders.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400">سفارشی در این وضعیت یافت نشد.</div>
                ) : (
                  <div className="space-y-4">
                    {filteredOrders.map(order => (
                      <div
                        key={order.id}
                        className="border border-slate-200/80 rounded-2xl p-4 bg-white/70 hover:bg-white space-y-3 shadow-2xs hover:shadow-sm transition-all"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5 text-xs">
                          <div className="flex items-center gap-3">
                            <span className="font-mono font-bold text-slate-900 text-sm">{order.orderNumber}</span>
                            <span className="text-[11px] text-slate-400">{order.createdAt}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                                order.status === 'delivered'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : order.status === 'shipped'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-orange-100 text-[#C95210]'
                              }`}
                            >
                              {order.status === 'delivered'
                                ? 'تحویل به مغازه'
                                : order.status === 'shipped'
                                ? 'ارسال‌شده با بارنامه رسمی'
                                : 'آماده‌سازی کارتن‌ها در انبار مرکزی'}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          {order.items.map(item => (
                            <div key={item.productCode} className="p-2.5 bg-slate-50/80 rounded-xl flex items-center justify-between border border-slate-100">
                              <div className="truncate pl-2">
                                <span className="font-mono font-bold text-[#E06518] ml-1">{item.productCode}</span>
                                <span className="text-slate-700">{item.productName}</span>
                              </div>
                              <span className="font-bold shrink-0 text-slate-800 font-mono">
                                {toPersianDigits(item.quantity)} {item.unit}
                              </span>
                            </div>
                          ))}
                        </div>

                        <div className="p-3 bg-slate-50/90 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-600 border border-slate-200/60">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Truck className="w-4 h-4 text-[#E06518]" />
                            <span>ترابری صادرکننده: <strong className="text-slate-800">باربری وطن (ترابری مرکزی یزد)</strong></span>
                            <span>|</span>
                            <span>شماره بارنامه: <strong className="font-mono text-[#E06518] font-bold">BR-84920</strong></span>
                          </div>
                          <div>
                            آدرس تحویل: <strong className="text-slate-700">{order.shippingAddress}</strong>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-xs">
                          <div className="text-left font-black text-sm text-slate-900 font-mono">
                            مبلغ نهایی فاکتور: {formatPrice(order.finalAmount)}
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
                            <button
                              type="button"
                              onClick={() => handleReorderPastOrder(order)}
                              className="px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-[#C95210] border border-orange-200 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                              <span>سفارش مجدد کل اقلام</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setSelectedOrderForTimeline(order)}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              <Clock className="w-3.5 h-3.5 text-[#E06518]" />
                              <span>رهگیری بارنامه</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setSelectedOrderForInvoice(order)}
                              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              <span>فاکتور رسمی</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB: MACHINERY */}
            {currentTab === 'machinery' && (
              <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-white/90 p-5 sm:p-6 shadow-[0_10px_30px_rgba(0,0,0,0.03)]">
                <PlantMachineryPassport />
              </div>
            )}

            {/* TAB: MARKETING */}
            {currentTab === 'marketing' && (
              <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-white/90 p-5 sm:p-6 shadow-[0_10px_30px_rgba(0,0,0,0.03)]">
                <CustomerMarketingHub />
              </div>
            )}

            {/* TAB: TECHNICAL DOCS */}
            {currentTab === 'technical_docs' && (
              <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-white/90 p-5 sm:p-6 shadow-[0_10px_30px_rgba(0,0,0,0.03)]">
                <TechnicalDocsVault />
              </div>
            )}

            {/* TAB: PRICING & CREDIT */}
            {currentTab === 'pricing' && (
              <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-white/90 p-5 sm:p-6 shadow-[0_10px_30px_rgba(0,0,0,0.03)] space-y-6 text-right">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <div className="flex items-center gap-2 font-black text-sm sm:text-base text-slate-900">
                      <Award className="w-5 h-5 text-[#E06518]" />
                      <span>کرید اعتباری مغازه‌داران و تسویه چکی صیادی</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      قیمت‌های محصولات در وب‌سایت با کسر تخفیف پخش و عاملیت خرده‌فروشی محاسبه و امکان تسویه چکی ۴۵ تا ۶۰ روزه فراهم است.
                    </p>
                  </div>
                  <Link
                    to="/products"
                    className="text-xs font-bold px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white flex items-center gap-1.5 transition-colors self-start sm:self-auto shrink-0 shadow-xs"
                  >
                    <Package className="w-4 h-4 text-[#E06518]" />
                    <span>کاتالوگ کامل قطعات</span>
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-2xl bg-orange-50/80 border border-orange-200 text-right space-y-1">
                    <span className="text-[11px] text-[#777A7D] font-bold">سطح همکاری فروشگاه:</span>
                    <div className="text-xl font-black text-[#E06518]">عاملیت توزیع خرده‌فروشی</div>
                    <span className="text-[10px] text-slate-500 block">تخفیف همکاری کارتن و بسته</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-right space-y-1">
                    <span className="text-[11px] text-slate-500 font-bold">روش تسویه فاکتورها:</span>
                    <div className="text-lg font-black text-slate-800">چک صیادی بنفش ۴۵ الی ۶۰ روزه</div>
                    <span className="text-[10px] text-emerald-700 font-semibold block">
                      بدون سود و کارمزد اضافی
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-right space-y-1">
                    <span className="text-[11px] text-emerald-800 font-bold">سقف اعتبار باز مغازه:</span>
                    <div className="text-xl font-black text-emerald-700 font-mono">۱۵۰,۰۰۰,۰۰۰ تومان</div>
                    <span className="text-[10px] text-emerald-800 block">بدون نیاز به پیش‌پرداخت نقدی</span>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center gap-2 text-slate-800 font-bold text-xs">
                    <Sparkles className="w-4 h-4 text-[#E06518]" />
                    <span>مزایای ویژه فروشگاه‌های همکار در سراسر کشور:</span>
                  </div>
                  <div className="pt-2 flex flex-wrap items-center gap-3 text-xs">
                    <div className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 shadow-2xs">
                      حاشیه سود مغازه: <strong className="text-emerald-600 font-mono">تا ۳۲٪</strong>
                    </div>
                    <div className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 shadow-2xs">
                      گارانتی تعویض ۶ ماهه: <strong className="text-blue-600">۱۰۰٪ با ضمانت کارخانه اطلس</strong>
                    </div>
                    <div className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 shadow-2xs">
                      تحویل رایگان در باربری: <strong className="text-slate-800">ارسال از انبار مرکزی یزد و تهران</strong>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: INQUIRIES */}
            {currentTab === 'inquiries' && (
              <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-white/90 p-5 sm:p-6 shadow-[0_10px_30px_rgba(0,0,0,0.03)] space-y-5 text-right">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2 font-black text-sm text-slate-800">
                    <PhoneCall className="w-5 h-5 text-[#E06518]" />
                    <span>استعلام‌های قیمت همکار و اقلام سفارشی</span>
                  </div>
                  <Link
                    to="/products"
                    className="px-3.5 py-1.5 bg-[#E06518] hover:bg-[#C95210] text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                  >
                    استعلام قطعه جدید
                  </Link>
                </div>

                <div className="space-y-3">
                  {inquiries.map(inq => {
                    const isAnswered = inq.status === 'answered';
                    return (
                      <div
                        key={inq.id}
                        className={`p-4 rounded-2xl border transition-all ${
                          isAnswered ? 'border-emerald-200 bg-emerald-50/40' : 'border-amber-200 bg-amber-50/40'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-sm text-[#E06518]">{inq.product.code}</span>
                              <span className="font-bold text-slate-800">{inq.product.name}</span>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  isAnswered ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {isAnswered ? 'قیمت همکار اعلام شد' : 'در حال بررسی انبار'}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500">
                              تعداد: <strong className="text-slate-700">{toPersianDigits(inq.quantity)} {inq.product.unit}</strong> | تاریخ: {inq.date}
                            </div>
                          </div>

                          <div className="flex flex-col sm:items-end gap-2 shrink-0">
                            {isAnswered ? (
                              <>
                                <div className="text-left">
                                  <div className="text-[10px] text-slate-400">قیمت خرید همکار شما:</div>
                                  <div className="text-sm font-black text-emerald-700 font-mono">
                                    {formatPrice(inq.answeredPrice || 5100000)}
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    addToCart({ ...inq.product, inquiryOnly: false, prices: { ...inq.product.prices, retail: inq.answeredPrice || 5100000 } }, inq.quantity);
                                    setTab('orders');
                                  }}
                                  className="px-4 py-2 bg-[#E06518] hover:bg-[#C95210] text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs cursor-pointer transition-all"
                                >
                                  <ShoppingBag className="w-4 h-4" />
                                  <span>افزودن به سبد سفارش مغازه</span>
                                </button>
                              </>
                            ) : (
                              <div className="text-amber-700 text-xs font-semibold flex items-center gap-1">
                                <Clock className="w-4 h-4 animate-spin" />
                                <span>انبار در حال بررسی موجودی کارتن است...</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB: WISHLIST */}
            {(currentTab === 'favorites' || currentTab === 'wishlist') && (
              <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-white/90 p-5 sm:p-6 shadow-[0_10px_30px_rgba(0,0,0,0.03)] space-y-5 text-right">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2 font-black text-sm text-slate-800">
                    <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
                    <span>اقلام پرتقاضای نشان‌شده برای مغازه ({toPersianDigits(wishlist.length)})</span>
                  </div>

                  <Link
                    to="/wishlist"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#E06518] hover:text-[#C95210] bg-orange-50 px-3 py-1.5 rounded-xl border border-orange-200 transition-colors w-fit"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>مشاهده در صفحه مستقل</span>
                  </Link>
                </div>

                {wishlistProducts.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400">
                    هیچ محصولی در لیست علاقه‌مندی‌ها نشان نشده است.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {wishlistProducts.map(prod => (
                      <div
                        key={prod.code}
                        className="p-4 rounded-2xl border border-slate-200/80 bg-white hover:border-orange-300 transition-all flex items-start gap-3.5 text-xs shadow-2xs hover:shadow-xs"
                      >
                        <div className="w-16 h-16 rounded-xl bg-slate-50 border border-slate-200 shrink-0 overflow-hidden p-1 flex items-center justify-center">
                          {prod.images[0] ? (
                            <ProductImage src={prod.images[0]} alt={prod.name} className="w-full h-full object-contain" />
                          ) : (
                            <Layers className="w-6 h-6 text-slate-300" />
                          )}
                        </div>

                        <div className="space-y-1 flex-1 min-w-0">
                          <div className="font-mono text-[10px] text-slate-400">{prod.code} | {prod.brand}</div>
                          <Link
                            to={`/product/${prod.code}`}
                            className="font-bold text-slate-800 hover:text-[#E06518] line-clamp-1"
                          >
                            {prod.name}
                          </Link>
                          <div className="text-sm font-black text-slate-900 font-mono">
                            {formatPrice(prod.prices.retail)}
                          </div>

                          <div className="flex items-center gap-2 pt-2">
                            <button
                              type="button"
                              onClick={() => addToCart(prod, 1)}
                              className="px-3 py-1.5 bg-[#E06518] hover:bg-[#C95210] text-white rounded-xl font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-all shadow-2xs"
                            >
                              <ShoppingBag className="w-3.5 h-3.5" />
                              <span>سفارش برای قفسه</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => toggleWishlist(prod.code)}
                              className="p-1.5 text-slate-400 hover:text-rose-500 rounded-xl hover:bg-slate-100"
                              title="حذف"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB: ADDRESSES */}
            {currentTab === 'addresses' && (
              <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-white/90 p-5 sm:p-6 shadow-[0_10px_30px_rgba(0,0,0,0.03)] space-y-5 text-right">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2 font-black text-sm text-slate-800">
                    <MapPin className="w-5 h-5 text-[#E06518]" />
                    <span>آدرس‌های مغازه و انبار تحویل باربری ({toPersianDigits(addresses.length)})</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleOpenAddAddress}
                    className="px-3.5 py-2 bg-[#E06518] hover:bg-[#C95210] text-white font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer transition-all shadow-xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>افزودن آدرس شعبه جدید</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {addresses.map(addr => (
                    <div
                      key={addr.id}
                      className={`p-4 rounded-2xl border text-xs space-y-2 transition-all ${
                        addr.isDefault ? 'border-orange-300 bg-orange-50/40 shadow-xs' : 'border-slate-200 bg-white/70'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-800">{addr.title}</span>
                          {addr.isDefault && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                              آدرس پیش‌فرض تحویل بارنامه
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {!addr.isDefault && (
                            <button
                              type="button"
                              onClick={() => setDefaultAddress(addr.id)}
                              className="text-[11px] text-[#E06518] hover:underline cursor-pointer font-bold"
                            >
                              انتخاب به عنوان پیش‌فرض
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleOpenEditAddress(addr)}
                            className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100 cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteAddress(addr.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-100 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <p className="text-slate-600 leading-relaxed">
                        {addr.province}، {addr.city}، {addr.fullAddress}
                      </p>

                      <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 pt-1">
                        <span>تحویل‌گیرنده: <strong className="text-slate-800">{addr.recipientName}</strong></span>
                        <span>تلفن: <span className="font-mono text-slate-700">{addr.recipientPhone}</span></span>
                        {addr.postalCode && <span>کدپستی: <span className="font-mono text-slate-700">{addr.postalCode}</span></span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: TICKETS */}
            {currentTab === 'tickets' && (
              <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-white/90 p-5 sm:p-6 shadow-[0_10px_30px_rgba(0,0,0,0.03)] space-y-6 text-right">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2 font-black text-sm text-slate-800">
                    <MessageSquare className="w-5 h-5 text-[#E06518]" />
                    <span>پیام‌ها و پشتیبانی مستقیم امور فروشگاه‌ها</span>
                  </div>

                  {!isCreatingTicket && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsCreatingTicket(true);
                        setActiveTicket(null);
                      }}
                      className="px-3.5 py-2 bg-[#E06518] hover:bg-[#C95210] text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer transition-all shadow-xs"
                    >
                      <Plus className="w-4 h-4" />
                      <span>ارسال پیام جدید</span>
                    </button>
                  )}
                </div>

                {isCreatingTicket && (
                  <form onSubmit={handleCreateTicket} className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200 space-y-3 text-xs">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <h3 className="font-bold text-slate-800">ارسال پیام جدید به امور فروشگاه‌ها</h3>
                      <button
                        type="button"
                        onClick={() => setIsCreatingTicket(false)}
                        className="text-slate-400 hover:text-rose-500 cursor-pointer"
                      >
                        بستن
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2">
                        <label className="block font-medium text-slate-700 mb-1">موضوع پیام:</label>
                        <input
                          type="text"
                          value={newTicketSubject}
                          onChange={e => setNewTicketSubject(e.target.value)}
                          placeholder="مثلاً درخواست تخفیف کارتن یا ارسال استند"
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-[#E06518]"
                          required
                        />
                      </div>

                      <div>
                        <label className="block font-medium text-slate-700 mb-1">واحد مربوطه:</label>
                        <select
                          value={newTicketDept}
                          onChange={e => setNewTicketDept(e.target.value as any)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-[#E06518]"
                        >
                          <option value="sales">واحد فروش و امور همکاران</option>
                          <option value="technical">پشتیبانی فنی و مهندسی</option>
                          <option value="agency">امور عاملیت‌ها و استند</option>
                          <option value="support">پیگیری باربری و انبار</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block font-medium text-slate-700 mb-1">متن پیام:</label>
                      <textarea
                        rows={3}
                        value={newTicketMsg}
                        onChange={e => setNewTicketMsg(e.target.value)}
                        placeholder="پیام یا درخواست خود را بنویسید..."
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-none focus:border-[#E06518]"
                        required
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="submit"
                        className="px-5 py-2 bg-[#E06518] hover:bg-[#C95210] text-white font-bold rounded-xl cursor-pointer transition-colors shadow-xs"
                      >
                        ارسال پیام
                      </button>
                    </div>
                  </form>
                )}

                {activeTicket ? (
                  <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm space-y-3 bg-white">
                    <div className="bg-slate-800 text-white p-4 flex items-center justify-between text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-orange-400">{activeTicket.ticketNumber}</span>
                          <span className="font-bold text-sm">{activeTicket.subject}</span>
                        </div>
                        <div className="text-[11px] text-slate-300 mt-0.5">
                          واحد: {activeTicket.department} | وضعیت:{' '}
                          {activeTicket.status === 'answered' ? 'پاسخ داده شده' : 'در حال پیگیری'}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setActiveTicket(null)}
                        className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl cursor-pointer text-xs"
                      >
                        بازگشت به لیست
                      </button>
                    </div>

                    <div className="p-4 space-y-3 max-h-[400px] overflow-y-auto">
                      {activeTicket.messages?.map(m => (
                        <div
                          key={m.id}
                          className={`p-3 rounded-2xl max-w-[85%] text-xs space-y-1 ${
                            m.sender === 'user'
                              ? 'bg-orange-50 border border-orange-200 mr-auto text-right'
                              : 'bg-slate-100 border border-slate-200 ml-auto text-right'
                          }`}
                        >
                          <div className="flex items-center justify-between text-[11px] font-bold">
                            <span className={m.sender === 'user' ? 'text-[#C95210]' : 'text-slate-800'}>
                              {m.senderName}
                            </span>
                            <span className="text-[10px] text-slate-400 font-normal">{m.timestamp}</span>
                          </div>
                          <p className="leading-relaxed text-slate-700">{m.message}</p>
                        </div>
                      ))}
                    </div>

                    <form onSubmit={handleSendTicketReply} className="p-4 border-t border-slate-100 bg-slate-50 flex gap-2">
                      <input
                        type="text"
                        value={ticketReplyText}
                        onChange={e => setTicketReplyText(e.target.value)}
                        placeholder="پاسخ خود را بنویسید..."
                        className="flex-1 h-10 px-3.5 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-[#E06518]"
                      />
                      <button
                        type="submit"
                        className="px-5 h-10 bg-[#E06518] hover:bg-[#C95210] text-white font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                      >
                        <Send className="w-4 h-4" />
                        <span>ارسال</span>
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {tickets.map(ticket => (
                      <div
                        key={ticket.id}
                        onClick={() => setActiveTicket(ticket)}
                        className="p-4 rounded-2xl border border-slate-200 bg-white/70 hover:bg-white hover:border-orange-300 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-2xs hover:shadow-xs"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded-md border border-slate-200">
                              {ticket.ticketNumber}
                            </span>
                            <span className="font-bold text-slate-900 text-sm">{ticket.subject}</span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                ticket.status === 'answered'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {ticket.status === 'answered' ? 'پاسخ داده شده' : 'در انتظار بررسی'}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400">
                            واحد: {ticket.department === 'technical' ? 'فنی و مهندسی' : 'فروش و همکاران'} | تاریخ: {ticket.lastReplyAt}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-[#E06518] font-bold text-xs">
                          <span>مشاهده گفتگو ({toPersianDigits(ticket.messages?.length || 1)} پیام)</span>
                          <ChevronLeft className="w-4 h-4" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB: PROFILE & LICENSE */}
            {currentTab === 'profile' && (
              <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-white/90 p-5 sm:p-6 shadow-[0_10px_30px_rgba(0,0,0,0.03)] space-y-5 text-right">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2 font-black text-sm text-slate-800">
                    <Building className="w-5 h-5 text-[#E06518]" />
                    <span>مشخصات پروانه کسب، فروشگاه ابزار و اطلاعات حقوقی</span>
                  </div>
                </div>

                {profileSavedFeedback && (
                  <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 text-xs flex items-center gap-2 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>اطلاعات فروشگاه با موفقیت ذخیره شد.</span>
                  </div>
                )}

                <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-medium text-slate-700 mb-1">کد مشتری اختصاصی فروشگاه:</label>
                      <input
                        type="text"
                        dir="ltr"
                        value={activeUser.username || 'ATL-SHOP-4482'}
                        disabled
                        className="w-full px-3 py-2.5 border border-slate-200 bg-slate-100 rounded-xl text-[#E06518] font-mono font-bold text-left"
                      />
                    </div>

                    <div>
                      <label className="block font-medium text-slate-700 mb-1">نام صاحب فروشگاه / پروانه کسب:</label>
                      <input
                        type="text"
                        value={profileName}
                        onChange={e => setProfileName(e.target.value)}
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-slate-800 bg-white focus:outline-none focus:border-[#E06518]"
                        required
                      />
                    </div>

                    <div>
                      <label className="block font-medium text-slate-700 mb-1">شماره همراه تأییدشده:</label>
                      <input
                        type="text"
                        dir="ltr"
                        value={activeUser.phone || ''}
                        disabled
                        className="w-full px-3 py-2.5 border border-slate-200 bg-slate-100 rounded-xl text-slate-500 font-mono text-left"
                      />
                    </div>

                    <div>
                      <label className="block font-medium text-slate-700 mb-1">ایمیل مغازه (جهت پیش‌فاکتور رسمی):</label>
                      <input
                        type="email"
                        dir="ltr"
                        value={profileEmail}
                        onChange={e => setProfileEmail(e.target.value)}
                        placeholder="shop@sanatpish.ir"
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-slate-800 bg-white text-left focus:outline-none focus:border-[#E06518]"
                      />
                    </div>

                    <div>
                      <label className="block font-medium text-slate-700 mb-1">نام فروشگاه / تابلوی سردر مغازه:</label>
                      <input
                        type="text"
                        value={profileCompany}
                        onChange={e => setProfileCompany(e.target.value)}
                        placeholder="ابزار و قطعات صنعتی پارس"
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-slate-800 bg-white focus:outline-none focus:border-[#E06518]"
                      />
                    </div>

                    <div>
                      <label className="block font-medium text-slate-700 mb-1">استان و شهر فروشگاه:</label>
                      <div className="w-full px-3 py-2.5 border border-slate-200 bg-slate-100 rounded-xl text-slate-700">
                        {activeUser.province || 'یزد'} - {activeUser.city || 'یزد'}
                      </div>
                    </div>

                    <div>
                      <label className="block font-medium text-slate-700 mb-1">صنف و رسته کاری:</label>
                      <div className="w-full px-3 py-2.5 border border-slate-200 bg-slate-100 rounded-xl text-slate-700 font-bold">
                        فروشگاه ابزار و قطعات صنعتی و تسمه
                      </div>
                    </div>

                    <div>
                      <label className="block font-medium text-slate-700 mb-1">شماره پروانه کسب یا کد ملی:</label>
                      <input
                        type="text"
                        dir="ltr"
                        value={profileEconomicCode}
                        onChange={e => setProfileEconomicCode(e.target.value)}
                        placeholder="411432819942"
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-slate-800 font-mono text-left bg-white focus:outline-none focus:border-[#E06518]"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-3">
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-[#E06518] hover:bg-[#C95210] text-white font-bold rounded-xl shadow-md transition-colors cursor-pointer"
                    >
                      ذخیره تغییرات مشخصات فروشگاه
                    </button>
                  </div>
                </form>
              </div>
            )}

          </main>
        </div>

      </div>

      {/* DEDICATED MOBILE BOTTOM NAVIGATION DOCK (Floating Glass Bar) */}
      <div className="lg:hidden fixed bottom-3 left-3 right-3 z-50">
        <div className="bg-white/90 backdrop-blur-2xl border border-white/90 shadow-[0_10px_35px_rgba(0,0,0,0.12)] rounded-3xl p-2 flex items-center justify-around">
          <button
            type="button"
            onClick={() => setTab('dashboard')}
            className={`flex flex-col items-center gap-1 p-2 rounded-2xl transition-all cursor-pointer ${
              currentTab === 'dashboard' ? 'text-[#E06518] bg-orange-50 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px]">داشبورد</span>
          </button>

          <button
            type="button"
            onClick={() => setTab('countertop')}
            className={`flex flex-col items-center gap-1 p-2 rounded-2xl transition-all cursor-pointer ${
              currentTab === 'countertop' ? 'text-[#E06518] bg-orange-50 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Search className="w-5 h-5" />
            <span className="text-[10px]">دخل</span>
          </button>

          <button
            type="button"
            onClick={() => setTab('shelf_packs')}
            className={`flex flex-col items-center gap-1 p-2 rounded-2xl transition-all cursor-pointer ${
              currentTab === 'shelf_packs' ? 'text-[#E06518] bg-orange-50 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Package className="w-5 h-5" />
            <span className="text-[10px]">کارتن جور</span>
          </button>

          <button
            type="button"
            onClick={() => setTab('orders')}
            className={`flex flex-col items-center gap-1 p-2 rounded-2xl transition-all cursor-pointer ${
              currentTab === 'orders' ? 'text-[#E06518] bg-orange-50 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Truck className="w-5 h-5" />
            <span className="text-[10px]">بارنامه‌ها</span>
          </button>

          <button
            type="button"
            onClick={() => setIsMobileDrawerOpen(true)}
            className="flex flex-col items-center gap-1 p-2 rounded-2xl text-slate-500 hover:text-slate-800 transition-all cursor-pointer"
          >
            <Menu className="w-5 h-5" />
            <span className="text-[10px]">بیشتر</span>
          </button>
        </div>
      </div>

      {/* DEDICATED MOBILE SLIDE-OVER DRAWER SHEET (Right-anchored RTL Drawer) */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex justify-start" dir="rtl">
          {/* Backdrop */}
          <div
            onClick={() => setIsMobileDrawerOpen(false)}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
          />

          {/* Drawer Glass Panel */}
          <div className="relative w-5/6 max-w-sm h-full bg-white/98 backdrop-blur-2xl shadow-2xl p-5 overflow-y-auto space-y-5 text-right z-10 border-l border-slate-200/80 animate-in slide-in-from-right duration-250">
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Store className="w-5 h-5 text-[#E06518]" />
                <span className="font-black text-sm text-slate-800">منوی پرتال فروشگاهی</span>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileDrawerOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Store Profile Card */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200/80 space-y-1">
              <span className="text-xs font-black text-slate-900 block truncate">{activeUser.companyName || 'فروشگاه ابزار و قطعات پارس'}</span>
              <p className="text-[11px] text-slate-600">مسئول: {activeUser.fullName}</p>
              <div className="flex items-center gap-2 pt-1">
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                  اعتبار: ۱۵۰ میلیون
                </span>
                <span className="text-[10px] bg-orange-100 text-[#E06518] px-2 py-0.5 rounded-full font-bold">
                  امتیاز: {toPersianDigits(points)}
                </span>
              </div>
            </div>

            {/* Drawer Navigation Links */}
            <div className="space-y-1 text-xs">
              {[
                { id: 'dashboard', label: 'داشبورد فروشگاهی', icon: Home },
                { id: 'countertop', label: 'استعلام سریع پشت دخل', icon: Search, badge: 'حالت مشتری' },
                { id: 'shelf_packs', label: 'کارتن‌های پرفروش قفسه', icon: Package, badge: '۳۰٪ سود' },
                { id: 'orders', label: 'سفارش‌ها و بارنامه‌ها', icon: Truck, count: orders.length },
                { id: 'pricing', label: 'کرید اعتباری و تسویه چکی', icon: CreditCard, badge: '۴۵ روزه' },
                { id: 'merchandising', label: 'استند و تابلوی رایگان مغازه', icon: Sparkles, badge: 'رایگان' },
                { id: 'marketing', label: 'معرف همکاران و کش‌بک ۲٪', icon: Gift },
                { id: 'technical_docs', label: 'جدول گام تسمه‌ها و CAD', icon: BookOpen },
                { id: 'inquiries', label: 'استعلام قیمت همکار', icon: PhoneCall, count: pendingInquiriesCount },
                { id: 'wishlist', label: 'اقلام نشان‌شده قفسه', icon: Heart, count: wishlist.length },
                { id: 'tickets', label: 'پیام‌ها و پشتیبانی فروش', icon: MessageSquare, count: tickets.length },
                { id: 'addresses', label: 'آدرس‌های مغازه و انبار', icon: MapPin },
                { id: 'profile', label: 'پروانه کسب و مشخصات مغازه', icon: Building },
              ].map(item => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setTab(item.id);
                      setIsMobileDrawerOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-2xl font-bold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#E06518] text-white shadow-xs'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {item.badge && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          isActive ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                      {item.count !== undefined && item.count > 0 && (
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                          isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {toPersianDigits(item.count)}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Quick Link to Storefront */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <Link
                to="/"
                onClick={() => setIsMobileDrawerOpen(false)}
                className="w-full py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <ShoppingBag className="w-4 h-4 text-[#E06518]" />
                <span>مشاهده فروشگاه اصلی قطعات</span>
              </Link>

              <button
                type="button"
                onClick={logout}
                className="w-full py-2.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>خروج از حساب</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Detail & Timeline Modal */}
      {selectedOrderForTimeline && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white/95 backdrop-blur-xl text-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-white/80 text-right space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900">
                  رهگیری بارنامه باربری سفارش {selectedOrderForTimeline.orderNumber}
                </h3>
                <span className="text-[11px] text-slate-400">کد رهگیری باربری وطن: BR-84920</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrderForTimeline(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Vertical Timeline */}
            <div className="space-y-4 py-2 relative pr-6">
              <div className="absolute top-3 bottom-3 right-[11px] w-0.5 bg-slate-200 -z-0" />

              {[
                {
                  status: 'registered',
                  label: 'ثبت سفارش کارتن در سامانه پخش اطلس',
                  desc: 'سفارش با موفقیت در انبار مرکزی یزد ثبت شد.',
                  stepIndex: 1,
                },
                {
                  status: 'processing',
                  label: 'بسته‌بندی و کنترل کیفی کارتن‌های جور در انبار',
                  desc: 'تست کشش و بسته‌بندی ضد رطوبت تسمه‌ها و صدور فاکتور.',
                  stepIndex: 2,
                },
                {
                  status: 'shipped',
                  label: 'تحویل به باربری وطن و صدور بارنامه رسمی',
                  desc: 'محموله بارگیری شد و شماره بارنامه به گیرنده پیامک گردید.',
                  stepIndex: 3,
                },
                {
                  status: 'delivered',
                  label: 'تحویل به فروشگاه و تخلیه در قفسه مغازه',
                  desc: 'رسید بارنامه توسط مسئول فروشگاه امضا شد.',
                  stepIndex: 4,
                },
              ].map((step, idx) => {
                const orderStatus = selectedOrderForTimeline.status;
                const statusOrder = ['registered', 'processing', 'shipped', 'delivered'];
                const currentIndex = statusOrder.indexOf(orderStatus);
                const isCompleted = idx <= currentIndex;
                const isCurrent = idx === currentIndex;

                return (
                  <div key={step.status} className="relative flex items-start gap-3">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 z-10 ${
                        isCurrent
                          ? 'bg-[#E06518] text-white ring-4 ring-orange-100 shadow-md'
                          : isCompleted
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-200 text-slate-400'
                      }`}
                    >
                      {isCompleted && !isCurrent ? <CheckCircle2 className="w-3.5 h-3.5" /> : toPersianDigits(idx + 1)}
                    </div>

                    <div className="space-y-0.5">
                      <div className={`font-bold text-xs ${isCurrent ? 'text-[#C95210]' : isCompleted ? 'text-slate-800' : 'text-slate-400'}`}>
                        {step.label}
                        {isCurrent && (
                          <span className="mr-2 text-[10px] bg-orange-100 text-[#C95210] px-2 py-0.5 rounded-full font-semibold">
                            مرحله جاری
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
              <button
                type="button"
                onClick={() => {
                  setSelectedOrderForInvoice(selectedOrderForTimeline);
                  setSelectedOrderForTimeline(null);
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>مشاهده فاکتور چاپی</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedOrderForTimeline(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
              >
                بستن
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Printable Invoice Modal */}
      {selectedOrderForInvoice && (
        <PrintableInvoiceModal
          order={selectedOrderForInvoice}
          onClose={() => setSelectedOrderForInvoice(null)}
        />
      )}

      {/* Address Add / Edit Modal */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white/95 backdrop-blur-xl text-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-white/80 text-right space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-800">
                {editingAddress ? 'ویرایش آدرس مغازه یا انبار' : 'افزودن آدرس شعبه جدید'}
              </h3>
              <button
                type="button"
                onClick={() => setIsAddressModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveAddress} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">عنوان آدرس (مغازه / انبار):</label>
                <input
                  type="text"
                  value={addressFormData.title}
                  onChange={e => setAddressFormData({ ...addressFormData, title: e.target.value })}
                  placeholder="مغازه اصلی پاساژ / انبار پشتیبانی..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">نام تحویل‌گیرنده:</label>
                  <input
                    type="text"
                    value={addressFormData.recipientName}
                    onChange={e => setAddressFormData({ ...addressFormData, recipientName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                    required
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">تلفن تماس:</label>
                  <input
                    type="tel"
                    dir="ltr"
                    value={addressFormData.recipientPhone}
                    onChange={e => setAddressFormData({ ...addressFormData, recipientPhone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-800 font-mono text-left"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">استان:</label>
                  <input
                    type="text"
                    value={addressFormData.province}
                    onChange={e => setAddressFormData({ ...addressFormData, province: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-800"
                    required
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">شهر:</label>
                  <input
                    type="text"
                    value={addressFormData.city}
                    onChange={e => setAddressFormData({ ...addressFormData, city: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-800"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">نشانی دقیق مغازه:</label>
                <textarea
                  rows={2}
                  value={addressFormData.fullAddress}
                  onChange={e => setAddressFormData({ ...addressFormData, fullAddress: e.target.value })}
                  placeholder="بلوار، پاساژ ابزار، طبقه همکف، پلاک..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-800 text-xs"
                  required
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">کد پستی ۱۰ رقمی:</label>
                <input
                  type="text"
                  dir="ltr"
                  maxLength={10}
                  value={addressFormData.postalCode}
                  onChange={e => setAddressFormData({ ...addressFormData, postalCode: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-800 font-mono text-left"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={addressFormData.isDefault}
                  onChange={e => setAddressFormData({ ...addressFormData, isDefault: e.target.checked })}
                  className="rounded text-[#E06518]"
                />
                <span className="text-slate-700">تنظیم به عنوان آدرس پیش‌فرض تحویل بارنامه</span>
              </label>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddressModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#E06518] hover:bg-[#C95210] text-white font-bold rounded-xl cursor-pointer shadow-xs"
                >
                  ذخیره آدرس
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DEDICATED MOBILE BOTTOM NAVIGATION BAR */}
      <AccountMobileBottomNav
        currentTab={currentTab}
        setTab={setTab}
        ordersCount={orders.length}
        onOpenMore={() => setIsMobileDrawerOpen(true)}
      />

      {/* DEDICATED MOBILE SEARCH MODAL */}
      <AccountMobileSearchModal
        isOpen={isMobileSearchOpen}
        onClose={() => setIsMobileSearchOpen(false)}
      />

      {/* DEDICATED MOBILE SUPPORT SHEET */}
      <AccountMobileSupportSheet
        isOpen={isMobileSupportSheetOpen}
        onClose={() => setIsMobileSupportSheetOpen(false)}
        onRequestTicket={(subject) => {
          setTab('tickets');
          setIsCreatingTicket(true);
          setNewTicketSubject(subject);
        }}
      />
    </div>
  );
};
