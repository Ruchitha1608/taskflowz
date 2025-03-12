import React, { useState, useMemo } from 'react';
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
import { PlusCircle, Bell } from 'lucide-react';
import TaskCard from '@/components/TaskCard';
import CreateTaskForm from '@/components/CreateTaskForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const Dashboard = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const { data: tasks = [], isLoading } = useQuery({ queryKey: ['tasks'], queryFn: getTasks });

  const taskCreationData = useMemo(() => {
    const taskCountByDate = tasks.reduce((acc, task) => {
      const date = new Date(task.createdAt).toLocaleDateString();
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(taskCountByDate).map(([date, count]) => ({ date, count }));
  }, [tasks]);

  const taskOverviewData = useMemo(() => [
    { name: 'Completed', value: tasks.filter(t => t.completed).length },
    { name: 'Active', value: tasks.filter(t => !t.completed).length },
  ], [tasks]);

  const COLORS = ['#0088FE', '#00C49F'];

  const createTaskMutation = useMutation({
    mutationFn: createTask,
    onSuccess: (task) => {
      queryClient.invalidateQueries(['tasks']);
      setIsCreateDialogOpen(false);
      setNotifications(prev => [...prev, { message: `New task created: ${task.title}` }]);
      toast.success('Task created successfully');
    },
  });

  const completeTaskMutation = useMutation({
    mutationFn: completeTask,
    onSuccess: (task) => {
      queryClient.invalidateQueries(['tasks']);
      setNotifications(prev => [...prev, { message: `Task completed: ${task.title}` }]);
      toast.success('Task marked as complete');
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: deleteTask,
    onSuccess: (task) => {
      queryClient.invalidateQueries(['tasks']);
      setNotifications(prev => [...prev, { message: `Task deleted: ${task.title}` }]);
      toast.success('Task deleted successfully');
    },
  });

  return (
    <div className="container py-6 lg:py-10">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Welcome, {user?.name}</h1>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost">
              <Bell className="w-6 h-6" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-4 bg-white shadow-lg rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Notifications</h3>
            {notifications.length > 0 ? (
              notifications.map((note, index) => (
                <div key={index} className="p-2 border-b last:border-none">
                  {note.message}
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No new notifications</p>
            )}
          </PopoverContent>
        </Popover>
      </div>

      <div className="my-6">
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <PlusCircle className="w-5 h-5 mr-2" /> Create Task
        </Button>
        <Input placeholder="Search tasks..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="my-6">
        <h2 className="text-xl font-semibold">Task Creation Analytics</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={taskCreationData}>
            <XAxis dataKey="date" stroke="#888" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="count" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="my-6">
        <h2 className="text-xl font-semibold">Task Overview</h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={taskOverviewData} cx="50%" cy="50%" outerRadius={100} fill="#8884d8" dataKey="value" label>
              {taskOverviewData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
        <TabsContent value="active">
          {tasks.filter(t => !t.completed).map(task => (
            <TaskCard key={task.id} task={task} onComplete={() => completeTaskMutation.mutate(task.id)} />
          ))}
        </TabsContent>
        <TabsContent value="completed">
          {tasks.filter(t => t.completed).map(task => (
            <TaskCard key={task.id} task={task} />
          ))}
        </TabsContent>
      </Tabs>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Task</DialogTitle>
            <DialogDescription>Add a new task to your list</DialogDescription>
          </DialogHeader>
          <CreateTaskForm onSubmit={createTaskMutation.mutate} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
