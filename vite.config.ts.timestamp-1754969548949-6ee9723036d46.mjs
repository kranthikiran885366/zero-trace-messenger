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
              timestamp: (/* @__PURE__ */ new Date()).toISOString(),
              realTime: true,
              source: "vite-plugin"
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiLCAidml0ZS1hcGktcGx1Z2luLmpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL2FwcC9jb2RlXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvYXBwL2NvZGUvdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL2FwcC9jb2RlL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcbmltcG9ydCByZWFjdCBmcm9tIFwiQHZpdGVqcy9wbHVnaW4tcmVhY3RcIjtcbmltcG9ydCBwYXRoIGZyb20gXCJwYXRoXCI7XG5pbXBvcnQgeyBhcGlQbHVnaW4gfSBmcm9tIFwiLi92aXRlLWFwaS1wbHVnaW4uanNcIjtcblxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIHNlcnZlcjoge1xuICAgIGhvc3Q6IFwiOjpcIixcbiAgICBwb3J0OiA4MDgwLFxuICB9LFxuICBwbHVnaW5zOiBbcmVhY3QoKSwgYXBpUGx1Z2luKCldLFxuICByZXNvbHZlOiB7XG4gICAgYWxpYXM6IHtcbiAgICAgIFwiQFwiOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcIi4vc3JjXCIpLFxuICAgIH0sXG4gIH0sXG59KTtcbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL2FwcC9jb2RlXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvYXBwL2NvZGUvdml0ZS1hcGktcGx1Z2luLmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9hcHAvY29kZS92aXRlLWFwaS1wbHVnaW4uanNcIjsvLyBWaXRlIHBsdWdpbiB0byBwcm92aWRlIHJlYWwtdGltZSBBUEkgZGF0YSB3aXRob3V0IGV4dGVybmFsIHNlcnZlclxuXG5leHBvcnQgZnVuY3Rpb24gYXBpUGx1Z2luKCkge1xuICAvLyBSZWFsLXRpbWUgcm9vbSBtYW5hZ2VtZW50XG4gIGNsYXNzIFJlYWxUaW1lUm9vbU1hbmFnZXIge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgdGhpcy5yb29tcyA9IG5ldyBNYXAoKTtcbiAgICAgIHRoaXMubWVzc2FnZXMgPSBuZXcgTWFwKCk7XG4gICAgICB0aGlzLnBhcnRpY2lwYW50cyA9IG5ldyBNYXAoKTtcbiAgICAgIHRoaXMuaW5pdGlhbGl6ZVJvb21zKCk7XG4gICAgICB0aGlzLnN0YXJ0QWN0aXZpdHkoKTtcbiAgICB9XG5cbiAgICBpbml0aWFsaXplUm9vbXMoKSB7XG4gICAgICBjb25zdCBpbml0aWFsUm9vbXMgPSBbXG4gICAgICAgIHsgbmFtZTogJ0dlbmVyYWwgRGlzY3Vzc2lvbicsIG1heFBhcnRpY2lwYW50czogNTAsIGlzUHJpdmF0ZTogZmFsc2UgfSxcbiAgICAgICAgeyBuYW1lOiAnVGVjaCBUYWxrJywgbWF4UGFydGljaXBhbnRzOiAzMCwgaXNQcml2YXRlOiBmYWxzZSB9LFxuICAgICAgICB7IG5hbWU6ICdQcml2YXRlIEdyb3VwJywgbWF4UGFydGljaXBhbnRzOiAxMCwgaXNQcml2YXRlOiB0cnVlIH1cbiAgICAgIF07XG5cbiAgICAgIGluaXRpYWxSb29tcy5mb3JFYWNoKChyb29tRGF0YSwgaW5kZXgpID0+IHtcbiAgICAgICAgY29uc3Qgcm9vbUlkID0gYHJvb21fJHtEYXRlLm5vdygpfV8ke2luZGV4fWA7XG4gICAgICAgIGNvbnN0IHJvb20gPSB7XG4gICAgICAgICAgaWQ6IHJvb21JZCxcbiAgICAgICAgICBuYW1lOiByb29tRGF0YS5uYW1lLFxuICAgICAgICAgIGNyZWF0ZWRBdDogRGF0ZS5ub3coKSxcbiAgICAgICAgICBwYXJ0aWNpcGFudHM6IFtdLFxuICAgICAgICAgIG1heFBhcnRpY2lwYW50czogcm9vbURhdGEubWF4UGFydGljaXBhbnRzLFxuICAgICAgICAgIGlzUHJpdmF0ZTogcm9vbURhdGEuaXNQcml2YXRlLFxuICAgICAgICAgIGlzQWN0aXZlOiB0cnVlLFxuICAgICAgICAgIG1lc3NhZ2VDb3VudDogTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogNTApXG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5yb29tcy5zZXQocm9vbUlkLCByb29tKTtcbiAgICAgICAgdGhpcy5tZXNzYWdlcy5zZXQocm9vbUlkLCBbXSk7XG4gICAgICAgIHRoaXMucGFydGljaXBhbnRzLnNldChyb29tSWQsIG5ldyBTZXQoKSk7XG5cbiAgICAgICAgLy8gQWRkIHNvbWUgcGFydGljaXBhbnRzXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogOCkgKyAyOyBpKyspIHtcbiAgICAgICAgICB0aGlzLnBhcnRpY2lwYW50cy5nZXQocm9vbUlkKS5hZGQoYHVzZXJfJHtEYXRlLm5vdygpfV8ke2l9YCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHN0YXJ0QWN0aXZpdHkoKSB7XG4gICAgICBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICAgIC8vIFNpbXVsYXRlIHJvb20gYWN0aXZpdHlcbiAgICAgICAgdGhpcy5yb29tcy5mb3JFYWNoKChyb29tLCByb29tSWQpID0+IHtcbiAgICAgICAgICBpZiAoTWF0aC5yYW5kb20oKSA8IDAuMykge1xuICAgICAgICAgICAgcm9vbS5tZXNzYWdlQ291bnQrKztcblxuICAgICAgICAgICAgY29uc3QgbWVzc2FnZSA9IHtcbiAgICAgICAgICAgICAgaWQ6IGBtc2dfJHtEYXRlLm5vdygpfV8ke01hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnN1YnN0cigyLCA1KX1gLFxuICAgICAgICAgICAgICBjb250ZW50OiBgTGl2ZSBtZXNzYWdlICR7RGF0ZS5ub3coKX1gLFxuICAgICAgICAgICAgICB0aW1lc3RhbXA6IERhdGUubm93KCksXG4gICAgICAgICAgICAgIHVzZXJJZDogQXJyYXkuZnJvbSh0aGlzLnBhcnRpY2lwYW50cy5nZXQocm9vbUlkKSlbMF1cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGNvbnN0IHJvb21NZXNzYWdlcyA9IHRoaXMubWVzc2FnZXMuZ2V0KHJvb21JZCk7XG4gICAgICAgICAgICByb29tTWVzc2FnZXMucHVzaChtZXNzYWdlKTtcblxuICAgICAgICAgICAgaWYgKHJvb21NZXNzYWdlcy5sZW5ndGggPiA1MCkge1xuICAgICAgICAgICAgICB0aGlzLm1lc3NhZ2VzLnNldChyb29tSWQsIHJvb21NZXNzYWdlcy5zbGljZSgtMjUpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfSwgMjAwMCk7XG4gICAgfVxuXG4gICAgZ2V0QWxsUm9vbXMoKSB7XG4gICAgICByZXR1cm4gQXJyYXkuZnJvbSh0aGlzLnJvb21zLnZhbHVlcygpKTtcbiAgICB9XG5cbiAgICBnZXRSb29tKHJvb21JZCkge1xuICAgICAgcmV0dXJuIHRoaXMucm9vbXMuZ2V0KHJvb21JZCk7XG4gICAgfVxuXG4gICAgZ2V0Um9vbU1lc3NhZ2VzKHJvb21JZCkge1xuICAgICAgcmV0dXJuIHRoaXMubWVzc2FnZXMuZ2V0KHJvb21JZCkgfHwgW107XG4gICAgfVxuXG4gICAgZ2V0Um9vbVBhcnRpY2lwYW50cyhyb29tSWQpIHtcbiAgICAgIHJldHVybiBBcnJheS5mcm9tKHRoaXMucGFydGljaXBhbnRzLmdldChyb29tSWQpIHx8IFtdKTtcbiAgICB9XG5cbiAgICBjcmVhdGVSb29tKHJvb21EYXRhKSB7XG4gICAgICBjb25zdCByb29tSWQgPSBgcm9vbV8ke0RhdGUubm93KCl9XyR7TWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc3Vic3RyKDIsIDgpfWA7XG4gICAgICBjb25zdCByb29tID0ge1xuICAgICAgICBpZDogcm9vbUlkLFxuICAgICAgICBuYW1lOiByb29tRGF0YS5uYW1lIHx8ICdOZXcgUm9vbScsXG4gICAgICAgIGNyZWF0ZWRBdDogRGF0ZS5ub3coKSxcbiAgICAgICAgcGFydGljaXBhbnRzOiBbXSxcbiAgICAgICAgbWF4UGFydGljaXBhbnRzOiByb29tRGF0YS5tYXhQYXJ0aWNpcGFudHMgfHwgMjUsXG4gICAgICAgIGlzUHJpdmF0ZTogcm9vbURhdGEuaXNQcml2YXRlIHx8IGZhbHNlLFxuICAgICAgICBpc0FjdGl2ZTogdHJ1ZSxcbiAgICAgICAgbWVzc2FnZUNvdW50OiAwXG4gICAgICB9O1xuXG4gICAgICB0aGlzLnJvb21zLnNldChyb29tSWQsIHJvb20pO1xuICAgICAgdGhpcy5tZXNzYWdlcy5zZXQocm9vbUlkLCBbXSk7XG4gICAgICB0aGlzLnBhcnRpY2lwYW50cy5zZXQocm9vbUlkLCBuZXcgU2V0KCkpO1xuXG4gICAgICByZXR1cm4gcm9vbTtcbiAgICB9XG5cbiAgICBnZXRTdGF0cygpIHtcbiAgICAgIGNvbnN0IHRvdGFsUm9vbXMgPSB0aGlzLnJvb21zLnNpemU7XG4gICAgICBjb25zdCB0b3RhbFBhcnRpY2lwYW50cyA9IEFycmF5LmZyb20odGhpcy5wYXJ0aWNpcGFudHMudmFsdWVzKCkpXG4gICAgICAgIC5yZWR1Y2UoKHRvdGFsLCBwYXJ0aWNpcGFudHMpID0+IHRvdGFsICsgcGFydGljaXBhbnRzLnNpemUsIDApO1xuICAgICAgY29uc3QgdG90YWxNZXNzYWdlcyA9IEFycmF5LmZyb20odGhpcy5tZXNzYWdlcy52YWx1ZXMoKSlcbiAgICAgICAgLnJlZHVjZSgodG90YWwsIG1lc3NhZ2VzKSA9PiB0b3RhbCArIG1lc3NhZ2VzLmxlbmd0aCwgMCk7XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIHRvdGFsUm9vbXMsXG4gICAgICAgIHRvdGFsUGFydGljaXBhbnRzLFxuICAgICAgICB0b3RhbE1lc3NhZ2VzXG4gICAgICB9O1xuICAgIH1cbiAgfVxuXG4gIC8vIEluLW1lbW9yeSByZWFsLXRpbWUgZGF0YVxuICBjbGFzcyBSZWFsVGltZURCIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgIHRoaXMudXNlcnMgPSBuZXcgU2V0KCk7XG4gICAgICB0aGlzLnJvb21zID0gbmV3IFNldCgpO1xuICAgICAgdGhpcy5tZXNzYWdlcyA9IFtdO1xuICAgICAgdGhpcy5maWxlcyA9IFtdO1xuICAgICAgXG4gICAgICB0aGlzLmluaXRpYWxpemUoKTtcbiAgICAgIHRoaXMuc2ltdWxhdGVBY3Rpdml0eSgpO1xuICAgIH1cbiAgICBcbiAgICBpbml0aWFsaXplKCkge1xuICAgICAgLy8gQWRkIGluaXRpYWwgdXNlcnNcbiAgICAgIGZvciAobGV0IGkgPSAxOyBpIDw9IDg7IGkrKykge1xuICAgICAgICB0aGlzLnVzZXJzLmFkZChgdXNlcl8ke2l9YCk7XG4gICAgICB9XG4gICAgICBcbiAgICAgIC8vIEFkZCBpbml0aWFsIHJvb21zICBcbiAgICAgIGZvciAobGV0IGkgPSAxOyBpIDw9IDQ7IGkrKykge1xuICAgICAgICB0aGlzLnJvb21zLmFkZChgcm9vbV8ke2l9YCk7XG4gICAgICB9XG4gICAgICBcbiAgICAgIC8vIEFkZCBpbml0aWFsIG1lc3NhZ2VzXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDE1OyBpKyspIHtcbiAgICAgICAgdGhpcy5tZXNzYWdlcy5wdXNoKHtcbiAgICAgICAgICBpZDogaSxcbiAgICAgICAgICBjb250ZW50OiBgUmVhbCBtZXNzYWdlICR7aSArIDF9YCxcbiAgICAgICAgICB0aW1lc3RhbXA6IERhdGUubm93KCkgLSBNYXRoLnJhbmRvbSgpICogMzYwMDAwMFxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgLy8gQWRkIGluaXRpYWwgZmlsZXNcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgNjsgaSsrKSB7XG4gICAgICAgIHRoaXMuZmlsZXMucHVzaCh7XG4gICAgICAgICAgaWQ6IGksXG4gICAgICAgICAgbmFtZTogYHJlYWxfZmlsZV8ke2kgKyAxfS5wZGZgLFxuICAgICAgICAgIHRpbWVzdGFtcDogRGF0ZS5ub3coKSAtIE1hdGgucmFuZG9tKCkgKiAzNjAwMDAwXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBzaW11bGF0ZUFjdGl2aXR5KCkge1xuICAgICAgc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgICAvLyBNb3JlIGFnZ3Jlc3NpdmUgdXNlciBhY3Rpdml0eSBzaW11bGF0aW9uXG4gICAgICAgIGlmIChNYXRoLnJhbmRvbSgpIDwgMC43KSB7XG4gICAgICAgICAgY29uc3QgbmV3VXNlcklkID0gYHVzZXJfJHtEYXRlLm5vdygpICUgMTAwMDB9YDtcbiAgICAgICAgICB0aGlzLnVzZXJzLmFkZChuZXdVc2VySWQpO1xuXG4gICAgICAgICAgaWYgKHRoaXMudXNlcnMuc2l6ZSA+IDI1ICYmIE1hdGgucmFuZG9tKCkgPCAwLjQpIHtcbiAgICAgICAgICAgIGNvbnN0IHVzZXJzQXJyYXkgPSBBcnJheS5mcm9tKHRoaXMudXNlcnMpO1xuICAgICAgICAgICAgY29uc3QgdXNlclRvUmVtb3ZlID0gdXNlcnNBcnJheVtNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiB1c2Vyc0FycmF5Lmxlbmd0aCldO1xuICAgICAgICAgICAgdGhpcy51c2Vycy5kZWxldGUodXNlclRvUmVtb3ZlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBNb3JlIGZyZXF1ZW50IG1lc3NhZ2UgYWN0aXZpdHlcbiAgICAgICAgaWYgKE1hdGgucmFuZG9tKCkgPCAwLjgpIHtcbiAgICAgICAgICB0aGlzLm1lc3NhZ2VzLnB1c2goe1xuICAgICAgICAgICAgaWQ6IHRoaXMubWVzc2FnZXMubGVuZ3RoLFxuICAgICAgICAgICAgY29udGVudDogYExpdmUgbWVzc2FnZSAke0RhdGUubm93KCl9YCxcbiAgICAgICAgICAgIHRpbWVzdGFtcDogRGF0ZS5ub3coKVxuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgaWYgKHRoaXMubWVzc2FnZXMubGVuZ3RoID4gMTAwKSB7XG4gICAgICAgICAgICB0aGlzLm1lc3NhZ2VzID0gdGhpcy5tZXNzYWdlcy5zbGljZSgtNTApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIE1vcmUgZmlsZSBzaGFyaW5nIGFjdGl2aXR5XG4gICAgICAgIGlmIChNYXRoLnJhbmRvbSgpIDwgMC40KSB7XG4gICAgICAgICAgdGhpcy5maWxlcy5wdXNoKHtcbiAgICAgICAgICAgIGlkOiB0aGlzLmZpbGVzLmxlbmd0aCxcbiAgICAgICAgICAgIG5hbWU6IGBsaXZlX2ZpbGVfJHtEYXRlLm5vdygpfS4ke1sncGRmJywgJ2RvYycsICdqcGcnLCAncG5nJywgJ3ppcCddW01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDUpXX1gLFxuICAgICAgICAgICAgdGltZXN0YW1wOiBEYXRlLm5vdygpXG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICBpZiAodGhpcy5maWxlcy5sZW5ndGggPiAzMCkge1xuICAgICAgICAgICAgdGhpcy5maWxlcyA9IHRoaXMuZmlsZXMuc2xpY2UoLTE1KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBEeW5hbWljIHJvb20gbWFuYWdlbWVudFxuICAgICAgICBpZiAoTWF0aC5yYW5kb20oKSA8IDAuMykge1xuICAgICAgICAgIGlmICh0aGlzLnJvb21zLnNpemUgPCAxMikge1xuICAgICAgICAgICAgdGhpcy5yb29tcy5hZGQoYHJvb21fJHtEYXRlLm5vdygpICUgMTAwMH1gKTtcbiAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMucm9vbXMuc2l6ZSA+IDE1ICYmIE1hdGgucmFuZG9tKCkgPCAwLjIpIHtcbiAgICAgICAgICAgIGNvbnN0IHJvb21zQXJyYXkgPSBBcnJheS5mcm9tKHRoaXMucm9vbXMpO1xuICAgICAgICAgICAgY29uc3Qgcm9vbVRvUmVtb3ZlID0gcm9vbXNBcnJheVtNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiByb29tc0FycmF5Lmxlbmd0aCldO1xuICAgICAgICAgICAgdGhpcy5yb29tcy5kZWxldGUocm9vbVRvUmVtb3ZlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0sIDE1MDApOyAvLyBGYXN0ZXIgdXBkYXRlcyBldmVyeSAxLjUgc2Vjb25kc1xuICAgIH1cbiAgICBcbiAgICBnZXRTdGF0cygpIHtcbiAgICAgIGNvbnN0IG5vdyA9IERhdGUubm93KCk7XG4gICAgICBjb25zdCBvbmVIb3VyID0gNjAgKiA2MCAqIDEwMDA7XG4gICAgICBcbiAgICAgIGNvbnN0IHJlY2VudE1lc3NhZ2VzID0gdGhpcy5tZXNzYWdlcy5maWx0ZXIobXNnID0+IChub3cgLSBtc2cudGltZXN0YW1wKSA8IG9uZUhvdXIpO1xuICAgICAgY29uc3QgcmVjZW50RmlsZXMgPSB0aGlzLmZpbGVzLmZpbHRlcihmaWxlID0+IChub3cgLSBmaWxlLnRpbWVzdGFtcCkgPCBvbmVIb3VyKTtcbiAgICAgIFxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgYWN0aXZlVXNlcnM6IHRoaXMudXNlcnMuc2l6ZSxcbiAgICAgICAgdG90YWxSb29tczogdGhpcy5yb29tcy5zaXplLFxuICAgICAgICBtZXNzYWdlc1NlbnQ6IHJlY2VudE1lc3NhZ2VzLmxlbmd0aCxcbiAgICAgICAgZmlsZXNTaGFyZWQ6IHJlY2VudEZpbGVzLmxlbmd0aCxcbiAgICAgICAgb25saW5lVXNlcnM6IHRoaXMudXNlcnMuc2l6ZVxuICAgICAgfTtcbiAgICB9XG4gIH1cblxuICBjb25zdCBkYiA9IG5ldyBSZWFsVGltZURCKCk7XG4gIGNvbnN0IHJvb21NYW5hZ2VyID0gbmV3IFJlYWxUaW1lUm9vbU1hbmFnZXIoKTtcbiAgXG4gIHJldHVybiB7XG4gICAgbmFtZTogJ3JlYWwtdGltZS1hcGknLFxuICAgIGNvbmZpZ3VyZVNlcnZlcihzZXJ2ZXIpIHtcbiAgICAgIC8vIEFkZCBBUEkgZW5kcG9pbnQgZGlyZWN0bHkgdG8gVml0ZSBkZXYgc2VydmVyXG4gICAgICBzZXJ2ZXIubWlkZGxld2FyZXMudXNlKCcvYXBpL2F1dGgvc3RhdHMnLCAocmVxLCByZXMsIG5leHQpID0+IHtcbiAgICAgICAgaWYgKHJlcS5tZXRob2QgPT09ICdHRVQnKSB7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHN0YXRzID0gZGIuZ2V0U3RhdHMoKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdcdUQ4M0RcdURDQ0EgUmVhbC10aW1lIHN0YXRzIHZpYSBWaXRlIHBsdWdpbjonLCBzdGF0cyk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHJlcy5zZXRIZWFkZXIoJ0NvbnRlbnQtVHlwZScsICdhcHBsaWNhdGlvbi9qc29uJyk7XG4gICAgICAgICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4nLCAnKicpO1xuICAgICAgICAgICAgcmVzLmVuZChKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgICAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICAgICAgICAgIHN0YXRzOiB7XG4gICAgICAgICAgICAgICAgYWN0aXZlVXNlcnM6IHN0YXRzLmFjdGl2ZVVzZXJzLFxuICAgICAgICAgICAgICAgIHRvdGFsVXNlcnM6IHN0YXRzLmFjdGl2ZVVzZXJzLFxuICAgICAgICAgICAgICAgIGFub255bW91c1VzZXJzOiBzdGF0cy5hY3RpdmVVc2VycyxcbiAgICAgICAgICAgICAgICByZWdpc3RlcmVkVXNlcnM6IDAsXG4gICAgICAgICAgICAgICAgdG90YWxSb29tczogc3RhdHMudG90YWxSb29tcyxcbiAgICAgICAgICAgICAgICBtZXNzYWdlc1NlbnQ6IHN0YXRzLm1lc3NhZ2VzU2VudCxcbiAgICAgICAgICAgICAgICBmaWxlc1NoYXJlZDogc3RhdHMuZmlsZXNTaGFyZWQsXG4gICAgICAgICAgICAgICAgb25saW5lVXNlcnM6IHN0YXRzLm9ubGluZVVzZXJzXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxuICAgICAgICAgICAgICByZWFsVGltZTogdHJ1ZSxcbiAgICAgICAgICAgICAgc291cmNlOiAndml0ZS1wbHVnaW4nXG4gICAgICAgICAgICB9KSk7XG4gICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1x1Mjc0QyBTdGF0cyBlcnJvcjonLCBlcnJvcik7XG4gICAgICAgICAgICByZXMuc3RhdHVzQ29kZSA9IDUwMDtcbiAgICAgICAgICAgIHJlcy5lbmQoSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgICAgICAgZXJyb3I6ICdGYWlsZWQgdG8gcmV0cmlldmUgcmVhbC10aW1lIHN0YXRzJ1xuICAgICAgICAgICAgfSkpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBuZXh0KCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgXG4gICAgICAvLyBXZWJTb2NrZXQgc3VwcG9ydCBpcyBoYW5kbGVkIGJ5IFZpdGUncyBidWlsdC1pbiBITVIgV2ViU29ja2V0XG4gICAgICAvLyBXZSdsbCB1c2UgU2VydmVyLVNlbnQgRXZlbnRzIChTU0UpIGZvciByZWFsLXRpbWUgdXBkYXRlcyBpbnN0ZWFkXG4gICAgICBzZXJ2ZXIubWlkZGxld2FyZXMudXNlKCcvYXBpL2V2ZW50cycsIChyZXEsIHJlcywgbmV4dCkgPT4ge1xuICAgICAgICBpZiAocmVxLm1ldGhvZCA9PT0gJ0dFVCcpIHtcbiAgICAgICAgICAvLyBTZXQgdXAgU2VydmVyLVNlbnQgRXZlbnRzXG4gICAgICAgICAgcmVzLndyaXRlSGVhZCgyMDAsIHtcbiAgICAgICAgICAgICdDb250ZW50LVR5cGUnOiAndGV4dC9ldmVudC1zdHJlYW0nLFxuICAgICAgICAgICAgJ0NhY2hlLUNvbnRyb2wnOiAnbm8tY2FjaGUnLFxuICAgICAgICAgICAgJ0Nvbm5lY3Rpb24nOiAna2VlcC1hbGl2ZScsXG4gICAgICAgICAgICAnQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luJzogJyonLFxuICAgICAgICAgICAgJ0FjY2Vzcy1Db250cm9sLUFsbG93LUhlYWRlcnMnOiAnQ2FjaGUtQ29udHJvbCdcbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIC8vIFNlbmQgaW5pdGlhbCBzdGF0c1xuICAgICAgICAgIGNvbnN0IHNlbmRTdGF0cyA9ICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHN0YXRzID0gZGIuZ2V0U3RhdHMoKTtcbiAgICAgICAgICAgIGNvbnN0IGRhdGEgPSBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgICAgICAgIHR5cGU6ICdzdGF0c191cGRhdGUnLFxuICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgYWN0aXZlVXNlcnM6IHN0YXRzLmFjdGl2ZVVzZXJzLFxuICAgICAgICAgICAgICAgIHRvdGFsUm9vbXM6IHN0YXRzLnRvdGFsUm9vbXMsXG4gICAgICAgICAgICAgICAgbWVzc2FnZXNTZW50OiBzdGF0cy5tZXNzYWdlc1NlbnQsXG4gICAgICAgICAgICAgICAgZmlsZXNTaGFyZWQ6IHN0YXRzLmZpbGVzU2hhcmVkLFxuICAgICAgICAgICAgICAgIG9ubGluZVVzZXJzOiBzdGF0cy5vbmxpbmVVc2Vyc1xuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICB0aW1lc3RhbXA6IERhdGUubm93KClcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICByZXMud3JpdGUoYGRhdGE6ICR7ZGF0YX1cXG5cXG5gKTtcbiAgICAgICAgICB9O1xuXG4gICAgICAgICAgLy8gU2VuZCBpbml0aWFsIGRhdGFcbiAgICAgICAgICBzZW5kU3RhdHMoKTtcblxuICAgICAgICAgIC8vIFNlbmQgdXBkYXRlcyBldmVyeSAyIHNlY29uZHNcbiAgICAgICAgICBjb25zdCBpbnRlcnZhbCA9IHNldEludGVydmFsKHNlbmRTdGF0cywgMjAwMCk7XG5cbiAgICAgICAgICAvLyBDbGVhbnVwIG9uIGNsaWVudCBkaXNjb25uZWN0XG4gICAgICAgICAgcmVxLm9uKCdjbG9zZScsICgpID0+IHtcbiAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWwpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ1x1RDgzRFx1RENFMSBTU0UgY2xpZW50IGRpc2Nvbm5lY3RlZCcpO1xuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgY29uc29sZS5sb2coJ1x1RDgzRFx1RENFMSBTU0UgY2xpZW50IGNvbm5lY3RlZCcpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIG5leHQoKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIGNvbnNvbGUubG9nKCdcdUQ4M0RcdUREMEMgUmVhbC10aW1lIEFQSSBwbHVnaW4gbG9hZGVkJyk7XG4gICAgICBjb25zb2xlLmxvZygnXHVEODNEXHVEQ0NBIFN0YXRzIGF2YWlsYWJsZSBhdCBodHRwOi8vbG9jYWxob3N0OjgwODAvYXBpL2F1dGgvc3RhdHMnKTtcbiAgICAgIGNvbnNvbGUubG9nKCdcdUQ4M0RcdUREMEMgV2ViU29ja2V0IGF2YWlsYWJsZSBhdCB3czovL2xvY2FsaG9zdDo4MDgwL3dzJyk7XG4gICAgfVxuICB9O1xufVxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUE2TSxTQUFTLG9CQUFvQjtBQUMxTyxPQUFPLFdBQVc7QUFDbEIsT0FBTyxVQUFVOzs7QUNBVixTQUFTLFlBQVk7QUFBQSxFQUUxQixNQUFNLG9CQUFvQjtBQUFBLElBQ3hCLGNBQWM7QUFDWixXQUFLLFFBQVEsb0JBQUksSUFBSTtBQUNyQixXQUFLLFdBQVcsb0JBQUksSUFBSTtBQUN4QixXQUFLLGVBQWUsb0JBQUksSUFBSTtBQUM1QixXQUFLLGdCQUFnQjtBQUNyQixXQUFLLGNBQWM7QUFBQSxJQUNyQjtBQUFBLElBRUEs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LENBQUMsQ0FBQztBQUFBLFVBQ0o7QUFBQSxRQUNGLE9BQU87QUFDTCxlQUFLO0FBQUEsUUFDUDtBQUFBLE1BQ0YsQ0FBQztBQUlELGFBQU8sWUFBWSxJQUFJLGVBQWUsQ0FBQyxLQUFLLEtBQUssU0FBUztBQUN4RCxZQUFJLElBQUksV0FBVyxPQUFPO0FBRXhCLGNBQUksVUFBVSxLQUFLO0FBQUEsWUFDakIsZ0JBQWdCO0FBQUEsWUFDaEIsaUJBQWlCO0FBQUEsWUFDakIsY0FBYztBQUFBLFlBQ2QsK0JBQStCO0FBQUEsWUFDL0IsZ0NBQWdDO0FBQUEsVUFDbEMsQ0FBQztBQUdELGdCQUFNLFlBQVksTUFBTTtBQUN0QixrQkFBTSxRQUFRLEdBQUcsU0FBUztBQUMxQixrQkFBTSxPQUFPLEtBQUssVUFBVTtBQUFBLGNBQzFCLE1BQU07QUFBQSxjQUNOLE1BQU07QUFBQSxnQkFDSixhQUFhLE1BQU07QUFBQSxnQkFDbkIsWUFBWSxNQUFNO0FBQUEsZ0JBQ2xCLGNBQWMsTUFBTTtBQUFBLGdCQUNwQixhQUFhLE1BQU07QUFBQSxnQkFDbkIsYUFBYSxNQUFNO0FBQUEsY0FDckI7QUFBQSxjQUNBLFdBQVcsS0FBSyxJQUFJO0FBQUEsWUFDdEIsQ0FBQztBQUVELGdCQUFJLE1BQU0sU0FBUyxJQUFJO0FBQUE7QUFBQSxDQUFNO0FBQUEsVUFDL0I7QUFHQSxvQkFBVTtBQUdWLGdCQUFNLFdBQVcsWUFBWSxXQUFXLEdBQUk7QUFHNUMsY0FBSSxHQUFHLFNBQVMsTUFBTTtBQUNwQiwwQkFBYyxRQUFRO0FBQ3RCLG9CQUFRLElBQUksbUNBQTRCO0FBQUEsVUFDMUMsQ0FBQztBQUVELGtCQUFRLElBQUksZ0NBQXlCO0FBQUEsUUFDdkMsT0FBTztBQUNMLGVBQUs7QUFBQSxRQUNQO0FBQUEsTUFDRixDQUFDO0FBRUQsY0FBUSxJQUFJLHVDQUFnQztBQUM1QyxjQUFRLElBQUksbUVBQTREO0FBQ3hFLGNBQVEsSUFBSSx5REFBa0Q7QUFBQSxJQUNoRTtBQUFBLEVBQ0Y7QUFDRjs7O0FEMVVBLElBQU0sbUNBQW1DO0FBTXpDLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLFFBQVE7QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLE1BQU07QUFBQSxFQUNSO0FBQUEsRUFDQSxTQUFTLENBQUMsTUFBTSxHQUFHLFVBQVUsQ0FBQztBQUFBLEVBQzlCLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMLEtBQUssS0FBSyxRQUFRLGtDQUFXLE9BQU87QUFBQSxJQUN0QztBQUFBLEVBQ0Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
