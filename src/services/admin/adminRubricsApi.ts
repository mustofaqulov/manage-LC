import { apiClient } from '../api';
import { AdminRubric, CreateRubricRequest, PagedResponse, PaginationQuery } from './types';

const withCleanParams = (params: Record<string, unknown>) => {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== ''),
  );
};

export interface ListAdminRubricsQuery extends PaginationQuery {
  skill?: string;
  cefrLevel?: string;
}

export const adminRubricsApi = {
  async list(query: ListAdminRubricsQuery = {}) {
    const response = await apiClient.get<PagedResponse<AdminRubric>>('/admin/rubrics', {
      params: withCleanParams({
        page: query.page ?? 0,
        size: query.size ?? 20,
        skill: query.skill,
        cefrLevel: query.cefrLevel,
      }),
    });

    return response.data;
  },

  async create(payload: CreateRubricRequest) {
    const response = await apiClient.post<AdminRubric>('/admin/rubrics', payload);
    return response.data;
  },

  async getById(rubricId: string) {
    const response = await apiClient.get<AdminRubric>(`/admin/rubrics/${rubricId}`);
    return response.data;
  },

  async remove(rubricId: string) {
    await apiClient.delete(`/admin/rubrics/${rubricId}`);
  },
};
