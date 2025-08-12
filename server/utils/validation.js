const crypto = require('crypto');

/**
 * Validate email format
 */
const validateEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim().toLowerCase());
};

/**
 * Validate password strength
 */
const validatePassword = (password) => {
  if (!password || typeof password !== 'string') return false;
  
  // Minimum 8 characters, at least one letter and one number
  const minLength = password.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  
  return minLength && hasLetter && hasNumber;
};

/**
 * Generate device fingerprint for session tracking
 */
const generateFingerprint = (deviceInfo = {}) => {
  const {
    userAgent = '',
    language = '',
    timezone = '',
    screen = '',
    platform = ''
  } = deviceInfo;
  
  const fingerprint = crypto
    .createHash('sha256')
    .update(`${userAgent}${language}${timezone}${screen}${platform}`)
    .digest('hex');
    
  return fingerprint.substring(0, 16); // Return first 16 characters
};

/**
 * Validate nickname for anonymous sessions
 */
const validateNickname = (nickname) => {
  if (!nickname || typeof nickname !== 'string') return false;
  const trimmed = nickname.trim();
  return trimmed.length >= 2 && trimmed.length <= 50 && /^[a-zA-Z0-9_\-\s]+$/.test(trimmed);
};

/**
 * Validate room code format
 */
const validateRoomCode = (code) => {
  if (!code || typeof code !== 'string') return false;
  const cleaned = code.replace(/\s/g, '').toUpperCase();
  return /^[A-F0-9]{16}$/i.test(cleaned);
};

/**
 * Sanitize user input
 */
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input.trim().replace(/[<>]/g, '');
};

/**
 * Validate room settings
 */
const validateRoomSettings = (roomData) => {
  const { name, description, settings = {} } = roomData;
  const errors = [];

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    errors.push('Room name must be at least 2 characters long');
  }

  if (name && name.length > 100) {
    errors.push('Room name must be less than 100 characters');
  }

  if (description && typeof description === 'string' && description.length > 500) {
    errors.push('Room description must be less than 500 characters');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

module.exports = {
  validateEmail,
  validatePassword,
  generateFingerprint,
  validateNickname,
  validateRoomCode,
  sanitizeInput,
  validateRoomSettings
};
