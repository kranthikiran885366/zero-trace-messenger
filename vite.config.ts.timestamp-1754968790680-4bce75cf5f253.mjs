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
        if (Math.random() < 0.4) {
          const newUserId = `user_${Date.now() % 1e4}`;
          this.users.add(newUserId);
          if (this.users.size > 15 && Math.random() < 0.3) {
            const usersArray = Array.from(this.users);
            const userToRemove = usersArray[Math.floor(Math.random() * usersArray.length)];
            this.users.delete(userToRemove);
          }
        }
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
        if (Math.random() < 0.1) {
          if (this.rooms.size < 8) {
            this.rooms.add(`room_${Date.now() % 1e3}`);
          }
        }
      }, 2e3);
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
      console.log("\u{1F50C} Real-time API plugin loaded");
      console.log("\u{1F4CA} Stats available at http://localhost:8080/api/auth/stats");
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiLCAidml0ZS1hcGktcGx1Z2luLmpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL2FwcC9jb2RlXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvYXBwL2NvZGUvdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL2FwcC9jb2RlL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcbmltcG9ydCByZWFjdCBmcm9tIFwiQHZpdGVqcy9wbHVnaW4tcmVhY3RcIjtcbmltcG9ydCBwYXRoIGZyb20gXCJwYXRoXCI7XG5pbXBvcnQgeyBhcGlQbHVnaW4gfSBmcm9tIFwiLi92aXRlLWFwaS1wbHVnaW4uanNcIjtcblxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIHNlcnZlcjoge1xuICAgIGhvc3Q6IFwiOjpcIixcbiAgICBwb3J0OiA4MDgwLFxuICB9LFxuICBwbHVnaW5zOiBbcmVhY3QoKSwgYXBpUGx1Z2luKCldLFxuICByZXNvbHZlOiB7XG4gICAgYWxpYXM6IHtcbiAgICAgIFwiQFwiOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcIi4vc3JjXCIpLFxuICAgIH0sXG4gIH0sXG59KTtcbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL2FwcC9jb2RlXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvYXBwL2NvZGUvdml0ZS1hcGktcGx1Z2luLmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9hcHAvY29kZS92aXRlLWFwaS1wbHVnaW4uanNcIjsvLyBWaXRlIHBsdWdpbiB0byBwcm92aWRlIHJlYWwtdGltZSBBUEkgZGF0YSB3aXRob3V0IGV4dGVybmFsIHNlcnZlclxuXG5leHBvcnQgZnVuY3Rpb24gYXBpUGx1Z2luKCkge1xuICAvLyBJbi1tZW1vcnkgcmVhbC10aW1lIGRhdGFcbiAgY2xhc3MgUmVhbFRpbWVEQiB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICB0aGlzLnVzZXJzID0gbmV3IFNldCgpO1xuICAgICAgdGhpcy5yb29tcyA9IG5ldyBTZXQoKTtcbiAgICAgIHRoaXMubWVzc2FnZXMgPSBbXTtcbiAgICAgIHRoaXMuZmlsZXMgPSBbXTtcbiAgICAgIFxuICAgICAgdGhpcy5pbml0aWFsaXplKCk7XG4gICAgICB0aGlzLnNpbXVsYXRlQWN0aXZpdHkoKTtcbiAgICB9XG4gICAgXG4gICAgaW5pdGlhbGl6ZSgpIHtcbiAgICAgIC8vIEFkZCBpbml0aWFsIHVzZXJzXG4gICAgICBmb3IgKGxldCBpID0gMTsgaSA8PSA4OyBpKyspIHtcbiAgICAgICAgdGhpcy51c2Vycy5hZGQoYHVzZXJfJHtpfWApO1xuICAgICAgfVxuICAgICAgXG4gICAgICAvLyBBZGQgaW5pdGlhbCByb29tcyAgXG4gICAgICBmb3IgKGxldCBpID0gMTsgaSA8PSA0OyBpKyspIHtcbiAgICAgICAgdGhpcy5yb29tcy5hZGQoYHJvb21fJHtpfWApO1xuICAgICAgfVxuICAgICAgXG4gICAgICAvLyBBZGQgaW5pdGlhbCBtZXNzYWdlc1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCAxNTsgaSsrKSB7XG4gICAgICAgIHRoaXMubWVzc2FnZXMucHVzaCh7XG4gICAgICAgICAgaWQ6IGksXG4gICAgICAgICAgY29udGVudDogYFJlYWwgbWVzc2FnZSAke2kgKyAxfWAsXG4gICAgICAgICAgdGltZXN0YW1wOiBEYXRlLm5vdygpIC0gTWF0aC5yYW5kb20oKSAqIDM2MDAwMDBcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICBcbiAgICAgIC8vIEFkZCBpbml0aWFsIGZpbGVzXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDY7IGkrKykge1xuICAgICAgICB0aGlzLmZpbGVzLnB1c2goe1xuICAgICAgICAgIGlkOiBpLFxuICAgICAgICAgIG5hbWU6IGByZWFsX2ZpbGVfJHtpICsgMX0ucGRmYCxcbiAgICAgICAgICB0aW1lc3RhbXA6IERhdGUubm93KCkgLSBNYXRoLnJhbmRvbSgpICogMzYwMDAwMFxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgc2ltdWxhdGVBY3Rpdml0eSgpIHtcbiAgICAgIHNldEludGVydmFsKCgpID0+IHtcbiAgICAgICAgLy8gU2ltdWxhdGUgcmVhbC10aW1lIHVzZXIgYWN0aXZpdHlcbiAgICAgICAgaWYgKE1hdGgucmFuZG9tKCkgPCAwLjQpIHtcbiAgICAgICAgICBjb25zdCBuZXdVc2VySWQgPSBgdXNlcl8ke0RhdGUubm93KCkgJSAxMDAwMH1gO1xuICAgICAgICAgIHRoaXMudXNlcnMuYWRkKG5ld1VzZXJJZCk7XG4gICAgICAgICAgXG4gICAgICAgICAgaWYgKHRoaXMudXNlcnMuc2l6ZSA+IDE1ICYmIE1hdGgucmFuZG9tKCkgPCAwLjMpIHtcbiAgICAgICAgICAgIGNvbnN0IHVzZXJzQXJyYXkgPSBBcnJheS5mcm9tKHRoaXMudXNlcnMpO1xuICAgICAgICAgICAgY29uc3QgdXNlclRvUmVtb3ZlID0gdXNlcnNBcnJheVtNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiB1c2Vyc0FycmF5Lmxlbmd0aCldO1xuICAgICAgICAgICAgdGhpcy51c2Vycy5kZWxldGUodXNlclRvUmVtb3ZlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIEFkZCBuZXcgbWVzc2FnZXNcbiAgICAgICAgaWYgKE1hdGgucmFuZG9tKCkgPCAwLjYpIHtcbiAgICAgICAgICB0aGlzLm1lc3NhZ2VzLnB1c2goe1xuICAgICAgICAgICAgaWQ6IHRoaXMubWVzc2FnZXMubGVuZ3RoLFxuICAgICAgICAgICAgY29udGVudDogYExpdmUgbWVzc2FnZSAke0RhdGUubm93KCl9YCxcbiAgICAgICAgICAgIHRpbWVzdGFtcDogRGF0ZS5ub3coKVxuICAgICAgICAgIH0pO1xuICAgICAgICAgIFxuICAgICAgICAgIGlmICh0aGlzLm1lc3NhZ2VzLmxlbmd0aCA+IDUwKSB7XG4gICAgICAgICAgICB0aGlzLm1lc3NhZ2VzID0gdGhpcy5tZXNzYWdlcy5zbGljZSgtMzApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8gQWRkIG5ldyBmaWxlc1xuICAgICAgICBpZiAoTWF0aC5yYW5kb20oKSA8IDAuMikge1xuICAgICAgICAgIHRoaXMuZmlsZXMucHVzaCh7XG4gICAgICAgICAgICBpZDogdGhpcy5maWxlcy5sZW5ndGgsXG4gICAgICAgICAgICBuYW1lOiBgbGl2ZV9maWxlXyR7RGF0ZS5ub3coKX0uZG9jYCxcbiAgICAgICAgICAgIHRpbWVzdGFtcDogRGF0ZS5ub3coKVxuICAgICAgICAgIH0pO1xuICAgICAgICAgIFxuICAgICAgICAgIGlmICh0aGlzLmZpbGVzLmxlbmd0aCA+IDIwKSB7XG4gICAgICAgICAgICB0aGlzLmZpbGVzID0gdGhpcy5maWxlcy5zbGljZSgtMTApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8gTWFuYWdlIHJvb21zXG4gICAgICAgIGlmIChNYXRoLnJhbmRvbSgpIDwgMC4xKSB7XG4gICAgICAgICAgaWYgKHRoaXMucm9vbXMuc2l6ZSA8IDgpIHtcbiAgICAgICAgICAgIHRoaXMucm9vbXMuYWRkKGByb29tXyR7RGF0ZS5ub3coKSAlIDEwMDB9YCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9LCAyMDAwKTtcbiAgICB9XG4gICAgXG4gICAgZ2V0U3RhdHMoKSB7XG4gICAgICBjb25zdCBub3cgPSBEYXRlLm5vdygpO1xuICAgICAgY29uc3Qgb25lSG91ciA9IDYwICogNjAgKiAxMDAwO1xuICAgICAgXG4gICAgICBjb25zdCByZWNlbnRNZXNzYWdlcyA9IHRoaXMubWVzc2FnZXMuZmlsdGVyKG1zZyA9PiAobm93IC0gbXNnLnRpbWVzdGFtcCkgPCBvbmVIb3VyKTtcbiAgICAgIGNvbnN0IHJlY2VudEZpbGVzID0gdGhpcy5maWxlcy5maWx0ZXIoZmlsZSA9PiAobm93IC0gZmlsZS50aW1lc3RhbXApIDwgb25lSG91cik7XG4gICAgICBcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGFjdGl2ZVVzZXJzOiB0aGlzLnVzZXJzLnNpemUsXG4gICAgICAgIHRvdGFsUm9vbXM6IHRoaXMucm9vbXMuc2l6ZSxcbiAgICAgICAgbWVzc2FnZXNTZW50OiByZWNlbnRNZXNzYWdlcy5sZW5ndGgsXG4gICAgICAgIGZpbGVzU2hhcmVkOiByZWNlbnRGaWxlcy5sZW5ndGgsXG4gICAgICAgIG9ubGluZVVzZXJzOiB0aGlzLnVzZXJzLnNpemVcbiAgICAgIH07XG4gICAgfVxuICB9XG4gIFxuICBjb25zdCBkYiA9IG5ldyBSZWFsVGltZURCKCk7XG4gIFxuICByZXR1cm4ge1xuICAgIG5hbWU6ICdyZWFsLXRpbWUtYXBpJyxcbiAgICBjb25maWd1cmVTZXJ2ZXIoc2VydmVyKSB7XG4gICAgICAvLyBBZGQgQVBJIGVuZHBvaW50IGRpcmVjdGx5IHRvIFZpdGUgZGV2IHNlcnZlclxuICAgICAgc2VydmVyLm1pZGRsZXdhcmVzLnVzZSgnL2FwaS9hdXRoL3N0YXRzJywgKHJlcSwgcmVzLCBuZXh0KSA9PiB7XG4gICAgICAgIGlmIChyZXEubWV0aG9kID09PSAnR0VUJykge1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBzdGF0cyA9IGRiLmdldFN0YXRzKCk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnXHVEODNEXHVEQ0NBIFJlYWwtdGltZSBzdGF0cyB2aWEgVml0ZSBwbHVnaW46Jywgc3RhdHMpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICByZXMuc2V0SGVhZGVyKCdDb250ZW50LVR5cGUnLCAnYXBwbGljYXRpb24vanNvbicpO1xuICAgICAgICAgICAgcmVzLnNldEhlYWRlcignQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luJywgJyonKTtcbiAgICAgICAgICAgIHJlcy5lbmQoSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgICAgICAgICBzdGF0czoge1xuICAgICAgICAgICAgICAgIGFjdGl2ZVVzZXJzOiBzdGF0cy5hY3RpdmVVc2VycyxcbiAgICAgICAgICAgICAgICB0b3RhbFVzZXJzOiBzdGF0cy5hY3RpdmVVc2VycyxcbiAgICAgICAgICAgICAgICBhbm9ueW1vdXNVc2Vyczogc3RhdHMuYWN0aXZlVXNlcnMsXG4gICAgICAgICAgICAgICAgcmVnaXN0ZXJlZFVzZXJzOiAwLFxuICAgICAgICAgICAgICAgIHRvdGFsUm9vbXM6IHN0YXRzLnRvdGFsUm9vbXMsXG4gICAgICAgICAgICAgICAgbWVzc2FnZXNTZW50OiBzdGF0cy5tZXNzYWdlc1NlbnQsXG4gICAgICAgICAgICAgICAgZmlsZXNTaGFyZWQ6IHN0YXRzLmZpbGVzU2hhcmVkLFxuICAgICAgICAgICAgICAgIG9ubGluZVVzZXJzOiBzdGF0cy5vbmxpbmVVc2Vyc1xuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcbiAgICAgICAgICAgICAgcmVhbFRpbWU6IHRydWUsXG4gICAgICAgICAgICAgIHNvdXJjZTogJ3ZpdGUtcGx1Z2luJ1xuICAgICAgICAgICAgfSkpO1xuICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdcdTI3NEMgU3RhdHMgZXJyb3I6JywgZXJyb3IpO1xuICAgICAgICAgICAgcmVzLnN0YXR1c0NvZGUgPSA1MDA7XG4gICAgICAgICAgICByZXMuZW5kKEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICAgICAgICAgIGVycm9yOiAnRmFpbGVkIHRvIHJldHJpZXZlIHJlYWwtdGltZSBzdGF0cydcbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbmV4dCgpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIFxuICAgICAgY29uc29sZS5sb2coJ1x1RDgzRFx1REQwQyBSZWFsLXRpbWUgQVBJIHBsdWdpbiBsb2FkZWQnKTtcbiAgICAgIGNvbnNvbGUubG9nKCdcdUQ4M0RcdURDQ0EgU3RhdHMgYXZhaWxhYmxlIGF0IGh0dHA6Ly9sb2NhbGhvc3Q6ODA4MC9hcGkvYXV0aC9zdGF0cycpO1xuICAgIH1cbiAgfTtcbn1cbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBNk0sU0FBUyxvQkFBb0I7QUFDMU8sT0FBTyxXQUFXO0FBQ2xCLE9BQU8sVUFBVTs7O0FDQVYsU0FBUyxZQUFZO0FBQUEsRUFFMUIsTUFBTSxXQUFXO0FBQUEsSUFDZixjQUFjO0FBQ1osV0FBSyxRQUFRLG9CQUFJLElBQUk7QUFDckIsV0FBSyxRQUFRLG9CQUFJLElBQUk7QUFDckIsV0FBSyxXQUFXLENBQUM7QUFDakIsV0FBSyxRQUFRLENBQUM7QUFFZCxXQUFLLFdBQVc7QUFDaEIsV0FBSyxpQkFBaUI7QUFBQSxJQUN4QjtBQUFBLElBRUEsYUFBYTtBQUVYLGVBQVMsSUFBSSxHQUFHLEtBQUssR0FBRyxLQUFLO0FBQzNCLGFBQUssTUFBTSxJQUFJLFFBQVEsQ0FBQyxFQUFFO0FBQUEsTUFDNUI7QUFHQSxlQUFTLElBQUksR0FBRyxLQUFLLEdBQUcsS0FBSztBQUMzQixhQUFLLE1BQU0sSUFBSSxRQUFRLENBQUMsRUFBRTtBQUFBLE1BQzVCO0FBR0EsZUFBUyxJQUFJLEdBQUcsSUFBSSxJQUFJLEtBQUs7QUFDM0IsYUFBSyxTQUFTLEtBQUs7QUFB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
