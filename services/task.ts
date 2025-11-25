import axios from 'axios';
import { API_BASE_URL, STORAGE_KEYS } from '@/constants';
import { AuthResponse, LoginData, Task, CreateTaskData } from '../types';
import * as SecureStore from 'expo-secure-store';

// Создаем экземпляр axios с базовым URL
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

// Интерцептор для обработки ошибок
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Токен невалидный, разлогиниваем пользователя
      SecureStore.deleteItemAsync(STORAGE_KEYS.AUTH_TOKEN);
      SecureStore.deleteItemAsync(STORAGE_KEYS.USER_DATA);
    }
    return Promise.reject(error);
  }
);

// API функции для аутентификации
export const authAPI = {
  login: async (data: LoginData): Promise<AuthResponse> => {
    try {

      const response = await api.post('/auth/login', data);
      return response.data;
    } catch (error: any) {
      console.log(error)
      const message = error.response?.data || 'Ошибка входа';
      throw new Error(message);
    }
  },



  logout: async (): Promise<void> => {
    try {

    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      console.log(";lkj")
      // Всегда очищаем локальное хранилище
      await SecureStore.deleteItemAsync(STORAGE_KEYS.AUTH_TOKEN);
      await SecureStore.deleteItemAsync(STORAGE_KEYS.USER_DATA);
    }
  },


};

// API функции для задач
export const tasksAPI = {
  getTasks: async (): Promise<Task[]> => {
    try {
      const response = await api.get('/tasks');
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Ошибка загрузки задач';
      throw new Error(message);
    }
  },


  createTask: async (data: CreateTaskData): Promise<Task> => {
    try {
      console.log('Creating task with data:', data);
      const response = await api.post('/tasks', data);
      console.log('Raw response:', response.data);

      return response.data
    } catch (error: any) {
      console.log('Create task error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });

      const message = error.response?.data?.message ||
        error.response?.data?.error ||
        error.response?.data ||
        'Ошибка создания задачи';
      throw new Error(message);
    }
  },

  updateTask: async (id: number, data: Partial<Task>): Promise<Task> => {
    try {
      const response = await api.put(`/tasks/${id}`, data);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Ошибка обновления задачи';
      throw new Error(message);
    }
  },
  updateTaskStatus: async (id: number, data: Object): Promise<Task> => {
    try {
      const response = await api.put(`/tasks/status/${id}`, data);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Ошибка обновления задачи';
      throw new Error(message);
    }
  },

  deleteTask: async (id: number): Promise<void> => {
    try {
      await api.delete(`/tasks/${id}`);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Ошибка удаления задачи';
      throw new Error(message);
    }
  },
};

// Функция для проверки доступности API
export const checkAPIHealth = async (): Promise<boolean> => {
  try {
    const response = await api.get('/health');
    return response.status === 200;
  } catch (error) {
    console.warn('Real API is not available, using mock data');
    return false;
  }
};

// Экспортируем axios instance для кастомных запросов
export { api };

export default api;