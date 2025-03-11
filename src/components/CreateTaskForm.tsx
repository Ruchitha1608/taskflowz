
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Task, File as TaskFile } from '@/lib/api';
import { cn } from '@/lib/utils';
import FileUploader from './FileUploader';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

const formSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  description: z.string().max(500).optional(),
  dueDate: z.date({
    required_error: 'Due date is required',
  }),
});

type FormValues = z.infer<typeof formSchema>;

interface CreateTaskFormProps {
  onSubmit: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  initialData?: Task;
  onCancel?: () => void;
}

const CreateTaskForm: React.FC<CreateTaskFormProps> = ({
  onSubmit,
  initialData,
  onCancel,
}) => {
  const [files, setFiles] = useState<File[]>(
    initialData?.files.map(file => new File([], file.name, { type: file.type })) || []
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData
      ? {
          title: initialData.title,
          description: initialData.description,
          dueDate: initialData.dueDate,
        }
      : {
          title: '',
          description: '',
          dueDate: new Date(Date.now() + 86400000), // Tomorrow
        },
  });

  const handleFormSubmit = (values: FormValues) => {
    // Ensure we have a title (required by the Task type)
    const taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> = {
      title: values.title, // Explicitly use the title from values
      description: values.description || "", // Make sure we provide a string even if undefined
      dueDate: values.dueDate,
      completed: initialData?.completed || false,
      files: files.map((file, index) => ({
        id: String(index),
        name: file.name,
        url: file.type.includes('image') ? URL.createObjectURL(file) : '#',
        type: file.type,
        size: file.size,
      })),
    };
    onSubmit(taskData);
  };

  const handleFilesSelected = (selectedFiles: File[]) => {
    setFiles(selectedFiles);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6 animate-fade-in">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Task title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Add details about this task" 
                  {...field} 
                  value={field.value || ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="dueDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Due Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2">
          <FormLabel>Attachments</FormLabel>
          <FileUploader 
            onFilesSelected={handleFilesSelected} 
            maxFiles={5}
            maxSize={5 * 1024 * 1024} // 5MB
            accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/zip"
          />
        </div>

        <div className="flex justify-end gap-2">
          {onCancel && (
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
            >
              Cancel
            </Button>
          )}
          <Button type="submit">
            {initialData ? 'Update Task' : 'Create Task'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default CreateTaskForm;
