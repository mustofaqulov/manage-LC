import { apiClient } from '../api';
import { AdminQuestion, CreateQuestionRequest, UpdateQuestionRequest } from './types';

export const adminQuestionsApi = {
  async create(payload: CreateQuestionRequest) {
    const response = await apiClient.post<AdminQuestion>('/admin/questions', payload);
    return response.data;
  },

  async update(questionId: string, payload: UpdateQuestionRequest) {
    const response = await apiClient.put<AdminQuestion>(`/admin/questions/${questionId}`, payload);
    return response.data;
  },

  async remove(questionId: string) {
    await apiClient.delete(`/admin/questions/${questionId}`);
  },
};
