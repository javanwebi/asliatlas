import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Award,
  FileSpreadsheet,
  Download,
  ShoppingCart,
  Search,
  Gift,
  TrendingUp,
  CheckCircle2,
  Package,
  FileText,
  Sparkles,
  ShieldCheck,
  ArrowLeft,
  Plus,
  Clock,
  Building2,
  LogOut,
  Layers,
  CreditCard,
  BarChart3,
  Tag,
  Bell,
  MapPin,
  Truck,
  Printer,
  RefreshCw,
  User,
  Lock,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import {
  pricingCreditService,
  PriceListDefinition,
  CatalogSkuPriceItem,
  CustomerRewardAssignment,
} from '../services/pricingCreditService';
import {
  portalContentService,
  PortalBannerItem,
  PortalAnnouncementItem,
  ClubTierMilestoneConfig,
} from '../services/portalContentService';
import { getManagedCatalogProducts } from '../data/mockGenerator';
import { CATEGORIES } from '../data/categories';
import { Customer } from '../types';
import { formatPrice, toPersianDigits } from '../utils/formatters';

interface HighVolumeOrderItem {
  id: string;
  orderNumber: string;
  date: string;
  totalAmount: number;
  status: 'shipped' | 'delivered' | 'processing';
  statusText: string;
  trackingCode: string;
  carrier: string;
  itemsCount: number;
}

const INITIAL_HIGH_VOL_ORDERS: HighVolumeOrderItem[] = [
  {
    id: 'hv-ord-1',
    orderNumber: 'ORD-1403-9201',
    date: '۱۴۰۳/۰۷/۱۲',
    totalAmount: 148500000,
    status: 'shipped',
    statusText: 'ارسال‌شده با باربری مرکزی یزد',
    trackingCode: 'BRB-8849201',
    carrier: 'باربری صنعتی وطن یزد',
    itemsCount: 45,
  },
  {
    id: 'hv-ord-2',
    orderNumber: 'ORD-1403-8614',
    date: '۱۴۰۳/۰۶/۱۸',
    totalAmount: 92400000,
    status: 'delivered',
    statusText: 'تحویل انبار مجموعه گردید',
    trackingCode: 'BRB-7741029',
    carrier: 'باربری صنعتی وطن یزد',
    itemsCount: 28,
  },
];

