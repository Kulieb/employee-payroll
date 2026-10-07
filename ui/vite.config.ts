import path from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const icons = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  'node_modules/@mui/icons-material',
);

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      {
        find: /^@mui\/icons-material\/(.+)$/,
        replacement: `${icons}/$1.mjs`,
      },
    ],
  },
  server: {
    port: 3001,
  },
});
