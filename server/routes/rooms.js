const express = require('express');
const bcrypt = require('bcryptjs');
const Room = require('../models/Room');
const Message = require('../models/Message');
const { verifyToken } = require('../middleware/auth');
const router = express.Router();

// Create a new room
router.post('/create', verifyToken, async (req, res) => {
  try {
    const {
      name,
      description,
      settings = {},
      security = {}
    } = req.body;
    
    // Validate room settings
    const validationResult = validateRoomSettings({ name, description, settings });
    if (!validationResult.isValid) {
      return res.status(400).json({
        error: 'Invalid room settings',
        message: validationResult.errors.join(', ')
      });
    }
    
    // Hash password if provided
    if (settings.password) {
      settings.password = await bcrypt.hash(settings.password, 12);
      settings.hasPassword = true;
    }
    
    // Create room
    const room = Room.createRoom(req.user, {
      name: name || `${req.user.nickname}'s Room`,
      description,
      ...settings
    });
    
    // Apply security settings
    if (security.isPrivate !== undefined) {
      room.security.isPrivate = security.isPrivate;
    }
    
    if (security.requireApproval !== undefined) {
      room.security.requireApproval = security.requireApproval;
    }
    
    // Add creator as first user
    await room.addUser(req.user);
    
    await room.save();
    
    res.status(201).json({
      success: true,
      message: 'Room created successfully',
      room: room.toSafeObject(req.user.userId),
      roomCode: room.roomCode,
      encryptionFingerprint: room.security.encryptionFingerprint
    });
    
  } catch (error) {
    console.error('Room creation error:', error);
    res.status(500).json({
      error: 'Failed to create room',
      message: 'Internal server error'
    });
  }
});

// Join a room
router.post('/join', authMiddleware, async (req, res) => {
  try {
    const { roomCode, password = null } = req.body;
    
    if (!roomCode) {
      return res.status(400).json({
        error: 'Room code required',
        message: 'Please provide a valid room code'
      });
    }
    
    // Find room
    const room = await Room.findOne({
      roomCode: roomCode.toUpperCase(),
      status: 'active',
      isActive: true
    });
    
    if (!room) {
      return res.status(404).json({
        error: 'Room not found',
        message: 'Invalid room code or room no longer exists'
      });
    }
    
    // Check if room has expired
    if (room.expiresAt && new Date() > room.expiresAt) {
      return res.status(410).json({
        error: 'Room expired',
        message: 'This room has expired and is no longer available'
      });
    }
    
    // Check if user is banned
    if (room.isUserBanned(req.user.userId)) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You have been banned from this room'
      });
    }
    
    // Check password if required
    if (room.settings.hasPassword && room.settings.password) {
      if (!password) {
        return res.status(401).json({
          error: 'Password required',
          message: 'This room requires a password'
        });
      }
      
      const isPasswordValid = await bcrypt.compare(password, room.settings.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          error: 'Invalid password',
          message: 'Incorrect room password'
        });
      }
    }
    
    // Check room capacity
    if (room.currentUserCount >= room.settings.maxUsers) {
      return res.status(423).json({
        error: 'Room full',
        message: 'This room has reached its maximum capacity'
      });
    }
    
    // Add user to room
    await room.addUser(req.user);
    
    // Update user stats
    req.user.updateStats('roomJoined');
    await req.user.save();
    
    res.json({
      success: true,
      message: 'Successfully joined room',
      room: room.toSafeObject(req.user.userId),
      encryptionKey: room.security.encryptionKey,
      encryptionFingerprint: room.security.encryptionFingerprint
    });
    
  } catch (error) {
    console.error('Room join error:', error);
    res.status(500).json({
      error: 'Failed to join room',
      message: 'Internal server error'
    });
  }
});

// Leave a room
router.post('/leave', authMiddleware, async (req, res) => {
  try {
    const { roomId } = req.body;
    
    if (!roomId) {
      return res.status(400).json({
        error: 'Room ID required'
      });
    }
    
    const room = await Room.findOne({ roomId });
    if (!room) {
      return res.status(404).json({
        error: 'Room not found'
      });
    }
    
    await room.removeUser(req.user.userId);
    
    res.json({
      success: true,
      message: 'Successfully left room'
    });
    
  } catch (error) {
    console.error('Room leave error:', error);
    res.status(500).json({
      error: 'Failed to leave room',
      message: 'Internal server error'
    });
  }
});

