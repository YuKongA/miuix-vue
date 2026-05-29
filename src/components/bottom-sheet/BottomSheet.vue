<script setup lang="ts">
// Copyright 2026, miuix-vue contributors
// SPDX-License-Identifier: Apache-2.0
//
// Ported from miuix-ui/.../layout/BottomSheetContentLayout.kt + overlay/OverlayBottomSheet.kt.
// Web collapses the Overlay/Window variants to one bottom sheet (per goal).
//
// BottomSheetDefaults: bg background, top cornerRadius 28, maxWidth 640,
// insideMargin 24 horizontal, dragHandle 45×4 (RoundedCorner 2) at
// onSurfaceVariantSummary @ 0.2. Enter/exit slide via folmeSpring(0.9, 0.38)
// → stiffness ≈ 273. Drag the handle down past 150 to dismiss (when allowDismiss).
// Dim backdrop = windowDimming, fades with drag.

import { AnimatePresence, Motion } from 'motion-v'
import { ref } from 'vue'
import { MiuixText } from '../text'
import { folmeSpringByResponse } from '../../anim'

defineOptions({ name: 'MiuixBottomSheet' })

interface Props {
  modelValue?: boolean
  title?: string
  allowDismiss?: boolean
  closeOnClickModal?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  title: '',
  allowDismiss: true,
  closeOnClickModal: true,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  close: []
}>()

const sheetSpring = folmeSpringByResponse(0.9, 0.38)
const DISMISS_THRESHOLD = 150

const dragY = ref(0)
const dragging = ref(false)
let activePointer: number | null = null
let startY = 0

function close(): void {
  emit('update:modelValue', false)
  emit('close')
}

function onBackdrop(): void {
  if (props.closeOnClickModal && props.allowDismiss) close()
}

function onHandleDown(e: PointerEvent): void {
  activePointer = e.pointerId
  startY = e.clientY
  dragging.value = true
  ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
}
function onHandleMove(e: PointerEvent): void {
  if (activePointer !== e.pointerId) return
  const dy = e.clientY - startY
  // Damp upward drag (and downward when not dismissible), matching the source.
  if (dy < 0) dragY.value = dy * 0.1
  else dragY.value = props.allowDismiss ? dy : dy * 0.1
}
function onHandleUp(e: PointerEvent): void {
  if (activePointer !== e.pointerId) return
  activePointer = null
  dragging.value = false
  ;(e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId)
  if (props.allowDismiss && dragY.value > DISMISS_THRESHOLD) {
    dragY.value = 0
    close()
  } else {
    dragY.value = 0
  }
}
</script>

<template>
  <Teleport to="body">
    <AnimatePresence>
      <Motion
        v-if="props.modelValue"
        class="m-bottom-sheet__backdrop"
        :initial="{ opacity: 0 }"
        :animate="{ opacity: 1 }"
        :exit="{ opacity: 0 }"
        :transition="{ duration: 0.3, ease: 'easeOut' }"
        @click.self="onBackdrop"
      >
        <Motion
          class="m-bottom-sheet__sheet"
          role="dialog"
          aria-modal="true"
          :initial="{ y: '100%' }"
          :animate="{ y: '0%' }"
          :exit="{ y: '100%' }"
          :transition="sheetSpring"
          :exit-transition="sheetSpring"
        >
          <div
            class="m-bottom-sheet__inner"
            :class="{ 'm-bottom-sheet__inner--dragging': dragging }"
            :style="{ transform: `translateY(${dragY}px)` }"
          >
            <div
              class="m-bottom-sheet__handle-area"
              @pointerdown="onHandleDown"
              @pointermove="onHandleMove"
              @pointerup="onHandleUp"
              @pointercancel="onHandleUp"
            >
              <span class="m-bottom-sheet__handle" />
            </div>
            <div
              v-if="props.title || $slots['start-action'] || $slots['end-action']"
              class="m-bottom-sheet__title-row"
            >
              <div class="m-bottom-sheet__action m-bottom-sheet__action--start">
                <slot name="start-action" />
              </div>
              <MiuixText type="title4" weight="medium" class="m-bottom-sheet__title">
                {{ props.title }}
              </MiuixText>
              <div class="m-bottom-sheet__action m-bottom-sheet__action--end">
                <slot name="end-action" />
              </div>
            </div>
            <div class="m-bottom-sheet__content">
              <slot :close="close" />
            </div>
          </div>
        </Motion>
      </Motion>
    </AnimatePresence>
  </Teleport>
</template>

<style lang="scss">
.m-bottom-sheet {
  &__backdrop {
    position: fixed;
    inset: 0;
    z-index: 1000;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    background: var(--m-color-window-dimming);
  }

  &__sheet {
    width: 100%;
    max-width: 640px;
    max-height: calc(100vh - 24px);
    display: flex;
    flex-direction: column;
  }

  &__inner {
    display: flex;
    flex-direction: column;
    min-height: 0;
    // top corners 28
    border-radius: 28px 28px 0 0;
    background: var(--m-color-background);
    color: var(--m-color-on-background);
    // insideMargin 24 horizontal
    padding: 0 24px 24px;
    overflow: hidden;

    &:not(&--dragging) {
      transition: transform 200ms ease-out;
    }
  }

  &__handle-area {
    flex: none;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 24px;
    cursor: grab;
    touch-action: none;

    &:active {
      cursor: grabbing;
    }
  }

  &__handle {
    width: 45px;
    height: 4px;
    border-radius: 2px;
    background: var(--m-color-on-surface-variant-summary);
    opacity: 0.2;
    transition: width 120ms ease;
  }

  &__handle-area:active &__handle {
    width: 55px;
    transform: scaleY(1.15);
  }

  &__title-row {
    flex: none;
    display: flex;
    align-items: center;
    min-height: 44px;
    gap: 8px;
  }

  &__action {
    display: flex;
    align-items: center;
    flex: none;

    &--start {
      justify-content: flex-start;
    }
    &--end {
      justify-content: flex-end;
      margin-left: auto;
    }
  }

  &__title {
    flex: 1;
    text-align: center;
  }

  &__content {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
  }
}
</style>
