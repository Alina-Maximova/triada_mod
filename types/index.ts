
export * from '@/services/task';

// Типы
export interface User {
  id: number;
  email: string;
  name: string;
  first_name?: string;
  last_name?: string;
  role_id?: number;
  role_name?: string;
}

export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

// Добавляем новые статусы
export interface Task {
  id: number;
  title: string;
  description: string;
  phone: string;
  customer: string;
  startDate: string;
  dueDate: string;
  location?: Location;
  status: 'new' | 'in_progress' | 'paused' | 'completed' | 'accepted';
  pause_reason?: string;
  createdAt: string;
  updatedAt: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  start_date?: string;
  due_date?: string;
  created_at?: string;
  updated_at?: string;
}

// Интерфейс комментария
export interface Comment {
  id: number;
  task_id: number;
  user_id: number;
  user_name?: string;
  content: string;
  comment_type: 'general' | 'pause_reason' | 'system';
  created_at: string;
  updated_at: string;
}

export interface CreateCommentData {
  task_id: number;
  content: string;
  comment_type?: 'general' | 'pause_reason' | 'system';
}

// Обновляем пропсы для компонентов
export interface TaskListProps {
  tasks: Task[];
  onToggleTask: (id: number) => void;
  onDeleteTask: (id: number) => void;
  onEditTask: (task: Task) => void;
  onUpdateTaskStatus: (taskId: number, newStatus: string, pauseReason?: string) => void;
  onAddTask: () => void;
  onViewComments: (task: Task) => void;
  isLoading: boolean;
}

export interface AuthResponse {
  token: string;
  user: User;
  success?: boolean;
  message?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
  role_id?: number;
}

export interface CreateTaskData {
  title: string;
  description: string;
  phone: string;
  customer: string;
  start_date: string;
  due_date: string;
  location: Location;
}

export interface ReportPhoto {
  id: number;
  photo_url: string;
  created_at: string;
}

export interface Report {
  id: number;
  task_id: number;
  description: string;
  created_at: string;
  updated_at: string;
  task_title: string;
  customer: string;
  address?: string;
  photos: string[];
}

export interface CreateReportData {
  task_id: number;
  description: string;
  photo_urls: string[];
}
