/**
 * Real-time notification system for live updates
 */

export interface Notification {
  id: string;
  type: 'message' | 'room_invite' | 'user_joined' | 'user_left' | 'file_shared' | 'system' | 'warning' | 'success';
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  data?: any;
  expiresAt?: number;
  actions?: NotificationAction[];
}

export interface NotificationAction {
  id: string;
  label: string;
  action: 'join_room' | 'view_message' | 'download_file' | 'dismiss' | 'custom';
  data?: any;
}

class RealTimeNotificationManager {
  private notifications: Map<string, Notification> = new Map();
  private eventListeners: Map<string, Set<Function>> = new Map();
  private audioContext: AudioContext | null = null;
  private isPermissionGranted = false;
  private maxNotifications = 100;

  constructor() {
    this.initializeNotifications();
    this.requestPermission();
    this.startCleanup();
  }

  private async initializeNotifications() {
    // Check for notification permission
    if ('Notification' in window) {
      this.isPermissionGranted = Notification.permission === 'granted';
      
      if (Notification.permission === 'default') {
        const permission = await Notification.requestPermission();
        this.isPermissionGranted = permission === 'granted';
      }
    }

    // Initialize audio context for notification sounds
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.warn('⚠️ Audio context not available for notification sounds');
    }
  }

  private async requestPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      this.isPermissionGranted = permission === 'granted';
      
      if (this.isPermissionGranted) {
        this.showNotification({
          type: 'success',
          title: 'Notifications Enabled',
          message: 'You will now receive real-time notifications',
          priority: 'normal'
        });
      }
    }
  }

  private startCleanup() {
    // Clean up expired notifications every minute
    setInterval(() => {
      const now = Date.now();
      const expiredIds: string[] = [];

      this.notifications.forEach((notification, id) => {
        if (notification.expiresAt && notification.expiresAt < now) {
          expiredIds.push(id);
        }
      });

      expiredIds.forEach(id => {
        this.notifications.delete(id);
      });

      // Keep only the most recent notifications
      if (this.notifications.size > this.maxNotifications) {
        const sorted = Array.from(this.notifications.values())
          .sort((a, b) => b.timestamp - a.timestamp);
        
        const toKeep = sorted.slice(0, this.maxNotifications);
        this.notifications.clear();
        toKeep.forEach(notification => {
          this.notifications.set(notification.id, notification);
        });
      }

      this.emit('notifications_updated', this.getAllNotifications());
    }, 60000);
  }

  showNotification(notificationData: Omit<Notification, 'id' | 'timestamp' | 'read'>): Notification {
    const notification: Notification = {
      ...notificationData,
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`,
      timestamp: Date.now(),
      read: false,
      expiresAt: notificationData.expiresAt || (Date.now() + 5 * 60 * 1000) // Default 5 minutes
    };

    this.notifications.set(notification.id, notification);

    // Show browser notification if permission granted
    if (this.isPermissionGranted && document.hidden) {
      this.showBrowserNotification(notification);
    }

    // Play notification sound
    this.playNotificationSound(notification.priority);

    // Emit events
    this.emit('notification_received', notification);
    this.emit('notifications_updated', this.getAllNotifications());

    console.log('🔔 New notification:', notification);
    return notification;
  }

  private showBrowserNotification(notification: Notification) {
    try {
      const browserNotification = new Notification(notification.title, {
        body: notification.message,
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        tag: notification.type,
        requireInteraction: notification.priority === 'urgent',
        timestamp: notification.timestamp
      });

      browserNotification.onclick = () => {
        window.focus();
        this.markAsRead(notification.id);
        
        // Handle default action based on type
        if (notification.type === 'message' && notification.data?.roomId) {
          this.emit('notification_action', {
            action: 'join_room',
            data: { roomId: notification.data.roomId }
          });
        }

        browserNotification.close();
      };

      // Auto-close after 10 seconds
      setTimeout(() => {
        browserNotification.close();
      }, 10000);

    } catch (error) {
      console.error('❌ Failed to show browser notification:', error);
    }
  }

  private playNotificationSound(priority: string) {
    if (!this.audioContext) return;

    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      // Different tones for different priorities
      const frequencies = {
        low: 400,
        normal: 600,
        high: 800,
        urgent: 1000
      };

      oscillator.frequency.setValueAtTime(
        frequencies[priority as keyof typeof frequencies] || 600,
        this.audioContext.currentTime
      );

      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.5);

    } catch (error) {
      console.warn('⚠️ Failed to play notification sound:', error);
    }
  }

  markAsRead(notificationId: string): boolean {
    const notification = this.notifications.get(notificationId);
    if (notification) {
      notification.read = true;
      this.emit('notification_read', notification);
      this.emit('notifications_updated', this.getAllNotifications());
      return true;
    }
    return false;
  }

  markAllAsRead(): void {
    this.notifications.forEach(notification => {
      notification.read = true;
    });
    this.emit('notifications_updated', this.getAllNotifications());
  }

  dismissNotification(notificationId: string): boolean {
    const result = this.notifications.delete(notificationId);
    if (result) {
      this.emit('notification_dismissed', notificationId);
      this.emit('notifications_updated', this.getAllNotifications());
    }
    return result;
  }

  dismissAllNotifications(): void {
    this.notifications.clear();
    this.emit('notifications_updated', this.getAllNotifications());
  }

  getAllNotifications(): Notification[] {
    return Array.from(this.notifications.values())
      .sort((a, b) => b.timestamp - a.timestamp);
  }

  getUnreadNotifications(): Notification[] {
    return this.getAllNotifications().filter(n => !n.read);
  }

  getUnreadCount(): number {
    return this.getUnreadNotifications().length;
  }

  getNotificationsByType(type: Notification['type']): Notification[] {
    return this.getAllNotifications().filter(n => n.type === type);
  }

  // Predefined notification templates
  notifyNewMessage(roomName: string, username: string, message: string, roomId: string) {
    return this.showNotification({
      type: 'message',
      title: `New message in ${roomName}`,
      message: `${username}: ${message.length > 50 ? message.substring(0, 50) + '...' : message}`,
      priority: 'normal',
      data: { roomId, username },
      actions: [
        {
          id: 'join',
          label: 'Join Room',
          action: 'join_room',
          data: { roomId }
        },
        {
          id: 'dismiss',
          label: 'Dismiss',
          action: 'dismiss'
        }
      ]
    });
  }

  notifyUserJoined(roomName: string, username: string, roomId: string) {
    return this.showNotification({
      type: 'user_joined',
      title: `User joined ${roomName}`,
      message: `${username} has joined the room`,
      priority: 'low',
      data: { roomId, username }
    });
  }

  notifyUserLeft(roomName: string, username: string, roomId: string) {
    return this.showNotification({
      type: 'user_left',
      title: `User left ${roomName}`,
      message: `${username} has left the room`,
      priority: 'low',
      data: { roomId, username }
    });
  }

  notifyFileShared(roomName: string, filename: string, username: string, roomId: string) {
    return this.showNotification({
      type: 'file_shared',
      title: `File shared in ${roomName}`,
      message: `${username} shared "${filename}"`,
      priority: 'normal',
      data: { roomId, filename, username },
      actions: [
        {
          id: 'view',
          label: 'View File',
          action: 'view_message',
          data: { roomId }
        }
      ]
    });
  }

  notifyRoomInvite(roomName: string, inviterName: string, roomId: string) {
    return this.showNotification({
      type: 'room_invite',
      title: 'Room Invitation',
      message: `${inviterName} invited you to join "${roomName}"`,
      priority: 'high',
      data: { roomId, inviterName },
      actions: [
        {
          id: 'join',
          label: 'Join Room',
          action: 'join_room',
          data: { roomId }
        },
        {
          id: 'dismiss',
          label: 'Decline',
          action: 'dismiss'
        }
      ]
    });
  }

  notifySystemUpdate(title: string, message: string, priority: 'low' | 'normal' | 'high' | 'urgent' = 'normal') {
    return this.showNotification({
      type: 'system',
      title,
      message,
      priority
    });
  }

  notifyWarning(title: string, message: string) {
    return this.showNotification({
      type: 'warning',
      title,
      message,
      priority: 'high'
    });
  }

  notifySuccess(title: string, message: string) {
    return this.showNotification({
      type: 'success',
      title,
      message,
      priority: 'normal'
    });
  }

  // Event system
  on(eventType: string, callback: Function) {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, new Set());
    }
    this.eventListeners.get(eventType)!.add(callback);
  }

  off(eventType: string, callback: Function) {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      listeners.delete(callback);
    }
  }

  private emit(eventType: string, data: any) {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`❌ Error in notification event listener for ${eventType}:`, error);
        }
      });
    }
  }

  // Simulate real-time notifications for demo
  startDemo() {
    setInterval(() => {
      const demoNotifications = [
        () => this.notifyNewMessage('General Discussion', 'Alice', 'Hey everyone! How is your day going?', 'room_1'),
        () => this.notifyUserJoined('Tech Talk', 'Bob', 'room_2'),
        () => this.notifyFileShared('Project Planning', 'document.pdf', 'Charlie', 'room_3'),
        () => this.notifySystemUpdate('Server Update', 'System performance improved by 15%'),
        () => this.notifyUserLeft('General Discussion', 'David', 'room_1')
      ];

      if (Math.random() < 0.3) {
        const randomNotification = demoNotifications[Math.floor(Math.random() * demoNotifications.length)];
        randomNotification();
      }
    }, 5000); // Every 5 seconds
  }
}

// Singleton instance
let notificationManager: RealTimeNotificationManager | null = null;

export const getNotificationManager = (): RealTimeNotificationManager => {
  if (!notificationManager) {
    notificationManager = new RealTimeNotificationManager();
    
    // Start demo notifications in development
    if (import.meta.env.DEV) {
      notificationManager.startDemo();
    }
  }
  return notificationManager;
};

export default RealTimeNotificationManager;
