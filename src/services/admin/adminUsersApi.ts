import { apiClient } from '../api';
import {
  AdminUser,
  GrantAccessRequest,
  ListUsersQuery,
  PagedResponse,
  UpdateRolesRequest,
} from './types';

const withCleanParams = (params: Record<string, unknown>) => {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== ''),
  );
};

export const adminUsersApi = {
  async list(query: ListUsersQuery = {}) {
    const response = await apiClient.get<PagedResponse<AdminUser>>('/admin/users', {
      params: withCleanParams({
        page: query.page ?? 0,
        size: query.size ?? 20,
        role: query.role,
        search: query.search,
        isActive: query.isActive,
      }),
    });

    return response.data;
  },

  async getById(userId: string) {
    const response = await apiClient.get<AdminUser>(`/admin/users/${userId}`);
    return response.data;
  },

  async remove(userId: string) {
    await apiClient.delete(`/admin/users/${userId}`);
  },

  async block(userId: string) {
    const response = await apiClient.post(`/admin/users/${userId}/block`);
    return response.data;
  },

  async unblock(userId: string) {
    const response = await apiClient.post(`/admin/users/${userId}/unblock`);
    return response.data;
  },

  async grantAccess(userId: string, payload: GrantAccessRequest) {
    const response = await apiClient.post(`/admin/users/${userId}/grant-access`, payload);
    return response.data;
  },

  async removeAccess(userId: string) {
    const response = await apiClient.post(`/admin/users/${userId}/remove-access`);
    return response.data;
  },

  async updateRoles(userId: string, payload: UpdateRolesRequest) {
    const response = await apiClient.put(`/admin/users/${userId}/roles`, payload);
    return response.data;
  },

  async listAttempts(userId: string, query: { page?: number; size?: number; search?: string } = {}) {
    const response = await apiClient.get(`/admin/users/${userId}/attempts`, {
      params: withCleanParams({
        page: query.page ?? 0,
        size: query.size ?? 20,
        search: query.search,
      }),
    });
    return response.data;
  },

  async getAttemptDetail(userId: string, attemptId: string) {
    const response = await apiClient.get(`/admin/users/${userId}/attempts/${attemptId}`);
    return response.data;
  },
};
