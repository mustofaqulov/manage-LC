import axios from 'axios';
import { showToast } from './toastConfig';

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
    }
    return config;
  },
  (error) => {
    showToast.error('Request xatolik yuz berdi');
    return Promise.reject(error);
  }
);

// Response interceptor - xatoliklarni handle qilish
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      showToast.error('Sessiya tugadi. Qaytadan kiring.');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      window.location.href = '/login';
    } else if (status === 403) {
      showToast.error('Ruxsat yo\'q');
    } else if (status === 404) {
      showToast.error('Ma\'lumot topilmadi');
    } else if (status >= 500) {
      showToast.error('Server xatolik. Qaytadan urinib ko\'ring.');
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
