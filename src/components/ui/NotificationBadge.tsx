import React, { useState, useEffect } from "react";
import { BellIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Task } from "@/lib/api";

interface NotificationBadgeProps {
  tasks: Task[];
}

interface Notification {
  id: string;
  message: string;
  timestamp: Date;
  read: boolean;
  type: "info" | "warning" | "success";
}

const NotificationBadge: React.FC<NotificationBadgeProps> = ({ tasks }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  // Generate notifications based on tasks
  useEffect(() => {
    const newNotifications: Notification[] = [];
    
    // Add notifications for overdue tasks
    tasks.forEach((task) => {
      if (task.dueDate && !task.completed && new Date() > task.dueDate) {
        newNotifications.push({
          id: `overdue-${task.id}`,
          message: `Task "${task.title}" is overdue!`,
          timestamp: new Date(),
          read: false,
          type: "warning",
        });
      }
    });
    
    setNotifications(newNotifications);
  }, [tasks]);
  
  const unreadCount = notifications.filter((n) => !n.read).length;
  
  const handleReadNotification = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
  };
  
  const handleMarkAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, read: true }))
    );
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <BellIcon className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-4 py-2 border-b">
          <h3 className="font-medium">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs font-normal"
              onClick={handleMarkAllAsRead}
            >
              Mark all as read
            </Button>
          )}
        </div>
        
        <div className="max-h-[300px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="py-6 text-center">
              <p className="text-sm text-muted-foreground">No notifications</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={cn(
                  "px-4 py-3 cursor-default flex flex-col items-start",
                  !notification.read && "bg-primary/5"
                )}
                onClick={() => handleReadNotification(notification.id)}
              >
                <div className="flex items-start w-full">
                  <div className={cn(
                    "w-2 h-2 rounded-full mt-1.5 mr-2 flex-shrink-0",
                    notification.type === "warning" && "bg-orange-500",
                    notification.type === "info" && "bg-blue-500",
                    notification.type === "success" && "bg-green-500"
                  )} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">{notification.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {notification.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </DropdownMenuItem>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationBadge;
