<script setup lang="ts">
// Copyright 2026, miuix-vue contributors
// SPDX-License-Identifier: Apache-2.0
//
// Ported from miuix-ui/.../basic/Snackbar.kt (SnackbarHost + Snackbar).
//
// Bottom-centered queue, newest nearest the bottom. Each snackbar:
//   dark container (onSecondaryVariant), radius 16, min-height 48, inside margin
//   12 all, outer padding 12 horizontal + 8 top; soft drop shadow (blur 10,
//   black 10%); message body2 (max 2 lines, contentColor = secondaryVariant);
//   optional action = primary filled pill (primary bg, onPrimary text, radius 50,
//   font 15) + dismiss X (Close icon, 20px, onSurfaceContainerVariant, no ripple).
// Enter: slide-up + fade; exit: slide-down + fade; dismissing one slides the
// rest into place. Auto-dismiss timing lives in the store (Short 4000 / Long
// 10000 / Indefinite).

import { AnimatePresence, Motion } from 'motion-v'
import { computed } from 'vue'
import { folmeSpring } from '../../anim'
import { MiuixText } from '../text'
import { snackbarStore, dismissSnackbar } from './useSnackbar'

defineOptions({ name: 'MiuixSnackbarHost' })

// Only visible entries are rendered; AnimatePresence plays the exit animation
// when one leaves this list. Oldest→newest top-to-bottom (newest at the bottom);
// the bottom-pinned host keeps the newest anchored as the stack grows/shrinks.
const ordered = computed(() => snackbarStore.entries.filter((e) => e.visible).reverse())

// One critically-damped spring drives everything: miuix's enter
// (slideInVertically + fadeIn), exit (slideOutVertically + fadeOut +
// shrinkVertically) and the LazyColumn animateItem placement all default to
// spring(dampingRatio=1, stiffness=MediumLow=400). `layout="position"` +
// AnimatePresence `popLayout` reproduce shrinkVertically + animateItem: a
// dismissed snackbar pops out of flow and the rest slide into place on the same
// spring, instead of the others jumping once it unmounts.
const spring = folmeSpring(1, 400)
</script>

<template>
  <Teleport to="body">
    <div class="m-snackbar-host">
      <AnimatePresence :initial="false" mode="popLayout">
        <Motion
          v-for="entry in ordered"
          :key="entry.id"
          class="m-snackbar"
          layout="position"
          :initial="{ opacity: 0, y: '100%' }"
          :animate="{ opacity: 1, y: '0%' }"
          :exit="{ opacity: 0, y: '100%' }"
          :transition="spring"
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
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path
                  d="M6 6 L18 18 M18 6 L6 18"
                  stroke="currentColor"
                  stroke-width="2.2"
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
  // Float above any bottom bar (miuix Scaffold places the snackbar on top of the
  // bottomBar). Apps with a bottom navigation bar set --m-snackbar-inset-bottom
  // to its height; default 0 sits the host at the viewport bottom. The 12px gap
  // (LazyColumn contentPadding) is measured from this inset.
  bottom: var(--m-snackbar-inset-bottom, 0px);
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
  // outer padding: 12 horizontal, 8 top, 0 bottom (SnackbarDefaults.OuterPadding)
  padding: 8px 12px 0;
  box-sizing: border-box;
  pointer-events: auto;

  &__inner {
    display: flex;
    align-items: center;
    // border-box so min-height 48 INCLUDES the inside padding, matching miuix's
    // defaultMinSize(48).padding(insideMargin) — content-box would make it 48+24
    // = 72 tall. (No global box-sizing reset in this project.)
    box-sizing: border-box;
    min-height: 48px;
    // inside margin 12 all (SnackbarDefaults.InsideMargin)
    padding: 12px;
    border-radius: var(--m-radius-md);
    background: var(--m-color-on-secondary-variant);
    color: var(--m-color-secondary-variant);
    // dropShadow(radius 10, black, alpha 0.1) — soft centered blur, no offset.
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
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

  // Action label = primary filled pill (textButtonColorsPrimary): primary bg,
  // onPrimary text, pill radius 50, min 26×26, inside margin 12×0, font 15.
  &__action {
    position: relative;
    flex: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    min-width: 26px;
    min-height: 26px;
    // padding(start = 12) before the pill
    margin-left: 12px;
    // ActionInsideMargin: 12 horizontal, 0 vertical
    padding: 0 12px;
    border: 0;
    border-radius: 50px;
    background: var(--m-color-primary);
    color: var(--m-color-on-primary);
    font-family: inherit;
    font-size: 15px;
    line-height: 1;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;

    // MiuixIndication alpha overlay (additive, linear 120ms) — same as MiuixButton.
    &::after {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: inherit;
      background: var(--m-color-on-background);
      opacity: 0;
      transition: opacity 120ms linear;
      pointer-events: none;
    }
    &:focus-visible::after {
      opacity: 0.08;
    }
    &:active::after {
      opacity: 0.1;
    }
    &:focus-visible:active::after {
      opacity: 0.18;
    }
    @media (hover: hover) {
      &:hover::after {
        opacity: 0.06;
      }
      &:hover:focus-visible::after {
        opacity: 0.14;
      }
      &:hover:active::after {
        opacity: 0.16;
      }
      &:hover:focus-visible:active::after {
        opacity: 0.24;
      }
    }
  }

  // Dismiss X (Close icon): size 20, onSurfaceContainerVariant, no background,
  // no ripple (clickable indication = null in source).
  &__dismiss {
    flex: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    margin-left: 8px;
    padding: 0;
    border: 0;
    background: transparent;
    color: var(--m-color-on-surface-container-variant);
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }
}
</style>
