// frontend/vite.config.js
// ./vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        // Use IPv4 loopback to avoid Windows localhost->IPv6 (::1) ECONNREFUSED issues
        target: "http://127.0.0.1:5000",
        changeOrigin: true,
      },
    },
  },
});
