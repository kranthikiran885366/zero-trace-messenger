/**
 * Real-time Server-Sent Events client for live updates
 */

export interface RealTimeStats {
  activeUsers: number;
  totalRooms: number;
  messagesSent: number;
  filesShared: number;
  onlineUsers: number;
}

export interface RealTimeEvent {
  type: string;
  data: any;
  timestamp: number;
}

class RealTimeSSEClient {
  private eventSource: EventSource | null = null;
  private eventListeners: Map<string, Set<Function>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 3000;
  private connectionState: 'connecting' | 'connected' | 'disconnected' | 'error' = 'disconnected';

  constructor(private url: string) {
    this.connect();
  }

  connect() {
    if (this.eventSource && (this.eventSource.readyState === EventSource.CONNECTING || this.eventSource.readyState === EventSource.OPEN)) {
      return;
    }

    this.connectionState = 'connecting';
    console.log('📡 Connecting to real-time SSE server:', this.url);

    try {
      this.eventSource = new EventSource(this.url);
      this.setupEventHandlers();
    } catch (error) {
      console.error('❌ Failed to create SSE connection:', error);
      this.handleReconnect();
    }
  }

  private setupEventHandlers() {
    if (!this.eventSource) return;

    this.eventSource.onopen = () => {
      console.log('✅ Real-time SSE connection established');
      this.connectionState = 'connected';
      this.reconnectAttempts = 0;
      this.emit('connection', { status: 'connected' });
    };

    this.eventSource.onmessage = (event) => {
      try {
        const message: RealTimeEvent = JSON.parse(event.data);
        console.log('📨 Real-time SSE event received:', message);
        this.emit(message.type, message.data);

        // Trigger notifications for certain events
        this.handleNotifications(message);
      } catch (error) {
        console.error('❌ Failed to parse SSE message:', error);
      }
    };

    this.eventSource.onerror = (event) => {
      console.warn('⚠️ Real-time SSE connection error:', {
        readyState: this.eventSource?.readyState,
        type: event.type,
        target: event.target
      });

      // Only treat as error if connection is completely failed
      if (this.eventSource?.readyState === EventSource.CLOSED) {
        console.log('🔌 SSE connection closed, attempting reconnect...');
        this.connectionState = 'disconnected';
        this.handleReconnect();
      } else {
        // Connection might still be working, just a temporary error
        this.connectionState = 'error';
        this.emit('connection', { status: 'error' });
      }
    };
  }

  private handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ Max SSE reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    console.log(`🔄 Attempting to reconnect SSE (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);

    setTimeout(() => {
      this.connect();
    }, this.reconnectInterval * this.reconnectAttempts);
  }

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
          console.error(`❌ Error in SSE event listener for ${eventType}:`, error);
        }
      });
    }
  }

  getConnectionState() {
    return this.connectionState;
  }

  disconnect() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    this.connectionState = 'disconnected';
  }

  // High-level methods for specific event types
  onStatsUpdate(callback: (stats: RealTimeStats) => void) {
    this.on('stats_update', callback);
  }

  onConnectionChange(callback: (status: { status: string }) => void) {
    this.on('connection', callback);
  }

  private handleNotifications(message: RealTimeEvent) {
    // Import notification manager dynamically to avoid circular dependencies
    if (typeof window !== 'undefined') {
      import('@/lib/notifications').then(({ getNotificationManager }) => {
        const notificationManager = getNotificationManager();

        switch (message.type) {
          case 'stats_update':
            // Only notify on significant changes
            if (message.data.activeUsers > 50) {
              notificationManager.notifySystemUpdate(
                'High Activity',
                `${message.data.activeUsers} users are now online!`,
                'normal'
              );
            }
            break;

          case 'rooms_update':
            // Notify about new rooms
            if (message.data.rooms && Array.isArray(message.data.rooms)) {
              const activeRooms = message.data.rooms.filter((room: any) => room.isActive);
              if (activeRooms.length > 10) {
                notificationManager.notifySystemUpdate(
                  'New Rooms Available',
                  `${activeRooms.length} active rooms to join`,
                  'low'
                );
              }
            }
            break;

          case 'user_activity':
            if (message.data.action === 'joined') {
              notificationManager.notifyUserJoined(
                message.data.roomName || 'Unknown Room',
                message.data.username || 'Anonymous',
                message.data.roomId
              );
            }
            break;

          case 'new_message':
            notificationManager.notifyNewMessage(
              message.data.roomName || 'Room',
              message.data.username || 'Anonymous',
              message.data.content || 'New message',
              message.data.roomId
            );
            break;
        }
      }).catch(error => {
        console.warn('⚠️ Failed to import notification manager:', error);
      });
    }
  }
}

// Singleton instance
let realTimeSSEClient: RealTimeSSEClient | null = null;

export const getRealTimeSSEClient = (): RealTimeSSEClient => {
  if (!realTimeSSEClient) {
    // Ensure we use the correct origin for SSE
    const baseUrl = import.meta.env.VITE_API_URL || window.location.origin;
    const sseUrl = `${baseUrl}/api/events`;
    console.log('🔗 Initializing SSE client with URL:', sseUrl);
    realTimeSSEClient = new RealTimeSSEClient(sseUrl);
  }
  return realTimeSSEClient;
};

export default RealTimeSSEClient;
