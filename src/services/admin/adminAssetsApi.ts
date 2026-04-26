import axios from 'axios';
import { apiClient } from '../api';
import {
  PresignDownloadRequest,
  PresignDownloadResponse,
  PresignUploadRequest,
  PresignUploadResponse,
} from './types';

export const adminAssetsApi = {
  async presignUpload(payload: PresignUploadRequest) {
    const response = await apiClient.post<PresignUploadResponse>('/assets/presign-upload', payload);
    return response.data;
  },

  async presignDownload(payload: PresignDownloadRequest) {
    const response = await apiClient.post<PresignDownloadResponse>('/assets/presign-download', payload);
    return response.data;
  },

  async getDownloadUrl(assetId: string) {
    const response = await apiClient.get<PresignDownloadResponse>(`/assets/${assetId}/download-url`);
    return response.data;
  },

  async uploadToPresignedUrl(uploadUrl: string, file: Blob, headers: Record<string, string> = {}) {
    return axios.put(uploadUrl, file, {
      headers: {
        'Content-Type': (file as File).type || 'application/octet-stream',
        ...headers,
      },
    });
  },
};
