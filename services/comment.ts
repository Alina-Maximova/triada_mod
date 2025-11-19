import { API_BASE_URL, STORAGE_KEYS } from '@/constants';
import { Comment, CreateCommentData } from '@/types';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';


const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Интерцептор для добавления токена к запросам
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync(STORAGE_KEYS.AUTH_TOKEN);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const commentsAPI = {
  getTaskComments: async (taskId: number): Promise<Comment[]> => {
    try {
      const response = await api.get(`/comments/task/${taskId}`);
      console.log(api)
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Ошибка загрузки комментариев';
      throw new Error(message);
    }
  },   

  addComment: async (data: CreateCommentData): Promise<Comment> => {
    try {
      console.log('Sending comment data:', data);
      const response = await api.post('/comments', data);
      return response.data;
    } catch (error: any) {
      console.log('Error adding comment:', error);
      const message = error.response?.data?.message || 'Ошибка добавления комментария';
      throw new Error(message);
    }
  },

  deleteComment: async (id: number): Promise<void> => {
    try {
      await api.delete(`/comments/${id}`);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Ошибка удаления комментария';
      throw new Error(message);
    }
  },
};