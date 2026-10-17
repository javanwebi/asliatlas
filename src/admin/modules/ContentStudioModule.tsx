import React, { useState, useMemo, useEffect } from 'react';
import {
  Sparkles,
  LayoutTemplate,
  Megaphone,
  Sliders,
  Users,
  UserCheck,
  Plus,
  Edit3,
  Trash2,
  CheckCircle2,
  Eye,
  EyeOff,
  ShieldCheck,
  Award,
  BarChart3,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  ShoppingCart,
  Percent,
  Layers,
  ExternalLink,
  Check,
  Palette,
  Bell,
  Lock,
  Unlock,
} from 'lucide-react';
import {
  portalContentService,
  PortalTargetType,
  ContentScopeType,
  BannerThemeType,
  PortalBannerItem,
  PortalAnnouncementItem,
  PortalUiConfig,
  ClubMilestoneLevel,
  PortalMenuConfigItem,
  PortalCardConfigItem,
  PortalPermissionFlags,
} from '../../services/portalContentService';
import { adminService } from '../../services/adminService';
import { pricingCreditService } from '../../services/pricingCreditService';
import { Customer } from '../../types';
import { formatPrice, toPersianDigits } from '../../utils/formatters';

export const ContentStudioModule: React.FC = () => {
  // 1. Target Portal Selection: 'consumer' (پنل مشتری) vs 'high_volume' (پنل خرید بالا)
  const [selectedPortal, setSelectedPortal] = useState<PortalTargetType>('consumer');

  // 2. Active Studio Sub-Tab
  const [activeStudioTab, setActiveStudioTab] = useState<
    'banners' | 'ui_menus_access' | 'announcements' | 'club_chart'
  >('banners');

  // 3. Target Audience Scope: 'collective' (جمعی - تمام مشتریان این پنل) vs 'individual' (تکی - مشتری خاص)
  const [targetScope, setTargetScope] = useState<ContentScopeType>('collective');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [customerSearchQuery, setCustomerSearchQuery] = useState<string>('');

  // Data States
  const [banners, setBanners] = useState<PortalBannerItem[]>(() =>
    portalContentService.getBanners()
  );
  const [announcements, setAnnouncements] = useState<PortalAnnouncementItem[]>(() =>
    portalContentService.getAnnouncements()
  );
  const [uiConfigs, setUiConfigs] = useState< Record<PortalTargetType, PortalUiConfig>>(() =>
    portalContentService.getUiConfigs()
  );
  const [clubMilestones, setClubMilestones] = useState<ClubMilestoneLevel[]>(() =>
    portalContentService.getClubMilestones()
  );

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Load all customers and separate them by portal type
  const allCustomers = useMemo<Customer[]>(() => {
    const crmList = adminService.getCustomers();
    const gradingList = pricingCreditService.getAllCustomers();
    const map = new Map<string, Customer>();
    [...gradingList, ...crmList].forEach(c => {
      if (c && c.id) map.set(c.id, c);
    });
    return Array.from(map.values());
  }, [banners, announcements, uiConfigs]);

  const portalCustomers = useMemo(() => {
    return allCustomers.filter(c => {
      const isHighVol =
        Boolean(c.approvedB2B) ||
        Boolean(c.isLegacyCustomer) ||
        (Boolean(c.role) && c.role !== 'retail');
      return selectedPortal === 'high_volume' ? isHighVol : !isHighVol;
    });
  }, [allCustomers, selectedPortal]);

  const filteredPortalCustomers = useMemo(() => {
    const q = customerSearchQuery.trim().toLowerCase();
    if (!q) return portalCustomers;
    return portalCustomers.filter(c =>
      `${c.fullName} ${c.companyName || ''} ${c.phone} ${c.username || ''}`
        .toLowerCase()
        .includes(q)
    );
  }, [portalCustomers, customerSearchQuery]);

  // Ensure a valid customer is selected when switching to individual scope
  useEffect(() => {
    if (
      targetScope === 'individual' &&
      portalCustomers.length > 0 &&
      !portalCustomers.some(c => c.id === selectedCustomerId)
    ) {
      setSelectedCustomerId(portalCustomers[0].id);
    }
  }, [targetScope, portalCustomers, selectedCustomerId]);

  const selectedCustomerObj = useMemo(
    () => portalCustomers.find(c => c.id === selectedCustomerId) || null,
    [portalCustomers, selectedCustomerId]
  );

  const refreshAll = () => {
    setBanners(portalContentService.getBanners());
    setAnnouncements(portalContentService.getAnnouncements());
    setUiConfigs(portalContentService.getUiConfigs());
    setClubMilestones(portalContentService.getClubMilestones());
  };

  useEffect(() => {
    const handleSync = () => refreshAll();
    window.addEventListener('atlas-portal-content-updated', handleSync);
    return () => window.removeEventListener('atlas-portal-content-updated', handleSync);
  }, []);

  // ============================================================================
  // BANNER DESIGNER STATE & HANDLERS
  // ============================================================================
  const [editingBannerId, setEditingBannerId] = useState<string | null>(null);
  const [bannerForm, setBannerForm] = useState<{
    badgeText: string;
    title: string;
    subtitle: string;
    ctaText: string;
    ctaLink: string;
    theme: BannerThemeType;
    purchaseVolumeThreshold: number;
    cartDiscountPercent: number;
    active: boolean;
  }>({
    badgeText: 'کمپین ویژه خرید',
    title: 'با رسیدن حجم خرید به سقف تعیین‌شده، تخفیف ویژه به کل سبد خرید شما اضافه می‌شود',
    subtitle:
      'در سفارش‌های این دوره، با تکمیل حجم سبد خرید خود از تخفیف مستقیم روی کل فاکتور بهره‌مند شوید.',
    ctaText: 'ثبت سفارش و اعمال تخفیف سبد خرید',
    ctaLink: 'catalog',
    theme: 'industrial_orange',
    purchaseVolumeThreshold: 50000000,
    cartDiscountPercent: 5,
    active: true,
  });

  const handleGenerateVolumeDiscountCopy = () => {
    const volText =
      bannerForm.purchaseVolumeThreshold >= 1000000
        ? `${toPersianDigits(Math.round(bannerForm.purchaseVolumeThreshold / 1000000))} میلیون تومان`
        : `${formatPrice(bannerForm.purchaseVolumeThreshold)} تومان`;
    const discText = `${toPersianDigits(bannerForm.cartDiscountPercent)}٪`;

    const custPrefix =
      targetScope === 'individual' && selectedCustomerObj
        ? `پیشنهاد اختصاصی برای ${selectedCustomerObj.companyName || selectedCustomerObj.fullName}: `
        : '';

    setBannerForm(prev => ({
      ...prev,
      badgeText:
        targetScope === 'individual'
          ? `طرح تشویقی اختصاصی (${discText} تخفیف کل سبد)`
          : `پاداش حجم خرید (${discText} تخفیف کل سبد خرید)`,
      title: `${custPrefix}با خرید بالای ${volText}، ${discText} تخفیف به کل سبد خرید شما اضافه می‌شود`,
      subtitle: `به محض رسیدن مجموع سفارش شما به ${volText}، ${discText} تخفیف مازاد به صورت خودکار روی کل اقلام سبد خرید شما محاسبه و کسر می‌گردد.`,
    }));
    showToast('متن هوشمند بنر بر اساس حجم خرید و درصد تخفیف سبد تولید شد.');
  };

  const handleSaveBanner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bannerForm.title.trim()) return;

    const newBanner: PortalBannerItem = {
      id: editingBannerId || `bnr-${Date.now()}`,
      portalType: selectedPortal,
      scope: targetScope,
      targetCustomerId:
        targetScope === 'individual' ? selectedCustomerObj?.id : undefined,
      targetCustomerName:
        targetScope === 'individual'
          ? selectedCustomerObj?.companyName || selectedCustomerObj?.fullName
          : undefined,
      badgeText: bannerForm.badgeText.trim() || 'پیشنهاد ویژه',
      title: bannerForm.title.trim(),
      subtitle: bannerForm.subtitle.trim(),
      ctaText: bannerForm.ctaText.trim() || 'مشاهده و ثبت سفارش',
      ctaLink: bannerForm.ctaLink || 'catalog',
      theme: bannerForm.theme,
      purchaseVolumeThreshold:
        bannerForm.purchaseVolumeThreshold > 0
          ? Number(bannerForm.purchaseVolumeThreshold)
          : undefined,
      cartDiscountPercent:
        bannerForm.cartDiscountPercent > 0
          ? Number(bannerForm.cartDiscountPercent)
          : undefined,
      active: bannerForm.active,
      createdAt: new Date().toLocaleDateString('fa-IR'),
    };

    portalContentService.saveBanner(newBanner);
    refreshAll();
    setEditingBannerId(null);
    showToast(
      targetScope === 'individual'
        ? `بنر اختصاصی برای «${newBanner.targetCustomerName}» ذخیره و در پنل او فعال شد.`
        : `بنر جمعی در «${selectedPortal === 'consumer' ? 'پنل مشتری' : 'پنل خرید بالا'}» منتشر شد.`
    );
  };

  const handleEditBanner = (b: PortalBannerItem) => {
    setSelectedPortal(b.portalType);
    setTargetScope(b.scope);
    if (b.targetCustomerId) {
      setSelectedCustomerId(b.targetCustomerId);
    }
    setEditingBannerId(b.id);
    setBannerForm({
      badgeText: b.badgeText,
      title: b.title,
      subtitle: b.subtitle,
      ctaText: b.ctaText,
      ctaLink: b.ctaLink,
      theme: b.theme,
      purchaseVolumeThreshold: b.purchaseVolumeThreshold || 0,
      cartDiscountPercent: b.cartDiscountPercent || 0,
      active: b.active,
    });
    setActiveStudioTab('banners');
  };

  const handleDeleteBanner = (id: string) => {
    portalContentService.deleteBanner(id);
    refreshAll();
    if (editingBannerId === id) setEditingBannerId(null);
    showToast('بنر انتخابی حذف شد.');
  };

  const handleToggleBannerActive = (b: PortalBannerItem) => {
    portalContentService.saveBanner({ ...b, active: !b.active });
    refreshAll();
    showToast(`وضعیت نمایش بنر به «${!b.active ? 'فعال' : 'غیرفعال'}» تغییر یافت.`);
  };

  // ============================================================================
  // UI / MENUS / CARDS / PERMISSIONS EDITOR STATE & HANDLERS
  // ============================================================================
  const activeUiConfig = useMemo<PortalUiConfig>(() => {
    if (targetScope === 'individual' && selectedCustomerId) {
      return portalContentService.getResolvedUiConfig(selectedPortal, selectedCustomerId);
    }
    return uiConfigs[selectedPortal];
  }, [uiConfigs, selectedPortal, targetScope, selectedCustomerId]);

  const hasIndividualOverride = useMemo(() => {
    if (targetScope !== 'individual' || !selectedCustomerId) return false;
    const overrides = portalContentService.getCustomerOverrides();
    return overrides.some(
      o => o.portalType === selectedPortal && o.customerId === selectedCustomerId
    );
  }, [selectedPortal, targetScope, selectedCustomerId, uiConfigs]);

  const persistUiConfigChanges = (updated: PortalUiConfig, toastMsg?: string) => {
    if (targetScope === 'individual' && selectedCustomerObj) {
      portalContentService.saveCustomerOverride({
        customerId: selectedCustomerObj.id,
        customerName: selectedCustomerObj.companyName || selectedCustomerObj.fullName,
        portalType: selectedPortal,
        menus: updated.menus,
        cards: updated.cards,
        permissions: updated.permissions,
        customWelcomeNote: updated.welcomeTitle,
        updatedAt: new Date().toLocaleDateString('fa-IR'),
      });
      refreshAll();
      if (toastMsg) {
        showToast(`${toastMsg} (اختصاصی برای ${selectedCustomerObj.companyName || selectedCustomerObj.fullName})`);
      }
    } else {
      portalContentService.savePortalUiConfig(selectedPortal, updated);
      refreshAll();
      if (toastMsg) showToast(toastMsg);
    }
  };

  const handleToggleMenuEnabled = (menuId: string) => {
    const nextMenus = activeUiConfig.menus.map(m =>
      m.id === menuId ? { ...m, enabled: !m.enabled } : m
    );
    persistUiConfigChanges(
      { ...activeUiConfig, menus: nextMenus },
      'وضعیت نمایش منو بروزرسانی شد.'
    );
  };

  const handleUpdateMenuField = (
    menuId: string,
    field: keyof PortalMenuConfigItem,
    value: string | number | boolean
  ) => {
    const nextMenus = activeUiConfig.menus.map(m =>
      m.id === menuId ? { ...m, [field]: value } : m
    );
    persistUiConfigChanges({ ...activeUiConfig, menus: nextMenus });
  };

  const handleMoveMenuOrder = (index: number, direction: 'up' | 'down') => {
    const sorted = [...activeUiConfig.menus].sort((a, b) => a.order - b.order);
    const swapIdx = direction === 'up' ? index - 1 : index + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;
    const tempOrder = sorted[index].order;
    sorted[index] = { ...sorted[index], order: sorted[swapIdx].order };
    sorted[swapIdx] = { ...sorted[swapIdx], order: tempOrder };
    persistUiConfigChanges(
      { ...activeUiConfig, menus: sorted },
      'ترتیب منوهای پنل جابه‌جا شد.'
    );
  };

  const handleUpdateCardConfig = (
    cardId: string,
    field: keyof PortalCardConfigItem,
    value: string | boolean
  ) => {
    const nextCards = activeUiConfig.cards.map(c =>
      c.id === cardId ? { ...c, [field]: value } : c
    );
    persistUiConfigChanges({ ...activeUiConfig, cards: nextCards });
  };

  const handleTogglePermission = (permKey: keyof PortalPermissionFlags) => {
    const nextPerms: PortalPermissionFlags = {
      ...activeUiConfig.permissions,
      [permKey]: !activeUiConfig.permissions[permKey],
    };
    persistUiConfigChanges(
      { ...activeUiConfig, permissions: nextPerms },
      'دسترسی پنل بروزرسانی شد.'
    );
  };

  const handleClearIndividualOverride = () => {
    if (!selectedCustomerObj) return;
    portalContentService.deleteCustomerOverride(selectedCustomerObj.id, selectedPortal);
    refreshAll();
    showToast(
      `تنظیمات اختصاصی «${selectedCustomerObj.companyName || selectedCustomerObj.fullName}» به حالت پیش‌فرض پنل بازگشت.`
    );
  };

  const handleResetPortalDefaults = () => {
    portalContentService.resetUiConfigToDefault(selectedPortal);
    refreshAll();
    showToast('کلیه منوها، کادرها و دسترسی‌های این پنل به حالت استاندارد اولیه بازگردانده شدند.');
  };

  // ============================================================================
  // ANNOUNCEMENTS (COLLECTIVE & INDIVIDUAL) STATE & HANDLERS
  // ============================================================================
  const [annForm, setAnnForm] = useState<{
    title: string;
    body: string;
    type: 'promo' | 'reward' | 'info' | 'urgent';
    highlightValue: string;
    ctaLabel: string;
  }>({
    title: '',
    body: '',
    type: 'promo',
    highlightValue: '۵٪ تخفیف سبد خرید',
    ctaLabel: 'مشاهده و ثبت سفارش',
  });

  const handleSaveAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annForm.title.trim() || !annForm.body.trim()) return;

    const item: PortalAnnouncementItem = {
      id: `ann-${Date.now()}`,
      portalType: selectedPortal,
      scope: targetScope,
      targetCustomerId:
        targetScope === 'individual' ? selectedCustomerObj?.id : undefined,
      targetCustomerName:
        targetScope === 'individual'
          ? selectedCustomerObj?.companyName || selectedCustomerObj?.fullName
          : undefined,
      title: annForm.title.trim(),
      body: annForm.body.trim(),
      type: annForm.type,
      highlightValue: annForm.highlightValue.trim() || undefined,
      ctaLabel: annForm.ctaLabel.trim() || 'مشاهده جزئیات',
      active: true,
      createdAt: new Date().toLocaleDateString('fa-IR'),
    };

    portalContentService.saveAnnouncement(item);
    refreshAll();
    setAnnForm({
      title: '',
      body: '',
      type: 'promo',
      highlightValue: '',
      ctaLabel: 'مشاهده و ثبت سفارش',
    });
    showToast(
      targetScope === 'individual'
        ? `پیام و پیشنهاد اختصاصی برای «${item.targetCustomerName}» ارسال شد.`
        : 'اطلاعیه جمعی برای تمام مشتریان این پنل منتشر شد.'
    );
  };

  const handleDeleteAnnouncement = (id: string) => {
    portalContentService.deleteAnnouncement(id);
    refreshAll();
    showToast('اطلاعیه حذف شد.');
  };

  // ============================================================================
  // CLUB MILESTONE BAR CHART EDITOR
  // ============================================================================
  const handleUpdateMilestoneField = (
    tierId: ClubMilestoneLevel['id'],
    field: keyof ClubMilestoneLevel,
    value: any
  ) => {
    const updated = clubMilestones.map(m =>
      m.id === tierId ? { ...m, [field]: value } : m
    );
    setClubMilestones(updated);
    portalContentService.saveClubMilestones(updated);
  };

  // Theme helper for live preview
  const getBannerThemeClasses = (theme: BannerThemeType) => {
    switch (theme) {
      case 'royal_gold':
        return 'bg-gradient-to-l from-slate-950 via-amber-950 to-slate-900 text-white border-amber-500/40';
      case 'emerald_trust':
        return 'bg-gradient-to-l from-emerald-950 via-teal-900 to-slate-900 text-white border-emerald-500/40';
      case 'midnight_slate':
        return 'bg-gradient-to-l from-slate-900 via-slate-800 to-slate-950 text-white border-slate-700';
      case 'ocean_blue':
        return 'bg-gradient-to-l from-blue-950 via-indigo-950 to-slate-900 text-white border-blue-400/30';
      case 'industrial_orange':
      default:
        return 'bg-gradient-to-l from-[#1E293B] via-[#334155] to-[#0F172A] text-white border-[#E06518]/50';
    }
  };

  const portalBanners = useMemo(
    () =>
      banners.filter(b => {
        if (b.portalType !== selectedPortal) return false;
        if (targetScope === 'individual' && selectedCustomerId) {
          return (
            b.scope === 'collective' ||
            (b.scope === 'individual' && b.targetCustomerId === selectedCustomerId)
          );
        }
        return true;
      }),
    [banners, selectedPortal, targetScope, selectedCustomerId]
  );

  const portalAnnouncements = useMemo(
    () =>
      announcements.filter(a => {
        if (a.portalType !== selectedPortal) return false;
        if (targetScope === 'individual' && selectedCustomerId) {
          return (
            a.scope === 'collective' ||
            (a.scope === 'individual' && a.targetCustomerId === selectedCustomerId)
          );
        }
        return true;
      }),
    [announcements, selectedPortal, targetScope, selectedCustomerId]
  );

  return (
    <div className="space-y-6 text-right" dir="rtl">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 left-5 z-50 max-w-md bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-orange-500/40 flex items-center gap-3 text-xs font-bold">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* =====================================================================
          1. TOP HEADER & PORTAL SELECTOR (پنل مشتری vs پنل خرید بالا)
         ===================================================================== */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 text-[#E06518] border border-orange-200 text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>استودیو جامع تولید محتوا، طراحی بنر و مدیریت UI/UX پنل‌های کاربری</span>
            </div>
            <h2 className="text-xl font-black text-slate-900">
              مدیریت تولید محتوا، بنرها، کادرها، منوها و دسترسی‌های هر دو پنل
            </h2>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              در این بخش می‌توانید هم به صورت <strong>جمعی (برای کل مشتریان یک پنل)</strong> و هم به صورت <strong>تکی (برای یک مشتری منتخب)</strong> بنرهای تخفیف حجم خرید، اطلاعیه‌ها، عنوان کادرها، دکمه‌ها، منوها و دسترسی‌های پنل را به طور زنده ویرایش کنید.
            </p>
          </div>

          {/* Direct Portal Preview Links */}
          <div className="flex items-center gap-2">
            <a
              href="/consumer-dashboard"
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#E06518]" />
              <span>مشاهده زنده پنل مشتری</span>
            </a>
            <a
              href="/account"
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
              <span>مشاهده زنده پنل خرید بالا</span>
            </a>
          </div>
        </div>

        {/* Two Main Portal Cards: 1. پنل مشتری | 2. پنل خرید بالا */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => {
              setSelectedPortal('consumer');
              if (activeStudioTab === 'club_chart') {
                setActiveStudioTab('banners');
              }
            }}
            className={`p-4 rounded-2xl border-2 text-right transition-all cursor-pointer flex items-start justify-between gap-4 ${
              selectedPortal === 'consumer'
                ? 'border-[#E06518] bg-orange-50/50 shadow-sm'
                : 'border-slate-200 bg-slate-50/60 hover:bg-white'
            }`}
          >
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#E06518]" />
                <span className="text-base font-black text-slate-900">
                  بخش اول: پنل مشتری
                </span>
                <span
                  className="px-2 py-0.5 rounded-md bg-slate-200 text-slate-700 font-mono text-[10px] font-bold"
                  dir="ltr"
                >
                  /consumer-dashboard
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                مخصوص کاربرانی که در سایت ثبت‌نام می‌کنند. در ظاهر پنل مشتری هیچ نامی از «خرده یا نقدی» برده نمی‌شود و مشتری تجربه‌ای محترمانه و اختصاصی دارد.
              </p>
            </div>
            <span
              className={`px-3 py-1 rounded-xl text-xs font-black shrink-0 ${
                selectedPortal === 'consumer'
                  ? 'bg-[#E06518] text-white'
                  : 'bg-slate-200 text-slate-600'
              }`}
            >
              {selectedPortal === 'consumer' ? 'در حال ویرایش' : 'انتخاب پنل'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedPortal('high_volume')}
            className={`p-4 rounded-2xl border-2 text-right transition-all cursor-pointer flex items-start justify-between gap-4 ${
              selectedPortal === 'high_volume'
                ? 'border-[#E06518] bg-orange-50/50 shadow-sm'
                : 'border-slate-200 bg-slate-50/60 hover:bg-white'
            }`}
          >
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="text-base font-black text-slate-900">
                  بخش دوم: پنل خرید بالا
                </span>
                <span
                  className="px-2 py-0.5 rounded-md bg-slate-900 text-amber-300 font-mono text-[10px] font-bold"
                  dir="ltr"
                >
                  /account
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                مخصوص مشتریان تعریف‌شده در بخش «مشتریان و CRM» شامل نمودار میله‌ای پیشرفت سطح باشگاه مشتریان، جوایز سطوح و دانلود «اکسل لیست قیمت من».
              </p>
            </div>
            <span
              className={`px-3 py-1 rounded-xl text-xs font-black shrink-0 ${
                selectedPortal === 'high_volume'
                  ? 'bg-[#E06518] text-white'
                  : 'bg-slate-200 text-slate-600'
              }`}
            >
              {selectedPortal === 'high_volume' ? 'در حال ویرایش' : 'انتخاب پنل'}
            </span>
          </button>
        </div>

        {/* ===================================================================
            2. AUDIENCE SCOPE BAR: COLLECTIVE (جمعی) VS INDIVIDUAL (تکی)
           =================================================================== */}
        <div className="p-4 rounded-2xl bg-slate-900 text-white flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs font-bold text-slate-300">
              حالت تولید محتوا و ویرایش دسترسی:
            </span>
            <div className="flex items-center gap-1.5 bg-slate-800 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setTargetScope('collective')}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                  targetScope === 'collective'
                    ? 'bg-[#E06518] text-white shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>تولید محتوای جمعی (تمام مشتریان این پنل)</span>
              </button>
              <button
                type="button"
                onClick={() => setTargetScope('individual')}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                  targetScope === 'individual'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <UserCheck className="w-4 h-4" />
                <span>تولید محتوای تکی (انتخاب یک مشتری خاص)</span>
              </button>
            </div>
          </div>

          {/* Individual Customer Selector */}
          {targetScope === 'individual' && (
            <div className="flex items-center gap-2 flex-wrap w-full lg:w-auto">
              <input
                type="search"
                value={customerSearchQuery}
                onChange={e => setCustomerSearchQuery(e.target.value)}
                placeholder="جستجوی نام یا موبایل مشتری..."
                className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs w-48 focus:outline-none focus:border-amber-400"
              />
              <select
                value={selectedCustomerId}
                onChange={e => setSelectedCustomerId(e.target.value)}
                className="px-3.5 py-2 rounded-xl bg-amber-500/20 border border-amber-400/50 text-amber-200 font-bold text-xs cursor-pointer focus:outline-none"
              >
                {filteredPortalCustomers.length === 0 ? (
                  <option value="">مشتری یافت نشد</option>
                ) : (
                  filteredPortalCustomers.map(c => (
                    <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                      {c.companyName ? `${c.companyName} (${c.fullName})` : c.fullName} —{' '}
                      {c.phone}
                    </option>
                  ))
                )}
              </select>
            </div>
          )}
        </div>

        {/* Studio Sub-Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100">
          {[
            {
              id: 'banners',
              label: '۱. طراحی بنر و تخفیف حجم سبد خرید (جمعی و تکی)',
              icon: Palette,
            },
            {
              id: 'ui_menus_access',
              label: '۲. ویرایش کادرها، منوها، دکمه‌ها و دسترسی‌های پنل',
              icon: Sliders,
            },
            {
              id: 'announcements',
              label: '۳. اطلاعیه‌ها و پیام‌های اختصاصی مشتریان',
              icon: Megaphone,
            },
            ...(selectedPortal === 'high_volume'
              ? [
                  {
                    id: 'club_chart',
                    label: '۴. تنظیمات نمودار میله‌ای و جوایز باشگاه مشتریان',
                    icon: BarChart3,
                  },
                ]
              : []),
          ].map(t => {
            const Icon = t.icon;
            const isActive = activeStudioTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveStudioTab(t.id as any)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                <Icon className="w-4 h-4 text-[#E06518]" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* =====================================================================
          TAB 1: BANNER DESIGNER & VOLUME CART DISCOUNT CAMPAIGNS
         ===================================================================== */}
      {activeStudioTab === 'banners' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Form Column */}
          <form
            onSubmit={handleSaveBanner}
            className="lg:col-span-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                  <Palette className="w-5 h-5 text-[#E06518]" />
                  <span>
                    {editingBannerId ? 'ویرایش بنر انتخابی' : 'طراحی بنر جدید برای'}{' '}
                    {selectedPortal === 'consumer' ? '«پنل مشتری»' : '«پنل خرید بالا»'}
                  </span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {targetScope === 'individual' && selectedCustomerObj
                    ? `این بنر فقط برای مشتری «${selectedCustomerObj.companyName || selectedCustomerObj.fullName}» نمایش داده خواهد شد.`
                    : 'این بنر برای تمام مشتریان این پنل در بالای داشبورد به نمایش در می‌آید.'}
                </p>
              </div>
              {editingBannerId && (
                <button
                  type="button"
                  onClick={() => setEditingBannerId(null)}
                  className="text-xs font-bold text-rose-600 hover:underline cursor-pointer"
                >
                  انصراف از ویرایش
                </button>
              )}
            </div>

            {/* Smart Volume -> Cart Discount Rule Box */}
            <div className="p-4 rounded-2xl bg-orange-50/70 border border-orange-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                  <ShoppingCart className="w-4 h-4 text-[#E06518]" />
                  <span>قانون تشویقی: حجم خرید ← درصد تخفیف روی کل سبد خرید</span>
                </span>
                <button
                  type="button"
                  onClick={handleGenerateVolumeDiscountCopy}
                  className="px-3 py-1.5 rounded-xl bg-[#E06518] hover:bg-[#C95210] text-white text-[11px] font-bold cursor-pointer shadow-xs"
                >
                  تولید خودکار متن بنر از روی اعداد زیر
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    هدف حجم خرید مشتری (تومان)
                  </label>
                  <input
                    type="number"
                    value={bannerForm.purchaseVolumeThreshold}
                    onChange={e =>
                      setBannerForm({
                        ...bannerForm,
                        purchaseVolumeThreshold: Number(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-mono font-bold"
                    placeholder="50000000"
                  />
                  <div className="text-[10px] text-slate-500 mt-1">
                    معادل: {formatPrice(bannerForm.purchaseVolumeThreshold)} تومان
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    درصد تخفیف اضافه به کل سبد خرید (٪)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={bannerForm.cartDiscountPercent}
                      onChange={e =>
                        setBannerForm({
                          ...bannerForm,
                          cartDiscountPercent: Number(e.target.value) || 0,
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-mono font-bold"
                      placeholder="5"
                    />
                    <Percent className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                  <div className="text-[10px] text-emerald-700 font-bold mt-1">
                    {toPersianDigits(bannerForm.cartDiscountPercent)}٪ تخفیف روی کل فاکتور
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  برچسب بالای بنر (Badge)
                </label>
                <input
                  type="text"
                  value={bannerForm.badgeText}
                  onChange={e => setBannerForm({ ...bannerForm, badgeText: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  placeholder="مثلاً: طرح تشویقی سبد خرید"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  پالت رنگ و استایل بصری بنر
                </label>
                <select
                  value={bannerForm.theme}
                  onChange={e =>
                    setBannerForm({ ...bannerForm, theme: e.target.value as BannerThemeType })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-bold cursor-pointer"
                >
                  <option value="industrial_orange">نارنجی صنعتی و سرمه‌ای (Industrial Orange)</option>
                  <option value="royal_gold">طلایی و مشکی رویال (Royal Gold)</option>
                  <option value="emerald_trust">سبز زمردی اعتماد (Emerald Trust)</option>
                  <option value="ocean_blue">آبی لاجوردی مدرن (Ocean Blue)</option>
                  <option value="midnight_slate">سرمه‌ای تیره مینیمال (Midnight Slate)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                عنوان اصلی بنر (تیتر درشت)
              </label>
              <input
                type="text"
                required
                value={bannerForm.title}
                onChange={e => setBannerForm({ ...bannerForm, title: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold"
                placeholder="با رسیدن به این حجم خرید، این درصد تخفیف به کل سبد خرید شما اضافه می‌شود"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                توضیحات تکمیلی زیر عنوان
              </label>
              <textarea
                rows={2}
                value={bannerForm.subtitle}
                onChange={e => setBannerForm({ ...bannerForm, subtitle: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs"
                placeholder="توضیحات شرایط اعمال تخفیف یا مزایای این طرح..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  متن دکمه اقدام روی بنر
                </label>
                <input
                  type="text"
                  value={bannerForm.ctaText}
                  onChange={e => setBannerForm({ ...bannerForm, ctaText: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  مقصد کلیک دکمه بنر در پنل
                </label>
                <select
                  value={bannerForm.ctaLink}
                  onChange={e => setBannerForm({ ...bannerForm, ctaLink: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-bold cursor-pointer"
                >
                  <option value="catalog">ورود به بخش ثبت سفارش و کاتالوگ کالاها</option>
                  <option value="orders">ورود به بخش سفارشات و اکسل لیست قیمت من</option>
                  {selectedPortal === 'high_volume' && (
                    <option value="club">ورود به صفحه جوایز و سطوح باشگاه مشتریان</option>
                  )}
                  <option value="support">ورود به بخش پشتیبانی و تیکت</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-[#E06518] hover:bg-[#C95210] text-white font-black text-xs flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>
                {editingBannerId
                  ? 'ذخیره تغییرات بنر'
                  : targetScope === 'individual'
                  ? `ثبت و نمایش بنر اختصاصی برای ${selectedCustomerObj?.companyName || selectedCustomerObj?.fullName || 'مشتری'}`
                  : `ثبت و انتشار بنر جمعی در ${selectedPortal === 'consumer' ? 'پنل مشتری' : 'پنل خرید بالا'}`}
              </span>
            </button>
          </form>

          {/* Right Column: Live Banner Preview & Existing Banners List */}
          <div className="lg:col-span-6 space-y-5">
            {/* Live Preview Box */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-[#E06518]" />
                  <span>پیش‌نمایش زنده جایگاه بنر در بالای داشبورد</span>
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
                  {targetScope === 'individual'
                    ? `اختصاصی: ${selectedCustomerObj?.companyName || selectedCustomerObj?.fullName || ''}`
                    : 'عمومی (همه مشتریان پنل)'}
                </span>
              </div>

              <div
                className={`p-6 rounded-3xl border shadow-lg relative overflow-hidden ${getBannerThemeClasses(
                  bannerForm.theme
                )}`}
              >
                <div className="relative z-10 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-white/15 backdrop-blur-xs text-amber-300 text-[11px] font-black border border-white/15">
                      {bannerForm.badgeText || 'پیشنهاد ویژه'}
                    </span>
                    {bannerForm.purchaseVolumeThreshold > 0 &&
                      bannerForm.cartDiscountPercent > 0 && (
                        <span className="px-3 py-1 rounded-full bg-[#E06518] text-white text-[11px] font-black">
                          خرید بالای{' '}
                          {toPersianDigits(
                            Math.round(bannerForm.purchaseVolumeThreshold / 1000000)
                          )}{' '}
                          میلیون = {toPersianDigits(bannerForm.cartDiscountPercent)}٪ تخفیف کل سبد
                        </span>
                      )}
                  </div>
                  <h4 className="text-base sm:text-lg font-black leading-snug">
                    {bannerForm.title}
                  </h4>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    {bannerForm.subtitle}
                  </p>
                  <div className="pt-1">
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-slate-900 font-black text-xs shadow-sm">
                      <span>{bannerForm.ctaText}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Active & Saved Banners List */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
              <h4 className="font-black text-sm text-slate-900">
                بنرهای ثبت‌شده برای{' '}
                {selectedPortal === 'consumer' ? 'پنل مشتری' : 'پنل خرید بالا'} (
                {toPersianDigits(portalBanners.length)})
              </h4>

              {portalBanners.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  هنوز بنری برای این بخش ثبت نشده است.
                </div>
              ) : (
                <div className="space-y-3">
                  {portalBanners.map(b => (
                    <div
                      key={b.id}
                      className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 flex flex-wrap items-center justify-between gap-3"
                    >
                      <div className="space-y-1 max-w-md">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-black ${
                              b.scope === 'individual'
                                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                : 'bg-blue-100 text-blue-900'
                            }`}
                          >
                            {b.scope === 'individual'
                              ? `تکی: ${b.targetCustomerName || 'مشتری خاص'}`
                              : 'جمعی (کل پنل)'}
                          </span>
                          <span className="text-[11px] font-bold text-[#E06518]">
                            {b.badgeText}
                          </span>
                          {!b.active && (
                            <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-700 text-[10px] font-bold">
                              غیرفعال
                            </span>
                          )}
                        </div>
                        <div className="text-xs font-black text-slate-900">{b.title}</div>
                        <div className="text-[11px] text-slate-500 line-clamp-1">
                          {b.subtitle}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleToggleBannerActive(b)}
                          className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 cursor-pointer"
                          title={b.active ? 'مخفی کردن بنر' : 'فعال کردن بنر'}
                        >
                          {b.active ? (
                            <Eye className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <EyeOff className="w-4 h-4 text-slate-400" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEditBanner(b)}
                          className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-orange-50 text-[#E06518] cursor-pointer"
                          title="ویرایش بنر"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteBanner(b.id)}
                          className="p-2 rounded-xl border border-rose-200 bg-white hover:bg-rose-50 text-rose-600 cursor-pointer"
                          title="حذف بنر"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 2: EDIT MENUS, CARDS, BUTTONS & PERMISSIONS FOR BOTH PORTALS
         ===================================================================== */}
      {activeStudioTab === 'ui_menus_access' && (
        <div className="space-y-6">
          {/* Header Banner explaining Collective vs Individual UI Override */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                <LayoutTemplate className="w-5 h-5 text-[#E06518]" />
                <span>
                  کنترل کامل منوها، کادرها، دکمه‌ها و دسترسی‌های{' '}
                  {selectedPortal === 'consumer' ? '«پنل مشتری»' : '«پنل خرید بالا»'}
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {targetScope === 'individual' && selectedCustomerObj
                  ? `شما در حال ویرایش ظاهر و دسترسی‌های اختصاصی برای «${selectedCustomerObj.companyName || selectedCustomerObj.fullName}» هستید.`
                  : 'هر تغییری در این بخش اعمال کنید، بلافاصله روی رابط کاربری و دسترسی تمام مشتریان این پنل اعمال می‌شود.'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {targetScope === 'individual' && hasIndividualOverride && (
                <button
                  type="button"
                  onClick={handleClearIndividualOverride}
                  className="px-3.5 py-2 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>حذف تنظیمات تکی این مشتری (بازگشت به عمومی)</span>
                </button>
              )}
              {targetScope === 'collective' && (
                <button
                  type="button"
                  onClick={handleResetPortalDefaults}
                  className="px-3.5 py-2 rounded-xl border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>بازنشانی پیش‌فرض‌های پنل</span>
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Column 1: Menus & Navigation Tabs Editor */}
            <div className="lg:col-span-6 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h4 className="font-black text-sm text-slate-900 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#E06518]" />
                  <span>۱. مدیریت منوهای پنل (تغییر نام، ترتیب و فعال/غیرفعال‌سازی)</span>
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  می‌توانید هر منو را برای کل پنل یا برای یک مشتری خاص مخفی کنید یا عنوان آن را تغییر دهید.
                </p>
              </div>

              <div className="space-y-3">
                {[...activeUiConfig.menus]
                  .sort((a, b) => a.order - b.order)
                  .map((menu, idx, arr) => (
                    <div
                      key={menu.id}
                      className={`p-3.5 rounded-2xl border transition-all space-y-2.5 ${
                        menu.enabled
                          ? 'border-slate-200 bg-slate-50/60'
                          : 'border-rose-200 bg-rose-50/40 opacity-75'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-slate-900 text-white font-mono text-xs font-black flex items-center justify-center">
                            {toPersianDigits(idx + 1)}
                          </span>
                          <span className="font-bold text-xs text-slate-800">
                            کلید منو: <code className="font-mono">{menu.id}</code>
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => handleMoveMenuOrder(idx, 'up')}
                            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
                            title="انتقال به بالا"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === arr.length - 1}
                            onClick={() => handleMoveMenuOrder(idx, 'down')}
                            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
                            title="انتقال به پایین"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleMenuEnabled(menu.id)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer ${
                              menu.enabled
                                ? 'bg-emerald-100 text-emerald-900'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {menu.enabled ? (
                              <>
                                <Unlock className="w-3 h-3" />
                                <span>فعال</span>
                              </>
                            ) : (
                              <>
                                <Lock className="w-3 h-3" />
                                <span>مخفی</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-1">
                            عنوان نمایشی منو برای مشتری
                          </label>
                          <input
                            type="text"
                            value={menu.label}
                            onChange={e =>
                              handleUpdateMenuField(menu.id, 'label', e.target.value)
                            }
                            className="w-full px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-xs font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-1">
                            برچسب کنار منو (اختیاری)
                          </label>
                          <input
                            type="text"
                            value={menu.badgeText || ''}
                            onChange={e =>
                              handleUpdateMenuField(menu.id, 'badgeText', e.target.value)
                            }
                            placeholder="مثلاً: جدید یا ویژه"
                            className="w-full px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Column 2: Permissions & Access Control */}
            <div className="lg:col-span-6 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h4 className="font-black text-sm text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#E06518]" />
                  <span>۲. قوانین و دسترسی‌های عملکردی پنل</span>
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  امکانات، دکمه‌های دانلود و بخش‌های تعاملی پنل را برای کل مشتریان یا مشتری انتخاب‌شده تنظیم کنید.
                </p>
              </div>

              <div className="space-y-2.5">
                {[
                  {
                    key: 'allowExcelPriceListDownload' as keyof PortalPermissionFlags,
                    title: 'دسترسی دانلود «اکسل لیست قیمت من» در بخش سفارشات',
                    desc: 'مشتری بتواند در بخش سفارشات، فایل اکسل لیست قیمت خود را دانلود کند.',
                  },
                  {
                    key: 'allowQuickOrder' as keyof PortalPermissionFlags,
                    title: 'دسترسی ثبت سفارش و افزودن مستقیم کالا به سبد خرید',
                    desc: 'فعال بودن کادر جستجو و دکمه‌های افزودن به سبد خرید در داخل پنل.',
                  },
                  {
                    key: 'allowCategoryFilter' as keyof PortalPermissionFlags,
                    title: 'نمایش نوار فیلتر دسته‌بندی کالاها در پنل',
                    desc: 'امکان تفکیک کالاها بر اساس دسته‌بندی (شیرآلات، اتصالات و...) در پنل کاربری.',
                  },
                  {
                    key: 'showHeroBannerSlot' as keyof PortalPermissionFlags,
                    title: 'نمایش جایگاه بنر تبلیغاتی و کمپین تخفیف در بالای داشبورد',
                    desc: 'نمایش بنرهای جمعی و اختصاصی در بالاترین نقطه ورود به پنل.',
                  },
                  {
                    key: 'allowSupportTickets' as keyof PortalPermissionFlags,
                    title: 'دسترسی ارسال تیکت و پیام مستقیم به واحد فروش',
                    desc: 'امکان ثبت درخواست پشتیبانی و پیگیری گفتگوها.',
                  },
                  {
                    key: 'allowAddressManagement' as keyof PortalPermissionFlags,
                    title: 'امکان ویرایش پروفایل و مدیریت آدرس‌های تحویل سفارش',
                    desc: 'مشتری بتواند آدرس کارگاه، انبار یا پروژه جدید ثبت کند.',
                  },
                  ...(selectedPortal === 'high_volume'
                    ? [
                        {
                          key: 'showClubMilestoneBarChart' as keyof PortalPermissionFlags,
                          title: 'نمایش نمودار میله‌ای پیشرفت سطح باشگاه مشتریان',
                          desc: 'نمایش نمودار بصری حجم خرید و فاصله تا سطح بعدی در پنل خرید بالا.',
                        },
                        {
                          key: 'allowClubRewardsView' as keyof PortalPermissionFlags,
                          title: 'دکمه ورود به صفحه جوایز و مزایای سطوح باشگاه مشتریان',
                          desc: 'مشتری بتواند جوایز و اتفاق‌های تعریف‌شده برای هر سطح را مشاهده کند.',
                        },
                        {
                          key: 'showCreditLimitPanel' as keyof PortalPermissionFlags,
                          title: 'نمایش کادر اعتبار خرید و وضعیت تسویه حساب',
                          desc: 'نمایش سقف اعتبار، اعتبار استفاده‌شده و مانده قابل خرید.',
                        },
                      ]
                    : []),
                ].map(item => {
                  const isAllowed = Boolean(activeUiConfig.permissions[item.key]);
                  return (
                    <div
                      key={item.key}
                      onClick={() => handleTogglePermission(item.key)}
                      className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                        isAllowed
                          ? 'border-emerald-200 bg-emerald-50/40 hover:bg-emerald-50'
                          : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="text-xs font-black text-slate-900">{item.title}</div>
                        <div className="text-[11px] text-slate-500">{item.desc}</div>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-xl text-[11px] font-black shrink-0 flex items-center gap-1 ${
                          isAllowed
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {isAllowed ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>فعال</span>
                          </>
                        ) : (
                          <span>غیرفعال</span>
                        )}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Row 2: Texts, Headings, Buttons & Cards Customizer */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h4 className="font-black text-sm text-slate-900 flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-[#E06518]" />
                <span>۳. ویرایش متن کادرها، تیترها و دکمه‌های داخل پنل</span>
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                عنوان خوش‌آمدگویی، متن دکمه «اکسل لیست قیمت من» و تمام کادرهای صفحه را مطابق سلیقه خود تغییر دهید.
              </p>
            </div>

            {/* Global Portal Header & Button Labels */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  تیتر خوش‌آمدگویی بالای پنل
                </label>
                <input
                  type="text"
                  value={activeUiConfig.welcomeTitle}
                  onChange={e =>
                    persistUiConfigChanges({
                      ...activeUiConfig,
                      welcomeTitle: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  زیرنویس راهنمای بالای پنل
                </label>
                <input
                  type="text"
                  value={activeUiConfig.welcomeSubtitle}
                  onChange={e =>
                    persistUiConfigChanges({
                      ...activeUiConfig,
                      welcomeSubtitle: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  متن دکمه دانلود اکسل در بخش سفارشات
                </label>
                <input
                  type="text"
                  value={activeUiConfig.priceListDownloadButtonText}
                  onChange={e =>
                    persistUiConfigChanges({
                      ...activeUiConfig,
                      priceListDownloadButtonText: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-orange-300 bg-orange-50/40 text-xs font-black text-[#E06518]"
                />
              </div>
            </div>

            {/* Individual Cards / Sections Configuration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {activeUiConfig.cards.map(card => (
                <div
                  key={card.id}
                  className={`p-4 rounded-2xl border space-y-3 ${
                    card.visible
                      ? 'border-slate-200 bg-slate-50/60'
                      : 'border-rose-200 bg-rose-50/30 opacity-75'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-800">
                      کادر: {card.title}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        handleUpdateCardConfig(card.id, 'visible', !card.visible)
                      }
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer ${
                        card.visible
                          ? 'bg-emerald-100 text-emerald-900'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {card.visible ? 'قابل مشاهده در پنل' : 'مخفی در پنل'}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">
                        عنوان کادر
                      </label>
                      <input
                        type="text"
                        value={card.title}
                        onChange={e =>
                          handleUpdateCardConfig(card.id, 'title', e.target.value)
                        }
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">
                        متن دکمه داخل کادر
                      </label>
                      <input
                        type="text"
                        value={card.PrimaryButtonLabel}
                        onChange={e =>
                          handleUpdateCardConfig(
                            card.id,
                            'PrimaryButtonLabel',
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-xs font-bold text-[#E06518]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">
                      توضیح زیر عنوان کادر
                    </label>
                    <input
                      type="text"
                      value={card.subtitle}
                      onChange={e =>
                        handleUpdateCardConfig(card.id, 'subtitle', e.target.value)
                      }
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-xs"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 3: ANNOUNCEMENTS & SPECIAL OFFERS (COLLECTIVE & INDIVIDUAL)
         ===================================================================== */}
      {activeStudioTab === 'announcements' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <form
            onSubmit={handleSaveAnnouncement}
            className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4"
          >
            <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
              <Bell className="w-5 h-5 text-[#E06518]" />
              <span>
                ارسال اطلاعیه یا پیشنهاد{' '}
                {targetScope === 'individual' ? 'تکی (اختصاصی)' : 'جمعی (عمومی)'}
              </span>
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                عنوان اطلاعیه یا پیشنهاد
              </label>
              <input
                type="text"
                required
                value={annForm.title}
                onChange={e => setAnnForm({ ...annForm, title: e.target.value })}
                placeholder="مثلاً: تخفیف ویژه خرید شیرآلات برنجی تا پایان هفته"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                متن کامل پیام
              </label>
              <textarea
                rows={3}
                required
                value={annForm.body}
                onChange={e => setAnnForm({ ...annForm, body: e.target.value })}
                placeholder="متن پیام برای نمایش در داشبورد مشتری..."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  مقدار برجسته (تخفیف / هدیه)
                </label>
                <input
                  type="text"
                  value={annForm.highlightValue}
                  onChange={e =>
                    setAnnForm({ ...annForm, highlightValue: e.target.value })
                  }
                  placeholder="مثلاً: ۷٪ تخفیف مازاد سبد"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  متن دکمه اقدام
                </label>
                <input
                  type="text"
                  value={annForm.ctaLabel}
                  onChange={e => setAnnForm({ ...annForm, ctaLabel: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-[#E06518] hover:bg-[#C95210] text-white font-black text-xs cursor-pointer"
            >
              ثبت و نمایش در پنل
            </button>
          </form>

          <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <h4 className="font-black text-sm text-slate-900">
              اطلاعیه‌های فعال در{' '}
              {selectedPortal === 'consumer' ? 'پنل مشتری' : 'پنل خرید بالا'} (
              {toPersianDigits(portalAnnouncements.length)})
            </h4>

            {portalAnnouncements.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                اطلاعیه‌ای برای این بخش ثبت نشده است.
              </div>
            ) : (
              <div className="space-y-3">
                {portalAnnouncements.map(a => (
                  <div
                    key={a.id}
                    className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 flex items-start justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`px-2.5 py-0.5 rounded-md text-[10px] font-black ${
                            a.scope === 'individual'
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : 'bg-emerald-100 text-emerald-900'
                          }`}
                        >
                          {a.scope === 'individual'
                            ? `اختصاصی: ${a.targetCustomerName}`
                            : 'جمعی (همه مشتریان پنل)'}
                        </span>
                        {a.highlightValue && (
                          <span className="px-2.5 py-0.5 rounded-md bg-orange-100 text-[#E06518] text-[10px] font-black">
                            {a.highlightValue}
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-black text-slate-900">{a.title}</div>
                      <p className="text-xs text-slate-600 leading-relaxed">{a.body}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteAnnouncement(a.id)}
                      className="p-2 rounded-xl border border-rose-200 bg-white hover:bg-rose-50 text-rose-600 cursor-pointer shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 4: CLUB MILESTONE BAR CHART & REWARDS CONFIG (/account)
         ===================================================================== */}
      {activeStudioTab === 'club_chart' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#E06518]" />
              <span>
                تنظیمات نمودار میله‌ای پیشرفت حجم خرید و جوایز باشگاه مشتریان (پنل خرید بالا)
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              مشتریان نمی‌توانند سطح خود را به صورت دستی انتخاب کنند؛ بلکه در نمودار میله‌ای می‌بینند با رسیدن به چه حجم خریدی به کدام سطح می‌رسند و چه جوایزی دریافت می‌کنند.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {clubMilestones.map(m => (
              <div
                key={m.id}
                className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-xl bg-slate-900 text-white text-xs font-black">
                    {m.title} ({m.shortLabel})
                  </span>
                  <span className="text-xs font-bold text-[#E06518]">
                    حجم هدف: {formatPrice(m.minPurchaseVolume)} تومان
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">
                      حجم خرید لازم برای رسیدن به این سطح (تومان)
                    </label>
                    <input
                      type="number"
                      value={m.minPurchaseVolume}
                      onChange={e =>
                        handleUpdateMilestoneField(
                          m.id,
                          'minPurchaseVolume',
                          Number(e.target.value) || 0
                        )
                      }
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-xs font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">
                      تخفیف پایه این سطح (٪)
                    </label>
                    <input
                      type="number"
                      value={m.discountPercent}
                      onChange={e =>
                        handleUpdateMilestoneField(
                          m.id,
                          'discountPercent',
                          Number(e.target.value) || 0
                        )
                      }
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-xs font-mono font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-1">
                    توضیح و اتفاق‌های این سطح برای نمایش در صفحه جوایز مشتری
                  </label>
                  <input
                    type="text"
                    value={m.description}
                    onChange={e =>
                      handleUpdateMilestoneField(m.id, 'description', e.target.value)
                    }
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-1">
                    جوایز و مزایای این سطح (هر خط با ویرگول جدا شود)
                  </label>
                  <textarea
                    rows={2}
                    value={m.rewardsList.join(' ، ')}
                    onChange={e =>
                      handleUpdateMilestoneField(
                        m.id,
                        'rewardsList',
                        e.target.value
                          .split(/،|,/)
                          .map(s => s.trim())
                          .filter(Boolean)
                      )
                    }
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-xs"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
