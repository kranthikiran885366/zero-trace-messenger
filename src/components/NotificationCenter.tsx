import React, { useState, useEffect } from 'react';
import React, { useState, useEffect } from 'react';
import { Bell, X, Check, CheckCheck, Trash2, Settings, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { getNotificationManager, Notification } from '@/lib/notifications';

const NotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const notificationManager = getNotificationManager();

  useEffect(() => {
    // Load initial notifications
    setNotifications(notificationManager.getAllNotifications());
    setUnreadCount(notificationManager.getUnreadCount());

    // Subscribe to notification updates
    const handleNotificationsUpdated = (updatedNotifications: Notification[]) => {
      setNotifications(updatedNotifications);
      setUnreadCount(notificationManager.getUnreadCount());
    };

    const handleNewNotification = (notification: Notification) => {
      // Auto-close popover if urgent notification
      if (notification.priority === 'urgent') {
        setIsOpen(false);
      }
    };

    notificationManager.on('notifications_updated', handleNotificationsUpdated);
    notificationManager.on('notification_received', handleNewNotification);

    return () => {
      notificationManager.off('notifications_updated', handleNotificationsUpdated);
      notificationManager.off('notification_received', handleNewNotification);
    };
  }, [notificationManager]);

  const handleMarkAsRead = (notificationId: string) => {
    notificationManager.markAsRead(notificationId);
  };

  const handleMarkAllAsRead = () => {
    notificationManager.markAllAsRead();
  };

  const handleDismiss = (notificationId: string) => {
    notificationManager.dismissNotification(notificationId);
  };

  const handleDismissAll = () => {
    notificationManager.dismissAllNotifications();
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'message':
        return '💬';
      case 'user_joined':
        return '👋';
      case 'user_left':
        return '👋';
      case 'file_shared':
        return '📁';
      case 'room_invite':
        return '📩';
      case 'system':
        return '⚙️';
      case 'warning':
        return '⚠️';
      case 'success':
        return '✅';
      default:
        return '🔔';
    }
  };

  const getPriorityColor = (priority: Notification['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'border-red-500 bg-red-50 dark:bg-red-950';
      case 'high':
        return 'border-orange-500 bg-orange-50 dark:bg-orange-950';
      case 'normal':
        return 'border-blue-500 bg-blue-50 dark:bg-blue-950';
      case 'low':
        return 'border-gray-500 bg-gray-50 dark:bg-gray-950';
      default:
        return 'border-gray-500 bg-gray-50 dark:bg-gray-950';
    }
  };

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-96 p-0" align="end">
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
                {unreadCount > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {unreadCount} new
                  </Badge>
                )}
              </CardTitle>
              
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  title={soundEnabled ? 'Disable sound' : 'Enable sound'}
                >
                  {soundEnabled ? (
                    <Volume2 className="h-4 w-4" />
                  ) : (
                    <VolumeX className="h-4 w-4" />
                  )}
                </Button>
                
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleMarkAllAsRead}
                    title="Mark all as read"
                  >
                    <CheckCheck className="h-4 w-4" />
                  </Button>
                )}
                
                {notifications.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDismissAll}
                    title="Clear all notifications"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>

          <Separator />

          <CardContent className="p-0">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">
                <Bell className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="font-medium">No notifications</p>
                <p className="text-sm">You're all caught up!</p>
              </div>
            ) : (
              <ScrollArea className="h-96">
                <div className="space-y-1 p-2">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`relative p-3 rounded-lg border transition-colors cursor-pointer hover:bg-accent/50 ${
                        !notification.read ? getPriorityColor(notification.priority) : 'border-border bg-background'
                      }`}
                      onClick={() => handleMarkAsRead(notification.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-lg mt-0.5">
                          {getNotificationIcon(notification.type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-medium text-sm leading-tight">
                              {notification.title}
                            </h4>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <span className="text-xs text-muted-foreground">
                                {formatTimeAgo(notification.timestamp)}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 hover:bg-destructive hover:text-destructive-foreground"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDismiss(notification.id);
                                }}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          
                          <p className="text-sm text-muted-foreground mt-1 leading-tight">
                            {notification.message}
                          </p>
                          
                          {notification.priority === 'urgent' && (
                            <Badge variant="destructive" className="mt-2 text-xs">
                              Urgent
                            </Badge>
                          )}
                          
                          {notification.actions && notification.actions.length > 0 && (
                            <div className="flex gap-2 mt-2">
                              {notification.actions.map((action) => (
                                <Button
                                  key={action.id}
                                  variant={action.action === 'dismiss' ? 'outline' : 'default'}
                                  size="sm"
                                  className="text-xs h-7"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (action.action === 'dismiss') {
                                      handleDismiss(notification.id);
                                    } else {
                                      // Handle other actions
                                      console.log('Action clicked:', action);
                                    }
                                  }}
                                >
                                  {action.label}
                                </Button>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        {!notification.read && (
                          <div className="absolute top-2 right-2">
                            <div className="h-2 w-2 bg-primary rounded-full"></div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationCenter;
