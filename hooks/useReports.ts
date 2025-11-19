// hooks/useReports.ts
import { useState, useEffect } from 'react';
import { Report, CreateReportData } from '@/types/index';
import { reportService } from '@/services/report'; // Исправлен импорт

export const useReports = () => {
  const [reportsDate, setReportsDate] = useState<Report[]>([]);
  const [reports, setReports] = useState<Report[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Загрузка всех отчетов
  const loadReports = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const reportsData = await reportService.getReports();
      setReports(reportsData);
    } catch (err: any) {
      setError(err.message || 'Ошибка загрузки отчетов');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Загрузка отчетов по диапазону дат
  const loadReportsByDateRange = async (startDate: string, endDate: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const reportsData = await reportService.getReportsByDateRange(startDate, endDate);
      console.log(startDate, endDate)
      setReportsDate(reportsData);
      console.log(reportsDate)
    } catch (err: any) {
      setError(err.message || 'Ошибка загрузки отчетов по датам');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Создание отчета
  const createReport = async (reportData: CreateReportData) => {
    try {
      setIsLoading(true);
      setError(null);
      console.log(reportData)
      const newReport = await reportService.createReport(reportData);
      setReports(prev => [newReport, ...prev]);
      return newReport;
    } catch (err: any) {
      setError(err.message || 'Ошибка при создании отчета');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Получение отчета по ID задачи
  const getReportByTaskId = async (taskId: number) => {
    try {
      setIsLoading(true);
      setError(null);
      const report = await reportService.getReportByTaskId(taskId);
      return report;
    } catch (err: any) {
      setError(err.message || 'Ошибка при получении отчета');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Получение отчета по ID
  const getReportById = async (id: number) => {
    try {
      setIsLoading(true);
      setError(null);
      const report = await reportService.getReportById(id);
      return report;
    } catch (err: any) {
      setError(err.message || 'Ошибка при получении отчета');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Обновление отчета
  const updateReport = async (id: number, reportData: Partial<Report>) => {
    try {
      setIsLoading(true);
      setError(null);
      const updatedReport = await reportService.updateReport(id, reportData);
      setReports(prev => prev.map(report => 
        report.id === id ? updatedReport : report
      ));
      return updatedReport;
    } catch (err: any) {
      setError(err.message || 'Ошибка при обновлении отчета');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Удаление отчета
  const deleteReport = async (id: number) => {
    try {
      setIsLoading(true);
      setError(null);
      await reportService.deleteReport(id);
      setReports(prev => prev.filter(report => report.id !== id));
    } catch (err: any) {
      setError(err.message || 'Ошибка при удалении отчета');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Загрузка фото - используем сервис
  const uploadPhotos = async (photos: any[]): Promise<string[]> => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('useReports: Начинаем загрузку фото через сервис:', photos.length);
      
      // Преобразуем фото в правильный формат для сервиса
      const formattedPhotos = photos.map(photo => ({
        ...photo,
        // Если нужно преобразовать для File или другого формата
      }));

      const photoUrls = await reportService.uploadPhotos(formattedPhotos);
      
      console.log('useReports: Фото успешно загружены через сервис:', photoUrls);

      return photoUrls;
    } catch (err: any) {
      const errorMessage = err.message || 'Ошибка при загрузке фото';
      setError(errorMessage);
      console.error('useReports: Ошибка загрузки фото через сервис:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Автоматическая загрузка отчетов при монтировании
  useEffect(() => {
    loadReports();
  }, []);

  return {
    reports,
    reportsDate,
    isLoading,
    error,
    loadReports,
    loadReportsByDateRange,
    createReport,
    getReportByTaskId,
    getReportById,
    updateReport,
    deleteReport,
    uploadPhotos,
  };
};