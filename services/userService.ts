import { User } from '../types';

const USER_STORAGE_KEY = 'manage_lc_user';

const isLocalStorageAvailable = (): boolean => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return false;
    const testKey = '__ls_test__';
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
};

let _fallbackUser: User | null = null;

export const userService = {
  saveUser: (user: User): void => {
    if (!isLocalStorageAvailable()) {
      _fallbackUser = user;
      console.warn('⚠️ localStorage mavjud emas — user fallback-ga saqlandi');
      return;
    }
    try {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      console.log('✅ User saved to localStorage:', user);
    } catch (error) {
      console.error('❌ Failed to save user:', error);
    }
  },

  getUser: (): User | null => {
    if (!isLocalStorageAvailable()) {
      console.warn('⚠️ localStorage mavjud emas — fallback user qaytardi');
      return _fallbackUser;
    }
    try {
      const stored = localStorage.getItem(USER_STORAGE_KEY);
      if (!stored) return null;
      const user = JSON.parse(stored) as User;
      console.log('✅ User retrieved from localStorage:', user);
      return user;
    } catch (error) {
      console.error('❌ Failed to retrieve user:', error);
      return null;
    }
  },

  clearUser: (): void => {
    if (!isLocalStorageAvailable()) {
      _fallbackUser = null;
      console.warn("⚠️ localStorage mavjud emas — fallback user o'chirildi");
      return;
    }
    try {
      localStorage.removeItem(USER_STORAGE_KEY);
      console.log('✅ User cleared from localStorage');
    } catch (error) {
      console.error('❌ Failed to clear user:', error);
    }
  },

  getRemainingSubscriptionDays: (user: User): number | null => {
    if (!user.isSubscribed) return 0;
    if (!user.subscriptionExpiry) return null;
    const expiry = new Date(user.subscriptionExpiry);
    if (isNaN(expiry.getTime())) return null;
    const now = new Date();
    expiry.setHours(23, 59, 59, 999);
    const diffMs = expiry.getTime() - now.getTime();
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  },

  isSubscriptionValid: (user: User): boolean => {
    if (!user.isSubscribed) return false;
    if (!user.subscriptionExpiry) return true; // Tugash sanasi bo'lmasa, faol deb hisoblash
    const remaining = (userService as any).getRemainingSubscriptionDays(user) as number | null;
    if (remaining === null) return false; // noto'g'ri sana -> faol emas
    return remaining > 0;
  },
};
