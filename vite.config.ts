import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react-router-dom')) return 'router';
            if (id.includes('react')) return 'react';
            if (id.includes('@tanstack/react-query')) return 'react-query';
            if (id.includes('date-fns')) return 'date-fns';
            if (id.includes('axios')) return 'axios';
            if (id.includes('jspdf')) return 'jspdf';
            if (id.includes('html2canvas')) return 'html2canvas';
            if (id.includes('lucide-react')) return 'lucide';
            return 'vendor';
          }
        }
      }
    }
  },
  preview: {
    port: 4173,
    host: '0.0.0.0'
  },
  server: {
    port: 5173,
    host: '0.0.0.0'
  }
});
