<script setup lang="ts">
// Copyright 2026, miuix-vue contributors
// SPDX-License-Identifier: Apache-2.0
//
// Ported from miuix-ui/.../layout/DialogContentLayout.kt + overlay/OverlayDialog.kt.
//
// Web uses the large-screen (centered) variant only — the standard modal idiom
// (per goal: one popup style). Specs (DialogDefaults / DialogContent):
//   - content: maxWidth 420, insideMargin 24, cornerRadius = coerceAtLeast(32)
//   - title:   title4 (18) / weight Medium / centered / onBackground / mb 12
//   - summary: body1 (16) / centered / onSurfaceSecondary / mb 12
//   - background = colorScheme.background; outsideMargin 12
// Animations (1:1):
//   enter content  folmeSpring(0.9, 0.3) → stiffness ≈ 438.65, scale 0.8→1 + alpha
//   exit content   tween 260ms DecelerateEasing(1.5)
//   dim in/out     tween 300/250ms DecelerateEasing(1.5)

import { AnimatePresence, Motion } from 'motion-v'
import { decelerateEasing, folmeSpringByResponse } from '../../anim'

defineOptions({ name: 'MiuixDialog' })

interface Props {
  modelValue?: boolean
  title?: string
  summary?: string
  closeOnClickModal?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  title: '',
  summary: '',
  closeOnClickModal: true,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  open: []
  close: []
}>()

const contentEnterTransition = folmeSpringByResponse(0.9, 0.3)
const contentExitTransition = { duration: 0.26, ease: decelerateEasing(1.5) }
const dimEnterTransition = { duration: 0.3, ease: decelerateEasing(1.5) }
const dimExitTransition = { duration: 0.25, ease: decelerateEasing(1.5) }

function close(): void {
  emit('update:modelValue', false)
  emit('close')
}

function onBackdropClick(): void {
  if (props.closeOnClickModal) close()
}
</script>

<template>
  <Teleport to="body">
    <AnimatePresence>
      <Motion
        v-if="props.modelValue"
        class="m-dialog__backdrop"
        :initial="{ opacity: 0 }"
        :animate="{ opacity: 1 }"
        :exit="{ opacity: 0 }"
        :transition="dimEnterTransition"
        :exit-transition="dimExitTransition"
        @click.self="onBackdropClick"
      >
        <Motion
          class="m-dialog__content"
          role="dialog"
          aria-modal="true"
          :initial="{ opacity: 0, scale: 0.8 }"
          :animate="{ opacity: 1, scale: 1 }"
          :exit="{ opacity: 0, scale: 0.8 }"
          :transition="contentEnterTransition"
          :exit-transition="contentExitTransition"
        >
          <h2 v-if="props.title" class="m-dialog__title">{{ props.title }}</h2>
          <p v-if="props.summary" class="m-dialog__summary">{{ props.summary }}</p>
          <div class="m-dialog__body">
            <slot :close="close" />
          </div>
        </Motion>
      </Motion>
    </AnimatePresence>
  </Teleport>
</template>

<style lang="scss">
.m-dialog {
  &__backdrop {
    position: fixed;
    inset: 0;
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    // outsideMargin 12 per side.
    padding: 12px;
    box-sizing: border-box;
    background: var(--m-color-window-dimming);
  }

  &__content {
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    width: 420px;
    max-width: 100%;
    // heightIn(max = windowHeight * 2/3) on large screen.
    max-height: 66.6666vh;
    // bottomCornerRadius coerceAtLeast(32) on web (no device corner).
    border-radius: 32px;
    // insideMargin 24×24.
    padding: 24px;
    background: var(--m-color-background);
    color: var(--m-color-on-background);
    overflow: hidden auto;
  }

  &__title {
    margin: 0 0 12px;
    font-size: var(--m-text-title4-size);
    font-weight: 500;
    text-align: center;
    color: var(--m-color-on-background);
  }

  &__summary {
    margin: 0 0 12px;
    font-size: var(--m-text-body1-size);
    text-align: center;
    color: var(--m-color-on-surface-secondary);
  }

  &__body {
    // content area
  }
}
</style>
