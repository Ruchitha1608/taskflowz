import { format } from 'date-fns';

export type Task = {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  completed: boolean;
  files: File[];
  createdAt: Date;
  updatedAt: Date;
};

export type File = {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
};

const API_URL = 'http://localhost:5000/api';

// Helper function to get token
const getToken = () => localStorage.getItem('token');

// Helper function to make authenticated API requests
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = getToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers
  };
  
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `API error: ${response.status}`);
  }
  
  return response.json();
};

// Transform task from API to frontend format
const transformTask = (task: any): Task => ({
  id: task._id,
  title: task.title,
  description: task.description || '',
  dueDate: new Date(task.dueDate),
  completed: task.completed,
  files: task.files || [],
  createdAt: new Date(task.createdAt),
  updatedAt: new Date(task.updatedAt)
});

// Task APIs
export const getTasks = async (): Promise<Task[]> => {
  try {
    const data = await apiRequest('/tasks');
    return data.map(transformTask);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return [];
  }
};

export const getTask = async (id: string): Promise<Task> => {
  const data = await apiRequest(`/tasks/${id}`);
  return transformTask(data);
};

export const createTask = async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> => {
  const data = await apiRequest('/tasks', {
    method: 'POST',
    body: JSON.stringify(task)
  });
  return transformTask(data);
};

export const updateTask = async (id: string, updates: Partial<Task>): Promise<Task> => {
  const data = await apiRequest(`/tasks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates)
  });
  return transformTask(data);
};

export const deleteTask = async (id: string): Promise<void> => {
  await apiRequest(`/tasks/${id}`, {
    method: 'DELETE'
  });
};

export const completeTask = async (id: string): Promise<Task> => {
  const data = await apiRequest(`/tasks/${id}/complete`, {
    method: 'PATCH'
  });
  return transformTask(data);
};

// File APIs
export const uploadFile = async (file: globalThis.File): Promise<File> => {
  // For real implementation, you would use FormData and upload to your server
  // For now, we'll keep the mock implementation
  await new Promise(resolve => setTimeout(resolve, 1000));
  return {
    id: Math.random().toString(36).substring(2, 9),
    name: file.name,
    url: URL.createObjectURL(file),
    type: file.type,
    size: file.size,
  };
};

export const deleteFile = async (taskId: string, fileId: string): Promise<void> => {
  // In a real implementation, this would call your API
  await apiRequest(`/tasks/${taskId}`, {
    method: 'PUT',
    body: JSON.stringify({
      files: (await getTask(taskId)).files.filter(file => file.id !== fileId)
    })
  });
};

// Helper functions
export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B';
  else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  else return (bytes / 1048576).toFixed(1) + ' MB';
};

export const formatDate = (date: Date): string => {
  return format(date, 'MMM d, yyyy');
};

export const formatDateTime = (date: Date): string => {
  return format(date, 'MMM d, yyyy h:mm a');
};
