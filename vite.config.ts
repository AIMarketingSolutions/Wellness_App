import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  // Explicitly define environment variables that should be available
  define: {
    // Ensure environment variables are properly handled
    'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(process.env.VITE_SUPABASE_URL),
    'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(process.env.VITE_SUPABASE_ANON_KEY),
  },
  // Build configuration for production
  build: {
    // Ensure proper handling of environment variables in build
    rollupOptions: {
      output: {
        // Prevent environment variables from being bundled incorrectly
        manualChunks: undefined,
      },
    },
  },
});
