import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const isGithubActions = process.env.GITHUB_ACTIONS === 'true';

export default defineConfig({
  base: isGithubActions ? '/redis-intset-animation/' : '/',
  plugins: [react()],
  server: {
    port: 56954,
    open: false,
    hmr: {
      overlay: true,
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'd3-vendor': ['d3'],
          'syntax-highlighter': ['react-syntax-highlighter'],
          icons: ['lucide-react'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
});
