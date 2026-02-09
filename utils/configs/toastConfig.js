import { toast, Slide } from 'react-toastify';

const TOAST_AUTO_CLOSE_MS = 2000;

const BASE_TOAST_OPTIONS = {
  position: 'top-right',
  autoClose: TOAST_AUTO_CLOSE_MS,
  hideProgressBar: true,
  closeOnClick: true,
  pauseOnHover: false,
  pauseOnFocusLoss: false,
  draggable: false,
  theme: 'dark',
};

// Global toast container sozlamalari
export const toastConfig = {
  ...BASE_TOAST_OPTIONS,
  transition: Slide,
  closeButton: false,
  newestOnTop: true,
  limit: 3,
};

const notify = (type, message, options) => {
  if (message === null || message === undefined) {
    return undefined;
  }
  const toastOptions = { ...BASE_TOAST_OPTIONS, ...options };
  const toastFn = type === 'default' ? toast : toast[type];
  return toastFn(message, toastOptions);
};

// Toast ko'rsatish funksiyalari
export const showToast = {
  success: (message, options) => notify('success', message, options),
  error: (message, options) => notify('error', message, options),
  warning: (message, options) => notify('warning', message, options),
  info: (message, options) => notify('info', message, options),
  default: (message, options) => notify('default', message, options),
  dismiss: toast.dismiss,
};

export default showToast;
