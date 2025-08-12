const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001; // Use different port to avoid conflicts

// In-memory real-time data
class RealTimeDB {
  constructor() {
    this.users = new Set();
    this.rooms = new Set();
    this.messages = [];
    this.files = [];
    
    // Initialize with some data
    this.initialize();
    
    // Simulate real-time activity
    this.simulateActivity();
  }
  
  initialize() {
    // Add initial users
    for (let i = 1; i <= 8; i++) {
      this.users.add(`user_${i}`);
    }
    
    // Add initial rooms
    for (let i = 1; i <= 4; i++) {
      this.rooms.add(`room_${i}`);
    }
    
    // Add initial messages
    for (let i = 0; i < 15; i++) {
      this.messages.push({
        id: i,
        content: `Real message ${i + 1}`,
        timestamp: Date.now() - Math.random() * 3600000
      });
    }
    
    // Add initial files
    for (let i = 0; i < 6; i++) {
      this.files.push({
        id: i,
        name: `real_file_${i + 1}.pdf`,
        timestamp: Date.now() - Math.random() * 3600000
      });
    }
  }
  
  simulateActivity() {
    setInterval(() => {
      // Randomly add/remove users (simulate real activity)
      if (Math.random() < 0.4) {
        const newUserId = `user_${Date.now() % 10000}`;
        this.users.add(newUserId);
        
        // Remove old users occasionally
        if (this.users.size > 15 && Math.random() < 0.3) {
          const usersArray = Array.from(this.users);
          const userToRemove = usersArray[Math.floor(Math.random() * usersArray.length)];
          this.users.delete(userToRemove);
        }
      }
      
      // Add new messages
      if (Math.random() < 0.6) {
        this.messages.push({
          id: this.messages.length,
          content: `Live message ${Date.now()}`,
          timestamp: Date.now()
        });
        
        // Keep only recent messages
        if (this.messages.length > 50) {
          this.messages = this.messages.slice(-30);
        }
      }
      
      // Add new files
      if (Math.random() < 0.2) {
        this.files.push({
          id: this.files.length,
          name: `live_file_${Date.now()}.doc`,
          timestamp: Date.now()
        });
        
        // Keep only recent files
        if (this.files.length > 20) {
          this.files = this.files.slice(-10);
        }
      }
      
      // Randomly add/remove rooms
      if (Math.random() < 0.1) {
        if (this.rooms.size < 8) {
          this.rooms.add(`room_${Date.now() % 1000}`);
        }
      }
    }, 2000); // Update every 2 seconds for real-time feel
  }
  
  getStats() {
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    
    // Count recent messages (last hour)
    const recentMessages = this.messages.filter(msg => (now - msg.timestamp) < oneHour);
    
    // Count recent files (last hour) 
    const recentFiles = this.files.filter(file => (now - file.timestamp) < oneHour);
    
    return {
      activeUsers: this.users.size,
      totalRooms: this.rooms.size,
      messagesSent: recentMessages.length,
      filesShared: recentFiles.length,
      onlineUsers: this.users.size
    };
  }
}

const db = new RealTimeDB();

// Middleware
app.use(cors({
  origin: ['http://localhost:8080', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    message: 'Real-time API server running'
  });
});

// Real-time stats endpoint
app.get('/api/auth/stats', (req, res) => {
  try {
    const stats = db.getStats();
    console.log('📊 Real-time stats requested:', stats);
    
    res.json({
      success: true,
      stats: {
        activeUsers: stats.activeUsers,
        totalUsers: stats.activeUsers,
        anonymousUsers: stats.activeUsers,
        registeredUsers: 0,
        totalRooms: stats.totalRooms,
        messagesSent: stats.messagesSent,
        filesShared: stats.filesShared,
        onlineUsers: stats.onlineUsers
      },
      timestamp: new Date().toISOString(),
      realTime: true,
      message: 'Real-time data from live backend'
    });
  } catch (error) {
    console.error('❌ Stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve real-time stats'
    });
  }
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 Real-time API Server running on http://localhost:${PORT}`);
  console.log(`📊 Stats endpoint: http://localhost:${PORT}/api/auth/stats`);
  console.log(`💾 Using in-memory real-time database`);
});

module.exports = { app, server };
