import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { IRAN_PROVINCES, ACTIVITY_FIELDS } from "../../data/iranLocations";
import {
  Eye,
  EyeOff,
  ArrowLeft,
  ShieldCheck,
  Layers,
  CheckCircle2,
} from "lucide-react";
import { STORE_ASSETS as A } from "../../assets/images";
import { normalizeIranianMobile } from "../../utils/usernameGenerator";
export function AccountAccess({
  initial = "login",
  onDone,
}: {
  initial?: "login" | "register";
  onDone?: () => void;
}) {
  const auth = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [visible, setVisible] = useState(false);
  const [created, setCreated] = useState<{
    username: string;
    password: string;
  } | null>(null);
  const [province, setProvince] = useState("");
  const [city, setCity] = useState("");
  const go = (user = auth.currentUser) => {
    onDone?.();
    const root = user?.approvedB2B ? "/account" : "/consumer-dashboard";
    let destination = "";
    try {
      destination = sessionStorage.getItem("sanat_access_destination") || "";
    } catch {}
    if (user?.onboardingCompleted) {
      try {
        sessionStorage.removeItem("sanat_access_destination");
      } catch {}
      navigate(destination.startsWith(root + "/product/") ? destination : root);
    } else navigate("/onboarding");
  };
  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    const data = new FormData(e.currentTarget);
    try {
      if (mode === "login") {
        const identifier = String(data.get("identifier") || "").replace(
          /[۰-۹]/g,
          (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)),
        );
        const r = await auth.loginWithPassword(
          identifier,
          String(data.get("password") || "").replace(/[۰-۹]/g, (d) =>
            String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)),
          ),
        );
        if (!r.success) {
          setError(r.message || "ورود انجام نشد؛ اطلاعات را بررسی کنید.");
          return;
        }
        go(r.user || null);
      } else {
        const mobileResult = normalizeIranianMobile(
          String(data.get("mobile") || ""),
        );
        const mobile = mobileResult.normalized;
        if (!mobileResult.isValid) {
          setError("شماره موبایل معتبر وارد کنید.");
          return;
        }
        const r = await auth.registerUser({
          firstName: String(data.get("firstName") || ""),
          lastName: String(data.get("lastName") || ""),
          mobile,
          email: String(data.get("email") || ""),
          companyName: String(data.get("companyName") || ""),
          provinceId: province,
          cityId: city,
          province: IRAN_PROVINCES.find((p) => p.id === province)?.name,
          city: IRAN_PROVINCES.find((p) => p.id === province)?.cities.find(
            (c) => c.id === city,
          )?.name,
          activityField: String(data.get("activityField") || ""),
        });
        if (!r.success) {
          setError(r.message || "ثبت‌نام انجام نشد؛ دوباره تلاش کنید.");
          return;
        }
        setCreated({
          username: r.credentials?.username || r.user?.username || "",
          password: r.credentials?.initialPassword || mobile,
        });
      }
    } catch {
      setError("ارتباط برقرار نشد. دوباره تلاش کنید.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="account-access">
      <aside className="account-access-story">
        <img src={A.authIndustrialHero} alt="" />
        <div>
          <span className="account-symbol">
            <Layers size={30} />
          </span>
          <p>صنعت پیش</p>
          <h2>
            از انتخاب هوشمند
            <br />
            تا خرید مطمئن.
          </h2>
          <ul>
            <li>
              <CheckCircle2 size={17} />
              قیمت و موجودی در پنل شما
            </li>
            <li>
              <CheckCircle2 size={17} />
              استعلام با کد دقیق کالا
            </li>
            <li>
              <CheckCircle2 size={17} />
              پیگیری سفارش و باشگاه مشتریان
            </li>
          </ul>
          <Link to="/about" onClick={onDone}>
            آشنایی بیشتر با صنعت پیش <ArrowLeft size={17} />
          </Link>
        </div>
      </aside>
      <section className="account-access-form">
        {created ? (
          <div className="account-created">
            <CheckCircle2 size={40} />
            <span className="store-eyebrow">حساب شما آماده است</span>
            <h1>به صنعت پیش خوش آمدید</h1>
            <p>
              اطلاعات ورودتان را نگه دارید. ارسال پیامک در این مرحله انجام نشده
              است.
            </p>
            <dl>
              <dt>نام کاربری</dt>
              <dd dir="ltr">{created.username}</dd>
              <dt>رمز اولیه</dt>
              <dd dir="ltr">{created.password}</dd>
            </dl>
            <button className="store-btn-primary" onClick={() => go()}>
              تکمیل مشخصات و ورود به پنل <ArrowLeft size={18} />
            </button>
          </div>
        ) : (
          <>
            <div className="account-form-heading">
              <span className="store-eyebrow">
                با صنعت پیش، هوشمندانه پیش بروید
              </span>
              <h1>
                {mode === "login"
                  ? "ورود به حساب شما"
                  : "شروع همکاری با صنعت پیش"}
              </h1>
              <p>
                {mode === "login"
                  ? "با شماره موبایل یا نام کاربری وارد شوید."
                  : "اطلاعات پایه را ثبت کنید؛ حساب و پنل شما آماده می‌شود."}
              </p>
            </div>
            <div
              className="account-tabs"
              role="group"
              aria-label="انتخاب ورود یا ثبت‌نام"
            >
              <button
                aria-pressed={mode === "login"}
                onClick={() => {
                  setMode("login");
                  setError("");
                }}
              >
                ورود
              </button>
              <button
                aria-pressed={mode === "register"}
                onClick={() => {
                  setMode("register");
                  setError("");
                }}
              >
                ساخت حساب
              </button>
            </div>
            <form onSubmit={submit} className="account-fields">
              {mode === "login" ? (
                <>
                  <label>
                    موبایل یا نام کاربری
                    <input
                      name="identifier"
                      autoComplete="username"
                      dir="ltr"
                      placeholder="09123456789"
                      required
                    />
                  </label>
                  <label>
                    رمز عبور
                    <div className="account-password">
                      <input
                        name="password"
                        autoComplete="current-password"
                        type={visible ? "text" : "password"}
                        required
                        dir="ltr"
                      />
                      <button
                        type="button"
                        onClick={() => setVisible((v) => !v)}
                        aria-label={visible ? "پنهان کردن رمز" : "نمایش رمز"}
                      >
                        {visible ? <EyeOff size={19} /> : <Eye size={19} />}
                      </button>
                    </div>
                  </label>
                  <p className="account-help">
                    رمز اولیهٔ حساب‌های تازه، شماره موبایل ثبت‌شده است. برای
                    بازیابی دسترسی با{" "}
                    <Link to="/contact" onClick={onDone}>
                      پشتیبانی
                    </Link>{" "}
                    تماس بگیرید.
                  </p>
                </>
              ) : (
                <>
                  <div className="account-field-pair">
                    <label>
                      نام
                      <input
                        name="firstName"
                        autoComplete="given-name"
                        required
                      />
                    </label>
                    <label>
                      نام خانوادگی
                      <input
                        name="lastName"
                        autoComplete="family-name"
                        required
                      />
                    </label>
                  </div>
                  <label>
                    شماره موبایل
                    <input
                      name="mobile"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      dir="ltr"
                      placeholder="09123456789"
                      required
                    />
                  </label>
                  <label>
                    نام شرکت، کارخانه یا فروشگاه
                    <input
                      name="companyName"
                      autoComplete="organization"
                      required
                    />
                  </label>
                  <div className="account-field-pair">
                    <label>
                      استان
                      <select
                        required
                        aria-label="استان"
                        value={province}
                        onChange={(e) => {
                          setProvince(e.target.value);
                          setCity("");
                        }}
                      >
                        <option value="">انتخاب استان</option>
                        {IRAN_PROVINCES.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      شهر
                      <select
                        required
                        aria-label="شهر"
                        disabled={!province}
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                      >
                        <option value="">انتخاب شهر</option>
                        {IRAN_PROVINCES.find(
                          (p) => p.id === province,
                        )?.cities.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <label>
                    زمینه فعالیت
                    <select
                      name="activityField"
                      aria-label="زمینه فعالیت"
                      defaultValue=""
                      required
                    >
                      <option value="">انتخاب زمینه فعالیت</option>
                      {ACTIVITY_FIELDS.map((f) => (
                        <option key={f} value={f}>
                          {f}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    ایمیل <small>اختیاری</small>
                    <input
                      name="email"
                      type="email"
                      autoComplete="email"
                      dir="ltr"
                    />
                  </label>
                </>
              )}
              {error && (
                <p role="alert" className="account-error">
                  {error}
                </p>
              )}
              <button
                className="store-btn-primary account-submit"
                disabled={busy}
                type="submit"
              >
                {busy
                  ? "در حال بررسی…"
                  : mode === "login"
                    ? "ورود به پنل"
                    : "ساخت حساب کاربری"}
                <ArrowLeft size={17} />
              </button>
            </form>
            <div className="account-privacy">
              <ShieldCheck size={17} />
              <p>
                کد و مشخصات محصولات برای همه قابل بررسی است؛ قیمت، موجودی و
                استعلام پس از ورود در پنل نمایش داده می‌شود.
              </p>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
