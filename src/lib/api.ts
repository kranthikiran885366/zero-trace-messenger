import { toast } from '@/hooks/use-toast';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.securechat.app';
const WS_URL = import.meta.env.VITE_WS_URL || 'wss://api.securechat.app';

// Types
export interface User {
  _id: string;
  userId: string;
  nickname: string;
  fingerprint: string;
  isAnonymous: boolean;
  preferences: {
    theme: string;
    autoDeleteMessages: boolean;
    enableNotifications: boolean;
    showTypingIndicators: boolean;
    autoJoinVideo: boolean;
    defaultMessageTimer: number;
    preferredQuality: string;
    enableSteganography: boolean;
    enableOnionRouting: boolean;
  };
  stats: {
    roomsJoined: number;
    messagesExchanged: number;
    filesShared: number;
    callMinutes: number;
    lastRoomJoined?: Date;
  };
  status: 'online' | 'away' | 'busy' | 'offline' | 'invisible';
  createdAt: Date;
  lastActive: Date;
}

export interface Room {
  _id: string;
  roomId: string;
  roomCode: string;
  name: string;
  description?: string;
  createdBy: string;
  settings: {
    maxUsers: number;
    hasPassword: boolean;
    enableVideo: boolean;
    enableFileSharing: boolean;
    enableScreenShare: boolean;
    enableVoiceNotes: boolean;
    enableDrawing: boolean;
    allowAnonymousJoin: boolean;
    roomTheme: string;
    autoDestroy: number;
    messageRetention: number;
    maxFileSize: number;
    enableE2EEncryption: boolean;
  };
  status: 'active' | 'inactive' | 'suspended' | 'archived';
  stats: {
    totalMessages: number;
    totalUsers: number;
    totalFiles: number;
    peakConcurrentUsers: number;
    totalCallMinutes: number;
    lastActivity: Date;
  };
  activeUsers: Array<{
    userId: string;
    nickname: string;
    joinedAt: Date;
    lastSeen: Date;
    isOnline: boolean;
    role: 'member' | 'moderator' | 'admin' | 'owner';
  }>;
  currentUserCount: number;
  createdAt: Date;
  expiresAt: Date;
}

export interface Message {
  _id: string;
  messageId: string;
  roomId: string;
  senderId: string;
  senderNickname: string;
  content: string;
  type: 'text' | 'file' | 'image' | 'video' | 'audio' | 'system' | 'voice_note';
  metadata?: {
    fileSize?: number;
    mimeType?: string;
    filename?: string;
    duration?: number;
    dimensions?: { width: number; height: number };
    thumbnail?: string;
    replyTo?: string;
    forwarded?: boolean;
    editedAt?: Date;
    isEdited?: boolean;
  };
  selfDestruct?: {
    enabled: boolean;
    timer: number;
    expiresAt?: Date;
    destructionType: 'timer' | 'read_once' | 'on_leave' | 'manual';
    isDestroyed: boolean;
  };
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed' | 'destroyed';
  readBy: Array<{
    userId: string;
    readAt: Date;
    nickname: string;
  }>;
  reactions: Array<{
    userId: string;
    reaction: string;
    addedAt: Date;
  }>;
  createdAt: Date;
}

export interface FileUpload {
  _id: string;
  fileId: string;
  shareId: string;
  originalName: string;
  mimeType: string;
  size: number;
  uploadedBy: string;
  uploaderNickname: string;
  roomId?: string;
  url: string;
  thumbnailUrl?: string;
  access: {
    isPublic: boolean;
    hasPassword: boolean;
    maxDownloads: number;
    downloadCount: number;
    expiresAt: Date;
    burnAfterReading: boolean;
  };
  status: 'uploading' | 'processing' | 'available' | 'expired' | 'deleted';
  createdAt: Date;
}

// API Client Class
class APIClient {
  private baseURL: string;
  private token: string | null = null;
  private user: User | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('auth_token');
    
