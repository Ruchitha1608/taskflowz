
import React from 'react';
import { Calendar } from '@/components/Calendar';

const CalendarPage = () => {
  return (
    <div className="container py-8 page-transition">
      <h1 className="text-3xl font-bold tracking-tight mb-6">Calendar</h1>
      <Calendar />
    </div>
  );
};

export default CalendarPage;
