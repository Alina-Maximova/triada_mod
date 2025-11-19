import axios from 'axios';
import { API_BASE_URL } from '../constants';
import { AuthResponse, LoginData, RegisterData, Task, CreateTaskData } from '../types';
import * as SecureStore from 'expo-secure-store';
import { STORAGE_KEYS } from '../constants';

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

  register: async (data: RegisterData): Promise<AuthResponse> => {
    try {
      const response = await api.post('/auth/register', data);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Ошибка регистрации';
      console.log(message)
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

  // Дополнительные методы если нужны
  getProfile: async (): Promise<any> => {
    try {
      const response = await api.get('/auth/profile');
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Ошибка получения профиля';
      throw new Error(message);
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
   getTasksNew: async (): Promise<Task[]> => {
    try {
      const response = await api.get('/tasks/new');
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Ошибка загрузки задач';
      throw new Error(message);
    }
  },

  getTask: async (id: number): Promise<Task> => {
    try {
      const response = await api.get(`/tasks/${id}`);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Ошибка загрузки задачи';
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

  // Добавьте метод для задач по местоположению если нужно
  getTasksNearby: async (latitude: number, longitude: number, radius: number = 5): Promise<Task[]> => {
    try {
      const response = await api.get('/tasks/nearby', {
        params: { latitude, longitude, radius }
      });
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Ошибка загрузки ближайших задач';
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

  toggleTask: async (id: number): Promise<Task> => {
    try {
      const response = await api.patch(`/tasks/${id}/toggle`);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Ошибка обновления задачи';
      throw new Error(message);
    }
  },

  // // Альтернативный вариант если нет специального endpoint для toggle
  // toggleTaskAlternative: async (id: number): Promise<Task> => {
  //   try {
  //     // Сначала получаем текущую задачу
  //     const currentTask = await tasksAPI.getTask(id);
  //     // Затем обновляем статус
  //     return await tasksAPI.updateTask(id, { completed: !currentTask.completed });
  //   } catch (error: any) {
  //     const message = error.response?.data?.message || 'Ошибка обновления задачи';
  //     throw new Error(message);
  //   }
  // },
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