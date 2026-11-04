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
        clinicalPilates: resolve(__dirname, 'clinical-pilates.html'),
        physiotherapy: resolve(__dirname, 'physiotherapy.html'),
        osteopathy: resolve(__dirname, 'osteopathy.html'),
        massageTherapy: resolve(__dirname, 'massage-therapy.html'),
        tmjMassage: resolve(__dirname, 'tmj-massage.html'),
        chiropody: resolve(__dirname, 'chiropody.html'),
        medicalPedicure: resolve(__dirname, 'medical-pedicure.html'),
        runningAnalysis: resolve(__dirname, 'running-analysis.html'),
        shockwaveTherapy: resolve(__dirname, 'shockwave-therapy.html'),
        dryNeedling: resolve(__dirname, 'dry-needling.html'),
        privacyTerms: resolve(__dirname, 'privacy-terms.html')
      }
    }
  }
});
