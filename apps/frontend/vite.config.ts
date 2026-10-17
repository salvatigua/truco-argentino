import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'node:url';

const frontendDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@truco/shared': path.resolve(frontendDir, '../../packages/shared/index.ts'),
    },
  },
  server: {
    port: 5173,
    host: true,
  },
});