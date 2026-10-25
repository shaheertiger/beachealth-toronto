import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  server: {
    port: 3000,
    open: false
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        notFound: resolve(__dirname, '404.html'),
        chiropractic: resolve(__dirname, 'chiropractic.html'),
        clinicalPilates: resolve(__dirname, 'clinical-pilates.html')
      }
    }
  }
});
