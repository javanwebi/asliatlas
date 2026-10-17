import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Search,
  ShoppingCart,
  UserRound,
  Camera,
  X,
  ChevronDown,
  ChevronLeft,
  Layers,
  Phone,
  ArrowUpLeft,
  Heart,
  LogOut,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { PRIMARY_CATALOG_CATEGORIES } from "../../data/categories";
import { CategoryNavigation } from "../catalog/CategoryNavigation";
import { getInstantSearchResults } from "../../data/mockGenerator";
import { toPersianDigits } from "../../utils/formatters";
import { ProductImage } from "../product/ProductImage";
import { AiVisualPartSearchModal } from "../search/AiVisualPartSearchModal";
import type { Product } from "../../types";

const navGroups = [
  {
    title: "صنایع",
    links: [
      ["کاشی و سرامیک", "/industries/ceramic"],
      ["نساجی و پارچه", "/category/textile-machinery"],
      ["بسته‌بندی و کارتن‌سازی", "/category/packaging-carton"],
      ["غذایی و نوشیدنی", "/category/food-beverage"],
      ["ماشین‌سازی", "/category/machinery-equipment"],
      ["لاستیک و پلاستیک", "/category/rubber-plastics"],
    ],
  },
  {
    title: "خدمات",
    links: [
      ["مشاوره هوشمند قطعه", "/ai-consult"],
      ["شناسایی قطعه با تصویر", "visual"],
      ["تماس صوتی FORZA", "/ai-forza"],
      ["ساخت و تأمین سفارشی", "/contact"],
    ],
  },
  {
    title: "برندها",
    links: [
      ["اطلس", "/products?q=اطلس"],
      ["FORZA", "/products?q=FORZA"],
      ["SWR", "/products?q=SWR"],
    ],
  },
  {
    title: "درباره صنعت پیش",
    links: [
      ["درباره ما", "/about"],
      ["تاریخچه", "/history"],
      ["مجوزها", "/licenses"],
      ["تماس با ما", "/contact"],
    ],
  },
];
export const Header: React.FC = () => {
  const { currentUser, openAuthModal, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [camera, setCamera] = useState(false);
  const [mobileSearch, setMobileSearch] = useState(false);
  const [activeCategory, setActiveCategory] = useState(0);
  const root = useRef<HTMLElement>(null);
  const searchDialog = useRef<HTMLDialogElement>(null);
  const mobileInput = useRef<HTMLInputElement>(null);
  const account = currentUser?.approvedB2B ? "/account" : "/consumer-dashboard";
  const closeMenus = () =>
    root.current
      ?.querySelectorAll("details[open]")
      .forEach((el) => el.removeAttribute("open"));
  useEffect(() => {
    setSearchOpen(false);
    setMobileSearch(false);
    closeMenus();
  }, [location.pathname, location.search]);
  useEffect(() => {
    const id = setTimeout(() => {
      setResults(
        query.trim().length >= 2
          ? getInstantSearchResults(query).products.slice(0, 6)
          : [],
      );
    }, 160);
    return () => clearTimeout(id);
  }, [query]);
  useEffect(() => {
    if (mobileSearch) {
      searchDialog.current?.showModal();
      mobileInput.current?.focus();
    } else searchDialog.current?.close();
  }, [mobileSearch]);
  useEffect(() => {
    const open = () => setMobileSearch(true);
    const consult = () => navigate("/ai-consult");
    const forza = () => navigate("/ai-forza");
    const escape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeMenus();
        setSearchOpen(false);
      }
    };
    const outside = (e: MouseEvent) => {
      if (!root.current?.contains(e.target as Node)) {
        setSearchOpen(false);
        closeMenus();
      }
    };
    window.addEventListener("open-mobile-search", open);
    window.addEventListener("open-ai-consult", consult);
    window.addEventListener("open-forza-face-to-face", forza);
    document.addEventListener("keydown", escape);
    document.addEventListener("click", outside);
    return () => {
      window.removeEventListener("open-mobile-search", open);
      window.removeEventListener("open-ai-consult", consult);
      window.removeEventListener("open-forza-face-to-face", forza);
      document.removeEventListener("keydown", escape);
      document.removeEventListener("click", outside);
    };
  }, [navigate]);
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/products?q=${encodeURIComponent(query.trim())}`);
      setMobileSearch(false);
      setSearchOpen(false);
    }
  };
  const searchResults = () => (
    <div className="store-search-results">
      {results.map((p) => (
        <Link key={p.code} to={`/product/${encodeURIComponent(p.code)}`}>
          <ProductImage src={p.images[0]} alt="" />
          <span>
            {p.name}
            <small>{p.code}</small>
          </span>
          <ChevronLeft size={15} />
        </Link>
      ))}
      <button
        type="button"
        onClick={() => {
          navigate(`/products?q=${encodeURIComponent(query)}`);
          setMobileSearch(false);
          setSearchOpen(false);
        }}
      >
        مشاهده همه نتایج
        <ArrowUpLeft size={15} />
      </button>
    </div>
  );
  return (
    <header className="store-header" ref={root}>
      <div className="store-topline">
        <div>
          <span>تولید و تأمین قطعات خطوط تولید</span>
          <span>بازرگانی تسمه اطلس از ۱۳۶۶</span>
          <a href="tel:03535254703">
            <Phone size={13} />
            ۰۳۵–۳۵۲۵۴۷۰۳
          </a>
        </div>
      </div>
      <div className="store-header-main">
        <Link to="/" className="store-logo">
          <span>
            <Layers size={25} />
          </span>
          <strong>
            صنعت پیش<small>همراه خرید صنعتی شما</small>
          </strong>
        </Link>
        <div className="store-search">
          <form onSubmit={submit}>
            <Search size={19} />
            <input
              aria-label="جستجو در محصولات"
              placeholder="نام قطعه، کد کالا یا سایز را جستجو کنید…"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSearchOpen(true);
              }}
              onFocus={() => setSearchOpen(true)}
            />
            <button
              type="button"
              onClick={() => setCamera(true)}
              aria-label="جستجو با تصویر"
            >
              <Camera size={19} />
            </button>
            <button type="submit">جستجو</button>
          </form>
          {searchOpen && query.trim().length >= 2 && searchResults()}
        </div>
        <div className="store-header-actions">
          <button
            type="button"
            className="store-mobile-search"
            aria-label="باز کردن جستجو"
            onClick={() => setMobileSearch(true)}
          >
            <Search size={21} />
          </button>
          <details className="store-user-menu" name="store-header-menu">
            <summary aria-label="حساب کاربری">
              <UserRound size={20} />
              <span>{currentUser?.lastName || "حساب کاربری"}</span>
            </summary>
            <div>
              {currentUser ? (
                <>
                  <strong>
                    {currentUser.companyName || currentUser.fullName}
                  </strong>
                  <Link to={account}>
                    ورود به پنل من
                    <ChevronLeft size={15} />
                  </Link>
                  <Link to="/wishlist">
                    <Heart size={16} />
                    محصولات نشان‌شده
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      closeMenus();
                    }}
                  >
                    <LogOut size={16} />
                    خروج از حساب
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      openAuthModal();
                      closeMenus();
                    }}
                  >
                    ورود / ثبت‌نام
                  </button>
                  <Link to="/wishlist">محصولات نشان‌شده</Link>
                </>
              )}
            </div>
          </details>
          <Link
            className="store-cart"
            to="/cart"
            aria-label={`سبد خرید، ${itemCount} کالا`}
          >
            <ShoppingCart size={21} />
            {itemCount > 0 && <span>{toPersianDigits(itemCount)}</span>}
          </Link>
        </div>
      </div>
      <nav className="store-desktop-nav" aria-label="منوی اصلی">
        <div>
          <details className="store-categories-menu" name="store-header-menu">
            <summary>
              <Layers size={18} />
              دسته‌بندی محصولات
              <ChevronDown size={14} />
            </summary>
            <div className="store-mega">
              <div className="store-category-tabs">
                {PRIMARY_CATALOG_CATEGORIES.map((c, i) => (
                  <button
                    type="button"
                    key={c.slug}
                    onClick={() => setActiveCategory(i)}
                    aria-pressed={activeCategory === i}
                  >
                    {c.name}
                    <ChevronLeft size={14} />
                  </button>
                ))}
                <Link to="/products">
                  همه محصولات
                  <ArrowUpLeft size={16} />
                </Link>
              </div>
              <div className="store-category-tree">
                <Link
                  to={`/products?category=${PRIMARY_CATALOG_CATEGORIES[activeCategory]?.slug}`}
                  className="store-tree-title"
                >
                  {PRIMARY_CATALOG_CATEGORIES[activeCategory]?.name}
                  <ArrowUpLeft size={17} />
                </Link>
                <CategoryNavigation
                  key={activeCategory}
                  nodes={
                    PRIMARY_CATALOG_CATEGORIES[activeCategory]?.children || []
                  }
                  categorySlug={
                    PRIMARY_CATALOG_CATEGORIES[activeCategory]?.slug || ""
                  }
                />
              </div>
            </div>
          </details>
          {navGroups.map((group) => (
            <details
              className="store-nav-group"
              name="store-header-menu"
              key={group.title}
            >
              <summary>
                {group.title}
                <ChevronDown size={13} />
              </summary>
              <div>
                {group.links.map(([title, path]) =>
                  path === "visual" ? (
                    <button
                      type="button"
                      key={title}
                      onClick={() => {
                        setCamera(true);
                        closeMenus();
                      }}
                    >
                      {title}
                    </button>
                  ) : (
                    <Link key={title} to={path}>
                      {title}
                      <ChevronLeft size={13} />
                    </Link>
                  ),
                )}
              </div>
            </details>
          ))}
          <Link to="/ai-consult" className="store-consult-link">
            مشاوره انتخاب قطعه
            <ArrowUpLeft size={15} />
          </Link>
        </div>
      </nav>
      <dialog
        ref={searchDialog}
        className="store-search-dialog"
        onCancel={() => setMobileSearch(false)}
        onClose={() => setMobileSearch(false)}
        aria-label="جستجوی محصولات"
      >
        <div className="store-sheet-heading">
          <h2>دنبال چه قطعه‌ای هستید؟</h2>
          <button
            aria-label="بستن جستجو"
            onClick={() => setMobileSearch(false)}
          >
            <X size={23} />
          </button>
        </div>
        <form onSubmit={submit}>
          <input
            ref={mobileInput}
            aria-label="نام یا کد کالا"
            placeholder="کد، نام یا سایز قطعه…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit" aria-label="جستجو">
            <Search size={21} />
          </button>
        </form>
        {query.trim().length >= 2 ? (
          searchResults()
        ) : (
          <p>
            نام قطعه یا کد کالا را وارد کنید؛ برای جستجوی تصویری از دوربین
            استفاده کنید.
          </p>
        )}
        <button
          type="button"
          className="store-btn-secondary"
          onClick={() => {
            setMobileSearch(false);
            setCamera(true);
          }}
        >
          <Camera size={18} />
          شناسایی با تصویر قطعه
        </button>
      </dialog>
      <AiVisualPartSearchModal
        isOpen={camera}
        onClose={() => setCamera(false)}
      />
    </header>
  );
};
