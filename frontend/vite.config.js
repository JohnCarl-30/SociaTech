import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) {
            return;
          }

          if (id.includes("firebase")) {
            return "firebase";
          }

          if (id.includes("framer-motion")) {
            return "motion";
          }

          if (
            id.includes("react-router-dom") ||
            id.includes("/react/") ||
            id.includes("react-dom")
          ) {
            return "react-vendor";
          }

          if (
            id.includes("lucide-react") ||
            id.includes("react-toastify") ||
            id.includes("react-hot-toast") ||
            id.includes("sonner")
          ) {
            return "ui";
          }
        },
      },
    },
  },
})
