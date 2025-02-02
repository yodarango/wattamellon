import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    proxy: {
      "/api": {
        target: "http://wattamellon_api:3000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
