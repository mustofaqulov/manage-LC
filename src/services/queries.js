import axiosClient from '../utils/configs/axiosConfig';

// ==================== USER QUERIES ====================

export const getMe = () => {
  return axiosClient
    .get('/users/me')
    .then((response) => {
      return response.data;
    });
};

export const getAdminUsers = ({
  isActive,
  page = 0,
  role,
  search,
  size = 20,
} = {}) => {
  const params = { page, size };
  if (typeof isActive === 'boolean') params.isActive = isActive;
  if (role) params.role = role;
  if (search) params.search = search;

  return axiosClient
    .get('/admin/users', { params })
    .then((response) => {
      return response.data;
    });
};

// ==================== TESTS QUERIES ====================

export const getTests = ({
  level,
  page = 0,
  size = 20,
  popularity,
  rating,
  search,
  sortBy = 'PUBLISHED_DATE',
  sortOrder = 'DESC',
} = {}) => {
  return axiosClient
    .get('/tests', {
      params: { level, page, size, popularity, rating, search, sortBy, sortOrder },
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

export const getAttemptHistory = ({ page = 0, size = 10, search, status, cefrLevel, sortBy, sortOrder } = {}) => {
  const params = { page, size };
  if (search) params.search = search;
  if (status) params.status = status;
  if (cefrLevel) params.cefrLevel = cefrLevel;
  if (sortBy) params.sortBy = sortBy;
  if (sortOrder) params.sortOrder = sortOrder;
  return axiosClient
    .get('/attempts', { params })
    .then((response) => response.data);
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

// ==================== SPEAKING ANALYSIS QUERIES ====================

export const getSpeakingAnalysis = (attemptId) => {
  return axiosClient
    .get(`/attempts/${attemptId}/speaking-analysis`)
    .then((response) => {
      return response.data;
    });
};

