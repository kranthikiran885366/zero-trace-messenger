# SecureChat Backend Integration Documentation

## Overview

This document outlines the complete integration between the SecureChat frontend and backend services, including real-time features, database operations, and microservices architecture.

## Architecture

### Frontend (React + TypeScript)
- **Framework**: React 18 with TypeScript
- **State Management**: React Context + Zustand
- **Real-time**: WebSocket client with automatic reconnection
- **API Layer**: Custom API client with authentication and error handling
- **UI Framework**: ShadCN UI + Tailwind CSS

### Backend (Node.js Microservices)
- **API Gateway**: Express.js with load balancing and circuit breakers
- **Authentication Service**: JWT-based with anonymous sessions
- **User Service**: User management and preferences
- **Room Service**: Chat room creation and management
- **Message Service**: Real-time messaging with encryption
- **File Service**: Secure file upload and sharing
- **Notification Service**: WebSocket server for real-time events
- **Underground Service**: Advanced privacy features

### Database (MongoDB)
- **Primary Database**: MongoDB with replica sets
- **Real-time Sync**: Change streams for live updates
- **Data Encryption**: Field-level encryption for sensitive data
- **Backup Strategy**: Automated backups with encryption

## API Integration

### Authentication Flow

```typescript
// 1. Anonymous Session Creation
const { user, token } = await api.createAnonymousSession('nickname', preferences);

// 2. WebSocket Connection
await wsClient.connect(token);

// 3. Real-time Event Handling
wsClient.on('new_message', handleNewMessage);
wsClient.on('user_joined', handleUserJoined);
```

### Room Management

```typescript
// Create Room
const { room, roomCode } = await api.createRoom({
  name: 'Secure Discussion',
  maxUsers: 10,
  enableVideo: true,
  autoDestroy: 3600000 // 1 hour
});

// Join Room
const { room, encryptionKey } = await api.joinRoom(roomCode, password);

// Real-time Room Events
wsClient.emit('join_room', { roomId: room.roomId });
```

### Messaging System

```typescript
// Send Message
await api.sendMessage('Hello World', 'text', {
  selfDestruct: { enabled: true, timer: 300000 }
});

// Real-time Message Events
wsClient.on('new_message', (message: Message) => {
  setMessages(prev => [...prev, message]);
});

// Message Encryption (handled automatically)
const encryptedMessage = message.encrypt(roomEncryptionKey);
```

### File Sharing

```typescript
// Upload File
const { file } = await api.uploadFile(selectedFile, {
  roomId: currentRoom.roomId,
  maxDownloads: 5,
  expiryTime: 86400000, // 24 hours
  burnAfterReading: true
});

// Share in Room
await api.sendMessage(`File: ${file.originalName}`, 'file', {
  fileId: file.fileId,
  url: file.url
});
```

## Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  userId: String, // Unique identifier
  nickname: String,
  fingerprint: String, // Device fingerprint
  isAnonymous: Boolean,
  preferences: {
    theme: String,
    autoDeleteMessages: Boolean,
    enableNotifications: Boolean,
    // ... more preferences
  },
  stats: {
    roomsJoined: Number,
    messagesExchanged: Number,
    filesShared: Number,
    callMinutes: Number
  },
  security: {
    ipHistory: [{ ip: String, timestamp: Date }],
    suspiciousActivity: [{ type: String, severity: String }]
  },
  createdAt: Date,
  lastActive: Date
}
```

### Rooms Collection
```javascript
{
  _id: ObjectId,
  roomId: String,
  roomCode: String, // 16-char hex code
  name: String,
  description: String,
  createdBy: ObjectId,
  settings: {
    maxUsers: Number,
    hasPassword: Boolean,
    enableVideo: Boolean,
    enableFileSharing: Boolean,
    autoDestroy: Number,
    messageRetention: Number
  },
  security: {
    encryptionKey: String,
    encryptionFingerprint: String,
    bannedUsers: [{ userId: String, reason: String }]
  },
  activeUsers: [{
    userId: String,
    nickname: String,
    joinedAt: Date,
    role: String // member, moderator, admin, owner
  }],
  stats: {
    totalMessages: Number,
    totalUsers: Number,
    peakConcurrentUsers: Number,
    lastActivity: Date
  },
  expiresAt: Date,
  createdAt: Date
}
```

### Messages Collection
```javascript
{
  _id: ObjectId,
  messageId: String,
  roomId: String,
  senderId: String,
  senderNickname: String,
  content: String, // Encrypted
  type: String, // text, file, image, video, system
  encryption: {
    algorithm: String,
    isEncrypted: Boolean,
    keyFingerprint: String
  },
  selfDestruct: {
    enabled: Boolean,
    timer: Number,
    expiresAt: Date,
    destructionType: String
  },
  readBy: [{
    userId: String,
    readAt: Date,
    nickname: String
  }],
  reactions: [{
    userId: String,
    reaction: String,
    addedAt: Date
  }],
  metadata: {
    // File metadata for file messages
    fileSize: Number,
    mimeType: String,
    filename: String,
    // Reply metadata
    replyTo: String,
    // Edit metadata
    isEdited: Boolean,
    editedAt: Date
  },
  createdAt: Date
}
```

### Files Collection
```javascript
{
  _id: ObjectId,
  fileId: String,
  shareId: String, // Public sharing ID
  originalName: String,
  storedName: String,
  mimeType: String,
  size: Number,
  uploadedBy: String,
  roomId: String,
  encryption: {
    isEncrypted: Boolean,
    algorithm: String,
    keyFingerprint: String
  },
  access: {
    isPublic: Boolean,
    hasPassword: Boolean,
    maxDownloads: Number,
    downloadCount: Number,
    expiresAt: Date,
    burnAfterReading: Boolean
  },
  processing: {
    isProcessed: Boolean,
    virusScanResult: String,
    thumbnailGenerated: Boolean
  },
  createdAt: Date
}
```

## Real-time Features

### WebSocket Events

#### Client → Server
```typescript
// Room Management
'join_room' → { roomId: string, roomCode: string }
'leave_room' → { roomId: string }

// Messaging
'send_message' → { roomId: string, content: string, type: string, metadata: object }
'mark_message_read' → { messageId: string }
'add_reaction' → { messageId: string, reaction: string }

// Typing Indicators
'typing_start' → { roomId: string }
'typing_stop' → { roomId: string }

// Video Calls
'video_call_invite' → { roomId: string, targetUserId?: string }
'video_call_response' → { targetUserId: string, accepted: boolean }
'webrtc_offer' → { targetUserId: string, offer: RTCSessionDescription }
'webrtc_answer' → { targetUserId: string, answer: RTCSessionDescription }
'webrtc_ice_candidate' → { targetUserId: string, candidate: RTCIceCandidate }

// File Sharing
'file_shared' → { roomId: string, fileId: string, fileName: string }

// User Activity
'user_activity' → {}
```

#### Server → Client
```typescript
// Room Events
'room_joined' → { room: Room, encryptionKey: string }
'room_left' → { roomId: string }
'user_joined' → { user: User, message: string }
'user_left' → { userId: string, nickname: string, message: string }

// Message Events
'new_message' → Message
'message_read' → { messageId: string, readBy: string, readAt: Date }
'message_reaction' → { messageId: string, reactions: Reaction[] }
'message_destroyed' → { messageId: string }
'recent_messages' → { messages: Message[] }

// Typing Events
'user_typing' → { userId: string, nickname: string, isTyping: boolean }

// File Events
'file_shared_notification' �� { from: string, fileName: string, fileSize: number }

// Video Call Events
'video_call_invite' → { from: string, fromNickname: string, roomId: string }
'video_call_response' → { from: string, accepted: boolean }
'webrtc_offer' → { from: string, offer: RTCSessionDescription }
'webrtc_answer' → { from: string, answer: RTCSessionDescription }
'webrtc_ice_candidate' → { from: string, candidate: RTCIceCandidate }

// System Events
'error' → { type: string, message: string }
'user_updated' → User
'force_logout' → { reason: string }
```

## Security Implementation

### End-to-End Encryption
```typescript
// Message Encryption (Client-side)
const encryptMessage = (content: string, roomKey: string) => {
  const iv = crypto.getRandomValues(new Uint8Array(16));
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  
  return crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    roomKey,
    data
  );
};

