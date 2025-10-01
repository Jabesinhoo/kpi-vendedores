import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: true, // permite acceder desde cualquier IP/host
    allowedHosts: [
      '.ngrok-free.dev', // todas las URLs ngrok tipo xxx.ngrok-free.dev
      '.ngrok-free.app'  // por si la URL cae en dominio ngrok-free.app
    ]
  },
});
