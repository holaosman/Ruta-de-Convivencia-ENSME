import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['ensme-512.png'],
      manifest: {
        name: 'Ruta de Convivencia ENSME',
        short_name: 'Convivencia ENSME',
        description: 'Orientación preliminar basada en el Manual de Convivencia de la ENSME.',
        theme_color: '#0f3f86',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        orientation: 'portrait-primary',
        icons: [
          { src: '/ensme-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/ensme-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
        ]
      },
      workbox: {
        navigateFallback: '/index.html',
        runtimeCaching: [{
          urlPattern: ({ url }) => url.pathname.startsWith('/api/'),
          handler: 'NetworkOnly'
        }]
      }
    })
  ]
});
