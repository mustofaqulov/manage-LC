import { apiClient } from '../api';
import {
  AdminAttempt,
  AdminAttemptDetail,
  ListSubmissionsQuery,
  OverrideScoreRequest,
  PagedResponse,
  RegenerateAnalysisResponse,
  RescoreAttemptRequest,
  SpeakingAnalysis,
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
    const response = await apiClient.get<AdminAttemptDetail>(`/admin/submissions/${attemptId}`);
    return response.data;
  },

  async overrideScore(attemptId: string, payload: OverrideScoreRequest) {
    const response = await apiClient.post<void>(`/admin/submissions/${attemptId}/override`, payload);
    return response.data;
  },

  async rescore(attemptId: string, payload: RescoreAttemptRequest) {
    const response = await apiClient.post<void>(`/admin/submissions/${attemptId}/rescore`, payload);
    return response.data;
  },

  async getSpeakingAnalysis(attemptId: string) {
    const response = await apiClient.get<SpeakingAnalysis>(`/admin/submissions/${attemptId}/speaking-analysis`);
    return response.data;
  },

  async regenerateSpeakingAnalysis(attemptId: string) {
    const response = await apiClient.post<RegenerateAnalysisResponse>(
      `/admin/submissions/${attemptId}/speaking-analysis/regenerate`,
    );
    return response.data;
  },
};
