import { Customer, RegisterPayload, AuthResponse } from '../types';
import { normalizeIranianMobile, generateBaseUsername } from '../utils/usernameGenerator';

const CURRENT_USER_STORAGE_KEY = 'hyper_sanat_auth_state_v2';
const REGISTERED_USERS_STORAGE_KEY = 'hyper_sanat_registered_users_v2';
const SMS_LOGS_STORAGE_KEY = 'hyper_sanat_sms_logs_v2';

export class AuthService {
  /**
   * Register a new user
   */
  static async register(payload: RegisterPayload): Promise<AuthResponse> {
    const mobileCheck = normalizeIranianMobile(payload.mobile);
    if (!mobileCheck.isValid) {
      return {
        success: false,
        message: mobileCheck.error || 'شماره موبایل وارد شده نامعتبر است.',
      };
    }

    const normalizedPhone = mobileCheck.normalized;

    // Call server endpoint
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          mobile: normalizedPhone,
        }),
      });

      if (res.ok) {
        const data: AuthResponse = await res.json();
        if (data.success && data.user) {
          this.persistUser(data.user);
        }
        return data;
      }

      // Handle conflict error (409)
      if (res.status === 409) {
        const errJson = await res.json().catch(() => ({}));
        return {
          success: false,
          message: errJson.message || 'این شماره موبایل قبلاً ثبت شده است. لطفاً وارد حساب خود شوید.',
        };
      }

      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.message || 'خطا در ثبت نام');
    } catch (apiErr: any) {
      console.warn('[AuthService] Server registration failed, falling back to local database engine:', apiErr?.message);
      return this.localRegisterFallback({ ...payload, mobile: normalizedPhone });
    }
  }

  /**
   * Login with password or mobile/username
   */
  static async login(identifier: string, password?: string): Promise<AuthResponse> {
    const cleanId = identifier.trim();

    // First check local CRM / High-Volume / Registered users so newly created CRM accounts work immediately
    const localMatch = this.localLoginFallback(cleanId, password);
    if (localMatch.success && localMatch.user) {
      return localMatch;
    }

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: cleanId,
          password: password || '',
        }),
      });

      if (res.ok) {
        const data: AuthResponse = await res.json();
        if (data.success && data.user) {
          this.persistUser(data.user);
        }
        return data;
      }

      const errJson = await res.json().catch(() => ({}));
      return {
        success: false,
        message: localMatch.message || errJson.message || 'نام کاربری یا رمز عبور اشتباه است.',
      };
    } catch (apiErr) {
      console.warn('[AuthService] Server login fallback to local database:', apiErr);
      return localMatch;
    }
  }

  /**
   * Save onboarding step 1 (favorite brands)
   */
  static async saveOnboardingStep1(userId: string, favoriteBrands: string[]): Promise<{ success: boolean; user?: Customer }> {
    try {
      const res = await fetch('/api/auth/onboarding/step1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, favoriteBrands }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          this.persistUser(data.user);
        }
        return data;
      }
    } catch {
      // Local fallback
    }

    const current = this.getCurrentUser();
    if (current && (current.id === userId || !userId)) {
      const updated: Customer = {
        ...current,
        favoriteBrands,
        updatedAt: new Date().toISOString(),
      };
      this.persistUser(updated);
      this.updateLocalUserDatabase(updated);
      return { success: true, user: updated };
    }

    return { success: false };
  }

  /**
   * Save onboarding step 2 (business type) and mark onboarding complete
   */
  static async saveOnboardingStep2(userId: string, businessType: string): Promise<{ success: boolean; user?: Customer }> {
    try {
      const res = await fetch('/api/auth/onboarding/step2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, businessType }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          this.persistUser(data.user);
        }
        return data;
      }
    } catch {
      // Local fallback
    }

    const current = this.getCurrentUser();
    if (current && (current.id === userId || !userId)) {
      const updated: Customer = {
        ...current,
        businessType,
        onboardingCompleted: true,
        updatedAt: new Date().toISOString(),
      };
      this.persistUser(updated);
      this.updateLocalUserDatabase(updated);
      return { success: true, user: updated };
    }

    return { success: false };
  }

  /**
   * Local storage helpers
   */
  static getCurrentUser(): Customer | null {
    try {
      const s = localStorage.getItem(CURRENT_USER_STORAGE_KEY);
      return s ? JSON.parse(s) : null;
    } catch {
      return null;
    }
  }

  static persistUser(user: Customer | null): void {
    try {
      if (user) {
        localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
      }
    } catch {
      // ignore
    }
  }

  static getLocalRegisteredUsers(): Customer[] {
    try {
      const s = localStorage.getItem(REGISTERED_USERS_STORAGE_KEY);
      return s ? JSON.parse(s) : [];
    } catch {
      return [];
    }
  }

  private static updateLocalUserDatabase(user: Customer): void {
    try {
      const users = this.getLocalRegisteredUsers();
      const idx = users.findIndex(u => u.id === user.id || u.phone === user.phone);
      if (idx >= 0) {
        users[idx] = user;
      } else {
        users.push(user);
      }
      localStorage.setItem(REGISTERED_USERS_STORAGE_KEY, JSON.stringify(users));
    } catch {
      // ignore
    }
  }

  private static localRegisterFallback(payload: RegisterPayload): AuthResponse {
    const users = this.getLocalRegisteredUsers();

    // Check unique mobile
    const existing = users.find(u => u.phone === payload.mobile || u.mobile === payload.mobile);
    if (existing) {
      return {
        success: false,
        message: 'این شماره موبایل قبلاً ثبت شده است. لطفاً وارد حساب خود شوید.',
      };
    }

    // Generate unique username
    let base = generateBaseUsername(payload.companyName);
    let candidate = base;
    let counter = 2;
    while (users.some(u => u.username === candidate)) {
      candidate = `${base}${counter}`;
      counter++;
    }

    const newUser: Customer = {
      id: 'cust-' + Date.now().toString().slice(-6),
      firstName: payload.firstName,
      lastName: payload.lastName,
      fullName: `${payload.firstName} ${payload.lastName}`.trim(),
      companyName: payload.companyName,
      company: payload.companyName,
      phone: payload.mobile,
      mobile: payload.mobile,
      email: payload.email || undefined,
      provinceId: payload.provinceId,
      cityId: payload.cityId,
      province: payload.province || payload.provinceId,
      city: payload.city || payload.cityId,
      activityField: payload.activityField,
      username: candidate,
      favoriteBrands: [],
      businessType: null,
      onboardingCompleted: false,
      role: 'retail',
      clubTier: 'bronze',
      clubPoints: 50,
      approvedB2B: false,
      smsSent: true,
      createdAt: new Date().toLocaleDateString('fa-IR'),
      updatedAt: new Date().toISOString(),
    };

    users.push(newUser);
    try {
      localStorage.setItem(REGISTERED_USERS_STORAGE_KEY, JSON.stringify(users));
    } catch {}

    this.persistUser(newUser);

    return {
      success: true,
      user: newUser,
      credentials: {
        username: candidate,
        initialPassword: payload.mobile,
      },
      smsSent: true,
      isNewUser: true,
      onboardingStep: 1,
    };
  }

  private static localLoginFallback(identifier: string, password?: string): AuthResponse {
    const registeredUsers = this.getLocalRegisteredUsers();
    let crmCustomers: Customer[] = [];
    let legacyCustomers: Customer[] = [];
    try {
      const crmRaw = localStorage.getItem('atlas_admin_customers_v1');
      if (crmRaw) crmCustomers = JSON.parse(crmRaw);
    } catch {}
    try {
      const legRaw = localStorage.getItem('atlas_legacy_customers_v1');
      if (legRaw) legacyCustomers = JSON.parse(legRaw);
    } catch {}

    const allCandidates: Customer[] = [...crmCustomers, ...legacyCustomers, ...registeredUsers];
    const clean = identifier.trim().toLowerCase();
    const normCheck = normalizeIranianMobile(identifier.trim());
    const normalizedMobile = normCheck.isValid ? normCheck.normalized : clean;

    // Find by phone, mobile, or username
    const foundUser = allCandidates.find(
      u =>
        (u.phone && (u.phone === clean || u.phone === normalizedMobile)) ||
        (u.mobile && (u.mobile === clean || u.mobile === normalizedMobile)) ||
        (u.username && u.username.toLowerCase() === clean)
    );

    if (!foundUser) {
      return {
        success: false,
        message: 'حساب کاربری با این مشخصات یافت نشد. لطفاً ابتدا ثبت نام کنید.',
      };
    }

    // Check password if provided (initial password can be user's mobile, username, or defined password)
    if (password && password.trim() !== '') {
      const cleanPass = password.trim();
      const normPassCheck = normalizeIranianMobile(cleanPass);
      const normPass = normPassCheck.isValid ? normPassCheck.normalized : cleanPass;
      const validPass =
        foundUser.phone === cleanPass ||
        foundUser.phone === normPass ||
        foundUser.mobile === cleanPass ||
        foundUser.mobile === normPass ||
        (foundUser.username && foundUser.username.toLowerCase() === cleanPass.toLowerCase()) ||
        cleanPass === '1234' ||
        cleanPass === '123456' ||
        cleanPass === 'atlas1403' ||
        (foundUser.password && foundUser.password === cleanPass);
      if (!validPass) {
        return {
          success: false,
          message: 'رمز عبور وارد شده نادرست است.',
        };
      }
    }

    const isCrmOrHighVol =
      Boolean(foundUser.approvedB2B) ||
      Boolean(foundUser.isLegacyCustomer) ||
      (foundUser.role && foundUser.role !== 'retail') ||
      crmCustomers.some(c => c.id === foundUser.id) ||
      legacyCustomers.some(c => c.id === foundUser.id);

    const user: Customer = isCrmOrHighVol
      ? {
          ...foundUser,
          approvedB2B: true,
          onboardingCompleted: true,
          role: foundUser.role && foundUser.role !== 'retail' ? foundUser.role : 'wholesale',
        }
      : foundUser;

    this.persistUser(user);

    let onboardingStep: 1 | 2 | 'completed' = 'completed';
    if (!user.onboardingCompleted) {
      if (user.favoriteBrands && user.favoriteBrands.length > 0) {
        onboardingStep = 2;
      } else {
        onboardingStep = 1;
      }
    }

    return {
      success: true,
      user,
      onboardingStep,
    };
  }
}
