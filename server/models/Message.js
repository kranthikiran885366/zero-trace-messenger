const mongoose = require('mongoose');
const crypto = require('crypto');

const messageSchema = new mongoose.Schema({
  // Message Identification
  messageId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  // Room and User References
  roomId: {
    type: String,
    required: true,
    index: true
  },
  senderId: {
    type: String,
    required: true,
    index: true
  },
  senderNickname: {
    type: String,
    required: true
  },
  
  // Message Content
  content: {
    type: String,
    required: true,
    maxlength: 5000
  },
  type: {
    type: String,
    enum: ['text', 'file', 'image', 'video', 'audio', 'system', 'voice_note', 'sticker', 'location', 'contact'],
    default: 'text'
  },
  
  // Encryption
  encryption: {
    algorithm: {
      type: String,
      default: 'aes-256-gcm'
    },
    isEncrypted: {
      type: Boolean,
      default: true
    },
    keyFingerprint: String,
    iv: String, // Initialization vector
    authTag: String // Authentication tag for GCM mode
  },
  
  // Message Metadata
  metadata: {
    fileSize: Number,
    mimeType: String,
    filename: String,
    duration: Number, // For voice/video messages
    dimensions: {
      width: Number,
      height: Number
    },
    thumbnail: String, // Base64 encoded thumbnail
    coordinates: {
      latitude: Number,
      longitude: Number,
      accuracy: Number
    },
    replyTo: String, // Message ID this is replying to
    forwarded: Boolean,
    originalSender: String,
    editedAt: Date,
    isEdited: Boolean
  },
  
  // File Information (for file messages)
  file: {
    originalName: String,
    storedName: String,
    path: String,
    url: String,
    size: Number,
    mimeType: String,
    checksum: String, // SHA-256 hash
    encryptedPath: String,
    isEncrypted: Boolean
  },
  
  // Self-Destruction
  selfDestruct: {
    enabled: {
      type: Boolean,
      default: false
    },
    timer: Number, // Milliseconds until destruction
    expiresAt: Date,
    destructionType: {
      type: String,
      enum: ['timer', 'read_once', 'on_leave', 'manual'],
      default: 'timer'
    },
    isDestroyed: {
      type: Boolean,
      default: false
    },
    destroyedAt: Date
  },
  
  // Message Status
  status: {
    type: String,
    enum: ['sending', 'sent', 'delivered', 'read', 'failed', 'destroyed'],
    default: 'sent'
  },
  
  // Read Receipts
  readBy: [{
    userId: String,
    readAt: Date,
    nickname: String
  }],
  
  // Reactions
  reactions: [{
    userId: String,
    reaction: String, // emoji or reaction type
    addedAt: Date
  }],
  
  // Steganography (Underground Feature)
  steganography: {
    enabled: {
      type: Boolean,
      default: false
    },
    algorithm: {
      type: String,
      enum: ['LSB', 'DCT', 'DWT', 'spread_spectrum', 'echo_hiding'],
      default: 'LSB'
    },
    coverMedia: String, // Path to cover media
    hiddenMessage: String, // Encrypted hidden message
    extractionKey: String
  },
  
  // Underground Features
  underground: {
    onionRouted: {
      type: Boolean,
      default: false
    },
    mixedRoute: {
      type: Boolean,
      default: false
    },
    anonymityLevel: {
      type: String,
      enum: ['basic', 'high', 'maximum'],
      default: 'basic'
    },
    proxyChain: [String] // List of proxy nodes used
  },
  
  // Message Threading
  thread: {
    parentId: String, // Parent message ID
    threadId: String, // Thread identifier
    replyCount: {
      type: Number,
      default: 0
    }
  },
  
  // Moderation
  moderation: {
    isFlagged: {
      type: Boolean,
      default: false
    },
    flagReason: String,
    flaggedBy: String,
    flaggedAt: Date,
    isHidden: {
      type: Boolean,
      default: false
    },
    hiddenBy: String,
    hiddenAt: Date
  },
  
  // Security
  security: {
    ipHash: String, // Hashed IP for audit
    userAgent: String,
    deviceFingerprint: String,
    suspiciousActivity: Boolean,
    verificationStatus: {
      type: String,
      enum: ['verified', 'suspicious', 'flagged', 'unknown'],
      default: 'unknown'
    }
  }
}, {
  timestamps: true,
  collection: 'messages'
});

