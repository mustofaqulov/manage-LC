import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { LoginResponse, UserResponse } from '../../api/types';
import { api } from '../api';

// Extended user state that includes both API user and legacy user fields
interface AuthState {
  user: UserResponse | null;
  token: string | null;
  isAuthenticated: boolean;
  missingInfo: boolean;
  // Legacy user fields for backward compatibility
  legacyUser: {
    id: string;
    phone: string;
    isSubscribed: boolean;
    subscriptionExpiry?: string;
  } | null;
}

// Initialize from localStorage
const getInitialUser = (): UserResponse | null => {
  try {
    const userData = localStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
  } catch {
    return null;
  }
};

const getInitialLegacyUser = () => {
  try {
    const legacyData = localStorage.getItem('manage_lc_user');
    return legacyData ? JSON.parse(legacyData) : null;
  } catch {
    return null;
  }
};

const initialState: AuthState = {
  user: getInitialUser(),
  token: localStorage.getItem('auth_token'),
  isAuthenticated: !!localStorage.getItem('auth_token') || !!getInitialLegacyUser(),
  missingInfo: false,
  legacyUser: getInitialLegacyUser(),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ user: UserResponse; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      localStorage.setItem('auth_token', action.payload.token);
      localStorage.setItem('user_data', JSON.stringify(action.payload.user));
    },
    // Legacy user actions for backward compatibility
    setLegacyUser: (state, action: PayloadAction<{ id: string; phone: string; isSubscribed: boolean; subscriptionExpiry?: string }>) => {
      state.legacyUser = action.payload;
      state.isAuthenticated = true;
      localStorage.setItem('manage_lc_user', JSON.stringify(action.payload));
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.legacyUser = null;
      state.isAuthenticated = false;
      state.missingInfo = false;
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      localStorage.removeItem('manage_lc_user');
    },
    setMissingInfo: (state, action: PayloadAction<boolean>) => {
      state.missingInfo = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Login mutation
    builder.addMatcher(api.endpoints.login.matchFulfilled, (state, { payload }) => {
      state.token = payload.token;
      state.isAuthenticated = true;
      state.missingInfo = payload.missingInfo;
      localStorage.setItem('auth_token', payload.token);
    });

    // Get me query
    builder.addMatcher(api.endpoints.getMe.matchFulfilled, (state, { payload }) => {
      state.user = payload;
      localStorage.setItem('user_data', JSON.stringify(payload));
    });

    // Update me mutation
    builder.addMatcher(api.endpoints.updateMe.matchFulfilled, (state, { payload }) => {
      state.user = payload;
      state.missingInfo = false;
      localStorage.setItem('user_data', JSON.stringify(payload));
    });
  },
});

export const { setCredentials, setLegacyUser, logout, setMissingInfo } = authSlice.actions;
export default authSlice.reducer;
