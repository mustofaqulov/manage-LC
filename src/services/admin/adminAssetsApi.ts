import axios from 'axios';
import { apiClient } from '../api';
import { PresignDownloadRequest, PresignUploadRequest } from './types';

export const adminAssetsApi = {
  async presignUpload(payload: PresignUploadRequest) {
    const response = await apiClient.post('/assets/presign-upload', payload);
    return response.data;
  },

  async presignDownload(payload: PresignDownloadRequest) {
    const response = await apiClient.post('/assets/presign-download', payload);
    return response.data;
  },

  async getDownloadUrl(assetId: string) {
    const response = await apiClient.get(`/assets/${assetId}/download-url`);
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
