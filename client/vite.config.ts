import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  // Load environment variables
  const env = loadEnv(mode, process.cwd(), '');
  console.log('NGROK_HOST from env:', env.NGROK_HOST);

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
      host: true,
      port: 5173,
      allowedHosts,
      proxy: {
        '/api': {
          target: 'http://localhost:8000',
          changeOrigin: true,
          secure: false
        }
      },
      hmr: env.NGROK_HOST ? {
        protocol: 'wss',
        host: env.NGROK_HOST,
        clientPort: 443,
      } : undefined,
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      // Do not externalize app dependencies used in the browser unless you provide them at runtime.
      // Remove incorrect 'external' settings that could break imports like react-markdown.
      rollupOptions: {},
      // Reduce production bundle size by removing debug statements
      minify: 'esbuild',
      target: 'es2020',
    }
  };
});
