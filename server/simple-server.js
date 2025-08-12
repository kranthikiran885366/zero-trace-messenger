const express = require('express');
const cors = require('cors');
const inMemoryDB = require('./utils/inMemoryDB');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: ['http://localhost:8080', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Real-time stats endpoint
app.get('/api/auth/stats', (req, res) => {
  try {
    const stats = inMemoryDB.getStats();
    console.log('📊 Stats requested:', stats);
    
    res.json({
      success: true,
      stats: {
        activeUsers: stats.activeUsers,
        totalUsers: stats.activeUsers,
        anonymousUsers: stats.activeUsers,
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
      error: 'Failed to retrieve stats'
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 SecureChat Backend running on port ${PORT}`);
  console.log(`📊 Real-time stats available at http://localhost:${PORT}/api/auth/stats`);
  console.log(`🔗 Health check at http://localhost:${PORT}/health`);
});

module.exports = app;