// Indexes for performance and queries
messageSchema.index({ messageId: 1 });
messageSchema.index({ roomId: 1, createdAt: -1 });
messageSchema.index({ senderId: 1, createdAt: -1 });
messageSchema.index({ 'selfDestruct.expiresAt': 1 }, { 
  expireAfterSeconds: 0,
  partialFilterExpression: { 'selfDestruct.enabled': true }
});
messageSchema.index({ status: 1 });
messageSchema.index({ type: 1 });
messageSchema.index({ 'thread.parentId': 1 });
messageSchema.index({ 'moderation.isFlagged': 1 });

// Virtual for message age
messageSchema.virtual('age').get(function() {
  return Date.now() - this.createdAt.getTime();
});

// Virtual for time until destruction
messageSchema.virtual('timeUntilDestruction').get(function() {
  if (!this.selfDestruct.enabled || this.selfDestruct.isDestroyed) {
    return null;
  }
  return Math.max(0, this.selfDestruct.expiresAt.getTime() - Date.now());
});

// Pre-save middleware
messageSchema.pre('save', function(next) {
  // Generate message ID if not provided
  if (!this.messageId) {
    this.messageId = `msg_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
  }
  
  // Set expiration for self-destructing messages
  if (this.selfDestruct.enabled && this.selfDestruct.timer && !this.selfDestruct.expiresAt) {
    this.selfDestruct.expiresAt = new Date(Date.now() + this.selfDestruct.timer);
  }
  
  // Generate file checksum if file message
  if (this.type === 'file' && this.file.path && !this.file.checksum) {
    // This would typically be done before saving
    // this.file.checksum = generateFileChecksum(this.file.path);
  }
  
  next();
});

// Methods
messageSchema.methods.encrypt = function(encryptionKey) {
  if (this.encryption.isEncrypted) return this;
  
  const algorithm = 'aes-256-gcm';
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipher(algorithm, encryptionKey, iv);
  
  let encrypted = cipher.update(this.content, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  this.content = encrypted;
  this.encryption.isEncrypted = true;
  this.encryption.iv = iv.toString('hex');
  this.encryption.authTag = cipher.getAuthTag().toString('hex');
  this.encryption.keyFingerprint = crypto
    .createHash('sha256')
    .update(encryptionKey)
    .digest('hex')
    .substring(0, 16);
  
  return this;
};

messageSchema.methods.decrypt = function(encryptionKey) {
  if (!this.encryption.isEncrypted) return this.content;
  
  try {
    const algorithm = 'aes-256-gcm';
    const iv = Buffer.from(this.encryption.iv, 'hex');
    const authTag = Buffer.from(this.encryption.authTag, 'hex');
    const decipher = crypto.createDecipher(algorithm, encryptionKey, iv);
    
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(this.content, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    throw new Error('Failed to decrypt message');
  }
};

messageSchema.methods.markAsRead = function(userId, nickname) {
  const existingRead = this.readBy.find(r => r.userId === userId);
  
  if (!existingRead) {
    this.readBy.push({
      userId,
      nickname,
      readAt: new Date()
    });
    
    // Auto-destroy on read if configured
    if (this.selfDestruct.enabled && this.selfDestruct.destructionType === 'read_once') {
      this.selfDestruct.isDestroyed = true;
      this.selfDestruct.destroyedAt = new Date();
      this.status = 'destroyed';
    }
  }
  
  return this.save();
};

messageSchema.methods.addReaction = function(userId, reaction) {
  const existingReaction = this.reactions.find(r => r.userId === userId);
  
  if (existingReaction) {
    if (existingReaction.reaction === reaction) {
      // Remove reaction if same
      this.reactions = this.reactions.filter(r => r.userId !== userId);
    } else {
      // Update reaction
      existingReaction.reaction = reaction;
      existingReaction.addedAt = new Date();
    }
  } else {
    // Add new reaction
    this.reactions.push({
      userId,
      reaction,
      addedAt: new Date()
    });
  }
  
  return this.save();
};

messageSchema.methods.edit = function(newContent) {
  this.content = newContent;
  this.metadata.isEdited = true;
  this.metadata.editedAt = new Date();
  return this.save();
};

messageSchema.methods.flag = function(reason, flaggedBy) {
  this.moderation.isFlagged = true;
  this.moderation.flagReason = reason;
  this.moderation.flaggedBy = flaggedBy;
  this.moderation.flaggedAt = new Date();
  return this.save();
};

messageSchema.methods.hide = function(hiddenBy) {
  this.moderation.isHidden = true;
  this.moderation.hiddenBy = hiddenBy;
  this.moderation.hiddenAt = new Date();
  return this.save();
};

messageSchema.methods.shouldBeDestroyed = function() {
  if (!this.selfDestruct.enabled || this.selfDestruct.isDestroyed) {
    return false;
  }
  
  return this.selfDestruct.expiresAt && new Date() > this.selfDestruct.expiresAt;
};

messageSchema.methods.destroy = function() {
  this.selfDestruct.isDestroyed = true;
  this.selfDestruct.destroyedAt = new Date();
  this.status = 'destroyed';
  this.content = '[Message destroyed]';
  
  // Clear sensitive data
  if (this.file) {
    this.file = undefined;
  }
  
  if (this.steganography.enabled) {
    this.steganography = undefined;
  }
  
  return this.save();
};

messageSchema.methods.toSafeObject = function(requestingUserId = null) {
  const message = this.toObject();
  
  // Remove sensitive data
  delete message.encryption.keyFingerprint;
  delete message.encryption.iv;
  delete message.encryption.authTag;
  delete message.security.ipHash;
  delete message.security.deviceFingerprint;
  
  // Hide steganography details from non-participants
  if (message.steganography && message.steganography.enabled) {
    delete message.steganography.extractionKey;
    delete message.steganography.hiddenMessage;
  }
  
  // Return destroyed message placeholder if destroyed
  if (message.selfDestruct && message.selfDestruct.isDestroyed) {
    return {
      messageId: message.messageId,
      roomId: message.roomId,
      type: 'system',
      content: '[Message was destroyed]',
      status: 'destroyed',
      createdAt: message.createdAt
    };
  }
  
  return message;
};

// Static methods
messageSchema.statics.createMessage = function(data) {
  const messageId = `msg_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
  
  return new this({
    messageId,
    ...data,
    security: {
      ipHash: data.ipHash || crypto.createHash('sha256').update(data.ip || '').digest('hex'),
      userAgent: data.userAgent,
      deviceFingerprint: data.deviceFingerprint,
      verificationStatus: 'unknown'
    }
  });
};

messageSchema.statics.findByRoom = function(roomId, limit = 50, before = null) {
  const query = { roomId, 'selfDestruct.isDestroyed': { $ne: true } };
  
  if (before) {
    query.createdAt = { $lt: new Date(before) };
  }
  
  return this.find(query)
    .sort({ createdAt: -1 })
    .limit(limit);
};

messageSchema.statics.findExpiredMessages = function() {
  return this.find({
    'selfDestruct.enabled': true,
    'selfDestruct.isDestroyed': false,
    'selfDestruct.expiresAt': { $lt: new Date() }
  });
};

messageSchema.statics.cleanupDestroyedMessages = function() {
  return this.deleteMany({
    $or: [
      { 'selfDestruct.isDestroyed': true },
      { status: 'destroyed' }
    ],
    'selfDestruct.destroyedAt': { 
      $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) // 24 hours old
    }
  });
};

messageSchema.statics.searchMessages = function(roomId, query, limit = 20) {
  return this.find({
    roomId,
    'selfDestruct.isDestroyed': { $ne: true },
    $text: { $search: query }
  })
  .sort({ score: { $meta: 'textScore' }, createdAt: -1 })
  .limit(limit);
};

// Text index for search
messageSchema.index({ content: 'text', 'metadata.filename': 'text' });

module.exports = mongoose.model('Message', messageSchema);
