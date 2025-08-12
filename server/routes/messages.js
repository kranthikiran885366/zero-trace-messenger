const express = require('express');
const { verifyToken } = require('../middleware/auth');
const router = express.Router();

// Placeholder for message routes
// Messages are primarily handled through Socket.io
router.get('/health', (req, res) => {
  res.json({ success: true, message: 'Messages routes active' });
});

module.exports = router;
