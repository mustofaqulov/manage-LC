import { apiClient } from '../api';
import {
  AdminSection,
  CreateSectionRequest,
  ReorderSectionAssetsRequest,
  UpdateSectionRequest,
} from './types';

export interface AddSectionAssetRequest {
  assetId: string;
  contextLabel?: string | null;
  orderIndex?: number;
}

export const adminSectionsApi = {
  async create(payload: CreateSectionRequest) {
    const response = await apiClient.post<AdminSection>('/admin/tests/sections', payload);
    return response.data;
  },

  async update(sectionId: string, payload: UpdateSectionRequest) {
    const response = await apiClient.put<AdminSection>(`/admin/tests/sections/${sectionId}`, payload);
    return response.data;
  },

  async remove(sectionId: string) {
    await apiClient.delete(`/admin/tests/sections/${sectionId}`);
  },

  async addAsset(sectionId: string, payload: AddSectionAssetRequest) {
    const response = await apiClient.post(`/admin/tests/sections/${sectionId}/assets`, payload);
    return response.data;
  },

  async reorderAssets(sectionId: string, payload: ReorderSectionAssetsRequest) {
    const response = await apiClient.post(`/admin/tests/sections/${sectionId}/assets/reorder`, payload);
    return response.data;
  },

  async removeAsset(sectionId: string, assetId: string) {
    await apiClient.delete(`/admin/tests/sections/${sectionId}/assets/${assetId}`);
  },
};
