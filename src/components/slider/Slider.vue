<script setup lang="ts">
// Copyright 2026, miuix-vue contributors
// SPDX-License-Identifier: Apache-2.0
//
// Ported from miuix-ui/.../basic/Slider.kt (POC subset).
//
// Springs (1:1 with source):
//   thumb scale (press/drag/hover): folmeSpring(0.6, 987) → 1.0 ↔ 1.127
//   progress idle (snap):           folmeSpring(0.96, 322)
//   progress dragging:              folmeSpring(0.9, 1755)
//
// POC scope:
//   - v-model + min + max + step + disabled
//   - Track height 28, thumb diameter 28 (matches track height for capsule fit)
//   - Pointer-driven drag + click-to-position
//
// MVP TODO: keyPoints + magnetic snap (0.02 default), reverseDirection,
//           VerticalSlider, RangeSlider, trackAlpha overlay on drag.

import { Motion } from 'motion-v'
import { computed, ref } from 'vue'
import { folmeSpring } from '../../anim'

defineOptions({ name: 'MiuixSlider' })

interface Props {
  modelValue?: number
  min?: number
  max?: number
  step?: number
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: 0,
  min: 0,
  max: 100,
  step: 0,
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: number]
  change: [value: number]
}>()

const SCALE_ACTIVE = 1.127

const thumbScaleTransition = folmeSpring(0.6, 987)
const progressIdleTransition = folmeSpring(0.96, 322)
const progressDragTransition = folmeSpring(0.9, 1755)

const trackRef = ref<HTMLElement | null>(null)
const pressed = ref(false)
const hovered = ref(false)
const isDragging = ref(false)
let activePointerId: number | null = null

const range = computed(() => props.max - props.min)
const fraction = computed(() => {
  if (range.value <= 0) return 0
  const f = (props.modelValue - props.min) / range.value
  return Math.max(0, Math.min(1, f))
})

const thumbScale = computed(() => {
  if (props.disabled) return 1
  if (pressed.value || hovered.value || isDragging.value) return SCALE_ACTIVE
  return 1
})

const progressTransition = computed(() =>
  isDragging.value ? progressDragTransition : progressIdleTransition,
)

function snapToStep(value: number): number {
  if (props.step <= 0) return value
  const steps = Math.round((value - props.min) / props.step)
  return props.min + steps * props.step
}

function emitValueFromClientX(clientX: number): void {
  const track = trackRef.value
  if (!track) return
  const rect = track.getBoundingClientRect()
  const f = (clientX - rect.left) / rect.width
  const raw = props.min + Math.max(0, Math.min(1, f)) * range.value
  const next = snapToStep(raw)
  const clamped = Math.max(props.min, Math.min(props.max, next))
  if (clamped !== props.modelValue) {
    emit('update:modelValue', clamped)
    emit('change', clamped)
  }
}

function onPointerDown(event: PointerEvent): void {
  if (props.disabled) return
  pressed.value = true
  isDragging.value = true
  activePointerId = event.pointerId
  ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
  emitValueFromClientX(event.clientX)
}

function onPointerMove(event: PointerEvent): void {
  if (activePointerId !== event.pointerId) return
  emitValueFromClientX(event.clientX)
}

function onPointerUp(event: PointerEvent): void {
  if (activePointerId !== event.pointerId) return
  pressed.value = false
  isDragging.value = false
  activePointerId = null
  ;(event.currentTarget as HTMLElement).releasePointerCapture(event.pointerId)
}

function onPointerEnter(): void {
  if (!props.disabled) hovered.value = true
}

function onPointerLeave(): void {
  hovered.value = false
}
</script>

<template>
  <div
    ref="trackRef"
    role="slider"
    tabindex="0"
    class="m-slider"
    :class="{ 'm-slider--disabled': props.disabled }"
    :aria-valuemin="props.min"
    :aria-valuemax="props.max"
    :aria-valuenow="props.modelValue"
    :aria-disabled="props.disabled"
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @pointerup="onPointerUp"
    @pointercancel="onPointerUp"
    @pointerenter="onPointerEnter"
    @pointerleave="onPointerLeave"
  >
    <Motion
      class="m-slider__fill"
      :animate="{ width: `${fraction * 100}%` }"
      :transition="progressTransition"
    />
    <Motion
      class="m-slider__thumb"
      :style="{ left: `${fraction * 100}%` }"
      :animate="{ scale: thumbScale }"
      :transition="thumbScaleTransition"
    />
  </div>
</template>

<style lang="scss">
.m-slider {
  position: relative;
  display: block;
  width: 100%;
  height: 28px; // SliderDefaults.MinHeight
  border-radius: 9999px;
  background: var(--m-color-slider-background);
  cursor: pointer;
  user-select: none;
  touch-action: none;
  outline: none;
  overflow: hidden;

  &--disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }

  &:focus-visible {
    box-shadow: 0 0 0 2px var(--m-color-primary);
  }

  &__fill {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    background: var(--m-color-primary);
    pointer-events: none;
  }

  &__thumb {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 28px;
    margin-left: -14px;
    border-radius: 50%;
    background: var(--m-color-on-primary);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
    pointer-events: none;
  }
}
</style>
