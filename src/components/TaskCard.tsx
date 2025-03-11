
import React from 'react';
import { cn } from '@/lib/utils';
import { formatDate, formatFileSize, Task } from '@/lib/api';
import { 
  Calendar, 
  Paperclip, 
  MoreVertical, 
  Check, 
  Trash, 
  Edit,
  FileText,
  FileImage,
  FileArchive,
  File as FileIcon
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

interface TaskCardProps {
  task: Task;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ 
  task, 
  onComplete, 
  onDelete, 
  onEdit 
}) => {
  // Get appropriate icon based on file type
  const getFileIcon = (type: string) => {
    if (type.includes('pdf') || type.includes('doc')) return <FileText className="h-4 w-4" />;
    if (type.includes('image')) return <FileImage className="h-4 w-4" />;
    if (type.includes('zip') || type.includes('rar')) return <FileArchive className="h-4 w-4" />;
    return <FileIcon className="h-4 w-4" />;
  };

  // Check if due date is past
  const isPastDue = new Date() > task.dueDate && !task.completed;
  
  // Calculate days remaining
  const daysRemaining = Math.ceil((task.dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  
  return (
    <Card className={cn(
      "w-full transition-all duration-300 hover:shadow-md",
      task.completed ? "opacity-70" : "opacity-100",
      "animate-scale-in"
    )}>
      <CardHeader className="p-4 pb-0 flex flex-row items-start justify-between space-y-0">
        <div className="flex items-start gap-2">
          <Checkbox 
            checked={task.completed}
            onCheckedChange={() => onComplete(task.id)}
            className="mt-0.5"
          />
          <div>
            <h3 className={cn(
              "font-medium text-lg",
              task.completed && "line-through text-muted-foreground"
            )}>
              {task.title}
            </h3>
            {isPastDue && !task.completed && (
              <Badge variant="destructive" className="mt-1">
                Past due
              </Badge>
            )}
            {!isPastDue && !task.completed && daysRemaining <= 2 && (
              <Badge variant="secondary" className="mt-1 bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300">
                Due soon
              </Badge>
            )}
          </div>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(task)}>
              <Edit className="mr-2 h-4 w-4" />
              <span>Edit</span>
            </DropdownMenuItem>
            {!task.completed && (
              <DropdownMenuItem onClick={() => onComplete(task.id)}>
                <Check className="mr-2 h-4 w-4" />
                <span>Mark as complete</span>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onDelete(task.id)} className="text-destructive focus:text-destructive">
              <Trash className="mr-2 h-4 w-4" />
              <span>Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      
      <CardContent className="p-4">
        <p className={cn(
          "text-sm text-muted-foreground",
          task.completed && "line-through"
        )}>
          {task.description}
        </p>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 flex-col items-start">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
          <Calendar className="h-4 w-4" />
          <span>Due {formatDate(task.dueDate)}</span>
        </div>
        
        {task.files.length > 0 && (
          <div className="w-full mt-3">
            <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
              <Paperclip className="h-4 w-4" />
              <span>{task.files.length} attachment{task.files.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="space-y-2">
              {task.files.map(file => (
                <div key={file.id} className="flex items-center gap-2 p-2 rounded-md bg-muted/50 text-xs">
                  {getFileIcon(file.type)}
                  <span className="flex-1 truncate">{file.name}</span>
                  <span className="text-muted-foreground">{formatFileSize(file.size)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default TaskCard;
