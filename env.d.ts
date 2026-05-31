/// <reference types="vite/client" />

declare module '*.scss'
declare module '*.css'

// Build-time constants injected by Vite `define` (see vite.config.ts).
declare const __APP_VERSION__: string
declare const __GIT_HASH__: string
