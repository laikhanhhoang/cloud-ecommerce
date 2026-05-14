import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const rootDir = dirname(fileURLToPath(import.meta.url));
  const env = loadEnv(mode, rootDir, '');
  const backendUrl = env.VITE_BACKEND_URL;

  return {
    plugins: [react()],
    server: backendUrl
      ? {
          proxy: {
            '/api': {
              target: backendUrl,
              changeOrigin: true,
              secure: false,
            },
          },
        }
      : undefined,
  };
});
