import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Detect CI environment (GitHub Actions, Vercel, Netlify, etc.)
const isCI = process.env.CI === 'true' || process.env.VERCEL || process.env.NETLIFY;

export default defineConfig(async () => {
  const plugins = [react()];

  // Only load imagemin in local development to avoid CI build issues
  // Images are pre-optimized, so this is optional
  if (!isCI) {
    try {
      const viteImagemin = (await import('vite-plugin-imagemin')).default;
      plugins.push(
        viteImagemin({
          gifsicle: {
            optimizationLevel: 7,
            interlaced: false,
          },
          optipng: {
            optimizationLevel: 7,
          },
          mozjpeg: {
            quality: 80,
          },
          pngquant: {
            quality: [0.8, 0.9],
            speed: 4,
          },
          svgo: {
            plugins: [
              {
                name: 'removeViewBox',
                active: false,
              },
              {
                name: 'removeEmptyAttrs',
                active: true,
              },
            ],
          },
          webp: {
            quality: 85,
          },
        }),
      );
    } catch (e) {
      console.log('⚠️  vite-plugin-imagemin not available, skipping image optimization');
    }
  }

  return {
    plugins,
    define: {
      __VITE_GEMINI_API_KEY__: JSON.stringify(process.env.VITE_GEMINI_API_KEY || ''),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    optimizeDeps: {
      include: ['lamejs'],
    },
    server: {
      port: 4173,
    },
  };
});
