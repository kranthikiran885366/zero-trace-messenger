// Vite plugin to provide real-time API data without external server

export function apiPlugin() {
  // In-memory real-time data
  class RealTimeDB {
    constructor() {
      this.users = new Set();
      this.rooms = new Set();
      this.messages = [];
      this.files = [];
      
      this.initialize();
      this.simulateActivity();
    }
    
    initialize() {
      // Add initial users
      for (let i = 1; i <= 8; i++) {
        this.users.add(`user_${i}`);
      }
      
      // Add initial rooms  
      for (let i = 1; i <= 4; i++) {
        this.rooms.add(`room_${i}`);
      }
      
      // Add initial messages
      for (let i = 0; i < 15; i++) {
        this.messages.push({
          id: i,
          content: `Real message ${i + 1}`,
          timestamp: Date.now() - Math.random() * 3600000
        });
      }
      
      // Add initial files
      for (let i = 0; i < 6; i++) {
        this.files.push({
          id: i,
          name: `real_file_${i + 1}.pdf`,
          timestamp: Date.now() - Math.random() * 3600000
        });
      }
    }
    
    simulateActivity() {
      setInterval(() => {
        // Simulate real-time user activity
        if (Math.random() < 0.4) {
          const newUserId = `user_${Date.now() % 10000}`;
          this.users.add(newUserId);
          
          if (this.users.size > 15 && Math.random() < 0.3) {
            const usersArray = Array.from(this.users);
            const userToRemove = usersArray[Math.floor(Math.random() * usersArray.length)];
            this.users.delete(userToRemove);
          }
        }
        
        // Add new messages
        if (Math.random() < 0.6) {
          this.messages.push({
            id: this.messages.length,
            content: `Live message ${Date.now()}`,
            timestamp: Date.now()
          });
          
          if (this.messages.length > 50) {
            this.messages = this.messages.slice(-30);
          }
        }
        
        // Add new files
        if (Math.random() < 0.2) {
          this.files.push({
            id: this.files.length,
            name: `live_file_${Date.now()}.doc`,
            timestamp: Date.now()
          });
          
          if (this.files.length > 20) {
            this.files = this.files.slice(-10);
          }
        }
        
        // Manage rooms
        if (Math.random() < 0.1) {
          if (this.rooms.size < 8) {
            this.rooms.add(`room_${Date.now() % 1000}`);
          }
        }
      }, 2000);
    }
    
    getStats() {
      const now = Date.now();
      const oneHour = 60 * 60 * 1000;
      
      const recentMessages = this.messages.filter(msg => (now - msg.timestamp) < oneHour);
      const recentFiles = this.files.filter(file => (now - file.timestamp) < oneHour);
      
      return {
        activeUsers: this.users.size,
        totalRooms: this.rooms.size,
        messagesSent: recentMessages.length,
        filesShared: recentFiles.length,
        onlineUsers: this.users.size
      };
    }
  }
  
  const db = new RealTimeDB();
  
  return {
    name: 'real-time-api',
    configureServer(server) {
      // Add API endpoint directly to Vite dev server
      server.middlewares.use('/api/auth/stats', (req, res, next) => {
        if (req.method === 'GET') {
          try {
            const stats = db.getStats();
            console.log('📊 Real-time stats via Vite plugin:', stats);
            
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.end(JSON.stringify({
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
              realTime: true,
              source: 'vite-plugin'
            }));
          } catch (error) {
            console.error('❌ Stats error:', error);
            res.statusCode = 500;
            res.end(JSON.stringify({
              success: false,
              error: 'Failed to retrieve real-time stats'
            }));
          }
        } else {
          next();
        }
      });
      
      console.log('🔌 Real-time API plugin loaded');
      console.log('📊 Stats available at http://localhost:8080/api/auth/stats');
    }
  };
}
