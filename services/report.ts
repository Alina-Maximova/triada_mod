// services/reportService.ts
import { Report, CreateReportData } from '@/types/index';
import { API_BASE_URL } from '../constants';

export const reportService = {
  // Создание отчета
  async createReport(reportData: CreateReportData): Promise<Report> {
    try {
      const response = await fetch(`${API_BASE_URL}/reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reportData),
      });

      if (!response.ok) {
        const errorText = await response.json();
        console.log(errorText.error)
        console.error('Ошибка при создании отчета:', errorText.error);
        throw new Error(errorText.error);
      }

      return await response.json();
    } catch (error) {
      console.error('Ошибка в createReport:', error);
      throw error;
    }
  },

  // Получение всех отчетов
  async getReports(): Promise<Report[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/reports`);
      
      if (!response.ok) {
        throw new Error(`Ошибка при получении отчетов: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Ошибка в getReports:', error);
      throw error;
    }
  },

  // Получение отчетов по диапазону дат
  async getReportsByDateRange(startDate: string, endDate: string): Promise<Report[]> {
    console.log(startDate, endDate)
    try {
      const response = await fetch(
        `${API_BASE_URL}/reports/date-range?start_date=${startDate}&end_date=${endDate}`
      );
      
      if (!response.ok) {
        throw new Error(`Ошибка при получении отчетов по датам: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Ошибка в getReportsByDateRange:', error);
      throw error;
    }
  },

  // Получение отчета по ID задачи
  async getReportByTaskId(taskId: number): Promise<Report> {
    try {
      const response = await fetch(`${API_BASE_URL}/reports/task/${taskId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Отчет для данной задачи не найден');
        }
        throw new Error(`Ошибка при получении отчета: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      // console.error('Ошибка в getReportByTaskIdдвдвд:', error);
      throw error;
    }
  },

  // Получение отчета по ID
  async getReportById(id: number): Promise<Report> {
    try {
      const response = await fetch(`${API_BASE_URL}/reports/${id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Отчет не найден');
        }
        throw new Error(`Ошибка при получении отчета: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Ошибка в getReportById:', error);
      throw error;
    }
  },

  // Обновление отчета
  async updateReport(id: number, reportData: Partial<Report>): Promise<Report> {
    try {
      const response = await fetch(`${API_BASE_URL}/reports/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reportData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Ошибка при обновлении отчета:', errorText);
        throw new Error(`Ошибка при обновлении отчета: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Ошибка в updateReport:', error);
      throw error;
    }
  },

  // Удаление отчета
  async deleteReport(id: number): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/reports/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Ошибка при удалении отчета:', errorText);
        throw new Error(`Ошибка при удалении отчета: ${response.status}`);
      }
    } catch (error) {
      console.error('Ошибка в deleteReport:', error);
      throw error;
    }
  },

  // Загрузка фото для React Native
  async uploadPhotos(photos: any[]): Promise<string[]> {
    try {
      console.log('reportService: Начинаем загрузку фото:', photos.length);
      
      const formData = new FormData();
      
      // Добавляем все фото в FormData в правильном формате для React Native
      photos.forEach((photo, index) => {
        formData.append('photos', {
          uri: photo.uri,
          name: photo.name || `photo-${Date.now()}-${index}.jpg`,
          type: photo.type || 'image/jpeg',
        } as any);
      });

      console.log('reportService: FormData создан, отправляем запрос...');

      const response = await fetch(`${API_BASE_URL}/photos/uploadFiles`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('reportService: Ошибка загрузки фото:', errorText);
        throw new Error(`Ошибка загрузки фото: ${response.status}`);
      }

      const data = await response.json();
      console.log('reportService: Фото успешно загружены:', data);
      
      if (data.success && data.photoUrls) {
        return data.photoUrls;
      } else {
        throw new Error('Неверный формат ответа от сервера загрузки');
      }
    } catch (error) {
      console.error('reportService: Ошибка загрузки фото:', error);
      throw error;
    }
  },

  // Получение URL фото
  getPhotoUrl(filename: string): string {
    console.log(filename)
    return `${API_BASE_URL}/photos/reports/${filename}`;
  },

  // Получение отчетов по статусу
  async getReportsByStatus(status: string): Promise<Report[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/reports/status/${status}`);
      
      if (!response.ok) {
        throw new Error(`Ошибка при получении отчетов по статусу: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Ошибка в getReportsByStatus:', error);
      throw error;
    }
  },

  // Получение отчетов по пользователю
  async getReportsByUser(userId: number): Promise<Report[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/reports/user/${userId}`);
      
      if (!response.ok) {
        throw new Error(`Ошибка при получении отчетов пользователя: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Ошибка в getReportsByUser:', error);
      throw error;
    }
  },

  // Экспорт отчетов в PDF
  async exportReportsToPdf(reportIds: number[]): Promise<Blob> {
    try {
      const response = await fetch(`${API_BASE_URL}/reports/export/pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reportIds }),
      });

      if (!response.ok) {
        throw new Error(`Ошибка при экспорте отчетов: ${response.status}`);
      }

      return await response.blob();
    } catch (error) {
      console.error('Ошибка в exportReportsToPdf:', error);
      throw error;
    }
  },

  // Статистика по отчетам
  async getReportsStats(): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/reports/stats`);
      
      if (!response.ok) {
        throw new Error(`Ошибка при получении статистики: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Ошибка в getReportsStats:', error);
      throw error;
    }
  },
};