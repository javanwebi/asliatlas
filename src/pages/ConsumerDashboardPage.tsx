import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  FileText,
  MapPin,
  Search,
  ShoppingCart,
  ShieldCheck,
  ArrowLeft,
  Printer,
  RefreshCw,
  Plus,
  CreditCard,
  Zap,
  Sparkles,
  User,
  LogOut,
  Download,
  FileSpreadsheet,
  Tag,
  Bell,
  Layers,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { getManagedCatalogProducts } from '../data/mockGenerator';
import { CATEGORIES } from '../data/categories';
import { formatPrice, toPersianDigits } from '../utils/formatters';
import { ProductImage } from '../components/product/ProductImage';
import {
  portalContentService,
  PortalBannerItem,
  PortalAnnouncementItem,
} from '../services/portalContentService';
import { pricingCreditService } from '../services/pricingCreditService';

interface CustomerOrderItem {
  id: string;
  orderNumber: string;
  date: string;
  status: 'processing' | 'shipped' | 'delivered';
  paymentMethod: string;
  paymentRef: string;
  shippingMethod: string;
  trackingCode: string;
  totalAmount: number;
  receiverName: string;
  receiverAddress: string;
  items: {
    code: string;
    name: string;
    quantity: number;
    unit: string;
    unitPrice: number;
  }[];
}

const INITIAL_CUSTOMER_ORDERS: CustomerOrderItem[] = [
  {
    id: 'ord-101',
    orderNumber: 'ORD-1403-8841',
    date: '۱۴۰۳/۰۷/۱۴',
    status: 'shipped',
    paymentMethod: 'درگاه آنلاین بانکی شاپرک',
    paymentRef: '۸۴۹۲۰۱۷۴۵۲۱',
    shippingMethod: 'تیپاکس اکسپرس (ارسال مستقیم از انبار مرکزی)',
    trackingCode: 'TPX-649820145',
    totalAmount: 4850000,
    receiverName: 'مهندس امیرحسین کاظمی',
    receiverAddress: 'تهران، بزرگراه فتح، کیلومتر ۵، مجتمع صنعتی پارس، پلاک ۱۴',
    items: [
      {
        code: '34265',
        name: 'چرخ دنده صنعتی استاندارد سایز Z18',
        quantity: 2,
        unit: 'عدد',
        unitPrice: 1450000,
      },
      {
        code: 'SWR-230',
        name: 'تسمه تایمینگ صنعتی SWR آلمان مدل HTD-8M',
        quantity: 1,
        unit: 'حلقه',
        unitPrice: 1950000,
      },
    ],
  },
  {
    id: 'ord-102',
    orderNumber: 'ORD-1403-7912',
    date: '۱۴۰۳/۰۶/۲۵',
    status: 'delivered',
    paymentMethod: 'درگاه آنلاین بانکی شاپرک',
    paymentRef: '۷۱۲۰۳۹۴۸۱۱۵',
    shippingMethod: 'پست ویژه صنعتی',
    trackingCode: 'PST-29810475210',
    totalAmount: 2900000,
    receiverName: 'مهندس امیرحسین کاظمی',
    receiverAddress: 'تهران، بزرگراه فتح، کیلومتر ۵، مجتمع صنعتی پارس، پلاک ۱۴',
    items: [
      {
        code: 'FORZA-C85',
        name: 'تسمه انتقال قدرت FORZA تیپ C85',
        quantity: 2,
        unit: 'حلقه',
        unitPrice: 1450000,
      },
    ],
  },
];

