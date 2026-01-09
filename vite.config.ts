import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // API KEYni shu yerda saqlash xavfsiz emas, lekin vaqtinchalik ishlatish uchun:
    'process.env.GEMINI_API_KEY': JSON.stringify('AIzaSyDIxqm-fpuHi7GVhJY4i6-HSHpvvrbeGqw'),
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
});
