import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';

/**
 * Profile to'ldirishni majburlash komponenti
 *
 * Agar user login qilgan bo'lsa lekin firstName yoki lastName bo'sh bo'lsa,
 * uni /login sahifasiga qaytaradi (u yerda PROFILE step ko'rsatiladi)
 */
export const RequireProfile: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Faqat authenticated user'lar uchun tekshiramiz
    if (isAuthenticated && user) {
      // Agar firstName yoki lastName bo'sh bo'lsa
      const hasIncompleteProfile = !user.firstName?.trim() || !user.lastName?.trim();

      if (hasIncompleteProfile) {
        // Login sahifasida emas bo'lsak, login'ga qaytaramiz
        if (location.pathname !== '/login') {
          console.warn('⚠️ Profile incomplete, redirecting to login...');
          navigate('/login', { replace: true });
        }
      }
    }
  }, [isAuthenticated, user, location.pathname, navigate]);

  return <>{children}</>;
};
