import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Define allowed hosts for local development
  const allowedHosts: string[] | 'all' = [
    'localhost',
    '127.0.0.1',
    '::1',
  ];

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
      // Default HMR works for local development; no ngrok-specific config
      hmr: undefined,
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
