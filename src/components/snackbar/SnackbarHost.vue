<script setup lang="ts">
// Copyright 2026, miuix-vue contributors
// SPDX-License-Identifier: Apache-2.0
//
// Ported from miuix-ui/.../basic/Snackbar.kt (SnackbarHost + Snackbar).
//
// Bottom-centered queue, newest nearest the bottom. Each snackbar:
//   container surfaceContainerHighest, radius 12, min-height 44, inside margin
//   12×8, outer margin 12×4; message body2 (max 2 lines); optional action label
//   (transparent text button, onSurfaceContainerHighest) + dismiss X.
// Enter: slide-up + fade; exit: slide-down + fade. Auto-dismiss timing lives in
// the store (Short 4000 / Long 10000 / Indefinite).

import { AnimatePresence, Motion } from 'motion-v'
import { computed } from 'vue'
import { MiuixText } from '../text'
import { snackbarStore, dismissSnackbar } from './useSnackbar'

defineOptions({ name: 'MiuixSnackbarHost' })

// Only visible entries are rendered; AnimatePresence plays the exit animation
// when one leaves this list. Oldest→newest top-to-bottom (newest at the bottom).
const ordered = computed(() => snackbarStore.entries.filter((e) => e.visible).reverse())

// miuix enter (slideInVertically + fadeIn) and exit (slideOut + fadeOut +
// shrinkVertically) default to spring(dampingRatio=1, stiffness=MediumLow=400) —
// critically damped. damping = 2*1*sqrt(400) = 40.
const enterTransition = { type: 'spring' as const, stiffness: 400, damping: 40 }
const exitTransition = { type: 'spring' as const, stiffness: 400, damping: 40 }
</script>

<template>
  <Teleport to="body">
    <div class="m-snackbar-host">
      <AnimatePresence :initial="false">
        <Motion
          v-for="entry in ordered"
          :key="entry.id"
          class="m-snackbar"
          :initial="{ opacity: 0, y: 24 }"
          :animate="{ opacity: 1, y: 0 }"
          :exit="{ opacity: 0, y: 24 }"
          :transition="enterTransition"
          :exit-transition="exitTransition"
        >
          <div class="m-snackbar__inner">
            <MiuixText type="body2" class="m-snackbar__message">{{ entry.message }}</MiuixText>
            <button
              v-if="entry.actionLabel"
              type="button"
              class="m-snackbar__action"
              @click="dismissSnackbar(entry.id, 'action')"
            >
              {{ entry.actionLabel }}
            </button>
            <button
              v-if="entry.withDismissAction"
              type="button"
              class="m-snackbar__dismiss"
              aria-label="Dismiss"
              @click="dismissSnackbar(entry.id, 'dismissed')"
            >
              <svg viewBox="0 0 24 24" width="16" height="16">
                <path
                  d="M6 6 L18 18 M18 6 L6 18"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  fill="none"
                />
              </svg>
            </button>
          </div>
        </Motion>
      </AnimatePresence>
    </div>
  </Teleport>
</template>

<style lang="scss">
.m-snackbar-host {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1200;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-bottom: 12px;
  pointer-events: none;
}

.m-snackbar {
  width: 100%;
  max-width: 420px;
  // outer margin 12 horizontal, 4 vertical
  padding: 4px 12px;
  box-sizing: border-box;
  pointer-events: auto;

  &__inner {
    display: flex;
    align-items: center;
    min-height: 44px;
    // inside margin 12 horizontal, 8 vertical
    padding: 8px 12px;
    border-radius: 12px;
    background: var(--m-color-surface-container-highest);
    color: var(--m-color-on-surface-container);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
  }

  &__message {
    flex: 1;
    min-width: 0;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  &__action {
    flex: none;
    margin-left: 8px;
    padding: 6px 8px;
    border: 0;
    border-radius: 8px;
    background: transparent;
    color: var(--m-color-on-surface-container-highest);
    font-family: inherit;
    font-size: var(--m-text-button-size);
    cursor: pointer;
  }

  &__dismiss {
    flex: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    margin-left: 8px;
    padding: 0;
    border: 0;
    border-radius: 50%;
    background: transparent;
    color: var(--m-color-on-surface-container-highest);
    cursor: pointer;
  }
}
</style>
