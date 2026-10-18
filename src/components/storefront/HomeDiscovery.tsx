import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowUpLeft,
  Camera,
  MessageSquare,
  Layers,
  ScanLine,
  UserPlus,
} from "lucide-react";
import { STORE_ASSETS as A } from "../../assets/images";
import { INDUSTRIES } from "../../data/siteContent";
export function HomeAiIntroduction() {
  return (
    <section className="home-ai-introduction" aria-labelledby="home-ai-title">
      <div className="home-ai-title">
        <span className="store-eyebrow">
          FORZA · یک میزکار، چند مسیر برای رسیدن به قطعه
        </span>
        <h2 id="home-ai-title">
          نیازتان را بگویید؛
          <br />
          هوشمندانه‌تر به قطعه برسید.
        </h2>
        <p>
          از پرسش فنی و بررسی کدهای کاتالوگ تا شناسایی اولیه با تصویر؛ ابزارهای
          انتخاب کنار هم هستند.
        </p>
        <Link to="/ai-consult" className="editorial-text-link">
          آشنایی با میزکار FORZA <ArrowUpLeft size={18} />
        </Link>
      </div>
      <div className="home-ai-feature">
        <img
          src={A.aiConsultRobot}
          alt="نمای معرفی مشاور هوشمند FORZA"
          loading="lazy"
        />
        <div>
          <span>
            <MessageSquare size={16} />
            گفتگوی مهندسی
          </span>
          <h3>پرسش شما، با زمینهٔ کاتالوگ</h3>
          <p>
            کد، کاربرد یا مشخصات قطعه را بنویسید. برای تصمیم بهتر، اطلاعات فنی
            لازم را قدم‌به‌قدم بررسی کنید.
          </p>
          <Link to="/ai-consult" className="store-btn-primary">
            شروع گفتگو <ArrowLeft size={17} />
          </Link>
        </div>
      </div>
      <div className="home-ai-feature">
        <img
          src={A.aiSearchMobile}
          alt="نمای معرفی جستجوی تصویری قطعات"
          loading="lazy"
        />
        <div>
          <span>
            <Camera size={16} />
            شناسایی با تصویر
          </span>
          <h3>عکس دارید، کد را نمی‌دانید؟</h3>
          <p>
            تصویر روشن و ابعاد را ارسال کنید؛ نتیجهٔ پیشنهادی را با کد و مشخصات
            واقعی محصول تطبیق دهید.
          </p>
          <Link to="/ai-consult?view=visual" className="store-btn-secondary">
            بررسی تصویر قطعه <ScanLine size={17} />
          </Link>
        </div>
      </div>
      <p className="home-ai-disclaimer">
        پیشنهاد هوش مصنوعی نیازمند بررسی فنی است. قیمت، موجودی و ثبت استعلام در
        پنل کاربری در دسترس است.
      </p>
    </section>
  );
}
export function HomeIndustryShowcase() {
  return (
    <section className="home-industry-showcase">
      <div className="home-industry-showcase-inner">
        <div className="home-industry-story">
          <span className="store-eyebrow">برای نیازهای متفاوت خطوط تولید</span>
          <h2>
            صنعت شما،
            <br />
            <em>مسیر تخصصی شما.</em>
          </h2>
          <p>
            کاربرد قطعات، اطلاعات لازم برای انتخاب و خانواده‌های مرتبط را در
            صفحهٔ مخصوص صنعت خود بررسی کنید.
          </p>
          <Link to="/industries" className="store-btn-primary">
            آشنایی با همه صنایع <ArrowLeft size={17} />
          </Link>
        </div>
        <div className="home-industry-deck">
          {INDUSTRIES.map((i) => (
            <Link key={i.slug} to={`/industries/${i.slug}`}>
              <img src={i.image} alt={i.title} loading="lazy" />
              <span>
                {i.title}
                <ArrowUpLeft size={18} />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
export function HomeMembership() {
  return (
    <section className="home-membership editorial-wrap">
      <span className="account-symbol">
        <Layers size={28} />
      </span>
      <div>
        <span className="store-eyebrow">با صنعت پیش، هوشمندانه پیش بروید</span>
        <h2>از دیدن قطعه تا پیگیری خرید، یک حساب فاصله است.</h2>
        <p>
          قیمت و موجودی را در پنل ببینید، استعلام بگیرید و سفارش‌ها و مسیر
          باشگاه مشتریان را دنبال کنید.
        </p>
      </div>
      <Link to="/register" className="store-btn-primary">
        <UserPlus size={19} />
        ساخت حساب کاربری
      </Link>
      <Link to="/login" className="editorial-text-link">
        قبلاً ثبت‌نام کرده‌اید؟ ورود <ArrowLeft size={16} />
      </Link>
    </section>
  );
}
