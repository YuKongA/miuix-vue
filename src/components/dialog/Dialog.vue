<script setup lang="ts">
// Copyright 2026, miuix-vue contributors
// SPDX-License-Identifier: Apache-2.0
//
// Ported from miuix-ui/.../overlay/OverlayDialog.kt + DialogContentLayout.kt.
//
// Animation specs (large-screen flavor, 1:1 with source):
//   Enter:    folmeSpringByResponse(0.9, 0.3) → stiffness ≈ 4376
//             scale 0.8 → 1.0, alpha 0 → 1
//   Exit:     tween 260ms with DecelerateEasing(1.5)
//   Dim in:   tween 300ms with DecelerateEasing(1.5)
//   Dim out:  tween 250ms with DecelerateEasing(1.5)
//
// POC scope:
//   - v-model:open + title + width + close-on-click-modal + align-center
//   - Default + header + footer slots
//   - Teleport to body so dialog escapes containing stacking contexts
// MVP TODO: small-screen variant (translateY enter), predictive back gesture,
//           focus-trap + ARIA wiring.

import { AnimatePresence, Motion } from 'motion-v'
import { computed } from 'vue'
import { decelerateEasing, folmeSpringByResponse } from '../../anim'

defineOptions({ name: 'MiuixDialog' })

interface Props {
  modelValue?: boolean
  title?: string
  width?: string | number
  alignCenter?: boolean
  closeOnClickModal?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  title: '',
  width: '420px',
  alignCenter: true,
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

const widthStyle = computed(() =>
  typeof props.width === 'number' ? `${props.width}px` : props.width,
)

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
        :class="{ 'm-dialog__backdrop--align-center': props.alignCenter }"
        :initial="{ opacity: 0 }"
        :animate="{ opacity: 1 }"
        :exit="{ opacity: 0 }"
        :transition="dimEnterTransition"
        :exit-transition="dimExitTransition"
        @click.self="onBackdropClick"
      >
        <Motion
          class="m-dialog__content"
          :style="{ width: widthStyle }"
          :initial="{ opacity: 0, scale: 0.8 }"
          :animate="{ opacity: 1, scale: 1 }"
          :exit="{ opacity: 0, scale: 0.8 }"
          :transition="contentEnterTransition"
          :exit-transition="contentExitTransition"
          @click.stop
        >
          <header v-if="props.title || $slots.header" class="m-dialog__header">
            <slot name="header">
              <h2 class="m-dialog__title">{{ props.title }}</h2>
            </slot>
          </header>
          <div class="m-dialog__body">
            <slot />
          </div>
          <footer v-if="$slots.footer" class="m-dialog__footer">
            <slot name="footer" :close="close" />
          </footer>
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
    justify-content: center;
    background: var(--m-color-window-dimming);

    &--align-center {
      align-items: center;
    }
  }

  &__content {
    display: flex;
    flex-direction: column;
    max-width: calc(100% - 48px);
    max-height: 66.6666%; // windowHeight * 2/3
    border-radius: var(--m-radius-md);
    background: var(--m-color-surface-container);
    color: var(--m-color-on-surface-container);
    box-shadow: 0 24px 64px rgba(0, 0, 0, 0.18);
    overflow: hidden;
  }

  &__header {
    padding: 24px 24px 8px;
  }

  &__title {
    margin: 0;
    font-size: var(--m-text-title4-size);
    font-weight: 700;
  }

  &__body {
    padding: 8px 24px;
    overflow: auto;
    font-size: var(--m-text-body1-size);
  }

  &__footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding: 16px 24px 24px;
  }
}
</style>
