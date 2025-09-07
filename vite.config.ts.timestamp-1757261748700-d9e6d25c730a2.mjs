// vite.config.ts
import { defineConfig } from "file:///app/code/node_modules/vite/dist/node/index.js";
import react from "file:///app/code/node_modules/@vitejs/plugin-react/dist/index.js";
import path from "path";

// vite-api-plugin.js
function apiPlugin() {
  class RealTimeRoomManager {
    constructor() {
      this.rooms = /* @__PURE__ */ new Map();
      this.messages = /* @__PURE__ */ new Map();
      this.participants = /* @__PURE__ */ new Map();
      this.initializeRooms();
      this.startActivity();
    }
    initializeRooms() {
      const initialRooms = [
        { name: "General Discussion", maxParticipants: 50, isPrivate: false },
        { name: "Tech Talk", maxParticipants: 30, isPrivate: false },
        { name: "Private Group", maxParticipants: 10, isPrivate: true }
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
        this.participants.set(roomId, /* @__PURE__ */ new Set());
        for (let i = 0; i < Math.floor(Math.random() * 8) + 2; i++) {
          this.participants.get(roomId).add(`user_${Date.now()}_${i}`);
        }
      });
    }
    startActivity() {
      setInterval(() => {
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
      }, 2e3);
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
        name: roomData.name || "New Room",
        createdAt: Date.now(),
        participants: [],
        maxParticipants: roomData.maxParticipants || 25,
        isPrivate: roomData.isPrivate || false,
        isActive: true,
        messageCount: 0
      };
      this.rooms.set(roomId, room);
      this.messages.set(roomId, []);
      this.participants.set(roomId, /* @__PURE__ */ new Set());
      return room;
    }
    getStats() {
      const totalRooms = this.rooms.size;
      const totalParticipants = Array.from(this.participants.values()).reduce((total, participants) => total + participants.size, 0);
      const totalMessages = Array.from(this.messages.values()).reduce((total, messages) => total + messages.length, 0);
      return {
        totalRooms,
        totalParticipants,
        totalMessages
      };
    }
  }
  class RealTimeDB {
    constructor() {
      this.users = /* @__PURE__ */ new Set();
      this.rooms = /* @__PURE__ */ new Set();
      this.messages = [];
      this.files = [];
      this.initialize();
      this.simulateActivity();
    }
    initialize() {
      for (let i = 1; i <= 8; i++) {
        this.users.add(`user_${i}`);
      }
      for (let i = 1; i <= 4; i++) {
        this.rooms.add(`room_${i}`);
      }
      for (let i = 0; i < 15; i++) {
        this.messages.push({
          id: i,
          content: `Real message ${i + 1}`,
          timestamp: Date.now() - Math.random() * 36e5
        });
      }
      for (let i = 0; i < 6; i++) {
        this.files.push({
          id: i,
          name: `real_file_${i + 1}.pdf`,
          timestamp: Date.now() - Math.random() * 36e5
        });
      }
    }
    simulateActivity() {
      setInterval(() => {
        if (Math.random() < 0.7) {
          const newUserId = `user_${Date.now() % 1e4}`;
          this.users.add(newUserId);
          if (this.users.size > 25 && Math.random() < 0.4) {
            const usersArray = Array.from(this.users);
            const userToRemove = usersArray[Math.floor(Math.random() * usersArray.length)];
            this.users.delete(userToRemove);
          }
        }
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
        if (Math.random() < 0.4) {
          this.files.push({
            id: this.files.length,
            name: `live_file_${Date.now()}.${["pdf", "doc", "jpg", "png", "zip"][Math.floor(Math.random() * 5)]}`,
            timestamp: Date.now()
          });
          if (this.files.length > 30) {
            this.files = this.files.slice(-15);
          }
        }
        if (Math.random() < 0.3) {
          if (this.rooms.size < 12) {
            this.rooms.add(`room_${Date.now() % 1e3}`);
          } else if (this.rooms.size > 15 && Math.random() < 0.2) {
            const roomsArray = Array.from(this.rooms);
            const roomToRemove = roomsArray[Math.floor(Math.random() * roomsArray.length)];
            this.rooms.delete(roomToRemove);
          }
        }
      }, 1500);
    }
    getStats() {
      const now = Date.now();
      const oneHour = 60 * 60 * 1e3;
      const recentMessages = this.messages.filter((msg) => now - msg.timestamp < oneHour);
      const recentFiles = this.files.filter((file) => now - file.timestamp < oneHour);
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
  class RealTimeFileManager {
    constructor() {
      this.files = /* @__PURE__ */ new Map();
      this.initializeFiles();
      this.startActivity();
    }
    initializeFiles() {
      const initialFiles = [
        { name: "project_plan.pdf", size: 2048576, type: "application/pdf", uploadedBy: "Alice" },
        { name: "screenshot.png", size: 512e3, type: "image/png", uploadedBy: "Bob" },
        { name: "demo_video.mp4", size: 15728640, type: "video/mp4", uploadedBy: "Charlie" }
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
          status: "ready"
        };
        this.files.set(fileId, file);
      });
    }
    startActivity() {
      setInterval(() => {
        if (Math.random() < 0.15) {
          const fileNames = ["document.pdf", "image.jpg", "video.mp4", "audio.mp3", "archive.zip"];
          const fileName = fileNames[Math.floor(Math.random() * fileNames.length)];
          const fileId = `file_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
          const file = {
            id: fileId,
            name: fileName,
            size: Math.floor(Math.random() * 1e7) + 1e5,
            type: "application/octet-stream",
            uploadedBy: `User${Math.floor(Math.random() * 100)}`,
            uploadedAt: Date.now(),
            downloadCount: 0,
            status: "ready"
          };
          this.files.set(fileId, file);
          if (this.files.size > 20) {
            const oldest = Array.from(this.files.entries()).sort((a, b) => a[1].uploadedAt - b[1].uploadedAt)[0];
            this.files.delete(oldest[0]);
          }
        }
      }, 3e3);
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
    name: "real-time-api",
    configureServer(server) {
      server.middlewares.use("/api/auth/stats", (req, res, next) => {
        if (req.method === "GET") {
          try {
            const stats = db.getStats();
            console.log("\u{1F4CA} Real-time stats via Vite plugin:", stats);
            res.setHeader("Content-Type", "application/json");
            res.setHeader("Access-Control-Allow-Origin", "*");
            const roomStats = roomManager.getStats();
            const fileStats = fileManager.getStats();
            res.end(JSON.stringify({
              success: true,
              stats: {
                activeUsers: stats.activeUsers,
                totalUsers: stats.activeUsers,
                anonymousUsers: stats.activeUsers,
                registeredUsers: 0,
                totalRooms: roomStats.totalRooms,
                messagesSent: roomStats.totalMessages,
                filesShared: fileStats.totalFiles,
                onlineUsers: roomStats.totalParticipants
              },
              timestamp: (/* @__PURE__ */ new Date()).toISOString(),
              realTime: true,
              source: "vite-plugin",
              roomStats: {
                totalRooms: roomStats.totalRooms,
                totalParticipants: roomStats.totalParticipants,
                totalMessages: roomStats.totalMessages
              },
              fileStats: {
                totalFiles: fileStats.totalFiles,
                totalSize: fileStats.totalSize,
                totalDownloads: fileStats.totalDownloads
              }
            }));
          } catch (error) {
            console.error("\u274C Stats error:", error);
            res.statusCode = 500;
            res.end(JSON.stringify({
              success: false,
              error: "Failed to retrieve real-time stats"
            }));
          }
        } else {
          next();
        }
      });
      server.middlewares.use("/api/auth/anonymous", (req, res, next) => {
        if (req.method === "POST") {
          try {
            const userId = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
            const fingerprint = `fp_${Date.now()}_${Math.random().toString(36).substr(2, 12)}`;
            const anonymousUser = {
              _id: userId,
              userId,
              nickname: `Anonymous_${Math.floor(Math.random() * 9999)}`,
              fingerprint,
              isAnonymous: true,
              preferences: {
                theme: "cyber",
                autoDeleteMessages: true,
                enableNotifications: true,
                showTypingIndicators: false,
                autoJoinVideo: false,
                defaultMessageTimer: 3e5,
                preferredQuality: "medium",
                enableSteganography: false,
                enableOnionRouting: false
              },
              stats: {
                roomsJoined: 0,
                messagesExchanged: 0,
                filesShared: 0,
                callMinutes: 0
              },
              status: "online",
              createdAt: /* @__PURE__ */ new Date(),
              lastActive: /* @__PURE__ */ new Date()
            };
            const sessionToken = `session_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`;
            console.log("\u{1F3AD} Anonymous session created:", { userId, nickname: anonymousUser.nickname });
            res.setHeader("Content-Type", "application/json");
            res.setHeader("Access-Control-Allow-Origin", "*");
            res.end(JSON.stringify({
              success: true,
              user: anonymousUser,
              sessionToken,
              expiresIn: 36e5,
              // 1 hour
              timestamp: (/* @__PURE__ */ new Date()).toISOString()
            }));
          } catch (error) {
            console.error("\u274C Anonymous auth error:", error);
            res.statusCode = 500;
            res.end(JSON.stringify({
              success: false,
              error: "Failed to create anonymous session"
            }));
          }
        } else if (req.method === "OPTIONS") {
          res.setHeader("Access-Control-Allow-Origin", "*");
          res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
          res.setHeader("Access-Control-Allow-Headers", "Content-Type");
          res.statusCode = 200;
          res.end();
        } else {
          next();
        }
      });
      server.middlewares.use("/api/rooms", (req, res, next) => {
        if (req.method === "GET") {
          try {
            const rooms = roomManager.getAllRooms();
            res.setHeader("Content-Type", "application/json");
            res.setHeader("Access-Control-Allow-Origin", "*");
            res.end(JSON.stringify({
              success: true,
              rooms: rooms.map((room) => ({
                ...room,
                participantCount: room.participants ? room.participants.length : 0
              })),
              timestamp: (/* @__PURE__ */ new Date()).toISOString()
            }));
          } catch (error) {
            console.error("\u274C Rooms API error:", error);
            res.statusCode = 500;
            res.end(JSON.stringify({
              success: false,
              error: "Failed to retrieve rooms"
            }));
          }
        } else if (req.method === "POST") {
          let body = "";
          req.on("data", (chunk) => {
            body += chunk.toString();
          });
          req.on("end", () => {
            try {
              const roomData = JSON.parse(body);
              const newRoom = roomManager.createRoom(roomData);
              res.setHeader("Content-Type", "application/json");
              res.setHeader("Access-Control-Allow-Origin", "*");
              res.end(JSON.stringify({
                success: true,
                room: newRoom,
                timestamp: (/* @__PURE__ */ new Date()).toISOString()
              }));
            } catch (error) {
              console.error("\u274C Create room error:", error);
              res.statusCode = 400;
              res.end(JSON.stringify({
                success: false,
                error: "Failed to create room"
              }));
            }
          });
        } else {
          next();
        }
      });
      server.middlewares.use("/api/rooms/", (req, res, next) => {
        const url = req.url;
        const roomIdMatch = url.match(/^\/api\/rooms\/([^\/]+)$/);
        if (roomIdMatch && req.method === "GET") {
          try {
            const roomId = roomIdMatch[1];
            const room = roomManager.getRoom(roomId);
            if (!room) {
              res.statusCode = 404;
              res.end(JSON.stringify({
                success: false,
                error: "Room not found"
              }));
              return;
            }
            const messages = roomManager.getRoomMessages(roomId);
            const participants = roomManager.getRoomParticipants(roomId);
            res.setHeader("Content-Type", "application/json");
            res.setHeader("Access-Control-Allow-Origin", "*");
            res.end(JSON.stringify({
              success: true,
              room,
              messages: messages.slice(-20),
              // Last 20 messages
              participants,
              timestamp: (/* @__PURE__ */ new Date()).toISOString()
            }));
          } catch (error) {
            console.error("\u274C Room details error:", error);
            res.statusCode = 500;
            res.end(JSON.stringify({
              success: false,
              error: "Failed to retrieve room details"
            }));
          }
        } else {
          next();
        }
      });
      server.middlewares.use("/api/events", (req, res, next) => {
        if (req.method === "GET") {
          res.writeHead(200, {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Cache-Control"
          });
          const sendUpdates = () => {
            const stats = db.getStats();
            const roomStats = roomManager.getStats();
            const fileStats = fileManager.getStats();
            const statsData = JSON.stringify({
              type: "stats_update",
              data: {
                activeUsers: stats.activeUsers,
                totalRooms: roomStats.totalRooms,
                messagesSent: roomStats.totalMessages,
                filesShared: fileStats.totalFiles,
                onlineUsers: roomStats.totalParticipants
              },
              timestamp: Date.now()
            });
            res.write(`data: ${statsData}

`);
            const rooms = roomManager.getAllRooms();
            const roomData = JSON.stringify({
              type: "rooms_update",
              data: {
                rooms: rooms.map((room) => ({
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
            res.write(`data: ${roomData}

`);
            const files = fileManager.getAllFiles();
            const fileData = JSON.stringify({
              type: "files_update",
              data: {
                files: files.slice(-10).map((file) => ({
                  // Last 10 files
                  id: file.id,
                  name: file.name,
                  size: file.size,
                  uploadedBy: file.uploadedBy,
                  uploadedAt: file.uploadedAt,
                  downloadCount: file.downloadCount,
                  status: file.status
                })),
                stats: fileStats
              },
              timestamp: Date.now()
            });
            res.write(`data: ${fileData}

`);
          };
          sendUpdates();
          const interval = setInterval(sendUpdates, 2e3);
          req.on("close", () => {
            clearInterval(interval);
            console.log("\u{1F4E1} SSE client disconnected");
          });
          console.log("\u{1F4E1} SSE client connected");
        } else {
          next();
        }
      });
      console.log("\u{1F50C} Real-time API plugin loaded");
      console.log("\u{1F4CA} Stats available at http://localhost:8080/api/auth/stats");
      console.log("\u{1F50C} WebSocket available at ws://localhost:8080/ws");
    }
  };
}

// vite.config.ts
var __vite_injected_original_dirname = "/app/code";
var vite_config_default = defineConfig({
  server: {
    host: "::",
    port: 8080
  },
  plugins: [react(), apiPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiLCAidml0ZS1hcGktcGx1Z2luLmpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL2FwcC9jb2RlXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvYXBwL2NvZGUvdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL2FwcC9jb2RlL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcbmltcG9ydCByZWFjdCBmcm9tIFwiQHZpdGVqcy9wbHVnaW4tcmVhY3RcIjtcbmltcG9ydCBwYXRoIGZyb20gXCJwYXRoXCI7XG5pbXBvcnQgeyBhcGlQbHVnaW4gfSBmcm9tIFwiLi92aXRlLWFwaS1wbHVnaW4uanNcIjtcblxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIHNlcnZlcjoge1xuICAgIGhvc3Q6IFwiOjpcIixcbiAgICBwb3J0OiA4MDgwLFxuICB9LFxuICBwbHVnaW5zOiBbcmVhY3QoKSwgYXBpUGx1Z2luKCldLFxuICByZXNvbHZlOiB7XG4gICAgYWxpYXM6IHtcbiAgICAgIFwiQFwiOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcIi4vc3JjXCIpLFxuICAgIH0sXG4gIH0sXG59KTtcbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL2FwcC9jb2RlXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvYXBwL2NvZGUvdml0ZS1hcGktcGx1Z2luLmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9hcHAvY29kZS92aXRlLWFwaS1wbHVnaW4uanNcIjsvLyBWaXRlIHBsdWdpbiB0byBwcm92aWRlIHJlYWwtdGltZSBBUEkgZGF0YSB3aXRob3V0IGV4dGVybmFsIHNlcnZlclxuXG5leHBvcnQgZnVuY3Rpb24gYXBpUGx1Z2luKCkge1xuICAvLyBSZWFsLXRpbWUgcm9vbSBtYW5hZ2VtZW50XG4gIGNsYXNzIFJlYWxUaW1lUm9vbU1hbmFnZXIge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgdGhpcy5yb29tcyA9IG5ldyBNYXAoKTtcbiAgICAgIHRoaXMubWVzc2FnZXMgPSBuZXcgTWFwKCk7XG4gICAgICB0aGlzLnBhcnRpY2lwYW50cyA9IG5ldyBNYXAoKTtcbiAgICAgIHRoaXMuaW5pdGlhbGl6ZVJvb21zKCk7XG4gICAgICB0aGlzLnN0YXJ0QWN0aXZpdHkoKTtcbiAgICB9XG5cbiAgICBpbml0aWFsaXplUm9vbXMoKSB7XG4gICAgICBjb25zdCBpbml0aWFsUm9vbXMgPSBbXG4gICAgICAgIHsgbmFtZTogJ0dlbmVyYWwgRGlzY3Vzc2lvbicsIG1heFBhcnRpY2lwYW50czogNTAsIGlzUHJpdmF0ZTogZmFsc2UgfSxcbiAgICAgICAgeyBuYW1lOiAnVGVjaCBUYWxrJywgbWF4UGFydGljaXBhbnRzOiAzMCwgaXNQcml2YXRlOiBmYWxzZSB9LFxuICAgICAgICB7IG5hbWU6ICdQcml2YXRlIEdyb3VwJywgbWF4UGFydGljaXBhbnRzOiAxMCwgaXNQcml2YXRlOiB0cnVlIH1cbiAgICAgIF07XG5cbiAgICAgIGluaXRpYWxSb29tcy5mb3JFYWNoKChyb29tRGF0YSwgaW5kZXgpID0+IHtcbiAgICAgICAgY29uc3Qgcm9vbUlkID0gYHJvb21fJHtEYXRlLm5vdygpfV8ke2luZGV4fWA7XG4gICAgICAgIGNvbnN0IHJvb20gPSB7XG4gICAgICAgICAgaWQ6IHJvb21JZCxcbiAgICAgICAgICBuYW1lOiByb29tRGF0YS5uYW1lLFxuICAgICAgICAgIGNyZWF0ZWRBdDogRGF0ZS5ub3coKSxcbiAgICAgICAgICBwYXJ0aWNpcGFudHM6IFtdLFxuICAgICAgICAgIG1heFBhcnRpY2lwYW50czogcm9vbURhdGEubWF4UGFydGljaXBhbnRzLFxuICAgICAgICAgIGlzUHJpdmF0ZTogcm9vbURhdGEuaXNQcml2YXRlLFxuICAgICAgICAgIGlzQWN0aXZlOiB0cnVlLFxuICAgICAgICAgIG1lc3NhZ2VDb3VudDogTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogNTApXG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5yb29tcy5zZXQocm9vbUlkLCByb29tKTtcbiAgICAgICAgdGhpcy5tZXNzYWdlcy5zZXQocm9vbUlkLCBbXSk7XG4gICAgICAgIHRoaXMucGFydGljaXBhbnRzLnNldChyb29tSWQsIG5ldyBTZXQoKSk7XG5cbiAgICAgICAgLy8gQWRkIHNvbWUgcGFydGljaXBhbnRzXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogOCkgKyAyOyBpKyspIHtcbiAgICAgICAgICB0aGlzLnBhcnRpY2lwYW50cy5nZXQocm9vbUlkKS5hZGQoYHVzZXJfJHtEYXRlLm5vdygpfV8ke2l9YCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHN0YXJ0QWN0aXZpdHkoKSB7XG4gICAgICBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICAgIC8vIFNpbXVsYXRlIHJvb20gYWN0aXZpdHlcbiAgICAgICAgdGhpcy5yb29tcy5mb3JFYWNoKChyb29tLCByb29tSWQpID0+IHtcbiAgICAgICAgICBpZiAoTWF0aC5yYW5kb20oKSA8IDAuMykge1xuICAgICAgICAgICAgcm9vbS5tZXNzYWdlQ291bnQrKztcblxuICAgICAgICAgICAgY29uc3QgbWVzc2FnZSA9IHtcbiAgICAgICAgICAgICAgaWQ6IGBtc2dfJHtEYXRlLm5vdygpfV8ke01hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnN1YnN0cigyLCA1KX1gLFxuICAgICAgICAgICAgICBjb250ZW50OiBgTGl2ZSBtZXNzYWdlICR7RGF0ZS5ub3coKX1gLFxuICAgICAgICAgICAgICB0aW1lc3RhbXA6IERhdGUubm93KCksXG4gICAgICAgICAgICAgIHVzZXJJZDogQXJyYXkuZnJvbSh0aGlzLnBhcnRpY2lwYW50cy5nZXQocm9vbUlkKSlbMF1cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGNvbnN0IHJvb21NZXNzYWdlcyA9IHRoaXMubWVzc2FnZXMuZ2V0KHJvb21JZCk7XG4gICAgICAgICAgICByb29tTWVzc2FnZXMucHVzaChtZXNzYWdlKTtcblxuICAgICAgICAgICAgaWYgKHJvb21NZXNzYWdlcy5sZW5ndGggPiA1MCkge1xuICAgICAgICAgICAgICB0aGlzLm1lc3NhZ2VzLnNldChyb29tSWQsIHJvb21NZXNzYWdlcy5zbGljZSgtMjUpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfSwgMjAwMCk7XG4gICAgfVxuXG4gICAgZ2V0QWxsUm9vbXMoKSB7XG4gICAgICByZXR1cm4gQXJyYXkuZnJvbSh0aGlzLnJvb21zLnZhbHVlcygpKTtcbiAgICB9XG5cbiAgICBnZXRSb29tKHJvb21JZCkge1xuICAgICAgcmV0dXJuIHRoaXMucm9vbXMuZ2V0KHJvb21JZCk7XG4gICAgfVxuXG4gICAgZ2V0Um9vbU1lc3NhZ2VzKHJvb21JZCkge1xuICAgICAgcmV0dXJuIHRoaXMubWVzc2FnZXMuZ2V0KHJvb21JZCkgfHwgW107XG4gICAgfVxuXG4gICAgZ2V0Um9vbVBhcnRpY2lwYW50cyhyb29tSWQpIHtcbiAgICAgIHJldHVybiBBcnJheS5mcm9tKHRoaXMucGFydGljaXBhbnRzLmdldChyb29tSWQpIHx8IFtdKTtcbiAgICB9XG5cbiAgICBjcmVhdGVSb29tKHJvb21EYXRhKSB7XG4gICAgICBjb25zdCByb29tSWQgPSBgcm9vbV8ke0RhdGUubm93KCl9XyR7TWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc3Vic3RyKDIsIDgpfWA7XG4gICAgICBjb25zdCByb29tID0ge1xuICAgICAgICBpZDogcm9vbUlkLFxuICAgICAgICBuYW1lOiByb29tRGF0YS5uYW1lIHx8ICdOZXcgUm9vbScsXG4gICAgICAgIGNyZWF0ZWRBdDogRGF0ZS5ub3coKSxcbiAgICAgICAgcGFydGljaXBhbnRzOiBbXSxcbiAgICAgICAgbWF4UGFydGljaXBhbnRzOiByb29tRGF0YS5tYXhQYXJ0aWNpcGFudHMgfHwgMjUsXG4gICAgICAgIGlzUHJpdmF0ZTogcm9vbURhdGEuaXNQcml2YXRlIHx8IGZhbHNlLFxuICAgICAgICBpc0FjdGl2ZTogdHJ1ZSxcbiAgICAgICAgbWVzc2FnZUNvdW50OiAwXG4gICAgICB9O1xuXG4gICAgICB0aGlzLnJvb21zLnNldChyb29tSWQsIHJvb20pO1xuICAgICAgdGhpcy5tZXNzYWdlcy5zZXQocm9vbUlkLCBbXSk7XG4gICAgICB0aGlzLnBhcnRpY2lwYW50cy5zZXQocm9vbUlkLCBuZXcgU2V0KCkpO1xuXG4gICAgICByZXR1cm4gcm9vbTtcbiAgICB9XG5cbiAgICBnZXRTdGF0cygpIHtcbiAgICAgIGNvbnN0IHRvdGFsUm9vbXMgPSB0aGlzLnJvb21zLnNpemU7XG4gICAgICBjb25zdCB0b3RhbFBhcnRpY2lwYW50cyA9IEFycmF5LmZyb20odGhpcy5wYXJ0aWNpcGFudHMudmFsdWVzKCkpXG4gICAgICAgIC5yZWR1Y2UoKHRvdGFsLCBwYXJ0aWNpcGFudHMpID0+IHRvdGFsICsgcGFydGljaXBhbnRzLnNpemUsIDApO1xuICAgICAgY29uc3QgdG90YWxNZXNzYWdlcyA9IEFycmF5LmZyb20odGhpcy5tZXNzYWdlcy52YWx1ZXMoKSlcbiAgICAgICAgLnJlZHVjZSgodG90YWwsIG1lc3NhZ2VzKSA9PiB0b3RhbCArIG1lc3NhZ2VzLmxlbmd0aCwgMCk7XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIHRvdGFsUm9vbXMsXG4gICAgICAgIHRvdGFsUGFydGljaXBhbnRzLFxuICAgICAgICB0b3RhbE1lc3NhZ2VzXG4gICAgICB9O1xuICAgIH1cbiAgfVxuXG4gIC8vIEluLW1lbW9yeSByZWFsLXRpbWUgZGF0YVxuICBjbGFzcyBSZWFsVGltZURCIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgIHRoaXMudXNlcnMgPSBuZXcgU2V0KCk7XG4gICAgICB0aGlzLnJvb21zID0gbmV3IFNldCgpO1xuICAgICAgdGhpcy5tZXNzYWdlcyA9IFtdO1xuICAgICAgdGhpcy5maWxlcyA9IFtdO1xuICAgICAgXG4gICAgICB0aGlzLmluaXRpYWxpemUoKTtcbiAgICAgIHRoaXMuc2ltdWxhdGVBY3Rpdml0eSgpO1xuICAgIH1cbiAgICBcbiAgICBpbml0aWFsaXplKCkge1xuICAgICAgLy8gQWRkIGluaXRpYWwgdXNlcnNcbiAgICAgIGZvciAobGV0IGkgPSAxOyBpIDw9IDg7IGkrKykge1xuICAgICAgICB0aGlzLnVzZXJzLmFkZChgdXNlcl8ke2l9YCk7XG4gICAgICB9XG4gICAgICBcbiAgICAgIC8vIEFkZCBpbml0aWFsIHJvb21zICBcbiAgICAgIGZvciAobGV0IGkgPSAxOyBpIDw9IDQ7IGkrKykge1xuICAgICAgICB0aGlzLnJvb21zLmFkZChgcm9vbV8ke2l9YCk7XG4gICAgICB9XG4gICAgICBcbiAgICAgIC8vIEFkZCBpbml0aWFsIG1lc3NhZ2VzXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDE1OyBpKyspIHtcbiAgICAgICAgdGhpcy5tZXNzYWdlcy5wdXNoKHtcbiAgICAgICAgICBpZDogaSxcbiAgICAgICAgICBjb250ZW50OiBgUmVhbCBtZXNzYWdlICR7aSArIDF9YCxcbiAgICAgICAgICB0aW1lc3RhbXA6IERhdGUubm93KCkgLSBNYXRoLnJhbmRvbSgpICogMzYwMDAwMFxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgLy8gQWRkIGluaXRpYWwgZmlsZXNcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgNjsgaSsrKSB7XG4gICAgICAgIHRoaXMuZmlsZXMucHVzaCh7XG4gICAgICAgICAgaWQ6IGksXG4gICAgICAgICAgbmFtZTogYHJlYWxfZmlsZV8ke2kgKyAxfS5wZGZgLFxuICAgICAgICAgIHRpbWVzdGFtcDogRGF0ZS5ub3coKSAtIE1hdGgucmFuZG9tKCkgKiAzNjAwMDAwXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBzaW11bGF0ZUFjdGl2aXR5KCkge1xuICAgICAgc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgICAvLyBNb3JlIGFnZ3Jlc3NpdmUgdXNlciBhY3Rpdml0eSBzaW11bGF0aW9uXG4gICAgICAgIGlmIChNYXRoLnJhbmRvbSgpIDwgMC43KSB7XG4gICAgICAgICAgY29uc3QgbmV3VXNlcklkID0gYHVzZXJfJHtEYXRlLm5vdygpICUgMTAwMDB9YDtcbiAgICAgICAgICB0aGlzLnVzZXJzLmFkZChuZXdVc2VySWQpO1xuXG4gICAgICAgICAgaWYgKHRoaXMudXNlcnMuc2l6ZSA+IDI1ICYmIE1hdGgucmFuZG9tKCkgPCAwLjQpIHtcbiAgICAgICAgICAgIGNvbnN0IHVzZXJzQXJyYXkgPSBBcnJheS5mcm9tKHRoaXMudXNlcnMpO1xuICAgICAgICAgICAgY29uc3QgdXNlclRvUmVtb3ZlID0gdXNlcnNBcnJheVtNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiB1c2Vyc0FycmF5Lmxlbmd0aCldO1xuICAgICAgICAgICAgdGhpcy51c2Vycy5kZWxldGUodXNlclRvUmVtb3ZlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBNb3JlIGZyZXF1ZW50IG1lc3NhZ2UgYWN0aXZpdHlcbiAgICAgICAgaWYgKE1hdGgucmFuZG9tKCkgPCAwLjgpIHtcbiAgICAgICAgICB0aGlzLm1lc3NhZ2VzLnB1c2goe1xuICAgICAgICAgICAgaWQ6IHRoaXMubWVzc2FnZXMubGVuZ3RoLFxuICAgICAgICAgICAgY29udGVudDogYExpdmUgbWVzc2FnZSAke0RhdGUubm93KCl9YCxcbiAgICAgICAgICAgIHRpbWVzdGFtcDogRGF0ZS5ub3coKVxuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgaWYgKHRoaXMubWVzc2FnZXMubGVuZ3RoID4gMTAwKSB7XG4gICAgICAgICAgICB0aGlzLm1lc3NhZ2VzID0gdGhpcy5tZXNzYWdlcy5zbGljZSgtNTApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIE1vcmUgZmlsZSBzaGFyaW5nIGFjdGl2aXR5XG4gICAgICAgIGlmIChNYXRoLnJhbmRvbSgpIDwgMC40KSB7XG4gICAgICAgICAgdGhpcy5maWxlcy5wdXNoKHtcbiAgICAgICAgICAgIGlkOiB0aGlzLmZpbGVzLmxlbmd0aCxcbiAgICAgICAgICAgIG5hbWU6IGBsaXZlX2ZpbGVfJHtEYXRlLm5vdygpfS4ke1sncGRmJywgJ2RvYycsICdqcGcnLCAncG5nJywgJ3ppcCddW01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDUpXX1gLFxuICAgICAgICAgICAgdGltZXN0YW1wOiBEYXRlLm5vdygpXG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICBpZiAodGhpcy5maWxlcy5sZW5ndGggPiAzMCkge1xuICAgICAgICAgICAgdGhpcy5maWxlcyA9IHRoaXMuZmlsZXMuc2xpY2UoLTE1KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBEeW5hbWljIHJvb20gbWFuYWdlbWVudFxuICAgICAgICBpZiAoTWF0aC5yYW5kb20oKSA8IDAuMykge1xuICAgICAgICAgIGlmICh0aGlzLnJvb21zLnNpemUgPCAxMikge1xuICAgICAgICAgICAgdGhpcy5yb29tcy5hZGQoYHJvb21fJHtEYXRlLm5vdygpICUgMTAwMH1gKTtcbiAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMucm9vbXMuc2l6ZSA+IDE1ICYmIE1hdGgucmFuZG9tKCkgPCAwLjIpIHtcbiAgICAgICAgICAgIGNvbnN0IHJvb21zQXJyYXkgPSBBcnJheS5mcm9tKHRoaXMucm9vbXMpO1xuICAgICAgICAgICAgY29uc3Qgcm9vbVRvUmVtb3ZlID0gcm9vbXNBcnJheVtNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiByb29tc0FycmF5Lmxlbmd0aCldO1xuICAgICAgICAgICAgdGhpcy5yb29tcy5kZWxldGUocm9vbVRvUmVtb3ZlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0sIDE1MDApOyAvLyBGYXN0ZXIgdXBkYXRlcyBldmVyeSAxLjUgc2Vjb25kc1xuICAgIH1cbiAgICBcbiAgICBnZXRTdGF0cygpIHtcbiAgICAgIGNvbnN0IG5vdyA9IERhdGUubm93KCk7XG4gICAgICBjb25zdCBvbmVIb3VyID0gNjAgKiA2MCAqIDEwMDA7XG4gICAgICBcbiAgICAgIGNvbnN0IHJlY2VudE1lc3NhZ2VzID0gdGhpcy5tZXNzYWdlcy5maWx0ZXIobXNnID0+IChub3cgLSBtc2cudGltZXN0YW1wKSA8IG9uZUhvdXIpO1xuICAgICAgY29uc3QgcmVjZW50RmlsZXMgPSB0aGlzLmZpbGVzLmZpbHRlcihmaWxlID0+IChub3cgLSBmaWxlLnRpbWVzdGFtcCkgPCBvbmVIb3VyKTtcbiAgICAgIFxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgYWN0aXZlVXNlcnM6IHRoaXMudXNlcnMuc2l6ZSxcbiAgICAgICAgdG90YWxSb29tczogdGhpcy5yb29tcy5zaXplLFxuICAgICAgICBtZXNzYWdlc1NlbnQ6IHJlY2VudE1lc3NhZ2VzLmxlbmd0aCxcbiAgICAgICAgZmlsZXNTaGFyZWQ6IHJlY2VudEZpbGVzLmxlbmd0aCxcbiAgICAgICAgb25saW5lVXNlcnM6IHRoaXMudXNlcnMuc2l6ZVxuICAgICAgfTtcbiAgICB9XG4gIH1cblxuICBjb25zdCBkYiA9IG5ldyBSZWFsVGltZURCKCk7XG4gIGNvbnN0IHJvb21NYW5hZ2VyID0gbmV3IFJlYWxUaW1lUm9vbU1hbmFnZXIoKTtcblxuICAvLyBGaWxlIG1hbmFnZXIgc2ltdWxhdGlvblxuICBjbGFzcyBSZWFsVGltZUZpbGVNYW5hZ2VyIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgIHRoaXMuZmlsZXMgPSBuZXcgTWFwKCk7XG4gICAgICB0aGlzLmluaXRpYWxpemVGaWxlcygpO1xuICAgICAgdGhpcy5zdGFydEFjdGl2aXR5KCk7XG4gICAgfVxuXG4gICAgaW5pdGlhbGl6ZUZpbGVzKCkge1xuICAgICAgY29uc3QgaW5pdGlhbEZpbGVzID0gW1xuICAgICAgICB7IG5hbWU6ICdwcm9qZWN0X3BsYW4ucGRmJywgc2l6ZTogMjA0ODU3NiwgdHlwZTogJ2FwcGxpY2F0aW9uL3BkZicsIHVwbG9hZGVkQnk6ICdBbGljZScgfSxcbiAgICAgICAgeyBuYW1lOiAnc2NyZWVuc2hvdC5wbmcnLCBzaXplOiA1MTIwMDAsIHR5cGU6ICdpbWFnZS9wbmcnLCB1cGxvYWRlZEJ5OiAnQm9iJyB9LFxuICAgICAgICB7IG5hbWU6ICdkZW1vX3ZpZGVvLm1wNCcsIHNpemU6IDE1NzI4NjQwLCB0eXBlOiAndmlkZW8vbXA0JywgdXBsb2FkZWRCeTogJ0NoYXJsaWUnIH1cbiAgICAgIF07XG5cbiAgICAgIGluaXRpYWxGaWxlcy5mb3JFYWNoKChmaWxlRGF0YSwgaW5kZXgpID0+IHtcbiAgICAgICAgY29uc3QgZmlsZUlkID0gYGZpbGVfJHtEYXRlLm5vdygpfV8ke2luZGV4fWA7XG4gICAgICAgIGNvbnN0IGZpbGUgPSB7XG4gICAgICAgICAgaWQ6IGZpbGVJZCxcbiAgICAgICAgICBuYW1lOiBmaWxlRGF0YS5uYW1lLFxuICAgICAgICAgIHNpemU6IGZpbGVEYXRhLnNpemUsXG4gICAgICAgICAgdHlwZTogZmlsZURhdGEudHlwZSxcbiAgICAgICAgICB1cGxvYWRlZEJ5OiBmaWxlRGF0YS51cGxvYWRlZEJ5LFxuICAgICAgICAgIHVwbG9hZGVkQXQ6IERhdGUubm93KCksXG4gICAgICAgICAgZG93bmxvYWRDb3VudDogTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMTApLFxuICAgICAgICAgIHN0YXR1czogJ3JlYWR5J1xuICAgICAgICB9O1xuICAgICAgICB0aGlzLmZpbGVzLnNldChmaWxlSWQsIGZpbGUpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgc3RhcnRBY3Rpdml0eSgpIHtcbiAgICAgIHNldEludGVydmFsKCgpID0+IHtcbiAgICAgICAgLy8gU2ltdWxhdGUgZmlsZSBzaGFyaW5nIGFjdGl2aXR5XG4gICAgICAgIGlmIChNYXRoLnJhbmRvbSgpIDwgMC4xNSkge1xuICAgICAgICAgIGNvbnN0IGZpbGVOYW1lcyA9IFsnZG9jdW1lbnQucGRmJywgJ2ltYWdlLmpwZycsICd2aWRlby5tcDQnLCAnYXVkaW8ubXAzJywgJ2FyY2hpdmUuemlwJ107XG4gICAgICAgICAgY29uc3QgZmlsZU5hbWUgPSBmaWxlTmFtZXNbTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogZmlsZU5hbWVzLmxlbmd0aCldO1xuICAgICAgICAgIGNvbnN0IGZpbGVJZCA9IGBmaWxlXyR7RGF0ZS5ub3coKX1fJHtNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zdWJzdHIoMiwgNSl9YDtcblxuICAgICAgICAgIGNvbnN0IGZpbGUgPSB7XG4gICAgICAgICAgICBpZDogZmlsZUlkLFxuICAgICAgICAgICAgbmFtZTogZmlsZU5hbWUsXG4gICAgICAgICAgICBzaXplOiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAxMDAwMDAwMCkgKyAxMDAwMDAsXG4gICAgICAgICAgICB0eXBlOiAnYXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtJyxcbiAgICAgICAgICAgIHVwbG9hZGVkQnk6IGBVc2VyJHtNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAxMDApfWAsXG4gICAgICAgICAgICB1cGxvYWRlZEF0OiBEYXRlLm5vdygpLFxuICAgICAgICAgICAgZG93bmxvYWRDb3VudDogMCxcbiAgICAgICAgICAgIHN0YXR1czogJ3JlYWR5J1xuICAgICAgICAgIH07XG5cbiAgICAgICAgICB0aGlzLmZpbGVzLnNldChmaWxlSWQsIGZpbGUpO1xuXG4gICAgICAgICAgLy8gS2VlcCBvbmx5IHJlY2VudCBmaWxlc1xuICAgICAgICAgIGlmICh0aGlzLmZpbGVzLnNpemUgPiAyMCkge1xuICAgICAgICAgICAgY29uc3Qgb2xkZXN0ID0gQXJyYXkuZnJvbSh0aGlzLmZpbGVzLmVudHJpZXMoKSlcbiAgICAgICAgICAgICAgLnNvcnQoKGEsIGIpID0+IGFbMV0udXBsb2FkZWRBdCAtIGJbMV0udXBsb2FkZWRBdClbMF07XG4gICAgICAgICAgICB0aGlzLmZpbGVzLmRlbGV0ZShvbGRlc3RbMF0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSwgMzAwMCk7XG4gICAgfVxuXG4gICAgZ2V0QWxsRmlsZXMoKSB7XG4gICAgICByZXR1cm4gQXJyYXkuZnJvbSh0aGlzLmZpbGVzLnZhbHVlcygpKTtcbiAgICB9XG5cbiAgICBnZXRTdGF0cygpIHtcbiAgICAgIGNvbnN0IHRvdGFsRmlsZXMgPSB0aGlzLmZpbGVzLnNpemU7XG4gICAgICBjb25zdCB0b3RhbFNpemUgPSBBcnJheS5mcm9tKHRoaXMuZmlsZXMudmFsdWVzKCkpLnJlZHVjZSgoc3VtLCBmaWxlKSA9PiBzdW0gKyBmaWxlLnNpemUsIDApO1xuICAgICAgY29uc3QgdG90YWxEb3dubG9hZHMgPSBBcnJheS5mcm9tKHRoaXMuZmlsZXMudmFsdWVzKCkpLnJlZHVjZSgoc3VtLCBmaWxlKSA9PiBzdW0gKyBmaWxlLmRvd25sb2FkQ291bnQsIDApO1xuXG4gICAgICByZXR1cm4ge1xuICAgICAgICB0b3RhbEZpbGVzLFxuICAgICAgICB0b3RhbFNpemUsXG4gICAgICAgIHRvdGFsRG93bmxvYWRzXG4gICAgICB9O1xuICAgIH1cbiAgfVxuXG4gIGNvbnN0IGZpbGVNYW5hZ2VyID0gbmV3IFJlYWxUaW1lRmlsZU1hbmFnZXIoKTtcbiAgXG4gIHJldHVybiB7XG4gICAgbmFtZTogJ3JlYWwtdGltZS1hcGknLFxuICAgIGNvbmZpZ3VyZVNlcnZlcihzZXJ2ZXIpIHtcbiAgICAgIC8vIEFkZCBBUEkgZW5kcG9pbnQgZGlyZWN0bHkgdG8gVml0ZSBkZXYgc2VydmVyXG4gICAgICBzZXJ2ZXIubWlkZGxld2FyZXMudXNlKCcvYXBpL2F1dGgvc3RhdHMnLCAocmVxLCByZXMsIG5leHQpID0+IHtcbiAgICAgICAgaWYgKHJlcS5tZXRob2QgPT09ICdHRVQnKSB7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHN0YXRzID0gZGIuZ2V0U3RhdHMoKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdcdUQ4M0RcdURDQ0EgUmVhbC10aW1lIHN0YXRzIHZpYSBWaXRlIHBsdWdpbjonLCBzdGF0cyk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHJlcy5zZXRIZWFkZXIoJ0NvbnRlbnQtVHlwZScsICdhcHBsaWNhdGlvbi9qc29uJyk7XG4gICAgICAgICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4nLCAnKicpO1xuICAgICAgICAgICAgY29uc3Qgcm9vbVN0YXRzID0gcm9vbU1hbmFnZXIuZ2V0U3RhdHMoKTtcbiAgICAgICAgICAgIGNvbnN0IGZpbGVTdGF0cyA9IGZpbGVNYW5hZ2VyLmdldFN0YXRzKCk7XG5cbiAgICAgICAgICAgIHJlcy5lbmQoSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgICAgICAgICBzdGF0czoge1xuICAgICAgICAgICAgICAgIGFjdGl2ZVVzZXJzOiBzdGF0cy5hY3RpdmVVc2VycyxcbiAgICAgICAgICAgICAgICB0b3RhbFVzZXJzOiBzdGF0cy5hY3RpdmVVc2VycyxcbiAgICAgICAgICAgICAgICBhbm9ueW1vdXNVc2Vyczogc3RhdHMuYWN0aXZlVXNlcnMsXG4gICAgICAgICAgICAgICAgcmVnaXN0ZXJlZFVzZXJzOiAwLFxuICAgICAgICAgICAgICAgIHRvdGFsUm9vbXM6IHJvb21TdGF0cy50b3RhbFJvb21zLFxuICAgICAgICAgICAgICAgIG1lc3NhZ2VzU2VudDogcm9vbVN0YXRzLnRvdGFsTWVzc2FnZXMsXG4gICAgICAgICAgICAgICAgZmlsZXNTaGFyZWQ6IGZpbGVTdGF0cy50b3RhbEZpbGVzLFxuICAgICAgICAgICAgICAgIG9ubGluZVVzZXJzOiByb29tU3RhdHMudG90YWxQYXJ0aWNpcGFudHNcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgdGltZXN0YW1wOiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXG4gICAgICAgICAgICAgIHJlYWxUaW1lOiB0cnVlLFxuICAgICAgICAgICAgICBzb3VyY2U6ICd2aXRlLXBsdWdpbicsXG4gICAgICAgICAgICAgIHJvb21TdGF0czoge1xuICAgICAgICAgICAgICAgIHRvdGFsUm9vbXM6IHJvb21TdGF0cy50b3RhbFJvb21zLFxuICAgICAgICAgICAgICAgIHRvdGFsUGFydGljaXBhbnRzOiByb29tU3RhdHMudG90YWxQYXJ0aWNpcGFudHMsXG4gICAgICAgICAgICAgICAgdG90YWxNZXNzYWdlczogcm9vbVN0YXRzLnRvdGFsTWVzc2FnZXNcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgZmlsZVN0YXRzOiB7XG4gICAgICAgICAgICAgICAgdG90YWxGaWxlczogZmlsZVN0YXRzLnRvdGFsRmlsZXMsXG4gICAgICAgICAgICAgICAgdG90YWxTaXplOiBmaWxlU3RhdHMudG90YWxTaXplLFxuICAgICAgICAgICAgICAgIHRvdGFsRG93bmxvYWRzOiBmaWxlU3RhdHMudG90YWxEb3dubG9hZHNcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSkpO1xuICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdcdTI3NEMgU3RhdHMgZXJyb3I6JywgZXJyb3IpO1xuICAgICAgICAgICAgcmVzLnN0YXR1c0NvZGUgPSA1MDA7XG4gICAgICAgICAgICByZXMuZW5kKEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICAgICAgICAgIGVycm9yOiAnRmFpbGVkIHRvIHJldHJpZXZlIHJlYWwtdGltZSBzdGF0cydcbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbmV4dCgpO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgLy8gQW5vbnltb3VzIGF1dGhlbnRpY2F0aW9uIGVuZHBvaW50XG4gICAgICBzZXJ2ZXIubWlkZGxld2FyZXMudXNlKCcvYXBpL2F1dGgvYW5vbnltb3VzJywgKHJlcSwgcmVzLCBuZXh0KSA9PiB7XG4gICAgICAgIGlmIChyZXEubWV0aG9kID09PSAnUE9TVCcpIHtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gR2VuZXJhdGUgYW5vbnltb3VzIHVzZXIgc2Vzc2lvblxuICAgICAgICAgICAgY29uc3QgdXNlcklkID0gYGFub25fJHtEYXRlLm5vdygpfV8ke01hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnN1YnN0cigyLCA4KX1gO1xuICAgICAgICAgICAgY29uc3QgZmluZ2VycHJpbnQgPSBgZnBfJHtEYXRlLm5vdygpfV8ke01hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnN1YnN0cigyLCAxMil9YDtcblxuICAgICAgICAgICAgY29uc3QgYW5vbnltb3VzVXNlciA9IHtcbiAgICAgICAgICAgICAgX2lkOiB1c2VySWQsXG4gICAgICAgICAgICAgIHVzZXJJZDogdXNlcklkLFxuICAgICAgICAgICAgICBuaWNrbmFtZTogYEFub255bW91c18ke01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDk5OTkpfWAsXG4gICAgICAgICAgICAgIGZpbmdlcnByaW50OiBmaW5nZXJwcmludCxcbiAgICAgICAgICAgICAgaXNBbm9ueW1vdXM6IHRydWUsXG4gICAgICAgICAgICAgIHByZWZlcmVuY2VzOiB7XG4gICAgICAgICAgICAgICAgdGhlbWU6ICdjeWJlcicsXG4gICAgICAgICAgICAgICAgYXV0b0RlbGV0ZU1lc3NhZ2VzOiB0cnVlLFxuICAgICAgICAgICAgICAgIGVuYWJsZU5vdGlmaWNhdGlvbnM6IHRydWUsXG4gICAgICAgICAgICAgICAgc2hvd1R5cGluZ0luZGljYXRvcnM6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGF1dG9Kb2luVmlkZW86IGZhbHNlLFxuICAgICAgICAgICAgICAgIGRlZmF1bHRNZXNzYWdlVGltZXI6IDMwMDAwMCxcbiAgICAgICAgICAgICAgICBwcmVmZXJyZWRRdWFsaXR5OiAnbWVkaXVtJyxcbiAgICAgICAgICAgICAgICBlbmFibGVTdGVnYW5vZ3JhcGh5OiBmYWxzZSxcbiAgICAgICAgICAgICAgICBlbmFibGVPbmlvblJvdXRpbmc6IGZhbHNlXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIHN0YXRzOiB7XG4gICAgICAgICAgICAgICAgcm9vbXNKb2luZWQ6IDAsXG4gICAgICAgICAgICAgICAgbWVzc2FnZXNFeGNoYW5nZWQ6IDAsXG4gICAgICAgICAgICAgICAgZmlsZXNTaGFyZWQ6IDAsXG4gICAgICAgICAgICAgICAgY2FsbE1pbnV0ZXM6IDBcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgc3RhdHVzOiAnb25saW5lJyxcbiAgICAgICAgICAgICAgY3JlYXRlZEF0OiBuZXcgRGF0ZSgpLFxuICAgICAgICAgICAgICBsYXN0QWN0aXZlOiBuZXcgRGF0ZSgpXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBjb25zdCBzZXNzaW9uVG9rZW4gPSBgc2Vzc2lvbl8ke0RhdGUubm93KCl9XyR7TWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc3Vic3RyKDIsIDE2KX1gO1xuXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnXHVEODNDXHVERkFEIEFub255bW91cyBzZXNzaW9uIGNyZWF0ZWQ6JywgeyB1c2VySWQsIG5pY2tuYW1lOiBhbm9ueW1vdXNVc2VyLm5pY2tuYW1lIH0pO1xuXG4gICAgICAgICAgICByZXMuc2V0SGVhZGVyKCdDb250ZW50LVR5cGUnLCAnYXBwbGljYXRpb24vanNvbicpO1xuICAgICAgICAgICAgcmVzLnNldEhlYWRlcignQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luJywgJyonKTtcbiAgICAgICAgICAgIHJlcy5lbmQoSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgICAgICAgICB1c2VyOiBhbm9ueW1vdXNVc2VyLFxuICAgICAgICAgICAgICBzZXNzaW9uVG9rZW46IHNlc3Npb25Ub2tlbixcbiAgICAgICAgICAgICAgZXhwaXJlc0luOiAzNjAwMDAwLCAvLyAxIGhvdXJcbiAgICAgICAgICAgICAgdGltZXN0YW1wOiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKClcbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignXHUyNzRDIEFub255bW91cyBhdXRoIGVycm9yOicsIGVycm9yKTtcbiAgICAgICAgICAgIHJlcy5zdGF0dXNDb2RlID0gNTAwO1xuICAgICAgICAgICAgcmVzLmVuZChKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgICAgICAgICBlcnJvcjogJ0ZhaWxlZCB0byBjcmVhdGUgYW5vbnltb3VzIHNlc3Npb24nXG4gICAgICAgICAgICB9KSk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKHJlcS5tZXRob2QgPT09ICdPUFRJT05TJykge1xuICAgICAgICAgIC8vIEhhbmRsZSBDT1JTIHByZWZsaWdodFxuICAgICAgICAgIHJlcy5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbicsICcqJyk7XG4gICAgICAgICAgcmVzLnNldEhlYWRlcignQWNjZXNzLUNvbnRyb2wtQWxsb3ctTWV0aG9kcycsICdQT1NULCBPUFRJT05TJyk7XG4gICAgICAgICAgcmVzLnNldEhlYWRlcignQWNjZXNzLUNvbnRyb2wtQWxsb3ctSGVhZGVycycsICdDb250ZW50LVR5cGUnKTtcbiAgICAgICAgICByZXMuc3RhdHVzQ29kZSA9IDIwMDtcbiAgICAgICAgICByZXMuZW5kKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbmV4dCgpO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgLy8gUmVhbC10aW1lIHJvb21zIGxpc3QgZW5kcG9pbnRcbiAgICAgIHNlcnZlci5taWRkbGV3YXJlcy51c2UoJy9hcGkvcm9vbXMnLCAocmVxLCByZXMsIG5leHQpID0+IHtcbiAgICAgICAgaWYgKHJlcS5tZXRob2QgPT09ICdHRVQnKSB7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHJvb21zID0gcm9vbU1hbmFnZXIuZ2V0QWxsUm9vbXMoKTtcbiAgICAgICAgICAgIHJlcy5zZXRIZWFkZXIoJ0NvbnRlbnQtVHlwZScsICdhcHBsaWNhdGlvbi9qc29uJyk7XG4gICAgICAgICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4nLCAnKicpO1xuICAgICAgICAgICAgcmVzLmVuZChKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgICAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICAgICAgICAgIHJvb21zOiByb29tcy5tYXAocm9vbSA9PiAoe1xuICAgICAgICAgICAgICAgIC4uLnJvb20sXG4gICAgICAgICAgICAgICAgcGFydGljaXBhbnRDb3VudDogcm9vbS5wYXJ0aWNpcGFudHMgPyByb29tLnBhcnRpY2lwYW50cy5sZW5ndGggOiAwXG4gICAgICAgICAgICAgIH0pKSxcbiAgICAgICAgICAgICAgdGltZXN0YW1wOiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKClcbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignXHUyNzRDIFJvb21zIEFQSSBlcnJvcjonLCBlcnJvcik7XG4gICAgICAgICAgICByZXMuc3RhdHVzQ29kZSA9IDUwMDtcbiAgICAgICAgICAgIHJlcy5lbmQoSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgICAgICAgZXJyb3I6ICdGYWlsZWQgdG8gcmV0cmlldmUgcm9vbXMnXG4gICAgICAgICAgICB9KSk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKHJlcS5tZXRob2QgPT09ICdQT1NUJykge1xuICAgICAgICAgIC8vIENyZWF0ZSBuZXcgcm9vbVxuICAgICAgICAgIGxldCBib2R5ID0gJyc7XG4gICAgICAgICAgcmVxLm9uKCdkYXRhJywgY2h1bmsgPT4ge1xuICAgICAgICAgICAgYm9keSArPSBjaHVuay50b1N0cmluZygpO1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIHJlcS5vbignZW5kJywgKCkgPT4ge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgY29uc3Qgcm9vbURhdGEgPSBKU09OLnBhcnNlKGJvZHkpO1xuICAgICAgICAgICAgICBjb25zdCBuZXdSb29tID0gcm9vbU1hbmFnZXIuY3JlYXRlUm9vbShyb29tRGF0YSk7XG4gICAgICAgICAgICAgIHJlcy5zZXRIZWFkZXIoJ0NvbnRlbnQtVHlwZScsICdhcHBsaWNhdGlvbi9qc29uJyk7XG4gICAgICAgICAgICAgIHJlcy5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbicsICcqJyk7XG4gICAgICAgICAgICAgIHJlcy5lbmQoSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICAgICAgICAgICAgcm9vbTogbmV3Um9vbSxcbiAgICAgICAgICAgICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKVxuICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCdcdTI3NEMgQ3JlYXRlIHJvb20gZXJyb3I6JywgZXJyb3IpO1xuICAgICAgICAgICAgICByZXMuc3RhdHVzQ29kZSA9IDQwMDtcbiAgICAgICAgICAgICAgcmVzLmVuZChKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgICAgICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICAgICAgICAgICAgZXJyb3I6ICdGYWlsZWQgdG8gY3JlYXRlIHJvb20nXG4gICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBuZXh0KCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICAvLyBSb29tIGRldGFpbHMgZW5kcG9pbnRcbiAgICAgIHNlcnZlci5taWRkbGV3YXJlcy51c2UoJy9hcGkvcm9vbXMvJywgKHJlcSwgcmVzLCBuZXh0KSA9PiB7XG4gICAgICAgIGNvbnN0IHVybCA9IHJlcS51cmw7XG4gICAgICAgIGNvbnN0IHJvb21JZE1hdGNoID0gdXJsLm1hdGNoKC9eXFwvYXBpXFwvcm9vbXNcXC8oW15cXC9dKykkLyk7XG5cbiAgICAgICAgaWYgKHJvb21JZE1hdGNoICYmIHJlcS5tZXRob2QgPT09ICdHRVQnKSB7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHJvb21JZCA9IHJvb21JZE1hdGNoWzFdO1xuICAgICAgICAgICAgY29uc3Qgcm9vbSA9IHJvb21NYW5hZ2VyLmdldFJvb20ocm9vbUlkKTtcblxuICAgICAgICAgICAgaWYgKCFyb29tKSB7XG4gICAgICAgICAgICAgIHJlcy5zdGF0dXNDb2RlID0gNDA0O1xuICAgICAgICAgICAgICByZXMuZW5kKEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBlcnJvcjogJ1Jvb20gbm90IGZvdW5kJ1xuICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3QgbWVzc2FnZXMgPSByb29tTWFuYWdlci5nZXRSb29tTWVzc2FnZXMocm9vbUlkKTtcbiAgICAgICAgICAgIGNvbnN0IHBhcnRpY2lwYW50cyA9IHJvb21NYW5hZ2VyLmdldFJvb21QYXJ0aWNpcGFudHMocm9vbUlkKTtcblxuICAgICAgICAgICAgcmVzLnNldEhlYWRlcignQ29udGVudC1UeXBlJywgJ2FwcGxpY2F0aW9uL2pzb24nKTtcbiAgICAgICAgICAgIHJlcy5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbicsICcqJyk7XG4gICAgICAgICAgICByZXMuZW5kKEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgICAgICAgcm9vbSxcbiAgICAgICAgICAgICAgbWVzc2FnZXM6IG1lc3NhZ2VzLnNsaWNlKC0yMCksIC8vIExhc3QgMjAgbWVzc2FnZXNcbiAgICAgICAgICAgICAgcGFydGljaXBhbnRzLFxuICAgICAgICAgICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKVxuICAgICAgICAgICAgfSkpO1xuICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdcdTI3NEMgUm9vbSBkZXRhaWxzIGVycm9yOicsIGVycm9yKTtcbiAgICAgICAgICAgIHJlcy5zdGF0dXNDb2RlID0gNTAwO1xuICAgICAgICAgICAgcmVzLmVuZChKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgICAgICAgICBlcnJvcjogJ0ZhaWxlZCB0byByZXRyaWV2ZSByb29tIGRldGFpbHMnXG4gICAgICAgICAgICB9KSk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIG5leHQoKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIC8vIFdlYlNvY2tldCBzdXBwb3J0IGlzIGhhbmRsZWQgYnkgVml0ZSdzIGJ1aWx0LWluIEhNUiBXZWJTb2NrZXRcbiAgICAgIC8vIFdlJ2xsIHVzZSBTZXJ2ZXItU2VudCBFdmVudHMgKFNTRSkgZm9yIHJlYWwtdGltZSB1cGRhdGVzIGluc3RlYWRcbiAgICAgIHNlcnZlci5taWRkbGV3YXJlcy51c2UoJy9hcGkvZXZlbnRzJywgKHJlcSwgcmVzLCBuZXh0KSA9PiB7XG4gICAgICAgIGlmIChyZXEubWV0aG9kID09PSAnR0VUJykge1xuICAgICAgICAgIC8vIFNldCB1cCBTZXJ2ZXItU2VudCBFdmVudHNcbiAgICAgICAgICByZXMud3JpdGVIZWFkKDIwMCwge1xuICAgICAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICd0ZXh0L2V2ZW50LXN0cmVhbScsXG4gICAgICAgICAgICAnQ2FjaGUtQ29udHJvbCc6ICduby1jYWNoZScsXG4gICAgICAgICAgICAnQ29ubmVjdGlvbic6ICdrZWVwLWFsaXZlJyxcbiAgICAgICAgICAgICdBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4nOiAnKicsXG4gICAgICAgICAgICAnQWNjZXNzLUNvbnRyb2wtQWxsb3ctSGVhZGVycyc6ICdDYWNoZS1Db250cm9sJ1xuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgLy8gU2VuZCBjb21wcmVoZW5zaXZlIHJlYWwtdGltZSB1cGRhdGVzXG4gICAgICAgICAgY29uc3Qgc2VuZFVwZGF0ZXMgPSAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBzdGF0cyA9IGRiLmdldFN0YXRzKCk7XG4gICAgICAgICAgICBjb25zdCByb29tU3RhdHMgPSByb29tTWFuYWdlci5nZXRTdGF0cygpO1xuICAgICAgICAgICAgY29uc3QgZmlsZVN0YXRzID0gZmlsZU1hbmFnZXIuZ2V0U3RhdHMoKTtcblxuICAgICAgICAgICAgLy8gU2VuZCBzdGF0cyB1cGRhdGVcbiAgICAgICAgICAgIGNvbnN0IHN0YXRzRGF0YSA9IEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgICAgICAgdHlwZTogJ3N0YXRzX3VwZGF0ZScsXG4gICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICBhY3RpdmVVc2Vyczogc3RhdHMuYWN0aXZlVXNlcnMsXG4gICAgICAgICAgICAgICAgdG90YWxSb29tczogcm9vbVN0YXRzLnRvdGFsUm9vbXMsXG4gICAgICAgICAgICAgICAgbWVzc2FnZXNTZW50OiByb29tU3RhdHMudG90YWxNZXNzYWdlcyxcbiAgICAgICAgICAgICAgICBmaWxlc1NoYXJlZDogZmlsZVN0YXRzLnRvdGFsRmlsZXMsXG4gICAgICAgICAgICAgICAgb25saW5lVXNlcnM6IHJvb21TdGF0cy50b3RhbFBhcnRpY2lwYW50c1xuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICB0aW1lc3RhbXA6IERhdGUubm93KClcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICByZXMud3JpdGUoYGRhdGE6ICR7c3RhdHNEYXRhfVxcblxcbmApO1xuXG4gICAgICAgICAgICAvLyBTZW5kIHJvb20gbGlzdCB1cGRhdGVcbiAgICAgICAgICAgIGNvbnN0IHJvb21zID0gcm9vbU1hbmFnZXIuZ2V0QWxsUm9vbXMoKTtcbiAgICAgICAgICAgIGNvbnN0IHJvb21EYXRhID0gSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgICAgICB0eXBlOiAncm9vbXNfdXBkYXRlJyxcbiAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgIHJvb21zOiByb29tcy5tYXAocm9vbSA9PiAoe1xuICAgICAgICAgICAgICAgICAgaWQ6IHJvb20uaWQsXG4gICAgICAgICAgICAgICAgICBuYW1lOiByb29tLm5hbWUsXG4gICAgICAgICAgICAgICAgICBwYXJ0aWNpcGFudENvdW50OiByb29tLnBhcnRpY2lwYW50cyA/IHJvb20ucGFydGljaXBhbnRzLmxlbmd0aCA6IDAsXG4gICAgICAgICAgICAgICAgICBtZXNzYWdlQ291bnQ6IHJvb20ubWVzc2FnZUNvdW50LFxuICAgICAgICAgICAgICAgICAgaXNQcml2YXRlOiByb29tLmlzUHJpdmF0ZSxcbiAgICAgICAgICAgICAgICAgIGlzQWN0aXZlOiByb29tLmlzQWN0aXZlXG4gICAgICAgICAgICAgICAgfSkpXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIHRpbWVzdGFtcDogRGF0ZS5ub3coKVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHJlcy53cml0ZShgZGF0YTogJHtyb29tRGF0YX1cXG5cXG5gKTtcblxuICAgICAgICAgICAgLy8gU2VuZCBmaWxlIHNoYXJpbmcgdXBkYXRlc1xuICAgICAgICAgICAgY29uc3QgZmlsZXMgPSBmaWxlTWFuYWdlci5nZXRBbGxGaWxlcygpO1xuICAgICAgICAgICAgY29uc3QgZmlsZURhdGEgPSBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgICAgICAgIHR5cGU6ICdmaWxlc191cGRhdGUnLFxuICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgZmlsZXM6IGZpbGVzLnNsaWNlKC0xMCkubWFwKGZpbGUgPT4gKHsgLy8gTGFzdCAxMCBmaWxlc1xuICAgICAgICAgICAgICAgICAgaWQ6IGZpbGUuaWQsXG4gICAgICAgICAgICAgICAgICBuYW1lOiBmaWxlLm5hbWUsXG4gICAgICAgICAgICAgICAgICBzaXplOiBmaWxlLnNpemUsXG4gICAgICAgICAgICAgICAgICB1cGxvYWRlZEJ5OiBmaWxlLnVwbG9hZGVkQnksXG4gICAgICAgICAgICAgICAgICB1cGxvYWRlZEF0OiBmaWxlLnVwbG9hZGVkQXQsXG4gICAgICAgICAgICAgICAgICBkb3dubG9hZENvdW50OiBmaWxlLmRvd25sb2FkQ291bnQsXG4gICAgICAgICAgICAgICAgICBzdGF0dXM6IGZpbGUuc3RhdHVzXG4gICAgICAgICAgICAgICAgfSkpLFxuICAgICAgICAgICAgICAgIHN0YXRzOiBmaWxlU3RhdHNcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgdGltZXN0YW1wOiBEYXRlLm5vdygpXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgcmVzLndyaXRlKGBkYXRhOiAke2ZpbGVEYXRhfVxcblxcbmApO1xuICAgICAgICAgIH07XG5cbiAgICAgICAgICAvLyBTZW5kIGluaXRpYWwgZGF0YVxuICAgICAgICAgIHNlbmRVcGRhdGVzKCk7XG5cbiAgICAgICAgICAvLyBTZW5kIHVwZGF0ZXMgZXZlcnkgMiBzZWNvbmRzXG4gICAgICAgICAgY29uc3QgaW50ZXJ2YWwgPSBzZXRJbnRlcnZhbChzZW5kVXBkYXRlcywgMjAwMCk7XG5cbiAgICAgICAgICAvLyBDbGVhbnVwIG9uIGNsaWVudCBkaXNjb25uZWN0XG4gICAgICAgICAgcmVxLm9uKCdjbG9zZScsICgpID0+IHtcbiAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWwpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ1x1RDgzRFx1RENFMSBTU0UgY2xpZW50IGRpc2Nvbm5lY3RlZCcpO1xuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgY29uc29sZS5sb2coJ1x1RDgzRFx1RENFMSBTU0UgY2xpZW50IGNvbm5lY3RlZCcpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIG5leHQoKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIGNvbnNvbGUubG9nKCdcdUQ4M0RcdUREMEMgUmVhbC10aW1lIEFQSSBwbHVnaW4gbG9hZGVkJyk7XG4gICAgICBjb25zb2xlLmxvZygnXHVEODNEXHVEQ0NBIFN0YXRzIGF2YWlsYWJsZSBhdCBodHRwOi8vbG9jYWxob3N0OjgwODAvYXBpL2F1dGgvc3RhdHMnKTtcbiAgICAgIGNvbnNvbGUubG9nKCdcdUQ4M0RcdUREMEMgV2ViU29ja2V0IGF2YWlsYWJsZSBhdCB3czovL2xvY2FsaG9zdDo4MDgwL3dzJyk7XG4gICAgfVxuICB9O1xufVxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUE2TSxTQUFTLG9CQUFvQjtBQUMxTyxPQUFPLFdBQVc7QUFDbEIsT0FBTyxV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
