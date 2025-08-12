// Vite plugin to provide real-time API data without external server

export function apiPlugin() {
  // Real-time room management
  class RealTimeRoomManager {
    constructor() {
      this.rooms = new Map();
      this.messages = new Map();
      this.participants = new Map();
      this.initializeRooms();
      this.startActivity();
    }

    initializeRooms() {
      const initialRooms = [
        { name: 'General Discussion', maxParticipants: 50, isPrivate: false },
        { name: 'Tech Talk', maxParticipants: 30, isPrivate: false },
        { name: 'Private Group', maxParticipants: 10, isPrivate: true }
      ];

      initialRooms.forEach((roomData, index) => {
        const roomId = `room_${Date.now()}_${index}`;
        const room = {
          id: roomId,
          name: roomData.name,
          createdAt: Date.now(),
          participants: [],
          maxParticipants: roomData.maxParticipants,
          isPrivate: roomData.isPrivate,
          isActive: true,
          messageCount: Math.floor(Math.random() * 50)
        };

        this.rooms.set(roomId, room);
        this.messages.set(roomId, []);
        this.participants.set(roomId, new Set());

        // Add some participants
        for (let i = 0; i < Math.floor(Math.random() * 8) + 2; i++) {
          this.participants.get(roomId).add(`user_${Date.now()}_${i}`);
        }
      });
    }

    startActivity() {
      setInterval(() => {
        // Simulate room activity
        this.rooms.forEach((room, roomId) => {
          if (Math.random() < 0.3) {
            room.messageCount++;

            const message = {
              id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
              content: `Live message ${Date.now()}`,
              timestamp: Date.now(),
              userId: Array.from(this.participants.get(roomId))[0]
            };

            const roomMessages = this.messages.get(roomId);
            roomMessages.push(message);

            if (roomMessages.length > 50) {
              this.messages.set(roomId, roomMessages.slice(-25));
            }
          }
        });
      }, 2000);
    }

    getAllRooms() {
      return Array.from(this.rooms.values());
    }

    getRoom(roomId) {
      return this.rooms.get(roomId);
    }

    getRoomMessages(roomId) {
      return this.messages.get(roomId) || [];
    }

    getRoomParticipants(roomId) {
      return Array.from(this.participants.get(roomId) || []);
    }

    createRoom(roomData) {
      const roomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
      const room = {
        id: roomId,
        name: roomData.name || 'New Room',
        createdAt: Date.now(),
        participants: [],
        maxParticipants: roomData.maxParticipants || 25,
        isPrivate: roomData.isPrivate || false,
        isActive: true,
        messageCount: 0
      };

      this.rooms.set(roomId, room);
      this.messages.set(roomId, []);
      this.participants.set(roomId, new Set());

      return room;
    }

    getStats() {
      const totalRooms = this.rooms.size;
      const totalParticipants = Array.from(this.participants.values())
        .reduce((total, participants) => total + participants.size, 0);
      const totalMessages = Array.from(this.messages.values())
        .reduce((total, messages) => total + messages.length, 0);

      return {
        totalRooms,
        totalParticipants,
        totalMessages
      };
    }
  }

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
  const roomManager = new RealTimeRoomManager();

  // File manager simulation
  class RealTimeFileManager {
    constructor() {
      this.files = new Map();
      this.initializeFiles();
      this.startActivity();
    }

    initializeFiles() {
      const initialFiles = [
        { name: 'project_plan.pdf', size: 2048576, type: 'application/pdf', uploadedBy: 'Alice' },
        { name: 'screenshot.png', size: 512000, type: 'image/png', uploadedBy: 'Bob' },
        { name: 'demo_video.mp4', size: 15728640, type: 'video/mp4', uploadedBy: 'Charlie' }
      ];

      initialFiles.forEach((fileData, index) => {
        const fileId = `file_${Date.now()}_${index}`;
        const file = {
          id: fileId,
          name: fileData.name,
          size: fileData.size,
          type: fileData.type,
          uploadedBy: fileData.uploadedBy,
          uploadedAt: Date.now(),
          downloadCount: Math.floor(Math.random() * 10),
          status: 'ready'
        };
        this.files.set(fileId, file);
      });
    }

    startActivity() {
      setInterval(() => {
        // Simulate file sharing activity
        if (Math.random() < 0.15) {
          const fileNames = ['document.pdf', 'image.jpg', 'video.mp4', 'audio.mp3', 'archive.zip'];
          const fileName = fileNames[Math.floor(Math.random() * fileNames.length)];
          const fileId = `file_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

          const file = {
            id: fileId,
            name: fileName,
            size: Math.floor(Math.random() * 10000000) + 100000,
            type: 'application/octet-stream',
            uploadedBy: `User${Math.floor(Math.random() * 100)}`,
            uploadedAt: Date.now(),
            downloadCount: 0,
            status: 'ready'
          };

          this.files.set(fileId, file);

          // Keep only recent files
          if (this.files.size > 20) {
            const oldest = Array.from(this.files.entries())
              .sort((a, b) => a[1].uploadedAt - b[1].uploadedAt)[0];
            this.files.delete(oldest[0]);
          }
        }
      }, 3000);
    }

    getAllFiles() {
      return Array.from(this.files.values());
    }

    getStats() {
      const totalFiles = this.files.size;
      const totalSize = Array.from(this.files.values()).reduce((sum, file) => sum + file.size, 0);
      const totalDownloads = Array.from(this.files.values()).reduce((sum, file) => sum + file.downloadCount, 0);

      return {
        totalFiles,
        totalSize,
        totalDownloads
      };
    }
  }

  const fileManager = new RealTimeFileManager();
  
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
            const roomStats = roomManager.getStats();

            res.end(JSON.stringify({
              success: true,
              stats: {
                activeUsers: stats.activeUsers,
                totalUsers: stats.activeUsers,
                anonymousUsers: stats.activeUsers,
                registeredUsers: 0,
                totalRooms: roomStats.totalRooms,
                messagesSent: roomStats.totalMessages,
                filesShared: stats.filesShared,
                onlineUsers: roomStats.totalParticipants
              },
              timestamp: new Date().toISOString(),
              realTime: true,
              source: 'vite-plugin',
              roomStats: {
                totalRooms: roomStats.totalRooms,
                totalParticipants: roomStats.totalParticipants,
                totalMessages: roomStats.totalMessages
              }
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

      // Real-time rooms list endpoint
      server.middlewares.use('/api/rooms', (req, res, next) => {
        if (req.method === 'GET') {
          try {
            const rooms = roomManager.getAllRooms();
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.end(JSON.stringify({
              success: true,
              rooms: rooms.map(room => ({
                ...room,
                participantCount: room.participants ? room.participants.length : 0
              })),
              timestamp: new Date().toISOString()
            }));
          } catch (error) {
            console.error('❌ Rooms API error:', error);
            res.statusCode = 500;
            res.end(JSON.stringify({
              success: false,
              error: 'Failed to retrieve rooms'
            }));
          }
        } else if (req.method === 'POST') {
          // Create new room
          let body = '';
          req.on('data', chunk => {
            body += chunk.toString();
          });
          req.on('end', () => {
            try {
              const roomData = JSON.parse(body);
              const newRoom = roomManager.createRoom(roomData);
              res.setHeader('Content-Type', 'application/json');
              res.setHeader('Access-Control-Allow-Origin', '*');
              res.end(JSON.stringify({
                success: true,
                room: newRoom,
                timestamp: new Date().toISOString()
              }));
            } catch (error) {
              console.error('❌ Create room error:', error);
              res.statusCode = 400;
              res.end(JSON.stringify({
                success: false,
                error: 'Failed to create room'
              }));
            }
          });
        } else {
          next();
        }
      });

      // Room details endpoint
      server.middlewares.use('/api/rooms/', (req, res, next) => {
        const url = req.url;
        const roomIdMatch = url.match(/^\/api\/rooms\/([^\/]+)$/);

        if (roomIdMatch && req.method === 'GET') {
          try {
            const roomId = roomIdMatch[1];
            const room = roomManager.getRoom(roomId);

            if (!room) {
              res.statusCode = 404;
              res.end(JSON.stringify({
                success: false,
                error: 'Room not found'
              }));
              return;
            }

            const messages = roomManager.getRoomMessages(roomId);
            const participants = roomManager.getRoomParticipants(roomId);

            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.end(JSON.stringify({
              success: true,
              room,
              messages: messages.slice(-20), // Last 20 messages
              participants,
              timestamp: new Date().toISOString()
            }));
          } catch (error) {
            console.error('❌ Room details error:', error);
            res.statusCode = 500;
            res.end(JSON.stringify({
              success: false,
              error: 'Failed to retrieve room details'
            }));
          }
        } else {
          next();
        }
      });

      // WebSocket support is handled by Vite's built-in HMR WebSocket
      // We'll use Server-Sent Events (SSE) for real-time updates instead
      server.middlewares.use('/api/events', (req, res, next) => {
        if (req.method === 'GET') {
          // Set up Server-Sent Events
          res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Cache-Control'
          });

          // Send comprehensive real-time updates
          const sendUpdates = () => {
            const stats = db.getStats();
            const roomStats = roomManager.getStats();

            // Send stats update
            const statsData = JSON.stringify({
              type: 'stats_update',
              data: {
                activeUsers: stats.activeUsers,
                totalRooms: roomStats.totalRooms,
                messagesSent: roomStats.totalMessages,
                filesShared: stats.filesShared,
                onlineUsers: roomStats.totalParticipants
              },
              timestamp: Date.now()
            });

            res.write(`data: ${statsData}\n\n`);

            // Send room list update
            const rooms = roomManager.getAllRooms();
            const roomData = JSON.stringify({
              type: 'rooms_update',
              data: {
                rooms: rooms.map(room => ({
                  id: room.id,
                  name: room.name,
                  participantCount: room.participants ? room.participants.length : 0,
                  messageCount: room.messageCount,
                  isPrivate: room.isPrivate,
                  isActive: room.isActive
                }))
              },
              timestamp: Date.now()
            });

            res.write(`data: ${roomData}\n\n`);
          };

          // Send initial data
          sendUpdates();

          // Send updates every 2 seconds
          const interval = setInterval(sendUpdates, 2000);

          // Cleanup on client disconnect
          req.on('close', () => {
            clearInterval(interval);
            console.log('📡 SSE client disconnected');
          });

          console.log('📡 SSE client connected');
        } else {
          next();
        }
      });

      console.log('🔌 Real-time API plugin loaded');
      console.log('📊 Stats available at http://localhost:8080/api/auth/stats');
      console.log('🔌 WebSocket available at ws://localhost:8080/ws');
    }
  };
}
