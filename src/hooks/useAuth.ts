import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { logout as logoutAction } from '../store/slices/authSlice';

/**
 * Custom hook for authentication state and actions
 * Provides centralized access to user state from Redux store
 */
export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { legacyUser, user, token, isAuthenticated, missingInfo } = useAppSelector((state) => state.auth);

  const logout = useCallback(() => {
    dispatch(logoutAction());
  }, [dispatch]);

  return {
    user: user ?? legacyUser,
    token,
    isAuthenticated,
    missingInfo,
    logout,
  };
};
