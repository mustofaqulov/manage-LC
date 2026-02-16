import { useMemo } from 'react';
import { useAppSelector } from '../store/hooks';
import { useGetSubscriptionQuery } from '../store/api';
import { hasExamAccess } from '../utils/auth';

/**
 * Custom hook foydalanuvchining imtihon topshirish huquqini tekshiradi
 *
 * Avval subscription endpoint'ini tekshiradi (/users/me/subscription).
 * Agar API so'rov bo'lmasa yoki xato bo'lsa, fallback sifatida role-based tekshiradi.
 *
 * @returns hasAccess - true/false imtihon topshirish huquqi, isLoading - yuklash holati
 */
export const useHasExamAccess = () => {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  // Subscription endpoint chaqiramiz (faqat authenticated bo'lsa)
  const { data: subscription, isLoading, isError } = useGetSubscriptionQuery(undefined, {
    skip: !isAuthenticated, // Agar login qilmagan bo'lsa, API chaqirilmaydi
  });

  const hasAccess = useMemo(() => {
    // Agar API'dan javob kelgan bo'lsa, subscription status'ni qaytaramiz
    if (subscription !== undefined && !isError) {
      return subscription.isSubscribed;
    }

    // Fallback: Agar API xato bo'lsa yoki yuklanmagan bo'lsa, role-based tekshiramiz
    return hasExamAccess(user?.roles);
  }, [subscription, isError, user?.roles]);

  return {
    hasAccess,
    isLoading,
    subscription,
    roles: user?.roles || [],
  };
};
