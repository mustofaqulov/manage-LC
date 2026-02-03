import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setLegacyUser, logout as logoutAction } from '../store/slices/authSlice';

/**
 * Custom hook for authentication state and actions
 * Provides centralized access to user state from Redux store
 */
export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { legacyUser, user, token, isAuthenticated, missingInfo } = useAppSelector((state) => state.auth);

  const login = useCallback((phone: string) => {
    const newUser = {
      id: 'usr_1',
      phone,
      isSubscribed: true,
      subscriptionExpiry: '2024-12-31',
    };
    dispatch(setLegacyUser(newUser));
  }, [dispatch]);

  const logout = useCallback(() => {
    dispatch(logoutAction());
  }, [dispatch]);

  // Return legacy user if API user is not available (backward compatibility)
  const currentUser = legacyUser;

  return {
    user: currentUser,
    apiUser: user,
    token,
    isAuthenticated,
    missingInfo,
    login,
    logout,
  };
};
