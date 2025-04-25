import { defineConfig } from 'vite';
import shopify from 'vite-plugin-shopify';
import tailwindcss from '@tailwindcss/vite';

/* export default defineConfig({
  plugins: [tailwindcss()],
}); */

export default defineConfig({
  plugins: [
    shopify({
      // Root path to your Shopify theme directory (location of snippets, sections, templates, etc.)
      themeRoot: './',
      // Front-end source code directory
      sourceCodeDir: 'frontend',
      // Front-end entry points directory
      entrypointsDir: 'frontend/entrypoints',
      // Additional files to use as entry points (accepts an array of file paths or glob patterns)
      additionalEntrypoints: [],
      // Specifies the file name of the snippet that loads your assets
      snippetFile: 'vite-tag.liquid',
      // Specifies whether to append version numbers to your production-ready asset URLs in `snippetFile`
      versionNumbers: false,
      // Enables the creation of Cloudflare tunnels during dev, allowing previews from any device
      tunnel: false,
      // Specifies whether to use the @shopify/theme-hot-reload script to enable hot reloading for the theme
      themeHotReload: true,
    }),
    tailwindcss(),
  ],
});
