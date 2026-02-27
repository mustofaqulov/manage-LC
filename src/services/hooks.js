import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as queries from './queries';
import * as mutations from './mutations';
import { useTranslation } from '../i18n/useTranslation';
import { showToast } from '../utils/configs/toastConfig';

// ==================== QUERY KEYS ====================
export const QUERY_KEYS = {
  USER: 'user',
  TESTS: 'tests',
  TEST: 'test',
  SECTION: 'section',
  ATTEMPTS: 'attempts',
  ATTEMPT: 'attempt',
  DOWNLOAD_URL: 'downloadUrl',
};

// ==================== USER HOOKS ====================

export const useGetMe = () => {
  const { t } = useTranslation();
  return useQuery({
    queryKey: [QUERY_KEYS.USER],
    queryFn: queries.getMe,
    staleTime: 5 * 60 * 1000, // 5 minutes
    meta: { errorMessage: t('errors.loadFailed') },
  });
};

export const useUpdateMe = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: mutations.updateMe,
    onSuccess: (data) => {
      showToast.success(t('errors.profileUpdated'));
      // Cache'ni yangilash
      queryClient.setQueryData([QUERY_KEYS.USER], data);
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USER] });
    },
    onError: (error) => {
      const message = error?.response?.data?.message;
      if (message === 'Attempt cannot be modified in status: SCORED') {
        showToast.info('Imtihon baholandi');
        return;
      }
      showToast.error(t('errors.saveFailed'));
    },
  });
};

// ==================== AUTH HOOKS ====================

export const useLogin = () => {
  const { t } = useTranslation();
  return useMutation({
    mutationFn: mutations.login,
    onSuccess: () => {
      showToast.success(t('errors.loginSuccess'));
    },
    onError: () => {
      showToast.error(t('errors.loginFailed'));
    },
  });
};

// ==================== TESTS HOOKS ====================

export const useGetTests = ({ level, page, size } = {}) => {
  const { t } = useTranslation();
  return useQuery({
    queryKey: [QUERY_KEYS.TESTS, { level, page, size }],
    queryFn: () => queries.getTests({ level, page, size }),
    staleTime: 10 * 60 * 1000, // 10 minutes
    meta: { errorMessage: t('errors.loadFailed') },
  });
};

export const useGetTest = (testId, options = {}) => {
  const { t } = useTranslation();
  return useQuery({
    queryKey: [QUERY_KEYS.TEST, testId],
    queryFn: () => queries.getTest(testId),
    enabled: !!testId,
    staleTime: 10 * 60 * 1000,
    meta: { errorMessage: t('errors.loadFailed') },
    ...options,
  });
};

export const useGetSection = ({ testId, sectionId }, options = {}) => {
  const { t } = useTranslation();
  return useQuery({
    queryKey: [QUERY_KEYS.SECTION, testId, sectionId],
    queryFn: () => queries.getSection({ testId, sectionId }),
    enabled: !!testId && !!sectionId,
    staleTime: 10 * 60 * 1000,
    meta: { errorMessage: t('errors.loadFailed') },
    ...options,
  });
};

// ==================== ATTEMPTS HOOKS ====================

export const useStartAttempt = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: mutations.startAttempt,
    onSuccess: () => {
      showToast.success(t('errors.examStarted'));
      // Attempts list'ni yangilash
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ATTEMPTS] });
    },
    onError: (error) => {
      // 403 ni ExamFlow o'zi handle qiladi (toast + navigate)
      if (error?.response?.status === 403) return;
      showToast.error(t('errors.examStartFailed'));
    },
  });
};

export const useStartRandomAttempt = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: mutations.startRandomAttempt,
    onSuccess: () => {
      showToast.success(t('errors.examStarted'));
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ATTEMPTS] });
    },
    onError: (error) => {
      if (error?.response?.status === 403) return;
      showToast.error(t('errors.examStartFailed'));
    },
  });
};

export const useGetAttemptHistory = ({ page, size } = {}) => {
  const { t } = useTranslation();
  return useQuery({
    queryKey: [QUERY_KEYS.ATTEMPTS, { page, size }],
    queryFn: () => queries.getAttemptHistory({ page, size }),
    staleTime: 2 * 60 * 1000, // 2 minutes
    meta: { errorMessage: t('errors.loadFailed') },
  });
};

export const useGetAttempt = (attemptId, options = {}) => {
  const { t } = useTranslation();
  return useQuery({
    queryKey: [QUERY_KEYS.ATTEMPT, attemptId],
    queryFn: () => queries.getAttempt(attemptId),
    enabled: !!attemptId,
    staleTime: 30 * 1000, // 30 seconds
    meta: { errorMessage: t('errors.loadFailed') },
    ...options,
  });
};

export const useUpsertResponse = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: mutations.upsertResponse,
    onSuccess: (data, variables) => {
      // Attempt cache'ni yangilash
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.ATTEMPT, variables.attemptId]
      });
    },
    onError: (error) => {
      const message = error?.response?.data?.message;
      if (message === 'Attempt cannot be modified in status: SCORED') {
        showToast.info('Imtihon baholandi');
        return;
      }
      showToast.error(t('errors.saveFailed'));
    },
  });
};

export const useSubmitSection = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: mutations.submitSection,
    onSuccess: (data, variables) => {
      showToast.success(t('errors.sectionSubmitted'));
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.ATTEMPT, variables.attemptId]
      });
    },
    onError: () => {
      showToast.error(t('errors.sectionSubmitFailed'));
    },
  });
};

export const useSubmitAttempt = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: mutations.submitAttempt,
    onSuccess: (data, attemptId) => {
      showToast.success(t('errors.examFinished'));
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.ATTEMPT, attemptId]
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.ATTEMPTS]
      });
    },
    onError: () => {
      showToast.error(t('errors.examSubmitFailed'));
    },
  });
};

// ==================== ASSETS HOOKS ====================

export const usePresignUpload = () => {
  const { t } = useTranslation();
  return useMutation({
    mutationFn: mutations.presignUpload,
    onError: () => {
      showToast.error(t('errors.uploadFailed'));
    },
  });
};

export const usePresignDownload = () => {
  const { t } = useTranslation();
  return useMutation({
    mutationFn: mutations.presignDownload,
    onError: () => {
      showToast.error(t('errors.loadFailed'));
    },
  });
};

export const useGetDownloadUrl = (assetId, options = {}) => {
  const { t } = useTranslation();
  return useQuery({
    queryKey: [QUERY_KEYS.DOWNLOAD_URL, assetId],
    queryFn: () => queries.getDownloadUrl(assetId),
    enabled: !!assetId,
    staleTime: 5 * 60 * 1000,
    meta: { errorMessage: t('errors.loadFailed') },
    ...options,
  });
};

export const useUploadToS3 = () => {
  const { t } = useTranslation();
  return useMutation({
    mutationFn: mutations.uploadToS3,
    onSuccess: () => {
      showToast.success(t('errors.fileUploaded'));
    },
    onError: () => {
      showToast.error(t('errors.uploadFailed'));
    },
  });
};


