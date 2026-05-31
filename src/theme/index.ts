// Copyright 2026, miuix-vue contributors
// SPDX-License-Identifier: Apache-2.0

import { computed, ref, watch, type ComputedRef } from 'vue'

/** The effective, resolved theme actually applied to the DOM. */
export type Theme = 'light' | 'dark'
/**
 * The user-facing colour-mode selection. `'system'` follows the OS
 * `prefers-color-scheme` live (miuix Color Mode: System / Light / Dark).
 */
export type ThemeMode = 'system' | 'light' | 'dark'

const DARK_CLASS = 'm-theme-dark'

function getSystemTheme(): Theme {
  if (typeof window === 'undefined' || !window.matchMedia) return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

// Live OS preference, kept in sync so `'system'` mode tracks the OS at runtime.
const systemTheme = ref<Theme>(getSystemTheme())
const mode = ref<ThemeMode>('system')

if (typeof window !== 'undefined' && window.matchMedia) {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    systemTheme.value = e.matches ? 'dark' : 'light'
  })
}

// Effective theme: an explicit override, or the live OS preference under 'system'.
const theme = computed<Theme>(() => (mode.value === 'system' ? systemTheme.value : mode.value))

// Reflect the effective theme onto <html> — the cascade + `.m-theme-dark` drives
// the token set. Module-level singleton watcher; immediate so the default 'system'
// mode applies the resolved OS theme on first import.
if (typeof document !== 'undefined') {
  watch(theme, (t) => document.documentElement.classList.toggle(DARK_CLASS, t === 'dark'), {
    immediate: true,
  })
}

/** Select the colour mode; `'system'` follows the OS preference live. */
export function setThemeMode(next: ThemeMode): void {
  mode.value = next
}

/** Pin an explicit light/dark theme (leaves `'system'` mode). */
export function setTheme(next: Theme): void {
  mode.value = next
}

export function useTheme(): {
  theme: ComputedRef<Theme>
  mode: ComputedRef<ThemeMode>
  setTheme: (t: Theme) => void
  setThemeMode: (m: ThemeMode) => void
} {
  return {
    theme: computed(() => theme.value),
    mode: computed(() => mode.value),
    setTheme,
    setThemeMode,
  }
}
