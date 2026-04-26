import axios from 'axios';
import axiosClient from '../utils/configs/axiosConfig';

// ==================== AUTH MUTATIONS ====================

export const login = ({ phone, pinCode }) => {
  return axiosClient
    .post('/auth/login', { phone, pinCode })
    .then((response) => {
      // Token va user ma'lumotlarini saqlash
      localStorage.setItem('auth_token', response.data.token);
      localStorage.setItem('user_data', JSON.stringify(response.data));
      return response.data;
    });
};

// ==================== USER MUTATIONS ====================

export const updateMe = (userData) => {
  return axiosClient
    .post('/users/me', userData)
    .then((response) => {
      // Yangilangan ma'lumotni saqlash
      localStorage.setItem('user_data', JSON.stringify(response.data));
      return response.data;
    });
};

// ==================== ATTEMPTS MUTATIONS ====================

export const startAttempt = ({ testId, sectionId }) => {
  return axiosClient
    .post('/attempts', { testId, sectionId })
    .then((response) => {
      return response.data;
    });
};

export const startRandomAttempt = ({ cefrLevel, sectionCount, skills, sourceTestIds }) => {
  const payload = { cefrLevel };
  if (typeof sectionCount === 'number') {
    payload.sectionCount = sectionCount;
  }
  if (Array.isArray(skills) && skills.length > 0) {
    payload.skills = skills;
  }
  if (Array.isArray(sourceTestIds) && sourceTestIds.length > 0) {
    payload.sourceTestIds = sourceTestIds;
  }

  return axiosClient
    .post('/attempts/random', payload)
    .then((response) => {
      return response.data;
    });
};

export const upsertResponse = ({ attemptId, questionId, answer }) => {
  return axiosClient
    .put(`/attempts/${attemptId}/responses`, { questionId, answer })
    .then((response) => {
      return response.data;
    });
};

export const submitSection = ({ attemptId, sectionId }) => {
  return axiosClient
    .post(`/attempts/${attemptId}/sections/submit`, { sectionId })
    .then((response) => {
      return response.data;
    });
};

export const submitAttempt = (attemptId) => {
  return axiosClient
    .post(`/attempts/${attemptId}/submit`)
    .then((response) => {
      return response.data;
    });
};

export const cancelAttempt = (attemptId) => {
  return axiosClient
    .post(`/attempts/${attemptId}/cancel`)
    .then((response) => {
      return response.data;
    });
};

// ==================== ASSETS MUTATIONS ====================

export const presignUpload = ({ assetType, mimeType, contextType, attemptId, questionId, filename, fileSizeBytes }) => {
  return axiosClient
    .post('/assets/presign-upload', {
      assetType,
      mimeType,
      contextType,
      attemptId,
      questionId,
      filename,
      fileSizeBytes,
    })
    .then((response) => {
      return response.data;
    });
};

export const presignDownload = ({ assetId, bucket, s3Key }) => {
  return axiosClient
    .post('/assets/presign-download', { assetId, bucket, s3Key })
    .then((response) => {
      return response.data;
    });
};

// ==================== S3 UPLOAD (DIRECT) ====================

export const uploadToS3 = ({ uploadUrl, file, headers }) => {
  return axios
    .put(uploadUrl, file, {
      headers: {
        'Content-Type': file.type,
        ...headers,
      },
    })
    .then((response) => {
      return response;
    })
    .catch((error) => {
      throw error;
    });
};

