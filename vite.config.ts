import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import path from "path"

const TASKS_API_URL = "https://api.carvia-test.org/poc-office365-service"
const MEDIA_API_URL = "https://api.carvia-test.org/tackit-service"
const DEV_PORT = 5173

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: DEV_PORT,
    strictPort: true,
    proxy: {
      "/api": {
        target: TASKS_API_URL,
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
      "/media-api": {
        target: MEDIA_API_URL,
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/media-api/, ""),
      },
    },
  },
  preview: {
    port: DEV_PORT,
    strictPort: true,
  },
})


// import { defineConfig } from "vite"
// import react from "@vitejs/plugin-react"
// import tailwindcss from "@tailwindcss/vite"
// import path from "path"

// const TASKS_API_URL = "https://api.carvia-test.org/poc-office365-service"
// const MEDIA_API_URL = "https://api.carvia-test.org/tackit-service"
// const DEV_PORT = 5173
// export default defineConfig({
//   plugins: [react(), tailwindcss()],
//   resolve: {
//     alias: {
//       "@": path.resolve(__dirname, "./src"),
//     },
//   },
//   server: {
//     port: 5173,
//   },
// })

