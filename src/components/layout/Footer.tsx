import React from "react";
import { Link } from "react-router-dom";
import {
  Layers,
  ArrowUpLeft,
  Phone,
  Instagram,
  Send,
  MessageCircle,
} from "lucide-react";
import { PRIMARY_CATALOG_CATEGORIES } from "../../data/categories";
export const Footer: React.FC = () => (
  <footer className="store-footer" dir="rtl">
    <div className="store-footer-main">
      <div className="store-footer-brand">
        <Link to="/" className="store-logo">
          <span>
            <Layers size={25} />
          </span>
          <strong>
            صنعت پیش<small>همراه خرید صنعتی شما</small>
          </strong>
        </Link>
        <p>
          از انتخاب قطعه تا تأمین و ساخت؛ کنار فروشگاه‌ها، کارخانجات و خطوط
          تولید هستیم.
        </p>
        <a href="tel:03535254703" className="store-footer-phone">
          <Phone size={17} />
          <span dir="ltr">۰۳۵–۳۵۲۵۴۷۰۳</span>
        </a>
        <div className="store-socials">
          <a href="https://instagram.com" aria-label="اینستاگرام">
            <Instagram size={18} />
          </a>
          <a href="https://eitaa.com" aria-label="ایتا">
            ایتا
          </a>
          <a href="https://t.me" aria-label="تلگرام">
            <Send size={18} />
          </a>
          <a href="https://wa.me/989903427027" aria-label="واتس‌اپ">
            <MessageCircle size={18} />
          </a>
        </div>
      </div>
      <div>
        <h2>محصولات</h2>
        {PRIMARY_CATALOG_CATEGORIES.slice(0, 4).map((c) => (
          <Link to={`/products?category=${c.slug}`} key={c.slug}>
            {c.name}
          </Link>
        ))}
        <Link to="/products">
          همه محصولات
          <ArrowUpLeft size={14} />
        </Link>
      </div>
      <div>
        <h2>راهنمای خرید</h2>
        <Link to="/ai-consult">مشاوره انتخاب قطعه</Link>
        <Link to="/categories">جستجو در دسته‌بندی‌ها</Link>
        <Link to="/wishlist">محصولات نشان‌شده</Link>
        <Link to="/cart">سبد خرید</Link>
        <Link to="/contact">پشتیبانی سفارش</Link>
      </div>
      <div>
        <h2>درباره صنعت پیش</h2>
        <Link to="/about">درباره ما</Link>
        <Link to="/history">تاریخچه بازرگانی اطلس</Link>
        <Link to="/licenses">مجوزها و گواهی‌ها</Link>
        <Link to="/factory-address">آدرس کارخانه و انبار</Link>
        <Link to="/contact">تماس با ما</Link>
      </div>
    </div>
    <div className="store-footer-bottom">
      <span>صنعت پیش · بازرگانی تسمه اطلس</span>
      <span>تولید، تأمین و مشاوره قطعات صنعتی</span>
    </div>
  </footer>
);
export default Footer;
