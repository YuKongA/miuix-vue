// Copyright 2026, miuix-vue contributors
// SPDX-License-Identifier: Apache-2.0
//
// Ported from miuix-ui/.../basic/Snackbar.kt (SnackbarHostState).
//
// Vue-idiomatic replacement for SnackbarHostState: a module-level reactive
// queue + imperative showSnackbar(). Newest snackbar is prepended (the host
// renders bottom-up). Durations match the source: Short 4000ms, Long 10000ms,
// Indefinite = no auto-dismiss.

import { reactive } from 'vue'

export type SnackbarDuration = 'short' | 'long' | 'indefinite' | number
export type SnackbarResult = 'dismissed' | 'action'

export interface SnackbarOptions {
  message: string
  actionLabel?: string
  withDismissAction?: boolean
  duration?: SnackbarDuration
}

export interface SnackbarEntry {
  id: number
  message: string
  actionLabel?: string
  withDismissAction: boolean
  duration: SnackbarDuration
  visible: boolean
  resolve: (result: SnackbarResult) => void
  timer: ReturnType<typeof setTimeout> | null
}

interface SnackbarStore {
  entries: SnackbarEntry[]
}

export const snackbarStore: SnackbarStore = reactive({ entries: [] })

let idCounter = 0

function durationToMillis(d: SnackbarDuration, hasAction: boolean): number {
  if (typeof d === 'number') return d
  switch (d) {
    case 'long':
      return 10000
    case 'indefinite':
      return Number.POSITIVE_INFINITY
    case 'short':
    default:
      return hasAction ? 4000 : 4000
  }
}

function resolveEntry(entry: SnackbarEntry, result: SnackbarResult): void {
  if (!entry.visible) return
  entry.visible = false
  if (entry.timer) clearTimeout(entry.timer)
  entry.timer = null
  entry.resolve(result)
  // Drop from the queue after the exit animation has run (AnimatePresence keeps
  // the node mounted while it animates out once it leaves the visible list).
  setTimeout(() => removeSnackbar(entry.id), 300)
}

/** Mark an entry dismissed (host calls this from swipe / dismiss icon / action). */
export function dismissSnackbar(id: number, result: SnackbarResult = 'dismissed'): void {
  const entry = snackbarStore.entries.find((e) => e.id === id)
  if (entry) resolveEntry(entry, result)
}

/** Remove an entry from the queue once its exit animation has finished. */
export function removeSnackbar(id: number): void {
  const idx = snackbarStore.entries.findIndex((e) => e.id === id)
  if (idx !== -1) snackbarStore.entries.splice(idx, 1)
}

/** Dismiss the newest visible snackbar (entries are prepended newest-first). */
export function dismissNewestSnackbar(): void {
  const entry = snackbarStore.entries.find((e) => e.visible)
  if (entry) resolveEntry(entry, 'dismissed')
}

/** Dismiss the oldest visible snackbar. */
export function dismissOldestSnackbar(): void {
  const entry = [...snackbarStore.entries].reverse().find((e) => e.visible)
  if (entry) resolveEntry(entry, 'dismissed')
}

/** Show a snackbar; resolves when dismissed or its action is performed. */
export function showSnackbar(options: SnackbarOptions): Promise<SnackbarResult> {
  return new Promise<SnackbarResult>((resolve) => {
    const id = ++idCounter
    const duration = options.duration ?? 'short'
    const entry: SnackbarEntry = {
      id,
      message: options.message,
      actionLabel: options.actionLabel,
      withDismissAction: options.withDismissAction ?? false,
      duration,
      visible: true,
      resolve,
      timer: null,
    }
    const ms = durationToMillis(duration, !!options.actionLabel)
    if (Number.isFinite(ms)) {
      entry.timer = setTimeout(() => resolveEntry(entry, 'dismissed'), ms)
    }
    // Newest first (host renders bottom-up, matching SnackbarHost reverseLayout).
    snackbarStore.entries.unshift(entry)
  })
}
