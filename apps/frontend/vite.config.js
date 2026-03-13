import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const backendUrl = (env.VITE_BACKEND_URL || env.BACKEND_URL || '').trim().replace(/\/+$/, '');
  const proxy = backendUrl
    ? {
        '/api': {
          target: backendUrl,
          changeOrigin: true
        }
      }
    : undefined;

  return {
    plugins: [react()],
    envPrefix: ['VITE_', 'BACKEND_', 'FRONTEND_'],
    server: {
      port: 5173,
      proxy
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src')
      }
    }
  };
});
