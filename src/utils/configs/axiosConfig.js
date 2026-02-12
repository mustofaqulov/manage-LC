import axios from 'axios';

const BASE_URL = 'https://api.managelc.uz';

const axiosClient = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - har bir request'ga token qo'shish
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log(`🌐 [${config.method?.toUpperCase()}] ${config.url} - Token: ${token.substring(0, 20)}...`);
    } else {
      console.warn(`⚠️ [${config.method?.toUpperCase()}] ${config.url} - NO TOKEN!`);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - xatoliklarni handle qilish
let isRedirecting = false;

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url;

    console.error(`❌ API Error [${status}] ${url}:`, error.response?.data);

    if (status === 401 && !isRedirecting) {
      console.error('🚫 401 Unauthorized - Redirecting to /login');
      isRedirecting = true;
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      window.location.href = '/login';
    }

    if (status === 403) {
      console.error('🚫 403 Forbidden - Access denied');
    }
    // 403, 404, 500+ — toast'lar hooks.js'da i18n orqali ko'rsatiladi

    return Promise.reject(error);
  }
);

export default axiosClient;

