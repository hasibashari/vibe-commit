import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import {defineConfig, loadEnv} from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  
  let firebaseConfig = {};
  try {
    const configPath = path.resolve(__dirname, 'firebase-applet-config.json');
    if (fs.existsSync(configPath)) {
      firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    }
  } catch (e) {
    console.warn('Could not load firebase-applet-config.json:', e);
  }

  return {
    publicDir: 'frontend/public',
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        manifest: {
          name: 'Vibe Commit',
          short_name: 'Vibe Commit',
          description: 'A gamified habit tracker and RPG to-do list.',
          theme_color: '#0f172a',
          background_color: '#0f172a',
          display: 'standalone',
          icons: [
            {
              src: 'icon-192.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: 'icon-512.png',
              sizes: '512x512',
              type: 'image/png'
            }
          ]
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,mp3,wav}'],
          maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
        }
      })
    ],
    define: {
      'import.meta.env.VITE_FIREBASE_CONFIG': JSON.stringify(firebaseConfig),
      'import.meta.env.VITE_USE_FIREBASE_EMULATOR': JSON.stringify(env.VITE_USE_FIREBASE_EMULATOR || 'false'),
      'import.meta.env.VITE_FIREBASE_AUTH_EMULATOR_HOST': JSON.stringify(env.VITE_FIREBASE_AUTH_EMULATOR_HOST || 'localhost:9099'),
      'import.meta.env.VITE_FIREBASE_FIRESTORE_EMULATOR_HOST': JSON.stringify(env.VITE_FIREBASE_FIRESTORE_EMULATOR_HOST || 'localhost:8080'),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
