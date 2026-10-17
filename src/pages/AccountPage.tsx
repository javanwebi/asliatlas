import React, { useState, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
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
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import {
  pricingCreditService,
  PriceListDefinition,
  CatalogSkuPriceItem,
  CustomerRewardAssignment,
} from "../services/pricingCreditService";
import {
  portalContentService,
  PortalBannerItem,
  PortalAnnouncementItem,
  ClubTierMilestoneConfig,
} from "../services/portalContentService";
import { getManagedCatalogProducts } from "../data/mockGenerator";
import { CATEGORIES } from "../data/categories";
import { Customer } from "../types";
import { toPersianDigits } from "../utils/formatters";

const formatPrice = (amount: number | undefined) =>
  new Intl.NumberFormat("fa-IR").format(amount ?? 0);

interface HighVolumeOrderItem {
  id: string;
  orderNumber: string;
  date: string;
  totalAmount: number;
  status: "shipped" | "delivered" | "processing";
  statusText: string;
  trackingCode: string;
  carrier: string;
  itemsCount: number;
}

export const AccountPage: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const { addToCart, cart: cartItems = [], orders: customerOrders } = useCart();
  const navigate = useNavigate();

  // اگر کاربر عادی (ثبت‌نامی) باشد، اجازه ورود به پنل خرید بالا (/account) را ندارد و به /consumer-dashboard هدایت می‌شود
  useEffect(() => {
    if (
      currentUser &&
      !portalContentService.isHighVolumeCustomer(currentUser)
    ) {
      navigate("/consumer-dashboard", { replace: true });
    }
  }, [currentUser, navigate]);

  // Sync with pricingCreditService & portalContentService
  const [priceLists, setPriceLists] = useState<PriceListDefinition[]>(() =>
    pricingCreditService.getPriceLists(),
  );
  const [allCustomers, setAllCustomers] = useState<Customer[]>(() =>
    pricingCreditService.getAllCustomers(),
  );
  const [catalogSkus, setCatalogSkus] = useState<CatalogSkuPriceItem[]>(() =>
    pricingCreditService.getAllCatalogSkuItems(),
  );
  const [clubMilestones, setClubMilestones] = useState<
    ClubTierMilestoneConfig[]
  >(() => portalContentService.getClubMilestones());
  const [portalTick, setPortalTick] = useState(0);

  const refreshData = () => {
    setPriceLists(pricingCreditService.getPriceLists());
    setAllCustomers(pricingCreditService.getAllCustomers());
    setCatalogSkus(pricingCreditService.getAllCatalogSkuItems());
    setClubMilestones(portalContentService.getClubMilestones());
    setPortalTick((t) => t + 1);
  };

  useEffect(() => {
    window.addEventListener("atlas-pricing-updated", refreshData);
    window.addEventListener("atlas-catalog-updated", refreshData);
    window.addEventListener("atlas-portal-content-updated", refreshData);
    return () => {
      window.removeEventListener("atlas-pricing-updated", refreshData);
      window.removeEventListener("atlas-catalog-updated", refreshData);
      window.removeEventListener("atlas-portal-content-updated", refreshData);
    };
  }, []);

  // مشتری فعلی بر اساس کاربر لاگین‌شده از CRM (بدون هیچ‌گونه سوئیچر دستی برای مشتری)
  const currentCustomer = currentUser!;

  const activePriceList: PriceListDefinition = useMemo(() => {
    const pl = pricingCreditService.getPriceListForCustomer(currentCustomer);
    return (
      pl || {
        id: "pl-default",
        code: "UNASSIGNED",
        name: "لیست قیمت من",
        adminTitle: "لیست قیمت B",
        clubTier: "silver",
        clubTierLabel: "سطح نقره‌ای",
        customerTierLabel: "سطح نقره‌ای",
        customerTier: "silver",
        minPurchaseVolume: 0,
        discountPercent: 0,
        defaultDiscountPercent: 0,
        description: "",
      }
    );
  }, [currentCustomer, priceLists]);

  // تنظیمات محتوا و دسترسی‌های پنل (ترکیب عمومی + تکی برای این مشتری)
  const resolvedConfig = useMemo(
    () =>
      portalContentService.getResolvedConfigForCustomer(
        "high_volume",
        currentCustomer.id,
      ),
    [currentCustomer.id, portalTick],
  );

  const portalLabel = (text: string) => resolvedConfig.labels[text] ?? text;

  const activeBanners: PortalBannerItem[] = useMemo(
    () =>
      portalContentService.getBannersForCustomer(
        "high_volume",
        currentCustomer.id,
        activePriceList.code,
      ),
    [currentCustomer.id, activePriceList.code, portalTick],
  );

  const activeAnnouncements: PortalAnnouncementItem[] = useMemo(
    () =>
      portalContentService.getAnnouncementsForCustomer(
        "high_volume",
        currentCustomer.id,
      ),
    [currentCustomer.id, portalTick],
  );

  const enabledMenus = useMemo(
    () => resolvedConfig.menus.filter((m) => m.enabled),
    [resolvedConfig.menus],
  );

  const [activeTab, setActiveTabState] = useState<string>("overview");

  const setActiveTab = (id: string) => {
    if (enabledMenus.some((m) => m.id === id)) setActiveTabState(id);
  };
  useEffect(() => {
    if (!enabledMenus.some((m) => m.id === activeTab)) {
      setActiveTabState(enabledMenus[0]?.id || "");
    }
  }, [enabledMenus, activeTab]);

  const myRewards: CustomerRewardAssignment[] = useMemo(() => {
    const res = pricingCreditService.getRewardsForCustomer(currentCustomer);
    return Array.isArray(res) ? res : [];
  }, [currentCustomer, priceLists, portalTick]);

  // محاسبه دقیق وضعیت حجم خرید و نمودار میله‌ای باشگاه مشتریان (بدون امکان تغییر دستی سطح توسط مشتری)
  const clubChartData = useMemo(() => {
    const vol = Math.max(
      0,
      currentCustomer.totalPurchases ?? currentCustomer.totalOrdersAmount ?? 0,
    );
    const milestones = [...clubMilestones].sort(
      (a, b) => a.minPurchaseVolume - b.minPurchaseVolume,
    );
    const maxVolume = Math.max(
      ...milestones.map((m) => m.minPurchaseVolume),
      vol,
      1200000000,
    );

    // پیدا کردن سطح فعلی بر اساس حجم خرید یا تخصیص مدیریت
    let currentMilestone: ClubTierMilestoneConfig | undefined;
    for (const m of milestones) {
      if (vol >= m.minPurchaseVolume) {
        currentMilestone = m;
      }
    }

    const nextMilestone = milestones.find((m) => m.minPurchaseVolume > vol);
    const remainingToNext = nextMilestone
      ? Math.max(0, nextMilestone.minPurchaseVolume - vol)
      : 0;
    const overallProgressPercent =
      milestones.length === 0
        ? 0
        : nextMilestone
          ? Math.min(
              100,
              Math.round((vol / nextMilestone.minPurchaseVolume) * 100),
            )
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
  const [skuSearch, setSkuSearch] = useState("");
  const [selectedCategoryName, setSelectedCategoryName] =
    useState<string>("all");
  const [skuPage, setSkuPage] = useState(1);
  const [orderQuantities, setOrderQuantities] = useState<
    Record<string, number>
  >({});
  const orders: HighVolumeOrderItem[] = customerOrders
    .filter((o) => o.customerId === currentCustomer.id)
    .map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      date: o.createdAt,
      totalAmount: o.finalAmount,
      status:
        o.status === "delivered"
          ? "delivered"
          : o.status === "shipped"
            ? "shipped"
            : "processing",
      statusText:
        o.status === "delivered"
          ? "تحویل شده"
          : o.status === "shipped"
            ? "ارسال شده"
            : "در حال پردازش",
      trackingCode: o.trackingCode || "",
      carrier: o.shippingMethod || "",
      itemsCount: o.items.length,
    }));
  const [toast, setToast] = useState<string | null>(null);
  const skusPerPage = 14;

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const availableFamilyCategories = useMemo(() => {
    const set = new Set<string>();
    catalogSkus.forEach((s) => {
      if (s.categoryName) set.add(s.categoryName);
    });
    return Array.from(set);
  }, [catalogSkus]);

  const filteredSkus = useMemo(() => {
    if (activePriceList.id === "pl-default") return [];
    const byCat =
      selectedCategoryName === "all"
        ? catalogSkus
        : catalogSkus.filter((s) => s.categoryName === selectedCategoryName);
    const q = skuSearch.trim().toLowerCase();
    if (!q) return byCat;
    return byCat.filter(
      (s) =>
        s.code.toLowerCase().includes(q) ||
        s.name.toLowerCase().includes(q) ||
        s.familyName.toLowerCase().includes(q),
    );
  }, [catalogSkus, skuSearch, selectedCategoryName, activePriceList.id]);

  useEffect(() => {
    setSkuPage(1);
  }, [skuSearch, selectedCategoryName]);
  const totalSkuPages = Math.max(
    1,
    Math.ceil(filteredSkus.length / skusPerPage),
  );
  const paginatedSkus = filteredSkus.slice(
    (skuPage - 1) * skusPerPage,
    skuPage * skusPerPage,
  );

  const handleAddSkuToCart = (skuItem: CatalogSkuPriceItem) => {
    if (
      !resolvedConfig.permissions.allowQuickSkuOrder ||
      !enabledMenus.some((m) => m.id === "orders_pricelist")
    )
      return;
    if (activePriceList.id === "pl-default") return;
    const qty = Math.max(1, orderQuantities[skuItem.code] || 5);
    const myUnitPrice = pricingCreditService.getSkuPriceForList(
      skuItem.code,
      skuItem.basePrice,
      activePriceList,
    );
    const catalog = getManagedCatalogProducts();
    const fam = catalog.find((p) => p.code === skuItem.familyCode);
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
      qty,
    );
    showToast(
      `${toPersianDigits(qty)} ${skuItem.unit} از کد ${skuItem.code} (${formatPrice(myUnitPrice)} ت) به سبد سفارش شما اضافه شد.`,
    );
  };

  // دانلود اکسل لیست قیمت من (بدون کلمه «اختصاصی» یا کدهای داخلی)
  const handleDownloadMyPriceListExcel = () => {
    if (
      !resolvedConfig.permissions.allowExcelPriceListDownload ||
      !enabledMenus.some((m) => m.id === "orders_pricelist")
    )
      return;
    if (activePriceList.id === "pl-default") {
      showToast("لیست قیمت هنوز منتشر نشده است.");
      return;
    }
    pricingCreditService.exportPriceListToExcel(activePriceList.id);
    showToast(
      "فایل «اکسل لیست قیمت من» (.xlsx) شامل تمامی کدهای کالا با موفقیت دانلود شد.",
    );
  };

  const handleBannerAction = (banner: PortalBannerItem) => {
    if (banner.ctaLinkOrTab.startsWith("/")) {
      navigate(banner.ctaLinkOrTab);
    } else if (enabledMenus.some((m) => m.id === banner.ctaLinkOrTab)) {
      setActiveTab(banner.ctaLinkOrTab);
    } else {
      setActiveTab("orders_pricelist");
    }
  };

  const getBannerThemeClasses = (theme: PortalBannerItem["theme"]) => {
    switch (theme) {
      case "royal_gold":
        return "from-slate-900 via-amber-950 to-slate-950 border-amber-400/50 text-white";
      case "emerald_trust":
        return "from-emerald-950 via-teal-900 to-slate-900 border-emerald-400/50 text-white";
      case "titanium_blue":
        return "from-slate-900 via-blue-950 to-indigo-950 border-sky-400/50 text-white";
      case "ruby_crimson":
        return "from-rose-950 via-slate-900 to-slate-950 border-rose-400/50 text-white";
      default:
        return "from-[#55565A] via-[#646569] to-[#55565A] border-[#E06518]/50 text-white";
    }
  };

  const getHeaderThemeClasses = () => {
    switch (resolvedConfig.uiTexts.headerAccentTheme) {
      case "navy_orange":
        return "from-[#55565A] via-[#646569] to-[#55565A] border-[#E06518]/30";
      case "slate_emerald":
        return "from-slate-950 via-emerald-950/75 to-slate-900 border-emerald-500/30";
      case "deep_royal":
        return "from-indigo-950 via-slate-900 to-slate-950 border-indigo-500/30";
      default:
        return "from-[#55565A] via-[#66676B] to-[#55565A] border-orange-300/30";
    }
  };

  const getMenuIcon = (id: string) => {
    switch (id) {
      case "overview":
        return BarChart3;
      case "orders_pricelist":
        return FileSpreadsheet;
      case "club_rewards":
        return Gift;
      case "profile_addresses":
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

    if (!milestones.length)
      return (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
          مسیر باشگاه و مزایای آن پس از انتشار توسط مدیریت در این بخش نمایش داده
          می‌شود.
        </div>
      );

    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-7 shadow-xs space-y-6">
        {/* Header of Chart */}
        <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-[#E06518]">
              <BarChart3 className="w-4 h-4" />
              <span>{portalLabel("باشگاه مشتریان و مسیر پیشرفت خرید")}</span>
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
              <span className="text-[11px] text-slate-500 block">
                {portalLabel("حجم خرید ثبت‌شده شما:")}
              </span>
              <span className="font-mono font-black text-sm sm:text-base text-emerald-700">
                {formatPrice(vol)}
                {portalLabel("تومان")}
              </span>
            </div>
            <div className="h-8 w-px bg-slate-200 hidden sm:block" />
            <div>
              <span className="text-[11px] text-slate-500 block">
                {portalLabel("سطح فعلی باشگاه شما:")}
              </span>
              <span className="font-black text-sm text-[#E06518]">
                {currentMilestone?.publicTitle || "در آغاز مسیر باشگاه"}
              </span>
            </div>
          </div>
        </div>

        <p className="sm:hidden text-xs text-slate-500">برای مشاهده همه سطح‌ها، نمودار را به طرفین بکشید.</p>
        {/* Visual Vertical Bar Chart Container */}
        <div className="bg-gradient-to-b from-slate-50/70 to-slate-100/60 rounded-2xl border border-slate-200/90 p-5 sm:p-6 overflow-x-auto">
          <div className="grid grid-cols-5 gap-3 items-end min-w-[500px] min-h-[250px] pt-8">
            {/* ستون اول: موقعیت فعلی خرید مشتری */}
            <div className="flex flex-col items-center justify-end h-full space-y-2">
              <div className="text-center space-y-0.5">
                <span className="text-[10px] font-bold text-emerald-700 block">
                  {portalLabel("موقعیت فعلی شما")}
                </span>
                <span className="font-mono font-black text-xs text-slate-900 block">
                  {toPersianDigits(Math.round(vol / 1000000))}
                  {portalLabel("میلیون ت")}
                </span>
              </div>
              <div className="w-full max-w-[90px] h-44 bg-slate-200/70 rounded-2xl p-1.5 flex items-end overflow-hidden border border-emerald-300/80 shadow-inner">
                <div
                  className="w-full rounded-xl bg-gradient-to-t from-emerald-700 via-emerald-500 to-teal-400 transition-all duration-700 relative flex items-start justify-center pt-2 shadow-md"
                  style={{
                    height: `${Math.max(0, Math.min(100, Math.round((vol / maxVolume) * 100)))}%`,
                  }}
                >
                  <span className="text-[10px] font-mono font-black text-white drop-shadow">
                    {toPersianDigits(overallProgressPercent)}
                    {portalLabel("٪")}
                  </span>
                </div>
              </div>
              <div className="text-center pt-1">
                <div className="font-black text-xs text-emerald-800">
                  {portalLabel("حجم خرید من")}
                </div>
                <div className="text-[10px] text-slate-500">
                  {portalLabel("ثبت‌شده در سیستم")}
                </div>
              </div>
            </div>

            {/* ستون‌های سطوح باشگاه مشتریان (برنزی، نقره‌ای، طلایی، الماس) */}
            {milestones.map((m, idx) => {
              const isReached = vol >= m.minPurchaseVolume;
              const isCurrent = currentMilestone?.code === m.code;
              const barHeightPercent = Math.max(
                26 + idx * 18,
                Math.min(
                  100,
                  Math.round((m.minPurchaseVolume / maxVolume) * 100),
                ),
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
                          ? "text-[#E06518]"
                          : isReached
                            ? "text-emerald-700"
                            : "text-slate-500"
                      }`}
                    >
                      {isCurrent
                        ? "★ سطح فعلی شما"
                        : isReached
                          ? "✓ تکمیل‌شده"
                          : "هدف بعدی"}
                    </span>
                    <span className="font-mono font-bold text-xs text-slate-800 block">
                      {toPersianDigits(
                        Math.round(m.minPurchaseVolume / 1000000),
                      )}
                      {portalLabel("میلیون ت")}
                    </span>
                  </div>

                  {/* ستون میله */}
                  <div
                    className={`w-full max-w-[96px] h-44 rounded-2xl p-1.5 flex items-end overflow-hidden border transition-all ${
                      isCurrent
                        ? "bg-orange-50/80 border-2 border-[#E06518] shadow-md"
                        : isReached
                          ? "bg-emerald-50/50 border-emerald-300"
                          : "bg-slate-200/60 border-slate-300/80"
                    }`}
                  >
                    <div
                      className={`w-full rounded-xl bg-gradient-to-t ${
                        isReached ? m.barColor : "from-slate-400 to-slate-300"
                      } transition-all duration-700 flex flex-col items-center justify-between py-2 px-1 text-white shadow-xs`}
                      style={{ height: `${Math.min(100, barHeightPercent)}%` }}
                    >
                      <span className="text-[10px] font-mono font-black drop-shadow">
                        {toPersianDigits(m.discountPercent)}
                        {portalLabel("٪ تخفیف")}
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
                        isCurrent ? "text-[#E06518]" : "text-slate-900"
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
                  {portalLabel("با ثبت")}{" "}
                  <strong className="font-mono text-[#E06518]">
                    {formatPrice(remainingToNext)}
                    {portalLabel("تومان")}
                  </strong>{" "}
                  {portalLabel("خرید دیگر، به")}
                  <strong>{nextMilestone.publicTitle}</strong>
                  {portalLabel("ارتقا پیدا می‌کنید و از")}{" "}
                  <strong>
                    {toPersianDigits(nextMilestone.discountPercent)}
                    {portalLabel("٪ تخفیف")}
                  </strong>
                  {portalLabel("و جوایز آن سطح بهره‌مند می‌شوید.")}
                </span>
              ) : (
                <span className="text-emerald-700 font-bold">
                  {portalLabel(
                    "تبریک! شما در بالاترین سطح باشگاه مشتریان قرار دارید و تمامی جوایز و مزایای ویژه برای شما فعال است.",
                  )}
                </span>
              )}
            </div>

            {/* دکمه زیر نمودار میله‌ای برای ورود به صفحه جوایز و اتفاقات باشگاه مشتریان */}
            {showEnterClubButton && (
              <button
                type="button"
                onClick={() => setActiveTab("club_rewards")}
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
    <div className="min-h-screen bg-[#F7F8FA] pb-16 text-right" dir="rtl">
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
      <div
        className={`bg-gradient-to-l ${getHeaderThemeClasses()} text-white border-b`}
      >
        <div className="max-w-7xl mx-auto px-4 py-7 sm:py-9 space-y-6">
          {/* Customer Identity & Actions */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-amber-400 font-bold">
                <Award className="w-4 h-4 text-[#E06518]" />
                <span>{resolvedConfig.uiTexts.heroWelcomePrefix}</span>
                <span className="text-slate-600">•</span>
                <span className="text-emerald-300">
                  {clubChartData.currentMilestone?.publicTitle ||
                    "در آغاز مسیر باشگاه"}
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white">
                {currentCustomer.companyName || currentCustomer.fullName}
              </h1>

              <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
                {portalLabel("مسئول حساب:")}
                <strong>{currentCustomer.fullName}</strong> •{" "}
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
                  <span>
                    {resolvedConfig.uiTexts.excelDownloadButtonLabel} (.xlsx)
                  </span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setActiveTab("orders_pricelist")}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs font-bold flex items-center gap-2 cursor-pointer transition"
              >
                <FileSpreadsheet className="w-4 h-4 text-amber-400" />
                <span>{portalLabel("لیست قیمت من")}</span>
              </button>
              <Link
                to="/cart"
                className="px-4 py-2.5 rounded-xl bg-[#E06518] hover:bg-[#C95210] text-white text-xs font-black flex items-center gap-2 shadow-lg transition"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>
                  {portalLabel("سبد سفارش (")}
                  {toPersianDigits((cartItems || []).length)})
                </span>
              </Link>
            </div>
          </div>

          {/* 4 Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div
              className="p-4 rounded-2xl bg-white/5 border border-amber-500/30"
              hidden={!resolvedConfig.permissions.showKpi1}
            >
              <div className="flex items-center justify-between text-xs text-amber-300 mb-1">
                <span>{resolvedConfig.uiTexts.kpi1Title}</span>
                <Award className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-base sm:text-lg font-black text-white">
                {clubChartData.currentMilestone?.publicTitle ||
                  "در آغاز مسیر باشگاه"}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                {toPersianDigits(activePriceList.defaultDiscountPercent ?? 0)}
                {portalLabel("٪ تخفیف فعال روی لیست قیمت من")}
              </div>
            </div>

            <div
              className="p-4 rounded-2xl bg-white/5 border border-white/10"
              hidden={!resolvedConfig.permissions.showKpi2}
            >
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>{resolvedConfig.uiTexts.kpi2Title}</span>
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-base sm:text-lg font-black text-emerald-400 font-mono">
                {formatPrice(clubChartData.vol)}{" "}
                <span className="text-xs font-normal text-slate-300">
                  {portalLabel("تومان")}
                </span>
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                {clubChartData.nextMilestone
                  ? `${toPersianDigits(clubChartData.overallProgressPercent)}٪ تا رسیدن به ${clubChartData.nextMilestone.publicTitle}`
                  : clubChartData.milestones.length
                    ? "بالاترین سطح خرید باشگاه مشتریان"
                    : "مسیر باشگاه هنوز منتشر نشده است"}
              </div>
            </div>

            {resolvedConfig.permissions.showCreditLimitCard &&
              resolvedConfig.permissions.showKpi3 && (
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                    <span>{resolvedConfig.uiTexts.kpi3Title}</span>
                    <CreditCard className="w-4 h-4 text-sky-400" />
                  </div>
                  <div className="text-base sm:text-lg font-black text-white font-mono">
                    {formatPrice(currentCustomer.creditLimit ?? 0)}{" "}
                    <span className="text-xs font-normal text-slate-300">
                      {portalLabel("تومان")}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {portalLabel("شرایط تسویه حساب فعال")}
                  </div>
                </div>
              )}

            <div
              hidden={!resolvedConfig.permissions.showKpi4}
              onClick={() => setActiveTab("club_rewards")}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setActiveTab("club_rewards");
                }
              }}
              className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-amber-400/50 cursor-pointer transition"
            >
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>{resolvedConfig.uiTexts.kpi4Title}</span>
                <Gift className="w-4 h-4 text-[#E06518]" />
              </div>
              <div className="text-base sm:text-lg font-black text-amber-400">
                {toPersianDigits((myRewards || []).length)}
                {portalLabel("جایزه و امتیاز فعال")}
              </div>
              <div className="text-[11px] text-slate-300 mt-0.5 flex items-center gap-1">
                <span>{portalLabel("مشاهده جوایز باشگاه مشتریان")}</span>
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
                    <span>{portalLabel("پیشنهاد ویژه حساب شما")}</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-white">
                    {portalLabel("با ثبت سفارش به حجم")}{" "}
                    {formatPrice(
                      resolvedConfig.customCartDiscountRule.minVolume,
                    )}
                    {portalLabel("تومان،")}{" "}
                    {toPersianDigits(
                      resolvedConfig.customCartDiscountRule.discountPercent,
                    )}
                    {portalLabel(
                      "٪ تخفیف مازاد به کل سبد خرید شما اضافه می‌شود",
                    )}
                  </h3>
                  <p className="text-xs text-slate-300">
                    {resolvedConfig.customCartDiscountRule.description}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab("orders_pricelist")}
                  className="px-5 py-2.5 rounded-xl bg-[#E06518] hover:bg-[#C95210] text-white font-black text-xs shrink-0 cursor-pointer transition"
                >
                  {portalLabel("مشاهده لیست قیمت من و ثبت سفارش")}
                </button>
              </div>
            )}

            {activeBanners.map((banner) => (
              <div
                key={banner.id}
                className={`relative overflow-hidden rounded-3xl border bg-gradient-to-l ${getBannerThemeClasses(
                  banner.theme,
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
                            {portalLabel("سفارش بالای")}
                            {formatPrice(banner.minCartVolume)}
                            {portalLabel("ت =")}{" "}
                            {toPersianDigits(banner.cartDiscountPercent)}
                            {portalLabel("٪ تخفیف کل سبد خرید")}
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
                      <span>{banner.ctaText || "مشاهده و ثبت سفارش"}</span>
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
          <div className="flex w-full min-w-0 overflow-x-auto items-center gap-2 pb-1 md:w-auto">
            {enabledMenus.map((tab) => {
              const Icon = getMenuIcon(tab.id);
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`shrink-0 px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 cursor-pointer transition-all ${
                    isActive
                      ? "bg-slate-900 text-white shadow-xs"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 ${isActive ? "text-[#E06518]" : "text-slate-400"}`}
                  />
                  <span>{tab.label}</span>
                  {tab.id === "club_rewards" && myRewards.length > 0 && (
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
                navigate("/");
              }}
              className="px-3.5 py-2 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>{portalLabel("خروج از حساب")}</span>
            </button>
          )}
        </div>

        {/* ===================================================================
            TAB 1: OVERVIEW (پیشخوان، نمودار میله‌ای باشگاه مشتریان، اطلاعیه‌ها و خلاصه سفارشات)
           =================================================================== */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Active Announcements */}
            {resolvedConfig.permissions.showAnnouncements &&
              activeAnnouncements.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeAnnouncements.map((ann) => (
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
                              <span className="text-emerald-700">
                                {ann.highlightValue}
                              </span>
                            </>
                          )}
                        </div>
                        <h4 className="font-black text-xs sm:text-sm text-slate-900">
                          {ann.title}
                        </h4>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {ann.body}
                        </p>
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
            {resolvedConfig.permissions.showClubBarChart &&
              renderClubMilestoneBarChart(true)}

            {/* Quick Access Card to Orders & My Price List Excel */}
            <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                  <span>
                    {portalLabel("بخش سفارشات و «اکسل لیست قیمت من»")}
                  </span>
                </h3>
                <p className="text-xs text-slate-500">
                  {portalLabel(
                    "در بخش سفارشات می‌توانید فایل اکسل کامل لیست قیمت من را دانلود کرده و اقلام مورد نیاز خود را به صورت سریع ثبت نمایید.",
                  )}
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
                    <span>
                      {resolvedConfig.uiTexts.excelDownloadButtonLabel}
                    </span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setActiveTab("orders_pricelist")}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-[#E06518] text-white text-xs font-black flex items-center gap-2 cursor-pointer transition"
                >
                  <span>{portalLabel("ورود به سفارشات و لیست قیمت من")}</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
            TAB 2: ORDERS & MY PRICE LIST (سفارشات و لیست قیمت من + دانلود اکسل لیست قیمت من در همینجا)
           =================================================================== */}
        {activeTab === "orders_pricelist" && (
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
                    {portalLabel(
                      "مشاهده وضعیت سفارش‌های ثبت‌شده، پیش‌فاکتورها و دریافت مستقیم فایل اکسل لیست قیمت من",
                    )}
                  </p>
                </div>

                {resolvedConfig.permissions.allowExcelPriceListDownload && (
                  <button
                    type="button"
                    onClick={handleDownloadMyPriceListExcel}
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-2 cursor-pointer shadow-md transition"
                  >
                    <Download className="w-4 h-4" />
                    <span>
                      {resolvedConfig.uiTexts.excelDownloadButtonLabel} (.xlsx)
                    </span>
                  </button>
                )}
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-xs text-right border-collapse">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-700">
                    <tr>
                      <th className="py-3 px-4 font-bold">
                        {portalLabel("شماره سفارش / فاکتور")}
                      </th>
                      <th className="py-3 px-4 font-bold">
                        {portalLabel("تاریخ ثبت")}
                      </th>
                      <th className="py-3 px-4 font-bold">
                        {portalLabel("تعداد اقلام")}
                      </th>
                      <th className="py-3 px-4 font-bold">
                        {portalLabel("مبلغ کل سفارش (تومان)")}
                      </th>
                      <th className="py-3 px-4 font-bold">
                        {portalLabel("کد رهگیری باربری")}
                      </th>
                      <th className="py-3 px-4 font-bold">
                        {portalLabel("وضعیت ارسال")}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {orders.length === 0 && (
                      <tr>
                        <td
                          colSpan={6}
                          className="p-6 text-center text-sm text-slate-500"
                        >
                          هنوز سفارشی برای این حساب ثبت نشده است.
                        </td>
                      </tr>
                    )}
                    {orders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-slate-50">
                        <td
                          className="py-3 px-4 font-mono font-black text-slate-900"
                          dir="ltr"
                        >
                          {ord.orderNumber}
                        </td>
                        <td className="py-3 px-4">{ord.date}</td>
                        <td className="py-3 px-4 font-mono">
                          {toPersianDigits(ord.itemsCount)}
                          {portalLabel("قلم کالا")}
                        </td>
                        <td className="py-3 px-4 font-mono font-black text-emerald-700">
                          {formatPrice(ord.totalAmount)}
                          {portalLabel("تومان")}
                        </td>
                        <td
                          className="py-3 px-4 font-mono text-slate-600"
                          dir="ltr"
                        >
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
                    {portalLabel(
                      "می‌توانید فایل «اکسل لیست قیمت من» را دانلود کنید یا هر کد کالا را با تعداد دلخواه مستقیماً به سبد سفارش اضافه نمایید.",
                    )}
                  </p>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-80">
                    <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="search"
                      value={skuSearch}
                      onChange={(e) => {
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
                      <span>
                        {resolvedConfig.uiTexts.excelDownloadButtonLabel}
                      </span>
                    </button>
                  )}
                </div>
              </div>

              {/* فیلتر دسته‌بندی کالاها */}
              <div className="px-5 flex items-center gap-1.5 overflow-x-auto pb-1">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategoryName("all");
                    setSkuPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 cursor-pointer transition ${
                    selectedCategoryName === "all"
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {portalLabel("همه دسته‌بندی‌ها (")}
                  {toPersianDigits(catalogSkus.length)})
                </button>
                {availableFamilyCategories.map((catName) => (
                  <button
                    key={catName}
                    type="button"
                    onClick={() => {
                      setSelectedCategoryName(catName);
                      setSkuPage(1);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 cursor-pointer transition ${
                      selectedCategoryName === catName
                        ? "bg-[#E06518] text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
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
                      <th className="py-3 px-4 font-bold">
                        {portalLabel("کد کالا (SKU)")}
                      </th>
                      <th className="py-3 px-4 font-bold">
                        {portalLabel("شرح و مشخصات قطعه")}
                      </th>
                      <th className="py-3 px-4 font-bold">
                        {portalLabel("گروه کالا")}
                      </th>
                      <th className="py-3 px-4 font-bold">
                        {portalLabel("واحد")}
                      </th>
                      <th className="py-3 px-4 font-bold">
                        {portalLabel("قیمت واحد در لیست قیمت من")}
                      </th>
                      <th className="py-3 px-4 font-bold">
                        {portalLabel("ثبت در سفارش")}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginatedSkus.map((sku) => {
                      const myPrice = pricingCreditService.getSkuPriceForList(
                        sku.code,
                        sku.basePrice,
                        activePriceList,
                      );
                      const qty = orderQuantities[sku.code] ?? 5;

                      return (
                        <tr key={sku.code} className="hover:bg-orange-50/30">
                          <td
                            className="py-3 px-4 font-mono font-black text-[#E06518]"
                            dir="ltr"
                          >
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
                            {sku.categoryName || sku.familyName}
                          </td>
                          <td className="py-3 px-4 text-slate-600">
                            {sku.unit}
                          </td>
                          <td className="py-3 px-4 font-mono font-black text-emerald-700 text-sm">
                            {myPrice > 0
                              ? `${formatPrice(myPrice)} تومان`
                              : "تماس جهت پیش‌فاکتور"}
                          </td>
                          <td className="py-3 px-4">
                            {resolvedConfig.permissions.allowQuickSkuOrder ? (
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="number"
                                  min={1}
                                  value={qty}
                                  onChange={(e) =>
                                    setOrderQuantities({
                                      ...orderQuantities,
                                      [sku.code]: Math.max(
                                        1,
                                        Number(e.target.value) || 1,
                                      ),
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
                                  <span>{portalLabel("افزودن")}</span>
                                </button>
                              </div>
                            ) : (
                              <span className="text-slate-400">
                                {portalLabel("فعال")}
                              </span>
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
                  {portalLabel("صفحه")}
                  {toPersianDigits(skuPage)}
                  {portalLabel("از")}
                  {toPersianDigits(totalSkuPages)}
                  {portalLabel("(کل کدهای کالا:")}{" "}
                  {toPersianDigits(filteredSkus.length)})
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={skuPage <= 1}
                    onClick={() => setSkuPage((p) => Math.max(1, p - 1))}
                    className="px-3.5 py-1.5 rounded-lg border border-slate-300 bg-white disabled:opacity-40 font-bold cursor-pointer"
                  >
                    {portalLabel("قبلی")}
                  </button>
                  <button
                    type="button"
                    disabled={skuPage >= totalSkuPages}
                    onClick={() =>
                      setSkuPage((p) => Math.min(totalSkuPages, p + 1))
                    }
                    className="px-3.5 py-1.5 rounded-lg border border-slate-300 bg-white disabled:opacity-40 font-bold cursor-pointer"
                  >
                    {portalLabel("بعدی")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
            TAB 3: CUSTOMER CLUB, BAR CHART & FULL REWARDS / EVENTS PAGE
           =================================================================== */}
        {activeTab === "club_rewards" && (
          <div className="space-y-6">
            {/* ۱. نمودار میله‌ای پیشرفت حجم خرید در بالای صفحه باشگاه */}
            {renderClubMilestoneBarChart(false)}

            {/* ۲. جدول کامل جوایز و اتفاقاتی که در پنل مدیریت برای هر سطح تعریف شده است */}
            <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-7 shadow-xs space-y-5">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-[#E06518]">
                  <Sparkles className="w-4 h-4" />
                  <span>
                    {portalLabel("راهنمای کامل جوایز و مزایای باشگاه مشتریان")}
                  </span>
                </div>
                <h3 className="font-black text-base sm:text-lg text-slate-900 mt-1">
                  {portalLabel(
                    "با رسیدن به هر حجم از خرید، چه جوایز و امتیازاتی دریافت می‌کنید؟",
                  )}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {portalLabel(
                    "سطح شما به صورت خودکار بر اساس مجموع حجم خریدهای ثبت‌شده ارتقا می‌یابد و جوایز زیر برای حساب شما فعال می‌گردد.",
                  )}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {clubChartData.milestones.map((m) => {
                  const isCurrent =
                    clubChartData.currentMilestone?.code === m.code;
                  const isReached = clubChartData.vol >= m.minPurchaseVolume;

                  return (
                    <div
                      key={m.code}
                      className={`p-5 rounded-3xl border flex flex-col justify-between space-y-4 transition ${
                        isCurrent
                          ? "border-2 border-[#E06518] bg-gradient-to-br from-orange-50/60 to-white shadow-sm"
                          : isReached
                            ? "border-emerald-200 bg-emerald-50/30"
                            : "border-slate-200 bg-slate-50/60"
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-200/80">
                          <div>
                            <h4 className="font-black text-base text-slate-900">
                              {m.publicTitle}
                            </h4>
                            <span className="text-xs text-slate-500 font-mono">
                              {portalLabel("حداقل حجم خرید:")}{" "}
                              <strong className="text-slate-800">
                                {formatPrice(m.minPurchaseVolume)}
                                {portalLabel("تومان")}
                              </strong>
                            </span>
                          </div>
                          <div className="text-left">
                            <span className="font-mono font-black text-sm text-[#E06518] block">
                              {toPersianDigits(m.discountPercent)}
                              {portalLabel("٪ تخفیف پایه")}
                            </span>
                            <span
                              className={`text-[11px] font-bold ${
                                isCurrent
                                  ? "text-emerald-700"
                                  : isReached
                                    ? "text-emerald-600"
                                    : "text-slate-400"
                              }`}
                            >
                              {isCurrent
                                ? "★ سطح فعلی شما"
                                : isReached
                                  ? "✓ آزاد شده"
                                  : "در انتظار رسیدن به حد نصاب"}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                            <Gift className="w-4 h-4 text-[#E06518]" />
                            <span>
                              {portalLabel("جوایز و هدایای این سطح:")}
                            </span>
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
                              <span>
                                {portalLabel("امتیازات و خدمات ویژه:")}
                              </span>
                            </div>
                            <ul className="space-y-1 text-xs text-slate-600 pr-2">
                              {m.specialEvents.map((ev, i) => (
                                <li key={i} className="flex items-start gap-2">
                                  <span className="text-[#E06518] font-bold">
                                    •
                                  </span>
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
                  <span>
                    {portalLabel("جوایز و مشوق‌های فعال حساب من (")}
                    {toPersianDigits(myRewards.length)})
                  </span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {portalLabel(
                    "جوایز زیر بر اساس سطح باشگاه شما و طرح‌های تشویقی فعال گردیده و در سفارش‌های بعدی شما قابل اعمال است.",
                  )}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myRewards.map((rw) => (
                  <div
                    key={rw.id}
                    className="p-5 rounded-2xl border-2 border-amber-300/80 bg-gradient-to-br from-amber-50/70 to-white flex flex-col justify-between gap-4 shadow-xs"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <span className="font-black text-amber-900">
                          {portalLabel("پاداش باشگاه مشتریان")}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {rw.assignedAt}
                        </span>
                      </div>

                      <h4 className="font-black text-sm sm:text-base text-slate-900">
                        {rw.rewardTitle}
                      </h4>
                      <div className="text-xs font-black text-emerald-700">
                        {portalLabel("ارزش هدیه / امتیاز:")}
                        {rw.rewardValue}
                      </div>
                      {rw.notes && (
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {rw.notes}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-amber-200/80">
                      <span className="text-[11px] font-bold text-amber-900">
                        {portalLabel("وضعیت: آماده استفاده در سفارش بعدی")}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          showToast(
                            `جایزه «${rw.rewardTitle}» برای سفارش بعدی شما رزرو و فعال گردید.`,
                          )
                        }
                        className="px-4 py-1.5 rounded-xl bg-[#E06518] hover:bg-[#C95210] text-white text-xs font-bold cursor-pointer"
                      >
                        {portalLabel("اعمال در سفارش بعدی")}
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
        {activeTab === "profile_addresses" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
              <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                <User className="w-5 h-5 text-[#E06518]" />
                <span>{portalLabel("مشخصات حساب کاربری و اطلاعات ورود")}</span>
              </h3>
              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <span className="text-slate-500">
                    {portalLabel("نام مجموعه / شرکت:")}
                  </span>
                  <strong className="text-slate-900">
                    {currentCustomer.companyName ||
                      currentCustomer.company ||
                      "—"}
                  </strong>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <span className="text-slate-500">
                    {portalLabel("نام مسئول خرید:")}
                  </span>
                  <strong className="text-slate-900">
                    {currentCustomer.fullName}
                  </strong>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <span className="text-slate-500">
                    {portalLabel("نام کاربری ورود به پنل:")}
                  </span>
                  <strong className="font-mono text-[#E06518]" dir="ltr">
                    {currentCustomer.username || currentCustomer.phone}
                  </strong>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <span className="text-slate-500">
                    {portalLabel("شماره تماس ثبت‌شده:")}
                  </span>
                  <strong className="font-mono text-slate-900" dir="ltr">
                    {currentCustomer.phone}
                  </strong>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
              <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#E06518]" />
                <span>{portalLabel("آدرس‌های تحویل باربری و انبار")}</span>
              </h3>
              <div className="space-y-3 text-xs">
                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-1.5">
                  {(currentCustomer.addresses || []).length === 0 && (
                    <p>{portalLabel("آدرس تحویل هنوز ثبت نشده است.")}</p>
                  )}
                  {(currentCustomer.addresses || []).map((address) => (
                    <div
                      key={address.id}
                      className="space-y-2 border-b border-slate-200 py-3 last:border-0"
                    >
                      <strong>{address.title}</strong>
                      <p>{address.fullAddress}</p>
                      <p>
                        {address.recipientName} — {address.recipientPhone}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
