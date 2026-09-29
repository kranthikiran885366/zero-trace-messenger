const mongoose = require('mongoose');
const crypto = require('crypto');
const path = require('path');

const fileSchema = new mongoose.Schema({
  // File Identification
  fileId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  shareId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  // File Information
  originalName: {
    type: String,
    required: true,
    maxlength: 255
  },
  storedName: {
    type: String,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true,
    min: 0,
    max: 100 * 1024 * 1024 // 100MB max
  },
  extension: String,
  
  // File Paths
  path: {
    type: String,
    required: true
  },
  url: String,
  thumbnailPath: String,
  thumbnailUrl: String,
  
  // Owner Information
  uploadedBy: {
    type: String,
    required: true
  },
  uploaderNickname: String,
  roomId: String, // Optional - if uploaded in a room
  
  // Security & Encryption
  encryption: {
    isEncrypted: {
      type: Boolean,
      default: true
    },
    algorithm: {
      type: String,
      default: 'aes-256-gcm'
    },
    keyFingerprint: String,
    iv: String,
    authTag: String,
    encryptedPath: String
  },
  
  // File Integrity
  checksum: {
    md5: String,
    sha256: String,
    sha512: String
  },
  
  // Access Control
  access: {
    isPublic: {
      type: Boolean,
      default: false
    },
    password: String,
    hasPassword: {
      type: Boolean,
      default: false
    },
    allowedUsers: [String],
    maxDownloads: {
      type: Number,
      default: 10
    },
    downloadCount: {
      type: Number,
      default: 0
    },
    expiresAt: {
      type: Date,
      index: { expireAfterSeconds: 0 }
    },
    burnAfterReading: {
      type: Boolean,
      default: false
    }
  },
  
  // Download History
  downloads: [{
    userId: String,
    nickname: String,
    downloadedAt: Date,
    ipHash: String,
    userAgent: String,
    fileSize: Number
  }],
  
  // File Metadata
  metadata: {
    // Image metadata
    dimensions: {
      width: Number,
      height: Number
    },
    colorSpace: String,
    hasExif: Boolean,
    
    // Video metadata
    duration: Number,
    framerate: Number,
    resolution: String,
    codec: String,
    
    // Audio metadata
    bitrate: Number,
    sampleRate: Number,
    channels: Number,
    albumArt: Boolean,
    
    // Document metadata
    pageCount: Number,
    wordCount: Number,
    hasPasswords: Boolean,
    hasScripts: Boolean,
    
    // Archive metadata
    compressedSize: Number,
    uncompressedSize: Number,
    fileCount: Number,
    compressionRatio: Number
  },
  
  // File Status
  status: {
    type: String,
    enum: ['uploading', 'processing', 'available', 'expired', 'deleted', 'corrupted'],
    default: 'uploading'
  },
  
  // Processing Information
  processing: {
    isProcessed: {
      type: Boolean,
      default: false
    },
    processedAt: Date,
    thumbnailGenerated: Boolean,
    virusScanned: Boolean,
    virusScanResult: {
      type: String,
      enum: ['clean', 'infected', 'suspicious', 'unknown'],
      default: 'unknown'
    },
    compressionApplied: Boolean,
    originalSize: Number
  },
  
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
    hasHiddenData: Boolean,
    hiddenDataSize: Number,
    extractionKey: String,
    coverFileId: String // If this file is hiding data from another file
  },
  
  // Underground Features
  underground: {
    onionShared: {
      type: Boolean,
      default: false
    },
    onionUrl: String,
    anonymityLevel: {
      type: String,
      enum: ['basic', 'high', 'maximum'],
      default: 'basic'
    },
    mixedRouting: Boolean,
    proxyChain: [String]
  },
  
  // Moderation & Security
  moderation: {
    isFlagged: {
      type: Boolean,
      default: false
    },
    flagReason: String,
    flaggedBy: String,
    flaggedAt: Date,
    isQuarantined: {
      type: Boolean,
      default: false
    },
    quarantineReason: String,
    contentRating: {
      type: String,
      enum: ['safe', 'questionable', 'explicit', 'illegal'],
      default: 'safe'
    }
  },
  
  // Analytics
  analytics: {
    views: {
      type: Number,
      default: 0
    },
    uniqueViews: {
      type: Number,
      default: 0
    },
    lastAccessed: Date,
    popularityScore: {
      type: Number,
      default: 0
    },
    transferredBytes: {
      type: Number,
      default: 0
    }
  },
  
  // File Categories
  category: {
    type: String,
    enum: ['image', 'video', 'audio', 'document', 'archive', 'code', 'data', 'other'],
    default: 'other'
  },
  tags: [String],
  
  // Backup & Redundancy
  backup: {
    isBackedUp: {
      type: Boolean,
      default: false
    },
    backupPath: String,
    backupProvider: String,
    lastBackup: Date,
    redundancyLevel: {
      type: Number,
      default: 1,
      min: 1,
      max: 5
    }
  }
}, {
  timestamps: true,
  collection: 'files'
});

