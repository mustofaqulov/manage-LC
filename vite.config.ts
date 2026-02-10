import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    __VITE_GEMINI_API_KEY__: JSON.stringify(process.env.VITE_GEMINI_API_KEY || ''),
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 4173,
  },
});
