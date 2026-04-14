import axios, { AxiosError, AxiosInstance } from 'axios';

const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ||
  'https://api.managelc.uz';

let isUnauthorizedRedirecting = false;

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status;

    if (status === 401 && !isUnauthorizedRedirecting) {
      isUnauthorizedRedirecting = true;
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  },
);

export interface ApiErrorPayload {
  message?: string;
  error?: string;
  statusCode?: number;
  [key: string]: unknown;
}

export const extractApiErrorMessage = (error: unknown, fallback = 'Unexpected API error') => {
  const axiosError = error as AxiosError<ApiErrorPayload>;
  const payload = axiosError.response?.data;

  if (payload?.message && typeof payload.message === 'string') {
    return payload.message;
  }

  if (Array.isArray(payload?.message) && payload.message.length > 0) {
    return payload.message.join(', ');
  }

  if (payload?.error && typeof payload.error === 'string') {
    return payload.error;
  }

  if (axiosError.message) {
    return axiosError.message;
  }

  return fallback;
};