    // Load user from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        this.user = JSON.parse(storedUser);
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('user');
      }
    }
  }

  // Authentication
  setAuth(token: string, user: User) {
    this.token = token;
    this.user = user;
    localStorage.setItem('auth_token', token);
    localStorage.setItem('user', JSON.stringify(user));
  }

  clearAuth() {
    this.token = null;
    this.user = null;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  }

  getUser(): User | null {
    return this.user;
  }

  isAuthenticated(): boolean {
    return !!this.token && !!this.user;
  }

  // HTTP Request Helper
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Request failed:', error);
      
      if (error instanceof Error && error.message.includes('401')) {
        this.clearAuth();
        window.location.href = '/';
      }
      
      throw error;
    }
  }

  // Auth API
  async createAnonymousSession(nickname: string, preferences = {}): Promise<{ user: User; token: string }> {
    const response = await this.request<{ success: boolean; user: User; token: string }>('/api/auth/anonymous', {
      method: 'POST',
      body: JSON.stringify({
        nickname,
        preferences,
        deviceInfo: {
          platform: navigator.platform,
          userAgent: navigator.userAgent,
          language: navigator.language,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        }
      }),
    });

    this.setAuth(response.token, response.user);
    return { user: response.user, token: response.token };
  }

  async register(email: string, password: string, nickname: string): Promise<{ user: User; token: string }> {
    const response = await this.request<{ success: boolean; user: User; token: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email,
        password,
        nickname,
        deviceInfo: {
          platform: navigator.platform,
          userAgent: navigator.userAgent,
          language: navigator.language
        }
      }),
    });

    this.setAuth(response.token, response.user);
    return { user: response.user, token: response.token };
  }

  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const response = await this.request<{ success: boolean; user: User; token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    this.setAuth(response.token, response.user);
    return { user: response.user, token: response.token };
  }

  async logout(): Promise<void> {
    await this.request('/api/auth/logout', { method: 'POST' });
    this.clearAuth();
  }

  async verifyToken(): Promise<{ valid: boolean; user?: User }> {
    if (!this.token) return { valid: false };

    try {
      const response = await this.request<{ success: boolean; valid: boolean; user: User }>('/api/auth/verify');
      
      if (response.valid && response.user) {
        this.user = response.user;
        localStorage.setItem('user', JSON.stringify(response.user));
      }
      
      return { valid: response.valid, user: response.user };
    } catch (error) {
      this.clearAuth();
      return { valid: false };
    }
  }

  async refreshToken(): Promise<{ user: User; token: string }> {
    const response = await this.request<{ success: boolean; user: User; token: string }>('/api/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ token: this.token }),
    });

    this.setAuth(response.token, response.user);
    return { user: response.user, token: response.token };
  }

  // User API
  async updatePreferences(preferences: Partial<User['preferences']>): Promise<{ preferences: User['preferences'] }> {
    const response = await this.request<{ success: boolean; preferences: User['preferences'] }>('/api/auth/preferences', {
      method: 'PUT',
      body: JSON.stringify({ preferences }),
    });

    if (this.user) {
      this.user.preferences = response.preferences;
      localStorage.setItem('user', JSON.stringify(this.user));
    }

    return { preferences: response.preferences };
  }

  async getUserStats(): Promise<{ stats: User['stats'] }> {
    const response = await this.request<{ success: boolean; stats: User['stats'] }>('/api/users/stats');
    return { stats: response.stats };
  }

  // Room API
  async createRoom(roomData: {
    name: string;
    description?: string;
    password?: string;
    maxUsers?: number;
    enableVideo?: boolean;
    enableFileSharing?: boolean;
    autoDestroy?: number;
    isPrivate?: boolean;
  }): Promise<{ room: Room; roomCode: string; encryptionFingerprint: string }> {
    const response = await this.request<{
      success: boolean;
      room: Room;
      roomCode: string;
      encryptionFingerprint: string;
    }>('/api/rooms/create', {
      method: 'POST',
      body: JSON.stringify({ name: roomData.name, description: roomData.description, settings: roomData }),
    });

    return {
      room: response.room,
      roomCode: response.roomCode,
      encryptionFingerprint: response.encryptionFingerprint
    };
  }

  async joinRoom(roomCode: string, password?: string): Promise<{
    room: Room;
    encryptionKey: string;
    encryptionFingerprint: string;
  }> {
    const response = await this.request<{
      success: boolean;
      room: Room;
      encryptionKey: string;
      encryptionFingerprint: string;
    }>('/api/rooms/join', {
      method: 'POST',
      body: JSON.stringify({ roomCode: roomCode.toUpperCase(), password }),
    });

    return {
      room: response.room,
      encryptionKey: response.encryptionKey,
      encryptionFingerprint: response.encryptionFingerprint
    };
  }

  async leaveRoom(roomId: string): Promise<void> {
    await this.request('/api/rooms/leave', {
      method: 'POST',
      body: JSON.stringify({ roomId }),
    });
  }

  async getRoomInfo(roomCode: string): Promise<{ room: Room; userInRoom: boolean }> {
    const response = await this.request<{
      success: boolean;
      room: Room;
      userInRoom: boolean;
    }>(`/api/rooms/${roomCode.toUpperCase()}`);

    return { room: response.room, userInRoom: response.userInRoom };
  }

  async getUserRooms(): Promise<{ rooms: Room[] }> {
    const response = await this.request<{ success: boolean; rooms: Room[] }>('/api/rooms/user/rooms');
    return { rooms: response.rooms };
  }

  async searchPublicRooms(query?: string, limit = 20): Promise<{ rooms: Room[] }> {
    const params = new URLSearchParams();
    if (query) params.append('query', query);
    params.append('limit', limit.toString());

    const response = await this.request<{ success: boolean; rooms: Room[] }>(`/api/rooms/search/public?${params}`);
    return { rooms: response.rooms };
  }

  async updateRoomSettings(roomId: string, settings: Partial<Room['settings']>): Promise<{ settings: Room['settings'] }> {
    const response = await this.request<{ success: boolean; settings: Room['settings'] }>(`/api/rooms/${roomId}/settings`, {
      method: 'PUT',
      body: JSON.stringify({ settings }),
    });

    return { settings: response.settings };
  }

  async deleteRoom(roomId: string): Promise<void> {
    await this.request(`/api/rooms/${roomId}`, { method: 'DELETE' });
  }

  // Message API
  async getRoomMessages(roomId: string, limit = 50, before?: string): Promise<{ messages: Message[]; hasMore: boolean }> {
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    if (before) params.append('before', before);

    const response = await this.request<{
      success: boolean;
      messages: Message[];
      hasMore: boolean;
    }>(`/api/rooms/${roomId}/messages?${params}`);

    return { messages: response.messages, hasMore: response.hasMore };
  }

  async getNewMessages(roomId: string, afterISO: string, limit = 50): Promise<{ messages: Message[] }> {
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    params.append('after', afterISO);
    const response = await this.request<{ success: boolean; messages: Message[] }>(`/api/rooms/${roomId}/messages?${params}`);
    return { messages: response.messages };
  }

  async sendMessageHTTP(roomId: string, content: string, type: string = 'text', metadata: any = {}, selfDestruct: any = {}, replyTo?: string): Promise<{ message: Message }> {
    const response = await this.request<{ success: boolean; message: Message }>(`/api/messages/${roomId}`, {
      method: 'POST',
      body: JSON.stringify({ content, type, metadata, selfDestruct, replyTo })
    });
    return { message: response.message };
  }

  async markMessageReadHTTP(messageId: string): Promise<void> {
    await this.request(`/api/messages/${messageId}/read`, { method: 'POST' });
  }

  async addReactionHTTP(messageId: string, reaction: string): Promise<{ reactions: Message['reactions'] }> {
    const response = await this.request<{ success: boolean; reactions: Message['reactions'] }>(`/api/messages/${messageId}/reactions`, {
      method: 'POST',
      body: JSON.stringify({ reaction })
    });
    return { reactions: response.reactions };
  }

  // File API
  async uploadFile(
    file: File,
    options: {
      roomId?: string;
      maxDownloads?: number;
      expiryTime?: number;
      password?: string;
      burnAfterReading?: boolean;
    } = {}
  ): Promise<{ file: FileUpload }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('options', JSON.stringify(options));

    const response = await fetch(`${this.baseURL}/api/files/upload`, {
      method: 'POST',
      headers: {
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('File upload failed');
    }

    const result = await response.json();
    return { file: result.file };
  }

  async getFileInfo(shareId: string): Promise<{ file: FileUpload }> {
    const response = await this.request<{ success: boolean; file: FileUpload }>(`/api/files/${shareId}`);
    return { file: response.file };
  }

  async downloadFile(shareId: string, password?: string): Promise<{ url: string; filename: string }> {
    const params = new URLSearchParams();
    if (password) params.append('password', password);

    const response = await this.request<{ success: boolean; url: string; filename: string }>(`/api/files/download/${shareId}?${params}`);
    return { url: response.url, filename: response.filename };
  }

  async getUserFiles(limit = 50): Promise<{ files: FileUpload[] }> {
    const response = await this.request<{ success: boolean; files: FileUpload[] }>(`/api/files/user?limit=${limit}`);
    return { files: response.files };
  }

  async deleteFile(fileId: string): Promise<void> {
    await this.request(`/api/files/${fileId}`, { method: 'DELETE' });
  }

  // Underground Features API
  async enableOnionRouting(roomId: string): Promise<{ circuit: string[]; status: string }> {
    const response = await this.request<{
      success: boolean;
      circuit: string[];
      status: string;
    }>('/api/underground/onion-routing', {
      method: 'POST',
      body: JSON.stringify({ roomId, enabled: true }),
    });

    return { circuit: response.circuit, status: response.status };
  }

  async mixCryptocurrency(data: {
    amount: number;
    currency: 'BTC' | 'XMR' | 'ZEC';
    outputAddresses: string[];
    delay: number;
  }): Promise<{ mixId: string; status: string; estimatedCompletion: Date }> {
    const response = await this.request<{
      success: boolean;
      mixId: string;
      status: string;
      estimatedCompletion: Date;
    }>('/api/underground/crypto-mixer', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    return {
      mixId: response.mixId,
      status: response.status,
      estimatedCompletion: response.estimatedCompletion
    };
  }

  async hideDataInMedia(data: {
    coverFile: File;
    hiddenMessage: string;
    algorithm: 'LSB' | 'DCT' | 'DWT' | 'spread_spectrum';
    password?: string;
  }): Promise<{ fileId: string; extractionKey: string }> {
    const formData = new FormData();
    formData.append('coverFile', data.coverFile);
    formData.append('hiddenMessage', data.hiddenMessage);
    formData.append('algorithm', data.algorithm);
    if (data.password) formData.append('password', data.password);

    const response = await fetch(`${this.baseURL}/api/underground/steganography`, {
      method: 'POST',
      headers: {
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Steganography operation failed');
    }

    const result = await response.json();
    return { fileId: result.fileId, extractionKey: result.extractionKey };
  }

  // Health Check
  async getHealthStatus(): Promise<{ status: string; services: any[] }> {
    const response = await fetch(`${this.baseURL}/health`);
    return await response.json();
  }
}

// Create API client instance
export const api = new APIClient(API_BASE_URL);

// WebSocket client for real-time features
export class WebSocketClient {
  private ws: WebSocket | null = null;
  private url: string;
  private token: string | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private eventHandlers: Map<string, Set<Function>> = new Map();

  constructor(url: string) {
    this.url = url;
  }

  connect(token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.token = token;
      this.ws = new WebSocket(`${this.url}/socket.io/?token=${token}`);

      this.ws.onopen = () => {
        console.log('✅ WebSocket connected');
        this.reconnectAttempts = 0;
        resolve();
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('🔌 WebSocket disconnected');
        this.attemptReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        reject(error);
      };
    });
  }

  private handleMessage(data: any) {
    const { type, payload } = data;
    const handlers = this.eventHandlers.get(type);
    
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(payload);
        } catch (error) {
          console.error(`Error in ${type} handler:`, error);
        }
      });
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts);
    this.reconnectAttempts++;

    setTimeout(() => {
      if (this.token) {
        console.log(`🔄 Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this.connect(this.token);
      }
    }, delay);
  }

  on(event: string, handler: Function) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)!.add(handler);
  }

  off(event: string, handler: Function) {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  emit(event: string, data: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: event, payload: data }));
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.token = null;
    this.eventHandlers.clear();
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

// Create WebSocket client instance
export const wsClient = new WebSocketClient(WS_URL);

// Error handling utility
export const handleAPIError = (error: Error, customMessage?: string) => {
  console.error('API Error:', error);
  
  toast({
    variant: "destructive",
    title: "Error",
    description: customMessage || error.message || "An unexpected error occurred"
  });
};

export default api;
