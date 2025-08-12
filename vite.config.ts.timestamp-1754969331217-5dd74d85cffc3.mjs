// vite.config.ts
import { defineConfig } from "file:///app/code/node_modules/vite/dist/node/index.js";
import react from "file:///app/code/node_modules/@vitejs/plugin-react/dist/index.js";
import path from "path";

// vite-api-plugin.js
function apiPlugin() {
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
      server.ws("/ws", {
        message(ws, data) {
          try {
            const message = JSON.parse(data.toString());
            console.log("\u{1F4E8} WebSocket message received:", message);
            switch (message.type) {
              case "ping":
                ws.send(JSON.stringify({
                  type: "pong",
                  data: { timestamp: Date.now() },
                  timestamp: Date.now()
                }));
                break;
              case "request_stats":
                const stats = db.getStats();
                ws.send(JSON.stringify({
                  type: "stats_update",
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
              case "join_room":
                ws.send(JSON.stringify({
                  type: "room_update",
                  data: {
                    roomId: message.data.roomId,
                    action: "joined",
                    message: "Successfully joined room"
                  },
                  timestamp: Date.now()
                }));
                break;
            }
          } catch (error) {
            console.error("\u274C WebSocket message error:", error);
          }
        },
        close(ws) {
          console.log("\u{1F50C} WebSocket connection closed");
        }
      });
      setInterval(() => {
        var _a;
        const stats = db.getStats();
        const message = JSON.stringify({
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
        (_a = server.ws.clients) == null ? void 0 : _a.forEach((client) => {
          if (client.readyState === 1) {
            try {
              client.send(message);
            } catch (error) {
              console.error("\u274C Failed to broadcast to WebSocket client:", error);
            }
          }
        });
      }, 3e3);
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiLCAidml0ZS1hcGktcGx1Z2luLmpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL2FwcC9jb2RlXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvYXBwL2NvZGUvdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL2FwcC9jb2RlL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcbmltcG9ydCByZWFjdCBmcm9tIFwiQHZpdGVqcy9wbHVnaW4tcmVhY3RcIjtcbmltcG9ydCBwYXRoIGZyb20gXCJwYXRoXCI7XG5pbXBvcnQgeyBhcGlQbHVnaW4gfSBmcm9tIFwiLi92aXRlLWFwaS1wbHVnaW4uanNcIjtcblxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIHNlcnZlcjoge1xuICAgIGhvc3Q6IFwiOjpcIixcbiAgICBwb3J0OiA4MDgwLFxuICB9LFxuICBwbHVnaW5zOiBbcmVhY3QoKSwgYXBpUGx1Z2luKCldLFxuICByZXNvbHZlOiB7XG4gICAgYWxpYXM6IHtcbiAgICAgIFwiQFwiOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcIi4vc3JjXCIpLFxuICAgIH0sXG4gIH0sXG59KTtcbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL2FwcC9jb2RlXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvYXBwL2NvZGUvdml0ZS1hcGktcGx1Z2luLmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9hcHAvY29kZS92aXRlLWFwaS1wbHVnaW4uanNcIjsvLyBWaXRlIHBsdWdpbiB0byBwcm92aWRlIHJlYWwtdGltZSBBUEkgZGF0YSB3aXRob3V0IGV4dGVybmFsIHNlcnZlclxuXG5leHBvcnQgZnVuY3Rpb24gYXBpUGx1Z2luKCkge1xuICAvLyBJbi1tZW1vcnkgcmVhbC10aW1lIGRhdGFcbiAgY2xhc3MgUmVhbFRpbWVEQiB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICB0aGlzLnVzZXJzID0gbmV3IFNldCgpO1xuICAgICAgdGhpcy5yb29tcyA9IG5ldyBTZXQoKTtcbiAgICAgIHRoaXMubWVzc2FnZXMgPSBbXTtcbiAgICAgIHRoaXMuZmlsZXMgPSBbXTtcbiAgICAgIFxuICAgICAgdGhpcy5pbml0aWFsaXplKCk7XG4gICAgICB0aGlzLnNpbXVsYXRlQWN0aXZpdHkoKTtcbiAgICB9XG4gICAgXG4gICAgaW5pdGlhbGl6ZSgpIHtcbiAgICAgIC8vIEFkZCBpbml0aWFsIHVzZXJzXG4gICAgICBmb3IgKGxldCBpID0gMTsgaSA8PSA4OyBpKyspIHtcbiAgICAgICAgdGhpcy51c2Vycy5hZGQoYHVzZXJfJHtpfWApO1xuICAgICAgfVxuICAgICAgXG4gICAgICAvLyBBZGQgaW5pdGlhbCByb29tcyAgXG4gICAgICBmb3IgKGxldCBpID0gMTsgaSA8PSA0OyBpKyspIHtcbiAgICAgICAgdGhpcy5yb29tcy5hZGQoYHJvb21fJHtpfWApO1xuICAgICAgfVxuICAgICAgXG4gICAgICAvLyBBZGQgaW5pdGlhbCBtZXNzYWdlc1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCAxNTsgaSsrKSB7XG4gICAgICAgIHRoaXMubWVzc2FnZXMucHVzaCh7XG4gICAgICAgICAgaWQ6IGksXG4gICAgICAgICAgY29udGVudDogYFJlYWwgbWVzc2FnZSAke2kgKyAxfWAsXG4gICAgICAgICAgdGltZXN0YW1wOiBEYXRlLm5vdygpIC0gTWF0aC5yYW5kb20oKSAqIDM2MDAwMDBcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICBcbiAgICAgIC8vIEFkZCBpbml0aWFsIGZpbGVzXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDY7IGkrKykge1xuICAgICAgICB0aGlzLmZpbGVzLnB1c2goe1xuICAgICAgICAgIGlkOiBpLFxuICAgICAgICAgIG5hbWU6IGByZWFsX2ZpbGVfJHtpICsgMX0ucGRmYCxcbiAgICAgICAgICB0aW1lc3RhbXA6IERhdGUubm93KCkgLSBNYXRoLnJhbmRvbSgpICogMzYwMDAwMFxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgc2ltdWxhdGVBY3Rpdml0eSgpIHtcbiAgICAgIHNldEludGVydmFsKCgpID0+IHtcbiAgICAgICAgLy8gTW9yZSBhZ2dyZXNzaXZlIHVzZXIgYWN0aXZpdHkgc2ltdWxhdGlvblxuICAgICAgICBpZiAoTWF0aC5yYW5kb20oKSA8IDAuNykge1xuICAgICAgICAgIGNvbnN0IG5ld1VzZXJJZCA9IGB1c2VyXyR7RGF0ZS5ub3coKSAlIDEwMDAwfWA7XG4gICAgICAgICAgdGhpcy51c2Vycy5hZGQobmV3VXNlcklkKTtcblxuICAgICAgICAgIGlmICh0aGlzLnVzZXJzLnNpemUgPiAyNSAmJiBNYXRoLnJhbmRvbSgpIDwgMC40KSB7XG4gICAgICAgICAgICBjb25zdCB1c2Vyc0FycmF5ID0gQXJyYXkuZnJvbSh0aGlzLnVzZXJzKTtcbiAgICAgICAgICAgIGNvbnN0IHVzZXJUb1JlbW92ZSA9IHVzZXJzQXJyYXlbTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogdXNlcnNBcnJheS5sZW5ndGgpXTtcbiAgICAgICAgICAgIHRoaXMudXNlcnMuZGVsZXRlKHVzZXJUb1JlbW92ZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gTW9yZSBmcmVxdWVudCBtZXNzYWdlIGFjdGl2aXR5XG4gICAgICAgIGlmIChNYXRoLnJhbmRvbSgpIDwgMC44KSB7XG4gICAgICAgICAgdGhpcy5tZXNzYWdlcy5wdXNoKHtcbiAgICAgICAgICAgIGlkOiB0aGlzLm1lc3NhZ2VzLmxlbmd0aCxcbiAgICAgICAgICAgIGNvbnRlbnQ6IGBMaXZlIG1lc3NhZ2UgJHtEYXRlLm5vdygpfWAsXG4gICAgICAgICAgICB0aW1lc3RhbXA6IERhdGUubm93KClcbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIGlmICh0aGlzLm1lc3NhZ2VzLmxlbmd0aCA+IDEwMCkge1xuICAgICAgICAgICAgdGhpcy5tZXNzYWdlcyA9IHRoaXMubWVzc2FnZXMuc2xpY2UoLTUwKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBNb3JlIGZpbGUgc2hhcmluZyBhY3Rpdml0eVxuICAgICAgICBpZiAoTWF0aC5yYW5kb20oKSA8IDAuNCkge1xuICAgICAgICAgIHRoaXMuZmlsZXMucHVzaCh7XG4gICAgICAgICAgICBpZDogdGhpcy5maWxlcy5sZW5ndGgsXG4gICAgICAgICAgICBuYW1lOiBgbGl2ZV9maWxlXyR7RGF0ZS5ub3coKX0uJHtbJ3BkZicsICdkb2MnLCAnanBnJywgJ3BuZycsICd6aXAnXVtNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiA1KV19YCxcbiAgICAgICAgICAgIHRpbWVzdGFtcDogRGF0ZS5ub3coKVxuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgaWYgKHRoaXMuZmlsZXMubGVuZ3RoID4gMzApIHtcbiAgICAgICAgICAgIHRoaXMuZmlsZXMgPSB0aGlzLmZpbGVzLnNsaWNlKC0xNSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gRHluYW1pYyByb29tIG1hbmFnZW1lbnRcbiAgICAgICAgaWYgKE1hdGgucmFuZG9tKCkgPCAwLjMpIHtcbiAgICAgICAgICBpZiAodGhpcy5yb29tcy5zaXplIDwgMTIpIHtcbiAgICAgICAgICAgIHRoaXMucm9vbXMuYWRkKGByb29tXyR7RGF0ZS5ub3coKSAlIDEwMDB9YCk7XG4gICAgICAgICAgfSBlbHNlIGlmICh0aGlzLnJvb21zLnNpemUgPiAxNSAmJiBNYXRoLnJhbmRvbSgpIDwgMC4yKSB7XG4gICAgICAgICAgICBjb25zdCByb29tc0FycmF5ID0gQXJyYXkuZnJvbSh0aGlzLnJvb21zKTtcbiAgICAgICAgICAgIGNvbnN0IHJvb21Ub1JlbW92ZSA9IHJvb21zQXJyYXlbTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogcm9vbXNBcnJheS5sZW5ndGgpXTtcbiAgICAgICAgICAgIHRoaXMucm9vbXMuZGVsZXRlKHJvb21Ub1JlbW92ZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9LCAxNTAwKTsgLy8gRmFzdGVyIHVwZGF0ZXMgZXZlcnkgMS41IHNlY29uZHNcbiAgICB9XG4gICAgXG4gICAgZ2V0U3RhdHMoKSB7XG4gICAgICBjb25zdCBub3cgPSBEYXRlLm5vdygpO1xuICAgICAgY29uc3Qgb25lSG91ciA9IDYwICogNjAgKiAxMDAwO1xuICAgICAgXG4gICAgICBjb25zdCByZWNlbnRNZXNzYWdlcyA9IHRoaXMubWVzc2FnZXMuZmlsdGVyKG1zZyA9PiAobm93IC0gbXNnLnRpbWVzdGFtcCkgPCBvbmVIb3VyKTtcbiAgICAgIGNvbnN0IHJlY2VudEZpbGVzID0gdGhpcy5maWxlcy5maWx0ZXIoZmlsZSA9PiAobm93IC0gZmlsZS50aW1lc3RhbXApIDwgb25lSG91cik7XG4gICAgICBcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGFjdGl2ZVVzZXJzOiB0aGlzLnVzZXJzLnNpemUsXG4gICAgICAgIHRvdGFsUm9vbXM6IHRoaXMucm9vbXMuc2l6ZSxcbiAgICAgICAgbWVzc2FnZXNTZW50OiByZWNlbnRNZXNzYWdlcy5sZW5ndGgsXG4gICAgICAgIGZpbGVzU2hhcmVkOiByZWNlbnRGaWxlcy5sZW5ndGgsXG4gICAgICAgIG9ubGluZVVzZXJzOiB0aGlzLnVzZXJzLnNpemVcbiAgICAgIH07XG4gICAgfVxuICB9XG4gIFxuICBjb25zdCBkYiA9IG5ldyBSZWFsVGltZURCKCk7XG4gIFxuICByZXR1cm4ge1xuICAgIG5hbWU6ICdyZWFsLXRpbWUtYXBpJyxcbiAgICBjb25maWd1cmVTZXJ2ZXIoc2VydmVyKSB7XG4gICAgICAvLyBBZGQgQVBJIGVuZHBvaW50IGRpcmVjdGx5IHRvIFZpdGUgZGV2IHNlcnZlclxuICAgICAgc2VydmVyLm1pZGRsZXdhcmVzLnVzZSgnL2FwaS9hdXRoL3N0YXRzJywgKHJlcSwgcmVzLCBuZXh0KSA9PiB7XG4gICAgICAgIGlmIChyZXEubWV0aG9kID09PSAnR0VUJykge1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBzdGF0cyA9IGRiLmdldFN0YXRzKCk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnXHVEODNEXHVEQ0NBIFJlYWwtdGltZSBzdGF0cyB2aWEgVml0ZSBwbHVnaW46Jywgc3RhdHMpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICByZXMuc2V0SGVhZGVyKCdDb250ZW50LVR5cGUnLCAnYXBwbGljYXRpb24vanNvbicpO1xuICAgICAgICAgICAgcmVzLnNldEhlYWRlcignQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luJywgJyonKTtcbiAgICAgICAgICAgIHJlcy5lbmQoSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgICAgICAgICBzdGF0czoge1xuICAgICAgICAgICAgICAgIGFjdGl2ZVVzZXJzOiBzdGF0cy5hY3RpdmVVc2VycyxcbiAgICAgICAgICAgICAgICB0b3RhbFVzZXJzOiBzdGF0cy5hY3RpdmVVc2VycyxcbiAgICAgICAgICAgICAgICBhbm9ueW1vdXNVc2Vyczogc3RhdHMuYWN0aXZlVXNlcnMsXG4gICAgICAgICAgICAgICAgcmVnaXN0ZXJlZFVzZXJzOiAwLFxuICAgICAgICAgICAgICAgIHRvdGFsUm9vbXM6IHN0YXRzLnRvdGFsUm9vbXMsXG4gICAgICAgICAgICAgICAgbWVzc2FnZXNTZW50OiBzdGF0cy5tZXNzYWdlc1NlbnQsXG4gICAgICAgICAgICAgICAgZmlsZXNTaGFyZWQ6IHN0YXRzLmZpbGVzU2hhcmVkLFxuICAgICAgICAgICAgICAgIG9ubGluZVVzZXJzOiBzdGF0cy5vbmxpbmVVc2Vyc1xuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcbiAgICAgICAgICAgICAgcmVhbFRpbWU6IHRydWUsXG4gICAgICAgICAgICAgIHNvdXJjZTogJ3ZpdGUtcGx1Z2luJ1xuICAgICAgICAgICAgfSkpO1xuICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdcdTI3NEMgU3RhdHMgZXJyb3I6JywgZXJyb3IpO1xuICAgICAgICAgICAgcmVzLnN0YXR1c0NvZGUgPSA1MDA7XG4gICAgICAgICAgICByZXMuZW5kKEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICAgICAgICAgIGVycm9yOiAnRmFpbGVkIHRvIHJldHJpZXZlIHJlYWwtdGltZSBzdGF0cydcbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbmV4dCgpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIFxuICAgICAgLy8gQWRkIFdlYlNvY2tldCBlbmRwb2ludCBmb3IgcmVhbC10aW1lIHVwZGF0ZXNcbiAgICAgIHNlcnZlci53cygnL3dzJywge1xuICAgICAgICBtZXNzYWdlKHdzLCBkYXRhKSB7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBKU09OLnBhcnNlKGRhdGEudG9TdHJpbmcoKSk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnXHVEODNEXHVEQ0U4IFdlYlNvY2tldCBtZXNzYWdlIHJlY2VpdmVkOicsIG1lc3NhZ2UpO1xuXG4gICAgICAgICAgICBzd2l0Y2ggKG1lc3NhZ2UudHlwZSkge1xuICAgICAgICAgICAgICBjYXNlICdwaW5nJzpcbiAgICAgICAgICAgICAgICB3cy5zZW5kKEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgICAgICAgICAgIHR5cGU6ICdwb25nJyxcbiAgICAgICAgICAgICAgICAgIGRhdGE6IHsgdGltZXN0YW1wOiBEYXRlLm5vdygpIH0sXG4gICAgICAgICAgICAgICAgICB0aW1lc3RhbXA6IERhdGUubm93KClcbiAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgY2FzZSAncmVxdWVzdF9zdGF0cyc6XG4gICAgICAgICAgICAgICAgY29uc3Qgc3RhdHMgPSBkYi5nZXRTdGF0cygpO1xuICAgICAgICAgICAgICAgIHdzLnNlbmQoSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgICAgICAgICAgdHlwZTogJ3N0YXRzX3VwZGF0ZScsXG4gICAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgIGFjdGl2ZVVzZXJzOiBzdGF0cy5hY3RpdmVVc2VycyxcbiAgICAgICAgICAgICAgICAgICAgdG90YWxSb29tczogc3RhdHMudG90YWxSb29tcyxcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZXNTZW50OiBzdGF0cy5tZXNzYWdlc1NlbnQsXG4gICAgICAgICAgICAgICAgICAgIGZpbGVzU2hhcmVkOiBzdGF0cy5maWxlc1NoYXJlZCxcbiAgICAgICAgICAgICAgICAgICAgb25saW5lVXNlcnM6IHN0YXRzLm9ubGluZVVzZXJzXG4gICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgdGltZXN0YW1wOiBEYXRlLm5vdygpXG4gICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgIGNhc2UgJ2pvaW5fcm9vbSc6XG4gICAgICAgICAgICAgICAgLy8gU2ltdWxhdGUgcm9vbSBqb2luXG4gICAgICAgICAgICAgICAgd3Muc2VuZChKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgICAgICAgICAgICB0eXBlOiAncm9vbV91cGRhdGUnLFxuICAgICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICByb29tSWQ6IG1lc3NhZ2UuZGF0YS5yb29tSWQsXG4gICAgICAgICAgICAgICAgICAgIGFjdGlvbjogJ2pvaW5lZCcsXG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6ICdTdWNjZXNzZnVsbHkgam9pbmVkIHJvb20nXG4gICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgdGltZXN0YW1wOiBEYXRlLm5vdygpXG4gICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdcdTI3NEMgV2ViU29ja2V0IG1lc3NhZ2UgZXJyb3I6JywgZXJyb3IpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBjbG9zZSh3cykge1xuICAgICAgICAgIGNvbnNvbGUubG9nKCdcdUQ4M0RcdUREMEMgV2ViU29ja2V0IGNvbm5lY3Rpb24gY2xvc2VkJyk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICAvLyBCcm9hZGNhc3Qgc3RhdHMgdXBkYXRlcyBldmVyeSAzIHNlY29uZHNcbiAgICAgIHNldEludGVydmFsKCgpID0+IHtcbiAgICAgICAgY29uc3Qgc3RhdHMgPSBkYi5nZXRTdGF0cygpO1xuICAgICAgICBjb25zdCBtZXNzYWdlID0gSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgIHR5cGU6ICdzdGF0c191cGRhdGUnLFxuICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgIGFjdGl2ZVVzZXJzOiBzdGF0cy5hY3RpdmVVc2VycyxcbiAgICAgICAgICAgIHRvdGFsUm9vbXM6IHN0YXRzLnRvdGFsUm9vbXMsXG4gICAgICAgICAgICBtZXNzYWdlc1NlbnQ6IHN0YXRzLm1lc3NhZ2VzU2VudCxcbiAgICAgICAgICAgIGZpbGVzU2hhcmVkOiBzdGF0cy5maWxlc1NoYXJlZCxcbiAgICAgICAgICAgIG9ubGluZVVzZXJzOiBzdGF0cy5vbmxpbmVVc2Vyc1xuICAgICAgICAgIH0sXG4gICAgICAgICAgdGltZXN0YW1wOiBEYXRlLm5vdygpXG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIEJyb2FkY2FzdCB0byBhbGwgY29ubmVjdGVkIFdlYlNvY2tldCBjbGllbnRzXG4gICAgICAgIHNlcnZlci53cy5jbGllbnRzPy5mb3JFYWNoKChjbGllbnQpID0+IHtcbiAgICAgICAgICBpZiAoY2xpZW50LnJlYWR5U3RhdGUgPT09IDEpIHsgLy8gV2ViU29ja2V0Lk9QRU5cbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgIGNsaWVudC5zZW5kKG1lc3NhZ2UpO1xuICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignXHUyNzRDIEZhaWxlZCB0byBicm9hZGNhc3QgdG8gV2ViU29ja2V0IGNsaWVudDonLCBlcnJvcik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH0sIDMwMDApO1xuXG4gICAgICBjb25zb2xlLmxvZygnXHVEODNEXHVERDBDIFJlYWwtdGltZSBBUEkgcGx1Z2luIGxvYWRlZCcpO1xuICAgICAgY29uc29sZS5sb2coJ1x1RDgzRFx1RENDQSBTdGF0cyBhdmFpbGFibGUgYXQgaHR0cDovL2xvY2FsaG9zdDo4MDgwL2FwaS9hdXRoL3N0YXRzJyk7XG4gICAgICBjb25zb2xlLmxvZygnXHVEODNEXHVERDBDIFdlYlNvY2tldCBhdmFpbGFibGUgYXQgd3M6Ly9sb2NhbGhvc3Q6ODA4MC93cycpO1xuICAgIH1cbiAgfTtcbn1cbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBNk0sU0FBUyxvQkFBb0I7QUFDMU8sT0FBTyxXQUFXO0FBQ2xCLE9BQU8sVUFBVTs7O0FDQVYsU0FBUyxZQUFZO0FBQUEsRUFFMUIsTUFBTSxXQUFXO0FBQUEsSUFDZixjQUFjO0FBQ1osV0FBSyxRQUFRLG9CQUFJLElBQUk7QUFDckIsV0FBSyxRQUFRLG9CQUFJLElBQUk7QUFDckIsV0FBSyxXQUFXLENBQUM7QUFDakIsV0FBSyxRQUFRLENBQUM7QUFFZCxXQUFLLFdBQVc7QUFDaEIsV0FBSyxpQkFBaUI7QUFBQSxJQUN4QjtBQUFBLElBRUEsYUFBYTtBQUVYLGVBQVMsSUFBSSxHQUFHLEtBQUssR0FBRyxLQUFLO0FBQzNCLGFBQUssTUFBTSxJQUFJLFFBQVEsQ0FBQyxFQUFFO0FBQUEsTUFDNUI7QUFHQSxlQUFTLElBQUksR0FBRyxLQUFLLEdBQUcsS0FBSztBQUMzQixhQUFLLE1BQU0sSUFBSSxRQUFRLENBQUMsRUFBRTtBQUFBLE1BQzVCO0FBR0EsZUFBUyxJQUFJLEdBQUcsSUFBSSxJQUFJLEtBQUs7QUFDM0IsYUFBSyxTQUFTLEtBQUs7QUFBQSxVQUNqQixJQUFJO0FBQUEsVUFDSixTQUFTLGdCQUFnQixJQUFJLENBQUM7QUFBQSxVQUM5QixXQUFXLEtBQUssSUFBSSxJQUFJLEtBQUssT0FBTyxJQUFJO0FBQUEsUUFDMUMsQ0FBQztBQUFBLE1BQ0g7QUFHQSxlQUFTLElBQUksR0FBRyxJQUFJLEdBQUcsS0FBSztBQUMxQixhQUFLLE1BQU0sS0FBSztBQUFBLFVBQ2QsSUFBSTtBQUFBLFVBQ0osTUFBTSxhQUFhLElBQUksQ0FBQztBQUFBLFVBQ3hCLFdBQVcsS0FBSyxJQUFJLElBQUksS0FBSyxPQUFPLElBQUk7QUFBQSxRQUMxQyxDQUFDO0FBQUEsTUFDSDtBQUFBLElBQ0Y7QUFBQSxJQUVBLG1CQUFtQjtBQUNqQixrQkFBWSxNQUFNO0FBRWhCLFlBQUksS0FBSyxPQUFPLElBQUksS0FBSztBQUN2QixnQkFBTSxZQUFZLFFBQVEsS0FBSyxJQUFJLElBQUksR0FBSztBQUM1QyxlQUFLLE1BQU0sSUFBSSxTQUFTO0FBRXhCLGNBQUksS0FBSyxNQUFNLE9BQU8sTUFBTSxLQUFLLE9BQU8sSUFBSSxLQUFLO0FBQy9DLGtCQUFNLGFBQWEsTUFBTSxLQUFLLEtBQUssS0FBSztBQUN4QyxrQkFBTSxlQUFlLFdBQVcsS0FBSyxNQUFNLEtBQUssT0FBTyxJQUFJLFdBQVcsTUFBTSxDQUFDO0FBQzdFLGlCQUFLLE1BQU0sT0FBTyxZQUFZO0FBQUEsVUFDaEM7QUFBQSxRQUNGO0FBR0EsWUFBSSxLQUFLLE9BQU8sSUFBSSxLQUFLO0FBQ3ZCLGVBQUssU0FBUyxLQUFLO0FBQUEsWUFDakIsSUFBSSxLQUFLLFNBQVM7QUFBQSxZQUNsQixTQUFTLGdCQUFnQixLQUFLLElBQUksQ0FBQztBQUFBLFlBQ25DLFdBQVcsS0FBSyxJQUFJO0FBQUEsVUFDdEIsQ0FBQztBQUVELGNBQUksS0FBSyxTQUFTLFNBQVMsS0FBSztBQUM5QixpQkFBSyxXQUFXLEtBQUssU0FBUyxNQUFNLEdBQUc7QUFBQSxVQUN6QztBQUFBLFFBQ0Y7QUFHQSxZQUFJLEtBQUssT0FBTyxJQUFJLEtBQUs7QUFDdkIsZUFBSyxNQUFNLEtBQUs7QUFBQSxZQUNkLElBQUksS0FBSyxNQUFNO0FBQUEsWUFDZixNQUFNLGFBQWEsS0FBSyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sT0FBTyxPQUFPLE9BQU8sS0FBSyxFQUFFLEtBQUssTUFBTSxLQUFLLE9BQU8sSUFBSSxDQUFDLENBQUMsQ0FBQztBQUFBLFlBQ25HLFdBQVcsS0FBSyxJQUFJO0FBQUEsVUFDdEIsQ0FBQztBQUVELGNBQUksS0FBSyxNQUFNLFNBQVMsSUFBSTtBQUMxQixpQkFBSyxRQUFRLEtBQUssTUFBTSxNQUFNLEdBQUc7QUFBQSxVQUNuQztBQUFBLFFBQ0Y7QUFHQSxZQUFJLEtBQUssT0FBTyxJQUFJLEtBQUs7QUFDdkIsY0FBSSxLQUFLLE1BQU0sT0FBTyxJQUFJO0FBQ3hCLGlCQUFLLE1BQU0sSUFBSSxRQUFRLEtBQUssSUFBSSxJQUFJLEdBQUksRUFBRTtBQUFBLFVBQzVDLFdBQVcsS0FBSyxNQUFNLE9BQU8sTUFBTSxLQUFLLE9BQU8sSUFBSSxLQUFLO0FBQ3RELGtCQUFNLGFBQWEsTUFBTSxLQUFLLEtBQUssS0FBSztBQUN4QyxrQkFBTSxlQUFlLFdBQVcsS0FBSyxNQUFNLEtBQUssT0FBTyxJQUFJLFdBQVcsTUFBTSxDQUFDO0FBQzdFLGlCQUFLLE1BQU0sT0FBTyxZQUFZO0FBQUEsVUFDaEM7QUFBQSxRQUNGO0FBQUEsTUFDRixHQUFHLElBQUk7QUFBQSxJQUNUO0FBQUEsSUFFQSxXQUFXO0FBQ1QsWUFBTSxNQUFNLEtBQUssSUFBSTtBQUNyQixZQUFNLFVBQVUsS0FBSyxLQUFLO0FBRTFCLFlBQU0saUJBQWlCLEtBQUssU0FBUyxPQUFPLFNBQVEsTUFBTSxJQUFJLFlBQWEsT0FBTztBQUNsRixZQUFNLGNBQWMsS0FBSyxNQUFNLE9BQU8sVUFBUyxNQUFNLEtBQUssWUFBYSxPQUFPO0FBRTlFLGFBQU87QUFBQSxRQUNMLGFBQWEsS0FBSyxNQUFNO0FBQUEsUUFDeEIsWUFBWSxLQUFLLE1BQU07QUFBQSxRQUN2QixjQUFjLGVBQWU7QUFBQSxRQUM3QixhQUFhLFlBQVk7QUFBQSxRQUN6QixhQUFhLEtBQUssTUFBTTtBQUFBLE1BQzFCO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFFQSxRQUFNLEtBQUssSUFBSSxXQUFXO0FBRTFCLFNBQU87QUFBQSxJQUNMLE1BQU07QUFBQSxJQUNOLGdCQUFnQixRQUFRO0FBRXRCLGFBQU8sWUFBWSxJQUFJLG1CQUFtQixDQUFDLEtBQUssS0FBSyxTQUFTO0FBQzVELFlBQUksSUFBSSxXQUFXLE9BQU87QUFDeEIsY0FBSTtBQUNGLGtCQUFNLFFBQVEsR0FBRyxTQUFTO0FBQzFCLG9CQUFRLElBQUksOENBQXVDLEtBQUs7QUFFeEQsZ0JBQUksVUFBVSxnQkFBZ0Isa0JBQWtCO0FBQ2hELGdCQUFJLFVBQVUsK0JBQStCLEdBQUc7QUFDaEQsZ0JBQUksSUFBSSxLQUFLLFVBQVU7QUFBQSxjQUNyQixTQUFTO0FBQUEsY0FDVCxPQUFPO0FBQUEsZ0JBQ0wsYUFBYSxNQUFNO0FBQUEsZ0JBQ25CLFlBQVksTUFBTTtBQUFBLGdCQUNsQixnQkFBZ0IsTUFBTTtBQUFBLGdCQUN0QixpQkFBaUI7QUFBQSxnQkFDakIsWUFBWSxNQUFNO0FBQUEsZ0JBQ2xCLGNBQWMsTUFBTTtBQUFBLGdCQUNwQixhQUFhLE1BQU07QUFBQSxnQkFDbkIsYUFBYSxNQUFNO0FBQUEsY0FDckI7QUFBQSxjQUNBLFlBQVcsb0JBQUksS0FBSyxHQUFFLFlBQVk7QUFBQSxjQUNsQyxVQUFVO0FBQUEsY0FDVixRQUFRO0FBQUEsWUFDVixDQUFDLENBQUM7QUFBQSxVQUNKLFNBQVMsT0FBTztBQUNkLG9CQUFRLE1BQU0sdUJBQWtCLEtBQUs7QUFDckMsZ0JBQUksYUFBYTtBQUNqQixnQkFBSSxJQUFJLEtBQUssVUFBVTtBQUFBLGNBQ3JCLFNBQVM7QUFBQSxjQUNULE9BQU87QUFBQSxZQUNULENBQUMsQ0FBQztBQUFBLFVBQ0o7QUFBQSxRQUNGLE9BQU87QUFDTCxlQUFLO0FBQUEsUUFDUDtBQUFBLE1BQ0YsQ0FBQztBQUdELGFBQU8sR0FBRyxPQUFPO0FBQUEsUUFDZixRQUFRLElBQUksTUFBTTtBQUNoQixjQUFJO0FBQ0Ysa0JBQU0sVUFBVSxLQUFLLE1BQU0sS0FBSyxTQUFTLENBQUM7QUFDMUMsb0JBQVEsSUFBSSx5Q0FBa0MsT0FBTztBQUVyRCxvQkFBUSxRQUFRLE1BQU07QUFBQSxjQUNwQixLQUFLO0FBQ0gsbUJBQUcsS0FBSyxLQUFLLFVBQVU7QUFBQSxrQkFDckIsTUFBTTtBQUFBLGtCQUNOLE1BQU0sRUFBRSxXQUFXLEtBQUssSUFBSSxFQUFFO0FBQUEsa0JBQzlCLFdBQVcsS0FBSyxJQUFJO0FBQUEsZ0JBQ3RCLENBQUMsQ0FBQztBQUNGO0FBQUEsY0FFRixLQUFLO0FBQ0gsc0JBQU0sUUFBUSxHQUFHLFNBQVM7QUFDMUIsbUJBQUcsS0FBSyxLQUFLLFVBQVU7QUFBQSxrQkFDckIsTUFBTTtBQUFBLGtCQUNOLE1BQU07QUFBQSxvQkFDSixhQUFhLE1BQU07QUFBQSxvQkFDbkIsWUFBWSxNQUFNO0FBQUEsb0JBQ2xCLGNBQWMsTUFBTTtBQUFBLG9CQUNwQixhQUFhLE1BQU07QUFBQSxvQkFDbkIsYUFBYSxNQUFNO0FBQUEsa0JBQ3JCO0FBQUEsa0JBQ0EsV0FBVyxLQUFLLElBQUk7QUFBQSxnQkFDdEIsQ0FBQyxDQUFDO0FBQ0Y7QUFBQSxjQUVGLEtBQUs7QUFFSCxtQkFBRyxLQUFLLEtBQUssVUFBVTtBQUFBLGtCQUNyQixNQUFNO0FBQUEsa0JBQ04sTUFBTTtBQUFBLG9CQUNKLFFBQVEsUUFBUSxLQUFLO0FBQUEsb0JBQ3JCLFFBQVE7QUFBQSxvQkFDUixTQUFTO0FBQUEsa0JBQ1g7QUFBQSxrQkFDQSxXQUFXLEtBQUssSUFBSTtBQUFBLGdCQUN0QixDQUFDLENBQUM7QUFDRjtBQUFBLFlBQ0o7QUFBQSxVQUNGLFNBQVMsT0FBTztBQUNkLG9CQUFRLE1BQU0sbUNBQThCLEtBQUs7QUFBQSxVQUNuRDtBQUFBLFFBQ0Y7QUFBQSxRQUVBLE1BQU0sSUFBSTtBQUNSLGtCQUFRLElBQUksdUNBQWdDO0FBQUEsUUFDOUM7QUFBQSxNQUNGLENBQUM7QUFHRCxrQkFBWSxNQUFNO0FBck54QjtBQXNOUSxjQUFNLFFBQVEsR0FBRyxTQUFTO0FBQzFCLGNBQU0sVUFBVSxLQUFLLFVBQVU7QUFBQSxVQUM3QixNQUFNO0FBQUEsVUFDTixNQUFNO0FBQUEsWUFDSixhQUFhLE1BQU07QUFBQSxZQUNuQixZQUFZLE1BQU07QUFBQSxZQUNsQixjQUFjLE1BQU07QUFBQSxZQUNwQixhQUFhLE1BQU07QUFBQSxZQUNuQixhQUFhLE1BQU07QUFBQSxVQUNyQjtBQUFBLFVBQ0EsV0FBVyxLQUFLLElBQUk7QUFBQSxRQUN0QixDQUFDO0FBR0QscUJBQU8sR0FBRyxZQUFWLG1CQUFtQixRQUFRLENBQUMsV0FBVztBQUNyQyxjQUFJLE9BQU8sZUFBZSxHQUFHO0FBQzNCLGdCQUFJO0FBQ0YscUJBQU8sS0FBSyxPQUFPO0FBQUEsWUFDckIsU0FBUyxPQUFPO0FBQ2Qsc0JBQVEsTUFBTSxtREFBOEMsS0FBSztBQUFBLFlBQ25FO0FBQUEsVUFDRjtBQUFBLFFBQ0Y7QUFBQSxNQUNGLEdBQUcsR0FBSTtBQUVQLGNBQVEsSUFBSSx1Q0FBZ0M7QUFDNUMsY0FBUSxJQUFJLG1FQUE0RDtBQUN4RSxjQUFRLElBQUkseURBQWtEO0FBQUEsSUFDaEU7QUFBQSxFQUNGO0FBQ0Y7OztBRHBQQSxJQUFNLG1DQUFtQztBQU16QyxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixRQUFRO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixNQUFNO0FBQUEsRUFDUjtBQUFBLEVBQ0EsU0FBUyxDQUFDLE1BQU0sR0FBRyxVQUFVLENBQUM7QUFBQSxFQUM5QixTQUFTO0FBQUEsSUFDUCxPQUFPO0FBQUEsTUFDTCxLQUFLLEtBQUssUUFBUSxrQ0FBVyxPQUFPO0FBQUEsSUFDdEM7QUFBQSxFQUNGO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
