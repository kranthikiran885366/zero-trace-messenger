import { encryption } from './encryption';

export interface ChatMessage {
  id: string;
  content: string;
  encrypted: string;
  timestamp: number;
  senderId: string;
  type: 'text' | 'file' | 'system';
  autoDeleteAfter?: number;
  metadata?: {
    filename?: string;
    fileSize?: number;
    mimeType?: string;
  };
}

export interface RoomSettings {
  id: string;
  password?: string;
  autoDestroy: number;
  maxUsers: number;
  enableVideo: boolean;
  enableFileSharing: boolean;
  encryptionKey: string;
}

export interface RoomUser {
  id: string;
  nickname: string;
  joinedAt: number;
  isOnline: boolean;
  lastSeen: number;
}

export class WebSocketService {
  private static instance: WebSocketService;
  private ws: WebSocket | null = null;
  private roomId: string | null = null;
  private userId: string;
  private encryptionKey: string | null = null;
  private messageHandlers: Set<(message: ChatMessage) => void> = new Set();
  private userHandlers: Set<(users: RoomUser[]) => void> = new Set();
  private connectionHandlers: Set<(connected: boolean) => void> = new Set();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  
  private constructor() {
    this.userId = this.generateUserId();
  }
  
  static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  private generateUserId(): string {
    return 'user_' + Math.random().toString(36).substr(2, 9);
  }

  // Connect to a room
  async connectToRoom(roomId: string, password?: string): Promise<RoomSettings> {
    this.roomId = roomId;
    
    // Simulate WebSocket connection - in real app, this would connect to actual WebSocket server
    return new Promise((resolve, reject) => {
      try {
        // Simulate connection delay
        setTimeout(() => {
          this.encryptionKey = encryption.generateRoomKey();
          
          const settings: RoomSettings = {
            id: roomId,
            password,
            autoDestroy: 3600000, // 1 hour
            maxUsers: 10,
            enableVideo: true,
            enableFileSharing: true,
            encryptionKey: this.encryptionKey
          };

          // Notify connection handlers
          this.connectionHandlers.forEach(handler => handler(true));
          
          // Simulate initial system message
          setTimeout(() => {
            this.simulateSystemMessage('Connected to secure room. All messages are encrypted.');
          }, 500);
          
          resolve(settings);
        }, 1000);
      } catch (error) {
        reject(error);
      }
    });
  }

  // Send a message
  async sendMessage(content: string, type: 'text' | 'file' = 'text', metadata?: any): Promise<void> {
    if (!this.roomId || !this.encryptionKey) {
      throw new Error('Not connected to a room');
    }

    const message: ChatMessage = {
      id: Date.now().toString() + '_' + Math.random().toString(36).substr(2, 9),
      content,
      encrypted: await encryption.encryptMessage(content, this.encryptionKey),
      timestamp: Date.now(),
      senderId: this.userId,
      type,
      metadata
    };

    // Simulate sending message
    setTimeout(() => {
      this.messageHandlers.forEach(handler => handler(message));
      
      // Simulate a response message for demo
      if (type === 'text' && Math.random() > 0.3) {
        setTimeout(() => {
          this.simulateIncomingMessage();
        }, 1000 + Math.random() * 2000);
      }
    }, 100);
  }

  // Simulate incoming message
  private async simulateIncomingMessage(): Promise<void> {
    if (!this.encryptionKey) return;

    const responses = [
      "Message received securely.",
      "Thanks for the encrypted message!",
      "Communication is secure and anonymous.",
      "Privacy maintained - message acknowledged.",
      "Secure channel operational.",
      "Anonymous messaging working perfectly."
    ];

    const content = responses[Math.floor(Math.random() * responses.length)];
    
    const message: ChatMessage = {
      id: Date.now().toString() + '_incoming',
      content,
      encrypted: await encryption.encryptMessage(content, this.encryptionKey),
      timestamp: Date.now(),
      senderId: 'anonymous_' + Math.random().toString(36).substr(2, 4),
      type: 'text'
    };

    this.messageHandlers.forEach(handler => handler(message));
  }

  // Simulate system message
  private async simulateSystemMessage(content: string): Promise<void> {
    const message: ChatMessage = {
      id: Date.now().toString() + '_system',
      content,
      encrypted: content, // System messages aren't encrypted
      timestamp: Date.now(),
      senderId: 'system',
      type: 'system'
    };

    this.messageHandlers.forEach(handler => handler(message));
  }

  // Send file
  async sendFile(file: File): Promise<void> {
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      throw new Error('File too large. Maximum size is 50MB.');
    }

    // Simulate file upload and encryption
    const content = `File: ${file.name}`;
    await this.sendMessage(content, 'file', {
      filename: file.name,
      fileSize: file.size,
      mimeType: file.type
    });
  }

  // Leave room
  leaveRoom(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.roomId = null;
    this.encryptionKey = null;
    this.connectionHandlers.forEach(handler => handler(false));
  }

  // Event handlers
  onMessage(handler: (message: ChatMessage) => void): () => void {
    this.messageHandlers.add(handler);
    return () => this.messageHandlers.delete(handler);
  }

  onUsers(handler: (users: RoomUser[]) => void): () => void {
    this.userHandlers.add(handler);
    return () => this.userHandlers.delete(handler);
  }

  onConnection(handler: (connected: boolean) => void): () => void {
    this.connectionHandlers.add(handler);
    return () => this.connectionHandlers.delete(handler);
  }

  // Get current room info
  getRoomInfo(): { roomId: string | null; userId: string; connected: boolean } {
    return {
      roomId: this.roomId,
      userId: this.userId,
      connected: this.roomId !== null
    };
  }
}

export const websocketService = WebSocketService.getInstance();