export const ConsumerDashboardPage: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const user = currentUser;
  const { addToCart, cart: cartItems = [] } = useCart();
  const navigate = useNavigate();

  // اگر کاربر متعلق به پنل خرید بالا (CRM) باشد، فقط به /account دسترسی دارد
  useEffect(() => {
    if (user && portalContentService.isHighVolumeCustomer(user)) {
      navigate('/account', { replace: true });
    }
  }, [user, navigate]);

  const [portalTick, setPortalTick] = useState(0);
  useEffect(() => {
    const onUpdate = () => setPortalTick(t => t + 1);
    window.addEventListener('atlas-portal-content-updated', onUpdate);
    return () => window.removeEventListener('atlas-portal-content-updated', onUpdate);
  }, []);

  const resolvedConfig = useMemo(
    () => portalContentService.getResolvedConfigForCustomer('consumer', user?.id),
    [user?.id, portalTick]
  );

  const activeBanners: PortalBannerItem[] = useMemo(
    () => portalContentService.getBannersForCustomer('consumer', user?.id),
    [user?.id, portalTick]
  );

  const activeAnnouncements: PortalAnnouncementItem[] = useMemo(
    () => portalContentService.getAnnouncementsForCustomer('consumer', user?.id),
    [user?.id, portalTick]
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

  const [orders] = useState<CustomerOrderItem[]>(INITIAL_CUSTOMER_ORDERS);
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState<CustomerOrderItem | null>(null);
  const [quickSkuQuery, setQuickSkuQuery] = useState('');
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string>('all');
  const [toast, setToast] = useState<string | null>(null);

  const [addresses, setAddresses] = useState([
    {
      id: 'addr-1',
      title: 'محل فعالیت / کارگاه اصلی',
      receiver: user?.fullName || 'مهندس امیرحسین کاظمی',
      phone: user?.phone || '09123456789',
      city: user?.city || 'تهران',
      postalCode: '1387654321',
      fullAddress: 'تهران، بزرگراه فتح، کیلومتر ۵، مجتمع صنعتی پارس، پلاک ۱۴',
      isDefault: true,
    },
    {
      id: 'addr-2',
      title: 'انبار تحویل مرسولات',
      receiver: 'مسئول تحویل انبار',
      phone: '09131514455',
      city: 'یزد',
      postalCode: '8917945639',
      fullAddress: 'یزد، بلوار جمهوری، شهرک صنعتی، فاز ۱، خیابان صنعتگران',
      isDefault: false,
    },
  ]);

  const [newAddress, setNewAddress] = useState({
    title: '',
    receiver: '',
    phone: '',
    city: '',
    postalCode: '',
    fullAddress: '',
  });
  const [isAddingAddress, setIsAddingAddress] = useState(false);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  // Catalog products with category filter & search
  const catalogProducts = useMemo(() => {
    const all = getManagedCatalogProducts().filter(p => p.active !== false);
    const byCat =
      selectedCategorySlug === 'all'
        ? all
        : all.filter(p => p.categorySlug === selectedCategorySlug);
    const q = quickSkuQuery.trim().toLowerCase();
    const filtered = q
      ? byCat.filter(
          p =>
            p.code.toLowerCase().includes(q) ||
            p.name.toLowerCase().includes(q) ||
            (p.variants || []).some(
              v => v.code.toLowerCase().includes(q) || v.name.toLowerCase().includes(q)
            )
        )
      : byCat;
    return filtered.slice(0, 24);
  }, [quickSkuQuery, selectedCategorySlug]);

  const handleQuickAddProduct = (product: any) => {
    const firstVar = (product.variants || [])[0];
    const price =
      (firstVar && (firstVar.price || firstVar.prices?.retail)) ||
      product.prices?.retail ||
      1450000;
    addToCart(
      {
        ...product,
        code: firstVar ? firstVar.code : product.code,
        name: firstVar ? `${product.name} (${firstVar.size || firstVar.code})` : product.name,
        prices: {
          base: price,
          retail: price,
          wholesale: price,
          dealer: price,
        },
        inquiryOnly: false,
      },
      1
    );
    showToast(`کالای «${product.name}» به سبد خرید شما اضافه شد.`);
  };

  const handleReorderItems = (order: CustomerOrderItem) => {
    const catalog = getManagedCatalogProducts();
    order.items.forEach(item => {
      const found = catalog[0];
      if (found) {
        addToCart(
          {
            ...found,
            code: item.code,
            name: item.name,
            prices: {
              base: item.unitPrice,
              retail: item.unitPrice,
              wholesale: item.unitPrice,
              dealer: item.unitPrice,
            },
            inquiryOnly: false,
          },
          item.quantity
        );
      }
    });
    showToast(`اقلام سفارش ${order.orderNumber} مجدداً به سبد خرید شما افزوده شد.`);
  };

  const handleDownloadMyPriceListExcel = () => {
    const lists = pricingCreditService.getPriceLists();
    const retailPl = lists.find(p => p.code === 'RETAIL') || lists[0];
    if (retailPl) {
      pricingCreditService.exportPriceListToExcel(retailPl.id);
    }
    showToast('فایل «اکسل لیست قیمت من» (.xlsx) با موفقیت دانلود شد.');
  };

  const handleBannerAction = (banner: PortalBannerItem) => {
    if (banner.ctaLinkOrTab.startsWith('/')) {
      navigate(banner.ctaLinkOrTab);
    } else if (enabledMenus.some(m => m.id === banner.ctaLinkOrTab)) {
      setActiveTab(banner.ctaLinkOrTab);
    } else {
      setActiveTab('quick_buy');
    }
    if (banner.cartDiscountPercent) {
      showToast(
        `طرح تخفیف ${toPersianDigits(banner.cartDiscountPercent)}٪ روی سبد خرید شما فعال است.`
      );
    }
  };

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddress.title.trim() || !newAddress.fullAddress.trim()) return;
    setAddresses(prev => [
      ...prev,
      {
        id: `addr-${Date.now()}`,
        ...newAddress,
        isDefault: prev.length === 0,
      },
    ]);
    setNewAddress({
      title: '',
      receiver: '',
      phone: '',
      city: '',
      postalCode: '',
      fullAddress: '',
    });
    setIsAddingAddress(false);
    showToast('آدرس جدید تحویل مرسوله ثبت شد.');
  };

  const totalSpent = orders.reduce((acc, o) => acc + o.totalAmount, 0);

  const getBannerThemeClasses = (theme: PortalBannerItem['theme']) => {
    switch (theme) {
      case 'royal_gold':
        return 'from-slate-900 via-amber-950 to-slate-900 border-amber-400/40 text-white';
      case 'emerald_trust':
        return 'from-emerald-950 via-teal-900 to-slate-900 border-emerald-400/40 text-white';
      case 'titanium_blue':
        return 'from-slate-900 via-blue-950 to-indigo-950 border-sky-400/40 text-white';
      case 'ruby_crimson':
        return 'from-rose-950 via-slate-900 to-slate-950 border-rose-400/40 text-white';
      default:
        return 'from-[#1B222C] via-[#252D3A] to-[#1B222C] border-[#E06518]/50 text-white';
    }
  };

  const getHeaderThemeClasses = () => {
    switch (resolvedConfig.uiTexts.headerAccentTheme) {
      case 'charcoal_gold':
        return 'from-slate-950 via-slate-900 to-amber-950/80 border-amber-500/30';
      case 'slate_emerald':
        return 'from-slate-950 via-emerald-950/70 to-slate-900 border-emerald-500/30';
      case 'deep_royal':
        return 'from-indigo-950 via-slate-900 to-slate-950 border-indigo-500/30';
      default:
        return 'from-[#181F29] via-[#222B38] to-[#181F29] border-slate-800';
    }
  };

  const getMenuIcon = (id: string) => {
    switch (id) {
      case 'overview':
        return ShoppingBag;
      case 'orders':
        return Truck;
      case 'quick_buy':
        return Zap;
      case 'receipts':
        return FileText;
      case 'addresses':
        return MapPin;
      default:
        return Package;
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F5F8] pb-16 text-right" dir="rtl">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 left-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-emerald-500/40 flex items-center gap-2.5 text-xs font-bold">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* Top Hero Header */}
      <div className={`bg-gradient-to-l ${getHeaderThemeClasses()} text-white border-b`}>
        <div className="max-w-7xl mx-auto px-4 py-7 sm:py-9">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 text-amber-400 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 text-[#E06518]" />
                <span>پنل کاربری و مدیریت هوشمند سفارشات</span>
                {user?.companyName && (
                  <>
                    <span className="text-slate-600">•</span>
                    <span className="text-slate-300">{user.companyName}</span>
                  </>
                )}
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white leading-snug">
                {resolvedConfig.uiTexts.heroWelcomePrefix}{' '}
                <span className="text-[#E06518]">{user?.fullName || 'مشتری گرامی'}</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                {resolvedConfig.uiTexts.heroSubtitle}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {resolvedConfig.permissions.allowExcelPriceListDownload && (
                <button
                  type="button"
                  onClick={handleDownloadMyPriceListExcel}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-2 shadow-lg transition cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>{resolvedConfig.uiTexts.excelDownloadButtonLabel}</span>
                </button>
              )}
              <Link
                to="/products"
                className="px-4 py-2.5 rounded-xl bg-[#E06518] hover:bg-[#C95210] text-white text-xs font-black flex items-center gap-2 shadow-lg shadow-orange-600/20 transition"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{resolvedConfig.uiTexts.primaryCtaLabel}</span>
              </Link>
              <Link
                to="/cart"
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs font-bold flex items-center gap-2 transition"
              >
                <ShoppingCart className="w-4 h-4 text-amber-400" />
                <span>سبد خرید من ({toPersianDigits((cartItems || []).length)})</span>
              </Link>
            </div>
          </div>

          {/* 4 KPI Summary Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mt-7">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                <span>{resolvedConfig.uiTexts.kpi1Title}</span>
                <CreditCard className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-sm sm:text-base font-black text-emerald-400">
                حساب کاربری فعال
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                نام کاربری: <span className="font-mono">{user?.username || user?.phone || 'فعال'}</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                <span>{resolvedConfig.uiTexts.kpi2Title}</span>
                <Package className="w-4 h-4 text-[#E06518]" />
              </div>
              <div className="text-base sm:text-lg font-black text-white font-mono">
                {toPersianDigits(orders.length)} سفارش
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                ۱ مرسوله در مسیر تحویل
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                <span>{resolvedConfig.uiTexts.kpi3Title}</span>
                <FileText className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-base sm:text-lg font-black text-white font-mono">
                {formatPrice(totalSpent)} <span className="text-xs font-normal">تومان</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                همراه با فاکتور و رسید رسمی
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                <span>{resolvedConfig.uiTexts.kpi4Title}</span>
                <ShieldCheck className="w-4 h-4 text-sky-400" />
              </div>
              <div className="text-sm sm:text-base font-black text-white">
                تضمین ۱۰۰٪ اصالت کالا
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                ارسال مستقیم از انبار مرکزی یزد
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
              <div className="p-5 rounded-3xl bg-gradient-to-l from-emerald-900 via-teal-900 to-slate-900 text-white border border-emerald-400/40 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="inline-flex items-center gap-1.5 text-emerald-300 text-xs font-bold">
                    <Sparkles className="w-4 h-4" />
                    <span>طرح تشویقی ویژه حساب شما</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-white">
                    با رسیدن حجم خرید شما به{' '}
                    {formatPrice(resolvedConfig.customCartDiscountRule.minVolume)} تومان،{' '}
                    {toPersianDigits(resolvedConfig.customCartDiscountRule.discountPercent)}٪ تخفیف به کل سبد خرید شما اضافه می‌شود
                  </h3>
                  <p className="text-xs text-emerald-100/90">
                    {resolvedConfig.customCartDiscountRule.description}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('quick_buy')}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shrink-0 cursor-pointer transition"
                >
                  ثبت سفارش و دریافت تخفیف
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
                            خرید بالای {formatPrice(banner.minCartVolume)} ت ={' '}
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

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto px-4 mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Right Navigation Sidebar */}
        <aside className="lg:col-span-3 bg-white rounded-3xl border border-slate-200 p-4 shadow-xs space-y-2 lg:sticky lg:top-24">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-3 mb-2">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#E06518] to-amber-600 text-white flex items-center justify-center font-black text-base shrink-0 shadow-xs">
              <User className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="font-black text-xs text-slate-900 truncate">
                {user?.fullName || 'مهندس امیرحسین کاظمی'}
              </div>
              <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                {user?.phone || '09123456789'}
              </div>
              <div className="text-[10px] font-bold text-emerald-700 mt-1">
                پنل کاربری من
              </div>
            </div>
          </div>

          {enabledMenus.map(item => {
            const Icon = getMenuIcon(item.id);
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between cursor-pointer transition-all ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`w-4 h-4 ${isActive ? 'text-[#E06518]' : 'text-slate-400'}`}
                  />
                  <span>{item.label}</span>
                </div>
                <ArrowLeft className="w-3.5 h-3.5 opacity-60" />
              </button>
            );
          })}

          {/* Category Quick Links in Menu */}
          <div className="pt-3 mt-3 border-t border-slate-100 space-y-2">
            <div className="px-2 text-[11px] font-black text-slate-500 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#E06518]" />
              <span>دسترسی سریع دسته‌بندی کالاها</span>
            </div>
            <div className="space-y-1">
              {CATEGORIES.slice(0, 5).map(cat => (
                <button
                  key={cat.slug}
                  type="button"
                  onClick={() => {
                    setSelectedCategorySlug(cat.slug);
                    setActiveTab('quick_buy');
                  }}
                  className="w-full text-right px-3 py-1.5 rounded-lg text-[11px] font-medium text-slate-600 hover:bg-orange-50 hover:text-[#E06518] transition flex items-center justify-between cursor-pointer"
                >
                  <span className="truncate">{cat.name}</span>
                  <ArrowLeft className="w-3 h-3 opacity-40 shrink-0" />
                </button>
              ))}
            </div>
          </div>

          {user && (
            <div className="pt-3 mt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                className="w-full px-3.5 py-2.5 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-bold flex items-center gap-2 cursor-pointer transition"
              >
                <LogOut className="w-4 h-4" />
                <span>خروج از حساب کاربری</span>
              </button>
            </div>
          )}
        </aside>

        {/* Left Main Area */}
        <main className="lg:col-span-9 space-y-6">
          {/* Active Announcements */}
          {activeAnnouncements.length > 0 && activeTab === 'overview' && (
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

          {/* ===============================================================
              TAB 1: OVERVIEW (پیشخوان کاربری و رهگیری مرسوله)
             =============================================================== */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Active Shipment Live Tracker */}
              {orders[0] && (
                <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-bold text-emerald-700">تأیید و تسویه‌شده</span>
                        <span className="text-slate-300">•</span>
                        <span className="font-mono font-black text-sm text-slate-900" dir="ltr">
                          {orders[0].orderNumber}
                        </span>
                      </div>
                      <h2 className="text-base font-black text-slate-800 mt-1">
                        وضعیت لحظه‌ای آخرین سفارش شما
                      </h2>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {resolvedConfig.permissions.allowExcelPriceListDownload && (
                        <button
                          type="button"
                          onClick={handleDownloadMyPriceListExcel}
                          className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition"
                        >
                          <FileSpreadsheet className="w-3.5 h-3.5" />
                          <span>{resolvedConfig.uiTexts.excelDownloadButtonLabel}</span>
                        </button>
                      )}
                      {resolvedConfig.permissions.allowInvoicePrint && (
                        <button
                          type="button"
                          onClick={() => setSelectedReceiptOrder(orders[0])}
                          className="px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>مشاهده و چاپ فاکتور</span>
                        </button>
                      )}
                      {resolvedConfig.permissions.allowQuickReorder && (
                        <button
                          type="button"
                          onClick={() => handleReorderItems(orders[0])}
                          className="px-3.5 py-2 rounded-xl bg-[#E06518] hover:bg-[#C95210] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>تکرار این سفارش</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Visual Stepper */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    {[
                      {
                        step: '۱. ثبت و تأیید سفارش',
                        desc: 'تأیید نهایی در سیستم',
                        done: true,
                      },
                      {
                        step: '۲. کنترل کیفی و بسته‌بندی',
                        desc: 'تست اصالت در انبار مرکزی',
                        done: true,
                      },
                      {
                        step: '۳. تحویل به تیپاکس / باربری',
                        desc: `کد رهگیری: ${orders[0].trackingCode}`,
                        done: true,
                        active: true,
                      },
                      {
                        step: '۴. تحویل به آدرس شما',
                        desc: 'در مسیر ارسال به مقصد',
                        done: false,
                      },
                    ].map((st, idx) => (
                      <div
                        key={idx}
                        className={`p-3.5 rounded-2xl border text-xs ${
                          st.active
                            ? 'border-[#E06518] bg-orange-50/70'
                            : st.done
                            ? 'border-emerald-200 bg-emerald-50/50'
                            : 'border-slate-200 bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-black text-slate-800">{st.step}</span>
                          {st.done ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Clock className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                        <div className="text-[11px] text-slate-600">{st.desc}</div>
                      </div>
                    ))}
                  </div>

                  {/* Order Items Summary */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-slate-600 pb-2 border-b border-slate-200">
                      <span>
                        روش ارسال: <strong className="text-slate-900">{orders[0].shippingMethod}</strong>
                      </span>
                      <span>
                        مبلغ کل سفارش:{' '}
                        <strong className="text-emerald-700 font-mono text-sm">
                          {formatPrice(orders[0].totalAmount)} تومان
                        </strong>
                      </span>
                    </div>
                    <div className="divide-y divide-slate-200/60">
                      {orders[0].items.map((item, i) => (
                        <div key={i} className="py-2 flex items-center justify-between">
                          <div>
                            <span className="font-mono font-bold text-[#E06518] ml-2" dir="ltr">
                              [{item.code}]
                            </span>
                            <span className="font-bold text-slate-800">{item.name}</span>
                          </div>
                          <div className="font-mono text-slate-700">
                            {toPersianDigits(item.quantity)} {item.unit} × {formatPrice(item.unitPrice)} ت
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Product Selection Grid */}
              {resolvedConfig.permissions.allowQuickSkuOrder && (
                <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="font-black text-base text-slate-800 flex items-center gap-2">
                        <Zap className="w-5 h-5 text-[#E06518]" />
                        <span>{resolvedConfig.uiTexts.priceListSectionTitle}</span>
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        قطعات و ملزومات پرمصرف صنعتی آماده افزودن مستقیم به سبد خرید شما
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab('quick_buy')}
                      className="text-xs font-bold text-[#E06518] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>مشاهده همه کالاها و جستجو با کد فنی</span>
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {catalogProducts.slice(0, 6).map(prod => {
                      const firstVar = (prod.variants || [])[0];
                      const unitPrice =
                        (firstVar && (firstVar.price || firstVar.prices?.retail)) ||
                        prod.prices?.retail ||
                        1450000;
                      return (
                        <div
                          key={prod.code}
                          className="p-4 rounded-2xl border border-slate-200 hover:border-[#E06518] bg-slate-50/50 hover:bg-white transition-all flex flex-col justify-between gap-3"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-16 h-16 rounded-xl bg-white border border-slate-200 p-1.5 shrink-0 overflow-hidden">
                              <ProductImage
                                src={prod.images?.[0]}
                                alt={prod.name}
                                className="w-full h-full object-contain"
                              />
                            </div>
                            <div className="min-w-0">
                              <span
                                className="inline-block font-mono text-[11px] font-black text-[#E06518]"
                                dir="ltr"
                              >
                                کد: {firstVar ? firstVar.code : prod.code}
                              </span>
                              <Link
                                to={`/product/${encodeURIComponent(prod.code)}`}
                                className="block font-black text-xs text-slate-800 hover:text-[#E06518] line-clamp-2 mt-0.5"
                              >
                                {prod.name}
                              </Link>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-slate-200/80">
                            <div>
                              <span className="text-[10px] text-slate-500 block">قیمت واحد:</span>
                              <span className="font-mono font-black text-xs text-emerald-700">
                                {formatPrice(unitPrice)} تومان
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleQuickAddProduct(prod)}
                              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-[#E06518] text-white text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>افزودن به سبد</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ===============================================================
              TAB 2: ORDERS & MY PRICE LIST DOWNLOAD
             =============================================================== */}
          {activeTab === 'orders' && (
            <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <h3 className="font-black text-base text-slate-800 flex items-center gap-2">
                    <Truck className="w-5 h-5 text-[#E06518]" />
                    <span>{resolvedConfig.uiTexts.ordersSectionTitle}</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    پیگیری وضعیت مرسولات، دریافت فاکتور و دانلود فایل اکسل لیست قیمت من
                  </p>
                </div>

                {resolvedConfig.permissions.allowExcelPriceListDownload && (
                  <button
                    type="button"
                    onClick={handleDownloadMyPriceListExcel}
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-2 cursor-pointer shadow-sm transition"
                  >
                    <Download className="w-4 h-4" />
                    <span>{resolvedConfig.uiTexts.excelDownloadButtonLabel} (.xlsx)</span>
                  </button>
                )}
              </div>

              <div className="space-y-4">
                {orders.map(order => (
                  <div
                    key={order.id}
                    className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-sm text-slate-900" dir="ltr">
                            {order.orderNumber}
                          </span>
                          <span className="text-slate-300">•</span>
                          <span
                            className={`text-xs font-bold ${
                              order.status === 'delivered'
                                ? 'text-emerald-700'
                                : 'text-amber-700'
                            }`}
                          >
                            {order.status === 'delivered'
                              ? 'تحویل‌شده به مشتری'
                              : 'تحویل تیپاکس / در مسیر ارسال'}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500">
                          تاریخ ثبت: {order.date} • کد رهگیری مرسوله:{' '}
                          <span className="font-mono font-bold text-slate-800" dir="ltr">
                            {order.trackingCode}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {resolvedConfig.permissions.allowInvoicePrint && (
                          <button
                            type="button"
                            onClick={() => setSelectedReceiptOrder(order)}
                            className="px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>مشاهده فاکتور</span>
                          </button>
                        )}
                        {resolvedConfig.permissions.allowQuickReorder && (
                          <button
                            type="button"
                            onClick={() => handleReorderItems(order)}
                            className="px-3 py-1.5 rounded-xl bg-[#E06518] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>سفارش مجدد</span>
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2 text-xs">
                      {order.items.map((it, idx) => (
                        <div key={idx} className="flex items-center justify-between">
                          <div>
                            <span className="font-mono font-bold text-[#E06518] ml-1.5" dir="ltr">
                              {it.code}
                            </span>
                            <span className="font-bold text-slate-800">{it.name}</span>
                          </div>
                          <div className="font-mono text-slate-700">
                            {toPersianDigits(it.quantity)} {it.unit} × {formatPrice(it.unitPrice)} ت
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===============================================================
              TAB 3: QUICK ORDER BY SKU CODE & CATEGORY
             =============================================================== */}
          {activeTab === 'quick_buy' && (
            <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-black text-base text-slate-800">
                    جستجو و ثبت سفارش سریع بر اساس کد کالا یا دسته‌بندی
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    کد فنی قطعه (مثلاً 34265) یا نام آن را وارد کنید و مستقیماً به سبد خرید اضافه نمایید
                  </p>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-72">
                    <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="search"
                      value={quickSkuQuery}
                      onChange={e => setQuickSkuQuery(e.target.value)}
                      placeholder="جستجوی کد کالا یا نام محصول..."
                      className="w-full pr-9 pl-3 py-2 rounded-xl border border-slate-300 text-xs focus:border-[#E06518] outline-none"
                    />
                  </div>
                  {resolvedConfig.permissions.allowExcelPriceListDownload && (
                    <button
                      type="button"
                      onClick={handleDownloadMyPriceListExcel}
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shrink-0 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>اکسل لیست قیمت من</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Category Filter Bar */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-2">
                <button
                  type="button"
                  onClick={() => setSelectedCategorySlug('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 cursor-pointer transition ${
                    selectedCategorySlug === 'all'
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  همه دسته‌بندی‌ها
                </button>
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.slug}
                    type="button"
                    onClick={() => setSelectedCategorySlug(cat.slug)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 cursor-pointer transition ${
                      selectedCategorySlug === cat.slug
                        ? 'bg-[#E06518] text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {catalogProducts.map(prod => {
                  const firstVar = (prod.variants || [])[0];
                  const unitPrice =
                    (firstVar && (firstVar.price || firstVar.prices?.retail)) ||
                    prod.prices?.retail ||
                    1450000;
                  return (
                    <div
                      key={prod.code}
                      className="p-3.5 rounded-2xl border border-slate-200 flex flex-col justify-between gap-3 bg-slate-50/40 hover:bg-white hover:border-[#E06518] transition"
                    >
                      <div>
                        <span className="font-mono text-xs font-black text-[#E06518]" dir="ltr">
                          کد: {firstVar ? firstVar.code : prod.code}
                        </span>
                        <div className="font-bold text-xs text-slate-800 mt-1">{prod.name}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{prod.categoryName}</div>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                        <span className="font-mono font-black text-xs text-emerald-700">
                          {formatPrice(unitPrice)} ت
                        </span>
                        <button
                          type="button"
                          onClick={() => handleQuickAddProduct(prod)}
                          className="px-3 py-1.5 rounded-xl bg-[#E06518] hover:bg-[#C95210] text-white text-xs font-bold cursor-pointer transition"
                        >
                          + افزودن به سبد
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ===============================================================
              TAB 4: RECEIPTS & INVOICES
             =============================================================== */}
          {activeTab === 'receipts' && (
            <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="font-black text-base text-slate-800">
                  رسیدهای پرداخت و فاکتورهای رسمی سفارشات من
                </h3>
                {resolvedConfig.permissions.allowExcelPriceListDownload && (
                  <button
                    type="button"
                    onClick={handleDownloadMyPriceListExcel}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{resolvedConfig.uiTexts.excelDownloadButtonLabel}</span>
                  </button>
                )}
              </div>
              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-xs text-right border-collapse">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-700">
                    <tr>
                      <th className="py-3 px-4 font-bold">شماره فاکتور</th>
                      <th className="py-3 px-4 font-bold">تاریخ ثبت</th>
                      <th className="py-3 px-4 font-bold">شماره پیگیری پرداخت</th>
                      <th className="py-3 px-4 font-bold">مبلغ کل (تومان)</th>
                      <th className="py-3 px-4 font-bold">عملیات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {orders.map(o => (
                      <tr key={o.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-mono font-black text-slate-900" dir="ltr">
                          {o.orderNumber}
                        </td>
                        <td className="py-3 px-4">{o.date}</td>
                        <td className="py-3 px-4 font-mono text-slate-600">{o.paymentRef}</td>
                        <td className="py-3 px-4 font-mono font-black text-emerald-700">
                          {formatPrice(o.totalAmount)} ت
                        </td>
                        <td className="py-3 px-4">
                          <button
                            type="button"
                            onClick={() => setSelectedReceiptOrder(o)}
                            className="px-3 py-1.5 rounded-xl bg-slate-900 text-white font-bold text-xs cursor-pointer"
                          >
                            مشاهده و چاپ فاکتور
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ===============================================================
              TAB 5: SHIPPING ADDRESSES
             =============================================================== */}
          {activeTab === 'addresses' && (
            <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-base text-slate-800">
                  آدرس‌های ثبت‌شده جهت ارسال مرسولات
                </h3>
                <button
                  type="button"
                  onClick={() => setIsAddingAddress(!isAddingAddress)}
                  className="px-4 py-2 rounded-xl bg-[#E06518] text-white text-xs font-bold cursor-pointer"
                >
                  + افزودن آدرس جدید
                </button>
              </div>

              {isAddingAddress && (
                <form
                  onSubmit={handleAddAddress}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="text"
                      required
                      placeholder="عنوان آدرس (مثلاً کارگاه مرکزی)"
                      value={newAddress.title}
                      onChange={e => setNewAddress({ ...newAddress, title: e.target.value })}
                      className="px-3 py-2 rounded-xl border border-slate-300 bg-white"
                    />
                    <input
                      type="text"
                      required
                      placeholder="نام تحویل‌گیرنده"
                      value={newAddress.receiver}
                      onChange={e => setNewAddress({ ...newAddress, receiver: e.target.value })}
                      className="px-3 py-2 rounded-xl border border-slate-300 bg-white"
                    />
                    <input
                      type="text"
                      dir="ltr"
                      placeholder="شماره تماس"
                      value={newAddress.phone}
                      onChange={e => setNewAddress({ ...newAddress, phone: e.target.value })}
                      className="px-3 py-2 rounded-xl border border-slate-300 bg-white font-mono"
                    />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="نشانی دقیق پستی..."
                    value={newAddress.fullAddress}
                    onChange={e =>
                      setNewAddress({ ...newAddress, fullAddress: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold cursor-pointer"
                    >
                      ذخیره آدرس
                    </button>
                  </div>
                </form>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addresses.map(addr => (
                  <div
                    key={addr.id}
                    className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-black text-sm text-slate-900">{addr.title}</span>
                      {addr.isDefault && (
                        <span className="text-emerald-700 text-[11px] font-bold">
                          آدرس پیش‌فرض
                        </span>
                      )}
                    </div>
                    <p className="text-slate-600 leading-relaxed">{addr.fullAddress}</p>
                    <div className="text-[11px] text-slate-500 pt-1">
                      تحویل‌گیرنده: <strong>{addr.receiver}</strong> • تلفن:{' '}
                      <span className="font-mono">{addr.phone}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Printable Invoice Modal */}
      {selectedReceiptOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl border border-slate-200 shadow-2xl overflow-hidden">
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h4 className="text-sm font-black">
                فاکتور و رسید خرید — {selectedReceiptOrder.orderNumber}
              </h4>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-lg bg-[#E06518] text-white text-xs font-bold cursor-pointer"
                >
                  چاپ فاکتور
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedReceiptOrder(null)}
                  className="px-3 py-1.5 rounded-lg bg-white/10 text-white text-xs font-bold cursor-pointer"
                >
                  بستن
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4 text-xs">
              <div className="flex justify-between pb-3 border-b border-slate-200">
                <div>
                  <div className="font-black text-sm text-slate-900">
                    فروشگاه و بازرگانی هایپرصنعت اطلس یزد
                  </div>
                  <div className="text-slate-500 mt-0.5">
                    خریدار: {selectedReceiptOrder.receiverName}
                  </div>
                </div>
                <div className="text-left">
                  <div>تاریخ: {selectedReceiptOrder.date}</div>
                  <div className="text-emerald-700 font-bold mt-0.5">وضعیت: تسویه کامل</div>
                </div>
              </div>

              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-600">
                    <th className="py-2">کد کالا</th>
                    <th className="py-2">شرح کالا</th>
                    <th className="py-2">تعداد</th>
                    <th className="py-2">قیمت واحد (تومان)</th>
                    <th className="py-2">جمع (تومان)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedReceiptOrder.items.map((it, i) => (
                    <tr key={i}>
                      <td className="py-2.5 font-mono font-bold text-[#E06518]" dir="ltr">
                        {it.code}
                      </td>
                      <td className="py-2.5 font-bold">{it.name}</td>
                      <td className="py-2.5">
                        {toPersianDigits(it.quantity)} {it.unit}
                      </td>
                      <td className="py-2.5 font-mono">{formatPrice(it.unitPrice)}</td>
                      <td className="py-2.5 font-mono font-bold">
                        {formatPrice(it.unitPrice * it.quantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between font-black text-sm text-emerald-950">
                <span>جمع کل پرداخت‌شده:</span>
                <span className="font-mono">{formatPrice(selectedReceiptOrder.totalAmount)} تومان</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
