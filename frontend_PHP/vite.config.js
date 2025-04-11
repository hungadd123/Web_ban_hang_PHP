import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path' // <--- Thêm dòng này để import module path

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: { port: 5173 }, // <-- Giữ lại cấu hình server của bạn
  resolve: { // <--- Thêm khối này
    alias: {
      // Định nghĩa alias '@' trỏ đến thư mục 'src'
      "@": path.resolve(__dirname, "./src"), 
    },
  },
})