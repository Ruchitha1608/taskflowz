
import React from 'react';
import { 
  add, 
  eachDayOfInterval, 
  endOfMonth, 
  format, 
  getDay, 
  isEqual, 
  isSameDay, 
  isSameMonth, 
  isToday, 
  parse, 
  startOfToday 
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Task } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { getTasks } from '@/lib/api';

interface CalendarViewProps {
  tasks?: Task[];
  onSelectDate: (date: Date) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ tasks = [], onSelectDate }) => {
  const today = startOfToday();
  const [selectedDay, setSelectedDay] = React.useState(today);
  const [currentMonth, setCurrentMonth] = React.useState(format(today, 'MMM-yyyy'));
  
  // Fetch tasks if none provided
  const { data: fetchedTasks, isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: getTasks,
    enabled: !tasks.length
  });
  
  const allTasks = tasks.length ? tasks : (fetchedTasks || []);
  
  const firstDayCurrentMonth = parse(currentMonth, 'MMM-yyyy', new Date());
  
  const days = eachDayOfInterval({
    start: firstDayCurrentMonth,
    end: endOfMonth(firstDayCurrentMonth),
  });
  
  const previousMonth = () => {
    const firstDayPreviousMonth = add(firstDayCurrentMonth, { months: -1 });
    setCurrentMonth(format(firstDayPreviousMonth, 'MMM-yyyy'));
  };
  
  const nextMonth = () => {
    const firstDayNextMonth = add(firstDayCurrentMonth, { months: 1 });
    setCurrentMonth(format(firstDayNextMonth, 'MMM-yyyy'));
  };
  
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  // Get tasks for a specific day
  const getTasksForDay = (day: Date) => {
    return allTasks.filter(task => isSameDay(task.dueDate, day));
  };
  
  // Handle day selection
  const handleDayClick = (day: Date) => {
    setSelectedDay(day);
    onSelectDate(day);
  };
  
  return (
    <div className="w-full animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-semibold text-xl">
          {format(firstDayCurrentMonth, 'MMMM yyyy')}
        </h2>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={previousMonth}
            className="rounded-full"
          >
            <ChevronLeft className="h-5 w-5" />
            <span className="sr-only">Previous month</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setCurrentMonth(format(today, 'MMM-yyyy'));
              setSelectedDay(today);
            }}
          >
            Today
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={nextMonth}
            className="rounded-full"
          >
            <ChevronRight className="h-5 w-5" />
            <span className="sr-only">Next month</span>
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-2 mb-2">
        {dayNames.map((day) => (
          <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
            {day}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-2">
        {days.map((day, dayIdx) => {
          const tasksForDay = getTasksForDay(day);
          const firstDayOfMonth = dayIdx === 0;
          const startingDayCol = firstDayOfMonth ? getDay(day) : 0;
          
          return (
            <React.Fragment key={day.toString()}>
              {firstDayOfMonth && startingDayCol > 0 && (
                <div 
                  className="col-span-1" 
                  style={{ gridColumn: `span ${startingDayCol} / span ${startingDayCol}` }} 
                />
              )}
              <div
                className={cn(
                  "min-h-[100px] p-2 border rounded-md transition-colors",
                  isEqual(day, selectedDay) && "border-primary ring-1 ring-primary",
                  !isEqual(day, selectedDay) && isToday(day) && "border-accent-foreground/20",
                  !isEqual(day, selectedDay) && !isToday(day) && "border-border hover:border-primary/30",
                  !isSameMonth(day, firstDayCurrentMonth) && "opacity-50",
                  "cursor-pointer"
                )}
                onClick={() => handleDayClick(day)}
              >
                <div className="text-sm font-medium mb-1">
                  <time
                    dateTime={format(day, 'yyyy-MM-dd')}
                    className={cn(
                      "flex h-6 w-6 items-center justify-center rounded-full",
                      isToday(day) && "bg-primary text-primary-foreground",
                      isEqual(day, selectedDay) && !isToday(day) && "bg-accent text-accent-foreground",
                    )}
                  >
                    {format(day, 'd')}
                  </time>
                </div>
                <div className="space-y-1">
                  {isLoading ? (
                    <div className="text-xs text-muted-foreground">Loading...</div>
                  ) : (
                    <>
                      {tasksForDay.slice(0, 3).map((task) => (
                        <div
                          key={task.id}
                          className={cn(
                            "text-xs truncate px-1 py-0.5 rounded",
                            task.completed ? "line-through text-muted-foreground bg-muted/50" : "bg-primary/10 text-primary"
                          )}
                          title={task.title}
                        >
                          {task.title}
                        </div>
                      ))}
                      {tasksForDay.length > 3 && (
                        <div className="text-xs text-muted-foreground px-1">
                          +{tasksForDay.length - 3} more
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarView;
