import {
  EngineeringHome,
  EngineeringJourney,
} from "../components/storefront/EngineeringHome";
import { ProductImage } from "../components/product/ProductImage";
import {
  HomeAiIntroduction,
  HomeIndustryShowcase,
  HomeMembership,
} from "../components/storefront/HomeDiscovery";
import { HomeKnowledge } from "./DiscoveryPages";
import {
  IndustrialServices,
  WhySanatPish,
} from "../components/storefront/HomeOverview";
import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Phone,
  Package,
} from "lucide-react";
import { CATEGORIES } from "../data/categories";
import { STORE_ASSETS } from "../assets/images";
import { toPersianDigits } from "../utils/formatters";
import { AiVisualPartSearchModal } from "../components/search/AiVisualPartSearchModal";
import { AiConsultModal } from "../components/search/AiConsultModal";
import { OurClientsSection } from "../components/home/OurClientsSection";

import { HighUtilityProductsSection } from "../components/home/HighUtilityProductsSection";
import { MainBrandsBanner } from "../components/home/MainBrandsBanner";

export const HomePage: React.FC = () => {
  const navigate = useNavigate();

  // Modals state
  const [isVisualSearchOpen, setIsVisualSearchOpen] = useState(false);
  const [isConsultOpen, setIsConsultOpen] = useState(false);

  const categoriesScrollRef = useRef<HTMLDivElement>(null);
  const handleCatScrollLeft = () =>
    categoriesScrollRef.current?.scrollBy({ left: -260, behavior: "smooth" });
  const handleCatScrollRight = () =>
    categoriesScrollRef.current?.scrollBy({ left: 260, behavior: "smooth" });

  return (
    <div className="home-refined w-full text-right font-sans pb-6 overflow-x-hidden relative">
      {/* ========================================================================= */}
      {/* 1. HERO SECTION - RESPONSIVE CINEMATIC DESKTOP & DEDICATED MOBILE BANNER   */}
      {/* ========================================================================= */}
      <EngineeringHome />

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
        <IndustrialServices />
        <HomeAiIntroduction />

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
              <h2 className="text-2xl sm:text-3xl font-black text-[#484344]">
                دسته‌بندی قطعات خطوط تولید
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                تأمین کلیه قطعات مصرفی و یدکی انواع خطوط تولید و کارخانجات
              </p>
            </div>

            <Link
              to="/categories"
              className="text-xs sm:text-sm font-bold text-[#E06518] hover:text-[#C95210] flex items-center gap-1.5 transition-colors group shrink-0 self-start sm:self-auto"
            >
              <span>مشاهده همه گروه‌های قطعات</span>
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
                      ? "border-2 border-[#E06518] shadow-[0_8px_25px_rgba(224,101,24,0.18)]"
                      : "border-slate-200/90 hover:border-[#E06518] hover:shadow-md"
                  }`}
                >
                  {/* Category Image Box with light off-white background */}
                  <div className="w-full aspect-square rounded-xl bg-[#F8F9FA] border border-slate-100 p-2 flex items-center justify-center overflow-hidden mb-3 group-hover:bg-orange-50/40 transition-colors">
                    {cat.image ? (
                      <ProductImage
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
      <HomeIndustryShowcase />

      {/* ========================================================================= */}
      {/* SECTION 5, 6, 7 CONTAINER                                                 */}
      {/* ========================================================================= */}
      <div className="w-full space-y-12 my-8 sm:my-10">
        {/* ========================================================================= */}
        {/* POPULAR PRODUCTS - استعلام قیمت آنلاین قطعات پربازدید                       */}
        {/* ========================================================================= */}

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
      <WhySanatPish />
      <EngineeringJourney />
      <HomeKnowledge />
      <HomeMembership />

      {/* ========================================================================= */}
      {/* 7. CTA CONSULTATION & INQUIRY BANNER (مشاوره تخصصی و استعلام قیمت)        */}
      {/* ========================================================================= */}
      <section className="home-contact-strip">
        <div>
          <span className="store-eyebrow">برای انتخاب قطعه کنار شما هستیم</span>
          <h2>برای خرید یا ساخت قطعه راهنمایی می‌خواهید؟</h2>
        </div>
        <div>
          <button
            type="button"
            className="store-btn-primary"
            onClick={() => navigate("/ai-consult")}
          >
            شروع مشاوره
            <ArrowLeft size={16} />
          </button>
          <a href="tel:03535254703" className="store-btn-secondary">
            <Phone size={16} />
            <span dir="ltr">۰۳۵–۳۵۲۵۴۷۰۳</span>
          </a>
        </div>
      </section>

      {/* Global Modals for interactive AI features */}
      <AiVisualPartSearchModal
        isOpen={isVisualSearchOpen}
        onClose={() => setIsVisualSearchOpen(false)}
      />

      <AiConsultModal
        isOpen={isConsultOpen}
        onClose={() => setIsConsultOpen(false)}
      />
    </div>
  );
};
