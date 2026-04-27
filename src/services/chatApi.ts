import { apiClient } from './api';

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string | null;
  userPhone: string;
  isPremium: boolean;
  isAdmin: boolean;
  content: string;
  imageAssetId: string | null;
  imageUrl: string | null;
  createdAt: string;
}

export interface ChatMute {
  id: string;
  userId: string;
  userName: string | null;
  userPhone: string;
  mutedUntil: string | null;
  reason: string | null;
  createdAt: string;
}

export const chatApi = {
  async listMessages(params: { limit?: number; beforeId?: string } = {}) {
    const response = await apiClient.get<ChatMessage[]>('/chat/messages', { params });
    return response.data;
  },

  async listSince(since: string) {
    const response = await apiClient.get<ChatMessage[]>('/chat/messages/since', { params: { since } });
    return response.data;
  },

  async sendMessage(payload: { content: string; imageAssetId?: string | null }) {
    const response = await apiClient.post<ChatMessage>('/chat/messages', payload);
    return response.data;
  },

  async deleteMessage(messageId: string) {
    await apiClient.delete(`/admin/chat/messages/${messageId}`);
  },

  async muteUser(userId: string, payload: { durationMinutes?: number | null; reason?: string | null }) {
    const response = await apiClient.post(`/admin/chat/mute/${userId}`, payload);
    return response.data;
  },

  async unmuteUser(userId: string) {
    await apiClient.post(`/admin/chat/unmute/${userId}`);
  },

  async listMutes() {
    const response = await apiClient.get<ChatMute[]>('/admin/chat/mutes');
    return response.data;
  },
};
