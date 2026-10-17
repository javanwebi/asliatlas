import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  Grid,
  ShoppingCart,
  PhoneCall,
  User,
  X,
  Camera,
  MessageCircle,
  Headphones,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Cpu,
  Package,
  CircleDot,
  Shield,
  Scissors,
  Flame,
  Layers,
  Boxes,
  Wrench,
  ArrowRight,
  Search,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { STORE_ASSETS } from '../../assets/images';
import { CATEGORIES, PRIMARY_CATALOG_CATEGORIES } from '../../data/categories';
import { CategoryNavigation } from '../catalog/CategoryNavigation';

interface MobileBottomBarProps {
  onOpenMobileMenu?: () => void;
  onOpenSearch?: () => void;
}

export const MobileBottomBar: React.FC<MobileBottomBarProps> = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { itemCount } = useCart();
  const { currentUser, openAuthModal } = useAuth();

  const [isContactSheetOpen, setIsContactSheetOpen] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [selectedCategoryIndex, setSelectedCategoryIndex] = useState(0);
  const [expandedSubcatIndex, setExpandedSubcatIndex] = useState<number | null>(0);

  // Automatically close overlays when route changes
  useEffect(() => {
    setIsMegaMenuOpen(false);
    setIsContactSheetOpen(false);
  }, [location.pathname]);

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const toPersianDigits = (num: number) => {
    const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    return num.toString().replace(/\d/g, (x) => farsiDigits[parseInt(x, 10)]);
  };

  const getCategoryIcon = (slug: string) => {
    switch (slug) {
      case 'belts-power-transmission':
        return <Cpu className="w-5 h-5" />;
      case 'profiles-rails-supports':
        return <Package className="w-5 h-5" />;
      case 'rollers-wheels-gears':
        return <CircleDot className="w-5 h-5" />;
      case 'rubber-polyurethane-suction':
        return <Shield className="w-5 h-5" />;
      case 'industrial-brushes':
        return <Scissors className="w-5 h-5" />;
      case 'hoses-transfer-ducts':
        return <Flame className="w-5 h-5" />;
      case 'sealing-foam-refractory':
        return <Layers className="w-5 h-5" />;
      case 'stacker-transfer-specialized':
        return <Boxes className="w-5 h-5" />;
      case 'polymer-teflon-parts':
        return <Grid className="w-5 h-5" />;
      case 'pumps-valves-mechanical':
        return <Wrench className="w-5 h-5" />;
      default:
        return <Grid className="w-5 h-5" />;
    }
  };

  const activeCat = PRIMARY_CATALOG_CATEGORIES[selectedCategoryIndex] || PRIMARY_CATALOG_CATEGORIES[0];

  return (
    <>
      {/* Mobile Full Screen Megamenu Overlay Modal (Matches desktop header 'همه محصولات' section) */}
      {isMegaMenuOpen && (
        <div 
          className="fixed inset-0 z-50 bg-white flex flex-col lg:hidden animate-in fade-in slide-in-from-bottom-2 duration-200 pb-[calc(4rem+env(safe-area-inset-bottom))]"
          dir="rtl"
        >
          {/* Megamenu Top Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-[#484344] text-white shadow-sm shrink-0 border-b border-[#3A3637]">
            <div className="flex items-center gap-2 font-black text-sm text-white">
              <Grid className="w-5 h-5 text-[#E06518]" />
              <span>دسته‌بندی‌های کاتالوگ صنعتی (همه محصولات)</span>
            </div>
            <button
              type="button"
              onClick={() => setIsMegaMenuOpen(false)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              <span>بستن</span>
              <X className="w-4 h-4 text-[#E06518]" />
            </button>
          </div>

          {/* Megamenu Main Split Content Body */}
          <div className="flex-1 flex overflow-hidden">
            {/* Right Sidebar: 10 Primary Categories Vertical Tabs (Made smaller & more compact) */}
            <div className="w-24 sm:w-28 shrink-0 bg-[#F4F6F8] border-l border-slate-200/90 overflow-y-auto divide-y divide-slate-200/50">
              {PRIMARY_CATALOG_CATEGORIES.map((cat, idx) => {
                const isSelected = selectedCategoryIndex === idx;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setSelectedCategoryIndex(idx);
                      setExpandedSubcatIndex(0);
                    }}
                    className={`w-full px-1.5 py-2 flex flex-col items-center justify-center text-center gap-1 transition-all relative cursor-pointer ${
                      isSelected
                        ? 'bg-white text-[#E06518] font-black shadow-[0_2px_10px_rgba(0,0,0,0.04)]'
                        : 'text-slate-600 hover:bg-slate-200/50 hover:text-slate-900 font-bold'
                    }`}
                  >
                    {/* Active Indicator Bar on Right Border */}
                    {isSelected && (
                      <span className="absolute right-0 top-1 bottom-1 w-0.5 bg-[#E06518] rounded-l-full" />
                    )}

                    <div className="flex items-center gap-0.5">
                      <span
                        className={`w-3.5 h-3.5 rounded text-[8px] font-mono font-bold flex items-center justify-center shrink-0 ${
                          isSelected ? 'bg-[#E06518] text-white' : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {toPersianDigits(idx + 1)}
                      </span>
                      <div
                        className={`w-6 h-6 rounded-md flex items-center justify-center transition-transform ${
                          isSelected
                            ? 'bg-orange-50 text-[#E06518]'
                            : 'bg-slate-200/60 text-slate-500'
                        }`}
                      >
                        {getCategoryIcon(cat.slug)}
                      </div>
                    </div>

                    <span
                      className={`text-[9px] sm:text-[10px] leading-tight break-words px-0.5 ${
                        isSelected ? 'text-[#E06518] font-black' : 'text-slate-700 font-bold'
                      }`}
                    >
                      {cat.name}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Left Main Pane: Active Category Showcase matching desktop megamenu */}
            <div className="flex-1 bg-white overflow-y-auto p-3.5 sm:p-4 space-y-4">
              
              {/* All Catalog Products Top Link */}
              <button
                type="button"
                onClick={() => {
                  setIsMegaMenuOpen(false);
                  navigate('/products');
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#E06518] hover:bg-[#C95210] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  <span>مشاهده همه محصولات و تجهیزات</span>
                </div>
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Active Category Header Banner */}
              <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <h3 className="font-black text-sm text-[#484344] leading-snug flex items-center gap-1.5">
                      <span>{activeCat.name}</span>
                    </h3>
                    <span className="text-[10px] font-mono text-slate-500 block">
                      ({activeCat.nameEn})
                    </span>
                  </div>

                  {activeCat.image && (
                    <div className="w-11 h-11 rounded-xl bg-white p-1 shrink-0 flex items-center justify-center border border-slate-200 shadow-2xs">
                      <img
                        src={activeCat.image}
                        alt={activeCat.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}
                </div>

                {activeCat.featuredBadge && (
                  <div className="inline-block px-2 py-0.5 rounded-md bg-orange-50 text-[#C95210] border border-orange-200 text-[10px] font-bold">
                    {activeCat.featuredBadge}
                  </div>
                )}

                <p className="text-[11px] text-slate-600 leading-relaxed">
                  {activeCat.description}
                </p>
              </div>

              {/* Subcategories Section Header & Cards */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold text-[#484344] flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#E06518]" />
                    <span>زیرمجموعه‌ها و گروه‌های تخصصی:</span>
                  </h4>
                  <span className="text-[10px] text-slate-500 font-mono font-bold">
                    {toPersianDigits(activeCat.subcategories?.length || 0)} زیرگروه
                  </span>
                </div>

                <CategoryNavigation key={activeCat.slug} nodes={activeCat.children} categorySlug={activeCat.slug} onNavigate={() => setIsMegaMenuOpen(false)} />
              </div>


              {/* Top Models & Product Codes */}
              {activeCat.topModels && activeCat.topModels.length > 0 && (
                <div className="pt-2 border-t border-slate-100 space-y-1.5">
                  <div className="text-[11px] font-bold text-slate-600 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#E06518]" />
                    <span>کدهای فنی و مدل‌های پرمصرف:</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {activeCat.topModels.map((model) => (
                      <button
                        key={model}
                        type="button"
                        onClick={() => {
                          setIsMegaMenuOpen(false);
                          navigate(`/search?q=${encodeURIComponent(model)}`);
                        }}
                        className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-[#E06518] hover:text-white text-slate-800 text-[10px] font-mono font-bold transition-all border border-slate-200/80 cursor-pointer"
                      >
                        {model}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Brands */}
              {activeCat.brands && activeCat.brands.length > 0 && (
                <div className="pt-2 border-t border-slate-100 space-y-1">
                  <div className="text-[11px] font-bold text-slate-600">برندهای تأییدشده:</div>
                  <div className="flex flex-wrap gap-1">
                    {activeCat.brands.map((b) => (
                      <span key={b} className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium text-[10px] border border-slate-200">
                        {b}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Full Category Direct CTA Button */}
              <button
                type="button"
                onClick={() => {
                  setIsMegaMenuOpen(false);
                  navigate(`/category/${activeCat.slug}`);
                }}
                className="w-full flex items-center justify-between py-2.5 px-3.5 rounded-xl bg-[#484344] hover:bg-[#3A3637] text-white text-xs font-bold shadow-xs transition-all cursor-pointer group mt-2"
              >
                <span>مشاهده محصولات گروه {activeCat.name}</span>
                <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              </button>

            </div>
          </div>
        </div>
      )}

      {/* Mobile Floating / Docked Bottom Navigation Bar (Visible only on < lg) */}
      <nav
        aria-label="منوی دسترسی سریع موبایل"
        className="fixed bottom-0 inset-x-0 z-50 bg-[#FFFFFF]/95 backdrop-blur-md border-t border-[#E3E5E6] shadow-[0_-4px_20px_rgba(0,0,0,0.08)] lg:hidden transition-all duration-300 pb-[env(safe-area-inset-bottom)]"
        dir="rtl"
      >
        <div className="max-w-md mx-auto px-2 h-16 flex items-center justify-around">
          {/* 1. خانه (Home Page) */}
          <Link
            to="/"
            className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-center transition-all ${
              location.pathname === '/'
                ? 'text-[#E06518]'
                : 'text-[#484344] hover:text-[#E06518]'
            }`}
          >
            <div className="relative">
              <Home className="w-5 h-5 transition-transform" />
              {location.pathname === '/' && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#E06518] rounded-full shadow-[0_0_6px_#E06518]" />
              )}
            </div>
            <span className="text-[10px] font-bold mt-1 tracking-tight">خانه</span>
          </Link>

          {/* 2. دسته‌بندی (Categories - Toggles Full Screen Megamenu Overlay) */}
          <button
            type="button"
            onClick={() => setIsMegaMenuOpen(prev => !prev)}
            className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-center transition-all cursor-pointer ${
              isMegaMenuOpen || isActive('/categories') || isActive('/category')
                ? 'text-[#E06518]'
                : 'text-[#484344] hover:text-[#E06518]'
            }`}
          >
            <div className="relative">
              <Grid className="w-5 h-5 transition-transform" />
              {(isMegaMenuOpen || isActive('/categories') || isActive('/category')) && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#E06518] rounded-full shadow-[0_0_6px_#E06518]" />
              )}
            </div>
            <span className="text-[10px] font-bold mt-1 tracking-tight">دسته‌بندی</span>
          </button>

          {/* 3. سبد خرید (Cart & RFQ) */}
          <Link
            to="/cart"
            className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-center transition-all relative ${
              isActive('/cart') || isActive('/checkout')
                ? 'text-[#E06518]'
                : 'text-[#484344] hover:text-[#E06518]'
            }`}
          >
            <div className="relative">
              <ShoppingCart className="w-5 h-5 transition-transform" />
              {itemCount > 0 && (
                <span className="absolute -top-1.5 -left-2.5 min-w-[17px] h-4 px-1 rounded-full bg-[#E06518] text-white text-[9px] font-mono font-black flex items-center justify-center border-2 border-white shadow-xs">
                  {toPersianDigits(itemCount)}
                </span>
              )}
              {(isActive('/cart') || isActive('/checkout')) && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#E06518] rounded-full shadow-[0_0_6px_#E06518]" />
              )}
            </div>
            <span className="text-[10px] font-bold mt-1 tracking-tight">سبد خرید</span>
          </Link>

          {/* 4. پشتیبانی (Customer Support & Hotline Sheet) */}
          <button
            type="button"
            onClick={() => setIsContactSheetOpen(true)}
            className="flex flex-col items-center justify-center flex-1 h-full py-1 text-center text-[#484344] hover:text-[#E06518] transition-all cursor-pointer"
            aria-label="پشتیبانی و ارتباط با کارشناسان"
          >
            <div className="relative">
              <PhoneCall className="w-5 h-5 transition-transform" />
            </div>
            <span className="text-[10px] font-bold mt-1 tracking-tight">پشتیبانی</span>
          </button>

          {/* 5. صنعت پیش من (My Sanat Pish / User Account & Portal) */}
          {currentUser ? (
            <Link
              to={currentUser.role === 'dealer' ? '/dealer' : currentUser.role === 'admin' ? '/admin' : '/account'}
              className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-center transition-all ${
                isActive('/account') || isActive('/dealer') || isActive('/admin')
                  ? 'text-[#E06518]'
                  : 'text-[#484344] hover:text-[#E06518]'
              }`}
            >
              <div className="relative">
                <User className="w-5 h-5 transition-transform" />
                {(isActive('/account') || isActive('/dealer') || isActive('/admin')) && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#E06518] rounded-full shadow-[0_0_6px_#E06518]" />
                )}
              </div>
              <span className="text-[10px] font-bold mt-1 tracking-tight truncate max-w-[70px]">
                حساب من
              </span>
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => openAuthModal()}
              className="flex flex-col items-center justify-center flex-1 h-full py-1 text-center text-[#484344] hover:text-[#E06518] transition-all cursor-pointer"
              aria-label="صنعت پیش من (ورود / ثبت‌نام)"
            >
              <div className="relative">
                <User className="w-5 h-5 transition-transform" />
              </div>
              <span className="text-[10px] font-bold mt-1 tracking-tight truncate max-w-[70px]">
                ورود / عضویت
              </span>
            </button>
          )}
        </div>
      </nav>

      {/* Quick Contact & Hotline Bottom Sheet */}
      {isContactSheetOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end lg:hidden animate-in fade-in duration-200">
          <div
            onClick={() => setIsContactSheetOpen(false)}
            className="fixed inset-0 bg-[#484344]/80 backdrop-blur-xs transition-opacity"
          />

          <div
            className="relative z-10 w-full bg-[#FFFFFF] border-t border-[#E3E5E6] rounded-t-3xl p-5 text-[#484344] shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto pb-[calc(1.5rem+env(safe-area-inset-bottom))]"
            dir="rtl"
          >
            <div className="w-12 h-1.5 bg-[#E3E5E6] rounded-full mx-auto" />

            <div className="flex items-center justify-between border-b border-[#E3E5E6] pb-3">
              <div className="text-right">
                <h3 className="font-black text-base text-[#484344]">پشتیبانی و ارتباط با کارشناسان اطلس</h3>
                <p className="text-xs text-[#777A7D] mt-0.5">پاسخگویی فنی و استعلام فوری قطعات خطوط تولید</p>
              </div>
              <button
                type="button"
                onClick={() => setIsContactSheetOpen(false)}
                className="w-8 h-8 rounded-full bg-[#F6F7F7] text-[#484344] hover:text-[#E06518] flex items-center justify-center cursor-pointer border border-[#E3E5E6]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5">
              <a
                href="tel:03538739900"
                className="flex items-center justify-between p-3.5 bg-[#E06518] hover:bg-[#C95210] rounded-2xl text-white font-bold shadow-sm cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <PhoneCall className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-black">تماس مستقیم با واحد فروش</div>
                    <div className="text-xs font-mono text-orange-100 mt-0.5" dir="ltr">
                      ۰۳۵-۳۸۷۳۹۹۰۰
                    </div>
                  </div>
                </div>
                <ChevronLeft className="w-5 h-5" />
              </a>

              <a
                href="tel:03538739988"
                className="flex items-center justify-between p-3.5 bg-[#F6F7F7] border border-[#E3E5E6] rounded-2xl text-[#484344] font-bold hover:border-[#E06518] transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#E06518]/10 border border-[#E06518]/30 flex items-center justify-center text-[#E06518]">
                    <Headphones className="w-5 h-5" />
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold">پشتیبانی فنی و مهندسی</div>
                    <div className="text-xs font-mono text-[#777A7D] mt-0.5" dir="ltr">
                      ۰۳۵-۳۸۷۳۹۹۸۸
                    </div>
                  </div>
                </div>
                <ChevronLeft className="w-5 h-5 text-[#777A7D]" />
              </a>

              <a
                href="https://wa.me/989903427027"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-3.5 bg-[#F6F7F7] border border-emerald-500/40 rounded-2xl text-[#55565A] font-bold hover:border-emerald-500 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-emerald-700">ارتباط در واتس‌اپ</div>
                    <div className="text-xs font-mono text-[#777A7D] mt-0.5" dir="ltr">
                      +۹۸ ۹۹۰ ۳۴۲ ۷۰۲۷
                    </div>
                  </div>
                </div>
                <ChevronLeft className="w-5 h-5 text-emerald-600" />
              </a>

              {/* Face-to-Face Live AI FORZA Voice Conversation Trigger */}
              <button
                type="button"
                onClick={() => {
                  setIsContactSheetOpen(false);
                  navigate('/ai-forza');
                }}
                className="w-full flex items-center justify-between p-3.5 bg-gradient-to-r from-[#E06518] via-amber-600 to-[#C95210] text-white border border-orange-400 rounded-2xl font-bold shadow-lg shadow-orange-950/20 cursor-pointer active:scale-98 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-black/40 border border-white/30 overflow-hidden flex items-center justify-center relative shrink-0">
                    <img
                      src={STORE_ASSETS.aiForzaCyborg}
                      alt="AI FORZA"
                      className="w-full h-full object-cover object-top"
                    />
                    <span className="absolute bottom-0 left-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-black animate-pulse" />
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-black text-white flex items-center gap-1.5">
                      <span>مکالمه چهره به چهره با AI FORZA</span>
                      <span className="px-1.5 py-0.2 bg-white text-[#E06518] text-[9px] rounded font-black animate-pulse">
                        زنده
                      </span>
                    </div>
                    <div className="text-xs text-orange-100 mt-0.5">
                      مکالمه دوطرفه صوتی، شناسایی قطعه و پاسخ فوری
                    </div>
                  </div>
                </div>
                <ChevronLeft className="w-5 h-5 text-white" />
              </button>

              {/* AI Consultation Chat Trigger (Cognivo Light Style) */}
              <button
                type="button"
                onClick={() => {
                  setIsContactSheetOpen(false);
                  navigate('/ai-consult');
                }}
                className="w-full flex items-center justify-between p-3.5 bg-white text-slate-800 border-2 border-slate-200 hover:border-[#E06518] rounded-2xl font-bold shadow-sm transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-[#E06518]">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      <span>میزکار هوشمند FORZA</span>
                      <span className="px-1.5 py-0.2 bg-[#E06518] text-white text-[9px] rounded font-black">
                        آنلاین
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      مشاوره صنعتی، محاسبه طول تسمه و مشخصات فنی
                    </div>
                  </div>
                </div>
                <ChevronLeft className="w-5 h-5 text-[#E06518]" />
              </button>

              {/* AI Image / Camera Search Trigger with #55565A + #E06518 */}
              <button
                type="button"
                onClick={() => {
                  setIsContactSheetOpen(false);
                  window.dispatchEvent(new CustomEvent('open-visual-search'));
                }}
                className="w-full flex items-center justify-between p-3.5 bg-[#55565A] text-white border border-[#55565A] rounded-2xl font-bold hover:bg-[#55565A]/90 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#E06518] flex items-center justify-center text-white">
                    <Camera className="w-5 h-5" />
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-white">شناسایی تصویری قطعه (هوش مصنوعی)</div>
                    <div className="text-xs text-slate-200 mt-0.5">ارسال عکس پلاک یا قطعه جهت تطبیق هوشمند</div>
                  </div>
                </div>
                <ChevronLeft className="w-5 h-5 text-[#E06518]" />
              </button>
            </div>

            <div className="pt-2 text-center text-[11px] text-[#777A7D] border-t border-[#E3E5E6]">
              ساعات پاسخگویی: شنبه تا پنجشنبه از ساعت ۸:۰۰ الی ۲۰:۰۰
            </div>
          </div>
        </div>
      )}
    </>
  );
};
