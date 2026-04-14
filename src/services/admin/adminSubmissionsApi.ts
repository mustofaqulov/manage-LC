import { apiClient } from '../api';
import {
  AdminAttempt,
  ListSubmissionsQuery,
  OverrideScoreRequest,
  PagedResponse,
  RescoreAttemptRequest,
} from './types';

const withCleanParams = (params: Record<string, unknown>) => {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== ''),
  );
};

export const adminSubmissionsApi = {
  async list(query: ListSubmissionsQuery = {}) {
    const response = await apiClient.get<PagedResponse<AdminAttempt>>('/admin/submissions', {
      params: withCleanParams({
        page: query.page ?? 0,
        size: query.size ?? 20,
        status: query.status,
        testId: query.testId,
        userId: query.userId,
      }),
    });

    return response.data;
  },

  async getById(attemptId: string) {
    const response = await apiClient.get<AdminAttempt>(`/admin/submissions/${attemptId}`);
    return response.data;
  },

  async overrideScore(attemptId: string, payload: OverrideScoreRequest) {
    const response = await apiClient.post(`/admin/submissions/${attemptId}/override`, payload);
    return response.data;
  },

  async rescore(attemptId: string, payload: RescoreAttemptRequest) {
    const response = await apiClient.post(`/admin/submissions/${attemptId}/rescore`, payload);
    return response.data;
  },

  async getSpeakingAnalysis(attemptId: string) {
    const response = await apiClient.get(`/admin/submissions/${attemptId}/speaking-analysis`);
    return response.data;
  },

  async regenerateSpeakingAnalysis(attemptId: string) {
    const response = await apiClient.post(`/admin/submissions/${attemptId}/speaking-analysis/regenerate`);
    return response.data;
  },
};
