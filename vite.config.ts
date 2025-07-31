import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    mode === "development" && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: "localhost",
    port: 5173,
    // Proxy API requests during development to the Express backend
    proxy: {
      "/api": {
        // Forward API calls directly to the Express backend
        target: "http://localhost:3000",
        changeOrigin: true,
        secure: false,
        // No rewrite here so "/api" is preserved when proxying requests
      },
    },
  },
}));
