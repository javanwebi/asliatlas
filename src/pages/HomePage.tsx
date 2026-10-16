import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Camera,
  Sparkles,
  Headphones,
  Shield,
  ShieldCheck,
  Building,
  Truck,
  Award,
  Share2,
  FileText,
  Calculator,
  Flame,
  Phone,
  CheckCircle2,
  Factory,
  Zap,
  Cpu,
  Gem,
  Wheat,
  Play,
  Mouse,
  Clock,
  Package,
  Settings,
  Building2,
  History,
  FileCheck2,
  Warehouse,
  PhoneCall,
  MapPin,
  Lightbulb,
  BookOpen,
} from 'lucide-react';
import { CATEGORIES } from '../data/categories';
import { STORE_ASSETS } from '../assets/images';
import { toPersianDigits } from '../utils/formatters';
import { AiVisualPartSearchModal } from '../components/search/AiVisualPartSearchModal';
import { AiConsultModal } from '../components/search/AiConsultModal';
import { OurClientsSection } from '../components/home/OurClientsSection';
import { PopularProductsSection } from '../components/home/PopularProductsSection';
import { HighUtilityProductsSection } from '../components/home/HighUtilityProductsSection';
import { MainBrandsBanner } from '../components/home/MainBrandsBanner';
import { SanatPishInteractiveShowcase } from '../components/home/SanatPishInteractiveShowcase';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();

  // Modals state
  const [isVisualSearchOpen, setIsVisualSearchOpen] = useState(false);
  const [isConsultOpen, setIsConsultOpen] = useState(false);

  // Hero Slider
  const [activeSlide, setActiveSlide] = useState(1);
  const totalSlides = 3;

  // Window scroll tracking for Parallax, Headline fade/shift, Sticky Advantages bar, and Scroll Indicator line
  const [scrollY, setScrollY] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleWindowScroll = () => {
      const currentScroll = window.scrollY;
      setScrollY(currentScroll);

      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        setScrollProgress(Math.min(1, Math.max(0, currentScroll / totalHeight)));
      }
    };

    window.addEventListener('scroll', handleWindowScroll, { passive: true });
    handleWindowScroll();

    return () => window.removeEventListener('scroll', handleWindowScroll);
  }, []);

  // ---------------------------------------------------------------------------
  // Hero Carousel Data & Automatic 5s Slide Switching
  // ---------------------------------------------------------------------------
  const [heroSlideIndex, setHeroSlideIndex] = useState(0);

  interface HeroSlideItem {
    id: number;
    image: string;
    tag: string;
    eyebrow: string;
    titlePart1: string;
    titlePart2: string;
    description: string;
    statsBadge: {
      value: string;
      label: string;
    };
    primaryBtn: {
      text: string;
      link?: string;
      action?: 'visualSearch' | 'consult';
    };
    secondaryBtn: {
      text: string;
      link?: string;
      action?: 'visualSearch' | 'consult';
    };
    badge: {
      title: string;
      subtitle: string;
    };
  }

  const heroSlides: HeroSlideItem[] = [
    {
      id: 1,
      image: STORE_ASSETS.heroSteelCoils || STORE_ASSETS.heroPulley,
      tag: 'تولید و بازرگانی قطعات صنعتی',
      eyebrow: 'پیش به صنعت | بازرگانی تسمه اطلس از سال ۱۳۶۶',
      titlePart1: 'صنعت پیش؛ همراه قدرتمند',
      titlePart2: 'صنایع و خطوط تولید ایران',
      description:
        'سازنده و تأمین‌کننده مستقیم قطعات صنعتی، برندهای معتبر اطلس، FORZA و SWR با بیش از ۳۰,۰۰۰ قلم کالا، شرایط پرداختی منعطف و ارسال رایگان به سراسر کشور.',
      statsBadge: {
        value: '+۳۰,۰۰۰',
        label: 'قلم کالای موجود در انبار',
      },
      primaryBtn: {
        text: 'مشاهده کاتالوگ قطعات',
        link: '/products',
      },
      secondaryBtn: {
        text: 'مشاوره هوشمند قطعه',
        action: 'consult',
      },
      badge: {
        title: 'ارسال رایگان به سراسر کشور | پیش به صنعت',
        subtitle: 'پشتوانه ۳۷ سال تجربه صنعتی از سال ۱۳۶۶',
      },
    },
    {
      id: 2,
      image: STORE_ASSETS.forzaSwrDualBanner || STORE_ASSETS.heroPulley,
      tag: 'نمایندگی رسمی و انحصاری',
      eyebrow: 'کیفیت سطح یک و استانداردهای معتبر بین‌المللی DIN و ISO',
      titlePart1: 'سیستم‌های انتقال قدرت',
      titlePart2: 'با استانداردهای FORZA و SWR',
      description:
        'تأمین مستقیم و بدون واسطه انواع پولی‌های صنعتی، فلکه چدنی، تسمه‌های دنده‌ای و شیاردار، بلبرینگ و یاتاقان با برگه آنالیز متالوژی و تضمین کتبی اصالت.',
      statsBadge: {
        value: 'DIN / ISO',
        label: 'استاندارد بین‌المللی متالوژی',
      },
      primaryBtn: {
        text: 'مشاهده قطعات FORZA و SWR',
        link: '/category/swr-forza-exclusive',
      },
      secondaryBtn: {
        text: 'استعلام فوری قیمت و موجودی',
        action: 'consult',
      },
      badge: {
        title: 'تضمین اصالت قطعات و گارانتی تعویض',
        subtitle: 'خرید دست‌اول و شرایط تسویه مدت‌دار',
      },
    },
    {
      id: 3,
      image: STORE_ASSETS.partsWarehouseVault || STORE_ASSETS.heroBanner,
      tag: 'انبار مرکزی و دپوی استراتژیک',
      eyebrow: 'شبکه توزیع و لجستیک اکسپرس در سراسر کشور',
      titlePart1: 'توقف خط تولید، هرگز!',
      titlePart2: 'ارسال فوری در کمتر از ۲۴ ساعت',
      description:
        'دپوی استراتژیک بیش از ۳۰,۰۰۰ قلم قطعات پرمصرف کارخانجات و ارسال رایگان و سریع با ناوگان اختصاصی و باربری به تمامی شهرک‌های صنعتی ایران.',
      statsBadge: {
        value: '< ۲۴h',
        label: 'تحویل در محل کارخانه',
      },
      primaryBtn: {
        text: 'شناسایی قطعه با هوش مصنوعی',
        action: 'visualSearch',
      },
      secondaryBtn: {
        text: 'تماس با واحد فروش فوری',
        action: 'consult',
      },
      badge: {
        title: 'ارسال رایگان و اکسپرس به سراسر کشور',
        subtitle: 'پشتیبانی ۲۴ ساعته خطوط تولید',
      },
    },
    {
      id: 4,
      image: STORE_ASSETS.whySanatCadEngineering || STORE_ASSETS.reverseEngineeringLab,
      tag: 'تولید، ساخت و مهندسی معکوس',
      eyebrow: 'سامانه مکانیزه شناسایی هوشمند و ساخت قطعات سفارشی',
      titlePart1: 'کارگاه ساخت و مهندسی معکوس',
      titlePart2: 'قطعات کمیاب و تحریمی خطوط تولید',
      description:
        'اسکن سه‌بعدی اپتیکال، ماشین‌کاری CNC و ساخت دقیق قطعات تحریمی خطوط کاشی و سرامیک، سیمان، فولاد و غذایی با تضمین عملکرد و گارانتی کتبی.',
      statsBadge: {
        value: '۱۰۰٪',
        label: 'تطبیق با نقشه فابریک',
      },
      primaryBtn: {
        text: 'ارسال نقشه و استعلام ساخت',
        action: 'consult',
      },
      secondaryBtn: {
        text: 'مشاهده دسته‌بندی قطعات',
        link: '/categories',
      },
      badge: {
        title: 'کارگاه تخصصی تولید و ماشین‌کاری',
        subtitle: 'تست‌های NDT و سختی‌سنجی متالوژی',
      },
    },
  ];

  // 5-second automatic slide interval
  useEffect(() => {
    const timer = setInterval(() => {
      setHeroSlideIndex((prev) => (prev + 1) % heroSlides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [heroSlides.length]);

  const handleNextSlide = () => {
    setHeroSlideIndex((prev) => (prev + 1) % heroSlides.length);
  };

  const handlePrevSlide = () => {
    setHeroSlideIndex((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  // Mobile Touch Gestures for Hero Carousel
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    const diff = touchStartX.current - touchEndX.current;
    // In RTL, swipe left (diff > 40) moves forward to next slide
    if (diff > 40) {
      handleNextSlide();
    } else if (diff < -40) {
      handlePrevSlide();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  // Industries carousel scroll tracking
  const industriesScrollRef = useRef<HTMLDivElement>(null);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Categories carousel scroll tracking
  const categoriesScrollRef = useRef<HTMLDivElement>(null);

  const handleCatScrollLeft = () => {
    if (categoriesScrollRef.current) {
      categoriesScrollRef.current.scrollBy({ left: -260, behavior: 'smooth' });
    }
  };

  const handleCatScrollRight = () => {
    if (categoriesScrollRef.current) {
      categoriesScrollRef.current.scrollBy({ left: 260, behavior: 'smooth' });
    }
  };

  const checkIndustriesScroll = () => {
    const el = industriesScrollRef.current;
    if (!el) return;
    const scrolled = Math.abs(el.scrollLeft) > 10;
    setCanScrollRight(scrolled);
  };

  const handleScrollLeft = () => {
    const el = industriesScrollRef.current;
    if (el) {
      el.scrollBy({ left: -320, behavior: 'smooth' });
      setCanScrollRight(true);
    }
  };

  const handleScrollRight = () => {
    const el = industriesScrollRef.current;
    if (el) {
      el.scrollBy({ left: 320, behavior: 'smooth' });
      setTimeout(checkIndustriesScroll, 350);
    }
  };

  // 6 Covered Industries matching user requirements
  const coveredIndustries = [
    {
      id: 1,
      title: 'صنعت کاشی و سرامیک',
      image: STORE_ASSETS.industries.ceramic,
      icon: Flame,
      link: '/category/ceramic-tiles',
    },
    {
      id: 2,
      title: 'صنعت نساجی و پارچه',
      image: STORE_ASSETS.industries.textile,
      icon: Cpu,
      link: '/category/textile-machinery',
    },
    {
      id: 3,
      title: 'صنعت بسته‌بندی و کارتنسازی',
      image: STORE_ASSETS.industries.robotArm,
      icon: Package,
      link: '/category/packaging-carton',
    },
    {
      id: 4,
      title: 'صنایع غذایی و نوشیدنی',
      image: STORE_ASSETS.industries.foodBottles,
      icon: Wheat,
      link: '/category/food-beverage',
    },
    {
      id: 5,
      title: 'صنعت ماشین‌سازی و تجهیزات صنعتی',
      image: STORE_ASSETS.industries.manufacturing,
      icon: Factory,
      link: '/category/machinery-equipment',
    },
    {
      id: 6,
      title: 'صنایع لاستیک و پلاستیک',
      image: STORE_ASSETS.industries.bgPlant || STORE_ASSETS.categories.belts,
      icon: Settings,
      link: '/category/rubber-plastics',
    },
  ];

  return (
    <div className="w-full text-right font-sans pb-12 overflow-x-hidden relative">
      {/* ========================================================================= */}
      {/* 0. VERTICAL ORANGE SCROLL INDICATOR LINE (میزان اسکرول صفحه)              */}
      {/* ========================================================================= */}
      <div 
        className="fixed top-0 right-0 z-50 w-1 h-full pointer-events-none bg-[#12203C]/15"
        title="شاخص پیمایش صفحه"
      >
        {/* Glowing Orange Fill Line */}
        <div
          className="w-full bg-gradient-to-b from-[#C95210] via-[#E06518] to-[#FF8C00] shadow-[0_0_8px_#E06518] transition-all duration-75"
          style={{ height: `${Math.round(scrollProgress * 100)}%` }}
        />
      </div>

      {/* ========================================================================= */}
      {/* 1. HERO SECTION - RESPONSIVE CINEMATIC DESKTOP & DEDICATED MOBILE BANNER   */}
      {/* ========================================================================= */}
      <section
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="relative w-full overflow-hidden bg-white lg:bg-[#12203C] text-[#37383b] lg:text-white border-b border-slate-200 lg:border-slate-800/80 h-auto min-h-[460px] sm:min-h-[500px] lg:h-[530px] xl:h-[570px] flex flex-col justify-between select-none shrink-0"
      >
        {/* DESKTOP BACKGROUND: Factory Images with Smooth Cross-Fade & Uniform Sizing */}
        {heroSlides.map((slide, idx) => {
          const isActive = idx === heroSlideIndex;
          return (
            <div
              key={`desktop-bg-${slide.id}`}
              className={`hidden lg:block absolute inset-0 bg-cover bg-center bg-no-repeat h-full w-full transition-opacity duration-1000 ease-in-out will-change-transform ${
                isActive ? 'opacity-100 z-0 scale-100' : 'opacity-0 -z-10 scale-105'
              }`}
              style={{
                backgroundImage: `url(${slide.image})`,
              }}
            />
          );
        })}

        {/* DESKTOP OVERLAYS: Light, subtle gradient for text contrast while keeping 100% image clarity and brightness */}
        <div className="hidden lg:block absolute inset-0 bg-gradient-to-l from-black/70 via-black/20 to-transparent pointer-events-none z-10" />
        <div className="hidden lg:block absolute bottom-0 inset-x-0 h-28 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none z-10" />

        {/* DESKTOP HERO SIDE CHEVRON BUTTONS (Placed directly on the edges of the hero image) */}
        <button
          type="button"
          onClick={handlePrevSlide}
          className="hidden lg:flex absolute right-4 xl:right-8 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-[#12203C]/75 hover:bg-[#E06518] border border-white/20 hover:border-[#E06518] text-white items-center justify-center backdrop-blur-md shadow-2xl transition-all cursor-pointer active:scale-90 group"
          aria-label="اسلاید قبلی"
        >
          <ChevronRight className="w-5 h-5 group-hover:scale-110 transition-transform text-white" />
        </button>

        <button
          type="button"
          onClick={handleNextSlide}
          className="hidden lg:flex absolute left-4 xl:left-8 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-[#12203C]/75 hover:bg-[#E06518] border border-white/20 hover:border-[#E06518] text-white items-center justify-center backdrop-blur-md shadow-2xl transition-all cursor-pointer active:scale-90 group"
          aria-label="اسلاید بعدی"
        >
          <ChevronLeft className="w-5 h-5 group-hover:scale-110 transition-transform text-white" />
        </button>

        {/* Top & Middle Content Container */}
        <div className="relative z-10 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-8 lg:pt-12 pb-4 sm:pb-6 lg:pb-10 flex-1 flex flex-col justify-center">
          
          {/* ================================================================= */}
          {/* DESKTOP VIEW (lg+): ORIGINAL FULL-BLEED CINEMATIC HERO LAYOUT     */}
          {/* ================================================================= */}
          <div className="hidden lg:block">
            <div
              key={`desktop-hero-${heroSlideIndex}`}
              className="max-w-xl lg:max-w-2xl space-y-4 sm:space-y-6 transition-all duration-500 ease-out animate-in fade-in slide-in-from-right-3"
            >
              {/* Top Eyebrow Tag */}
              <div className="flex items-center gap-2 justify-start">
                <span className="w-6 sm:w-8 h-[2px] bg-[#E06518]" />
                <span className="text-[11px] sm:text-[13px] font-bold text-orange-400/90 tracking-wide line-clamp-1">
                  {heroSlides[heroSlideIndex].eyebrow}
                </span>
              </div>

              {/* Main Headline (With Fade & Shift to Right on Scroll) */}
              <div
                className="transition-all duration-100 ease-out will-change-transform"
                style={{
                  opacity: Math.max(0, 1 - scrollY / 320),
                  transform: `translateX(${Math.min(70, scrollY * 0.2)}px)`,
                }}
              >
                <h1 className="text-3xl sm:text-5xl lg:text-[56px] font-black leading-[1.25] sm:leading-[1.18] tracking-tight text-white drop-shadow-md">
                  <span>{heroSlides[heroSlideIndex].titlePart1}</span>
                  <span className="block text-[#E06518] pt-1.5">{heroSlides[heroSlideIndex].titlePart2}</span>
                </h1>
              </div>

              {/* Action Buttons & Subtitle */}
              <div className="pt-2 sm:pt-4 space-y-3.5 sm:space-y-5">
                {/* Subtitle Description */}
                <p className="text-xs sm:text-[15px] text-slate-200/95 leading-relaxed max-w-xl font-normal min-h-[38px] sm:min-h-[48px]">
                  {heroSlides[heroSlideIndex].description}
                </p>

                {/* Action Buttons Row */}
                <div className="pt-1 flex items-center gap-3.5">
                  {/* Primary Button */}
                  {heroSlides[heroSlideIndex].primaryBtn.link ? (
                    <Link
                      to={heroSlides[heroSlideIndex].primaryBtn.link!}
                      className="h-12 sm:h-13 px-6 sm:px-8 bg-gradient-to-r from-[#C95210] to-[#E06518] hover:from-[#C2410C] hover:to-[#C95210] text-white font-black text-xs sm:text-sm rounded-xl shadow-[0_6px_18px_rgba(249,115,22,0.35)] hover:shadow-[0_8px_22px_rgba(249,115,22,0.5)] hover:scale-[1.02] transition-all flex items-center justify-center gap-2 cursor-pointer group active:scale-95"
                    >
                      <span>{heroSlides[heroSlideIndex].primaryBtn.text}</span>
                      <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform text-white" />
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        if (heroSlides[heroSlideIndex].primaryBtn.action === 'visualSearch') {
                          setIsVisualSearchOpen(true);
                        } else if (heroSlides[heroSlideIndex].primaryBtn.action === 'consult') {
                          setIsConsultOpen(true);
                        }
                      }}
                      className="h-12 sm:h-13 px-6 sm:px-8 bg-gradient-to-r from-[#C95210] to-[#E06518] hover:from-[#C2410C] hover:to-[#C95210] text-white font-black text-xs sm:text-sm rounded-xl shadow-[0_6px_18px_rgba(249,115,22,0.35)] hover:shadow-[0_8px_22px_rgba(249,115,22,0.5)] hover:scale-[1.02] transition-all flex items-center justify-center gap-2 cursor-pointer group active:scale-95"
                    >
                      <Camera className="w-4 h-4 text-white" />
                      <span>{heroSlides[heroSlideIndex].primaryBtn.text}</span>
                    </button>
                  )}

                  {/* Secondary Button */}
                  {heroSlides[heroSlideIndex].secondaryBtn.action === 'consult' ? (
                    <button
                      type="button"
                      onClick={() => setIsConsultOpen(true)}
                      className="h-12 sm:h-13 px-5 sm:px-7 bg-[#12203C]/70 hover:bg-[#12203C]/85 text-white font-bold text-xs sm:text-sm rounded-xl border border-white/20 hover:border-orange-500/70 backdrop-blur-md transition-all flex items-center justify-center gap-2.5 cursor-pointer group shadow-md active:scale-95"
                    >
                      <span className="w-6 h-6 rounded-full bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-[#E06518] group-hover:scale-110 transition-transform">
                        <Play className="w-3 h-3 fill-[#E06518] text-[#E06518] ml-0.5" />
                      </span>
                      <span>{heroSlides[heroSlideIndex].secondaryBtn.text}</span>
                      <ArrowLeft className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-colors" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsVisualSearchOpen(true)}
                      className="h-12 sm:h-13 px-5 sm:px-7 bg-[#12203C]/70 hover:bg-[#12203C]/85 text-white font-bold text-xs sm:text-sm rounded-xl border border-white/20 hover:border-orange-500/70 backdrop-blur-md transition-all flex items-center justify-center gap-2.5 cursor-pointer group shadow-md active:scale-95"
                    >
                      <span>{heroSlides[heroSlideIndex].secondaryBtn.text}</span>
                      <ArrowLeft className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-colors" />
                    </button>
                  )}
                </div>
              </div>

              {/* Slide Navigation Dots with 5-Second Timer Progress Bar & Controls */}
              <div className="pt-3 sm:pt-4 flex items-center justify-start gap-3">
                <div className="flex items-center gap-2 bg-[#12203C]/70 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                  {heroSlides.map((slide, idx) => {
                    const isActive = idx === heroSlideIndex;
                    return (
                      <button
                        key={slide.id}
                        type="button"
                        onClick={() => setHeroSlideIndex(idx)}
                        className={`relative h-2 rounded-full transition-all duration-300 overflow-hidden cursor-pointer ${
                          isActive ? 'w-8 bg-orange-500/30' : 'w-2 bg-white/30 hover:bg-white/50'
                        }`}
                        aria-label={`اسلاید ${idx + 1}`}
                      >
                        {isActive && (
                          <div
                            key={`progress-desktop-${idx}-${heroSlideIndex}`}
                            className="absolute inset-0 bg-[#E06518] rounded-full"
                            style={{
                              animation: 'heroProgress 5s linear forwards',
                            }}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Slide Counter (01 / 04) */}
                <span className="text-[11px] font-mono font-bold text-slate-300">
                  0{heroSlideIndex + 1} / 0{heroSlides.length}
                </span>

                {/* Prev / Next Arrows */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={handlePrevSlide}
                    className="w-7 h-7 rounded-full bg-[#12203C]/70 hover:bg-[#E06518] border border-white/15 hover:border-[#E06518] text-white flex items-center justify-center transition-all cursor-pointer active:scale-90"
                    aria-label="اسلاید قبلی"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextSlide}
                    className="w-7 h-7 rounded-full bg-[#12203C]/70 hover:bg-[#E06518] border border-white/15 hover:border-[#E06518] text-white flex items-center justify-center transition-all cursor-pointer active:scale-90"
                    aria-label="اسلاید بعدی"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* ================================================================= */}
          {/* MOBILE VIEW (< lg): HIGH-CLARITY DEDICATED BANNER CARD & STACK    */}
          {/* ================================================================= */}
          <div className="lg:hidden space-y-4">
            
            {/* 1. Dedicated High-Resolution Banner Container (100% VISIBLE & CLEAR) */}
            <div className="relative aspect-[16/10] sm:aspect-[16/9] min-h-[200px] sm:min-h-[250px] max-h-[270px] w-full rounded-2xl overflow-hidden border border-slate-200 shadow-md bg-slate-900 shrink-0">
              {heroSlides.map((slide, idx) => {
                const isActive = idx === heroSlideIndex;
                return (
                  <img
                    key={slide.id}
                    src={slide.image}
                    alt={slide.titlePart1}
                    referrerPolicy="no-referrer"
                    className={`absolute inset-0 w-full h-full object-cover object-center transition-all duration-500 ${
                      isActive ? 'opacity-100 scale-100 z-10' : 'opacity-0 scale-95 z-0 pointer-events-none'
                    }`}
                  />
                );
              })}

              {/* Natural subtle gradient so HUD elements pop cleanly while image stays clear and vivid */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/15 pointer-events-none z-20" />

              {/* Floating Top Category Pill */}
              <div className="absolute top-3 right-3 z-30">
                <span className="px-3 py-1 rounded-full bg-[#E06518] text-white text-[11px] font-bold shadow-md">
                  {heroSlides[heroSlideIndex].tag}
                </span>
              </div>

              {/* Floating Slide Counter Pill */}
              <div className="absolute top-3 left-3 z-30">
                <span className="px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-white font-mono text-[10px] font-bold border border-white/15">
                  0{heroSlideIndex + 1} / 0{heroSlides.length}
                </span>
              </div>

              {/* Mobile Hero Side Arrow Buttons (Right & Left on edges of image) */}
              <button
                type="button"
                onClick={handlePrevSlide}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-30 w-8 h-8 rounded-full bg-black/60 hover:bg-[#E06518] border border-white/25 text-white flex items-center justify-center backdrop-blur-md transition-all active:scale-90 cursor-pointer shadow-md"
                aria-label="اسلاید قبلی"
              >
                <ChevronRight className="w-4 h-4 text-white" />
              </button>

              <button
                type="button"
                onClick={handleNextSlide}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-30 w-8 h-8 rounded-full bg-black/60 hover:bg-[#E06518] border border-white/25 text-white flex items-center justify-center backdrop-blur-md transition-all active:scale-90 cursor-pointer shadow-md"
                aria-label="اسلاید بعدی"
              >
                <ChevronLeft className="w-4 h-4 text-white" />
              </button>

              {/* Bottom Glass Overlay on Mobile Banner */}
              <div className="absolute bottom-2.5 right-3 left-3 z-30 flex items-center justify-between bg-[#12203C]/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/15">
                <span className="text-[11px] font-bold text-white truncate">
                  {heroSlides[heroSlideIndex].badge.title}
                </span>
                <span className="text-[10px] font-mono text-orange-400 font-bold shrink-0">
                  {heroSlides[heroSlideIndex].statsBadge.value}
                </span>
              </div>
            </div>

            {/* 2. Mobile Text & Information Block (Clean Light UI for Mobile) */}
            <div
              key={`mobile-content-${heroSlideIndex}`}
              className="space-y-2.5 text-right pt-1 animate-in fade-in duration-300"
            >
              {/* Eyebrow */}
              <div className="flex items-center gap-1.5 justify-start text-[11px] font-bold text-[#E06518]">
                <span className="w-2 h-2 rounded-full bg-[#E06518] animate-pulse" />
                <span className="line-clamp-1">{heroSlides[heroSlideIndex].eyebrow}</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-xl sm:text-2xl font-black text-[#12203C] leading-snug">
                <span>{heroSlides[heroSlideIndex].titlePart1} </span>
                <span className="text-[#E06518]">{heroSlides[heroSlideIndex].titlePart2}</span>
              </h1>

              {/* Description */}
              <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                {heroSlides[heroSlideIndex].description}
              </p>

              {/* Action Buttons Full Width on Mobile */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch gap-2">
                {/* Primary Button */}
                {heroSlides[heroSlideIndex].primaryBtn.link ? (
                  <Link
                    to={heroSlides[heroSlideIndex].primaryBtn.link!}
                    className="h-11 px-6 bg-gradient-to-r from-[#C95210] to-[#E06518] hover:from-[#C2410C] hover:to-[#C95210] text-white font-black text-xs rounded-xl shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all"
                  >
                    <span>{heroSlides[heroSlideIndex].primaryBtn.text}</span>
                    <ArrowLeft className="w-4 h-4" />
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      if (heroSlides[heroSlideIndex].primaryBtn.action === 'visualSearch') {
                        setIsVisualSearchOpen(true);
                      } else if (heroSlides[heroSlideIndex].primaryBtn.action === 'consult') {
                        setIsConsultOpen(true);
                      }
                    }}
                    className="h-11 px-6 bg-gradient-to-r from-[#C95210] to-[#E06518] hover:from-[#C2410C] hover:to-[#C95210] text-white font-black text-xs rounded-xl shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all"
                  >
                    <Camera className="w-4 h-4" />
                    <span>{heroSlides[heroSlideIndex].primaryBtn.text}</span>
                  </button>
                )}

                {/* Secondary Button */}
                {heroSlides[heroSlideIndex].secondaryBtn.link ? (
                  <Link
                    to={heroSlides[heroSlideIndex].secondaryBtn.link!}
                    className="h-11 px-5 bg-white border border-slate-200 text-[#12203C] hover:bg-slate-50 font-bold text-xs rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all shadow-2xs"
                  >
                    <span>{heroSlides[heroSlideIndex].secondaryBtn.text}</span>
                    <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      if (heroSlides[heroSlideIndex].secondaryBtn.action === 'consult') {
                        setIsConsultOpen(true);
                      } else if (heroSlides[heroSlideIndex].secondaryBtn.action === 'visualSearch') {
                        setIsVisualSearchOpen(true);
                      }
                    }}
                    className="h-11 px-5 bg-white border border-slate-200 text-[#12203C] hover:bg-slate-50 font-bold text-xs rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all shadow-2xs"
                  >
                    <span>{heroSlides[heroSlideIndex].secondaryBtn.text}</span>
                    <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
                  </button>
                )}
              </div>

              {/* Slide Progress Dots on Mobile */}
              <div className="pt-2 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  {heroSlides.map((slide, idx) => {
                    const isActive = idx === heroSlideIndex;
                    return (
                      <button
                        key={slide.id}
                        type="button"
                        onClick={() => setHeroSlideIndex(idx)}
                        className={`relative h-1.5 rounded-full transition-all overflow-hidden ${
                          isActive ? 'w-6 bg-orange-500/30' : 'w-2 bg-slate-300'
                        }`}
                        aria-label={`اسلاید ${idx + 1}`}
                      >
                        {isActive && (
                          <div
                            key={`progress-mobile-${idx}-${heroSlideIndex}`}
                            className="absolute inset-0 bg-[#E06518] rounded-full"
                            style={{ animation: 'heroProgress 5s linear forwards' }}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={handlePrevSlide}
                    className="w-7 h-7 rounded-full bg-slate-100 hover:bg-[#E06518] hover:text-white border border-slate-200 text-slate-700 flex items-center justify-center transition-colors active:scale-90 cursor-pointer"
                    aria-label="اسلاید قبلی"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextSlide}
                    className="w-7 h-7 rounded-full bg-slate-100 hover:bg-[#E06518] hover:text-white border border-slate-200 text-slate-700 flex items-center justify-center transition-colors active:scale-90 cursor-pointer"
                    aria-label="اسلاید بعدی"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>

          </div>

        </div>

        {/* Far Left Vertical Scroll Visual Indicator (آیکون ماوس اسکرول + نشانگر برای دسکتاپ) */}
        <div className="absolute left-6 lg:left-8 top-1/2 -translate-y-1/2 z-20 hidden lg:flex flex-col items-center gap-2.5 text-slate-400">
          <div className="flex flex-col items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-white/30" />
            <span className="w-1.5 h-1.5 rounded-full bg-white/30" />
            <span className="w-1.5 h-4 rounded-full bg-[#E06518] shadow-[0_0_6px_#E06518]" />
            <span className="w-1.5 h-1.5 rounded-full bg-white/30" />
            <span className="w-1.5 h-1.5 rounded-full bg-white/30" />
          </div>

          <div className="w-5 h-8 rounded-full border-2 border-white/35 flex items-start justify-center pt-1">
            <span className="w-1 h-1.5 rounded-full bg-white/80 animate-bounce" />
          </div>
          <span className="text-[8px] font-mono font-bold tracking-[0.2em] text-slate-400 uppercase rotate-180 [writing-mode:vertical-lr]">
            SCROLL
          </span>
        </div>

        {/* Bottom Left Badge on Desktop */}
        <div
          key={`badge-${heroSlideIndex}`}
          className="absolute left-4 sm:left-8 bottom-8 z-20 hidden lg:flex items-center gap-2 bg-[#12203C]/80 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/15 shadow-md transition-all duration-500 animate-in fade-in"
        >
          <div className="w-1.5 h-5 bg-[#E06518] rounded-full" />
          <div className="text-right">
            <div className="text-[11px] font-bold text-white">{heroSlides[heroSlideIndex].badge.title}</div>
            <div className="text-[9px] text-slate-400 font-medium">{heroSlides[heroSlideIndex].badge.subtitle}</div>
          </div>
          <ArrowLeft className="w-3 h-3 text-orange-400 mr-1" />
        </div>
      </section>

      {/* ========================================================================= */}
      {/* CLIENTS LOGO TICKER BAR BELOW HERO                                        */}
      {/* ========================================================================= */}
      <div className="relative z-20 w-full bg-white border-b border-slate-200 shadow-xs">
        <OurClientsSection />
      </div>

      {/* ========================================================================= */}
      {/* SECTION 2 & 3 CONTAINER - INSIDE MAX-W-7XL                                */}
      {/* ========================================================================= */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 my-8 sm:my-10">
        {/* ========================================================================= */}
        {/* 2. DUAL AI FEATURE BANNER (مشاوره هوشمند قطعات & پیدا کردن قطعه با AI)       */}
        {/* ========================================================================= */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#55565A] via-[#484A4E] to-[#3A3C40] text-white border border-[#CBD2D8] shadow-lg p-6 sm:p-8">
          {/* Top & Bottom Orange Neon Accent Borders */}
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#E06518] to-transparent opacity-90 z-10 pointer-events-none" />
          <div className="absolute bottom-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#E06518]/50 to-transparent z-10 pointer-events-none" />

          {/* Ambient Orange & Soft Glow Blooms */}
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-[#E06518]/30 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-[#E06518]/25 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-64 h-64 bg-[#E06518]/20 rounded-full blur-3xl pointer-events-none" />

          {/* Glowing Orange Cybernetic Veins & Neural Traces SVG */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <svg
              className="w-full h-full opacity-65 mix-blend-screen"
              viewBox="0 0 1200 400"
              preserveAspectRatio="none"
              fill="none"
            >
              <defs>
                <linearGradient id="aiOrangeVein1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#E06518" stopOpacity="0" />
                  <stop offset="20%" stopColor="#EA580C" stopOpacity="0.6" />
                  <stop offset="50%" stopColor="#FB923C" stopOpacity="0.95" />
                  <stop offset="80%" stopColor="#F97316" stopOpacity="0.7" />
                  <stop offset="100%" stopColor="#E06518" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="aiOrangeVein2" x1="100%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#C2410C" stopOpacity="0" />
                  <stop offset="30%" stopColor="#F97316" stopOpacity="0.75" />
                  <stop offset="60%" stopColor="#FDBA74" stopOpacity="1" />
                  <stop offset="85%" stopColor="#EA580C" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#C2410C" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="aiOrangeVeinThin" x1="0%" y1="50%" x2="100%" y2="50%">
                  <stop offset="0%" stopColor="#E06518" stopOpacity="0.1" />
                  <stop offset="50%" stopColor="#FED7AA" stopOpacity="0.85" />
                  <stop offset="100%" stopColor="#E06518" stopOpacity="0.1" />
                </linearGradient>
                <filter id="aiVeinGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3.5" result="glow" />
                  <feMerge>
                    <feMergeNode in="glow" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Flowing Main Arteries */}
              <path
                d="M-50,70 C180,20 420,170 680,80 C920,-10 1080,130 1260,60"
                stroke="url(#aiOrangeVein1)"
                strokeWidth="2.8"
                filter="url(#aiVeinGlow)"
              />
              <path
                d="M-50,70 C180,20 420,170 680,80 C920,-10 1080,130 1260,60"
                stroke="#FFF7ED"
                strokeWidth="0.8"
                strokeOpacity="0.5"
              />

              <path
                d="M-30,190 C160,250 390,110 630,240 C870,370 1090,210 1250,290"
                stroke="url(#aiOrangeVein2)"
                strokeWidth="2.4"
                filter="url(#aiVeinGlow)"
              />

              {/* Diagonal Cross-Branching Veins */}
              <path
                d="M80,-30 C220,130 350,260 520,200 C690,150 860,310 1030,420"
                stroke="url(#aiOrangeVein1)"
                strokeWidth="2"
                strokeDasharray="7 5"
              />

              <path
                d="M-20,310 C170,250 370,360 600,280 C830,190 1020,250 1230,170"
                stroke="url(#aiOrangeVeinThin)"
                strokeWidth="1.6"
              />

              {/* Connective Circuit Branches */}
              <path
                d="M420,170 C480,230 520,200 630,240"
                stroke="#F97316"
                strokeWidth="1.6"
                strokeOpacity="0.75"
              />
              <path
                d="M680,80 C740,130 810,180 860,310"
                stroke="#F97316"
                strokeWidth="1.6"
                strokeOpacity="0.7"
              />
              <path
                d="M180,20 C260,70 300,140 390,110"
                stroke="#FB923C"
                strokeWidth="1.4"
                strokeOpacity="0.65"
              />
              <path
                d="M920,-10 C960,60 1020,100 1090,210"
                stroke="#FB923C"
                strokeWidth="1.4"
                strokeOpacity="0.6"
              />

              {/* Glowing Neural Intersection Nodes */}
              <circle cx="180" cy="20" r="3" fill="#FED7AA" filter="url(#aiVeinGlow)" />
              <circle cx="420" cy="170" r="4.5" fill="#FFF7ED" filter="url(#aiVeinGlow)" />
              <circle cx="680" cy="80" r="5" fill="#FFF7ED" filter="url(#aiVeinGlow)" />
              <circle cx="630" cy="240" r="4.5" fill="#FED7AA" filter="url(#aiVeinGlow)" />
              <circle cx="860" cy="310" r="3.5" fill="#FED7AA" filter="url(#aiVeinGlow)" />
              <circle cx="1090" cy="210" r="4.5" fill="#FFF7ED" filter="url(#aiVeinGlow)" />
              <circle cx="390" cy="110" r="3" fill="#FED7AA" />
              <circle cx="520" cy="200" r="3.5" fill="#FED7AA" />
            </svg>
          </div>

          {/* Micro Dot Matrix Grid Overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(#E0651840_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none opacity-45" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 divide-y lg:divide-y-0 lg:divide-x lg:divide-x-reverse divide-white/20">
            {/* Card A (Right in RTL): مشاوره با هوش مصنوعی */}
            <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 lg:pb-0 lg:pl-6">
              {/* Visual: Glowing AI Cybernetic Face */}
              <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden shrink-0 border border-[#E06518]/40 shadow-lg bg-[#12203C] group">
                <img
                  src={STORE_ASSETS.aiConsultRobot}
                  alt="مشاوره هوشمند قطعات خط تولید"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute bottom-1.5 inset-x-1.5 bg-[#12203C]/90 backdrop-blur-xs text-[10px] text-center font-bold text-[#E06518] py-0.5 rounded border border-[#E06518]/40">
                  هوشمند خط تولید
                </div>
              </div>

              {/* Details */}
              <div className="flex-1 space-y-2.5 text-right">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#E06518]/20 border border-[#E06518]/40 text-[10px] font-bold text-orange-200">
                  <Sparkles className="w-3 h-3 text-[#E06518]" />
                  <span>پیش به صنعت | هوش مصنوعی مهندسی</span>
                </div>
                <h3 className="text-lg sm:text-xl font-black text-white">مشاوره هوشمند قطعات خط تولید</h3>
                <p className="text-xs text-slate-200 leading-relaxed">
                  مشخصات یا ایراد خط تولید کارخانه خود را اعلام کنید تا سامانه هوشمند «صنعت پیش» بهترین قطعات جایگزین و استاندارد را به شما پیشنهاد دهد.
                </p>
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => navigate('/ai-consult')}
                    className="h-10 px-5 bg-white text-[#55565A] hover:bg-[#DEE2E5] border border-transparent hover:border-[#E06518] text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-sm group"
                  >
                    <span>شروع مشاوره آنلاین قطعه</span>
                    <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform text-[#E06518]" />
                  </button>
                </div>
              </div>
            </div>

            {/* Card B (Left in RTL): پیدا کردن محصول با AI */}
            <div className="flex flex-col sm:flex-row items-center gap-6 pt-6 lg:pt-0 lg:pr-6">
              {/* Details */}
              <div className="flex-1 space-y-2.5 text-right order-2 sm:order-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-white/10 border border-white/20 text-[10px] font-bold text-slate-200">
                  <Camera className="w-3 h-3 text-orange-300" />
                  <span>بینایی ماشین و جستجوی پارت‌نامبر</span>
                </div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg sm:text-xl font-black text-white">شناسایی تصویری قطعه با هوش مصنوعی</h3>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">
                  از قطعه مستهلک، پولی، تسمه یا پلاک ماشین‌آلات خط تولید عکس بگیرید تا قطعه فابریک استاندارد در انبار ۳۰,۰۰۰ قلمی صنعت پیش فوراً شناسایی شود.
                </p>
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => setIsVisualSearchOpen(true)}
                    className="h-10 px-5 bg-[#E06518] hover:bg-[#C95210] text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-sm group"
                  >
                    <Camera className="w-4 h-4 text-white" />
                    <span>ارسال تصویر قطعه خط تولید</span>
                  </button>
                </div>
              </div>

              {/* Visual: Smartphone HUD Part Scanner */}
              <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden shrink-0 border border-[#E06518]/40 shadow-lg bg-[#12203C] order-1 sm:order-2 group">
                <img
                  src={STORE_ASSETS.aiSearchMobile}
                  alt="شناسایی هوشمند قطعه"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-2 left-2 w-5 h-5 rounded-full bg-[#12203C]/85 backdrop-blur-xs flex items-center justify-center border border-white/20">
                  <span className="w-2 h-2 rounded-full bg-[#E06518] animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 3. PRODUCT CATEGORIES (7 items matching screenshot)                       */}
        {/* ========================================================================= */}
        {/* ========================================================================= */}
        {/* 3. PRODUCT CATEGORIES (Matching design from reference screenshot image.png) */}
        {/* ========================================================================= */}
        <section className="space-y-4 py-2">
          {/* Section Header matching image.png */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div className="space-y-1">
              <h2 className="text-2xl sm:text-3xl font-black text-[#484344]">دسته‌بندی قطعات خطوط تولید</h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                تأمین کلیه قطعات مصرفی و یدکی انواع خطوط تولید و کارخانجات
              </p>
            </div>

            <Link
              to="/categories"
              className="text-xs sm:text-sm font-bold text-[#E06518] hover:text-[#C95210] flex items-center gap-1.5 transition-colors group shrink-0 self-start sm:self-auto"
            >
              <span>مشاهده همه ۸۶۴ قطعه</span>
              <ArrowLeft className="w-4 h-4 text-[#E06518] group-hover:-translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Thin Horizontal Divider Line matching image.png */}
          <div className="w-full h-px bg-slate-200/80 my-2" />

          {/* Categories Horizontal Carousel Container */}
          <div className="relative group/catscroll">
            {/* Scroll Navigation Left / Right Buttons */}
            <button
              type="button"
              onClick={handleCatScrollRight}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/95 hover:bg-[#E06518] hover:text-white border border-slate-200 text-[#484344] shadow-md flex items-center justify-center transition-all cursor-pointer opacity-0 group-hover/catscroll:opacity-100 -mr-3"
              aria-label="قبلی"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleCatScrollLeft}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/95 hover:bg-[#E06518] hover:text-white border border-slate-200 text-[#484344] shadow-md flex items-center justify-center transition-all cursor-pointer opacity-0 group-hover/catscroll:opacity-100 -ml-3"
              aria-label="بعدی"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Scrollable Cards Carousel Grid */}
            <div
              ref={categoriesScrollRef}
              className="flex items-stretch gap-3 sm:gap-4 overflow-x-auto pb-4 pt-1 px-1 scrollbar-none snap-x snap-mandatory"
            >
              {CATEGORIES.map((cat, idx) => (
                <Link
                  key={cat.id}
                  to={`/category/${cat.slug}`}
                  className={`snap-start shrink-0 w-[145px] sm:w-[165px] md:w-[180px] lg:w-[195px] rounded-2xl bg-white p-2.5 sm:p-3.5 border transition-all duration-300 flex flex-col justify-between cursor-pointer text-right group ${
                    idx === 0
                      ? 'border-2 border-[#E06518] shadow-[0_8px_25px_rgba(224,101,24,0.18)]'
                      : 'border-slate-200/90 hover:border-[#E06518] hover:shadow-md'
                  }`}
                >
                  {/* Category Image Box with light off-white background */}
                  <div className="w-full aspect-square rounded-xl bg-[#F8F9FA] border border-slate-100 p-2 flex items-center justify-center overflow-hidden mb-3 group-hover:bg-orange-50/40 transition-colors">
                    {cat.image ? (
                      <img
                        src={cat.image}
                        alt={cat.name}
                        loading="lazy"
                        className="w-full h-full object-contain group-hover:scale-108 transition-transform duration-300"
                      />
                    ) : (
                      <Package className="w-8 h-8 text-slate-300 group-hover:text-[#E06518] transition-colors" />
                    )}
                  </div>

                  {/* Bottom Title & Arrow Circle Row matching image.png */}
                  <div className="flex items-center justify-between gap-1.5 w-full pt-1 min-h-[42px]">
                    <h3
                      className="font-extrabold text-xs sm:text-[13px] leading-tight sm:leading-snug text-[#484344] group-hover:text-[#E06518] transition-colors min-w-0 flex-1 break-words"
                      title={cat.name}
                    >
                      {cat.name}
                    </h3>
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#E06518] text-white flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-110 transition-transform self-center">
                      <ArrowLeft className="w-3.5 h-3.5 text-white" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* ========================================================================= */}
      {/* 4. COVERED INDUSTRIES - 100% FULL WIDTH MATCHING REFERENCE UI/UX           */}
      {/* ========================================================================= */}
      <section
        className="relative w-full overflow-hidden bg-[#414146] text-white py-14 sm:py-20 my-8 sm:my-12 shadow-2xl border-y border-[#55565A]/80"
        dir="rtl"
      >
        {/* Background Plant Backdrop with natural transparent gradient overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src={STORE_ASSETS.industries.bgPlant}
            alt="Industrial Plant Refinery"
            className="w-full h-full object-cover object-center opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-l from-[#414146]/95 via-[#414146]/75 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#414146] via-transparent to-[#414146]/90" />
        </div>

        {/* Diagonal Glowing Laser Light Rays at bottom right (just like in screenshot) */}
        <div className="absolute bottom-0 right-0 w-[55%] h-32 pointer-events-none z-1 overflow-hidden opacity-80">
          <div className="absolute -bottom-10 right-10 w-[650px] h-[3px] bg-gradient-to-r from-transparent via-[#E06518] to-transparent rotate-[-18deg] shadow-[0_0_15px_#E06518]" />
          <div className="absolute -bottom-16 right-32 w-[550px] h-[2px] bg-gradient-to-r from-transparent via-[#C95210] to-transparent rotate-[-18deg] shadow-[0_0_10px_#C95210]" />
          <div className="absolute -bottom-24 right-56 w-[450px] h-[2px] bg-gradient-to-r from-transparent via-orange-400 to-transparent rotate-[-18deg]" />
        </div>

        {/* Subtle Industrial Background Dot Pattern */}
        <div className="absolute inset-0 z-1 bg-[radial-gradient(#ffffff18_1.2px,transparent_1.2px)] [background-size:24px_24px] pointer-events-none" />

        {/* Carousel Navigation Chevron Arrows (Left & Right) */}
        {/* Right Arrow: only shown when user has scrolled towards the left / can scroll back right */}
        <button
          type="button"
          onClick={handleScrollRight}
          className={`absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-[#12203C]/85 hover:bg-[#E06518] border border-white/20 hover:border-[#E06518] text-white flex items-center justify-center backdrop-blur-md shadow-2xl transition-all duration-300 cursor-pointer group ${
            canScrollRight ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-75 pointer-events-none'
          }`}
          aria-label="صنایع قبلی"
        >
          <ChevronRight className="w-5 h-5 group-hover:scale-110 transition-transform" />
        </button>

        {/* Left Arrow: always visible to scroll left (forward in RTL) */}
        <button
          type="button"
          onClick={handleScrollLeft}
          className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-[#12203C]/85 hover:bg-[#E06518] border border-white/20 hover:border-[#E06518] text-white flex items-center justify-center backdrop-blur-md shadow-2xl transition-all duration-300 cursor-pointer group"
          aria-label="صنایع بعدی"
        >
          <ChevronLeft className="w-5 h-5 group-hover:scale-110 transition-transform" />
        </button>

        {/* Main Content Layout: In RTL, flex-col lg:flex-row puts first child (Text Header) on the RIGHT, and second child (Cards) on the LEFT */}
        <div className="relative z-10 max-w-[1520px] mx-auto px-4 sm:px-8 lg:px-12 flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
          {/* Right Header Text Column (در دسکتاپ دقیقاً در سمت راست قرار می‌گیرد) */}
          <div className="w-full lg:w-[420px] xl:w-[460px] space-y-4 text-right shrink-0">
            {/* Top English Brand Label: ATLAS TRADING ——— */}
            <div className="flex items-center gap-2 justify-start">
              <span className="text-xs sm:text-sm font-black tracking-[0.25em] text-[#E06518] uppercase font-mono drop-shadow-xs">
                ATLAS TRADING
              </span>
              <span className="w-12 h-[2.5px] bg-[#E06518] shadow-[0_0_8px_#E06518]" />
            </div>

            {/* Subtitle */}
            <p className="text-xs sm:text-sm font-extrabold text-white tracking-wide drop-shadow-sm">
              تأمین‌کننده قطعات و تجهیزات صنعتی
            </p>

            {/* Main Headline (تأمین قطعات خطوط صنایع مختلف) */}
            <h2 className="text-3xl sm:text-4xl lg:text-[44px] xl:text-[46px] font-black text-white leading-[1.2] tracking-tight drop-shadow-md">
              تأمین قطعات خطوط
              <span className="block text-[#E06518] pt-1 drop-shadow-[0_2px_10px_rgba(224,101,24,0.4)]">صنایع مختلف</span>
            </h2>

            {/* Description Paragraph */}
            <p className="text-xs sm:text-sm text-slate-100 leading-relaxed font-medium drop-shadow-xs">
              از خطوط کاشی و سرامیک، نساجی و فولاد تا صنایع غذایی، فولاد، پتروشیمی و نیروگاهی؛ با بهترین برندها و کیفیت تضمین‌شده، همراه شما در تأمین قطعات صنعتی هستیم.
            </p>

            {/* CTA Button: مشاهده قطعات خطوط (Large Orange Glowing Button) */}
            <div className="pt-3">
              <Link
                to="/products"
                className="inline-flex items-center justify-center gap-2.5 h-12 sm:h-13 px-8 bg-gradient-to-r from-[#C95210] to-[#E06518] hover:from-[#C2410C] hover:to-[#C95210] text-white text-sm sm:text-base font-black rounded-2xl shadow-[0_10px_25px_rgba(249,115,22,0.4)] hover:shadow-[0_12px_30px_rgba(249,115,22,0.6)] hover:scale-[1.02] transition-all cursor-pointer group"
              >
                <span>مشاهده قطعات خطوط</span>
                <ArrowLeft className="w-5 h-5 text-white group-hover:-translate-x-1.5 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Scrollable Cards Row (در دسکتاپ در سمت چپ قرار می‌گیرد) */}
          <div
            id="industries-scroll-container"
            ref={industriesScrollRef}
            onScroll={checkIndustriesScroll}
            className="flex-1 w-full min-w-0 flex items-stretch gap-3.5 sm:gap-4 overflow-x-auto pb-4 pt-2 px-1 scrollbar-none snap-x snap-mandatory"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {coveredIndustries.map((ind) => {
              const IconComp = ind.icon;

              return (
                <Link
                  key={ind.id}
                  to={ind.link}
                  className="group relative w-[175px] sm:w-[200px] shrink-0 aspect-[1/1.7] rounded-2xl overflow-hidden shadow-2xl flex flex-col justify-end p-2.5 sm:p-3 transition-all duration-300 snap-start cursor-pointer border-2 border-white/20 hover:border-[#E06518] hover:shadow-[0_0_25px_rgba(249,115,22,0.45)] hover:ring-2 hover:ring-orange-500/30 hover:scale-[1.03] hover:z-10"
                >
                  {/* Card Industrial Machinery Photo */}
                  <img
                    src={ind.image}
                    alt={ind.title}
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />

                  {/* Clean Natural Contrast gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                  {/* Top Subtle Amber Highlight glow on hover */}
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-[#E06518] to-transparent transition-opacity duration-300 opacity-0 group-hover:opacity-100" />

                  {/* Bottom Glass Card Pill with Icon + Title + Orange Arrow */}
                  <div className="relative z-10 flex items-center justify-between gap-1.5 bg-[#12203C]/90 backdrop-blur-md px-2.5 py-2 rounded-xl border border-white/20 shadow-lg group-hover:border-orange-500/60 group-hover:shadow-[0_0_12px_rgba(249,115,22,0.25)] transition-all duration-300">
                    {/* Left Icon (Orange Arrow Circle Button) */}
                    <div className="w-6 h-6 rounded-full bg-[#E06518] text-white flex items-center justify-center shrink-0 shadow-sm group-hover:bg-[#C95210] group-hover:shadow-[0_0_8px_#E06518] transition-all">
                      <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                    </div>

                    {/* Middle Title (Full Text - No Truncation) */}
                    <span className="text-xs sm:text-[13px] font-extrabold text-white group-hover:text-orange-200 transition-colors leading-tight text-center flex-1 min-w-0">
                      {ind.title}
                    </span>

                    {/* Right Mini Industry Category Icon */}
                    {IconComp && (
                      <div className="w-5 h-5 flex items-center justify-center shrink-0 text-orange-400 group-hover:text-[#E06518] transition-colors">
                        <IconComp className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Bottom Carousel / Slider Indicator Dots */}
        <div className="flex items-center justify-center gap-2.5 pt-8 sm:pt-12 relative z-10">
          <span className="w-10 h-2.5 rounded-full bg-gradient-to-r from-[#C95210] to-[#E06518] shadow-[0_0_12px_#E06518]" />
          <span className="w-7 h-2 rounded-full bg-white/30 hover:bg-white/50 transition-colors" />
          <span className="w-7 h-2 rounded-full bg-white/30 hover:bg-white/50 transition-colors" />
          <span className="w-7 h-2 rounded-full bg-white/30 hover:bg-white/50 transition-colors" />
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 5, 6, 7 CONTAINER                                                 */}
      {/* ========================================================================= */}
      <div className="w-full space-y-12 my-8 sm:my-10">
        {/* ========================================================================= */}
        {/* POPULAR PRODUCTS - استعلام قیمت آنلاین قطعات پربازدید                       */}
        {/* ========================================================================= */}
        <PopularProductsSection />

        {/* ========================================================================= */}
        {/* HIGH-UTILITY PRODUCTS - قطعات پرکاربرد خطوط تولید                          */}
        {/* ========================================================================= */}
        <HighUtilityProductsSection />

        {/* ========================================================================= */}
        {/* 5. MAIN TRUSTED BRANDS (FORZA & SWR CINEMATIC DUAL BANNER)                */}
        {/* ========================================================================= */}
        <MainBrandsBanner />
      </div>

      {/* ========================================================================= */}
      {/* 6. SANAT PISH INTERACTIVE SHOWCASE (معرفی توانمندی‌ها و خدمات صنعت پیش)     */}
      {/* ========================================================================= */}
      <SanatPishInteractiveShowcase
        onOpenConsult={() => setIsConsultOpen(true)}
        onOpenVisualSearch={() => setIsVisualSearchOpen(true)}
      />

      {/* ========================================================================= */}
      {/* 7. CTA CONSULTATION & INQUIRY BANNER (مشاوره تخصصی و استعلام قیمت)        */}
      {/* ========================================================================= */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 my-8 sm:my-10">
        <section
          className="relative overflow-hidden rounded-3xl bg-[#55565A] text-white border border-[#CBD2D8] shadow-md"
          dir="rtl"
        >
          {/* Subtle Accent Glows matching the consultation & identification section */}
          <div className="absolute -right-16 -top-16 w-64 h-64 bg-[#E06518]/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 items-center">
            
            {/* RIGHT in desktop, BOTTOM in mobile: Text and Action Buttons */}
            <div className="order-2 lg:order-1 lg:col-span-7 xl:col-span-7 p-6 sm:p-8 lg:p-10 space-y-4 text-right">
              {/* Eyebrow Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-[11px] font-bold text-orange-200">
                <Headphones className="w-3.5 h-3.5 text-[#E06518]" />
                <span>پشتیبانی فنی و مهندسی صنعت پیش (پیش به صنعت)</span>
              </div>

              <div className="space-y-2">
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight leading-tight">
                  مشاوره تخصصی و استعلام قیمت قطعات صنعتی
                </h3>
                <p className="text-xs sm:text-sm text-slate-100 font-medium leading-relaxed max-w-xl">
                  تیم مهندسین فنی صنعت پیش با بیش از ۳۷ سال پیشینه درخشان بازرگانی تسمه اطلس آماده بررسی مشخصات، نقشه‌ها و ساخت یا تأمین قطعات فابریک خطوط تولید کارخانجات سراسر کشور است.
                </p>
              </div>

              {/* Action Buttons Row */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                {/* Primary Button: درخواست مشاوره */}
                <button
                  type="button"
                  onClick={() => setIsConsultOpen(true)}
                  className="h-11 px-6 bg-[#E06518] hover:bg-[#C95210] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md hover:shadow-orange-500/25 transition-all flex items-center gap-2 cursor-pointer group shrink-0"
                >
                  <span>شروع مشاوره تخصصی آنلاین</span>
                  <ChevronLeft className="w-4 h-4 text-white group-hover:-translate-x-0.5 transition-transform" />
                </button>

                {/* Call Button */}
                <a
                  href="tel:03535254703"
                  className="h-11 px-5 bg-white text-[#55565A] hover:bg-[#DEE2E5] border border-white/20 font-bold text-xs sm:text-sm rounded-xl transition-all flex items-center gap-2.5 cursor-pointer shrink-0 shadow-sm"
                  dir="ltr"
                >
                  <div className="w-6 h-6 rounded-lg bg-[#E06518]/10 flex items-center justify-center text-[#E06518] shrink-0">
                    <Phone className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-mono tracking-wider font-extrabold text-[#55565A] text-xs sm:text-sm">
                    ۰۳۵-۳۵۲۵۴۷۰۳
                  </span>
                </a>
              </div>

              {/* Trust Badges */}
              <div className="pt-3 border-t border-white/15 flex flex-wrap items-center gap-4 text-[11px] text-slate-200">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-orange-300" />
                  <span>تضمین اصالت و مطابقت کالا</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-orange-300" />
                  <span>ارسال رایگان به سراسر کشور</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-orange-300" />
                  <span>پشتوانه بازرگانی اطلس از ۱۳۶۶</span>
                </div>
              </div>
            </div>

            {/* LEFT in desktop, TOP in mobile: Industrial Photo */}
            <div className="order-1 lg:order-2 lg:col-span-5 xl:col-span-5 relative h-56 sm:h-64 lg:h-72 overflow-hidden">
              <img
                src={STORE_ASSETS.ctaConsultBanner}
                alt="مشاوره تخصصی و استعلام قیمت قطعات خط تولید صنعت پیش"
                className="w-full h-full object-cover object-center"
              />
              {/* Gradient masks blending smoothly from image to banner bg */}
              <div className="absolute inset-0 bg-gradient-to-l from-[#55565A] via-[#55565A]/50 to-transparent hidden lg:block pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#55565A] via-[#55565A]/40 to-transparent lg:hidden pointer-events-none" />
            </div>

          </div>
        </section>
      </div>

      {/* Global Modals for interactive AI features */}
      <AiVisualPartSearchModal
        isOpen={isVisualSearchOpen}
        onClose={() => setIsVisualSearchOpen(false)}
      />

      <AiConsultModal isOpen={isConsultOpen} onClose={() => setIsConsultOpen(false)} />
    </div>
  );
};
