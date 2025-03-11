import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { 
  getTasks, 
  createTask, 
  updateTask, 
  deleteTask, 
  completeTask, 
  Task 
} from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { PlusCircle, Search, SortAsc, SortDesc, CheckCircle2 } from 'lucide-react';
import TaskCard from '@/components/TaskCard';
import CreateTaskForm from '@/components/CreateTaskForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'dueDate' | 'createdAt'>('dueDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  
  // Fetch tasks
  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: getTasks,
  });
  
  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setIsCreateDialogOpen(false);
      toast.success('Task created successfully');
    },
  });
  
  // Update task mutation
  const updateTaskMutation = useMutation({
    mutationFn: (data: { id: string; updates: Partial<Task> }) => updateTask(data.id, data.updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setEditingTask(null);
      setIsCreateDialogOpen(false);
      toast.success('Task updated successfully');
    },
  });
  
  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task deleted successfully');
    },
  });
  
  // Complete task mutation
  const completeTaskMutation = useMutation({
    mutationFn: completeTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success(`Task marked as complete`);
    },
  });
  
  // Filter and sort tasks
  const filteredTasks = tasks
    .filter(task => task.title.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      return sortOrder === 'asc' 
        ? new Date(a[sortBy]).getTime() - new Date(b[sortBy]).getTime() 
        : new Date(b[sortBy]).getTime() - new Date(a[sortBy]).getTime();
    });
  
  const completedTasks = filteredTasks.filter(task => task.completed);
  const incompleteTasks = filteredTasks.filter(task => !task.completed);
  
  // Analytics: Completed tasks per day
  const completedTasksByDate = completedTasks.reduce((acc, task) => {
    const date = new Date(task.createdAt).toLocaleDateString();
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const analyticsData = Object.keys(completedTasksByDate).map(date => ({
    date,
    count: completedTasksByDate[date],
  }));
  
  return (
    <div className="container py-6 lg:py-10 page-transition">
      <h1 className="text-3xl font-bold">Welcome, {user?.name}</h1>
      <p className="text-muted-foreground">Manage your tasks and stay organized</p>
      
      <div className="my-6">
        <h2 className="text-xl font-semibold">Task Completion Analytics</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={analyticsData}>
            <XAxis dataKey="date" stroke="#888" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="count" fill="#4A90E2" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="flex items-center gap-4 mb-6">
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <PlusCircle className="w-5 h-5 mr-2" /> Create Task
        </Button>
        <Input
          placeholder="Search tasks..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>
      
      <Tabs defaultValue="active" className="w-full">
        <TabsList>
          <TabsTrigger value="active">Active ({incompleteTasks.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedTasks.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="active" className="mt-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {incompleteTasks.map(task => (
              <TaskCard key={task.id} task={task} onComplete={completeTaskMutation.mutate} />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="completed" className="mt-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {completedTasks.map(task => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
      
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTask ? 'Edit Task' : 'Create Task'}</DialogTitle>
            <DialogDescription>
              {editingTask ? 'Update your task details' : 'Add a new task to your list'}
            </DialogDescription>
          </DialogHeader>
          <CreateTaskForm 
            onSubmit={editingTask ? updateTaskMutation.mutate : createTaskMutation.mutate} 
            initialData={editingTask} 
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
