// hooks/useComments.ts
import { useState, useCallback } from 'react';
import { Comment, CreateCommentData } from '@/types';
import { commentsAPI } from '@/services/comment';

export const useComments = () => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTaskComments = useCallback(async (taskId: number) => {
    try {
      setIsLoading(true);
      setError(null);
      const commentsData = await commentsAPI.getTaskComments(taskId);
      setComments(commentsData);
    } catch (err: any) {
      setError(err.message || 'Ошибка загрузки комментариев');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addComment = useCallback(async (data: CreateCommentData): Promise<Comment> => {
    try {
      setError(null);
      const newComment = await commentsAPI.addComment(data);
     loadTaskComments(data.task_id)
      return newComment;
    } catch (err: any) {
      setError(err.message || 'Ошибка добавления комментария');
      throw err;
    }
  }, []);

  const deleteComment = useCallback(async (id: number) => {
    try {
      setError(null);
      await commentsAPI.deleteComment(id);
      setComments(prev => prev.filter(comment => comment.id !== id));
    } catch (err: any) {
      setError(err.message || 'Ошибка удаления комментария');
      throw err;
    }
  }, []);

  const clearComments = useCallback(() => {
    setComments([]);
    setError(null);
  }, []);

  const refreshComments = useCallback(async (taskId: number) => {
    return loadTaskComments(taskId);
  }, [loadTaskComments]);

  return {
    comments,
    isLoading,
    error,
    loadTaskComments,
    addComment,
    deleteComment,
    clearComments,
    refreshComments, // Добавляем метод для обновления
  };
};