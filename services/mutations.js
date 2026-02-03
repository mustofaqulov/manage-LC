import axiosClient from '../utils/configs/axiosConfig';
import { showToast } from '../utils/configs/toastConfig';

// ==================== AUTH MUTATIONS ====================

export const login = ({ phone, pinCode }) => {
  return axiosClient
    .post('/auth/login', { phone, pinCode })
    .then((response) => {
      // Token va user ma'lumotlarini saqlash
      localStorage.setItem('auth_token', response.data.token);
      localStorage.setItem('user_data', JSON.stringify(response.data));

      showToast.success('Tizimga muvaffaqiyatli kirdingiz');
      return response.data;
    })
    .catch((error) => {
      showToast.error('Login xatolik. Telefon va kodni tekshiring.');
      throw error;
    });
};

// ==================== USER MUTATIONS ====================

export const updateMe = (userData) => {
  return axiosClient
    .post('/users/me', userData)
    .then((response) => {
      // Yangilangan ma'lumotni saqlash
      localStorage.setItem('user_data', JSON.stringify(response.data));

      showToast.success('Ma\'lumotlar yangilandi');
      return response.data;
    })
    .catch((error) => {
      showToast.error('Ma\'lumotlarni yangilashda xatolik');
      throw error;
    });
};

// ==================== ATTEMPTS MUTATIONS ====================

export const startAttempt = ({ testId, sectionId }) => {
  return axiosClient
    .post('/attempts', { testId, sectionId })
    .then((response) => {
      showToast.success('Imtihon boshlandi');
      return response.data;
    })
    .catch((error) => {
      showToast.error('Imtihonni boshlashda xatolik');
      throw error;
    });
};

export const upsertResponse = ({ attemptId, questionId, answer }) => {
  return axiosClient
    .put(`/attempts/${attemptId}/responses`, { questionId, answer })
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      showToast.error('Javobni saqlashda xatolik');
      throw error;
    });
};

export const submitSection = ({ attemptId, sectionId }) => {
  return axiosClient
    .post(`/attempts/${attemptId}/sections/submit`, { sectionId })
    .then((response) => {
      showToast.success('Bo\'lim topshirildi');
      return response.data;
    })
    .catch((error) => {
      showToast.error('Bo\'limni topshirishda xatolik');
      throw error;
    });
};

export const submitAttempt = (attemptId) => {
  return axiosClient
    .post(`/attempts/${attemptId}/submit`)
    .then((response) => {
      showToast.success('Imtihon yakunlandi');
      return response.data;
    })
    .catch((error) => {
      showToast.error('Imtihonni topshirishda xatolik');
      throw error;
    });
};

// ==================== ASSETS MUTATIONS ====================

export const presignUpload = ({ assetType, mimeType, contextType, attemptId, questionId }) => {
  return axiosClient
    .post('/assets/presign-upload', {
      assetType,
      mimeType,
      contextType,
      attemptId,
      questionId,
    })
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      showToast.error('Fayl yuklash URL\'ini olishda xatolik');
      throw error;
    });
};

export const presignDownload = ({ assetId }) => {
  return axiosClient
    .post('/assets/presign-download', { assetId })
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      showToast.error('Fayl yuklab olish URL\'ini olishda xatolik');
      throw error;
    });
};

// ==================== S3 UPLOAD (DIRECT) ====================

export const uploadToS3 = ({ uploadUrl, file, headers }) => {
  return axiosClient
    .put(uploadUrl, file, {
      headers: {
        'Content-Type': file.type,
        ...headers,
      },
    })
    .then((response) => {
      showToast.success('Fayl yuklandi');
      return response;
    })
    .catch((error) => {
      showToast.error('Fayl yuklashda xatolik');
      throw error;
    });
};
