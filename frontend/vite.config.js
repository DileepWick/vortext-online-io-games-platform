import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    logo: 'https://res.cloudinary.com/dhcawltsr/image/upload/v1724754847/photo_2024-08-25_16-32-06_zhbyw7.jpg', // Image in the public directory
  },
})

