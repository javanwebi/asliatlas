import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { getAllProducts, getProductByCode } from '../data/mockGenerator';
import { toPersianDigits, formatPrice, getStockStatus } from '../utils/formatters';
import { Product } from '../types';
import {
  Heart,
  ShoppingCart,
  Trash2,
  Package,
  ArrowLeft,
  Search,
  Check,
  ChevronRight,
  X,
  PhoneCall,
  Sparkles,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';

export const WishlistPage: React.FC = () => {
  const { wishlist, clearWishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { currentUser, openAuthModal } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [addedItemCode, setAddedItemCode] = useState<string | null>(null);
  const [addedAllSuccess, setAddedAllSuccess] = useState(false);
  const [removingCode, setRemovingCode] = useState<string | null>(null);

  // All catalog products & user's wishlist products
  const allCatalogProducts = useMemo(() => getAllProducts(), []);

  const wishlistProducts = useMemo(() => {
    return wishlist
      .map(code => getProductByCode(code) || allCatalogProducts.find(p => p.code.toLowerCase() === code.toLowerCase()))
      .filter((p): p is Product => Boolean(p));
  }, [allCatalogProducts, wishlist]);

  // Filtered by search query (if user typed something)
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return wishlistProducts;
    const q = searchQuery.trim().toLowerCase();
    return wishlistProducts.filter(p =>
      p.code.toLowerCase().includes(q) ||
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      (p.categoryName || p.subcategory || '').toLowerCase().includes(q)
    );
  }, [wishlistProducts, searchQuery]);

  // Total count
  const totalItems = wishlistProducts.length;

  // Handle Remove with visual feedback
  const handleRemove = (code: string) => {
    setRemovingCode(code);
    setTimeout(() => {
      toggleWishlist(code);
      setRemovingCode(null);
    }, 220);
  };

  // Add individual item to cart
  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();

    if (!currentUser) {
      openAuthModal();
      return;
    }

    addToCart(product, 1);
    setAddedItemCode(product.code);
    setTimeout(() => {
      setAddedItemCode(null);
    }, 1800);
  };

  // Add all items in wishlist to cart
  const handleAddAllToCart = () => {
    if (!currentUser) {
      openAuthModal();
      return;
    }
    if (filteredProducts.length === 0) return;
    filteredProducts.forEach(p => {
      if (p.stock > 0 && !p.inquiryOnly) {
        addToCart(p, 1);
      }
    });
    setAddedAllSuccess(true);
    setTimeout(() => setAddedAllSuccess(false), 2500);
  };

  return (
    <div className="min-h-screen bg-[#F6F7F8] py-6 sm:py-10" dir="rtl">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

        {/* Minimal Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-[#777A7D]">
          <Link to="/" className="hover:text-[#E06518] transition-colors">صفحه اصلی</Link>
          <ChevronRight className="w-3.5 h-3.5 rotate-180 text-[#CBD2D8]" />
          <span className="text-[#333438] font-medium">علاقه‌مندی‌ها</span>
        </nav>

        {/* Clean, Realistic Header Card */}
        <div className="bg-white rounded-2xl border border-[#CBD2D8] p-5 sm:p-7 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-[#E06518]/10 text-[#E06518] flex items-center justify-center shrink-0 shadow-inner">
                <Heart className="w-6 h-6 fill-[#E06518]" />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-xl sm:text-2xl font-bold text-[#1F2024]">لیست علاقه‌مندی‌ها</h1>
                  <span className="inline-flex items-center justify-center text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#E06518]/10 text-[#E06518] border border-[#E06518]/20">
                    {toPersianDigits(totalItems)} کالا
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[#777A7D] mt-1">
                  کالاهای نشان‌شده جهت استعلام قیمت، مقایسه فنی و سفارش‌گذاری سریع
                </p>
              </div>
            </div>

            {/* Quick Actions if items exist */}
            {totalItems > 0 && (
              <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
                <button
                  onClick={handleAddAllToCart}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#E06518] hover:bg-[#c95410] active:scale-98 text-white text-xs sm:text-sm font-semibold transition-all shadow-xs cursor-pointer"
                >
                  {addedAllSuccess ? (
                    <>
                      <Check className="w-4 h-4 stroke-[2.5]" />
                      <span>افزوده شد!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4 stroke-[2]" />
                      <span>افزودن همه به سبد</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    if (window.confirm('آیا از حذف تمام کالاهای نشان‌شده اطمینان دارید؟')) {
                      clearWishlist();
                    }
                  }}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-[#CBD2D8] hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 text-[#777A7D] text-xs font-medium transition-colors cursor-pointer"
                  title="پاک‌کردن تمام اقلام"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="hidden sm:inline">حذف همه</span>
                </button>
              </div>
            )}
          </div>

          {/* Search Bar when items > 4 */}
          {totalItems > 4 && (
            <div className="mt-5 pt-4 border-t border-[#DEE2E5]">
              <div className="relative max-w-md">
                <Search className="w-4 h-4 text-[#777A7D] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="جستجو در بین نشان‌شده‌ها (کد، نام، برند)..."
                  className="w-full pl-9 pr-10 py-2.5 text-xs sm:text-sm bg-[#F6F7F8] border border-[#CBD2D8] rounded-xl text-[#333438] placeholder-[#777A7D] focus:outline-hidden focus:border-[#E06518] focus:bg-white transition-all shadow-inner"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#777A7D] hover:text-[#333438]"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Empty State */}
        {totalItems === 0 && (
          <div className="bg-white rounded-2xl border border-[#CBD2D8] p-10 sm:p-14 text-center shadow-xs">
            <div className="w-20 h-20 mx-auto rounded-full bg-[#F6F7F8] border border-[#CBD2D8] flex items-center justify-center text-[#CBD2D8] mb-5">
              <Heart className="w-10 h-10 stroke-[1.5]" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-[#1F2024] mb-2">
              لیست علاقه‌مندی‌های شما خالی است
            </h2>
            <p className="text-xs sm:text-sm text-[#777A7D] max-w-md mx-auto mb-6 leading-relaxed">
              با انتخاب آیکون قلب روی هر قطعه، می‌توانید اقلام مورد نظر خود را در این بخش نگه دارید و هر زمان که خواستید آنها را سفارش دهید.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#E06518] hover:bg-[#c95410] text-white font-semibold text-sm transition-all shadow-xs"
            >
              <Package className="w-4 h-4" />
              <span>مشاهده و مرور کاتالوگ قطعات</span>
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* Search Empty State */}
        {totalItems > 0 && filteredProducts.length === 0 && (
          <div className="bg-white rounded-2xl border border-[#CBD2D8] p-10 text-center shadow-xs">
            <Search className="w-10 h-10 mx-auto text-[#CBD2D8] mb-3 stroke-[1.5]" />
            <h3 className="text-base font-bold text-[#1F2024] mb-1">
              موردی با این مشخصات یافت نشد
            </h3>
            <p className="text-xs text-[#777A7D] mb-4">
              کلمه دیگری را جستجو کنید یا فیلتر جستجو را پاک کنید.
            </p>
            <button
              onClick={() => setSearchQuery('')}
              className="px-4 py-2 text-xs font-semibold text-[#E06518] bg-[#E06518]/10 rounded-xl hover:bg-[#E06518]/20 transition-colors"
            >
              پاک‌کردن فیلتر جستجو
            </button>
          </div>
        )}

        {/* Product Cards Grid: Realistic Industrial E-Commerce UI/UX */}
        {filteredProducts.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
            {filteredProducts.map((product) => {
              const stockInfo = getStockStatus(product.stock);
              const isAvailable = product.stock > 0;
              const isAdded = addedItemCode === product.code;
              const isRemoving = removingCode === product.code;
              const productImage = (product.images && product.images[0]) || product.image || '/images/placeholder-part.png';

              return (
                <div
                  key={product.code}
                  className={`group relative flex flex-col bg-white rounded-2xl border border-[#CBD2D8] hover:border-[#E06518]/60 hover:shadow-md transition-all duration-200 overflow-hidden text-right ${
                    isRemoving ? 'opacity-40 scale-95 pointer-events-none' : ''
                  }`}
                >
                  {/* Top Bar: Product Code & Brand Badge */}
                  <div className="p-3 pb-1 flex items-center justify-between gap-2">
                    <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-lg bg-[#F6F7F8] text-[#55565A] border border-[#DEE2E5]">
                      {product.code}
                    </span>

                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#DEE2E5] text-[#333438] border border-[#CBD2D8]">
                      {product.brand}
                    </span>
                  </div>

                  {/* Product Image Link */}
                  <Link
                    to={`/product/${encodeURIComponent(product.code)}`}
                    className="relative block h-44 p-4 flex items-center justify-center bg-white group-hover:scale-[1.02] transition-transform duration-200"
                  >
                    <img
                      src={productImage}
                      alt={product.name}
                      className="max-h-full max-w-full object-contain mix-blend-multiply drop-shadow-xs"
                      loading="lazy"
                    />

                    {/* Stock Status Badge */}
                    <div className="absolute bottom-2 right-3">
                      <span
                        className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${stockInfo.colorClass}`}
                      >
                        {stockInfo.text}
                      </span>
                    </div>
                  </Link>

                  {/* Product Info */}
                  <div className="p-4 pt-1 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Subcategory */}
                      <div className="text-[11px] text-[#777A7D] mb-1">
                        {product.categoryName || product.subcategory || 'قطعه صنعتی'}
                      </div>

                      {/* Product Name */}
                      <Link
                        to={`/product/${encodeURIComponent(product.code)}`}
                        className="block font-bold text-xs sm:text-sm text-[#1F2024] hover:text-[#E06518] transition-colors line-clamp-2 min-h-[38px] leading-relaxed mb-3"
                      >
                        {product.name}
                      </Link>
                    </div>

                    {/* Price & Primary Action */}
                    <div className="pt-3 border-t border-[#F0F2F4] space-y-2.5">
                      <div className="flex items-baseline justify-between">
                        <span className="text-[11px] text-[#777A7D]">قیمت:</span>
                        {product.inquiryOnly ? (
                          <span className="text-xs font-semibold text-amber-600">
                            نیازمند استعلام قیمت
                          </span>
                        ) : product.prices?.retail ? (
                          <div className="flex items-baseline gap-1">
                            <span className="text-base font-bold text-[#1F2024]">
                              {formatPrice(product.prices.retail)}
                            </span>
                            <span className="text-[10px] text-[#777A7D]">تومان</span>
                          </div>
                        ) : (
                          <span className="text-xs text-[#777A7D]">تماس با واحد فروش</span>
                        )}
                      </div>

                      {/* Action Button: Add to Cart or Request Inquiry */}
                      {product.inquiryOnly ? (
                        <Link
                          to={`/product/${encodeURIComponent(product.code)}`}
                          className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#F6F7F8] hover:bg-[#E06518]/10 text-[#333438] hover:text-[#E06518] text-xs font-semibold border border-[#CBD2D8] hover:border-[#E06518]/30 transition-all"
                        >
                          <PhoneCall className="w-3.5 h-3.5" />
                          <span>استعلام و جزئیات</span>
                        </Link>
                      ) : (
                        <button
                          onClick={(e) => handleAddToCart(e, product)}
                          disabled={!isAvailable}
                          className={`w-full flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                            isAdded
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : !isAvailable
                              ? 'bg-[#DEE2E5] text-[#777A7D] cursor-not-allowed'
                              : 'bg-[#E06518] hover:bg-[#c95410] active:scale-98 text-white shadow-xs'
                          }`}
                        >
                          {isAdded ? (
                            <>
                              <Check className="w-4 h-4 stroke-[2.5]" />
                              <span>به سبد اضافه شد</span>
                            </>
                          ) : (
                            <>
                              <ShoppingCart className="w-3.5 h-3.5 stroke-[2]" />
                              <span>افزودن به سبد خرید</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Explicit Bottom Bar: Remove Button under card */}
                  <div className="px-4 py-2.5 bg-[#FAFBFB] border-t border-[#E8ECEF] flex items-center justify-between">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleRemove(product.code);
                      }}
                      className="w-full inline-flex items-center justify-center gap-1.5 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50/80 py-1.5 px-2.5 rounded-lg font-medium transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>حذف از علاقه‌مندی‌ها</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Minimal Footer Info */}
        {filteredProducts.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#777A7D] pt-4 px-2">
            <span>
              نمایش {toPersianDigits(filteredProducts.length)} از {toPersianDigits(totalItems)} کالای نشان‌شده
            </span>
            <Link
              to="/products"
              className="inline-flex items-center gap-1 text-[#E06518] hover:underline font-medium"
            >
              <span>افزودن قطعات بیشتر از کاتالوگ</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

      </div>
    </div>
  );
};
