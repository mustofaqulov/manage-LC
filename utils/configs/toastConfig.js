import { toast, Slide } from 'react-toastify';

export const toastConfig = {
  position: 'top-right',
  autoClose: 3000,
  hideProgressBar: true,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: false,
  transition: Slide,
  theme: 'dark',
  closeButton: false,
  newestOnTop: true,
  limit: 3,
};

export const showToast = {
  success: (message) => toast.success(message),
  error: (message) => toast.error(message),
  warning: (message) => toast.warning(message),
  info: (message) => toast.info(message),
};
