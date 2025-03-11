
// This is a mock API implementation 
// In a real app, you would replace these functions with actual API calls

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

// Mock data
const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Design system update',
    description: 'Update the design system with new components and styles',
    dueDate: new Date(Date.now() + 86400000 * 2), // 2 days from now
    completed: false,
    files: [
      {
        id: '1',
        name: 'design-specs.pdf',
        url: '#',
        type: 'application/pdf',
        size: 2500000,
      }
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    title: 'User research interviews',
    description: 'Conduct user interviews for the new feature',
    dueDate: new Date(Date.now() + 86400000 * 5), // 5 days from now
    completed: false,
    files: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    title: 'Marketing campaign',
    description: 'Prepare the Q4 marketing campaign materials',
    dueDate: new Date(Date.now() + 86400000 * 10), // 10 days from now
    completed: false,
    files: [
      {
        id: '2',
        name: 'campaign-brief.docx',
        url: '#',
        type: 'application/docx',
        size: 1200000,
      },
      {
        id: '3',
        name: 'assets.zip',
        url: '#',
        type: 'application/zip',
        size: 5000000,
      }
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  }
];

// Task APIs
export const getTasks = async (): Promise<Task[]> => {
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
  return [...mockTasks];
};

export const getTask = async (id: string): Promise<Task> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const task = mockTasks.find(task => task.id === id);
  if (!task) throw new Error('Task not found');
  return { ...task };
};

export const createTask = async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  const newTask: Task = {
    ...task,
    id: Math.random().toString(36).substring(2, 9),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  mockTasks.push(newTask);
  return newTask;
};

export const updateTask = async (id: string, updates: Partial<Task>): Promise<Task> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const index = mockTasks.findIndex(task => task.id === id);
  if (index === -1) throw new Error('Task not found');
  
  const updatedTask = {
    ...mockTasks[index],
    ...updates,
    updatedAt: new Date(),
  };
  mockTasks[index] = updatedTask;
  return updatedTask;
};

export const deleteTask = async (id: string): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const index = mockTasks.findIndex(task => task.id === id);
  if (index === -1) throw new Error('Task not found');
  mockTasks.splice(index, 1);
};

export const completeTask = async (id: string): Promise<Task> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const index = mockTasks.findIndex(task => task.id === id);
  if (index === -1) throw new Error('Task not found');
  
  const updatedTask = {
    ...mockTasks[index],
    completed: true,
    updatedAt: new Date(),
  };
  mockTasks[index] = updatedTask;
  return updatedTask;
};

// File APIs
export const uploadFile = async (file: File): Promise<File> => {
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
  await new Promise(resolve => setTimeout(resolve, 300));
  const taskIndex = mockTasks.findIndex(task => task.id === taskId);
  if (taskIndex === -1) throw new Error('Task not found');
  
  const fileIndex = mockTasks[taskIndex].files.findIndex(file => file.id === fileId);
  if (fileIndex === -1) throw new Error('File not found');
  
  mockTasks[taskIndex].files.splice(fileIndex, 1);
  mockTasks[taskIndex].updatedAt = new Date();
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
