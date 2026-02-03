import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as queries from './queries';
import * as mutations from './mutations';

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
  return useQuery({
    queryKey: [QUERY_KEYS.USER],
    queryFn: queries.getMe,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useUpdateMe = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: mutations.updateMe,
    onSuccess: (data) => {
      // Cache'ni yangilash
      queryClient.setQueryData([QUERY_KEYS.USER], data);
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USER] });
    },
  });
};

// ==================== AUTH HOOKS ====================

export const useLogin = () => {
  return useMutation({
    mutationFn: mutations.login,
  });
};

// ==================== TESTS HOOKS ====================

export const useGetTests = ({ level, page, size } = {}) => {
  return useQuery({
    queryKey: [QUERY_KEYS.TESTS, { level, page, size }],
    queryFn: () => queries.getTests({ level, page, size }),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useGetTest = (testId, options = {}) => {
  return useQuery({
    queryKey: [QUERY_KEYS.TEST, testId],
    queryFn: () => queries.getTest(testId),
    enabled: !!testId,
    staleTime: 10 * 60 * 1000,
    ...options,
  });
};

export const useGetSection = ({ testId, sectionId }, options = {}) => {
  return useQuery({
    queryKey: [QUERY_KEYS.SECTION, testId, sectionId],
    queryFn: () => queries.getSection({ testId, sectionId }),
    enabled: !!testId && !!sectionId,
    staleTime: 10 * 60 * 1000,
    ...options,
  });
};

// ==================== ATTEMPTS HOOKS ====================

export const useStartAttempt = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: mutations.startAttempt,
    onSuccess: () => {
      // Attempts list'ni yangilash
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ATTEMPTS] });
    },
  });
};

export const useGetAttemptHistory = ({ page, size } = {}) => {
  return useQuery({
    queryKey: [QUERY_KEYS.ATTEMPTS, { page, size }],
    queryFn: () => queries.getAttemptHistory({ page, size }),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useGetAttempt = (attemptId, options = {}) => {
  return useQuery({
    queryKey: [QUERY_KEYS.ATTEMPT, attemptId],
    queryFn: () => queries.getAttempt(attemptId),
    enabled: !!attemptId,
    staleTime: 30 * 1000, // 30 seconds
    ...options,
  });
};

export const useUpsertResponse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: mutations.upsertResponse,
    onSuccess: (data, variables) => {
      // Attempt cache'ni yangilash
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.ATTEMPT, variables.attemptId]
      });
    },
  });
};

export const useSubmitSection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: mutations.submitSection,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.ATTEMPT, variables.attemptId]
      });
    },
  });
};

export const useSubmitAttempt = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: mutations.submitAttempt,
    onSuccess: (data, attemptId) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.ATTEMPT, attemptId]
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.ATTEMPTS]
      });
    },
  });
};

// ==================== ASSETS HOOKS ====================

export const usePresignUpload = () => {
  return useMutation({
    mutationFn: mutations.presignUpload,
  });
};

export const usePresignDownload = () => {
  return useMutation({
    mutationFn: mutations.presignDownload,
  });
};

export const useGetDownloadUrl = (assetId, options = {}) => {
  return useQuery({
    queryKey: [QUERY_KEYS.DOWNLOAD_URL, assetId],
    queryFn: () => queries.getDownloadUrl(assetId),
    enabled: !!assetId,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

export const useUploadToS3 = () => {
  return useMutation({
    mutationFn: mutations.uploadToS3,
  });
};
