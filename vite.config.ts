import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    // Keep the development URL predictable for local use.
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
    watch: {
      // Надёжно отслеживаем изменения файлов в Windows и виртуальных FS.
      usePolling: true,
      interval: 100,
    },
  },
});
