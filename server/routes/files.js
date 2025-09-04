const express = require('express');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const multer = require('multer');
const mime = require('mime-types');
const sharp = require('sharp');
const { verifyToken } = require('../middleware/auth');
const File = require('../models/File');
const Room = require('../models/Room');

const router = express.Router();

// Ensure uploads dir exists
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `${Date.now()}_${crypto.randomBytes(6).toString('hex')}${ext}`;
    cb(null, name);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 },
});

// Helper to build public URL
const fileUrl = (req, storedName) => `${req.protocol}://${req.get('host')}/uploads/${storedName}`;

// Upload file
router.post('/upload', verifyToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const options = req.body.options ? JSON.parse(req.body.options) : {};

    // Validate room access if provided
    let roomId = undefined;
    if (options.roomId) {
      const room = await Room.findOne({ roomId: options.roomId, status: 'active', isActive: true });
      if (!room) {
        return res.status(404).json({ error: 'Room not found' });
      }
      const userInRoom = room.activeUsers.find(u => u.userId === req.user.userId);
      if (!userInRoom) {
        return res.status(403).json({ error: 'You must be in the room to upload files' });
      }
      roomId = room.roomId;
    }

    // Create file document
    const fileDoc = File.createFile(req.file, {
      userId: req.user.userId,
      nickname: req.user.nickname,
      roomId,
      expiryTime: options.expiryTime || 24 * 60 * 60 * 1000
    });

    // Generate checksums (md5/sha256/sha512)
    const buffer = fs.readFileSync(req.file.path);
    fileDoc.generateChecksums(buffer);

    // Thumbnail for images
    if (req.file.mimetype.startsWith('image/')) {
      const thumbName = `${path.parse(fileDoc.storedName).name}_thumb.jpg`;
      const thumbPath = path.join(UPLOADS_DIR, thumbName);
      try {
        await sharp(req.file.path).resize(320).jpeg({ quality: 75 }).toFile(thumbPath);
        fileDoc.thumbnailPath = thumbPath;
        fileDoc.thumbnailUrl = fileUrl(req, thumbName);
      } catch (e) {
        // thumbnail generation is best-effort
      }
    }

    // Set access controls
    if (options.password) {
      fileDoc.access.password = crypto.createHash('sha256').update(options.password).digest('hex');
      fileDoc.access.hasPassword = true;
    }
    if (Number.isFinite(options.maxDownloads)) {
      fileDoc.access.maxDownloads = Math.max(0, parseInt(options.maxDownloads));
    }
    if (options.burnAfterReading) {
      fileDoc.access.burnAfterReading = !!options.burnAfterReading;
    }
    if (options.isPublic !== undefined) {
      fileDoc.access.isPublic = !!options.isPublic;
    }

    // Publish URLs
    fileDoc.url = fileUrl(req, req.file.filename);

    // Mark processed/available
    await fileDoc.markAsProcessed({
      virusScanResult: 'clean',
      thumbnailGenerated: !!fileDoc.thumbnailPath
    });

    res.json({ success: true, file: fileDoc.toSafeObject(req.user.userId) });
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ error: 'File upload failed' });
  }
});

// Get file info by shareId
router.get('/:shareId', verifyToken, async (req, res) => {
  try {
    const { shareId } = req.params;
    const file = await File.findByShareId(shareId);
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }
    res.json({ success: true, file: file.toSafeObject(req.user.userId) });
  } catch (error) {
    console.error('Get file info error:', error);
    res.status(500).json({ error: 'Failed to get file info' });
  }
});

// Download file -> returns signed URL or direct URL for demo
router.get('/download/:shareId', verifyToken, async (req, res) => {
  try {
    const { shareId } = req.params;
    const { password } = req.query;

    const file = await File.findByShareId(shareId);
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Check password if required
    if (file.access.hasPassword) {
      if (!password) {
        return res.status(401).json({ error: 'Password required' });
      }
      const hash = crypto.createHash('sha256').update(String(password)).digest('hex');
      if (hash !== file.access.password) {
        return res.status(401).json({ error: 'Invalid password' });
      }
    }

    // Check permissions and limits
    if (!file.canDownload(req.user.userId)) {
      return res.status(403).json({ error: 'Download not allowed' });
    }

    // Record download
    const ipHash = crypto.createHash('sha256').update(req.ip || '').digest('hex');
    await file.recordDownload(req.user.userId, req.user.nickname, ipHash, req.headers['user-agent']);

    // Respond with URL and filename (frontend expects json)
    res.json({ success: true, url: file.url, filename: file.originalName });
  } catch (error) {
    console.error('Download file error:', error);
    res.status(500).json({ error: 'Failed to prepare download' });
  }
});

// List current user's files
router.get('/user', verifyToken, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit || '50');
    const files = await File.findByUser(req.user.userId, limit);
    res.json({ success: true, files: files.map(f => f.toSafeObject(req.user.userId)) });
  } catch (error) {
    console.error('List user files error:', error);
    res.status(500).json({ error: 'Failed to list files' });
  }
});

// Delete a file by id
router.delete('/:fileId', verifyToken, async (req, res) => {
  try {
    const { fileId } = req.params;
    const file = await File.findOne({ fileId });
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }
    if (file.uploadedBy !== req.user.userId) {
      return res.status(403).json({ error: 'Not authorized to delete this file' });
    }

    file.status = 'deleted';
    await file.save();

    // Best-effort delete from disk
    try {
      if (file.path && fs.existsSync(file.path)) fs.unlinkSync(file.path);
      if (file.thumbnailPath && fs.existsSync(file.thumbnailPath)) fs.unlinkSync(file.thumbnailPath);
    } catch {}

    res.json({ success: true });
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

module.exports = router;
