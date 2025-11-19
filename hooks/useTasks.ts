import { useState, useEffect } from 'react';
import {  tasksAPI } from '@/services/task';
import { Task, CreateTaskData } from '@/types/index';


export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const loadTasks = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const tasksData = await tasksAPI.getTasks();
      setTasks(tasksData);
    } catch (err: any) {
      setError(err.message || 'Ошибка загрузки задач');
    } finally {
      setIsLoading(false);
    }
  };

  const loadTasksNew = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const tasksData = await tasksAPI.getTasksNew();
      setTasks(tasksData);
    } catch (err: any) {
      setError(err.message || 'Ошибка загрузки задач');
    } finally {
      setIsLoading(false);
    }
  };

  const createTask = async (data: CreateTaskData) => {
    try {
      const newTask = await tasksAPI.createTask(data);
      await loadTasks();
      return newTask;
    } catch (err: any) {
      console.error("Error in useTasks createTask:", err.message);
      throw err;
    }
  };

  const updateTask = async (id: number, data: Partial<Task>) => {
    try {
      const updatedTask = await tasksAPI.updateTask(id, data);
      await loadTasks();
      return updatedTask;
    } catch (err: any) {
      throw err;
    }
  };

  const updateTaskStatus = async (id: number, data: any) => {
    console.log(data)
    try {
      const updatedTask = await tasksAPI.updateTaskStatus(id, data);
      await loadTasks();
      return updatedTask;
    } catch (err: any) {
      throw err;
    }
  };

  const deleteTask = async (id: number) => {
    try {
      await tasksAPI.deleteTask(id);
      await loadTasks();
    } catch (err: any) {
      throw err;
    }
  };

  const toggleTask = async (id: number) => {
    try {
      const updatedTask = await tasksAPI.toggleTask(id);
      await loadTasks();
      return updatedTask;
    } catch (err: any) {
      throw err;
    }
  };

  const refreshTasks = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  useEffect(() => {
    loadTasks();
  }, [refreshTrigger]);

  return {
    tasks,
    isLoading,
    error,
    loadTasks,
    createTask,
    updateTask,
    deleteTask,
    toggleTask,
    loadTasksNew,
    updateTaskStatus,
    refreshTasks
  };
};