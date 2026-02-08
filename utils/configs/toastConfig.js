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

const buildToastOptions = (overrides = {}) => ({
  ...BASE_TOAST_OPTIONS,
  ...overrides,
});

const resolveAutoClose = (options = {}) => {
  if (Object.prototype.hasOwnProperty.call(options, 'autoClose')) {
    return options.autoClose;
  }
  return BASE_TOAST_OPTIONS.autoClose;
};

const scheduleDismiss = (toastId, options) => {
  const autoClose = resolveAutoClose(options);
  if (autoClose === false || autoClose === 0) {
    return;
  }
  const delayMs = Number.isFinite(autoClose) ? autoClose : TOAST_AUTO_CLOSE_MS;
  setTimeout(() => {
    toast.dismiss(toastId);
  }, delayMs + 100);
};

const notify = (type, message, options) => {
  if (message === null || message === undefined) {
    return undefined;
  }
  const toastOptions = buildToastOptions(options);
  const toastFn = type === 'default' ? toast : toast[type];
  const toastId = toastFn(message, toastOptions);
  scheduleDismiss(toastId, options);
  return toastId;
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
