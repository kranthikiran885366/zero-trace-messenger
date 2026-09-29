/**
 * Real-time room management system
 */

export interface Room {
  id: string;
  name: string;
  description?: string;
  createdAt: number;
  createdBy: string;
  participants: string[];
  maxParticipants: number;
  isPrivate: boolean;
  hasPassword: boolean;
  isActive: boolean;
  lastActivity: number;
  messageCount: number;
  settings: {
    allowFileSharing: boolean;
    allowVideoCall: boolean;
    messageRetention: number; // in seconds
    autoDelete: boolean;
  };
}

export interface RoomMessage {
  id: string;
  roomId: string;
  userId: string;
  username: string;
  content: string;
  timestamp: number;
  type: 'text' | 'file' | 'system' | 'join' | 'leave';
  encrypted: boolean;
  expiresAt?: number;
}

export interface RoomParticipant {
  userId: string;
  username: string;
  joinedAt: number;
  lastSeen: number;
  isTyping: boolean;
  role: 'owner' | 'admin' | 'member';
  status: 'online' | 'away' | 'offline';
}

class RealTimeRoomManager {
  private rooms: Map<string, Room> = new Map();
  private roomMessages: Map<string, RoomMessage[]> = new Map();
  private roomParticipants: Map<string, Map<string, RoomParticipant>> = new Map();
  private eventListeners: Map<string, Set<Function>> = new Map();

  constructor() {
    this.initializeRooms();
    this.startRoomSimulation();
  }

