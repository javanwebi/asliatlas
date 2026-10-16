import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useClubPoints } from '../context/ClubPointsContext';
import { generateMockProducts } from '../data/mockGenerator';
import { toPersianDigits, formatPrice } from '../utils/formatters';
import {
  ShoppingBag,
  Package,
  Truck,
  Gift,
  Heart,
  MapPin,
  MessageSquare,
  Sparkles,
  CreditCard,
  ArrowRight,
  ChevronLeft,
  CheckCircle2,
  Clock,
  RefreshCw,
  Plus,
  Trash2,
  Send,
  LogOut,
  Building,
  ShieldCheck,
  Search,
  ExternalLink,
  Store,
  Tag,
  KeyRound,
  User,
  Sliders,
  DollarSign
} from 'lucide-react';
import { Order, Address } from '../types';

export const ConsumerDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, logout, getUserAddresses, addAddress, deleteAddress } = useAuth();
  const { cart, addToCart, itemCount } = useCart();
  const { wishlist, toggleWishlist } = useWishlist();
  const { points } = useClubPoints();

  // Strict Access Control: CRM & B2B stored customers ONLY have access to B2B Factory Credit Portal (/account)
  React.useEffect(() => {
    if (currentUser) {
      const isCrmOrB2b = currentUser.approvedB2B ||
                         currentUser.role === 'wholesale' ||
                         currentUser.role === 'dealer' ||
                         currentUser.role === 'admin' ||
                         Boolean(currentUser.creditLimit && currentUser.creditLimit > 0);
      if (isCrmOrB2b) {
        navigate('/account', { replace: true });
      }
    }
  }, [currentUser, navigate]);

  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'wishlist' | 'club' | 'addresses' | 'support' | 'b2bRequest'>('dashboard');

  // Address Modal
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [newAddress, setNewAddress] = useState({
    title: 'منزل / دفتر',
    recipientName: currentUser?.fullName || '',
    recipientPhone: currentUser?.phone || '',
    province: 'یزد',
    city: 'یزد',
    fullAddress: '',
    postalCode: '',
  });

  // Support Ticket Form
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMsg, setTicketMsg] = useState('');
  const [ticketSentFeedback, setTicketSentFeedback] = useState(false);

  // B2B Upgrade Request
  const [b2bCompanyName, setB2bCompanyName] = useState(currentUser?.companyName || '');
  const [b2bNotes, setB2bNotes] = useState('');
  const [b2bSubmitted, setB2bSubmitted] = useState(false);

  // Reorder feedback
  const [reorderFeedback, setReorderFeedback] = useState<string | null>(null);

  // Sample Retail Orders
  const [orders] = useState<Order[]>([
    {
      id: 'ORD-1403-9081',
      orderNumber: 'ORD-1403-9081',
      customerId: currentUser?.id || 'cust-9081',
      role: 'retail',
      customerName: currentUser?.fullName || 'خریدار گرامی',
      recipientPhone: currentUser?.phone || '09131234567',
      totalAmount: 1450000,
      discountAmount: 0,
      finalAmount: 1450000,
      paymentMethod: 'online',
      status: 'shipped',
      createdAt: '۱۴۰۳/۰۶/۲۰',
      trackingCode: 'TRK-98124578',
      items: [
        {
          productCode: 'FORZA-C85',
          productName: 'تسمه پروانه‌ای استاندارد FORZA ایتالیا تیپ C طول ۲۱۵۰',
          quantity: 2,
          unitPrice: 680000,
          totalPrice: 1360000,
          brand: 'فورزا (FORZA)',
          unit: 'حلقه',
          priceLayerUsed: 'retail',
          image: '',
        },
      ],
      shippingAddress: 'یزد، خیابان کاشانی، جنب بانک ملی، پلاک ۴۲',
    },
    {
      id: 'ORD-1403-8712',
      orderNumber: 'ORD-1403-8712',
      customerId: currentUser?.id || 'cust-8712',
      role: 'retail',
      customerName: currentUser?.fullName || 'خریدار گرامی',
      recipientPhone: currentUser?.phone || '09131234567',
      totalAmount: 2890000,
      discountAmount: 0,
      finalAmount: 2890000,
      paymentMethod: 'online',
      status: 'delivered',
      createdAt: '۱۴۰۳/۰۵/۱۴',
      trackingCode: 'TRK-77123904',
      items: [
        {
          productCode: 'SWR-230',
          productName: 'تسمه تایمینگ دنده‌ای تقویت‌شده SWR آلمان HTD-8M',
          quantity: 1,
          unitPrice: 1250000,
          totalPrice: 1250000,
          brand: 'اس دبلیو آر (SWR)',
          unit: 'حلقه',
          priceLayerUsed: 'retail',
          image: '',
        },
      ],
      shippingAddress: 'یزد، بلوار جمهوری، مجتمع اطلس',
    },
  ]);

  const addresses = getUserAddresses();
  const allProducts = useMemo(() => generateMockProducts(), []);

  // Filter wishlist items
  const wishlistProducts = useMemo(() => {
    return wishlist
      .map(code => allProducts.find(p => p.code.toLowerCase() === code.toLowerCase()))
      .filter(Boolean) as typeof allProducts;
  }, [allProducts, wishlist]);

  const handleAddAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddress.fullAddress.trim()) return;
    addAddress({
      title: newAddress.title,
      recipientName: newAddress.recipientName,
      recipientPhone: newAddress.recipientPhone,
      province: newAddress.province,
      city: newAddress.city,
      fullAddress: newAddress.fullAddress,
      postalCode: newAddress.postalCode,
      isDefault: addresses.length === 0,
    });
    setIsAddressModalOpen(false);
    setNewAddress({
      title: 'منزل / دفتر',
      recipientName: currentUser?.fullName || '',
      recipientPhone: currentUser?.phone || '',
      province: 'یزد',
      city: 'یزد',
      fullAddress: '',
      postalCode: '',
    });
  };

  const handleSendSupportTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketMsg.trim()) return;
    setTicketSentFeedback(true);
    setTimeout(() => {
      setTicketSentFeedback(false);
      setTicketSubject('');
      setTicketMsg('');
    }, 4000);
  };

  const handleB2bRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setB2bSubmitted(true);
  };

  const handleReorder = (order: Order) => {
    order.items.forEach(item => {
      const prod = allProducts.find(p => p.code === item.productCode);
      if (prod) {
        addToCart(prod, item.quantity);
      }
    });
    setReorderFeedback(`اقلام سفارش شماره ${order.orderNumber} به سبد خرید شما اضافه گردید.`);
    setTimeout(() => setReorderFeedback(null), 3500);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#F8FAFD] via-[#F2F5F9] to-[#ECF1F7] text-slate-800 pb-24 text-right select-none" dir="rtl">
      
      {/* Dynamic Glass Top Bar Header */}
      <header className="sticky top-0 z-40 w-full bg-white/85 backdrop-blur-2xl border-b border-slate-200/80 shadow-xs px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#E06518] to-amber-500 text-white flex items-center justify-center font-black text-base shadow-md shadow-orange-500/20">
            {currentUser?.fullName?.[0] || 'م'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-black text-sm sm:text-base text-slate-900 tracking-tight">
                {currentUser?.fullName || 'خریدار گرامی'}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                حساب خریدار آنلاین
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              شماره همراه: <span className="font-mono">{currentUser?.phone || currentUser?.mobile || 'ثبت شده'}</span>
            </p>
          </div>
        </div>

        {/* Quick Actions Header */}
        <div className="flex items-center gap-2">
          <Link
            to="/cart"
            className="px-3.5 py-2 rounded-xl bg-orange-50 border border-orange-200/80 hover:bg-orange-100 text-[#E06518] font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden sm:inline">سبد خرید</span>
            {itemCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-[#E06518] text-white text-[10px] font-black flex items-center justify-center">
                {toPersianDigits(itemCount)}
              </span>
            )}
          </Link>

          <button
            type="button"
            onClick={logout}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 transition-colors cursor-pointer"
            title="خروج از حساب"
          >
            <LogOut className="w-4.5 h-4.5" />
          </button>
        </div>
      </header>

      {/* Main Container Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Reorder feedback toast */}
        {reorderFeedback && (
          <div className="p-4 bg-emerald-600 text-white rounded-2xl shadow-lg flex items-center justify-between text-xs font-bold animate-fadeIn">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-white" />
              <span>{reorderFeedback}</span>
            </div>
            <Link to="/cart" className="underline font-black text-amber-200 hover:text-white">
              مشاهده سبد و پرداخت
            </Link>
          </div>
        )}

        {/* Top Summary Cards Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div
            onClick={() => setActiveTab('orders')}
            className="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:border-[#E06518] cursor-pointer transition-all space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <span className="w-9 h-9 rounded-2xl bg-orange-100 text-[#E06518] flex items-center justify-center font-bold">
                <Package className="w-5 h-5" />
              </span>
              <span className="text-[10px] font-bold text-slate-400">سفارش‌ها</span>
            </div>
            <div>
              <div className="text-xl font-black text-slate-900">
                {toPersianDigits(orders.length)} سفارش
              </div>
              <div className="text-[11px] text-emerald-600 font-bold mt-0.5 flex items-center gap-1">
                <Truck className="w-3 h-3" />
                <span>۱ مرسوله در حال ارسال</span>
              </div>
            </div>
          </div>

          <div
            onClick={() => setActiveTab('club')}
            className="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:border-amber-400 cursor-pointer transition-all space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <span className="w-9 h-9 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
                <Gift className="w-5 h-5" />
              </span>
              <span className="text-[10px] font-bold text-slate-400">امتیازات باشگاه</span>
            </div>
            <div>
              <div className="text-xl font-black text-slate-900 font-mono">
                {toPersianDigits(points)} امتیاز
              </div>
              <div className="text-[11px] text-amber-700 font-bold mt-0.5">
                تخفیف قابل استفاده در خرید بعدی
              </div>
            </div>
          </div>

          <div
            onClick={() => setActiveTab('wishlist')}
            className="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:border-rose-400 cursor-pointer transition-all space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <span className="w-9 h-9 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
                <Heart className="w-5 h-5" />
              </span>
              <span className="text-[10px] font-bold text-slate-400">علاقه‌مندی‌ها</span>
            </div>
            <div>
              <div className="text-xl font-black text-slate-900">
                {toPersianDigits(wishlist.length)} کالا
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                ذخیره‌شده برای خرید بعدی
              </div>
            </div>
          </div>

          <div
            onClick={() => setActiveTab('addresses')}
            className="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:border-sky-400 cursor-pointer transition-all space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <span className="w-9 h-9 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center font-bold">
                <MapPin className="w-5 h-5" />
              </span>
              <span className="text-[10px] font-bold text-slate-400">نشانی‌ها</span>
            </div>
            <div>
              <div className="text-xl font-black text-slate-900">
                {toPersianDigits(addresses.length)} آدرس
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                آدرس تحویل کالا و بارنامه
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="bg-white p-2 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-1.5 overflow-x-auto text-xs font-bold scrollbar-none">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`py-2.5 px-4 rounded-xl transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
              activeTab === 'dashboard'
                ? 'bg-[#E06518] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Store className="w-4 h-4" />
            <span>میز کار خریدار</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`py-2.5 px-4 rounded-xl transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
              activeTab === 'orders'
                ? 'bg-[#E06518] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>سفارش‌ها و پیگیری مرسوله</span>
          </button>

          <button
            onClick={() => setActiveTab('wishlist')}
            className={`py-2.5 px-4 rounded-xl transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
              activeTab === 'wishlist'
                ? 'bg-[#E06518] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>علاقه‌مندی‌ها ({toPersianDigits(wishlist.length)})</span>
          </button>

          <button
            onClick={() => setActiveTab('club')}
            className={`py-2.5 px-4 rounded-xl transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
              activeTab === 'club'
                ? 'bg-[#E06518] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Gift className="w-4 h-4" />
            <span>باشگاه و تخفیف‌ها</span>
          </button>

          <button
            onClick={() => setActiveTab('addresses')}
            className={`py-2.5 px-4 rounded-xl transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
              activeTab === 'addresses'
                ? 'bg-[#E06518] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>آدرس‌های ارسال</span>
          </button>

          <button
            onClick={() => setActiveTab('support')}
            className={`py-2.5 px-4 rounded-xl transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
              activeTab === 'support'
                ? 'bg-[#E06518] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>پشتیبانی و تیکت</span>
          </button>

          <button
            onClick={() => setActiveTab('b2bRequest')}
            className={`py-2.5 px-4 rounded-xl transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
              activeTab === 'b2bRequest'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-700 bg-orange-50/80 hover:bg-orange-100 border border-orange-200'
            }`}
          >
            <Building className="w-4 h-4 text-[#E06518]" />
            <span>درخواست اعتبار B2B</span>
          </button>
        </div>

        {/* TAB 1: MAIN DASHBOARD HOME */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            
            {/* Quick Banner to Catalog */}
            <div className="bg-gradient-to-r from-[#12161f] via-[#1b2230] to-[#12161f] text-white p-6 rounded-3xl shadow-lg relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2 max-w-xl text-center md:text-right">
                <span className="px-3 py-1 bg-white/10 text-[#E06518] border border-white/10 rounded-full text-xs font-black inline-block">
                  تضمین اصالت کالا و تحویل فوری
                </span>
                <h2 className="text-lg sm:text-2xl font-black tracking-tight text-white">
                  خرید آنلاین قطعات و تسمه‌های صنعتی با درگاه مستقیم بانکی
                </h2>
                <p className="text-xs text-slate-300 leading-relaxed">
                  ارسال سریع به تمام نقاط کشور، پشتیبانی مهندسی و ضمانت ۳۰ روزه کیفیت کالا.
                </p>
              </div>

              <Link
                to="/products"
                className="py-3 px-6 rounded-2xl bg-[#E06518] hover:bg-[#C95210] active:scale-95 text-white font-black text-xs sm:text-sm shadow-lg shadow-orange-950/40 transition-all flex items-center gap-2 cursor-pointer shrink-0"
              >
                <ShoppingBag className="w-4.5 h-4.5" />
                <span>ورود به فروشگاه و کاتالوگ محصولات</span>
              </Link>
            </div>

            {/* Active Recent Order Card */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-[#E06518]" />
                  <h3 className="font-black text-sm text-slate-900">
                    آخرین سفارش ثبت‌شده: {orders[0].orderNumber}
                  </h3>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-sky-100 text-sky-800 border border-sky-300 flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-sky-600" />
                  <span>تحویل باربری وطن</span>
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-3.5 bg-slate-50 rounded-2xl space-y-1">
                  <span className="text-slate-400 block text-[11px]">مبلغ پرداختی نقد:</span>
                  <span className="font-mono font-black text-slate-900 text-sm">
                    {formatPrice(orders[0].totalAmount)} تومان
                  </span>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl space-y-1">
                  <span className="text-slate-400 block text-[11px]">کد پیگیری مرسوله:</span>
                  <span className="font-mono font-bold text-blue-700 text-sm">
                    {orders[0].trackingCode}
                  </span>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl space-y-1">
                  <span className="text-slate-400 block text-[11px]">تاریخ ثبت سفارش:</span>
                  <span className="font-bold text-slate-800 text-sm">
                    {orders[0].createdAt}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => handleReorder(orders[0])}
                  className="py-2.5 px-4 rounded-xl bg-orange-50 text-[#E06518] hover:bg-orange-100 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>سفارش مجدد این اقلام</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('orders')}
                  className="py-2.5 px-4 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <span>جزئیات کامل مرسوله</span>
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Recommended Products Grid */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-sm text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-4.5 h-4.5 text-[#E06518]" />
                  <span>محصولات پرفروش و پیشنهادی برای خرید نقدی</span>
                </h3>
                <Link to="/products" className="text-xs font-bold text-[#E06518] hover:underline flex items-center gap-1">
                  <span>مشاهده همه</span>
                  <ChevronLeft className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {allProducts.slice(0, 3).map(product => (
                  <div key={product.code} className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-2xs hover:shadow-md transition-all space-y-3 text-right flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                          {product.code}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          موجود در انبار یزد
                        </span>
                      </div>
                      <h4 className="font-black text-xs text-slate-900 line-clamp-2">
                        {product.name}
                      </h4>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-slate-400">قیمت نقدی:</span>
                        <span className="font-mono font-black text-sm text-[#E06518]">
                          {formatPrice(product.prices.retail)} تومان
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => addToCart(product, 1)}
                        className="w-full py-2 bg-[#E06518] hover:bg-[#C95210] active:scale-95 text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>افزودن به سبد خرید</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ORDERS & TRACKING */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <h2 className="font-black text-base text-slate-900 flex items-center gap-2">
                <Package className="w-5 h-5 text-[#E06518]" />
                <span>سوابق سفارش‌ها و پیگیری مرسوله‌ها</span>
              </h2>

              <div className="space-y-4">
                {orders.map(o => (
                  <div key={o.id} className="p-5 rounded-2xl border border-slate-200/90 bg-slate-50/50 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/60 pb-3">
                      <div>
                        <span className="font-mono font-black text-sm text-slate-900">{o.orderNumber}</span>
                        <span className="text-xs text-slate-400 mr-2">تاریخ: {o.createdAt}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          پرداخت آنلاین موفق
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {o.items.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs py-1">
                          <span className="font-bold text-slate-800">{item.productName} ({toPersianDigits(item.quantity)} عدد)</span>
                          <span className="font-mono font-bold text-slate-700">{formatPrice(item.totalPrice)} تومان</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div className="text-slate-600">
                        <span>بارنامه / کد پیگیری: </span>
                        <span className="font-mono font-bold text-blue-700">{o.trackingCode}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleReorder(o)}
                          className="py-2 px-3 bg-[#E06518] hover:bg-[#C95210] text-white font-bold rounded-xl cursor-pointer text-xs flex items-center gap-1"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>خرید مجدد</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: WISHLIST */}
        {activeTab === 'wishlist' && (
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <h2 className="font-black text-base text-slate-900 flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-500" />
              <span>لیست علاقه‌مندی‌ها</span>
            </h2>

            {wishlistProducts.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs space-y-3">
                <Heart className="w-12 h-12 text-slate-300 mx-auto" />
                <p>هیچ کالایی در لیست علاقه‌مندی‌های شما ذخیره نشده است.</p>
                <Link to="/products" className="inline-block py-2 px-4 bg-[#E06518] text-white font-bold rounded-xl text-xs">
                  مشاهده کاتالوگ کالاها
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {wishlistProducts.map(p => (
                  <div key={p.code} className="p-4 rounded-2xl border border-slate-200 space-y-3 text-right">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] text-slate-400">{p.code}</span>
                      <button
                        onClick={() => toggleWishlist(p.code)}
                        className="text-rose-500 hover:text-rose-700 cursor-pointer p-1"
                        title="حذف از لیست"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <h4 className="font-black text-xs text-slate-900 line-clamp-2">{p.name}</h4>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="font-mono font-black text-sm text-[#E06518]">{formatPrice(p.prices.retail)} ت</span>
                      <button
                        onClick={() => addToCart(p, 1)}
                        className="py-1.5 px-3 bg-slate-900 text-white rounded-xl text-xs font-bold cursor-pointer"
                      >
                        + سبد خرید
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: CLUB & REWARDS */}
        {activeTab === 'club' && (
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="font-black text-base text-slate-900 flex items-center gap-2">
                <Gift className="w-5 h-5 text-amber-500" />
                <span>باشگاه مشتریان و امتیازات خرید</span>
              </h2>
              <span className="font-mono font-black text-base text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1 rounded-xl">
                موجودی: {toPersianDigits(points)} امتیاز
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              با هر خرید از صنعت پیش، به ازای هر ۱۰۰ هزار تومان، ۱ امتیاز به کیف پول شما اضافه می‌شود. امتیازات شما در فرم خرید آنلاین به تخفیف نقدی تبدیل خواهد شد.
            </p>

            <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl space-y-2 text-xs text-amber-900">
              <div className="font-bold flex items-center gap-2">
                <Tag className="w-4 h-4 text-[#E06518]" />
                <span>کد تخفیف هدیه عضویت جدید</span>
              </div>
              <p>کد تخفیف اختصاصی ۵٪ برای خریدهای بالای ۲ میلیون تومان: <strong className="font-mono bg-white px-2 py-0.5 rounded border border-amber-300 text-[#E06518]">WELCOME-ATL</strong></p>
            </div>
          </div>
        )}

        {/* TAB 5: ADDRESSES */}
        {activeTab === 'addresses' && (
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="font-black text-base text-slate-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-sky-500" />
                <span>مدیریت آدرس‌های تحویل کالا</span>
              </h2>

              <button
                type="button"
                onClick={() => setIsAddressModalOpen(true)}
                className="py-2 px-3.5 bg-[#E06518] text-white rounded-xl font-bold text-xs flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>ثبت آدرس جدید</span>
              </button>
            </div>

            <div className="space-y-3">
              {addresses.map(addr => (
                <div key={addr.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex items-start justify-between text-xs">
                  <div className="space-y-1">
                    <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <span>{addr.title}</span>
                      {addr.isDefault && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-bold">پیش‌فرض</span>
                      )}
                    </div>
                    <p className="text-slate-600">{addr.province}، {addr.city}، {addr.fullAddress}</p>
                    <p className="text-slate-400">گیرنده: {addr.recipientName} ({addr.recipientPhone})</p>
                  </div>

                  <button
                    onClick={() => deleteAddress(addr.id)}
                    className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: SUPPORT & TICKETS */}
        {activeTab === 'support' && (
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
            <h2 className="font-black text-base text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-500" />
              <span>پشتیبانی و ثبت سؤال فنی</span>
            </h2>

            {ticketSentFeedback ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-xs space-y-1 text-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <h3 className="font-bold">پیام شما ثبت شد</h3>
                <p>کارشناسان واحد فروش و فنی بازرگانی اطلس به‌زودی با شما تماس خواهند گرفت.</p>
              </div>
            ) : (
              <form onSubmit={handleSendSupportTicket} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">موضوع سؤال / استعلام:</label>
                  <input
                    type="text"
                    required
                    value={ticketSubject}
                    onChange={e => setTicketSubject(e.target.value)}
                    placeholder="مثلاً سؤال در مورد سایز تسمه کوره یا زمان ارسال..."
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-slate-800 bg-slate-50 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">متن پیام:</label>
                  <textarea
                    rows={4}
                    required
                    value={ticketMsg}
                    onChange={e => setTicketMsg(e.target.value)}
                    placeholder="شرح دقیق سؤال یا کد کالای مورد نظر..."
                    className="w-full p-3 rounded-xl border border-slate-200 text-slate-800 bg-slate-50 focus:bg-white text-xs"
                  />
                </div>

                <button
                  type="submit"
                  className="py-2.5 px-6 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl cursor-pointer flex items-center gap-2"
                >
                  <Send className="w-4 h-4 text-[#E06518]" />
                  <span>ارسال پیام به واحد پشتیبانی</span>
                </button>
              </form>
            )}
          </div>
        )}

        {/* TAB 7: B2B CREDIT UPGRADE REQUEST */}
        {activeTab === 'b2bRequest' && (
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
            <div className="space-y-1">
              <span className="px-3 py-1 bg-orange-100 text-[#E06518] rounded-full text-xs font-black inline-block">
                ویژه صاحب کارخانه، نمایندگی و فروشگاه‌های صنعتی
              </span>
              <h2 className="font-black text-lg text-slate-900">
                درخواست ارتقا به پرتال اعتباری B2B و خرید چکی ۳۰ روزه
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                اگر خریدار عمده هستید یا مدیریت کارخانه/فروشگاه را بر عهده دارید، فرم زیر را تکمیل نمایید تا حساب شما توسط واحد CRM بررسی و رمز عبور اختصاصی B2B برای شما صادر گردد.
              </p>
            </div>

            {b2bSubmitted ? (
              <div className="p-5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-xs space-y-2 text-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <h3 className="font-black text-sm">درخواست شما با موفقیت به واحد CRM ارسال شد</h3>
                <p>پس از بررسی پرونده، شناسه و رمز ورود B2B به همراه سقف اعتباری از طریق پیامک برای شما ارسال خواهد شد.</p>
              </div>
            ) : (
              <form onSubmit={handleB2bRequestSubmit} className="space-y-4 text-xs bg-slate-50 p-5 rounded-2xl border border-slate-200">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">نام شرکت / کارخانه / مغازه:</label>
                  <input
                    type="text"
                    required
                    value={b2bCompanyName}
                    onChange={e => setB2bCompanyName(e.target.value)}
                    placeholder="مثلاً کارخانه کاشی ستاره میبد یا فروشگاه ابزار پارس..."
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">توضیحات و زمینه فعالیت:</label>
                  <textarea
                    rows={3}
                    value={b2bNotes}
                    onChange={e => setB2bNotes(e.target.value)}
                    placeholder="توضیح در مورد حجم خرید ماهانه تسمه، بلبرینگ و قطعات صنعتی..."
                    className="w-full p-3 rounded-xl border border-slate-200 bg-white text-xs"
                  />
                </div>

                <button
                  type="submit"
                  className="py-2.5 px-6 bg-[#E06518] hover:bg-[#C95210] text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>ثبت درخواست اعتبار B2B</span>
                </button>
              </form>
            )}
          </div>
        )}

      </div>

      {/* Address Form Modal */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 space-y-4 text-right">
            <h3 className="font-black text-sm text-slate-900 border-b border-slate-100 pb-2">
              افزودن نشانی جدید تحویل بار
            </h3>

            <form onSubmit={handleAddAddressSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">عنوان نشانی (مثلاً منزل / انبار کارخانه):</label>
                <input
                  type="text"
                  required
                  value={newAddress.title}
                  onChange={e => setNewAddress({ ...newAddress, title: e.target.value })}
                  className="w-full h-9 px-3 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">آدرس کامل:</label>
                <textarea
                  rows={2}
                  required
                  value={newAddress.fullAddress}
                  onChange={e => setNewAddress({ ...newAddress, fullAddress: e.target.value })}
                  placeholder="استان، شهر، خیابان، پلاک..."
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddressModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 rounded-xl font-bold text-slate-600 cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#E06518] text-white rounded-xl font-bold cursor-pointer"
                >
                  ذخیره نشانی
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
