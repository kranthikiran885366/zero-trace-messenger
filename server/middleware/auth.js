const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware to verify JWT token
 */
const verifyToken = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        error: 'Access denied', 
        message: 'No token provided' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    const user = await User.findById(decoded.userId);
    
    if (!user || !user.isActive) {
      return res.status(401).json({ 
        error: 'Access denied', 
        message: 'Invalid token or user not found' 
      });
    }

    req.user = user;
    req.userId = user._id;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ 
      error: 'Access denied', 
      message: 'Invalid token' 
    });
  }
};

/**
 * Optional auth middleware - doesn't fail if no token
 */
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
      const user = await User.findById(decoded.userId);
      
      if (user && user.isActive) {
        req.user = user;
        req.userId = user._id;
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

/**
 * Middleware to check if user is anonymous
 */
const requireAnonymous = (req, res, next) => {
  if (!req.user || !req.user.isAnonymous) {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'This endpoint requires anonymous authentication'
    });
  }
  next();
};

/**
 * Middleware to check if user is registered (not anonymous)
 */
const requireRegistered = (req, res, next) => {
  if (!req.user || req.user.isAnonymous) {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'This endpoint requires registered user authentication'
    });
  }
  next();
};

module.exports = {
  verifyToken,
  optionalAuth,
  requireAnonymous,
  requireRegistered
};
