import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import dts from 'vite-plugin-dts'

import { buildDefines } from './vite.meta'

// https://vite.dev/config/
export default defineConfig({
  define: buildDefines(),
  plugins: [
    vue(),
    vueDevTools(),
    dts({
      include: ['src/**/*'],
      exclude: ['src/**/__tests__/*', '**/*.spec.ts'],
      outDirs: 'dist',
      entryRoot: 'src',
      tsconfigPath: './tsconfig.app.json',
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    sourcemap: true,
    copyPublicDir: false,
    lib: {
      entry: {
        'miuix-vue': fileURLToPath(new URL('./src/index.ts', import.meta.url)),
        icons: fileURLToPath(new URL('./src/icons/extended/index.ts', import.meta.url)),
      },
      fileName: (format, entryName) => `${entryName}.${format === 'es' ? 'js' : 'cjs'}`,
      formats: ['es', 'cjs'],
    },
    rolldownOptions: {
      external: ['vue', 'motion-v'],
    },
  },
})