// Indexes
fileSchema.index({ fileId: 1 });
fileSchema.index({ shareId: 1 });
fileSchema.index({ uploadedBy: 1, createdAt: -1 });
fileSchema.index({ roomId: 1 });
fileSchema.index({ 'access.expiresAt': 1 });
fileSchema.index({ status: 1 });
fileSchema.index({ mimeType: 1 });
fileSchema.index({ category: 1 });
fileSchema.index({ 'moderation.isFlagged': 1 });
fileSchema.index({ 'processing.virusScanResult': 1 });

// Virtual for file size in human readable format
fileSchema.virtual('humanReadableSize').get(function() {
  const bytes = this.size;
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let unitIndex = 0;
  let size = bytes;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(2)} ${units[unitIndex]}`;
});

// Virtual for download link
fileSchema.virtual('downloadLink').get(function() {
  return `/api/files/download/${this.shareId}`;
});

// Virtual for thumbnail link
fileSchema.virtual('thumbnailLink').get(function() {
  if (this.thumbnailPath) {
    return `/api/files/thumbnail/${this.shareId}`;
  }
  return null;
});

// Virtual for file age
fileSchema.virtual('age').get(function() {
  return Date.now() - this.createdAt.getTime();
});

// Pre-save middleware
fileSchema.pre('save', function(next) {
  // Generate IDs if not provided
  if (!this.fileId) {
    this.fileId = `file_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
  }
  
  if (!this.shareId) {
    this.shareId = crypto.randomBytes(16).toString('hex').toLowerCase();
  }
  
  // Set file extension
  if (!this.extension && this.originalName) {
    this.extension = path.extname(this.originalName).toLowerCase();
  }
  
  // Categorize file based on MIME type
  if (!this.category) {
    this.category = this.categorizeByMimeType();
  }
  
  // Generate stored name if not provided
  if (!this.storedName) {
    this.storedName = `${this.fileId}${this.extension}`;
  }
  
  next();
});

// Methods
fileSchema.methods.categorizeByMimeType = function() {
  const mimeType = this.mimeType.toLowerCase();
  
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('text/')) return 'document';
  if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('tar') || mimeType.includes('gzip')) return 'archive';
  if (mimeType.includes('javascript') || mimeType.includes('json') || mimeType.includes('xml')) return 'code';
  
  return 'other';
};

fileSchema.methods.generateChecksums = function(buffer) {
  this.checksum = {
    md5: crypto.createHash('md5').update(buffer).digest('hex'),
    sha256: crypto.createHash('sha256').update(buffer).digest('hex'),
    sha512: crypto.createHash('sha512').update(buffer).digest('hex')
  };
  return this;
};

fileSchema.methods.canDownload = function(userId = null) {
  // Check if file exists and is available
  if (this.status !== 'available') return false;
  
  // Check expiration
  if (this.access.expiresAt && new Date() > this.access.expiresAt) {
    return false;
  }
  
  // Check download limit
  if (this.access.maxDownloads > 0 && this.access.downloadCount >= this.access.maxDownloads) {
    return false;
  }
  
  // Check user permissions
  if (!this.access.isPublic && userId) {
    if (this.uploadedBy !== userId && !this.access.allowedUsers.includes(userId)) {
      return false;
    }
  }
  
  // Check if flagged or quarantined
  if (this.moderation.isFlagged || this.moderation.isQuarantined) {
    return false;
  }
  
  return true;
};

fileSchema.methods.recordDownload = function(userId, nickname, ipHash, userAgent) {
  // Check burn after reading
  if (this.access.burnAfterReading && this.access.downloadCount > 0) {
    this.status = 'deleted';
    return this.save();
  }
  
  // Record download
  this.downloads.push({
    userId,
    nickname,
    downloadedAt: new Date(),
    ipHash,
    userAgent,
    fileSize: this.size
  });
  
  this.access.downloadCount += 1;
  this.analytics.views += 1;
  this.analytics.lastAccessed = new Date();
  this.analytics.transferredBytes += this.size;
  
  // Check unique view
  const existingUser = this.downloads.find(d => d.userId === userId && d.userId !== userId);
  if (!existingUser) {
    this.analytics.uniqueViews += 1;
  }
  
  // Update popularity score (simple algorithm)
  const ageInDays = (Date.now() - this.createdAt.getTime()) / (1000 * 60 * 60 * 24);
  this.analytics.popularityScore = this.analytics.uniqueViews / Math.max(ageInDays, 1);
  
  // Auto-delete if burn after reading
  if (this.access.burnAfterReading) {
    this.status = 'deleted';
  }
  
  return this.save();
};

