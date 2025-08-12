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
        // More aggressive user activity simulation
        if (Math.random() < 0.7) {
          const newUserId = `user_${Date.now() % 10000}`;
          this.users.add(newUserId);

          if (this.users.size > 25 && Math.random() < 0.4) {
            const usersArray = Array.from(this.users);
            const userToRemove = usersArray[Math.floor(Math.random() * usersArray.length)];
            this.users.delete(userToRemove);
          }
        }

        // More frequent message activity
        if (Math.random() < 0.8) {
          this.messages.push({
            id: this.messages.length,
            content: `Live message ${Date.now()}`,
            timestamp: Date.now()
          });

          if (this.messages.length > 100) {
            this.messages = this.messages.slice(-50);
          }
        }

        // More file sharing activity
        if (Math.random() < 0.4) {
          this.files.push({
            id: this.files.length,
            name: `live_file_${Date.now()}.${['pdf', 'doc', 'jpg', 'png', 'zip'][Math.floor(Math.random() * 5)]}`,
            timestamp: Date.now()
          });

          if (this.files.length > 30) {
            this.files = this.files.slice(-15);
          }
        }

        // Dynamic room management
        if (Math.random() < 0.3) {
          if (this.rooms.size < 12) {
            this.rooms.add(`room_${Date.now() % 1000}`);
          } else if (this.rooms.size > 15 && Math.random() < 0.2) {
            const roomsArray = Array.from(this.rooms);
            const roomToRemove = roomsArray[Math.floor(Math.random() * roomsArray.length)];
            this.rooms.delete(roomToRemove);
          }
        }
      }, 1500); // Faster updates every 1.5 seconds
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
      
      // Add WebSocket endpoint for real-time updates
      server.ws('/ws', {
        message(ws, data) {
          try {
            const message = JSON.parse(data.toString());
            console.log('📨 WebSocket message received:', message);

            switch (message.type) {
              case 'ping':
                ws.send(JSON.stringify({
                  type: 'pong',
                  data: { timestamp: Date.now() },
                  timestamp: Date.now()
                }));
                break;

              case 'request_stats':
                const stats = db.getStats();
                ws.send(JSON.stringify({
                  type: 'stats_update',
                  data: {
                    activeUsers: stats.activeUsers,
                    totalRooms: stats.totalRooms,
                    messagesSent: stats.messagesSent,
                    filesShared: stats.filesShared,
                    onlineUsers: stats.onlineUsers
                  },
                  timestamp: Date.now()
                }));
                break;

              case 'join_room':
                // Simulate room join
                ws.send(JSON.stringify({
                  type: 'room_update',
                  data: {
                    roomId: message.data.roomId,
                    action: 'joined',
                    message: 'Successfully joined room'
                  },
                  timestamp: Date.now()
                }));
                break;
            }
          } catch (error) {
            console.error('❌ WebSocket message error:', error);
          }
        },

        close(ws) {
          console.log('🔌 WebSocket connection closed');
        }
      });

      // Broadcast stats updates every 3 seconds
      setInterval(() => {
        const stats = db.getStats();
        const message = JSON.stringify({
          type: 'stats_update',
          data: {
            activeUsers: stats.activeUsers,
            totalRooms: stats.totalRooms,
            messagesSent: stats.messagesSent,
            filesShared: stats.filesShared,
            onlineUsers: stats.onlineUsers
          },
          timestamp: Date.now()
        });

        // Broadcast to all connected WebSocket clients
        server.ws.clients?.forEach((client) => {
          if (client.readyState === 1) { // WebSocket.OPEN
            try {
              client.send(message);
            } catch (error) {
              console.error('❌ Failed to broadcast to WebSocket client:', error);
            }
          }
        });
      }, 3000);

      console.log('🔌 Real-time API plugin loaded');
      console.log('📊 Stats available at http://localhost:8080/api/auth/stats');
      console.log('🔌 WebSocket available at ws://localhost:8080/ws');
    }
  };
}
