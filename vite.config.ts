import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 46048,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    // 代码分割优化
    rollupOptions: {
      output: {
        manualChunks: {
          // React核心库
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // D3可视化库
          'd3-vendor': ['d3'],
          // 代码高亮库
          'syntax-highlighter': ['react-syntax-highlighter'],
          // Lucide图标
          'icons': ['lucide-react'],
        },
      },
    },
    // chunk大小警告
    chunkSizeWarningLimit: 1000,
    // 压缩优化
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // 生产环境移除console
        drop_debugger: true,
      },
    },
  },
});
