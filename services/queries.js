import axiosClient from '../utils/configs/axiosConfig';
import { showToast } from '../utils/configs/toastConfig';

// ==================== USER QUERIES ====================

export const getMe = () => {
  return axiosClient
    .get('/users/me')
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      showToast.error('Foydalanuvchi ma\'lumotlari yuklanmadi');
      throw error;
    });
};

// ==================== TESTS QUERIES ====================

export const getTests = ({ level, page = 0, size = 20 }) => {
  return axiosClient
    .get('/tests', {
      params: { level, page, size },
    })
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      showToast.error('Testlar yuklanmadi');
      throw error;
    });
};

export const getTest = (testId) => {
  return axiosClient
    .get(`/tests/${testId}`)
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      showToast.error('Test yuklanmadi');
      throw error;
    });
};

export const getSection = ({ testId, sectionId }) => {
  return axiosClient
    .get(`/tests/${testId}/sections/${sectionId}`)
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      showToast.error('Bo\'lim yuklanmadi');
      throw error;
    });
};

// ==================== ATTEMPTS QUERIES ====================

export const getAttemptHistory = ({ page = 0, size = 20 }) => {
  return axiosClient
    .get('/attempts', {
      params: { page, size },
    })
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      showToast.error('Tarix yuklanmadi');
      throw error;
    });
};

export const getAttempt = (attemptId) => {
  return axiosClient
    .get(`/attempts/${attemptId}`)
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      showToast.error('Urinish ma\'lumotlari yuklanmadi');
      throw error;
    });
};

// ==================== ASSETS QUERIES ====================

export const getDownloadUrl = (assetId) => {
  return axiosClient
    .get(`/assets/${assetId}/download-url`)
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      showToast.error('Fayl yuklab olish havolasi olinmadi');
      throw error;
    });
};
