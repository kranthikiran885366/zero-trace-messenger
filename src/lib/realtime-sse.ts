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
    console.log('�� Connecting to real-time SSE server:', this.url);

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

    this.eventSource.onerror = (error) => {
      console.error('❌ Real-time SSE connection error:', error);
      this.connectionState = 'error';
      this.emit('connection', { status: 'error' });
      
      if (this.eventSource?.readyState === EventSource.CLOSED) {
        this.connectionState = 'disconnected';
        this.handleReconnect();
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
}

// Singleton instance
let realTimeSSEClient: RealTimeSSEClient | null = null;

export const getRealTimeSSEClient = (): RealTimeSSEClient => {
  if (!realTimeSSEClient) {
    const sseUrl = `${import.meta.env.VITE_API_URL || window.location.origin}/api/events`;
    realTimeSSEClient = new RealTimeSSEClient(sseUrl);
  }
  return realTimeSSEClient;
};

export default RealTimeSSEClient;
