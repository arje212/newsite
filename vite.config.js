import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': path.resolve(process.cwd(), './src') } },
  server: {
    host: '0.0.0.0',
    proxy: { '/api': 'http://localhost:3001', '/uploads': 'http://localhost:3001' },
  },
});
