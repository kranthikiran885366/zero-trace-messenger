const express = require('express');
const { verifyToken } = require('../middleware/auth');
const router = express.Router();

// Placeholder for user routes
router.get('/health', (req, res) => {
  res.json({ success: true, message: 'Users routes active' });
});

module.exports = router;
