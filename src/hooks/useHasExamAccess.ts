import { useMemo } from 'react';
import { useAppSelector } from '../store/hooks';
import { hasExamAccess } from '../utils/auth';

/**
 * Custom hook foydalanuvchining imtihon topshirish huquqini tekshiradi
 *
 * Redux store'dan foydalanuvchi role'larini olib,
 * hasExamAccess() utility funksiyasi orqali tekshiradi
 *
 * @returns hasAccess - true/false imtihon topshirish huquqi
 */
export const useHasExamAccess = () => {
  const { user } = useAppSelector((state) => state.auth);

  const hasAccess = useMemo(() => {
    return hasExamAccess(user?.roles);
  }, [user?.roles]);

  return {
    hasAccess,
    roles: user?.roles || [],
  };
};
