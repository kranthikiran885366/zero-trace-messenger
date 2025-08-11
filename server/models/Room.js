const mongoose = require('mongoose');
const crypto = require('crypto');

const roomSchema = new mongoose.Schema({
  // Room Identification
  roomId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  roomCode: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  
  // Room Creator
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Room Configuration
  settings: {
    maxUsers: {
      type: Number,
      default: 10,
      min: 2,
      max: 50
    },
    password: String,
    hasPassword: {
      type: Boolean,
      default: false
    },
    enableVideo: {
      type: Boolean,
      default: true
    },
    enableFileSharing: {
      type: Boolean,
      default: true
    },
    enableScreenShare: {
      type: Boolean,
      default: true
    },
    enableVoiceNotes: {
      type: Boolean,
      default: true
    },
    enableDrawing: {
      type: Boolean,
      default: false
    },
    allowAnonymousJoin: {
      type: Boolean,
      default: true
    },
    roomTheme: {
      type: String,
      enum: ['cyber', 'dark', 'light', 'stealth'],
      default: 'cyber'
    },
    autoDestroy: {
      type: Number,
      default: 3600000 // 1 hour in milliseconds
    },
    messageRetention: {
      type: Number,
      default: 86400000 // 24 hours in milliseconds
    },
    maxFileSize: {
      type: Number,
      default: 50 * 1024 * 1024 // 50MB
    },
    enableE2EEncryption: {
      type: Boolean,
      default: true
    }
  },
  
  // Room Security
  security: {
    encryptionKey: {
      type: String,
      required: true
    },
    encryptionFingerprint: {
      type: String,
      required: true
    },
    isPrivate: {
      type: Boolean,
      default: true
    },
    requireApproval: {
      type: Boolean,
      default: false
    },
    bannedUsers: [{
      userId: String,
      reason: String,
      bannedAt: Date,
      bannedBy: String
    }],
    moderators: [String],
    admins: [String],
    inviteCode: String,
    accessLog: [{
      userId: String,
      action: String,
      timestamp: Date,
      ip: String
    }]
  },
  
  // Room State
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended', 'archived'],
    default: 'active'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Room Statistics
  stats: {
    totalMessages: {
      type: Number,
      default: 0
    },
    totalUsers: {
      type: Number,
      default: 0
    },
    totalFiles: {
      type: Number,
      default: 0
    },
    peakConcurrentUsers: {
      type: Number,
      default: 0
    },
    totalCallMinutes: {
      type: Number,
      default: 0
    },
    lastActivity: {
      type: Date,
      default: Date.now
    }
  },
  
  // Active Users
  activeUsers: [{
    userId: {
      type: String,
      required: true
    },
    nickname: String,
    joinedAt: {
      type: Date,
      default: Date.now
    },
    lastSeen: {
      type: Date,
      default: Date.now
    },
    isOnline: {
      type: Boolean,
      default: true
    },
    role: {
      type: String,
      enum: ['member', 'moderator', 'admin', 'owner'],
      default: 'member'
    },
    permissions: [{
      action: String,
      granted: Boolean
    }]
  }],
  
  // Room Features
  features: {
    onionRouting: {
      enabled: {
        type: Boolean,
        default: false
      },
      circuitNodes: [String],
      lastCircuitUpdate: Date
    },
    steganography: {
      enabled: {
        type: Boolean,
        default: false
      },
      defaultAlgorithm: String
    },
    anonymityLevel: {
      type: String,
      enum: ['basic', 'high', 'maximum', 'underground'],
      default: 'basic'
    },
    deadDrops: [{
      id: String,
      location: String,
      coordinates: String,
      message: String,
      expiresAt: Date,
      createdBy: String,
      retrieved: Boolean
    }]
  },
  
  // Expiration
  expiresAt: {
    type: Date,
    index: { expireAfterSeconds: 0 }
  },
  
  // Metadata
  tags: [String],
  category: {
    type: String,
    enum: ['general', 'secure', 'anonymous', 'underground', 'business', 'personal'],
    default: 'general'
  }
}, {
  timestamps: true,
  collection: 'rooms'
});

// Indexes for performance
roomSchema.index({ roomId: 1 });
roomSchema.index({ roomCode: 1 });
roomSchema.index({ createdBy: 1 });
roomSchema.index({ status: 1, isActive: 1 });
roomSchema.index({ 'stats.lastActivity': 1 });
roomSchema.index({ expiresAt: 1 });
roomSchema.index({ 'activeUsers.userId': 1 });

// Virtual for current user count
roomSchema.virtual('currentUserCount').get(function() {
  return this.activeUsers.filter(user => user.isOnline).length;
});

// Virtual for room age
roomSchema.virtual('age').get(function() {
  return Date.now() - this.createdAt.getTime();
});

// Pre-save middleware
roomSchema.pre('save', function(next) {
  // Update expiration date based on auto-destroy setting
  if (this.isNew || this.isModified('settings.autoDestroy')) {
    this.expiresAt = new Date(Date.now() + this.settings.autoDestroy);
  }
  
  // Update last activity
  this.stats.lastActivity = new Date();
  
  next();
});

