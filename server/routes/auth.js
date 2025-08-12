const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const rateLimit = require('express-rate-limit');
const User = require('../models/User');
const { validateEmail, validatePassword, generateFingerprint } = require('../utils/validation');
const router = express.Router();

// Rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: { error: 'Too many authentication attempts' }
});

// Anonymous session creation
router.post('/anonymous', async (req, res) => {
  try {
    const { nickname, deviceInfo = {}, preferences = {} } = req.body;
    
    if (!nickname || nickname.length < 2 || nickname.length > 50) {
      return res.status(400).json({
        error: 'Invalid nickname',
        message: 'Nickname must be between 2 and 50 characters'
      });
    }
    
    // Generate device fingerprint
    const fingerprint = generateFingerprint({
      userAgent: req.headers['user-agent'],
      acceptLanguage: req.headers['accept-language'],
      acceptEncoding: req.headers['accept-encoding'],
      deviceInfo
    });
    
    // Create anonymous user
    const user = User.generateAnonymousUser(nickname, fingerprint);
    
    // Apply preferences
    if (preferences) {
      user.preferences = { ...user.preferences, ...preferences };
    }
    
    // Set metadata
    user.userAgent = req.headers['user-agent'];
    user.platform = deviceInfo.platform || 'unknown';
    user.language = req.headers['accept-language']?.split(',')[0] || 'en';
    
    // Log IP for security (hashed)
    const ipHash = crypto.createHash('sha256').update(req.ip).digest('hex');
    user.security.ipHistory.push({
      ip: ipHash,
      timestamp: new Date(),
      location: 'unknown' // Could integrate with IP geolocation service
    });
    
    await user.save();
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id,
        userIdString: user.userId,
        fingerprint: user.fingerprint,
        isAnonymous: true
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: process.env.JWT_EXPIRE || '24h' }
    );
    
    res.status(201).json({
      success: true,
      message: 'Anonymous session created successfully',
      user: user.toSafeObject(),
      token,
      expiresIn: process.env.JWT_EXPIRE || '24h'
    });
    
  } catch (error) {
    console.error('Anonymous session creation error:', error);
    res.status(500).json({
      error: 'Failed to create anonymous session',
      message: 'Internal server error'
    });
  }
});

