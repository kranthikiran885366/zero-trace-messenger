const Room = require('../models/Room');
const Message = require('../models/Message');
const User = require('../models/User');
const crypto = require('crypto');

// Store active connections
const activeConnections = new Map();
const roomConnections = new Map();

const kafka = require('../services/kafka');
const redis = require('../services/redis');

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log(`🔗 User ${socket.user.nickname} connected (${socket.userId})`);

    // Store connection
    activeConnections.set(socket.userId, {
      socket,
      user: socket.user,
      joinedRooms: new Set(),
      lastActivity: new Date()
    });

    // Presence in Redis
    redis.sadd && redis.sadd('presence:online', socket.userId);

    // Publish connect event
    kafka.publish && kafka.publish('securechat.events', { type: 'user.connected', userId: socket.userId, at: Date.now() });
    
    // Update user status
    socket.user.status = 'online';
    socket.user.updateLastActive();
    
    // Handle joining a room
    socket.on('join_room', async (data) => {
      try {
        const { roomId, roomCode } = data;
        
        if (!roomId && !roomCode) {
          return socket.emit('error', {
            type: 'join_room_error',
            message: 'Room ID or room code required'
          });
        }
        
        // Find room
        const room = await Room.findOne({
          $or: [
            { roomId },
            { roomCode: roomCode?.toUpperCase() }
          ],
          status: 'active',
          isActive: true
        });
        
        if (!room) {
          return socket.emit('error', {
            type: 'room_not_found',
            message: 'Room not found or no longer active'
          });
        }
        
        // Check if user is banned
        if (room.isUserBanned(socket.userId)) {
          return socket.emit('error', {
            type: 'access_denied',
            message: 'You have been banned from this room'
          });
        }
        
        // Check room capacity
        if (room.currentUserCount >= room.settings.maxUsers) {
          return socket.emit('error', {
            type: 'room_full',
            message: 'Room has reached maximum capacity'
          });
        }
        
        // Join socket room
        socket.join(room.roomId);
        
        // Add to room connections tracking
        if (!roomConnections.has(room.roomId)) {
          roomConnections.set(room.roomId, new Set());
        }
        roomConnections.get(room.roomId).add(socket.userId);
        
        // Update user connection tracking
        const connection = activeConnections.get(socket.userId);
        if (connection) {
          connection.joinedRooms.add(room.roomId);
        }
        
        // Add user to room if not already added
        const userInRoom = room.activeUsers.find(u => u.userId === socket.userId);
        if (!userInRoom) {
          await room.addUser(socket.user);
        } else {
          // Update user activity
          await room.updateUserActivity(socket.userId);
        }
        
        // Emit to user
        socket.emit('room_joined', {
          room: room.toSafeObject(socket.userId),
          encryptionKey: room.security.encryptionKey,
          encryptionFingerprint: room.security.encryptionFingerprint
        });

        // Publish room join event
        kafka.publish && kafka.publish('securechat.events', { type: 'room.join', roomId: room.roomId, userId: socket.userId, at: Date.now() });
        
        // Notify other users in room
        socket.to(room.roomId).emit('user_joined', {
          user: {
            userId: socket.userId,
            nickname: socket.user.nickname,
            joinedAt: new Date()
          },
          message: `${socket.user.nickname} joined the room`
        });
        
        // Send recent messages to new user
        const recentMessages = await Message.findByRoom(room.roomId, 50);
        socket.emit('recent_messages', {
          messages: recentMessages
            .filter(msg => !msg.selfDestruct?.isDestroyed)
            .map(msg => msg.toSafeObject(socket.userId))
            .reverse()
        });
        
        console.log(`👥 User ${socket.user.nickname} joined room ${room.name}`);
        
      } catch (error) {
        console.error('Join room error:', error);
        socket.emit('error', {
          type: 'join_room_error',
          message: 'Failed to join room'
        });
      }
    });
    
    // Handle leaving a room
    socket.on('leave_room', async (data) => {
      try {
        const { roomId } = data;
        
        if (!roomId) {
          return socket.emit('error', {
            type: 'leave_room_error',
            message: 'Room ID required'
          });
        }
        
        // Leave socket room
        socket.leave(roomId);
        
        // Update tracking
        const roomConnections_set = roomConnections.get(roomId);
        if (roomConnections_set) {
          roomConnections_set.delete(socket.userId);
          if (roomConnections_set.size === 0) {
            roomConnections.delete(roomId);
          }
        }
        
        const connection = activeConnections.get(socket.userId);
        if (connection) {
          connection.joinedRooms.delete(roomId);
        }
        
        // Update room
        const room = await Room.findOne({ roomId });
        if (room) {
          await room.removeUser(socket.userId);
          
          // Notify other users
          socket.to(roomId).emit('user_left', {
            userId: socket.userId,
            nickname: socket.user.nickname,
            message: `${socket.user.nickname} left the room`
          });
        }
        
        socket.emit('room_left', { roomId });
        
        console.log(`👋 User ${socket.user.nickname} left room ${roomId}`);

        // Publish room leave event
        kafka.publish && kafka.publish('securechat.events', { type: 'room.leave', roomId, userId: socket.userId, at: Date.now() });

      } catch (error) {
        console.error('Leave room error:', error);
        socket.emit('error', {
          type: 'leave_room_error',
          message: 'Failed to leave room'
        });
      }
    });
    
    // Handle sending messages
    socket.on('send_message', async (data) => {
      try {
        const {
          roomId,
          content,
          type = 'text',
          metadata = {},
          selfDestruct = {},
          replyTo = null
        } = data;
        
        if (!roomId || !content) {
          return socket.emit('error', {
            type: 'send_message_error',
            message: 'Room ID and content required'
          });
        }
        
        // Validate message length
        if (content.length > 5000) {
          return socket.emit('error', {
            type: 'message_too_long',
            message: 'Message exceeds maximum length'
          });
        }
        
        // Find room and verify user access
        const room = await Room.findOne({ roomId });
        if (!room) {
          return socket.emit('error', {
            type: 'room_not_found',
            message: 'Room not found'
          });
        }
        
        const userInRoom = room.activeUsers.find(u => u.userId === socket.userId);
        if (!userInRoom) {
          return socket.emit('error', {
            type: 'access_denied',
            message: 'You must be in the room to send messages'
          });
        }
        
        // Create message
        const message = Message.createMessage({
          roomId,
          senderId: socket.userId,
          senderNickname: socket.user.nickname,
          content,
          type,
          metadata,
          selfDestruct: {
            enabled: selfDestruct.enabled || false,
            timer: selfDestruct.timer || 0,
            destructionType: selfDestruct.destructionType || 'timer'
          },
          thread: {
            parentId: replyTo
          },
          ip: socket.handshake.address,
          userAgent: socket.handshake.headers['user-agent'],
          deviceFingerprint: socket.user.fingerprint
        });
        
        // Encrypt message content
        if (room.settings.enableE2EEncryption) {
          message.encrypt(room.security.encryptionKey);
        }
        
        // Set self-destruct timer
        if (message.selfDestruct.enabled && message.selfDestruct.timer > 0) {
          message.selfDestruct.expiresAt = new Date(Date.now() + message.selfDestruct.timer);
        }
        
        await message.save();
        
        // Update room stats
        await room.incrementMessageCount();
        
        // Update user stats
        socket.user.updateStats('messageExchanged');
        await socket.user.save();
        
        // Emit to all users in room
        const safeMessage = message.toSafeObject(socket.userId);
        io.to(roomId).emit('new_message', safeMessage);

        // Publish message event to Kafka for downstream processing/analytics
        kafka.publish && kafka.publish('securechat.messages', { type: 'message.sent', roomId, message: safeMessage, at: Date.now() });

        // Handle message threading
        if (replyTo) {
          const parentMessage = await Message.findOne({ messageId: replyTo });
          if (parentMessage) {
            parentMessage.thread.replyCount += 1;
            await parentMessage.save();
          }
        }
        
        console.log(`💬 Message sent in room ${room.name} by ${socket.user.nickname}`);
        
      } catch (error) {
        console.error('Send message error:', error);
        socket.emit('error', {
          type: 'send_message_error',
          message: 'Failed to send message'
        });
      }
    });
    
    // Handle typing indicators
    socket.on('typing_start', (data) => {
      const { roomId } = data;
      if (roomId) {
        socket.to(roomId).emit('user_typing', {
          userId: socket.userId,
          nickname: socket.user.nickname,
          isTyping: true
        });
      }
    });
    
    socket.on('typing_stop', (data) => {
      const { roomId } = data;
      if (roomId) {
        socket.to(roomId).emit('user_typing', {
          userId: socket.userId,
          nickname: socket.user.nickname,
          isTyping: false
        });
      }
    });
    
    // Handle message reactions
    socket.on('add_reaction', async (data) => {
      try {
        const { messageId, reaction } = data;
        
        if (!messageId || !reaction) {
          return socket.emit('error', {
            type: 'reaction_error',
            message: 'Message ID and reaction required'
          });
        }
        
        const message = await Message.findOne({ messageId });
        if (!message) {
          return socket.emit('error', {
            type: 'message_not_found',
            message: 'Message not found'
          });
        }
        
        await message.addReaction(socket.userId, reaction);
        
        // Emit to room
        io.to(message.roomId).emit('message_reaction', {
          messageId,
          userId: socket.userId,
          reaction,
          reactions: message.reactions
        });
        
      } catch (error) {
        console.error('Add reaction error:', error);
        socket.emit('error', {
          type: 'reaction_error',
          message: 'Failed to add reaction'
        });
      }
    });
    
    // Handle message reading
    socket.on('mark_message_read', async (data) => {
      try {
        const { messageId } = data;
        
        if (!messageId) return;
        
        const message = await Message.findOne({ messageId });
        if (!message) return;
        
        await message.markAsRead(socket.userId, socket.user.nickname);
        
        // Emit read receipt to sender
        const senderConnection = activeConnections.get(message.senderId);
        if (senderConnection) {
          senderConnection.socket.emit('message_read', {
            messageId,
            readBy: socket.userId,
            nickname: socket.user.nickname,
            readAt: new Date()
          });
        }
        
      } catch (error) {
        console.error('Mark message read error:', error);
      }
    });
    
    // Handle video call signals
    socket.on('video_call_invite', (data) => {
      const { roomId, targetUserId } = data;
      
      if (targetUserId) {
        // Direct call to specific user
        const targetConnection = activeConnections.get(targetUserId);
        if (targetConnection) {
          targetConnection.socket.emit('video_call_invite', {
            from: socket.userId,
            fromNickname: socket.user.nickname,
            roomId
          });
        }
      } else if (roomId) {
        // Room-wide call
        socket.to(roomId).emit('video_call_invite', {
          from: socket.userId,
          fromNickname: socket.user.nickname,
          roomId
        });
      }
    });
    
    socket.on('video_call_response', (data) => {
      const { targetUserId, accepted, roomId } = data;
      
      const targetConnection = activeConnections.get(targetUserId);
      if (targetConnection) {
        targetConnection.socket.emit('video_call_response', {
          from: socket.userId,
          fromNickname: socket.user.nickname,
          accepted,
          roomId
        });
      }
    });
    
    // WebRTC signaling
    socket.on('webrtc_offer', (data) => {
      const { targetUserId, offer, roomId } = data;
      
      const targetConnection = activeConnections.get(targetUserId);
      if (targetConnection) {
        targetConnection.socket.emit('webrtc_offer', {
          from: socket.userId,
          offer,
          roomId
        });
      }
    });
    
    socket.on('webrtc_answer', (data) => {
      const { targetUserId, answer, roomId } = data;
      
      const targetConnection = activeConnections.get(targetUserId);
      if (targetConnection) {
        targetConnection.socket.emit('webrtc_answer', {
          from: socket.userId,
          answer,
          roomId
        });
      }
    });
    
    socket.on('webrtc_ice_candidate', (data) => {
      const { targetUserId, candidate, roomId } = data;
      
      const targetConnection = activeConnections.get(targetUserId);
      if (targetConnection) {
        targetConnection.socket.emit('webrtc_ice_candidate', {
          from: socket.userId,
          candidate,
          roomId
        });
      }
    });
    
    // Handle file sharing notifications
    socket.on('file_shared', async (data) => {
      try {
        const { roomId, fileId, fileName, fileSize } = data;
        
        if (!roomId) return;
        
        // Verify user is in room
        const room = await Room.findOne({ roomId });
        if (!room) return;
        
        const userInRoom = room.activeUsers.find(u => u.userId === socket.userId);
        if (!userInRoom) return;
        
        // Update room file count
        await room.incrementFileCount();
        
        // Notify room
        socket.to(roomId).emit('file_shared_notification', {
          from: socket.userId,
          fromNickname: socket.user.nickname,
          fileId,
          fileName,
          fileSize,
          sharedAt: new Date()
        });
        
      } catch (error) {
        console.error('File share notification error:', error);
      }
    });
    
    // Handle underground features
    socket.on('onion_routing_status', (data) => {
      const { enabled, roomId } = data;
      
      if (roomId) {
        socket.to(roomId).emit('user_onion_status', {
          userId: socket.userId,
          nickname: socket.user.nickname,
          onionEnabled: enabled
        });
      }
    });
    
    socket.on('steganography_message', async (data) => {
      try {
        const { roomId, coverMedia, hiddenMessage, algorithm } = data;
        
        if (!roomId || !coverMedia || !hiddenMessage) return;
        
        // Create steganography message
        const message = Message.createMessage({
          roomId,
          senderId: socket.userId,
          senderNickname: socket.user.nickname,
          content: '[Steganographic Content]',
          type: 'image',
          steganography: {
            enabled: true,
            algorithm,
            coverMedia,
            hiddenMessage,
            extractionKey: crypto.randomBytes(16).toString('hex')
          },
          ip: socket.handshake.address,
          userAgent: socket.handshake.headers['user-agent']
        });
        
        await message.save();
        
        // Emit to room
        io.to(roomId).emit('new_message', message.toSafeObject(socket.userId));
        
      } catch (error) {
        console.error('Steganography message error:', error);
      }
    });
    
    // Handle user activity updates
    socket.on('user_activity', async () => {
      const connection = activeConnections.get(socket.userId);
      if (connection) {
        connection.lastActivity = new Date();
        
        // Update user in database
        await socket.user.updateLastActive();
        
        // Update user activity in all joined rooms
        for (const roomId of connection.joinedRooms) {
          const room = await Room.findOne({ roomId });
          if (room) {
            await room.updateUserActivity(socket.userId);
          }
        }
      }
    });
    
    // Handle disconnection
    socket.on('disconnect', async (reason) => {
      try {
        console.log(`🔌 User ${socket.user.nickname} disconnected: ${reason}`);
        
        // Update user status
        socket.user.status = 'offline';
        socket.user.lastActive = new Date();
        await socket.user.save();

        // Presence update
        redis.srem && redis.srem('presence:online', socket.userId);

        // Remove from active connections
        const connection = activeConnections.get(socket.userId);
        if (connection) {
          // Leave all rooms
          for (const roomId of connection.joinedRooms) {
            const room = await Room.findOne({ roomId });
            if (room) {
              await room.removeUser(socket.userId);
              
              // Notify other users in room
              socket.to(roomId).emit('user_left', {
                userId: socket.userId,
                nickname: socket.user.nickname,
                message: `${socket.user.nickname} disconnected`
              });
            }
            
            // Update room connections tracking
            const roomConnections_set = roomConnections.get(roomId);
            if (roomConnections_set) {
              roomConnections_set.delete(socket.userId);
              if (roomConnections_set.size === 0) {
                roomConnections.delete(roomId);
              }
            }
          }
          
          activeConnections.delete(socket.userId);
        }
        
      } catch (error) {
        console.error('Disconnect handler error:', error);
      }
    });
    
    // Handle errors
    socket.on('error', (error) => {
      console.error('Socket error:', error);
      socket.emit('error', {
        type: 'socket_error',
        message: 'Connection error occurred'
      });
    });
  });
  
  // Cleanup inactive connections periodically
  setInterval(async () => {
    const now = new Date();
    const inactiveThreshold = 5 * 60 * 1000; // 5 minutes
    
    for (const [userId, connection] of activeConnections.entries()) {
      if (now - connection.lastActivity > inactiveThreshold) {
        console.log(`🧹 Cleaning up inactive connection for user ${userId}`);
        
        // Disconnect socket
        connection.socket.disconnect(true);
        
        // Remove from active connections
        activeConnections.delete(userId);
        
        // Update user status
        const user = await User.findOne({ userId });
        if (user) {
          user.status = 'offline';
          user.lastActive = new Date();
          await user.save();
        }
      }
    }
  }, 60000); // Check every minute
  
  // Cleanup expired messages periodically
  setInterval(async () => {
    try {
      const expiredMessages = await Message.findExpiredMessages();
      
      for (const message of expiredMessages) {
        await message.destroy();
        
        // Notify room about message destruction
        io.to(message.roomId).emit('message_destroyed', {
          messageId: message.messageId
        });
      }
      
      console.log(`🗑️ Destroyed ${expiredMessages.length} expired messages`);
      
    } catch (error) {
      console.error('Message cleanup error:', error);
    }
  }, 30000); // Check every 30 seconds
  
  console.log('📡 Socket.io handler initialized');
};