export const AccountPage: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const { addToCart, cart: cartItems = [] } = useCart();
  const navigate = useNavigate();

  // اگر کاربر عادی (ثبت‌نامی) باشد، اجازه ورود به پنل خرید بالا (/account) را ندارد و به /consumer-dashboard هدایت می‌شود
  useEffect(() => {
    if (currentUser && !portalContentService.isHighVolumeCustomer(currentUser)) {
      navigate('/consumer-dashboard', { replace: true });
    }
  }, [currentUser, navigate]);

  // Sync with pricingCreditService & portalContentService
  const [priceLists, setPriceLists] = useState<PriceListDefinition[]>(() =>
    pricingCreditService.getPriceLists()
  );
  const [allCustomers, setAllCustomers] = useState<Customer[]>(() =>
    pricingCreditService.getAllCustomers()
  );
  const [catalogSkus, setCatalogSkus] = useState<CatalogSkuPriceItem[]>(() =>
    pricingCreditService.getAllCatalogSkuItems()
  );
  const [clubMilestones, setClubMilestones] = useState<ClubTierMilestoneConfig[]>(() =>
    portalContentService.getClubMilestones()
  );
  const [portalTick, setPortalTick] = useState(0);

  const refreshData = () => {
    setPriceLists(pricingCreditService.getPriceLists());
    setAllCustomers(pricingCreditService.getAllCustomers());
    setCatalogSkus(pricingCreditService.getAllCatalogSkuItems());
    setClubMilestones(portalContentService.getClubMilestones());
    setPortalTick(t => t + 1);
  };

  useEffect(() => {
    window.addEventListener('atlas-pricing-updated', refreshData);
    window.addEventListener('atlas-catalog-updated', refreshData);
    window.addEventListener('atlas-portal-content-updated', refreshData);
    return () => {
      window.removeEventListener('atlas-pricing-updated', refreshData);
      window.removeEventListener('atlas-catalog-updated', refreshData);
      window.removeEventListener('atlas-portal-content-updated', refreshData);
    };
  }, []);

  // مشتری فعلی بر اساس کاربر لاگین‌شده از CRM (بدون هیچ‌گونه سوئیچر دستی برای مشتری)
  const currentCustomer: Customer = useMemo(() => {
    if (currentUser) {
      const found = allCustomers.find(
        c =>
          c.id === currentUser.id ||
          (c.phone && c.phone === currentUser.phone) ||
          (c.username &&
            currentUser.username &&
            c.username.toLowerCase() === currentUser.username.toLowerCase())
      );
      if (found) {
        return {
          ...found,
          ...currentUser,
          totalPurchases:
            found.totalPurchases ||
            currentUser.totalPurchases ||
            currentUser.totalOrdersAmount ||
            320000000,
          creditLimit: found.creditLimit || currentUser.creditLimit || 350000000,
          assignedPriceListCode:
            found.assignedPriceListCode || currentUser.assignedPriceListCode || 'B',
        };
      }
      return {
        ...currentUser,
        totalPurchases: currentUser.totalPurchases || currentUser.totalOrdersAmount || 320000000,
        creditLimit: currentUser.creditLimit || 350000000,
        assignedPriceListCode: currentUser.assignedPriceListCode || 'B',
      };
    }

    return (
      allCustomers[0] || {
        id: 'cust-legacy-101',
        fullName: 'مهندس سید جلال میردهقان',
        companyName: 'مجتمع کاشی و سرامیک عقیق یزد',
        username: 'aghigh_yazd',
        phone: '09131512233',
        role: 'wholesale',
        clubTier: 'gold',
        assignedPriceListCode: 'A',
        isLegacyCustomer: true,
        approvedB2B: true,
        totalPurchases: 540000000,
        creditLimit: 450000000,
      }
    );
  }, [allCustomers, currentUser]);

  const activePriceList: PriceListDefinition = useMemo(() => {
    const pl = pricingCreditService.getPriceListForCustomer(currentCustomer);
    return (
      pl || {
        id: 'pl-default',
        code: 'B',
        name: 'لیست قیمت من',
        adminTitle: 'لیست قیمت B',
        clubTier: 'silver',
        clubTierLabel: 'سطح نقره‌ای',
        customerTierLabel: 'سطح نقره‌ای',
        customerTier: 'silver',
        minPurchaseVolume: 250000000,
        discountPercent: 10,
        defaultDiscountPercent: 10,
        description: '',
      }
    );
  }, [currentCustomer, priceLists]);

  // تنظیمات محتوا و دسترسی‌های پنل (ترکیب عمومی + تکی برای این مشتری)
  const resolvedConfig = useMemo(
    () => portalContentService.getResolvedConfigForCustomer('high_volume', currentCustomer.id),
    [currentCustomer.id, portalTick]
  );

  const activeBanners: PortalBannerItem[] = useMemo(
    () =>
      portalContentService.getBannersForCustomer(
        'high_volume',
        currentCustomer.id,
        activePriceList.code
      ),
    [currentCustomer.id, activePriceList.code, portalTick]
  );

  const activeAnnouncements: PortalAnnouncementItem[] = useMemo(
    () => portalContentService.getAnnouncementsForCustomer('high_volume', currentCustomer.id),
    [currentCustomer.id, portalTick]
  );

  const enabledMenus = useMemo(
    () => resolvedConfig.menus.filter(m => m.enabled),
    [resolvedConfig.menus]
  );

  const [activeTab, setActiveTab] = useState<string>('overview');

  useEffect(() => {
    if (enabledMenus.length > 0 && !enabledMenus.some(m => m.id === activeTab)) {
      setActiveTab(enabledMenus[0].id);
    }
  }, [enabledMenus, activeTab]);

  const myRewards: CustomerRewardAssignment[] = useMemo(() => {
    const res = pricingCreditService.getRewardsForCustomer(currentCustomer);
    return Array.isArray(res) ? res : [];
  }, [currentCustomer, priceLists, portalTick]);

  // محاسبه دقیق وضعیت حجم خرید و نمودار میله‌ای باشگاه مشتریان (بدون امکان تغییر دستی سطح توسط مشتری)
  const clubChartData = useMemo(() => {
    const vol =
      currentCustomer.totalPurchases || currentCustomer.totalOrdersAmount || 320000000;
    const milestones = clubMilestones.length > 0 ? clubMilestones : portalContentService.getClubMilestones();
    const maxVolume = Math.max(
      ...milestones.map(m => m.minPurchaseVolume),
      vol,
      1200000000
    );

    // پیدا کردن سطح فعلی بر اساس حجم خرید یا تخصیص مدیریت
    let currentMilestone = milestones[0];
    for (const m of milestones) {
      if (vol >= m.minPurchaseVolume || activePriceList.code === m.code) {
        currentMilestone = m;
      }
    }

    const nextMilestone = milestones.find(m => m.minPurchaseVolume > vol);
    const remainingToNext = nextMilestone ? Math.max(0, nextMilestone.minPurchaseVolume - vol) : 0;
    const overallProgressPercent = nextMilestone
      ? Math.min(100, Math.round((vol / nextMilestone.minPurchaseVolume) * 100))
      : 100;

    return {
      vol,
      milestones,
      maxVolume,
      currentMilestone,
      nextMilestone,
      remainingToNext,
      overallProgressPercent,
    };
  }, [currentCustomer, clubMilestones, activePriceList.code]);

  // Search, Category Filter & Pagination for "لیست قیمت من"
  const [skuSearch, setSkuSearch] = useState('');
  const [selectedCategoryName, setSelectedCategoryName] = useState<string>('all');
  const [skuPage, setSkuPage] = useState(1);
  const [orderQuantities, setOrderQuantities] = useState<Record<string, number>>({});
  const [orders] = useState<HighVolumeOrderItem[]>(INITIAL_HIGH_VOL_ORDERS);
  const [toast, setToast] = useState<string | null>(null);
  const skusPerPage = 14;

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const availableFamilyCategories = useMemo(() => {
    const set = new Set<string>();
    catalogSkus.forEach(s => {
      if (s.category) set.add(s.category);
    });
    return Array.from(set);
  }, [catalogSkus]);

  const filteredSkus = useMemo(() => {
    const byCat =
      selectedCategoryName === 'all'
        ? catalogSkus
        : catalogSkus.filter(s => s.category === selectedCategoryName);
    const q = skuSearch.trim().toLowerCase();
    if (!q) return byCat;
    return byCat.filter(
      s =>
        s.code.toLowerCase().includes(q) ||
        s.name.toLowerCase().includes(q) ||
        s.familyName.toLowerCase().includes(q)
    );
  }, [catalogSkus, skuSearch, selectedCategoryName]);

  const totalSkuPages = Math.max(1, Math.ceil(filteredSkus.length / skusPerPage));
  const paginatedSkus = filteredSkus.slice((skuPage - 1) * skusPerPage, skuPage * skusPerPage);

  const handleAddSkuToCart = (skuItem: CatalogSkuPriceItem) => {
    const qty = Math.max(1, orderQuantities[skuItem.code] || 5);
    const myUnitPrice = pricingCreditService.getSkuPriceForList(
      skuItem.code,
      skuItem.basePrice,
      activePriceList
    );
    const catalog = getManagedCatalogProducts();
    const fam = catalog.find(p => p.code === skuItem.familyCode) || catalog[0];
    if (!fam) return;

    addToCart(
      {
        ...fam,
        code: skuItem.code,
        name: skuItem.name,
        prices: {
          base: myUnitPrice,
          retail: myUnitPrice,
          wholesale: myUnitPrice,
          dealer: myUnitPrice,
        },
        inquiryOnly: myUnitPrice <= 0,
      },
      qty
    );
    showToast(
      `${toPersianDigits(qty)} ${skuItem.unit} از کد ${skuItem.code} (${formatPrice(myUnitPrice)} ت) به سبد سفارش شما اضافه شد.`
    );
  };

  // دانلود اکسل لیست قیمت من (بدون کلمه «اختصاصی» یا کدهای داخلی)
  const handleDownloadMyPriceListExcel = () => {
    pricingCreditService.exportPriceListToExcel(activePriceList.id);
    showToast('فایل «اکسل لیست قیمت من» (.xlsx) شامل تمامی کدهای کالا با موفقیت دانلود شد.');
  };

  const handleBannerAction = (banner: PortalBannerItem) => {
    if (banner.ctaLinkOrTab.startsWith('/')) {
      navigate(banner.ctaLinkOrTab);
    } else if (enabledMenus.some(m => m.id === banner.ctaLinkOrTab)) {
      setActiveTab(banner.ctaLinkOrTab);
    } else {
      setActiveTab('orders_pricelist');
    }
    if (banner.cartDiscountPercent) {
      showToast(
        `طرح تخفیف ${toPersianDigits(banner.cartDiscountPercent)}٪ روی کل سبد خرید شما فعال است.`
      );
    }
  };

  const getBannerThemeClasses = (theme: PortalBannerItem['theme']) => {
    switch (theme) {
      case 'royal_gold':
        return 'from-slate-900 via-amber-950 to-slate-950 border-amber-400/50 text-white';
      case 'emerald_trust':
        return 'from-emerald-950 via-teal-900 to-slate-900 border-emerald-400/50 text-white';
      case 'titanium_blue':
        return 'from-slate-900 via-blue-950 to-indigo-950 border-sky-400/50 text-white';
      case 'ruby_crimson':
        return 'from-rose-950 via-slate-900 to-slate-950 border-rose-400/50 text-white';
      default:
        return 'from-[#1B222C] via-[#252D3A] to-[#1B222C] border-[#E06518]/50 text-white';
    }
  };

  const getHeaderThemeClasses = () => {
    switch (resolvedConfig.uiTexts.headerAccentTheme) {
      case 'navy_orange':
        return 'from-[#141A23] via-[#1E2633] to-[#141A23] border-[#E06518]/30';
      case 'slate_emerald':
        return 'from-slate-950 via-emerald-950/75 to-slate-900 border-emerald-500/30';
      case 'deep_royal':
        return 'from-indigo-950 via-slate-900 to-slate-950 border-indigo-500/30';
      default:
        return 'from-slate-950 via-[#1C222D] to-slate-900 border-amber-500/30';
    }
  };

  const getMenuIcon = (id: string) => {
    switch (id) {
      case 'overview':
        return BarChart3;
      case 'orders_pricelist':
        return FileSpreadsheet;
      case 'club_rewards':
        return Gift;
      case 'profile_addresses':
        return Building2;
      default:
        return Package;
    }
  };

  // رندر نمودار میله‌ای بصری باشگاه مشتریان (قابل استفاده در پیشخوان و تب باشگاه)
  const renderClubMilestoneBarChart = (showEnterClubButton: boolean) => {
    const {
      vol,
      milestones,
      maxVolume,
      currentMilestone,
      nextMilestone,
      remainingToNext,
      overallProgressPercent,
    } = clubChartData;

    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-7 shadow-xs space-y-6">
        {/* Header of Chart */}
        <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-[#E06518]">
              <BarChart3 className="w-4 h-4" />
              <span>باشگاه مشتریان و مسیر پیشرفت خرید</span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-slate-900">
              {resolvedConfig.uiTexts.clubChartTitle}
            </h3>
            <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
              {resolvedConfig.uiTexts.clubChartSubtitle}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5">
            <div>
              <span className="text-[11px] text-slate-500 block">حجم خرید ثبت‌شده شما:</span>
              <span className="font-mono font-black text-sm sm:text-base text-emerald-700">
                {formatPrice(vol)} تومان
              </span>
            </div>
            <div className="h-8 w-px bg-slate-200 hidden sm:block" />
            <div>
              <span className="text-[11px] text-slate-500 block">سطح فعلی باشگاه شما:</span>
              <span className="font-black text-sm text-[#E06518]">
                {currentMilestone?.publicTitle || 'سطح نقره‌ای'}
              </span>
            </div>
          </div>
        </div>

        {/* Visual Vertical Bar Chart Container */}
        <div className="bg-gradient-to-b from-slate-50/70 to-slate-100/60 rounded-2xl border border-slate-200/90 p-5 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 items-end min-h-[250px] pt-8">
            {/* ستون اول: موقعیت فعلی خرید مشتری */}
            <div className="flex flex-col items-center justify-end h-full space-y-2">
              <div className="text-center space-y-0.5">
                <span className="text-[10px] font-bold text-emerald-700 block">
                  موقعیت فعلی شما
                </span>
                <span className="font-mono font-black text-xs text-slate-900 block">
                  {toPersianDigits(Math.round(vol / 1000000))} میلیون ت
                </span>
              </div>
              <div className="w-full max-w-[90px] h-44 bg-slate-200/70 rounded-2xl p-1.5 flex items-end overflow-hidden border border-emerald-300/80 shadow-inner">
                <div
                  className="w-full rounded-xl bg-gradient-to-t from-emerald-700 via-emerald-500 to-teal-400 transition-all duration-700 relative flex items-start justify-center pt-2 shadow-md"
                  style={{
                    height: `${Math.max(18, Math.min(100, Math.round((vol / maxVolume) * 100)))}%`,
                  }}
                >
                  <span className="text-[10px] font-mono font-black text-white drop-shadow">
                    {toPersianDigits(overallProgressPercent)}٪
                  </span>
                </div>
              </div>
              <div className="text-center pt-1">
                <div className="font-black text-xs text-emerald-800">حجم خرید من</div>
                <div className="text-[10px] text-slate-500">ثبت‌شده در سیستم</div>
              </div>
            </div>

            {/* ستون‌های سطوح باشگاه مشتریان (برنزی، نقره‌ای، طلایی، الماس) */}
            {milestones.map((m, idx) => {
              const isReached = vol >= m.minPurchaseVolume || activePriceList.code === m.code;
              const isCurrent = currentMilestone?.code === m.code;
              const barHeightPercent = Math.max(
                26 + idx * 18,
                Math.min(100, Math.round((m.minPurchaseVolume / maxVolume) * 100))
              );

              return (
                <div
                  key={m.code}
                  className="flex flex-col items-center justify-end h-full space-y-2"
                >
                  <div className="text-center space-y-0.5">
                    <span
                      className={`text-[10px] font-black block ${
                        isCurrent
                          ? 'text-[#E06518]'
                          : isReached
                          ? 'text-emerald-700'
                          : 'text-slate-500'
                      }`}
                    >
                      {isCurrent
                        ? '★ سطح فعلی شما'
                        : isReached
                        ? '✓ تکمیل‌شده'
                        : 'هدف بعدی'}
                    </span>
                    <span className="font-mono font-bold text-xs text-slate-800 block">
                      {toPersianDigits(Math.round(m.minPurchaseVolume / 1000000))} میلیون ت
                    </span>
                  </div>

                  {/* ستون میله */}
                  <div
                    className={`w-full max-w-[96px] h-44 rounded-2xl p-1.5 flex items-end overflow-hidden border transition-all ${
                      isCurrent
                        ? 'bg-orange-50/80 border-2 border-[#E06518] shadow-md'
                        : isReached
                        ? 'bg-emerald-50/50 border-emerald-300'
                        : 'bg-slate-200/60 border-slate-300/80'
                    }`}
                  >
                    <div
                      className={`w-full rounded-xl bg-gradient-to-t ${
                        isReached ? m.barColor : 'from-slate-400 to-slate-300'
                      } transition-all duration-700 flex flex-col items-center justify-between py-2 px-1 text-white shadow-xs`}
                      style={{ height: `${barHeightPercent}%` }}
                    >
                      <span className="text-[10px] font-mono font-black drop-shadow">
                        {toPersianDigits(m.discountPercent)}٪ تخفیف
                      </span>
                      {isReached ? (
                        <CheckCircle2 className="w-4 h-4 text-white drop-shadow" />
                      ) : (
                        <Lock className="w-3.5 h-3.5 text-white/80" />
                      )}
                    </div>
                  </div>

                  {/* برچسب زیر میله */}
                  <div className="text-center pt-1">
                    <div
                      className={`font-black text-xs ${
                        isCurrent ? 'text-[#E06518]' : 'text-slate-900'
                      }`}
                    >
                      {m.publicTitle}
                    </div>
                    <div className="text-[10px] text-slate-500 line-clamp-1 max-w-[130px]">
                      {m.rewardsList[0] || m.summaryBenefit}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* نوار توضیح فاصله تا سطح بعدی */}
          <div className="mt-6 pt-4 border-t border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-xs text-slate-700 leading-relaxed">
              {nextMilestone ? (
                <span>
                  با ثبت{' '}
                  <strong className="font-mono text-[#E06518]">
                    {formatPrice(remainingToNext)} تومان
                  </strong>{' '}
                  خرید دیگر، به <strong>{nextMilestone.publicTitle}</strong> ارتقا پیدا می‌کنید و از{' '}
                  <strong>{toPersianDigits(nextMilestone.discountPercent)}٪ تخفیف</strong> و جوایز آن سطح بهره‌مند می‌شوید.
                </span>
              ) : (
                <span className="text-emerald-700 font-bold">
                  تبریک! شما در بالاترین سطح باشگاه مشتریان قرار دارید و تمامی جوایز و مزایای ویژه برای شما فعال است.
                </span>
              )}
            </div>

            {/* دکمه زیر نمودار میله‌ای برای ورود به صفحه جوایز و اتفاقات باشگاه مشتریان */}
            {showEnterClubButton && (
              <button
                type="button"
                onClick={() => setActiveTab('club_rewards')}
                className="px-5 py-3 rounded-2xl bg-gradient-to-l from-[#E06518] to-amber-600 hover:from-[#C95210] hover:to-amber-700 text-white text-xs font-black flex items-center justify-center gap-2 shadow-lg shadow-orange-600/20 cursor-pointer shrink-0 transition"
              >
                <Gift className="w-4 h-4" />
                <span>{resolvedConfig.uiTexts.clubDetailsButtonLabel}</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F3F5F8] pb-16 text-right" dir="rtl">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 left-5 z-50 max-w-md bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-amber-500/40 flex items-center gap-2.5 text-xs font-bold">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* =====================================================================
          TOP HEADER FOR HIGH-VOLUME CUSTOMERS (/account)
         ===================================================================== */}
      <div className={`bg-gradient-to-l ${getHeaderThemeClasses()} text-white border-b`}>
        <div className="max-w-7xl mx-auto px-4 py-7 sm:py-9 space-y-6">
          {/* Customer Identity & Actions */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-amber-400 font-bold">
                <Award className="w-4 h-4 text-[#E06518]" />
                <span>{resolvedConfig.uiTexts.heroWelcomePrefix}</span>
                <span className="text-slate-600">•</span>
                <span className="text-emerald-300">
                  {clubChartData.currentMilestone?.publicTitle || 'سطح نقره‌ای'}
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white">
                {currentCustomer.companyName || currentCustomer.fullName}
              </h1>

              <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
                مسئول حساب: <strong>{currentCustomer.fullName}</strong> •{' '}
                {resolvedConfig.uiTexts.heroSubtitle}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {resolvedConfig.permissions.allowExcelPriceListDownload && (
                <button
                  type="button"
                  onClick={handleDownloadMyPriceListExcel}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-2 cursor-pointer shadow-lg transition"
                >
                  <Download className="w-4 h-4" />
                  <span>{resolvedConfig.uiTexts.excelDownloadButtonLabel} (.xlsx)</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setActiveTab('orders_pricelist')}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs font-bold flex items-center gap-2 cursor-pointer transition"
              >
                <FileSpreadsheet className="w-4 h-4 text-amber-400" />
                <span>لیست قیمت من</span>
              </button>
              <Link
                to="/cart"
                className="px-4 py-2.5 rounded-xl bg-[#E06518] hover:bg-[#C95210] text-white text-xs font-black flex items-center gap-2 shadow-lg transition"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>سبد سفارش ({toPersianDigits((cartItems || []).length)})</span>
              </Link>
            </div>
          </div>

          {/* 4 Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className="p-4 rounded-2xl bg-white/5 border border-amber-500/30">
              <div className="flex items-center justify-between text-xs text-amber-300 mb-1">
                <span>{resolvedConfig.uiTexts.kpi1Title}</span>
                <Award className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-base sm:text-lg font-black text-white">
                {clubChartData.currentMilestone?.publicTitle || 'سطح نقره‌ای'}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                {toPersianDigits(
                  clubChartData.currentMilestone?.discountPercent ||
                    activePriceList.defaultDiscountPercent
                )}
                ٪ تخفیف فعال روی لیست قیمت من
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>{resolvedConfig.uiTexts.kpi2Title}</span>
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-base sm:text-lg font-black text-emerald-400 font-mono">
                {formatPrice(clubChartData.vol)}{' '}
                <span className="text-xs font-normal text-slate-300">تومان</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                {clubChartData.nextMilestone
                  ? `${toPersianDigits(clubChartData.overallProgressPercent)}٪ تا رسیدن به ${clubChartData.nextMilestone.publicTitle}`
                  : 'بالاترین سطح خرید باشگاه مشتریان'}
              </div>
            </div>

            {resolvedConfig.permissions.showCreditLimitCard && (
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span>{resolvedConfig.uiTexts.kpi3Title}</span>
                  <CreditCard className="w-4 h-4 text-sky-400" />
                </div>
                <div className="text-base sm:text-lg font-black text-white font-mono">
                  {formatPrice(currentCustomer.creditLimit || 350000000)}{' '}
                  <span className="text-xs font-normal text-slate-300">تومان</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  شرایط تسویه حساب فعال
                </div>
              </div>
            )}

            <div
              onClick={() => setActiveTab('club_rewards')}
              className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-amber-400/50 cursor-pointer transition"
            >
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>{resolvedConfig.uiTexts.kpi4Title}</span>
                <Gift className="w-4 h-4 text-[#E06518]" />
              </div>
              <div className="text-base sm:text-lg font-black text-amber-400">
                {toPersianDigits((myRewards || []).length)} جایزه و امتیاز فعال
              </div>
              <div className="text-[11px] text-slate-300 mt-0.5 flex items-center gap-1">
                <span>مشاهده جوایز باشگاه مشتریان</span>
                <ArrowLeft className="w-3 h-3" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================================
          DEDICATED BANNER SLOT (جایگاه ویژه طراحی بنر و کمپین‌های جمعی و تکی)
         ===================================================================== */}
      {resolvedConfig.permissions.showPromotionalBanners &&
        (activeBanners.length > 0 || resolvedConfig.customCartDiscountRule) && (
          <div className="max-w-7xl mx-auto px-4 mt-6 space-y-3">
            {resolvedConfig.customCartDiscountRule && (
              <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-l from-amber-950 via-slate-900 to-slate-950 text-white border border-amber-400/50 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="inline-flex items-center gap-1.5 text-amber-300 text-xs font-bold">
                    <Sparkles className="w-4 h-4 text-[#E06518]" />
                    <span>پیشنهاد ویژه حساب شما</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-white">
                    با ثبت سفارش به حجم{' '}
                    {formatPrice(resolvedConfig.customCartDiscountRule.minVolume)} تومان،{' '}
                    {toPersianDigits(resolvedConfig.customCartDiscountRule.discountPercent)}٪ تخفیف مازاد به کل سبد خرید شما اضافه می‌شود
                  </h3>
                  <p className="text-xs text-slate-300">
                    {resolvedConfig.customCartDiscountRule.description}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('orders_pricelist')}
                  className="px-5 py-2.5 rounded-xl bg-[#E06518] hover:bg-[#C95210] text-white font-black text-xs shrink-0 cursor-pointer transition"
                >
                  مشاهده لیست قیمت من و ثبت سفارش
                </button>
              </div>
            )}

            {activeBanners.map(banner => (
              <div
                key={banner.id}
                className={`relative overflow-hidden rounded-3xl border bg-gradient-to-l ${getBannerThemeClasses(
                  banner.theme
                )} p-5 sm:p-7 shadow-lg`}
              >
                {banner.backgroundImage && (
                  <img
                    src={banner.backgroundImage}
                    alt={banner.title}
                    className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none"
                  />
                )}
                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                  <div className="space-y-2 max-w-3xl">
                    <div className="flex items-center gap-2 flex-wrap text-xs font-bold text-amber-300">
                      <Tag className="w-3.5 h-3.5 text-[#E06518]" />
                      <span>{banner.badgeText}</span>
                      {banner.minCartVolume && banner.cartDiscountPercent ? (
                        <>
                          <span className="text-white/40">•</span>
                          <span className="text-emerald-300">
                            سفارش بالای {formatPrice(banner.minCartVolume)} ت ={' '}
                            {toPersianDigits(banner.cartDiscountPercent)}٪ تخفیف کل سبد خرید
                          </span>
                        </>
                      ) : null}
                    </div>
                    <h2 className="text-lg sm:text-xl font-black text-white leading-relaxed">
                      {banner.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                      {banner.subtitle}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleBannerAction(banner)}
                      className="px-5 py-3 rounded-2xl bg-[#E06518] hover:bg-[#C95210] text-white text-xs font-black flex items-center gap-2 shadow-lg cursor-pointer transition"
                    >
                      <span>{banner.ctaText || 'مشاهده و ثبت سفارش'}</span>
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 mt-6 space-y-6">
        {/* Main Navigation Menu Bar */}
        <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            {enabledMenus.map(tab => {
              const Icon = getMenuIcon(tab.id);
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 cursor-pointer transition-all ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 ${isActive ? 'text-[#E06518]' : 'text-slate-400'}`}
                  />
                  <span>{tab.label}</span>
                  {tab.id === 'club_rewards' && myRewards.length > 0 && (
                    <span className="text-[11px] font-mono text-amber-500">
                      ({toPersianDigits(myRewards.length)})
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {currentUser && (
            <button
              type="button"
              onClick={() => {
                logout();
                navigate('/');
              }}
              className="px-3.5 py-2 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>خروج از حساب</span>
            </button>
          )}
        </div>

        {/* ===================================================================
            TAB 1: OVERVIEW (پیشخوان، نمودار میله‌ای باشگاه مشتریان، اطلاعیه‌ها و خلاصه سفارشات)
           =================================================================== */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Active Announcements */}
            {activeAnnouncements.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeAnnouncements.map(ann => (
                  <div
                    key={ann.id}
                    className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex items-start justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-[11px] text-[#E06518] font-bold">
                        <Bell className="w-3.5 h-3.5" />
                        <span>{ann.tag}</span>
                        {ann.highlightValue && (
                          <>
                            <span className="text-slate-300">•</span>
                            <span className="text-emerald-700">{ann.highlightValue}</span>
                          </>
                        )}
                      </div>
                      <h4 className="font-black text-xs sm:text-sm text-slate-900">{ann.title}</h4>
                      <p className="text-xs text-slate-600 leading-relaxed">{ann.body}</p>
                    </div>
                    {ann.actionLabel && ann.actionTab && (
                      <button
                        type="button"
                        onClick={() => setActiveTab(ann.actionTab!)}
                        className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-[#E06518] text-white text-[11px] font-bold shrink-0 cursor-pointer transition"
                      >
                        {ann.actionLabel}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* نمودار میله‌ای حجم خرید و سطوح باشگاه مشتریان + دکمه ورود به صفحه جوایز در زیر آن */}
            {resolvedConfig.permissions.showClubBarChart && renderClubMilestoneBarChart(true)}

            {/* Quick Access Card to Orders & My Price List Excel */}
            <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                  <span>بخش سفارشات و «اکسل لیست قیمت من»</span>
                </h3>
                <p className="text-xs text-slate-500">
                  در بخش سفارشات می‌توانید فایل اکسل کامل لیست قیمت من را دانلود کرده و اقلام مورد نیاز خود را به صورت سریع ثبت نمایید.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                {resolvedConfig.permissions.allowExcelPriceListDownload && (
                  <button
                    type="button"
                    onClick={handleDownloadMyPriceListExcel}
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-2 cursor-pointer transition"
                  >
                    <Download className="w-4 h-4" />
                    <span>{resolvedConfig.uiTexts.excelDownloadButtonLabel}</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setActiveTab('orders_pricelist')}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-[#E06518] text-white text-xs font-black flex items-center gap-2 cursor-pointer transition"
                >
                  <span>ورود به سفارشات و لیست قیمت من</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
            TAB 2: ORDERS & MY PRICE LIST (سفارشات و لیست قیمت من + دانلود اکسل لیست قیمت من در همینجا)
           =================================================================== */}
        {activeTab === 'orders_pricelist' && (
          <div className="space-y-6">
            {/* بخش ۱: سفارشات ثبت‌شده و دکمه مستقیم دانلود «اکسل لیست قیمت من» */}
            <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                    <Package className="w-5 h-5 text-[#E06518]" />
                    <span>{resolvedConfig.uiTexts.ordersSectionTitle}</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    مشاهده وضعیت سفارش‌های ثبت‌شده، پیش‌فاکتورها و دریافت مستقیم فایل اکسل لیست قیمت من
                  </p>
                </div>

                {resolvedConfig.permissions.allowExcelPriceListDownload && (
                  <button
                    type="button"
                    onClick={handleDownloadMyPriceListExcel}
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-2 cursor-pointer shadow-md transition"
                  >
                    <Download className="w-4 h-4" />
                    <span>{resolvedConfig.uiTexts.excelDownloadButtonLabel} (.xlsx)</span>
                  </button>
                )}
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-xs text-right border-collapse">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-700">
                    <tr>
                      <th className="py-3 px-4 font-bold">شماره سفارش / فاکتور</th>
                      <th className="py-3 px-4 font-bold">تاریخ ثبت</th>
                      <th className="py-3 px-4 font-bold">تعداد اقلام</th>
                      <th className="py-3 px-4 font-bold">مبلغ کل سفارش (تومان)</th>
                      <th className="py-3 px-4 font-bold">کد رهگیری باربری</th>
                      <th className="py-3 px-4 font-bold">وضعیت ارسال</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {orders.map(ord => (
                      <tr key={ord.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-mono font-black text-slate-900" dir="ltr">
                          {ord.orderNumber}
                        </td>
                        <td className="py-3 px-4">{ord.date}</td>
                        <td className="py-3 px-4 font-mono">
                          {toPersianDigits(ord.itemsCount)} قلم کالا
                        </td>
                        <td className="py-3 px-4 font-mono font-black text-emerald-700">
                          {formatPrice(ord.totalAmount)} تومان
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-600" dir="ltr">
                          {ord.trackingCode}
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-emerald-700 font-bold text-xs">
                            {ord.statusText}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* بخش ۲: جدول کامل «لیست قیمت من» و ثبت سریع در سفارش */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden space-y-4">
              <div className="p-5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4 bg-slate-50/60">
                <div>
                  <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                    <span>{resolvedConfig.uiTexts.priceListSectionTitle}</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    می‌توانید فایل «اکسل لیست قیمت من» را دانلود کنید یا هر کد کالا را با تعداد دلخواه مستقیماً به سبد سفارش اضافه نمایید.
                  </p>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-80">
                    <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="search"
                      value={skuSearch}
                      onChange={e => {
                        setSkuSearch(e.target.value);
                        setSkuPage(1);
                      }}
                      placeholder="جستجوی کد کالا (مثلاً 34265) یا نام قطعه..."
                      className="w-full pr-9 pl-3 py-2 rounded-xl border border-slate-300 bg-white text-xs focus:border-[#E06518] focus:outline-none"
                    />
                  </div>
                  {resolvedConfig.permissions.allowExcelPriceListDownload && (
                    <button
                      type="button"
                      onClick={handleDownloadMyPriceListExcel}
                      className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>{resolvedConfig.uiTexts.excelDownloadButtonLabel}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* فیلتر دسته‌بندی کالاها */}
              <div className="px-5 flex items-center gap-1.5 overflow-x-auto pb-1">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategoryName('all');
                    setSkuPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 cursor-pointer transition ${
                    selectedCategoryName === 'all'
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  همه دسته‌بندی‌ها ({toPersianDigits(catalogSkus.length)})
                </button>
                {availableFamilyCategories.map(catName => (
                  <button
                    key={catName}
                    type="button"
                    onClick={() => {
                      setSelectedCategoryName(catName);
                      setSkuPage(1);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 cursor-pointer transition ${
                      selectedCategoryName === catName
                        ? 'bg-[#E06518] text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {catName}
                  </button>
                ))}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-right border-collapse">
                  <thead className="bg-slate-100 border-b border-slate-200 text-slate-700">
                    <tr>
                      <th className="py-3 px-4 font-bold">کد کالا (SKU)</th>
                      <th className="py-3 px-4 font-bold">شرح و مشخصات قطعه</th>
                      <th className="py-3 px-4 font-bold">گروه کالا</th>
                      <th className="py-3 px-4 font-bold">واحد</th>
                      <th className="py-3 px-4 font-bold">قیمت واحد در لیست قیمت من</th>
                      <th className="py-3 px-4 font-bold">ثبت در سفارش</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginatedSkus.map(sku => {
                      const myPrice = pricingCreditService.getSkuPriceForList(
                        sku.code,
                        sku.basePrice,
                        activePriceList
                      );
                      const qty = orderQuantities[sku.code] ?? 5;

                      return (
                        <tr key={sku.code} className="hover:bg-orange-50/30">
                          <td className="py-3 px-4 font-mono font-black text-[#E06518]" dir="ltr">
                            {sku.code}
                          </td>
                          <td className="py-3 px-4 font-bold text-slate-900">
                            <Link
                              to={`/product/${encodeURIComponent(sku.familyCode)}`}
                              className="hover:text-[#E06518]"
                            >
                              {sku.name}
                            </Link>
                          </td>
                          <td className="py-3 px-4 text-slate-500">
                            {sku.category || sku.familyName}
                          </td>
                          <td className="py-3 px-4 text-slate-600">{sku.unit}</td>
                          <td className="py-3 px-4 font-mono font-black text-emerald-700 text-sm">
                            {myPrice > 0 ? `${formatPrice(myPrice)} تومان` : 'تماس جهت پیش‌فاکتور'}
                          </td>
                          <td className="py-3 px-4">
                            {resolvedConfig.permissions.allowQuickSkuOrder ? (
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="number"
                                  min={1}
                                  value={qty}
                                  onChange={e =>
                                    setOrderQuantities({
                                      ...orderQuantities,
                                      [sku.code]: Math.max(1, Number(e.target.value) || 1),
                                    })
                                  }
                                  className="w-16 px-2 py-1.5 rounded-lg border border-slate-300 text-center font-mono font-bold bg-white"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleAddSkuToCart(sku)}
                                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-[#E06518] text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                  <span>افزودن</span>
                                </button>
                              </div>
                            ) : (
                              <span className="text-slate-400">فعال</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
                <span className="text-slate-500">
                  صفحه {toPersianDigits(skuPage)} از {toPersianDigits(totalSkuPages)} (کل کدهای کالا:{' '}
                  {toPersianDigits(filteredSkus.length)})
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={skuPage <= 1}
                    onClick={() => setSkuPage(p => Math.max(1, p - 1))}
                    className="px-3.5 py-1.5 rounded-lg border border-slate-300 bg-white disabled:opacity-40 font-bold cursor-pointer"
                  >
                    قبلی
                  </button>
                  <button
                    type="button"
                    disabled={skuPage >= totalSkuPages}
                    onClick={() => setSkuPage(p => Math.min(totalSkuPages, p + 1))}
                    className="px-3.5 py-1.5 rounded-lg border border-slate-300 bg-white disabled:opacity-40 font-bold cursor-pointer"
                  >
                    بعدی
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
            TAB 3: CUSTOMER CLUB, BAR CHART & FULL REWARDS / EVENTS PAGE
           =================================================================== */}
        {activeTab === 'club_rewards' && (
          <div className="space-y-6">
            {/* ۱. نمودار میله‌ای پیشرفت حجم خرید در بالای صفحه باشگاه */}
            {renderClubMilestoneBarChart(false)}

            {/* ۲. جدول کامل جوایز و اتفاقاتی که در پنل مدیریت برای هر سطح تعریف شده است */}
            <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-7 shadow-xs space-y-5">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-[#E06518]">
                  <Sparkles className="w-4 h-4" />
                  <span>راهنمای کامل جوایز و مزایای باشگاه مشتریان</span>
                </div>
                <h3 className="font-black text-base sm:text-lg text-slate-900 mt-1">
                  با رسیدن به هر حجم از خرید، چه جوایز و امتیازاتی دریافت می‌کنید؟
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  سطح شما به صورت خودکار بر اساس مجموع حجم خریدهای ثبت‌شده ارتقا می‌یابد و جوایز زیر برای حساب شما فعال می‌گردد.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {clubChartData.milestones.map(m => {
                  const isCurrent = clubChartData.currentMilestone?.code === m.code;
                  const isReached =
                    clubChartData.vol >= m.minPurchaseVolume || activePriceList.code === m.code;

                  return (
                    <div
                      key={m.code}
                      className={`p-5 rounded-3xl border flex flex-col justify-between space-y-4 transition ${
                        isCurrent
                          ? 'border-2 border-[#E06518] bg-gradient-to-br from-orange-50/60 to-white shadow-sm'
                          : isReached
                          ? 'border-emerald-200 bg-emerald-50/30'
                          : 'border-slate-200 bg-slate-50/60'
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-200/80">
                          <div>
                            <h4 className="font-black text-base text-slate-900">
                              {m.publicTitle}
                            </h4>
                            <span className="text-xs text-slate-500 font-mono">
                              حداقل حجم خرید:{' '}
                              <strong className="text-slate-800">
                                {formatPrice(m.minPurchaseVolume)} تومان
                              </strong>
                            </span>
                          </div>
                          <div className="text-left">
                            <span className="font-mono font-black text-sm text-[#E06518] block">
                              {toPersianDigits(m.discountPercent)}٪ تخفیف پایه
                            </span>
                            <span
                              className={`text-[11px] font-bold ${
                                isCurrent
                                  ? 'text-emerald-700'
                                  : isReached
                                  ? 'text-emerald-600'
                                  : 'text-slate-400'
                              }`}
                            >
                              {isCurrent
                                ? '★ سطح فعلی شما'
                                : isReached
                                ? '✓ آزاد شده'
                                : 'در انتظار رسیدن به حد نصاب'}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                            <Gift className="w-4 h-4 text-[#E06518]" />
                            <span>جوایز و هدایای این سطح:</span>
                          </div>
                          <ul className="space-y-1.5 text-xs text-slate-700 pr-2">
                            {m.rewardsList.map((rwItem, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                                <span>{rwItem}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {m.specialEvents && m.specialEvents.length > 0 && (
                          <div className="space-y-1.5 pt-2 border-t border-slate-200/60">
                            <div className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                              <Award className="w-4 h-4 text-amber-500" />
                              <span>امتیازات و خدمات ویژه:</span>
                            </div>
                            <ul className="space-y-1 text-xs text-slate-600 pr-2">
                              {m.specialEvents.map((ev, i) => (
                                <li key={i} className="flex items-start gap-2">
                                  <span className="text-[#E06518] font-bold">•</span>
                                  <span>{ev}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ۳. جوایز و مشوق‌های فعال ثبت‌شده برای این مشتری */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div>
                <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                  <Gift className="w-5 h-5 text-[#E06518]" />
                  <span>جوایز و مشوق‌های فعال حساب من ({toPersianDigits(myRewards.length)})</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  جوایز زیر بر اساس سطح باشگاه شما و طرح‌های تشویقی فعال گردیده و در سفارش‌های بعدی شما قابل اعمال است.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myRewards.map(rw => (
                  <div
                    key={rw.id}
                    className="p-5 rounded-2xl border-2 border-amber-300/80 bg-gradient-to-br from-amber-50/70 to-white flex flex-col justify-between gap-4 shadow-xs"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <span className="font-black text-amber-900">
                          {rw.assignmentScope === 'collective'
                            ? `پاداش باشگاه مشتریان (${clubChartData.currentMilestone?.publicTitle})`
                            : 'پاداش ویژه حساب شما'}
                        </span>
                        <span className="text-[11px] text-slate-500">{rw.assignedAt}</span>
                      </div>

                      <h4 className="font-black text-sm sm:text-base text-slate-900">
                        {rw.rewardTitle}
                      </h4>
                      <div className="text-xs font-black text-emerald-700">
                        ارزش هدیه / امتیاز: {rw.rewardValue}
                      </div>
                      {rw.notes && (
                        <p className="text-xs text-slate-600 leading-relaxed">{rw.notes}</p>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-amber-200/80">
                      <span className="text-[11px] font-bold text-amber-900">
                        وضعیت: آماده استفاده در سفارش بعدی
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          showToast(
                            `جایزه «${rw.rewardTitle}» برای سفارش بعدی شما رزرو و فعال گردید.`
                          )
                        }
                        className="px-4 py-1.5 rounded-xl bg-[#E06518] hover:bg-[#C95210] text-white text-xs font-bold cursor-pointer"
                      >
                        اعمال در سفارش بعدی
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
            TAB 4: PROFILE & DELIVERY ADDRESSES (مشخصات حساب و آدرس‌های تحویل)
           =================================================================== */}
        {activeTab === 'profile_addresses' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
              <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                <User className="w-5 h-5 text-[#E06518]" />
                <span>مشخصات حساب کاربری و اطلاعات ورود</span>
              </h3>
              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <span className="text-slate-500">نام مجموعه / شرکت:</span>
                  <strong className="text-slate-900">
                    {currentCustomer.companyName || currentCustomer.company || '—'}
                  </strong>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <span className="text-slate-500">نام مسئول خرید:</span>
                  <strong className="text-slate-900">{currentCustomer.fullName}</strong>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <span className="text-slate-500">نام کاربری ورود به پنل:</span>
                  <strong className="font-mono text-[#E06518]" dir="ltr">
                    {currentCustomer.username || currentCustomer.phone}
                  </strong>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <span className="text-slate-500">شماره تماس ثبت‌شده:</span>
                  <strong className="font-mono text-slate-900" dir="ltr">
                    {currentCustomer.phone}
                  </strong>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
              <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#E06518]" />
                <span>آدرس‌های تحویل باربری و انبار</span>
              </h3>
              <div className="space-y-3 text-xs">
                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <strong className="text-slate-900 text-sm">انبار مرکزی تحویل بار</strong>
                    <span className="text-emerald-700 font-bold text-[11px]">آدرس پیش‌فرض</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    {currentCustomer.province || 'یزد'}، {currentCustomer.city || 'یزد'}، شهرک صنعتی، درب تحویل انبار فنی
                  </p>
                  <div className="text-slate-500 pt-1">
                    مسئول تحویل: <strong>{currentCustomer.fullName}</strong> • تلفن:{' '}
                    <span className="font-mono">{currentCustomer.phone}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