// Get room information
router.get('/:roomCode', authMiddleware, async (req, res) => {
  try {
    const { roomCode } = req.params;
    
    const room = await Room.findOne({
      roomCode: roomCode.toUpperCase(),
      status: 'active',
      isActive: true
    });
    
    if (!room) {
      return res.status(404).json({
        error: 'Room not found'
      });
    }
    
    // Check if user has access to room details
    const userInRoom = room.activeUsers.find(u => u.userId === req.user.userId);
    
    res.json({
      success: true,
      room: room.toSafeObject(userInRoom ? req.user.userId : null),
      userInRoom: !!userInRoom
    });
    
  } catch (error) {
    console.error('Room info error:', error);
    res.status(500).json({
      error: 'Failed to get room information',
      message: 'Internal server error'
    });
  }
});

// Update room settings (moderators only)
router.put('/:roomId/settings', authMiddleware, async (req, res) => {
  try {
    const { roomId } = req.params;
    const { settings } = req.body;
    
    const room = await Room.findOne({ roomId });
    if (!room) {
      return res.status(404).json({
        error: 'Room not found'
      });
    }
    
    // Check if user is moderator
    if (!room.isUserModerator(req.user.userId)) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'Only moderators can update room settings'
      });
    }
    
    // Validate settings
    const validationResult = validateRoomSettings({ settings });
    if (!validationResult.isValid) {
      return res.status(400).json({
        error: 'Invalid settings',
        message: validationResult.errors.join(', ')
      });
    }
    
    // Update settings
    room.settings = { ...room.settings, ...settings };
    
    // Hash password if updated
    if (settings.password) {
      room.settings.password = await bcrypt.hash(settings.password, 12);
      room.settings.hasPassword = true;
    }
    
    await room.save();
    
    res.json({
      success: true,
      message: 'Room settings updated successfully',
      settings: room.settings
    });
    
  } catch (error) {
    console.error('Room settings update error:', error);
    res.status(500).json({
      error: 'Failed to update room settings',
      message: 'Internal server error'
    });
  }
});

// Get room messages
router.get('/:roomId/messages', authMiddleware, async (req, res) => {
  try {
    const { roomId } = req.params;
    const { limit = 50, before } = req.query;
    
    // Check if user is in room
    const room = await Room.findOne({ roomId });
    if (!room) {
      return res.status(404).json({
        error: 'Room not found'
      });
    }
    
    const userInRoom = room.activeUsers.find(u => u.userId === req.user.userId);
    if (!userInRoom) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You must be in the room to view messages'
      });
    }
    
    // Get messages
    const messages = await Message.findByRoom(roomId, parseInt(limit), before);
    
    // Filter out destroyed messages and return safe objects
    const safeMessages = messages
      .filter(msg => !msg.selfDestruct?.isDestroyed)
      .map(msg => msg.toSafeObject(req.user.userId));
    
    res.json({
      success: true,
      messages: safeMessages,
      hasMore: messages.length === parseInt(limit)
    });
    
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      error: 'Failed to get messages',
      message: 'Internal server error'
    });
  }
});

// Get room users
router.get('/:roomId/users', authMiddleware, async (req, res) => {
  try {
    const { roomId } = req.params;
    
    const room = await Room.findOne({ roomId });
    if (!room) {
      return res.status(404).json({
        error: 'Room not found'
      });
    }
    
    // Check if user is in room
    const userInRoom = room.activeUsers.find(u => u.userId === req.user.userId);
    if (!userInRoom) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You must be in the room to view users'
      });
    }
    
    // Return active users
    const activeUsers = room.activeUsers
      .filter(user => user.isOnline)
      .map(user => ({
        userId: user.userId,
        nickname: user.nickname,
        role: user.role,
        joinedAt: user.joinedAt,
        lastSeen: user.lastSeen
      }));
    
    res.json({
      success: true,
      users: activeUsers,
      totalUsers: activeUsers.length
    });
    
  } catch (error) {
    console.error('Get room users error:', error);
    res.status(500).json({
      error: 'Failed to get room users',
      message: 'Internal server error'
    });
  }
});

// Ban user from room (moderators only)
router.post('/:roomId/ban', authMiddleware, async (req, res) => {
  try {
    const { roomId } = req.params;
    const { userId, reason } = req.body;
    
    if (!userId || !reason) {
      return res.status(400).json({
        error: 'User ID and reason required'
      });
    }
    
    const room = await Room.findOne({ roomId });
    if (!room) {
      return res.status(404).json({
        error: 'Room not found'
      });
    }
    
    // Check if user is moderator
    if (!room.isUserModerator(req.user.userId)) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'Only moderators can ban users'
      });
    }
    
    // Cannot ban other moderators
    if (room.isUserModerator(userId)) {
      return res.status(403).json({
        error: 'Cannot ban moderators'
      });
    }
    
    await room.banUser(userId, reason, req.user.userId);
    
    res.json({
      success: true,
      message: 'User banned successfully'
    });
    
  } catch (error) {
    console.error('Ban user error:', error);
    res.status(500).json({
      error: 'Failed to ban user',
      message: 'Internal server error'
    });
  }
});

