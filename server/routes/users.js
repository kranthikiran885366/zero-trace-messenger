const express = require('express');
const { verifyToken } = require('../middleware/auth');
const User = require('../models/User');
const Message = require('../models/Message');
const Room = require('../models/Room');

const router = express.Router();

// Get current user stats
router.get('/stats', verifyToken, async (req, res) => {
  try {
    const user = req.user;
    // Aggregate quick stats
    const rooms = await Room.find({ 'activeUsers.userId': user.userId, status: 'active', isActive: true }).countDocuments();
    const messages = await Message.find({ senderId: user.userId }).countDocuments();

    res.json({
      success: true,
      stats: {
        ...user.stats,
        roomsJoined: rooms,
        messagesExchanged: messages,
      }
    });
  } catch (error) {
    console.error('User stats error:', error);
    res.status(500).json({ error: 'Failed to get user stats' });
  }
});

// Get own profile
router.get('/me', verifyToken, async (req, res) => {
  res.json({ success: true, user: req.user.toSafeObject() });
});

module.exports = router;