// Server-side Encryption (Additional Layer)
const serverEncrypt = (data: string, encryptionKey: string) => {
  const algorithm = 'aes-256-gcm';
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipher(algorithm, encryptionKey, iv);
  
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return {
    encrypted,
    iv: iv.toString('hex'),
    authTag: cipher.getAuthTag().toString('hex')
  };
};
```

### Authentication & Authorization
```typescript
// JWT Token Verification
const verifyToken = async (token: string) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user || !user.isActive) {
      throw new Error('User not found or inactive');
    }
    
    return { valid: true, user };
  } catch (error) {
    return { valid: false, error: error.message };
  }
};

// Role-based Access Control
const checkRoomPermission = (user: User, room: Room, action: string) => {
  const userInRoom = room.activeUsers.find(u => u.userId === user.userId);
  
  if (!userInRoom) return false;
  
  const permissions = {
    'send_message': ['member', 'moderator', 'admin', 'owner'],
    'ban_user': ['moderator', 'admin', 'owner'],
    'update_settings': ['admin', 'owner'],
    'delete_room': ['owner']
  };
  
  return permissions[action]?.includes(userInRoom.role) || false;
};
```

## Error Handling

### Frontend Error Handling
```typescript
// API Error Handler
export const handleAPIError = (error: Error, customMessage?: string) => {
  console.error('API Error:', error);
  
  // Show user-friendly error message
  toast({
    variant: "destructive",
    title: "Error",
    description: customMessage || error.message || "An unexpected error occurred"
  });
  
  // Log error for monitoring
  if (import.meta.env.VITE_SENTRY_DSN) {
    Sentry.captureException(error);
  }
};

// WebSocket Error Handling
wsClient.on('error', (error) => {
  console.error('WebSocket error:', error);
  
  // Attempt reconnection
  if (!wsClient.isConnected()) {
    setTimeout(() => {
      if (api.isAuthenticated()) {
        wsClient.connect(localStorage.getItem('auth_token'));
      }
    }, 5000);
  }
});
```

### Backend Error Handling
```javascript
// Global Error Handler
app.use((error, req, res, next) => {
  console.error('Server Error:', error);
  
  // Log error for monitoring
  logger.error({
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    userId: req.user?.userId,
    timestamp: new Date().toISOString()
  });
  
  // Send appropriate response
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal server error';
  
  res.status(statusCode).json({
    error: message,
    requestId: req.requestId,
    timestamp: new Date().toISOString()
  });
});

// Circuit Breaker Pattern
class CircuitBreaker {
  constructor(serviceName, options = {}) {
    this.serviceName = serviceName;
    this.failureThreshold = options.failureThreshold || 5;
    this.recoveryTimeout = options.recoveryTimeout || 60000;
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.failureCount = 0;
    this.lastFailureTime = null;
  }

  async call(fn) {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime >= this.recoveryTimeout) {
        this.state = 'HALF_OPEN';
      } else {
        throw new Error(`Circuit breaker is OPEN for ${this.serviceName}`);
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  onSuccess() {
    this.failureCount = 0;
    this.state = 'CLOSED';
  }

  onFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    
    if (this.failureCount >= this.failureThreshold) {
      this.state = 'OPEN';
    }
  }
}
```

## Performance Optimization

### Frontend Optimizations
```typescript
// React Query for API Caching
const { data: userRooms, isLoading } = useQuery({
  queryKey: ['user-rooms', user?.userId],
  queryFn: () => api.getUserRooms(),
  enabled: !!user,
  staleTime: 5 * 60 * 1000, // 5 minutes
  cacheTime: 10 * 60 * 1000 // 10 minutes
});

// Message Virtualization
const VirtualizedMessageList = ({ messages }) => {
  return (
    <FixedSizeList
      height={600}
      itemCount={messages.length}
      itemSize={80}
      itemData={messages}
    >
      {MessageItem}
    </FixedSizeList>
  );
};

// Lazy Loading
const LazyFileShare = lazy(() => import('./pages/FileShare'));
const LazyDarkWebHub = lazy(() => import('./pages/DarkWebHub'));
```

### Backend Optimizations
```javascript
// Database Indexing
db.messages.createIndex({ roomId: 1, createdAt: -1 });
db.rooms.createIndex({ roomCode: 1 });
db.users.createIndex({ userId: 1 });
db.files.createIndex({ shareId: 1 });

