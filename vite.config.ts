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
      // Core + a separate entry for the extended icon pack, so the 155×5 icon
      // data is opt-in (`miuix-vue/icons`) and never bloats the core bundle.
      entry: {
        'miuix-vue': fileURLToPath(new URL('./src/index.ts', import.meta.url)),
        icons: fileURLToPath(new URL('./src/icons/extended/index.ts', import.meta.url)),
      },
      name: 'MiuixVue',
      fileName: (format, entryName) => `${entryName}.${format === 'es' ? 'js' : 'cjs'}`,
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
