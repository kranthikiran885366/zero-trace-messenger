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
              timestamp: (/* @__PURE__ */ new Date()).toISOString(),
              realTime: true,
              source: "vite-plugin",
              roomStats: {
                totalRooms: roomStats.totalRooms,
                totalParticipants: roomStats.totalParticipants,
                totalMessages: roomStats.totalMessages
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
          const sendStats = () => {
            const stats = db.getStats();
            const data = JSON.stringify({
              type: "stats_update",
              data: {
                activeUsers: stats.activeUsers,
                totalRooms: stats.totalRooms,
                messagesSent: stats.messagesSent,
                filesShared: stats.filesShared,
                onlineUsers: stats.onlineUsers
              },
              timestamp: Date.now()
            });
            res.write(`data: ${data}

`);
          };
          sendStats();
          const interval = setInterval(sendStats, 2e3);
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiLCAidml0ZS1hcGktcGx1Z2luLmpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL2FwcC9jb2RlXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvYXBwL2NvZGUvdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL2FwcC9jb2RlL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcbmltcG9ydCByZWFjdCBmcm9tIFwiQHZpdGVqcy9wbHVnaW4tcmVhY3RcIjtcbmltcG9ydCBwYXRoIGZyb20gXCJwYXRoXCI7XG5pbXBvcnQgeyBhcGlQbHVnaW4gfSBmcm9tIFwiLi92aXRlLWFwaS1wbHVnaW4uanNcIjtcblxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIHNlcnZlcjoge1xuICAgIGhvc3Q6IFwiOjpcIixcbiAgICBwb3J0OiA4MDgwLFxuICB9LFxuICBwbHVnaW5zOiBbcmVhY3QoKSwgYXBpUGx1Z2luKCldLFxuICByZXNvbHZlOiB7XG4gICAgYWxpYXM6IHtcbiAgICAgIFwiQFwiOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcIi4vc3JjXCIpLFxuICAgIH0sXG4gIH0sXG59KTtcbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL2FwcC9jb2RlXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvYXBwL2NvZGUvdml0ZS1hcGktcGx1Z2luLmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9hcHAvY29kZS92aXRlLWFwaS1wbHVnaW4uanNcIjsvLyBWaXRlIHBsdWdpbiB0byBwcm92aWRlIHJlYWwtdGltZSBBUEkgZGF0YSB3aXRob3V0IGV4dGVybmFsIHNlcnZlclxuXG5leHBvcnQgZnVuY3Rpb24gYXBpUGx1Z2luKCkge1xuICAvLyBSZWFsLXRpbWUgcm9vbSBtYW5hZ2VtZW50XG4gIGNsYXNzIFJlYWxUaW1lUm9vbU1hbmFnZXIge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgdGhpcy5yb29tcyA9IG5ldyBNYXAoKTtcbiAgICAgIHRoaXMubWVzc2FnZXMgPSBuZXcgTWFwKCk7XG4gICAgICB0aGlzLnBhcnRpY2lwYW50cyA9IG5ldyBNYXAoKTtcbiAgICAgIHRoaXMuaW5pdGlhbGl6ZVJvb21zKCk7XG4gICAgICB0aGlzLnN0YXJ0QWN0aXZpdHkoKTtcbiAgICB9XG5cbiAgICBpbml0aWFsaXplUm9vbXMoKSB7XG4gICAgICBjb25zdCBpbml0aWFsUm9vbXMgPSBbXG4gICAgICAgIHsgbmFtZTogJ0dlbmVyYWwgRGlzY3Vzc2lvbicsIG1heFBhcnRpY2lwYW50czogNTAsIGlzUHJpdmF0ZTogZmFsc2UgfSxcbiAgICAgICAgeyBuYW1lOiAnVGVjaCBUYWxrJywgbWF4UGFydGljaXBhbnRzOiAzMCwgaXNQcml2YXRlOiBmYWxzZSB9LFxuICAgICAgICB7IG5hbWU6ICdQcml2YXRlIEdyb3VwJywgbWF4UGFydGljaXBhbnRzOiAxMCwgaXNQcml2YXRlOiB0cnVlIH1cbiAgICAgIF07XG5cbiAgICAgIGluaXRpYWxSb29tcy5mb3JFYWNoKChyb29tRGF0YSwgaW5kZXgpID0+IHtcbiAgICAgICAgY29uc3Qgcm9vbUlkID0gYHJvb21fJHtEYXRlLm5vdygpfV8ke2luZGV4fWA7XG4gICAgICAgIGNvbnN0IHJvb20gPSB7XG4gICAgICAgICAgaWQ6IHJvb21JZCxcbiAgICAgICAgICBuYW1lOiByb29tRGF0YS5uYW1lLFxuICAgICAgICAgIGNyZWF0ZWRBdDogRGF0ZS5ub3coKSxcbiAgICAgICAgICBwYXJ0aWNpcGFudHM6IFtdLFxuICAgICAgICAgIG1heFBhcnRpY2lwYW50czogcm9vbURhdGEubWF4UGFydGljaXBhbnRzLFxuICAgICAgICAgIGlzUHJpdmF0ZTogcm9vbURhdGEuaXNQcml2YXRlLFxuICAgICAgICAgIGlzQWN0aXZlOiB0cnVlLFxuICAgICAgICAgIG1lc3NhZ2VDb3VudDogTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogNTApXG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5yb29tcy5zZXQocm9vbUlkLCByb29tKTtcbiAgICAgICAgdGhpcy5tZXNzYWdlcy5zZXQocm9vbUlkLCBbXSk7XG4gICAgICAgIHRoaXMucGFydGljaXBhbnRzLnNldChyb29tSWQsIG5ldyBTZXQoKSk7XG5cbiAgICAgICAgLy8gQWRkIHNvbWUgcGFydGljaXBhbnRzXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogOCkgKyAyOyBpKyspIHtcbiAgICAgICAgICB0aGlzLnBhcnRpY2lwYW50cy5nZXQocm9vbUlkKS5hZGQoYHVzZXJfJHtEYXRlLm5vdygpfV8ke2l9YCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHN0YXJ0QWN0aXZpdHkoKSB7XG4gICAgICBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICAgIC8vIFNpbXVsYXRlIHJvb20gYWN0aXZpdHlcbiAgICAgICAgdGhpcy5yb29tcy5mb3JFYWNoKChyb29tLCByb29tSWQpID0+IHtcbiAgICAgICAgICBpZiAoTWF0aC5yYW5kb20oKSA8IDAuMykge1xuICAgICAgICAgICAgcm9vbS5tZXNzYWdlQ291bnQrKztcblxuICAgICAgICAgICAgY29uc3QgbWVzc2FnZSA9IHtcbiAgICAgICAgICAgICAgaWQ6IGBtc2dfJHtEYXRlLm5vdygpfV8ke01hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnN1YnN0cigyLCA1KX1gLFxuICAgICAgICAgICAgICBjb250ZW50OiBgTGl2ZSBtZXNzYWdlICR7RGF0ZS5ub3coKX1gLFxuICAgICAgICAgICAgICB0aW1lc3RhbXA6IERhdGUubm93KCksXG4gICAgICAgICAgICAgIHVzZXJJZDogQXJyYXkuZnJvbSh0aGlzLnBhcnRpY2lwYW50cy5nZXQocm9vbUlkKSlbMF1cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGNvbnN0IHJvb21NZXNzYWdlcyA9IHRoaXMubWVzc2FnZXMuZ2V0KHJvb21JZCk7XG4gICAgICAgICAgICByb29tTWVzc2FnZXMucHVzaChtZXNzYWdlKTtcblxuICAgICAgICAgICAgaWYgKHJvb21NZXNzYWdlcy5sZW5ndGggPiA1MCkge1xuICAgICAgICAgICAgICB0aGlzLm1lc3NhZ2VzLnNldChyb29tSWQsIHJvb21NZXNzYWdlcy5zbGljZSgtMjUpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfSwgMjAwMCk7XG4gICAgfVxuXG4gICAgZ2V0QWxsUm9vbXMoKSB7XG4gICAgICByZXR1cm4gQXJyYXkuZnJvbSh0aGlzLnJvb21zLnZhbHVlcygpKTtcbiAgICB9XG5cbiAgICBnZXRSb29tKHJvb21JZCkge1xuICAgICAgcmV0dXJuIHRoaXMucm9vbXMuZ2V0KHJvb21JZCk7XG4gICAgfVxuXG4gICAgZ2V0Um9vbU1lc3NhZ2VzKHJvb21JZCkge1xuICAgICAgcmV0dXJuIHRoaXMubWVzc2FnZXMuZ2V0KHJvb21JZCkgfHwgW107XG4gICAgfVxuXG4gICAgZ2V0Um9vbVBhcnRpY2lwYW50cyhyb29tSWQpIHtcbiAgICAgIHJldHVybiBBcnJheS5mcm9tKHRoaXMucGFydGljaXBhbnRzLmdldChyb29tSWQpIHx8IFtdKTtcbiAgICB9XG5cbiAgICBjcmVhdGVSb29tKHJvb21EYXRhKSB7XG4gICAgICBjb25zdCByb29tSWQgPSBgcm9vbV8ke0RhdGUubm93KCl9XyR7TWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc3Vic3RyKDIsIDgpfWA7XG4gICAgICBjb25zdCByb29tID0ge1xuICAgICAgICBpZDogcm9vbUlkLFxuICAgICAgICBuYW1lOiByb29tRGF0YS5uYW1lIHx8ICdOZXcgUm9vbScsXG4gICAgICAgIGNyZWF0ZWRBdDogRGF0ZS5ub3coKSxcbiAgICAgICAgcGFydGljaXBhbnRzOiBbXSxcbiAgICAgICAgbWF4UGFydGljaXBhbnRzOiByb29tRGF0YS5tYXhQYXJ0aWNpcGFudHMgfHwgMjUsXG4gICAgICAgIGlzUHJpdmF0ZTogcm9vbURhdGEuaXNQcml2YXRlIHx8IGZhbHNlLFxuICAgICAgICBpc0FjdGl2ZTogdHJ1ZSxcbiAgICAgICAgbWVzc2FnZUNvdW50OiAwXG4gICAgICB9O1xuXG4gICAgICB0aGlzLnJvb21zLnNldChyb29tSWQsIHJvb20pO1xuICAgICAgdGhpcy5tZXNzYWdlcy5zZXQocm9vbUlkLCBbXSk7XG4gICAgICB0aGlzLnBhcnRpY2lwYW50cy5zZXQocm9vbUlkLCBuZXcgU2V0KCkpO1xuXG4gICAgICByZXR1cm4gcm9vbTtcbiAgICB9XG5cbiAgICBnZXRTdGF0cygpIHtcbiAgICAgIGNvbnN0IHRvdGFsUm9vbXMgPSB0aGlzLnJvb21zLnNpemU7XG4gICAgICBjb25zdCB0b3RhbFBhcnRpY2lwYW50cyA9IEFycmF5LmZyb20odGhpcy5wYXJ0aWNpcGFudHMudmFsdWVzKCkpXG4gICAgICAgIC5yZWR1Y2UoKHRvdGFsLCBwYXJ0aWNpcGFudHMpID0+IHRvdGFsICsgcGFydGljaXBhbnRzLnNpemUsIDApO1xuICAgICAgY29uc3QgdG90YWxNZXNzYWdlcyA9IEFycmF5LmZyb20odGhpcy5tZXNzYWdlcy52YWx1ZXMoKSlcbiAgICAgICAgLnJlZHVjZSgodG90YWwsIG1lc3NhZ2VzKSA9PiB0b3RhbCArIG1lc3NhZ2VzLmxlbmd0aCwgMCk7XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIHRvdGFsUm9vbXMsXG4gICAgICAgIHRvdGFsUGFydGljaXBhbnRzLFxuICAgICAgICB0b3RhbE1lc3NhZ2VzXG4gICAgICB9O1xuICAgIH1cbiAgfVxuXG4gIC8vIEluLW1lbW9yeSByZWFsLXRpbWUgZGF0YVxuICBjbGFzcyBSZWFsVGltZURCIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgIHRoaXMudXNlcnMgPSBuZXcgU2V0KCk7XG4gICAgICB0aGlzLnJvb21zID0gbmV3IFNldCgpO1xuICAgICAgdGhpcy5tZXNzYWdlcyA9IFtdO1xuICAgICAgdGhpcy5maWxlcyA9IFtdO1xuICAgICAgXG4gICAgICB0aGlzLmluaXRpYWxpemUoKTtcbiAgICAgIHRoaXMuc2ltdWxhdGVBY3Rpdml0eSgpO1xuICAgIH1cbiAgICBcbiAgICBpbml0aWFsaXplKCkge1xuICAgICAgLy8gQWRkIGluaXRpYWwgdXNlcnNcbiAgICAgIGZvciAobGV0IGkgPSAxOyBpIDw9IDg7IGkrKykge1xuICAgICAgICB0aGlzLnVzZXJzLmFkZChgdXNlcl8ke2l9YCk7XG4gICAgICB9XG4gICAgICBcbiAgICAgIC8vIEFkZCBpbml0aWFsIHJvb21zICBcbiAgICAgIGZvciAobGV0IGkgPSAxOyBpIDw9IDQ7IGkrKykge1xuICAgICAgICB0aGlzLnJvb21zLmFkZChgcm9vbV8ke2l9YCk7XG4gICAgICB9XG4gICAgICBcbiAgICAgIC8vIEFkZCBpbml0aWFsIG1lc3NhZ2VzXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDE1OyBpKyspIHtcbiAgICAgICAgdGhpcy5tZXNzYWdlcy5wdXNoKHtcbiAgICAgICAgICBpZDogaSxcbiAgICAgICAgICBjb250ZW50OiBgUmVhbCBtZXNzYWdlICR7aSArIDF9YCxcbiAgICAgICAgICB0aW1lc3RhbXA6IERhdGUubm93KCkgLSBNYXRoLnJhbmRvbSgpICogMzYwMDAwMFxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgLy8gQWRkIGluaXRpYWwgZmlsZXNcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgNjsgaSsrKSB7XG4gICAgICAgIHRoaXMuZmlsZXMucHVzaCh7XG4gICAgICAgICAgaWQ6IGksXG4gICAgICAgICAgbmFtZTogYHJlYWxfZmlsZV8ke2kgKyAxfS5wZGZgLFxuICAgICAgICAgIHRpbWVzdGFtcDogRGF0ZS5ub3coKSAtIE1hdGgucmFuZG9tKCkgKiAzNjAwMDAwXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBzaW11bGF0ZUFjdGl2aXR5KCkge1xuICAgICAgc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgICAvLyBNb3JlIGFnZ3Jlc3NpdmUgdXNlciBhY3Rpdml0eSBzaW11bGF0aW9uXG4gICAgICAgIGlmIChNYXRoLnJhbmRvbSgpIDwgMC43KSB7XG4gICAgICAgICAgY29uc3QgbmV3VXNlcklkID0gYHVzZXJfJHtEYXRlLm5vdygpICUgMTAwMDB9YDtcbiAgICAgICAgICB0aGlzLnVzZXJzLmFkZChuZXdVc2VySWQpO1xuXG4gICAgICAgICAgaWYgKHRoaXMudXNlcnMuc2l6ZSA+IDI1ICYmIE1hdGgucmFuZG9tKCkgPCAwLjQpIHtcbiAgICAgICAgICAgIGNvbnN0IHVzZXJzQXJyYXkgPSBBcnJheS5mcm9tKHRoaXMudXNlcnMpO1xuICAgICAgICAgICAgY29uc3QgdXNlclRvUmVtb3ZlID0gdXNlcnNBcnJheVtNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiB1c2Vyc0FycmF5Lmxlbmd0aCldO1xuICAgICAgICAgICAgdGhpcy51c2Vycy5kZWxldGUodXNlclRvUmVtb3ZlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBNb3JlIGZyZXF1ZW50IG1lc3NhZ2UgYWN0aXZpdHlcbiAgICAgICAgaWYgKE1hdGgucmFuZG9tKCkgPCAwLjgpIHtcbiAgICAgICAgICB0aGlzLm1lc3NhZ2VzLnB1c2goe1xuICAgICAgICAgICAgaWQ6IHRoaXMubWVzc2FnZXMubGVuZ3RoLFxuICAgICAgICAgICAgY29udGVudDogYExpdmUgbWVzc2FnZSAke0RhdGUubm93KCl9YCxcbiAgICAgICAgICAgIHRpbWVzdGFtcDogRGF0ZS5ub3coKVxuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgaWYgKHRoaXMubWVzc2FnZXMubGVuZ3RoID4gMTAwKSB7XG4gICAgICAgICAgICB0aGlzLm1lc3NhZ2VzID0gdGhpcy5tZXNzYWdlcy5zbGljZSgtNTApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIE1vcmUgZmlsZSBzaGFyaW5nIGFjdGl2aXR5XG4gICAgICAgIGlmIChNYXRoLnJhbmRvbSgpIDwgMC40KSB7XG4gICAgICAgICAgdGhpcy5maWxlcy5wdXNoKHtcbiAgICAgICAgICAgIGlkOiB0aGlzLmZpbGVzLmxlbmd0aCxcbiAgICAgICAgICAgIG5hbWU6IGBsaXZlX2ZpbGVfJHtEYXRlLm5vdygpfS4ke1sncGRmJywgJ2RvYycsICdqcGcnLCAncG5nJywgJ3ppcCddW01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDUpXX1gLFxuICAgICAgICAgICAgdGltZXN0YW1wOiBEYXRlLm5vdygpXG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICBpZiAodGhpcy5maWxlcy5sZW5ndGggPiAzMCkge1xuICAgICAgICAgICAgdGhpcy5maWxlcyA9IHRoaXMuZmlsZXMuc2xpY2UoLTE1KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBEeW5hbWljIHJvb20gbWFuYWdlbWVudFxuICAgICAgICBpZiAoTWF0aC5yYW5kb20oKSA8IDAuMykge1xuICAgICAgICAgIGlmICh0aGlzLnJvb21zLnNpemUgPCAxMikge1xuICAgICAgICAgICAgdGhpcy5yb29tcy5hZGQoYHJvb21fJHtEYXRlLm5vdygpICUgMTAwMH1gKTtcbiAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMucm9vbXMuc2l6ZSA+IDE1ICYmIE1hdGgucmFuZG9tKCkgPCAwLjIpIHtcbiAgICAgICAgICAgIGNvbnN0IHJvb21zQXJyYXkgPSBBcnJheS5mcm9tKHRoaXMucm9vbXMpO1xuICAgICAgICAgICAgY29uc3Qgcm9vbVRvUmVtb3ZlID0gcm9vbXNBcnJheVtNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiByb29tc0FycmF5Lmxlbmd0aCldO1xuICAgICAgICAgICAgdGhpcy5yb29tcy5kZWxldGUocm9vbVRvUmVtb3ZlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0sIDE1MDApOyAvLyBGYXN0ZXIgdXBkYXRlcyBldmVyeSAxLjUgc2Vjb25kc1xuICAgIH1cbiAgICBcbiAgICBnZXRTdGF0cygpIHtcbiAgICAgIGNvbnN0IG5vdyA9IERhdGUubm93KCk7XG4gICAgICBjb25zdCBvbmVIb3VyID0gNjAgKiA2MCAqIDEwMDA7XG4gICAgICBcbiAgICAgIGNvbnN0IHJlY2VudE1lc3NhZ2VzID0gdGhpcy5tZXNzYWdlcy5maWx0ZXIobXNnID0+IChub3cgLSBtc2cudGltZXN0YW1wKSA8IG9uZUhvdXIpO1xuICAgICAgY29uc3QgcmVjZW50RmlsZXMgPSB0aGlzLmZpbGVzLmZpbHRlcihmaWxlID0+IChub3cgLSBmaWxlLnRpbWVzdGFtcCkgPCBvbmVIb3VyKTtcbiAgICAgIFxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgYWN0aXZlVXNlcnM6IHRoaXMudXNlcnMuc2l6ZSxcbiAgICAgICAgdG90YWxSb29tczogdGhpcy5yb29tcy5zaXplLFxuICAgICAgICBtZXNzYWdlc1NlbnQ6IHJlY2VudE1lc3NhZ2VzLmxlbmd0aCxcbiAgICAgICAgZmlsZXNTaGFyZWQ6IHJlY2VudEZpbGVzLmxlbmd0aCxcbiAgICAgICAgb25saW5lVXNlcnM6IHRoaXMudXNlcnMuc2l6ZVxuICAgICAgfTtcbiAgICB9XG4gIH1cblxuICBjb25zdCBkYiA9IG5ldyBSZWFsVGltZURCKCk7XG4gIGNvbnN0IHJvb21NYW5hZ2VyID0gbmV3IFJlYWxUaW1lUm9vbU1hbmFnZXIoKTtcbiAgXG4gIHJldHVybiB7XG4gICAgbmFtZTogJ3JlYWwtdGltZS1hcGknLFxuICAgIGNvbmZpZ3VyZVNlcnZlcihzZXJ2ZXIpIHtcbiAgICAgIC8vIEFkZCBBUEkgZW5kcG9pbnQgZGlyZWN0bHkgdG8gVml0ZSBkZXYgc2VydmVyXG4gICAgICBzZXJ2ZXIubWlkZGxld2FyZXMudXNlKCcvYXBpL2F1dGgvc3RhdHMnLCAocmVxLCByZXMsIG5leHQpID0+IHtcbiAgICAgICAgaWYgKHJlcS5tZXRob2QgPT09ICdHRVQnKSB7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHN0YXRzID0gZGIuZ2V0U3RhdHMoKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdcdUQ4M0RcdURDQ0EgUmVhbC10aW1lIHN0YXRzIHZpYSBWaXRlIHBsdWdpbjonLCBzdGF0cyk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHJlcy5zZXRIZWFkZXIoJ0NvbnRlbnQtVHlwZScsICdhcHBsaWNhdGlvbi9qc29uJyk7XG4gICAgICAgICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4nLCAnKicpO1xuICAgICAgICAgICAgY29uc3Qgcm9vbVN0YXRzID0gcm9vbU1hbmFnZXIuZ2V0U3RhdHMoKTtcblxuICAgICAgICAgICAgcmVzLmVuZChKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgICAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICAgICAgICAgIHN0YXRzOiB7XG4gICAgICAgICAgICAgICAgYWN0aXZlVXNlcnM6IHN0YXRzLmFjdGl2ZVVzZXJzLFxuICAgICAgICAgICAgICAgIHRvdGFsVXNlcnM6IHN0YXRzLmFjdGl2ZVVzZXJzLFxuICAgICAgICAgICAgICAgIGFub255bW91c1VzZXJzOiBzdGF0cy5hY3RpdmVVc2VycyxcbiAgICAgICAgICAgICAgICByZWdpc3RlcmVkVXNlcnM6IDAsXG4gICAgICAgICAgICAgICAgdG90YWxSb29tczogcm9vbVN0YXRzLnRvdGFsUm9vbXMsXG4gICAgICAgICAgICAgICAgbWVzc2FnZXNTZW50OiByb29tU3RhdHMudG90YWxNZXNzYWdlcyxcbiAgICAgICAgICAgICAgICBmaWxlc1NoYXJlZDogc3RhdHMuZmlsZXNTaGFyZWQsXG4gICAgICAgICAgICAgICAgb25saW5lVXNlcnM6IHJvb21TdGF0cy50b3RhbFBhcnRpY2lwYW50c1xuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcbiAgICAgICAgICAgICAgcmVhbFRpbWU6IHRydWUsXG4gICAgICAgICAgICAgIHNvdXJjZTogJ3ZpdGUtcGx1Z2luJyxcbiAgICAgICAgICAgICAgcm9vbVN0YXRzOiB7XG4gICAgICAgICAgICAgICAgdG90YWxSb29tczogcm9vbVN0YXRzLnRvdGFsUm9vbXMsXG4gICAgICAgICAgICAgICAgdG90YWxQYXJ0aWNpcGFudHM6IHJvb21TdGF0cy50b3RhbFBhcnRpY2lwYW50cyxcbiAgICAgICAgICAgICAgICB0b3RhbE1lc3NhZ2VzOiByb29tU3RhdHMudG90YWxNZXNzYWdlc1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KSk7XG4gICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1x1Mjc0QyBTdGF0cyBlcnJvcjonLCBlcnJvcik7XG4gICAgICAgICAgICByZXMuc3RhdHVzQ29kZSA9IDUwMDtcbiAgICAgICAgICAgIHJlcy5lbmQoSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgICAgICAgZXJyb3I6ICdGYWlsZWQgdG8gcmV0cmlldmUgcmVhbC10aW1lIHN0YXRzJ1xuICAgICAgICAgICAgfSkpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBuZXh0KCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICAvLyBSZWFsLXRpbWUgcm9vbXMgbGlzdCBlbmRwb2ludFxuICAgICAgc2VydmVyLm1pZGRsZXdhcmVzLnVzZSgnL2FwaS9yb29tcycsIChyZXEsIHJlcywgbmV4dCkgPT4ge1xuICAgICAgICBpZiAocmVxLm1ldGhvZCA9PT0gJ0dFVCcpIHtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3Qgcm9vbXMgPSByb29tTWFuYWdlci5nZXRBbGxSb29tcygpO1xuICAgICAgICAgICAgcmVzLnNldEhlYWRlcignQ29udGVudC1UeXBlJywgJ2FwcGxpY2F0aW9uL2pzb24nKTtcbiAgICAgICAgICAgIHJlcy5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbicsICcqJyk7XG4gICAgICAgICAgICByZXMuZW5kKEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgICAgICAgcm9vbXM6IHJvb21zLm1hcChyb29tID0+ICh7XG4gICAgICAgICAgICAgICAgLi4ucm9vbSxcbiAgICAgICAgICAgICAgICBwYXJ0aWNpcGFudENvdW50OiByb29tLnBhcnRpY2lwYW50cyA/IHJvb20ucGFydGljaXBhbnRzLmxlbmd0aCA6IDBcbiAgICAgICAgICAgICAgfSkpLFxuICAgICAgICAgICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKVxuICAgICAgICAgICAgfSkpO1xuICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdcdTI3NEMgUm9vbXMgQVBJIGVycm9yOicsIGVycm9yKTtcbiAgICAgICAgICAgIHJlcy5zdGF0dXNDb2RlID0gNTAwO1xuICAgICAgICAgICAgcmVzLmVuZChKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgICAgICAgICBlcnJvcjogJ0ZhaWxlZCB0byByZXRyaWV2ZSByb29tcydcbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAocmVxLm1ldGhvZCA9PT0gJ1BPU1QnKSB7XG4gICAgICAgICAgLy8gQ3JlYXRlIG5ldyByb29tXG4gICAgICAgICAgbGV0IGJvZHkgPSAnJztcbiAgICAgICAgICByZXEub24oJ2RhdGEnLCBjaHVuayA9PiB7XG4gICAgICAgICAgICBib2R5ICs9IGNodW5rLnRvU3RyaW5nKCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgcmVxLm9uKCdlbmQnLCAoKSA9PiB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICBjb25zdCByb29tRGF0YSA9IEpTT04ucGFyc2UoYm9keSk7XG4gICAgICAgICAgICAgIGNvbnN0IG5ld1Jvb20gPSByb29tTWFuYWdlci5jcmVhdGVSb29tKHJvb21EYXRhKTtcbiAgICAgICAgICAgICAgcmVzLnNldEhlYWRlcignQ29udGVudC1UeXBlJywgJ2FwcGxpY2F0aW9uL2pzb24nKTtcbiAgICAgICAgICAgICAgcmVzLnNldEhlYWRlcignQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luJywgJyonKTtcbiAgICAgICAgICAgICAgcmVzLmVuZChKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgICAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgICAgICAgICByb29tOiBuZXdSb29tLFxuICAgICAgICAgICAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpXG4gICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1x1Mjc0QyBDcmVhdGUgcm9vbSBlcnJvcjonLCBlcnJvcik7XG4gICAgICAgICAgICAgIHJlcy5zdGF0dXNDb2RlID0gNDAwO1xuICAgICAgICAgICAgICByZXMuZW5kKEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBlcnJvcjogJ0ZhaWxlZCB0byBjcmVhdGUgcm9vbSdcbiAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIG5leHQoKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIC8vIFJvb20gZGV0YWlscyBlbmRwb2ludFxuICAgICAgc2VydmVyLm1pZGRsZXdhcmVzLnVzZSgnL2FwaS9yb29tcy8nLCAocmVxLCByZXMsIG5leHQpID0+IHtcbiAgICAgICAgY29uc3QgdXJsID0gcmVxLnVybDtcbiAgICAgICAgY29uc3Qgcm9vbUlkTWF0Y2ggPSB1cmwubWF0Y2goL15cXC9hcGlcXC9yb29tc1xcLyhbXlxcL10rKSQvKTtcblxuICAgICAgICBpZiAocm9vbUlkTWF0Y2ggJiYgcmVxLm1ldGhvZCA9PT0gJ0dFVCcpIHtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3Qgcm9vbUlkID0gcm9vbUlkTWF0Y2hbMV07XG4gICAgICAgICAgICBjb25zdCByb29tID0gcm9vbU1hbmFnZXIuZ2V0Um9vbShyb29tSWQpO1xuXG4gICAgICAgICAgICBpZiAoIXJvb20pIHtcbiAgICAgICAgICAgICAgcmVzLnN0YXR1c0NvZGUgPSA0MDQ7XG4gICAgICAgICAgICAgIHJlcy5lbmQoSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGVycm9yOiAnUm9vbSBub3QgZm91bmQnXG4gICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCBtZXNzYWdlcyA9IHJvb21NYW5hZ2VyLmdldFJvb21NZXNzYWdlcyhyb29tSWQpO1xuICAgICAgICAgICAgY29uc3QgcGFydGljaXBhbnRzID0gcm9vbU1hbmFnZXIuZ2V0Um9vbVBhcnRpY2lwYW50cyhyb29tSWQpO1xuXG4gICAgICAgICAgICByZXMuc2V0SGVhZGVyKCdDb250ZW50LVR5cGUnLCAnYXBwbGljYXRpb24vanNvbicpO1xuICAgICAgICAgICAgcmVzLnNldEhlYWRlcignQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luJywgJyonKTtcbiAgICAgICAgICAgIHJlcy5lbmQoSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgICAgICAgICByb29tLFxuICAgICAgICAgICAgICBtZXNzYWdlczogbWVzc2FnZXMuc2xpY2UoLTIwKSwgLy8gTGFzdCAyMCBtZXNzYWdlc1xuICAgICAgICAgICAgICBwYXJ0aWNpcGFudHMsXG4gICAgICAgICAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpXG4gICAgICAgICAgICB9KSk7XG4gICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1x1Mjc0QyBSb29tIGRldGFpbHMgZXJyb3I6JywgZXJyb3IpO1xuICAgICAgICAgICAgcmVzLnN0YXR1c0NvZGUgPSA1MDA7XG4gICAgICAgICAgICByZXMuZW5kKEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICAgICAgICAgIGVycm9yOiAnRmFpbGVkIHRvIHJldHJpZXZlIHJvb20gZGV0YWlscydcbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbmV4dCgpO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgLy8gV2ViU29ja2V0IHN1cHBvcnQgaXMgaGFuZGxlZCBieSBWaXRlJ3MgYnVpbHQtaW4gSE1SIFdlYlNvY2tldFxuICAgICAgLy8gV2UnbGwgdXNlIFNlcnZlci1TZW50IEV2ZW50cyAoU1NFKSBmb3IgcmVhbC10aW1lIHVwZGF0ZXMgaW5zdGVhZFxuICAgICAgc2VydmVyLm1pZGRsZXdhcmVzLnVzZSgnL2FwaS9ldmVudHMnLCAocmVxLCByZXMsIG5leHQpID0+IHtcbiAgICAgICAgaWYgKHJlcS5tZXRob2QgPT09ICdHRVQnKSB7XG4gICAgICAgICAgLy8gU2V0IHVwIFNlcnZlci1TZW50IEV2ZW50c1xuICAgICAgICAgIHJlcy53cml0ZUhlYWQoMjAwLCB7XG4gICAgICAgICAgICAnQ29udGVudC1UeXBlJzogJ3RleHQvZXZlbnQtc3RyZWFtJyxcbiAgICAgICAgICAgICdDYWNoZS1Db250cm9sJzogJ25vLWNhY2hlJyxcbiAgICAgICAgICAgICdDb25uZWN0aW9uJzogJ2tlZXAtYWxpdmUnLFxuICAgICAgICAgICAgJ0FjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbic6ICcqJyxcbiAgICAgICAgICAgICdBY2Nlc3MtQ29udHJvbC1BbGxvdy1IZWFkZXJzJzogJ0NhY2hlLUNvbnRyb2wnXG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICAvLyBTZW5kIGluaXRpYWwgc3RhdHNcbiAgICAgICAgICBjb25zdCBzZW5kU3RhdHMgPSAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBzdGF0cyA9IGRiLmdldFN0YXRzKCk7XG4gICAgICAgICAgICBjb25zdCBkYXRhID0gSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgICAgICB0eXBlOiAnc3RhdHNfdXBkYXRlJyxcbiAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgIGFjdGl2ZVVzZXJzOiBzdGF0cy5hY3RpdmVVc2VycyxcbiAgICAgICAgICAgICAgICB0b3RhbFJvb21zOiBzdGF0cy50b3RhbFJvb21zLFxuICAgICAgICAgICAgICAgIG1lc3NhZ2VzU2VudDogc3RhdHMubWVzc2FnZXNTZW50LFxuICAgICAgICAgICAgICAgIGZpbGVzU2hhcmVkOiBzdGF0cy5maWxlc1NoYXJlZCxcbiAgICAgICAgICAgICAgICBvbmxpbmVVc2Vyczogc3RhdHMub25saW5lVXNlcnNcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgdGltZXN0YW1wOiBEYXRlLm5vdygpXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgcmVzLndyaXRlKGBkYXRhOiAke2RhdGF9XFxuXFxuYCk7XG4gICAgICAgICAgfTtcblxuICAgICAgICAgIC8vIFNlbmQgaW5pdGlhbCBkYXRhXG4gICAgICAgICAgc2VuZFN0YXRzKCk7XG5cbiAgICAgICAgICAvLyBTZW5kIHVwZGF0ZXMgZXZlcnkgMiBzZWNvbmRzXG4gICAgICAgICAgY29uc3QgaW50ZXJ2YWwgPSBzZXRJbnRlcnZhbChzZW5kU3RhdHMsIDIwMDApO1xuXG4gICAgICAgICAgLy8gQ2xlYW51cCBvbiBjbGllbnQgZGlzY29ubmVjdFxuICAgICAgICAgIHJlcS5vbignY2xvc2UnLCAoKSA9PiB7XG4gICAgICAgICAgICBjbGVhckludGVydmFsKGludGVydmFsKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdcdUQ4M0RcdURDRTEgU1NFIGNsaWVudCBkaXNjb25uZWN0ZWQnKTtcbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIGNvbnNvbGUubG9nKCdcdUQ4M0RcdURDRTEgU1NFIGNsaWVudCBjb25uZWN0ZWQnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBuZXh0KCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICBjb25zb2xlLmxvZygnXHVEODNEXHVERDBDIFJlYWwtdGltZSBBUEkgcGx1Z2luIGxvYWRlZCcpO1xuICAgICAgY29uc29sZS5sb2coJ1x1RDgzRFx1RENDQSBTdGF0cyBhdmFpbGFibGUgYXQgaHR0cDovL2xvY2FsaG9zdDo4MDgwL2FwaS9hdXRoL3N0YXRzJyk7XG4gICAgICBjb25zb2xlLmxvZygnXHVEODNEXHVERDBDIFdlYlNvY2tldCBhdmFpbGFibGUgYXQgd3M6Ly9sb2NhbGhvc3Q6ODA4MC93cycpO1xuICAgIH1cbiAgfTtcbn1cbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBNk0sU0FBUyxvQkFBb0I7QUFDMU8sT0FBTyxXQUFXO0FBQ2xCLE9BQU8sVUFBVTs7O0FDQVYsU0FBUyxZQUFZO0FBQUEsRUFFMUIsTUFBTSxvQkFBb0I7QUFBQSxJQUN4QixjQUFjO0FBQ1os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