// Connection Pooling
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI, {
  maxPoolSize: 10,
  bufferMaxEntries: 0,
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Redis Caching
const redis = require('redis');
const client = redis.createClient(process.env.REDIS_URL);

const cacheUserSession = async (userId, sessionData) => {
  await client.setex(`session:${userId}`, 3600, JSON.stringify(sessionData));
};

// Background Jobs
const cron = require('node-cron');

// Cleanup expired messages every 5 minutes
cron.schedule('*/5 * * * *', async () => {
  const expiredMessages = await Message.findExpiredMessages();
  
  for (const message of expiredMessages) {
    await message.destroy();
  }
});
```

## Deployment

### Frontend Deployment
```yaml
# Docker configuration
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY dist/ ./dist/

EXPOSE 3000

CMD ["npx", "serve", "-s", "dist", "-l", "3000"]
```

### Backend Deployment
```yaml
# docker-compose.yml
version: '3.8'

services:
  api-gateway:
    build: ./api-gateway
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=${MONGODB_URI}
      - REDIS_URL=${REDIS_URL}
    depends_on:
      - mongodb
      - redis

  auth-service:
    build: ./auth-service
    environment:
      - NODE_ENV=production
      - MONGODB_URI=${MONGODB_URI}
      - JWT_SECRET=${JWT_SECRET}

  mongodb:
    image: mongo:6.0
    volumes:
      - mongodb_data:/data/db
    environment:
      - MONGO_INITDB_ROOT_USERNAME=${MONGO_USERNAME}
      - MONGO_INITDB_ROOT_PASSWORD=${MONGO_PASSWORD}

  redis:
    image: redis:7.0-alpine
    volumes:
      - redis_data:/data

volumes:
  mongodb_data:
  redis_data:
```

## Monitoring & Analytics

### Health Checks
```typescript
// Frontend Health Check
const checkBackendHealth = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    const health = await response.json();
    
    return {
      status: health.status,
      services: health.services,
      responseTime: Date.now() - startTime
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message
    };
  }
};

// Backend Health Check
app.get('/health', async (req, res) => {
  const checks = await Promise.allSettled([
    mongoose.connection.readyState === 1,
    redis.ping(),
    // ... other service checks
  ]);

  const allHealthy = checks.every(check => 
    check.status === 'fulfilled' && check.value
  );

  res.status(allHealthy ? 200 : 503).json({
    status: allHealthy ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    checks: checks.map(check => ({
      status: check.status,
      value: check.status === 'fulfilled' ? check.value : check.reason
    }))
  });
});
```

## Testing

### Frontend Testing
```typescript
// API Integration Tests
describe('API Client', () => {
  test('should create anonymous session', async () => {
    const { user, token } = await api.createAnonymousSession('testuser');
    
    expect(user.nickname).toBe('testuser');
    expect(user.isAnonymous).toBe(true);
    expect(token).toBeDefined();
  });

  test('should join room with valid code', async () => {
    const { room } = await api.joinRoom('A1B2C3D4E5F6G7H8');
    
    expect(room.roomCode).toBe('A1B2C3D4E5F6G7H8');
    expect(room.activeUsers).toContainEqual(
      expect.objectContaining({ userId: testUser.userId })
    );
  });
});

// WebSocket Tests
describe('WebSocket Client', () => {
  test('should connect and receive messages', (done) => {
    wsClient.connect(testToken);
    
    wsClient.on('new_message', (message) => {
      expect(message.content).toBe('Test message');
      done();
    });
    
    wsClient.emit('send_message', {
      roomId: testRoom.roomId,
      content: 'Test message'
    });
  });
});
```

### Backend Testing
```javascript
// API Endpoint Tests
describe('Room API', () => {
  test('POST /api/rooms/create', async () => {
    const response = await request(app)
      .post('/api/rooms/create')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Test Room',
        settings: { maxUsers: 10 }
      });

    expect(response.status).toBe(201);
    expect(response.body.room.name).toBe('Test Room');
    expect(response.body.roomCode).toMatch(/^[A-F0-9]{16}$/);
  });
});

// Database Tests
describe('Message Model', () => {
  test('should create encrypted message', async () => {
    const message = Message.createMessage({
      roomId: testRoom.roomId,
      senderId: testUser.userId,
      content: 'Test message'
    });

    message.encrypt(testEncryptionKey);
    await message.save();

    expect(message.encryption.isEncrypted).toBe(true);
    expect(message.content).not.toBe('Test message');
  });
});
```

This comprehensive integration ensures that the SecureChat frontend and backend work seamlessly together, providing real-time secure communication with enterprise-grade features and reliability.