// Register (optional - for persistent accounts)
router.post('/register', authLimiter, async (req, res) => {
  try {
    const { email, password, nickname, deviceInfo = {} } = req.body;
    
    // Validate input
    if (!validateEmail(email)) {
      return res.status(400).json({
        error: 'Invalid email',
        message: 'Please provide a valid email address'
      });
    }
    
    if (!validatePassword(password)) {
      return res.status(400).json({
        error: 'Invalid password',
        message: 'Password must be at least 8 characters with letters and numbers'
      });
    }
    
    if (!nickname || nickname.length < 2 || nickname.length > 50) {
      return res.status(400).json({
        error: 'Invalid nickname',
        message: 'Nickname must be between 2 and 50 characters'
      });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        error: 'User already exists',
        message: 'An account with this email already exists'
      });
    }
    
    // Generate fingerprint and user ID
    const fingerprint = generateFingerprint({
      userAgent: req.headers['user-agent'],
      acceptLanguage: req.headers['accept-language'],
      acceptEncoding: req.headers['accept-encoding'],
      deviceInfo
    });
    
    const userId = `user_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
    
    // Create user
    const user = new User({
      userId,
      email: email.toLowerCase(),
      password,
      nickname,
      fingerprint,
      isAnonymous: false,
      userAgent: req.headers['user-agent'],
      platform: deviceInfo.platform || 'unknown',
      language: req.headers['accept-language']?.split(',')[0] || 'en'
    });
    
    // Log IP for security
    const ipHash = crypto.createHash('sha256').update(req.ip).digest('hex');
    user.security.ipHistory.push({
      ip: ipHash,
      timestamp: new Date(),
      location: 'unknown'
    });
    
    await user.save();
    
    // Generate token
    const token = jwt.sign(
      { 
        userId: user._id,
        userIdString: user.userId,
        fingerprint: user.fingerprint,
        isAnonymous: false
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: process.env.JWT_EXPIRE || '24h' }
    );
    
    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      user: user.toSafeObject(),
      token,
      expiresIn: process.env.JWT_EXPIRE || '24h'
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: 'Failed to create account',
      message: 'Internal server error'
    });
  }
});

// Login (for persistent accounts)
router.post('/login', authLimiter, async (req, res) => {
  try {
    const { email, password, deviceInfo = {} } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        error: 'Missing credentials',
        message: 'Email and password are required'
      });
    }
    
    // Find user
    const user = await User.findOne({ 
      email: email.toLowerCase(),
      isAnonymous: false,
      isActive: true
    });
    
    if (!user) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Email or password is incorrect'
      });
    }
    
    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Email or password is incorrect'
      });
    }
    
    // Update user activity
    user.lastActive = new Date();
    user.status = 'online';
    
    // Log IP for security
    const ipHash = crypto.createHash('sha256').update(req.ip).digest('hex');
    user.security.ipHistory.push({
      ip: ipHash,
      timestamp: new Date(),
      location: 'unknown'
    });
    
    // Check for suspicious activity
    const recentIPs = user.security.ipHistory
      .filter(entry => entry.timestamp > new Date(Date.now() - 24 * 60 * 60 * 1000))
      .map(entry => entry.ip);
    
    const uniqueIPs = [...new Set(recentIPs)];
    if (uniqueIPs.length > 5) {
      user.logSuspiciousActivity(
        'multiple_ips',
        `Login from ${uniqueIPs.length} different IPs in 24 hours`,
        'medium'
      );
    }
    
    await user.save();
    
    // Generate token
    const token = jwt.sign(
      { 
        userId: user._id,
        userIdString: user.userId,
        fingerprint: user.fingerprint,
        isAnonymous: false
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: process.env.JWT_EXPIRE || '24h' }
    );
    
    res.json({
      success: true,
      message: 'Login successful',
      user: user.toSafeObject(),
      token,
      expiresIn: process.env.JWT_EXPIRE || '24h'
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Login failed',
      message: 'Internal server error'
    });
  }
});

// Refresh token
router.post('/refresh', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({
        error: 'Token required',
        message: 'Refresh token is required'
      });
    }
    
    // Verify current token (allow expired tokens for refresh)
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        decoded = jwt.decode(token);
      } else {
        return res.status(401).json({
          error: 'Invalid token',
          message: 'Token is malformed'
        });
      }
    }
    
    // Find user
    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      return res.status(401).json({
        error: 'User not found',
        message: 'User account no longer exists'
      });
    }
    
    // Update activity
    user.updateLastActive();
    
    // Generate new token
    const newToken = jwt.sign(
      { 
        userId: user._id,
        userIdString: user.userId,
        fingerprint: user.fingerprint,
        isAnonymous: user.isAnonymous
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: process.env.JWT_EXPIRE || '24h' }
    );
    
    res.json({
      success: true,
      message: 'Token refreshed successfully',
      user: user.toSafeObject(),
      token: newToken,
      expiresIn: process.env.JWT_EXPIRE || '24h'
    });
    
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({
      error: 'Token refresh failed',
      message: 'Internal server error'
    });
  }
});

// Logout
router.post('/logout', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        const user = await User.findById(decoded.userId);
        
        if (user) {
          user.status = 'offline';
          user.lastActive = new Date();
          await user.save();
        }
      } catch (error) {
        // Token might be expired, but that's okay for logout
      }
    }
    
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
    
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      error: 'Logout failed',
      message: 'Internal server error'
    });
  }
});

// Verify token
router.get('/verify', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'No token provided',
        message: 'Authorization header is required'
      });
    }
    
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      return res.status(401).json({
        error: 'User not found',
        message: 'User account no longer exists'
      });
    }
    
    // Update last active
    user.updateLastActive();
    
    res.json({
      success: true,
      valid: true,
      user: user.toSafeObject(),
      expiresAt: new Date(decoded.exp * 1000)
    });
    
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expired',
        message: 'Please refresh your token'
      });
    }
    
    console.error('Token verification error:', error);
    res.status(401).json({
      error: 'Invalid token',
      message: 'Token verification failed'
    });
  }
});

// Update user preferences
router.put('/preferences', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Valid token required'
      });
    }
    
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }
    
    const { preferences } = req.body;
    
    // Update preferences
    user.preferences = { ...user.preferences, ...preferences };
    user.lastActive = new Date();
    
    await user.save();
    
    res.json({
      success: true,
      message: 'Preferences updated successfully',
      preferences: user.preferences
    });
    
  } catch (error) {
    console.error('Preferences update error:', error);
    res.status(500).json({
      error: 'Failed to update preferences',
      message: 'Internal server error'
    });
  }
});

// Get real-time comprehensive stats
router.get('/stats', async (req, res) => {
  try {
    const inMemoryDB = require('../utils/inMemoryDB');

    // Get real-time stats from in-memory database
    const stats = inMemoryDB.getStats();
    const activeUsers = inMemoryDB.getActiveUsers();

    console.log('📊 Real-time stats requested:', stats);

    res.json({
      success: true,
      stats: {
        activeUsers: stats.activeUsers,
        totalUsers: stats.activeUsers, // All users are active in this system
        anonymousUsers: stats.activeUsers, // All users are anonymous for now
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
      error: 'Failed to retrieve real-time stats',
      message: error.message
    });
  }
});

module.exports = router;
