const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Basic User Information
  userId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  nickname: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  fingerprint: {
    type: String,
    required: true,
    unique: true
  },
  
  // Authentication (Optional - for persistent sessions)
  email: {
    type: String,
    sparse: true,
    lowercase: true,
    validate: {
      validator: function(email) {
        return !email || /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email);
      },
      message: 'Invalid email format'
    }
  },
  password: {
    type: String,
    minlength: 6
  },
  
  // Session Management
  isAnonymous: {
    type: Boolean,
    default: true
  },
  sessionToken: String,
  lastActive: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  // User Preferences
  preferences: {
    theme: {
      type: String,
      enum: ['cyber', 'dark', 'light', 'stealth'],
      default: 'cyber'
    },
    autoDeleteMessages: {
      type: Boolean,
      default: true
    },
    enableNotifications: {
      type: Boolean,
      default: true
    },
    showTypingIndicators: {
      type: Boolean,
      default: true
    },
    autoJoinVideo: {
      type: Boolean,
      default: false
    },
    defaultMessageTimer: {
      type: Number,
      default: 300000 // 5 minutes
    },
    preferredQuality: {
      type: String,
      enum: ['480p', '720p', '1080p'],
      default: '720p'
    },
    enableSteganography: {
      type: Boolean,
      default: false
    },
    enableOnionRouting: {
      type: Boolean,
      default: false
    }
  },
  
  // Statistics
  stats: {
    roomsJoined: {
      type: Number,
      default: 0
    },
    messagesExchanged: {
      type: Number,
      default: 0
    },
    filesShared: {
      type: Number,
      default: 0
    },
    callMinutes: {
      type: Number,
      default: 0
    },
    lastRoomJoined: Date
  },
  
  // Security Settings
  security: {
    ipHistory: [{
      ip: String,
      timestamp: Date,
      location: String
    }],
    deviceFingerprints: [String],
    suspiciousActivity: [{
      type: String,
      description: String,
      timestamp: Date,
      severity: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'low'
      }
    }],
    blockedUsers: [String],
    trustedContacts: [String]
  },
  
  // Privacy Settings
  privacy: {
    hideOnlineStatus: {
      type: Boolean,
      default: false
    },
    allowDirectMessages: {
      type: Boolean,
      default: true
    },
    shareTypingStatus: {
      type: Boolean,
      default: true
    },
    allowFileSharing: {
      type: Boolean,
      default: true
    },
    allowVoiceCalls: {
      type: Boolean,
      default: true
    },
    allowVideoCalls: {
      type: Boolean,
      default: true
    }
  },
  
  // Underground Features
  underground: {
    onionRouting: {
      enabled: {
        type: Boolean,
        default: false
      },
      circuitHops: {
        type: Number,
        default: 3,
        min: 2,
        max: 7
      },
      lastCircuitChange: Date
    },
    cryptoMixer: {
      enabled: {
        type: Boolean,
        default: false
      },
      mixingHistory: [{
        amount: Number,
        currency: String,
        timestamp: Date,
        status: String
      }]
    },
    steganography: {
      enabled: {
        type: Boolean,
        default: false
      },
      defaultAlgorithm: {
        type: String,
        enum: ['LSB', 'DCT', 'DWT', 'spread_spectrum'],
        default: 'LSB'
      }
    }
  },
  
  // Status
  status: {
    type: String,
    enum: ['online', 'away', 'busy', 'offline', 'invisible'],
    default: 'offline'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Metadata
  userAgent: String,
  platform: String,
  language: {
    type: String,
    default: 'en'
  }
}, {
  timestamps: true,
  collection: 'users'
});

// Indexes for performance
userSchema.index({ userId: 1 });
userSchema.index({ fingerprint: 1 });
userSchema.index({ email: 1 }, { sparse: true });
userSchema.index({ lastActive: 1 });
userSchema.index({ createdAt: 1 });
userSchema.index({ status: 1 });

// Virtual for user display name
userSchema.virtual('displayName').get(function() {
  return this.nickname || `User-${this.userId.slice(-8)}`;
});

// Pre-save middleware for password hashing
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  if (this.password) {
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    this.password = await bcrypt.hash(this.password, saltRounds);
  }
  
  next();
});

// Pre-save middleware for updating lastActive
userSchema.pre('save', function(next) {
  if (this.isNew || this.isModified('status')) {
    this.lastActive = new Date();
  }
  next();
});

// Methods
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toSafeObject = function() {
  const user = this.toObject();
  delete user.password;
  delete user.sessionToken;
  delete user.security.ipHistory;
  delete user.security.deviceFingerprints;
  return user;
};

userSchema.methods.updateStats = function(action, value = 1) {
  switch(action) {
    case 'roomJoined':
      this.stats.roomsJoined += value;
      this.stats.lastRoomJoined = new Date();
      break;
    case 'messageExchanged':
      this.stats.messagesExchanged += value;
      break;
    case 'fileShared':
      this.stats.filesShared += value;
      break;
    case 'callMinutes':
      this.stats.callMinutes += value;
      break;
  }
  this.lastActive = new Date();
};

userSchema.methods.logSuspiciousActivity = function(type, description, severity = 'low') {
  this.security.suspiciousActivity.push({
    type,
    description,
    timestamp: new Date(),
    severity
  });
  
  // Keep only last 100 entries
  if (this.security.suspiciousActivity.length > 100) {
    this.security.suspiciousActivity = this.security.suspiciousActivity.slice(-100);
  }
};

userSchema.methods.updateLastActive = function() {
  this.lastActive = new Date();
  return this.save();
};

// Static methods
userSchema.statics.findActiveUsers = function() {
  const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
  return this.find({
    lastActive: { $gte: thirtyMinutesAgo },
    status: { $ne: 'offline' },
    isActive: true
  });
};

userSchema.statics.cleanupInactiveUsers = function() {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  return this.deleteMany({
    isAnonymous: true,
    lastActive: { $lt: sevenDaysAgo }
  });
};

userSchema.statics.generateAnonymousUser = function(nickname, fingerprint) {
  const userId = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  return new this({
    userId,
    nickname: nickname || `Anonymous-${userId.slice(-8)}`,
    fingerprint,
    isAnonymous: true,
    status: 'online'
  });
};

// TTL index for anonymous users (cleanup after 7 days of inactivity)
userSchema.index(
  { lastActive: 1 },
  { 
    expireAfterSeconds: 7 * 24 * 60 * 60, // 7 days
    partialFilterExpression: { isAnonymous: true }
  }
);

module.exports = mongoose.model('User', userSchema);