// Extend room expiration (owner only)
router.post('/:roomId/extend', authMiddleware, async (req, res) => {
  try {
    const { roomId } = req.params;
    const { additionalTime } = req.body;
    
    if (!additionalTime || additionalTime < 0) {
      return res.status(400).json({
        error: 'Invalid additional time'
      });
    }
    
    const room = await Room.findOne({ roomId });
    if (!room) {
      return res.status(404).json({
        error: 'Room not found'
      });
    }
    
    // Check if user is owner
    const user = room.activeUsers.find(u => u.userId === req.user.userId);
    if (!user || user.role !== 'owner') {
      return res.status(403).json({
        error: 'Access denied',
        message: 'Only room owner can extend expiration'
      });
    }
    
    await room.extendExpiration(additionalTime);
    
    res.json({
      success: true,
      message: 'Room expiration extended successfully',
      newExpiresAt: room.expiresAt
    });
    
  } catch (error) {
    console.error('Extend room error:', error);
    res.status(500).json({
      error: 'Failed to extend room',
      message: 'Internal server error'
    });
  }
});

// Delete room (owner only)
router.delete('/:roomId', authMiddleware, async (req, res) => {
  try {
    const { roomId } = req.params;
    
    const room = await Room.findOne({ roomId });
    if (!room) {
      return res.status(404).json({
        error: 'Room not found'
      });
    }
    
    // Check if user is owner
    const user = room.activeUsers.find(u => u.userId === req.user.userId);
    if (!user || user.role !== 'owner') {
      return res.status(403).json({
        error: 'Access denied',
        message: 'Only room owner can delete the room'
      });
    }
    
    // Mark room as inactive instead of deleting (for audit purposes)
    room.status = 'archived';
    room.isActive = false;
    room.expiresAt = new Date(); // Expire immediately
    
    await room.save();
    
    // Delete all messages in the room
    await Message.deleteMany({ roomId });
    
    res.json({
      success: true,
      message: 'Room deleted successfully'
    });
    
  } catch (error) {
    console.error('Delete room error:', error);
    res.status(500).json({
      error: 'Failed to delete room',
      message: 'Internal server error'
    });
  }
});

// Get user's rooms
router.get('/user/rooms', authMiddleware, async (req, res) => {
  try {
    const rooms = await Room.find({
      'activeUsers.userId': req.user.userId,
      status: 'active',
      isActive: true
    }).sort({ 'stats.lastActivity': -1 });
    
    const safeRooms = rooms.map(room => room.toSafeObject(req.user.userId));
    
    res.json({
      success: true,
      rooms: safeRooms
    });
    
  } catch (error) {
    console.error('Get user rooms error:', error);
    res.status(500).json({
      error: 'Failed to get user rooms',
      message: 'Internal server error'
    });
  }
});

// Search public rooms
router.get('/search/public', async (req, res) => {
  try {
    const { query, limit = 20 } = req.query;
    
    const searchQuery = {
      status: 'active',
      isActive: true,
      'security.isPrivate': false,
      'security.requireApproval': false
    };
    
    if (query) {
      searchQuery.$or = [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { tags: { $in: [new RegExp(query, 'i')] } }
      ];
    }
    
    const rooms = await Room.find(searchQuery)
      .sort({ 'stats.peakConcurrentUsers': -1, 'stats.lastActivity': -1 })
      .limit(parseInt(limit));
    
    const safeRooms = rooms.map(room => ({
      roomId: room.roomId,
      roomCode: room.roomCode,
      name: room.name,
      description: room.description,
      currentUserCount: room.currentUserCount,
      maxUsers: room.settings.maxUsers,
      hasPassword: room.settings.hasPassword,
      category: room.category,
      tags: room.tags,
      stats: {
        totalUsers: room.stats.totalUsers,
        peakConcurrentUsers: room.stats.peakConcurrentUsers,
        lastActivity: room.stats.lastActivity
      }
    }));
    
    res.json({
      success: true,
      rooms: safeRooms
    });
    
  } catch (error) {
    console.error('Search rooms error:', error);
    res.status(500).json({
      error: 'Failed to search rooms',
      message: 'Internal server error'
    });
  }
});

module.exports = router;
