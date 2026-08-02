import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      // Надёжно отслеживаем изменения файлов в Windows и виртуальных FS.
      usePolling: true,
      interval: 100,
    },
  },
});
