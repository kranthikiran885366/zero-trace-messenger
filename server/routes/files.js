const express = require('express');
const { verifyToken } = require('../middleware/auth');
const router = express.Router();

// Placeholder for file routes
router.get('/health', (req, res) => {
  res.json({ success: true, message: 'Files routes active' });
});

module.exports = router;
