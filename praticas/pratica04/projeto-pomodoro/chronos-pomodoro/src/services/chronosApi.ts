import type { TaskModel } from '../models/TaskModel';
import type { TaskStateModel } from '../models/TaskStateModel';
import { authService } from './authService';

const API_URL = import.meta.env.VITE_CHRONOS_API_URL ?? 'http://localhost:3333';

type Settings = TaskStateModel['config'];

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = authService.getToken();

  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new Error(errorBody?.message ?? 'Erro ao comunicar com a API.');
  }

  if (response.status === 204) return undefined as T;

  return response.json() as Promise<T>;
}

export const chronosApi = {
  getSettings() {
    return request<Settings>('/settings');
  },
  updateSettings(settings: Settings) {
    return request<Settings>('/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  },
  getTasks() {
    return request<TaskModel[]>('/tasks');
  },
  createTask(task: TaskModel) {
    return request<TaskModel>('/tasks', {
      method: 'POST',
      body: JSON.stringify(task),
    });
  },
  completeTask(id: string, completeDate = Date.now()) {
    return request<TaskModel>(`/tasks/${id}/complete`, {
      method: 'PATCH',
      body: JSON.stringify({ completeDate }),
    });
  },
  interruptTask(id: string, interruptDate = Date.now()) {
    return request<TaskModel>(`/tasks/${id}/interrupt`, {
      method: 'PATCH',
      body: JSON.stringify({ interruptDate }),
    });
  },
  clearTasks() {
    return request<void>('/tasks', {
      method: 'DELETE',
    });
  },
};
