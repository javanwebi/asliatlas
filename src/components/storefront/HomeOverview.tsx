import React from "react";
import { Link } from "react-router-dom";
import {
  Camera,
  MessageCircle,
  ArrowUpLeft,
  ShieldCheck,
  Factory,
  Truck,
  Layers,
  ScanLine,
} from "lucide-react";
export function HomeAssist({
  onVisual,
  onConsult,
}: {
  onVisual: () => void;
  onConsult: () => void;
}) {
  return (
    <section className="home-assist" aria-label="راهنمای پیدا کردن قطعه">
      <div>
        <span className="store-eyebrow">از نیاز شما تا قطعه مناسب</span>
        <h2>پیدا کردن قطعه، ساده‌تر از همیشه</h2>
        <p>
          کد یا نام قطعه را جستجو کنید؛ برای انتخاب دقیق‌تر، تصویر بفرستید یا
          مشاوره بگیرید.
        </p>
      </div>
      <div className="home-assist-actions">
        <button onClick={onVisual} type="button">
          <Camera size={22} />
          <span>
            <strong>شناسایی با تصویر</strong>
            <small>عکس قطعه را دارید؟</small>
          </span>
          <ArrowUpLeft size={17} />
        </button>
        <button onClick={onConsult} type="button">
          <MessageCircle size={22} />
          <span>
            <strong>مشاوره انتخاب قطعه</strong>
            <small>مشخصات را با هم بررسی کنیم</small>
          </span>
          <ArrowUpLeft size={17} />
        </button>
      </div>
    </section>
  );
}
export function WhySanatPish() {
  const items = [
    {
      Icon: Factory,
      title: "تولید و ساخت",
      text: "بررسی ساخت قطعه از روی نمونه یا نقشه",
    },
    {
      Icon: Layers,
      title: "تأمین قطعات",
      text: "دسترسی به خانواده‌ها و کدهای متنوع کالا",
    },
    {
      Icon: ShieldCheck,
      title: "انتخاب مطمئن",
      text: "مشخصات فنی، تصویر و قیمت هر کد در کنار هم",
    },
    {
      Icon: Truck,
      title: "پیگیری خرید",
      text: "سفارش‌ها، ارسال و باشگاه در پنل شما",
    },
  ];
  return (
    <section className="home-why" aria-labelledby="why-sanat-title">
      <div className="home-why-heading">
        <div>
          <span className="store-eyebrow">یک همراه، در تمام مسیر خرید</span>
          <h2 id="why-sanat-title">چرا صنعت پیش؟</h2>
          <p>
            انتخاب، تأمین و ساخت قطعات صنعتی؛ با پشتوانه بازرگانی تسمه اطلس.
          </p>
        </div>
        <Link to="/about">
          بیشتر درباره ما
          <ArrowUpLeft size={16} />
        </Link>
      </div>
      <div className="home-why-grid">
        {items.map(({ Icon, title, text }) => (
          <article key={title}>
            <span>
              <Icon size={22} />
            </span>
            <div>
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
