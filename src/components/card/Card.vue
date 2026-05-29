<script setup lang="ts">
// Copyright 2026, miuix-vue contributors
// SPDX-License-Identifier: Apache-2.0
//
// Ported from miuix-ui/.../basic/Card.kt + utils/PressFeedback.kt.
//
// Sink and tilt press feedback animations match miuix exactly:
// SinkFeedback: scale 1.0 → 0.94 with folmeSpring(0.8, 600)
// TiltFeedback: rotationX/Y ±8° with folmeSpring(0.6, 400)
//             pivot follows touch quadrant, cameraDistance 12 * density

import { Motion } from 'motion-v'
import { computed, ref } from 'vue'
import { folmeSpring } from '../../anim'

defineOptions({ name: 'MiuixCard' })

export type MiuixCardPressFeedback = 'none' | 'sink' | 'tilt'

interface Props {
  /** Visual press feedback. miuix PressFeedbackType. */
  pressFeedback?: MiuixCardPressFeedback
}

const props = withDefaults(defineProps<Props>(), {
  pressFeedback: 'none',
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const SINK_AMOUNT = 0.94
const TILT_AMOUNT = 8

const sinkSpring = folmeSpring(0.8, 600)
const tiltSpring = folmeSpring(0.6, 400)

const pressed = ref(false)
const tiltX = ref(0)
const tiltY = ref(0)
const tiltOriginX = ref('50%')
const tiltOriginY = ref('50%')

const isInteractive = computed(() => props.pressFeedback !== 'none')

const animateTarget = computed(() => {
  if (props.pressFeedback === 'sink') {
    return { scale: pressed.value ? SINK_AMOUNT : 1 }
  }
  if (props.pressFeedback === 'tilt') {
    return { rotateX: tiltX.value, rotateY: tiltY.value }
  }
  return {}
})

const motionTransition = computed(() => {
  if (props.pressFeedback === 'sink') return sinkSpring
  if (props.pressFeedback === 'tilt') return tiltSpring
  return { duration: 0 }
})

const cardStyle = computed(() => ({
  transformOrigin: `${tiltOriginX.value} ${tiltOriginY.value}`,
  cursor: isInteractive.value ? 'pointer' : undefined,
}))

function onPointerDown(event: PointerEvent): void {
  pressed.value = true

  if (props.pressFeedback === 'tilt') {
    const target = event.currentTarget as HTMLElement
    const rect = target.getBoundingClientRect()
    const offsetX = event.clientX - rect.left
    const offsetY = event.clientY - rect.top
    const halfW = rect.width / 2
    const halfH = rect.height / 2

    tiltOriginX.value = offsetX < halfW ? '100%' : '0%'
    tiltOriginY.value = offsetY < halfH ? '100%' : '0%'
    tiltX.value = offsetY < halfH ? TILT_AMOUNT : -TILT_AMOUNT
    tiltY.value = offsetX < halfW ? -TILT_AMOUNT : TILT_AMOUNT
  }
}

function release(): void {
  pressed.value = false
  tiltX.value = 0
  tiltY.value = 0
}

function onClick(event: MouseEvent): void {
  emit('click', event)
}
</script>

<template>
  <div class="m-card-wrapper" :class="{ 'm-card-wrapper--3d': props.pressFeedback === 'tilt' }">
    <Motion
      class="m-card"
      :class="`m-card--feedback-${props.pressFeedback}`"
      :style="cardStyle"
      :animate="animateTarget"
      :transition="motionTransition"
      @pointerdown="onPointerDown"
      @pointerup="release"
      @pointercancel="release"
      @pointerleave="release"
      @click="onClick"
    >
      <slot />
    </Motion>
  </div>
</template>

<style lang="scss">
// 3D tilt needs perspective on a parent element so the rotation is rendered
// with depth. cameraDistance = 12 * density in miuix → perspective: 12px in
// CSS logical pixels (1 dp = 1 CSS px).
.m-card-wrapper {
  // Block by default so cards fill the available width (miuix fillMaxWidth).
  display: block;

  &--3d {
    perspective: 12px;
  }
}

.m-card {
  display: block;
  overflow: hidden;
  border-radius: var(--m-radius-md);
  background: var(--m-color-surface-container);
  color: var(--m-color-on-surface-container);

  &--feedback-tilt {
    // backface visibility prevents flicker during the 3D rotation
    backface-visibility: hidden;
    will-change: transform;
  }
}
</style>
