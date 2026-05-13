// Copyright 2026, miuix-vue contributors
// SPDX-License-Identifier: Apache-2.0

import { computed, ref, type ComputedRef } from 'vue'

export type Theme = 'light' | 'dark'

const DARK_CLASS = 'm-theme-dark'

const themeRef = ref<Theme>('light')

export function setTheme(theme: Theme): void {
  themeRef.value = theme
  if (typeof document !== 'undefined') {
    document.documentElement.classList.toggle(DARK_CLASS, theme === 'dark')
  }
}

export function useTheme(): {
  theme: ComputedRef<Theme>
  setTheme: (t: Theme) => void
} {
  return {
    theme: computed(() => themeRef.value),
    setTheme,
  }
}
