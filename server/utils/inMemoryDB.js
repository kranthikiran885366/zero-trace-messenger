/**
 * In-memory database for real-time statistics without MongoDB dependency
 */

class InMemoryDB {
  constructor() {
    this.users = new Map();
    this.rooms = new Map();
    this.messages = [];
    this.files = [];
    this.stats = {
      activeUsers: 0,
      totalRooms: 0,
      messagesSent: 0,
      filesShared: 0,
      onlineUsers: 0
    };
    
    // Simulate some real-time activity
    this.simulateActivity();
  }

  // User management
  addUser(userId, userData) {
    this.users.set(userId, {
      ...userData,
      lastActive: Date.now(),
      isActive: true
    });
    this.updateStats();
  }

  removeUser(userId) {
    this.users.delete(userId);
    this.updateStats();
  }

  updateUserActivity(userId) {
    const user = this.users.get(userId);
    if (user) {
      user.lastActive = Date.now();
      this.updateStats();
    }
  }

  // Room management
  addRoom(roomId, roomData) {
    this.rooms.set(roomId, {
      ...roomData,
      createdAt: Date.now(),
      isActive: true,
      participants: new Set()
    });
    this.updateStats();
  }

  removeRoom(roomId) {
    this.rooms.delete(roomId);
    this.updateStats();
  }

  joinRoom(roomId, userId) {
    const room = this.rooms.get(roomId);
    if (room) {
      room.participants.add(userId);
      this.updateStats();
    }
  }

  leaveRoom(roomId, userId) {
    const room = this.rooms.get(roomId);
    if (room) {
      room.participants.delete(userId);
      this.updateStats();
    }
  }

  // Message management
  addMessage(messageData) {
    this.messages.push({
      ...messageData,
      id: Date.now() + Math.random(),
      timestamp: Date.now()
    });
    this.updateStats();
  }

  // File management
  addFile(fileData) {
    this.files.push({
      ...fileData,
      id: Date.now() + Math.random(),
      timestamp: Date.now()
    });
    this.updateStats();
  }

  // Statistics
  updateStats() {
    const now = Date.now();
    const activeThreshold = 5 * 60 * 1000; // 5 minutes
    
    // Count active users (active within last 5 minutes)
    const activeUsers = Array.from(this.users.values())
      .filter(user => user.isActive && (now - user.lastActive) < activeThreshold);
    
    // Count active rooms
    const activeRooms = Array.from(this.rooms.values())
      .filter(room => room.isActive && room.participants.size > 0);
    
    // Count messages sent today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const messagesToday = this.messages.filter(msg => msg.timestamp >= today.getTime());
    
    // Count files shared today
    const filesToday = this.files.filter(file => file.timestamp >= today.getTime());
    
    this.stats = {
      activeUsers: activeUsers.length,
      totalRooms: activeRooms.length,
      messagesSent: messagesToday.length,
      filesShared: filesToday.length,
      onlineUsers: activeUsers.length
    };
  }

  // Simulate real-time activity for demonstration
  simulateActivity() {
    // Add some initial users
    for (let i = 1; i <= 5; i++) {
      this.addUser(`user_${i}`, {
        nickname: `User${i}`,
        isAnonymous: true,
        joinedAt: Date.now() - Math.random() * 3600000 // Random time in last hour
      });
    }

    // Add some initial rooms
    for (let i = 1; i <= 3; i++) {
      const roomId = `room_${i}`;
      this.addRoom(roomId, {
        name: `Room ${i}`,
        description: `Demo room ${i}`
      });
      
      // Add some participants
      this.joinRoom(roomId, `user_${i}`);
      if (i > 1) this.joinRoom(roomId, `user_${i-1}`);
    }

    // Add some initial messages
    for (let i = 0; i < 10; i++) {
      this.addMessage({
        content: `Message ${i + 1}`,
        roomId: `room_${(i % 3) + 1}`,
        userId: `user_${(i % 5) + 1}`
      });
    }

    // Add some initial files
    for (let i = 0; i < 3; i++) {
      this.addFile({
        filename: `file_${i + 1}.txt`,
        size: Math.floor(Math.random() * 1000000),
        userId: `user_${(i % 5) + 1}`
      });
    }

    // Simulate ongoing activity
    setInterval(() => {
      // Randomly add a user
      if (Math.random() < 0.3) {
        const userId = `user_${Date.now()}`;
        this.addUser(userId, {
          nickname: `User${Math.floor(Math.random() * 1000)}`,
          isAnonymous: true,
          joinedAt: Date.now()
        });
      }

      // Randomly add a message
      if (Math.random() < 0.5) {
        const rooms = Array.from(this.rooms.keys());
        const users = Array.from(this.users.keys());
        if (rooms.length > 0 && users.length > 0) {
          this.addMessage({
            content: `Auto message ${Date.now()}`,
            roomId: rooms[Math.floor(Math.random() * rooms.length)],
            userId: users[Math.floor(Math.random() * users.length)]
          });
        }
      }

      // Update user activity
      const users = Array.from(this.users.keys());
      if (users.length > 0) {
        const randomUser = users[Math.floor(Math.random() * users.length)];
        this.updateUserActivity(randomUser);
      }
    }, 5000); // Update every 5 seconds
  }

  getStats() {
    this.updateStats();
    return this.stats;
  }

  // Get all active users
  getActiveUsers() {
    const now = Date.now();
    const activeThreshold = 5 * 60 * 1000; // 5 minutes
    
    return Array.from(this.users.values())
      .filter(user => user.isActive && (now - user.lastActive) < activeThreshold);
  }
}

// Export singleton instance
const inMemoryDB = new InMemoryDB();
module.exports = inMemoryDB;
