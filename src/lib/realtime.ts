/**
 * Real-time WebSocket client for live updates across the application
 */

export interface RealTimeEvent {
  type: string;
  data: any;
  timestamp: number;
}

export interface RealTimeStats {
  activeUsers: number;
  totalRooms: number;
  messagesSent: number;
  filesShared: number;
  onlineUsers: number;
}

export interface RoomUpdate {
  roomId: string;
  action: 'created' | 'joined' | 'left' | 'deleted' | 'message' | 'file_shared';
  data: any;
}

export interface UserActivity {
  userId: string;
  action: 'joined' | 'left' | 'typing' | 'stopped_typing';
  roomId?: string;
  timestamp: number;
}

class RealTimeClient {
  private ws: WebSocket | null = null;
  private eventListeners: Map<string, Set<Function>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 3000;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private connectionState: 'connecting' | 'connected' | 'disconnected' | 'error' = 'disconnected';

  constructor(private url: string) {
    this.connect();
  }

  connect() {
    if (this.ws && (this.ws.readyState === WebSocket.CONNECTING || this.ws.readyState === WebSocket.OPEN)) {
      return;
    }

    this.connectionState = 'connecting';
    console.log('🔌 Connecting to real-time server:', this.url);

    try {
      this.ws = new WebSocket(this.url);
      this.setupEventHandlers();
    } catch (error) {
      console.error('❌ Failed to create WebSocket connection:', error);
      this.handleReconnect();
    }
  }

  private setupEventHandlers() {
    if (!this.ws) return;

    this.ws.onopen = () => {
      console.log('✅ Real-time connection established');
      this.connectionState = 'connected';
      this.reconnectAttempts = 0;
      this.startHeartbeat();
      this.emit('connection', { status: 'connected' });
    };

    this.ws.onmessage = (event) => {
      try {
        const message: RealTimeEvent = JSON.parse(event.data);
        console.log('📨 Real-time event received:', message);
        this.emit(message.type, message.data);
      } catch (error) {
        console.error('❌ Failed to parse real-time message:', error);
      }
    };

    this.ws.onclose = (event) => {
      console.log('🔌 Real-time connection closed:', event.code, event.reason);
      this.connectionState = 'disconnected';
      this.stopHeartbeat();
      this.emit('connection', { status: 'disconnected' });
      
      if (!event.wasClean) {
        this.handleReconnect();
      }
    };

    this.ws.onerror = (error) => {
      console.error('❌ Real-time connection error:', error);
      this.connectionState = 'error';
      this.emit('connection', { status: 'error' });
    };
  }

  private handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    console.log(`🔄 Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);

    setTimeout(() => {
      this.connect();
    }, this.reconnectInterval * this.reconnectAttempts);
  }

  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.send('ping', { timestamp: Date.now() });
      }
    }, 30000); // Send ping every 30 seconds
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  send(type: string, data: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const message: RealTimeEvent = {
        type,
        data,
        timestamp: Date.now()
      };
      this.ws.send(JSON.stringify(message));
      console.log('📤 Sent real-time event:', message);
    } else {
      console.warn('⚠️ WebSocket not connected, cannot send message');
    }
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
          console.error(`❌ Error in event listener for ${eventType}:`, error);
        }
      });
    }
  }

  getConnectionState() {
    return this.connectionState;
  }

  disconnect() {
    this.stopHeartbeat();
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }
    this.connectionState = 'disconnected';
  }

  // High-level methods for specific event types
  onStatsUpdate(callback: (stats: RealTimeStats) => void) {
    this.on('stats_update', callback);
  }

  onRoomUpdate(callback: (update: RoomUpdate) => void) {
    this.on('room_update', callback);
  }

  onUserActivity(callback: (activity: UserActivity) => void) {
    this.on('user_activity', callback);
  }

  onConnectionChange(callback: (status: { status: string }) => void) {
    this.on('connection', callback);
  }

  // Request real-time data
  requestStats() {
    this.send('request_stats', {});
  }

  joinRoom(roomId: string) {
    this.send('join_room', { roomId });
  }

  leaveRoom(roomId: string) {
    this.send('leave_room', { roomId });
  }

  sendMessage(roomId: string, message: string) {
    this.send('send_message', { roomId, message });
  }

  sendTyping(roomId: string, isTyping: boolean) {
    this.send('typing', { roomId, isTyping });
  }
}

// Singleton instance
let realTimeClient: RealTimeClient | null = null;

export const getRealTimeClient = (): RealTimeClient => {
  if (!realTimeClient) {
    const wsUrl = import.meta.env.VITE_WS_URL || `ws://${window.location.host}`;
    realTimeClient = new RealTimeClient(wsUrl);
  }
  return realTimeClient;
};

export const createMockRealTimeClient = (): RealTimeClient => {
  // For development when WebSocket server is not available
  const mockClient = new RealTimeClient('ws://localhost:8080/ws');
  
  // Simulate real-time events
  setTimeout(() => {
    setInterval(() => {
      // Simulate stats updates
      const mockStats: RealTimeStats = {
        activeUsers: Math.floor(Math.random() * 50) + 20,
        totalRooms: Math.floor(Math.random() * 10) + 5,
        messagesSent: Math.floor(Math.random() * 1000) + 500,
        filesShared: Math.floor(Math.random() * 100) + 20,
        onlineUsers: Math.floor(Math.random() * 40) + 15
      };
      
      mockClient['emit']('stats_update', mockStats);
    }, 2000);
  }, 1000);

  return mockClient;
};

export default RealTimeClient;
