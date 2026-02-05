import axiosClient from '../utils/configs/axiosConfig';

// ==================== USER QUERIES ====================

export const getMe = () => {
  return axiosClient
    .get('/users/me')
    .then((response) => {
      return response.data;
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
    });
};

export const getTest = (testId) => {
  return axiosClient
    .get(`/tests/${testId}`)
    .then((response) => {
      return response.data;
    });
};

export const getSection = ({ testId, sectionId }) => {
  return axiosClient
    .get(`/tests/${testId}/sections/${sectionId}`)
    .then((response) => {
      return response.data;
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
    });
};

export const getAttempt = (attemptId) => {
  return axiosClient
    .get(`/attempts/${attemptId}`)
    .then((response) => {
      return response.data;
    });
};

// ==================== ASSETS QUERIES ====================

export const getDownloadUrl = (assetId) => {
  return axiosClient
    .get(`/assets/${assetId}/download-url`)
    .then((response) => {
      return response.data;
    });
};
