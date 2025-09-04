const express = require('express');
const cors = require('cors');
const inMemoryDB = require('./utils/inMemoryDB');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: ['http://localhost:8080', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Anonymous authentication endpoint
app.post('/api/auth/anonymous', (req, res) => {
  try {
    const userId = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
    const fingerprint = `fp_${Date.now()}_${Math.random().toString(36).substr(2, 12)}`;

    const anonymousUser = {
      _id: userId,
      userId: userId,
      nickname: req.body.nickname || `Anonymous_${Math.floor(Math.random() * 9999)}`,
      fingerprint: fingerprint,
      isAnonymous: true,
      preferences: req.body.preferences || {
        theme: 'cyber',
        autoDeleteMessages: true,
        enableNotifications: true,
        showTypingIndicators: false,
        autoJoinVideo: false,
        defaultMessageTimer: 300000,
        preferredQuality: 'medium',
        enableSteganography: false,
        enableOnionRouting: false
      },
      stats: {
        roomsJoined: 0,
        messagesExchanged: 0,
        filesShared: 0,
        callMinutes: 0
      },
      status: 'online',
      createdAt: new Date(),
      lastActive: new Date()
    };

    const sessionToken = `session_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`;

    // Store user in memory
    inMemoryDB.createUser(anonymousUser);

    console.log('🎭 Anonymous session created:', { userId, nickname: anonymousUser.nickname });

    res.json({
      success: true,
      user: anonymousUser,
      token: sessionToken,
      expiresIn: 3600000,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Anonymous auth error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create anonymous session'
    });
  }
});

// Room creation endpoint
app.post('/api/rooms', (req, res) => {
  try {
    const { name, description, settings } = req.body;

    const roomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
    const roomCode = Math.random().toString(36).substr(2, 6).toUpperCase();

    const room = {
      _id: roomId,
      roomId: roomId,
      roomCode: roomCode,
      name: name || 'New Room',
      description: description || '',
      createdBy: req.headers.authorization || 'anonymous',
      settings: {
        maxUsers: settings?.maxUsers || 25,
        hasPassword: settings?.hasPassword || false,
        enableVideo: settings?.enableVideo || true,
        enableFileSharing: settings?.enableFileSharing || true,
        enableScreenShare: settings?.enableScreenShare || false,
        enableVoiceNotes: settings?.enableVoiceNotes || true,
        messageTimer: settings?.messageTimer || 0,
        allowAnonymous: settings?.allowAnonymous !== false,
        enableE2E: settings?.enableE2E !== false,
        theme: settings?.theme || 'cyber'
      },
      participants: [],
      messageCount: 0,
      isActive: true,
      createdAt: new Date(),
      lastActivity: new Date()
    };

    // Store room in memory
    inMemoryDB.createRoom(room);

    console.log('🏠 Room created:', { roomId, roomCode, name });

    res.json({
      success: true,
      room: room,
      roomCode: roomCode,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Room creation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create room'
    });
  }
});

// Get all rooms
app.get('/api/rooms', (req, res) => {
  try {
    const rooms = inMemoryDB.getAllRooms();
    res.json({
      success: true,
      rooms: rooms,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Get rooms error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve rooms'
    });
  }
});

// Get room by ID
app.get('/api/rooms/:roomId', (req, res) => {
  try {
    const room = inMemoryDB.getRoomById(req.params.roomId);
    if (!room) {
      return res.status(404).json({
        success: false,
        error: 'Room not found'
      });
    }

    res.json({
      success: true,
      room: room,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Get room error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve room'
    });
  }
});

// Real-time stats endpoint
app.get('/api/auth/stats', (req, res) => {
  try {
    const stats = inMemoryDB.getStats();
    console.log('📊 Stats requested:', stats);

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
      realTime: true
    });
  } catch (error) {
    console.error('❌ Stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve stats'
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 SecureChat Backend running on port ${PORT}`);
  console.log(`📊 Real-time stats available at http://localhost:${PORT}/api/auth/stats`);
  console.log(`🔗 Health check at http://localhost:${PORT}/health`);
});

module.exports = app;
