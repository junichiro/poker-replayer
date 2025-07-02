import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['poker-hand-replay'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          poker: ['poker-hand-replay'],
        },
      },
    },
  },
  server: {
    port: 3001,
    open: true,
  },
});
