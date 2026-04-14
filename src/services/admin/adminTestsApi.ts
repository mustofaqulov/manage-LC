import { apiClient } from '../api';
import {
  AdminTest,
  CreateTestRequest,
  PagedResponse,
  PaginationQuery,
  ReorderSectionsRequest,
  TestStatus,
  UpdateTestRequest,
} from './types';

export interface ListAdminTestsQuery extends PaginationQuery {
  status?: TestStatus | '';
}

export const adminTestsApi = {
  async list(query: ListAdminTestsQuery = {}) {
    const params: Record<string, unknown> = {
      page: query.page ?? 0,
      size: query.size ?? 20,
    };

    // Backend expects nullable enum for status. Do not send empty string.
    if (query.status) {
      params.status = query.status;
    }

    const response = await apiClient.get<PagedResponse<AdminTest>>('/admin/tests', {
      params,
    });

    return response.data;
  },

  async create(payload: CreateTestRequest) {
    const response = await apiClient.post<AdminTest>('/admin/tests', payload);
    return response.data;
  },

  async getById(testId: string) {
    const response = await apiClient.get<AdminTest>(`/admin/tests/${testId}`);
    return response.data;
  },

  async update(testId: string, payload: UpdateTestRequest) {
    const response = await apiClient.put<AdminTest>(`/admin/tests/${testId}`, payload);
    return response.data;
  },

  async remove(testId: string) {
    await apiClient.delete(`/admin/tests/${testId}`);
  },

  async publish(testId: string) {
    const response = await apiClient.post<AdminTest>(`/admin/tests/${testId}/publish`);
    return response.data;
  },

  async archive(testId: string) {
    const response = await apiClient.post<AdminTest>(`/admin/tests/${testId}/archive`);
    return response.data;
  },

  async createNewVersion(testId: string) {
    const response = await apiClient.post<AdminTest>(`/admin/tests/${testId}/new-version`);
    return response.data;
  },

  async reorderSections(testId: string, payload: ReorderSectionsRequest) {
    const response = await apiClient.post(`/admin/tests/${testId}/sections/reorder`, payload);
    return response.data;
  },
};
