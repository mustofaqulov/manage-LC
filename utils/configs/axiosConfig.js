import axios from 'axios';
import { toast } from 'react-toastify';

const BASE_URL = 'https://api.managelc.uz';

// Axios client yaratish
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
    toast.error('Request xatolik yuz berdi');
    return Promise.reject(error);
  }
);

// Response interceptor - xatoliklarni handle qilish
axiosClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // 401 - token muddati tugagan
    if (error.response && error.response.status === 401) {
      toast.error('Sessiya tugadi. Qaytadan kiring.');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      window.location.href = '/login';
    }

    // 403 - ruxsat yo'q
    if (error.response && error.response.status === 403) {
      toast.error('Ruxsat yo\'q');
    }

    // 404 - topilmadi
    if (error.response && error.response.status === 404) {
      toast.error('Ma\'lumot topilmadi');
    }

    // 500 - server xatolik
    if (error.response && error.response.status >= 500) {
      toast.error('Server xatolik. Qaytadan urinib ko\'ring.');
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
