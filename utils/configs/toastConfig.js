import { toast } from 'react-toastify';

// Custom toast configuration with project design
export const toastConfig = {
  position: 'top-right',
  autoClose: 4000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  theme: 'dark',
  style: {
    background: 'linear-gradient(135deg, rgba(20, 20, 20, 0.98) 0%, rgba(10, 10, 10, 0.98) 100%)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 115, 0, 0.2)',
    borderRadius: '16px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8), 0 0 30px rgba(255, 115, 0, 0.15)',
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: '500',
  },
  progressStyle: {
    background: 'linear-gradient(90deg, #ff7300 0%, #ffa500 100%)',
  },
};

// Custom toast methods with default config
export const showToast = {
  success: (message) => {
    toast.success(message, {
      ...toastConfig,
      icon: '✅',
      style: {
        ...toastConfig.style,
        border: '1px solid rgba(34, 197, 94, 0.3)',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8), 0 0 30px rgba(34, 197, 94, 0.2)',
      },
      progressStyle: {
        background: 'linear-gradient(90deg, #22c55e 0%, #4ade80 100%)',
      },
    });
  },
  error: (message) => {
    toast.error(message, {
      ...toastConfig,
      icon: '❌',
      style: {
        ...toastConfig.style,
        border: '1px solid rgba(239, 68, 68, 0.3)',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8), 0 0 30px rgba(239, 68, 68, 0.2)',
      },
      progressStyle: {
        background: 'linear-gradient(90deg, #ef4444 0%, #f87171 100%)',
      },
    });
  },
  warning: (message) => {
    toast.warning(message, {
      ...toastConfig,
      icon: '⚠️',
      style: {
        ...toastConfig.style,
        border: '1px solid rgba(251, 191, 36, 0.3)',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8), 0 0 30px rgba(251, 191, 36, 0.2)',
      },
      progressStyle: {
        background: 'linear-gradient(90deg, #fbbf24 0%, #fcd34d 100%)',
      },
    });
  },
  info: (message) => {
    toast.info(message, {
      ...toastConfig,
      icon: 'ℹ️',
      style: {
        ...toastConfig.style,
        border: '1px solid rgba(59, 130, 246, 0.3)',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8), 0 0 30px rgba(59, 130, 246, 0.2)',
      },
      progressStyle: {
        background: 'linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%)',
      },
    });
  },
};
