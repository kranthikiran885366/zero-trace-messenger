const express = require('express');
const { verifyToken } = require('../middleware/auth');
const Room = require('../models/Room');
const Message = require('../models/Message');

const router = express.Router();

// Send message via HTTP (fallback when WS isn't available)
router.post('/:roomId', verifyToken, async (req, res) => {
  try {
    const { roomId } = req.params;
    const { content, type = 'text', metadata = {}, selfDestruct = {}, replyTo = null } = req.body;

    if (!content || String(content).length === 0) {
      return res.status(400).json({ error: 'Content required' });
    }

    const room = await Room.findOne({ roomId, status: 'active', isActive: true });
    if (!room) return res.status(404).json({ error: 'Room not found' });

    const userInRoom = room.activeUsers.find(u => u.userId === req.user.userId);
    if (!userInRoom) return res.status(403).json({ error: 'You must be in the room to send messages' });

    const message = Message.createMessage({
      roomId,
      senderId: req.user.userId,
      senderNickname: req.user.nickname,
      content: String(content),
      type,
      metadata,
      selfDestruct: {
        enabled: !!selfDestruct.enabled,
        timer: selfDestruct.timer || 0,
        destructionType: selfDestruct.destructionType || 'timer'
      },
      thread: { parentId: replyTo },
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      deviceFingerprint: req.user.fingerprint
    });

    if (room.settings.enableE2EEncryption) {
      message.encrypt(room.security.encryptionKey);
    }

    if (message.selfDestruct.enabled && message.selfDestruct.timer > 0) {
      message.selfDestruct.expiresAt = new Date(Date.now() + message.selfDestruct.timer);
    }

    await message.save();
    await room.incrementMessageCount();

    res.status(201).json({ success: true, message: message.toSafeObject(req.user.userId) });
  } catch (error) {
    console.error('HTTP send message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Mark message as read
router.post('/:messageId/read', verifyToken, async (req, res) => {
  try {
    const { messageId } = req.params;
    const message = await Message.findOne({ messageId });
    if (!message) return res.status(404).json({ error: 'Message not found' });

    await message.markAsRead(req.user.userId, req.user.nickname);
    res.json({ success: true });
  } catch (error) {
    console.error('HTTP mark read error:', error);
    res.status(500).json({ error: 'Failed to mark as read' });
  }
});

// Add reaction
router.post('/:messageId/reactions', verifyToken, async (req, res) => {
  try {
    const { messageId } = req.params;
    const { reaction } = req.body;
    if (!reaction) return res.status(400).json({ error: 'Reaction required' });

    const message = await Message.findOne({ messageId });
    if (!message) return res.status(404).json({ error: 'Message not found' });

    await message.addReaction(req.user.userId, reaction);
    res.json({ success: true, reactions: message.reactions });
  } catch (error) {
    console.error('HTTP reaction error:', error);
    res.status(500).json({ error: 'Failed to add reaction' });
  }
});

module.exports = router;
