import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

import { buildDefines } from './vite.meta'

// Builds the example app (index.html → example/main.ts) into a static site for
// GitHub Pages (see .github/workflows/deploy-pages.yml). Unlike vite.config.ts
// this is a plain app build: Vue + the library source are bundled in (nothing
// externalized) and there is no dts / lib output.
//
// `base` must match the project subpath the site is served from:
// https://yukonga.github.io/miuix-vue/ → '/miuix-vue/'. (For a user/org page or
// a custom domain it would be '/'.) Override at build time with `--base=/foo/`.
export default defineConfig({
  base: '/miuix-vue/',
  define: buildDefines(),
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    // Kept separate from the library's `dist/` so the two builds never clobber.
    outDir: 'dist-example',
    emptyOutDir: true,
  },
})
