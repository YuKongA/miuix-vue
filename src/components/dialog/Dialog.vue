<script setup lang="ts">
// Copyright 2026, miuix-vue contributors
// SPDX-License-Identifier: Apache-2.0
//
// Ported from miuix-ui/.../layout/DialogContentLayout.kt + overlay/OverlayDialog.kt.
//
// Two forms, switched by DialogDefaults.isLargeScreen() (windowH >= 480 &&
// windowW >= 840; 1dp = 1px): large screens centre the dialog with a scale-in,
// small screens (phones / short windows) bottom-align it with a slide-up.
// Specs (DialogDefaults / DialogContent):
//   - content: maxWidth 420, insideMargin 24, cornerRadius = coerceAtLeast(32)
//   - large maxHeight = windowH·2/3; small = bottom-aligned, viewport-bounded
//   - title:   title4 (18) / weight Medium / centered / onBackground / mb 12
//   - summary: body1 (16) / centered / onSurfaceSecondary / mb 12
//   - background = colorScheme.background; outsideMargin 12
// Animations (1:1):
//   enter (large)  folmeSpring(0.9, 0.3) → stiffness ≈ 438.65, scale 0.8→1 + alpha
//   enter (small)  folmeSpring(0.88, 450), slide up (translateY windowH→0)
//   exit content   tween 260ms DecelerateEasing(1.5)
//   dim in/out     tween 300/250ms DecelerateEasing(1.5)
// Not replicated (per goal): the predictive-back gesture (scale / drag-down).

import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { AnimatePresence, Motion } from 'motion-v'
import { decelerateEasing, folmeSpring, folmeSpringByResponse } from '../../anim'

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

// miuix DialogDefaults.isLargeScreen(): windowH >= 480dp && windowW >= 840dp
// (1dp = 1px). Large → centred + scale-in; small → bottom-aligned + slide-up.
const LARGE_MIN_WIDTH = 840
const LARGE_MIN_HEIGHT = 480
function computeLargeScreen(): boolean {
  if (typeof window === 'undefined') return true
  return window.innerWidth >= LARGE_MIN_WIDTH && window.innerHeight >= LARGE_MIN_HEIGHT
}
const isLargeScreen = ref(computeLargeScreen())
// Small-screen slide travels the FULL viewport height (miuix translationY =
// (1-progress)*windowHeight), not the dialog's own height — so y is an absolute
// px value (recomputed on resize), not an element-relative '100%' string.
function computeViewportHeight(): number {
  return typeof window !== 'undefined' ? window.innerHeight : 0
}
const viewportHeight = ref(computeViewportHeight())
function onResize(): void {
  isLargeScreen.value = computeLargeScreen()
  viewportHeight.value = computeViewportHeight()
}
onMounted(() => window.addEventListener('resize', onResize))
onUnmounted(() => window.removeEventListener('resize', onResize))

// Large: scale 0.8→1 + fade. Small: slide up from a full viewport-height below
// (translateY windowH→0), opacity fixed at 1 (miuix small-screen alpha = 1).
// Exit reuses the initial.
const contentInitial = computed(() =>
  isLargeScreen.value ? { opacity: 0, scale: 0.8 } : { y: viewportHeight.value },
)
const contentAnimate = computed(() => (isLargeScreen.value ? { opacity: 1, scale: 1 } : { y: 0 }))
const contentEnterTransition = computed(() =>
  isLargeScreen.value ? folmeSpringByResponse(0.9, 0.3) : folmeSpring(0.88, 450),
)
// Exit: tween 260ms DecelerateEasing(1.5) for both forms.
const contentExitTransition = { duration: 0.26, ease: decelerateEasing(1.5) }
const dimEnterTransition = { duration: 0.3, ease: decelerateEasing(1.5) }
const dimExitTransition = { duration: 0.25, ease: decelerateEasing(1.5) }

function close(): void {
  emit('update:modelValue', false)
}

// Emit open/close from the single source of truth (modelValue) so they fire
// however the dialog is toggled — close(), v-model, or a parent set — instead of
// only from close() (which left the declared `open` event never emitted).
watch(
  () => props.modelValue,
  (v) => {
    if (v) emit('open')
    else emit('close')
  },
)

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
        :class="{ 'm-dialog__backdrop--bottom': !isLargeScreen }"
        :initial="{ opacity: 0 }"
        :animate="{ opacity: 1 }"
        :exit="{ opacity: 0 }"
        :transition="dimEnterTransition"
        :exit-transition="dimExitTransition"
        @click.self="onBackdropClick"
      >
        <Motion
          class="m-dialog__content"
          :class="{ 'm-dialog__content--bottom': !isLargeScreen }"
          role="dialog"
          aria-modal="true"
          :initial="contentInitial"
          :animate="contentAnimate"
          :exit="contentInitial"
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

    // Small screen (miuix Alignment.BottomCenter): pin the dialog to the bottom.
    &--bottom {
      align-items: flex-end;
    }
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

    // Small screen: no 2/3 cap (miuix uses Dp.Unspecified); bound to the visible
    // viewport minus the 12px top/bottom outside margins so tall content scrolls.
    &--bottom {
      max-height: calc(100dvh - 24px);
    }
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
