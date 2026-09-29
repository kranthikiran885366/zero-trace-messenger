import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { apiPlugin } from "./vite-api-plugin.js";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), apiPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
