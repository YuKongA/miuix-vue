import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import dts from 'vite-plugin-dts'

// https://vite.dev/config/
export default defineConfig({
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
      entry: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
      name: 'MiuixVue',
      fileName: 'miuix-vue',
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: ['vue', 'motion-v'],
      output: {
        globals: {
          vue: 'Vue',
          'motion-v': 'MotionV',
        },
      },
    },
  },
})
