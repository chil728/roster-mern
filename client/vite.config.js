import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  base: "/roster",
  plugins: [react()],
  server: {
    proxy: {
      "/auth": "http://127.0.0.1:5000",
      "/rosters": "http://127.0.0.1:5000",
      "/types": "http://127.0.0.1:5000",
      "/users": "http://127.0.0.1:5000",
    },
  },
});
