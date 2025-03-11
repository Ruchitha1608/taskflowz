
import React from 'react';
import CalendarView from '@/components/Calendar';

const CalendarPage = () => {
  return (
    <div className="container py-8 page-transition">
      <h1 className="text-3xl font-bold tracking-tight mb-6">Calendar</h1>
      <CalendarView tasks={[]} onSelectDate={() => {}} />
    </div>
  );
};

export default CalendarPage;
