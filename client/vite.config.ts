import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load environment variables
  const env = loadEnv(mode, process.cwd(), '');

  // Define allowed hosts
  const allowedHosts: string[] | 'all' = [
    'localhost',
    '127.0.0.1',
    '::1',
    ...(env.NGROK_HOST ? [env.NGROK_HOST] : [])
  ];

  // HMR configuration for ngrok
  const hmr = env.NGROK_HOST
    ? {
        protocol: 'wss',
        clientPort: 443,
        clientUrl: `https://${env.NGROK_HOST}`
      }
    : undefined;

  return {
    plugins: [react()],
    server: {
      host: true, // Listen on all interfaces
      port: 5173,
      allowedHosts, // Allow the specified hosts
      proxy: {
        '/api': {
          target: 'http://127.0.0.1:8000',
          changeOrigin: true,
          secure: false
        }
      },
      hmr // Hot Module Replacement settings
    }
  };
});