  private initializeRooms() {
    // Create some initial rooms
    const initialRooms = [
      {
        name: 'General Discussion',
        description: 'Open discussion for all topics',
        isPrivate: false,
        hasPassword: false,
        maxParticipants: 50
      },
      {
        name: 'Tech Talk',
        description: 'Technology and programming discussions',
        isPrivate: false,
        hasPassword: false,
        maxParticipants: 30
      },
      {
        name: 'Private Group',
        description: 'Invitation-only secure chat',
        isPrivate: true,
        hasPassword: true,
        maxParticipants: 10
      }
    ];

    initialRooms.forEach((roomData, index) => {
      const room: Room = {
        id: `room_${Date.now()}_${index}`,
        name: roomData.name,
        description: roomData.description,
        createdAt: Date.now() - Math.random() * 3600000, // Random time in last hour
        createdBy: `user_admin_${index}`,
        participants: [],
        maxParticipants: roomData.maxParticipants,
        isPrivate: roomData.isPrivate,
        hasPassword: roomData.hasPassword,
        isActive: true,
        lastActivity: Date.now(),
        messageCount: Math.floor(Math.random() * 100),
        settings: {
          allowFileSharing: true,
          allowVideoCall: true,
          messageRetention: 3600, // 1 hour
          autoDelete: true
        }
      };

      this.rooms.set(room.id, room);
      this.roomMessages.set(room.id, []);
      this.roomParticipants.set(room.id, new Map());

      // Add some participants
      const participantCount = Math.floor(Math.random() * 8) + 2;
      for (let i = 0; i < participantCount; i++) {
        this.addParticipantToRoom(room.id, {
          userId: `user_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          username: `User${i + 1}`,
          joinedAt: Date.now() - Math.random() * 1800000, // Random time in last 30 minutes
          lastSeen: Date.now() - Math.random() * 300000, // Random time in last 5 minutes
          isTyping: false,
          role: i === 0 ? 'owner' : 'member',
          status: Math.random() > 0.3 ? 'online' : 'away'
        });
      }
    });
  }

  private startRoomSimulation() {
    // Simulate real-time room activity
    setInterval(() => {
      // Simulate new messages
      this.rooms.forEach((room, roomId) => {
        if (Math.random() < 0.4) {
          this.simulateMessage(roomId);
        }

        // Simulate user activity
        if (Math.random() < 0.3) {
          this.simulateUserActivity(roomId);
        }

        // Update last activity
        if (Math.random() < 0.6) {
          room.lastActivity = Date.now();
          this.emit('room_updated', { roomId, room });
        }
      });

      // Occasionally create a new room
      if (Math.random() < 0.1 && this.rooms.size < 10) {
        this.createRandomRoom();
      }
    }, 3000);
  }

  private simulateMessage(roomId: string) {
    const room = this.rooms.get(roomId);
    const participants = this.roomParticipants.get(roomId);
    
    if (!room || !participants || participants.size === 0) return;

    const participantArray = Array.from(participants.values());
    const sender = participantArray[Math.floor(Math.random() * participantArray.length)];

    const messages = [
      'Hello everyone!',
      'How is everyone doing?',
      'Great discussion here',
      'Thanks for sharing',
      'Interesting point',
      'I agree with that',
      'Let me know what you think',
      'See you later!',
      'Good morning!',
      'Have a great day!'
    ];

    const message: RoomMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`,
      roomId,
      userId: sender.userId,
      username: sender.username,
      content: messages[Math.floor(Math.random() * messages.length)],
      timestamp: Date.now(),
      type: 'text',
      encrypted: true,
      expiresAt: room.settings.autoDelete ? Date.now() + (room.settings.messageRetention * 1000) : undefined
    };

    const roomMessages = this.roomMessages.get(roomId) || [];
    roomMessages.push(message);
    
    // Keep only recent messages
    if (roomMessages.length > 100) {
      this.roomMessages.set(roomId, roomMessages.slice(-50));
    } else {
      this.roomMessages.set(roomId, roomMessages);
    }

    room.messageCount++;
    room.lastActivity = Date.now();

    this.emit('message_received', { roomId, message });
    this.emit('room_updated', { roomId, room });
  }

  private simulateUserActivity(roomId: string) {
    const participants = this.roomParticipants.get(roomId);
    if (!participants || participants.size === 0) return;

    const participantArray = Array.from(participants.values());
    const participant = participantArray[Math.floor(Math.random() * participantArray.length)];

    // Simulate typing
    if (Math.random() < 0.3) {
      participant.isTyping = !participant.isTyping;
      this.emit('user_typing', { 
        roomId, 
        userId: participant.userId, 
        isTyping: participant.isTyping 
      });
    }

    // Update last seen
    participant.lastSeen = Date.now();

    // Sometimes change status
    if (Math.random() < 0.1) {
      const statuses: ('online' | 'away' | 'offline')[] = ['online', 'away', 'offline'];
      participant.status = statuses[Math.floor(Math.random() * statuses.length)];
      this.emit('user_status_changed', { 
        roomId, 
        userId: participant.userId, 
        status: participant.status 
      });
    }
  }

  private createRandomRoom() {
    const roomNames = [
      'Study Group',
      'Project Planning',
      'Random Chat',
      'Support Group',
      'Gaming Discussion',
      'Art & Design',
      'Music Lovers',
      'Book Club'
    ];

    const room: Room = {
      id: `room_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`,
      name: roomNames[Math.floor(Math.random() * roomNames.length)],
      description: 'Dynamically created room',
      createdAt: Date.now(),
      createdBy: `user_${Date.now()}_creator`,
      participants: [],
      maxParticipants: Math.floor(Math.random() * 40) + 10,
      isPrivate: Math.random() < 0.3,
      hasPassword: Math.random() < 0.2,
      isActive: true,
      lastActivity: Date.now(),
      messageCount: 0,
      settings: {
        allowFileSharing: true,
        allowVideoCall: Math.random() > 0.2,
        messageRetention: 3600,
        autoDelete: Math.random() > 0.3
      }
    };

    this.rooms.set(room.id, room);
    this.roomMessages.set(room.id, []);
    this.roomParticipants.set(room.id, new Map());

    this.emit('room_created', { room });
  }

  private addParticipantToRoom(roomId: string, participant: RoomParticipant) {
    const participants = this.roomParticipants.get(roomId);
    if (participants) {
      participants.set(participant.userId, participant);
      
      const room = this.rooms.get(roomId);
      if (room) {
        room.participants = Array.from(participants.keys());
        this.emit('user_joined', { roomId, participant });
        this.emit('room_updated', { roomId, room });
      }
    }
  }

  // Public API methods
  getAllRooms(): Room[] {
    return Array.from(this.rooms.values()).filter(room => room.isActive);
  }

  getPublicRooms(): Room[] {
    return this.getAllRooms().filter(room => !room.isPrivate);
  }

  getRoom(roomId: string): Room | undefined {
    return this.rooms.get(roomId);
  }

  getRoomMessages(roomId: string): RoomMessage[] {
    return this.roomMessages.get(roomId) || [];
  }

  getRoomParticipants(roomId: string): RoomParticipant[] {
    const participants = this.roomParticipants.get(roomId);
    return participants ? Array.from(participants.values()) : [];
  }

  createRoom(roomData: Partial<Room>): Room {
    const room: Room = {
      id: `room_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`,
      name: roomData.name || 'New Room',
      description: roomData.description,
      createdAt: Date.now(),
      createdBy: roomData.createdBy || 'anonymous',
      participants: [],
      maxParticipants: roomData.maxParticipants || 25,
      isPrivate: roomData.isPrivate || false,
      hasPassword: roomData.hasPassword || false,
      isActive: true,
      lastActivity: Date.now(),
      messageCount: 0,
      settings: {
        allowFileSharing: true,
        allowVideoCall: true,
        messageRetention: 3600,
        autoDelete: true,
        ...roomData.settings
      }
    };

    this.rooms.set(room.id, room);
    this.roomMessages.set(room.id, []);
    this.roomParticipants.set(room.id, new Map());

    this.emit('room_created', { room });
    return room;
  }

  joinRoom(roomId: string, user: { userId: string; username: string }): boolean {
    const room = this.rooms.get(roomId);
    if (!room || !room.isActive) return false;

    const participants = this.roomParticipants.get(roomId);
    if (!participants) return false;

    if (participants.size >= room.maxParticipants) return false;

    const participant: RoomParticipant = {
      userId: user.userId,
      username: user.username,
      joinedAt: Date.now(),
      lastSeen: Date.now(),
      isTyping: false,
      role: participants.size === 0 ? 'owner' : 'member',
      status: 'online'
    };

    this.addParticipantToRoom(roomId, participant);
    return true;
  }

  leaveRoom(roomId: string, userId: string): boolean {
    const participants = this.roomParticipants.get(roomId);
    if (!participants) return false;

    const participant = participants.get(userId);
    if (!participant) return false;

    participants.delete(userId);
    
    const room = this.rooms.get(roomId);
    if (room) {
      room.participants = Array.from(participants.keys());
      this.emit('user_left', { roomId, participant });
      this.emit('room_updated', { roomId, room });
    }

    return true;
  }

  sendMessage(roomId: string, message: Omit<RoomMessage, 'id' | 'timestamp' | 'encrypted'>): RoomMessage | null {
    const room = this.rooms.get(roomId);
    if (!room || !room.isActive) return null;

    const fullMessage: RoomMessage = {
      ...message,
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`,
      timestamp: Date.now(),
      encrypted: true,
      expiresAt: room.settings.autoDelete ? Date.now() + (room.settings.messageRetention * 1000) : undefined
    };

    const roomMessages = this.roomMessages.get(roomId) || [];
    roomMessages.push(fullMessage);
    this.roomMessages.set(roomId, roomMessages);

    room.messageCount++;
    room.lastActivity = Date.now();

    this.emit('message_received', { roomId, message: fullMessage });
    this.emit('room_updated', { roomId, room });

    return fullMessage;
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
          console.error(`❌ Error in room manager event listener for ${eventType}:`, error);
        }
      });
    }
  }

  // Get stats for the main dashboard
  getStats() {
    const totalRooms = this.rooms.size;
    const activeRooms = Array.from(this.rooms.values()).filter(room => room.isActive).length;
    const totalParticipants = Array.from(this.roomParticipants.values())
      .reduce((total, participants) => total + participants.size, 0);
    const totalMessages = Array.from(this.roomMessages.values())
      .reduce((total, messages) => total + messages.length, 0);

    return {
      totalRooms,
      activeRooms,
      totalParticipants,
      totalMessages
    };
  }
}

// Singleton instance
let roomManager: RealTimeRoomManager | null = null;

export const getRoomManager = (): RealTimeRoomManager => {
  if (!roomManager) {
    roomManager = new RealTimeRoomManager();
  }
  return roomManager;
};

export default RealTimeRoomManager;
