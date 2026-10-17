import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Award, ArrowLeft, CheckCircle2, Sparkles } from 'lucide-react';
import { STORE_ASSETS } from '../../assets/images';
import { getManagedBrands } from '../../data/brands';
import { Brand } from '../../types';

export const MainBrandsBanner: React.FC = () => {
  const [brands, setBrands] = useState<Brand[]>(() => getManagedBrands().filter(b => b.active !== false));

  useEffect(() => {
    const sync = () => {
      setBrands(getManagedBrands().filter(b => b.active !== false));
    };
    window.addEventListener('atlas-brands-updated', sync);
    window.addEventListener('atlas-catalog-updated', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('atlas-brands-updated', sync);
      window.removeEventListener('atlas-catalog-updated', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  return (
    <section className="py-12 md:py-16 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white relative overflow-hidden border-y border-amber-500/20">
      {/* Subtle Industrial Grid Pattern */}
      <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 md:mb-12">
          <div className="inline-flex items-center gap-2 bg-amber-500/15 border border-amber-500/30 text-amber-400 px-4 py-1.5 rounded-full text-xs font-bold mb-4">
            <Award className="w-4 h-4" />
            <span>اصالت تضمین‌شده • شناخت بصری برندهای معتبر صنعتی</span>
          </div>
          <h2 className="text-2xl md:text-4xl font-black text-white leading-tight mb-3">
            برندهای اصلی و انحصاری <span className="text-amber-400">هایپرصنعت اطلس</span>
          </h2>
          <p className="text-slate-300 text-sm md:text-base leading-relaxed">
            واردات مستقیم و توزیع تخصصی معتبرترین برندهای تسمه صنعتی، قطعات کوره کاشی و سرامیک و تجهیزات انتقال قدرت با ضمانت اصالت کالا.
          </p>
        </div>

        {/* Two Main Flagship Brand Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-10">
          {/* Brand 1: SWR */}
          <div className="group bg-gradient-to-br from-slate-800/90 to-slate-900/95 border-2 border-amber-500/30 hover:border-amber-400 rounded-3xl p-6 md:p-8 transition-all duration-300 shadow-2xl flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 left-0 bg-amber-500 text-slate-950 text-[11px] font-black px-4 py-1 rounded-br-2xl shadow-md">
              برند اصلی اول • ENGINEERED IN GERMANY
            </div>

            <div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-5 mb-6 mt-4 sm:mt-2">
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-white p-2.5 flex items-center justify-center shadow-lg shrink-0 border-2 border-amber-400/40 group-hover:scale-105 transition-transform">
                  <img
                    src={brands.find(b => b.id === 'swr' || b.nameEn.toUpperCase().includes('SWR'))?.image || STORE_ASSETS.swrLogo}
                    alt="برند SWR آلمان"
                    className="w-full h-full object-contain rounded-xl"
                  />
                </div>
                <div>
                  <span className="text-xs font-mono uppercase tracking-widest text-amber-400 block mb-1">
                    GERMAN INDUSTRIAL BELTS
                  </span>
                  <h3 className="text-2xl md:text-3xl font-black text-white mb-2">
                    برند اس دبلیو آر (SWR)
                  </h3>
                  <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
                    تخصصی‌ترین برند تسمه‌های تایمینگ، شیاری، پلی‌یورتان و تسمه‌های دور متغیر صنعتی با مقاومت حرارتی و کششی فوق‌العاده ویژه خطوط تولید ۲۴ ساعته.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-6 bg-slate-950/50 p-4 rounded-2xl border border-slate-800">
                <div className="flex items-center gap-2 text-xs text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>تسمه‌های تایمینگ، دنده‌ای و HTD</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>مقاوم در برابر حرارت و سایش کوره</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>نخ کششی کولار و استیل تقویت‌شده</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>تأمین مستقیم در تمام سایزهای استاندارد</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-800">
              <div className="flex items-center gap-2 text-xs text-emerald-400 font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>موجودی کامل در انبار مرکزی یزد</span>
              </div>
              <Link
                to="/products?brand=اس دبلیو آر (SWR)"
                className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-5 py-2.5 rounded-xl text-xs md:text-sm transition shadow-lg shadow-amber-500/20"
              >
                <span>مشاهده محصولات SWR</span>
                <ArrowLeft className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Brand 2: FORZA */}
          <div className="group bg-gradient-to-br from-slate-800/90 to-slate-900/95 border-2 border-red-500/30 hover:border-red-400 rounded-3xl p-6 md:p-8 transition-all duration-300 shadow-2xl flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 left-0 bg-red-600 text-white text-[11px] font-black px-4 py-1 rounded-br-2xl shadow-md">
              برند اصلی دوم • HEAVY DUTY POWER
            </div>

            <div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-5 mb-6 mt-4 sm:mt-2">
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-white p-2.5 flex items-center justify-center shadow-lg shrink-0 border-2 border-red-400/40 group-hover:scale-105 transition-transform">
                  <img
                    src={brands.find(b => b.id === 'forza' || b.nameEn.toUpperCase().includes('FORZA'))?.image || STORE_ASSETS.logoForza}
                    alt="برند FORZA"
                    className="w-full h-full object-contain rounded-xl"
                  />
                </div>
                <div>
                  <span className="text-xs font-mono uppercase tracking-widest text-red-400 block mb-1">
                    PREMIUM POWER TRANSMISSION
                  </span>
                  <h3 className="text-2xl md:text-3xl font-black text-white mb-2">
                    برند فورزا (FORZA)
                  </h3>
                  <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
                    پیشرو در تولید تسمه‌های انتقال قدرت سنگین، تسمه‌های V-Belt، کلاچ و قطعات پلیمری و فلزی پرفشار برای صنایع کاشی، معدن و نساجی.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-6 bg-slate-950/50 p-4 rounded-2xl border border-slate-800">
                <div className="flex items-center gap-2 text-xs text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-red-400 shrink-0" />
                  <span>تحمل بار و گشتاور شوک‌های سنگین</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-red-400 shrink-0" />
                  <span>طول عمر بالا در محیط‌های پر گردوغبار</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-red-400 shrink-0" />
                  <span>عملکرد بدون لرزش در دورهای بالا</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-red-400 shrink-0" />
                  <span>قیمت رقابتی پخش عمده و همکاری</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-800">
              <div className="flex items-center gap-2 text-xs text-emerald-400 font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>تضمین اصالت و گارانتی تعویض</span>
              </div>
              <Link
                to="/products?brand=فورزا (FORZA)"
                className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white font-black px-5 py-2.5 rounded-xl text-xs md:text-sm transition shadow-lg shadow-red-600/20"
              >
                <span>مشاهده محصولات FORZA</span>
                <ArrowLeft className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Visual Showcase of All Brands Managed in Admin Panel */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h3 className="text-lg md:text-xl font-black text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <span>ویترین تصویری برندهای قابل تأمین ({brands.length.toLocaleString('fa-IR')} برند معتبر)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                برای مشاهده کالاهای هر برند، روی تصویر و کارت برند مورد نظر کلیک کنید
              </p>
            </div>
            <Link
              to="/products"
              className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1.5"
            >
              <span>مشاهده تمام محصولات در کاتالوگ</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {brands.map(brand => {
              const imgSrc = brand.image || brand.logo || STORE_ASSETS.logoForza;
              return (
                <Link
                  key={brand.id}
                  to={`/products?brand=${encodeURIComponent(brand.name)}`}
                  className="group bg-slate-950/80 hover:bg-slate-800/90 border border-slate-800 hover:border-amber-500/50 rounded-2xl p-4 flex flex-col items-center text-center transition-all duration-200 hover:-translate-y-1 shadow-md"
                >
                  <div className="w-full h-24 rounded-xl bg-white p-2 flex items-center justify-center mb-3 overflow-hidden border border-slate-200 group-hover:border-amber-400 transition">
                    <img
                      src={imgSrc}
                      alt={brand.name}
                      className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="font-black text-xs md:text-sm text-white group-hover:text-amber-400 transition line-clamp-1">
                    {brand.name}
                  </div>
                  <div className="text-[10px] font-mono text-slate-400 mt-0.5 line-clamp-1">
                    {brand.nameEn} • {brand.country}
                  </div>
                  {brand.isExclusive && (
                    <span className="mt-2 inline-block px-2 py-0.5 rounded-full text-[9px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      نمایندگی / انحصاری
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
