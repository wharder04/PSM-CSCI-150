import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Show detailed error overlay in browser
    hmr: {
      overlay: true,
    },
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
        // Cookies will be forwarded automatically
      },
    },
  },
  build: {
    // Show detailed build errors
    minify: false, // Set to true for production
    sourcemap: true, // Enable source maps for better error tracking
  },
  // Log all errors to console
  logLevel: "info",
});
