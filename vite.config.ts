import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './client/src'),
      '@shared': path.resolve(__dirname, './shared'),
      '@assets': path.resolve(__dirname, './attached_assets'),
    },
  },
  server: {
    // Replit preview URLs use changing subdomains under replit.dev.
    // The leading dot allows the preview host and its subdomains without
    // permitting arbitrary hosts.
    allowedHosts: ['.replit.dev'],
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
