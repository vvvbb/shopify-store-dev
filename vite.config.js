import { defineConfig } from 'vite';
import shopify from 'vite-plugin-shopify';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  build: {
    emptyOutDir: false,
    cssMinify: true,
    manifest: 'manifest.json',
    rollupOptions: {
      output: {
        entryFileNames: '[name].[hash].min.js',
        chunkFileNames: '[name].[hash].min.js',
        assetFileNames: '[name].[hash].min[extname]',
      },
    },
  },
  plugins: [
    shopify({
      themeRoot: './',
      sourceCodeDir: 'frontend',
      entrypointsDir: 'frontend/entrypoints',
      additionalEntrypoints: [],
      snippetFile: 'vite-tag.liquid',
      versionNumbers: false,
      tunnel: false,
      themeHotReload: true,
    }),
    tailwindcss(),
  ],
});