fileSchema.methods.encrypt = function(encryptionKey) {
  if (this.encryption.isEncrypted) return this;
  
  const algorithm = 'aes-256-gcm';
  const iv = crypto.randomBytes(16);
  
  this.encryption.isEncrypted = true;
  this.encryption.algorithm = algorithm;
  this.encryption.iv = iv.toString('hex');
  this.encryption.keyFingerprint = crypto
    .createHash('sha256')
    .update(encryptionKey)
    .digest('hex')
    .substring(0, 16);
  
  return this;
};

fileSchema.methods.flag = function(reason, flaggedBy) {
  this.moderation.isFlagged = true;
  this.moderation.flagReason = reason;
  this.moderation.flaggedBy = flaggedBy;
  this.moderation.flaggedAt = new Date();
  return this.save();
};

fileSchema.methods.quarantine = function(reason) {
  this.moderation.isQuarantined = true;
  this.moderation.quarantineReason = reason;
  this.status = 'corrupted'; // Prevent downloads
  return this.save();
};

fileSchema.methods.markAsProcessed = function(processingResults = {}) {
  this.processing.isProcessed = true;
  this.processing.processedAt = new Date();
  
  if (processingResults.virusScanResult) {
    this.processing.virusScanResult = processingResults.virusScanResult;
    this.processing.virusScanned = true;
  }
  
  if (processingResults.thumbnailGenerated) {
    this.processing.thumbnailGenerated = true;
  }
  
  if (processingResults.compressionApplied) {
    this.processing.compressionApplied = true;
    this.processing.originalSize = processingResults.originalSize;
  }
  
  this.status = 'available';
  return this.save();
};

fileSchema.methods.toSafeObject = function(requestingUserId = null) {
  const file = this.toObject();
  
  // Remove sensitive data
  delete file.path;
  delete file.encryption.keyFingerprint;
  delete file.encryption.iv;
  delete file.encryption.authTag;
  delete file.steganography.extractionKey;
  delete file.access.password;
  
  // Only show download history to owner
  if (requestingUserId !== this.uploadedBy) {
    delete file.downloads;
    delete file.analytics;
  }
  
  return file;
};

// Static methods
fileSchema.statics.createFile = function(fileData, uploaderData) {
  const fileId = `file_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
  const shareId = crypto.randomBytes(16).toString('hex').toLowerCase();
  
  return new this({
    fileId,
    shareId,
    originalName: fileData.originalname,
    mimeType: fileData.mimetype,
    size: fileData.size,
    path: fileData.path,
    uploadedBy: uploaderData.userId,
    uploaderNickname: uploaderData.nickname,
    roomId: uploaderData.roomId,
    access: {
      expiresAt: new Date(Date.now() + (uploaderData.expiryTime || 24 * 60 * 60 * 1000))
    }
  });
};

fileSchema.statics.findByShareId = function(shareId) {
  return this.findOne({ shareId, status: { $ne: 'deleted' } });
};

fileSchema.statics.findByUser = function(userId, limit = 50) {
  return this.find({ uploadedBy: userId, status: { $ne: 'deleted' } })
    .sort({ createdAt: -1 })
    .limit(limit);
};

fileSchema.statics.findExpiredFiles = function() {
  return this.find({
    'access.expiresAt': { $lt: new Date() },
    status: { $ne: 'deleted' }
  });
};

fileSchema.statics.findLargeFiles = function(sizeThreshold = 10 * 1024 * 1024) { // 10MB
  return this.find({ size: { $gte: sizeThreshold } });
};

fileSchema.statics.getStorageStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: null,
        totalFiles: { $sum: 1 },
        totalSize: { $sum: '$size' },
        avgSize: { $avg: '$size' },
        maxSize: { $max: '$size' },
        minSize: { $min: '$size' }
      }
    }
  ]);
};

fileSchema.statics.cleanupDeletedFiles = function() {
  return this.deleteMany({
    status: 'deleted',
    updatedAt: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } // 24 hours old
  });
};

module.exports = mongoose.model('File', fileSchema);