// Methods
roomSchema.methods.addUser = function(user) {
  const existingUser = this.activeUsers.find(u => u.userId === user.userId);
  
  if (!existingUser) {
    this.activeUsers.push({
      userId: user.userId,
      nickname: user.nickname,
      joinedAt: new Date(),
      lastSeen: new Date(),
      isOnline: true,
      role: this.activeUsers.length === 0 ? 'owner' : 'member'
    });
    
    this.stats.totalUsers += 1;
    this.stats.peakConcurrentUsers = Math.max(
      this.stats.peakConcurrentUsers, 
      this.currentUserCount + 1
    );
    
    // Log access
    this.security.accessLog.push({
      userId: user.userId,
      action: 'join',
      timestamp: new Date(),
      ip: user.lastIP || 'unknown'
    });
  } else {
    existingUser.isOnline = true;
    existingUser.lastSeen = new Date();
  }
  
  this.stats.lastActivity = new Date();
  return this.save();
};

roomSchema.methods.removeUser = function(userId) {
  const userIndex = this.activeUsers.findIndex(u => u.userId === userId);
  
  if (userIndex !== -1) {
    this.activeUsers[userIndex].isOnline = false;
    this.activeUsers[userIndex].lastSeen = new Date();
    
    // Log access
    this.security.accessLog.push({
      userId,
      action: 'leave',
      timestamp: new Date()
    });
  }
  
  this.stats.lastActivity = new Date();
  return this.save();
};

roomSchema.methods.updateUserActivity = function(userId) {
  const user = this.activeUsers.find(u => u.userId === userId);
  
  if (user) {
    user.lastSeen = new Date();
    user.isOnline = true;
    this.stats.lastActivity = new Date();
    return this.save();
  }
  
  return Promise.resolve(this);
};

roomSchema.methods.incrementMessageCount = function() {
  this.stats.totalMessages += 1;
  this.stats.lastActivity = new Date();
  return this.save();
};

roomSchema.methods.incrementFileCount = function() {
  this.stats.totalFiles += 1;
  this.stats.lastActivity = new Date();
  return this.save();
};

roomSchema.methods.isUserBanned = function(userId) {
  return this.security.bannedUsers.some(ban => ban.userId === userId);
};

roomSchema.methods.isUserModerator = function(userId) {
  const user = this.activeUsers.find(u => u.userId === userId);
  return user && ['moderator', 'admin', 'owner'].includes(user.role);
};

roomSchema.methods.banUser = function(userId, reason, bannedBy) {
  if (!this.isUserBanned(userId)) {
    this.security.bannedUsers.push({
      userId,
      reason,
      bannedAt: new Date(),
      bannedBy
    });
    
    // Remove from active users
    this.activeUsers = this.activeUsers.filter(u => u.userId !== userId);
    
    // Log action
    this.security.accessLog.push({
      userId,
      action: 'ban',
      timestamp: new Date()
    });
  }
  
  return this.save();
};

roomSchema.methods.toSafeObject = function(requestingUserId = null) {
  const room = this.toObject();
  
  // Remove sensitive data
  delete room.security.encryptionKey;
  delete room.settings.password;
  
  // Only show access log to moderators
  if (!requestingUserId || !this.isUserModerator(requestingUserId)) {
    delete room.security.accessLog;
  }
  
  return room;
};

roomSchema.methods.extendExpiration = function(additionalTime) {
  this.expiresAt = new Date(this.expiresAt.getTime() + additionalTime);
  return this.save();
};

// Static methods
roomSchema.statics.generateRoomCode = function() {
  return crypto.randomBytes(8).toString('hex').toUpperCase();
};

roomSchema.statics.generateRoomId = function() {
  return `room_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
};

roomSchema.statics.generateEncryptionKey = function() {
  return crypto.randomBytes(32).toString('base64');
};

roomSchema.statics.createRoom = function(creator, settings = {}) {
  const roomId = this.generateRoomId();
  const roomCode = this.generateRoomCode();
  const encryptionKey = this.generateEncryptionKey();
  const encryptionFingerprint = crypto
    .createHash('sha256')
    .update(encryptionKey)
    .digest('hex')
    .substring(0, 16);
  
  return new this({
    roomId,
    roomCode,
    name: settings.name || `Room ${roomCode}`,
    description: settings.description || '',
    createdBy: creator._id,
    settings: {
      ...settings,
      hasPassword: !!settings.password
    },
    security: {
      encryptionKey,
      encryptionFingerprint,
      admins: [creator.userId],
      accessLog: [{
        userId: creator.userId,
        action: 'create',
        timestamp: new Date()
      }]
    },
    expiresAt: new Date(Date.now() + (settings.autoDestroy || 3600000))
  });
};

roomSchema.statics.findActiveRooms = function() {
  return this.find({
    status: 'active',
    isActive: true,
    expiresAt: { $gt: new Date() }
  });
};

roomSchema.statics.cleanupExpiredRooms = function() {
  return this.deleteMany({
    $or: [
      { expiresAt: { $lt: new Date() } },
      { 
        status: 'inactive',
        'stats.lastActivity': { 
          $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) 
        }
      }
    ]
  });
};

module.exports = mongoose.model('Room', roomSchema);
