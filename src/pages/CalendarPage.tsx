
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getTasks } from '@/lib/api';
import Calendar from '@/components/Calendar';

const CalendarPage = () => {
  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: getTasks,
  });

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Calendar View</h1>
      
      {isLoading ? (
        <div className="flex justify-center my-12">
          <div className="animate-pulse text-primary">Loading tasks...</div>
        </div>
      ) : (
        <Calendar tasks={tasks} />
      )}
    </div>
  );
};

export default CalendarPage;
