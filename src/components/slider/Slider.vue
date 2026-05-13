<script setup lang="ts">
// Copyright 2026, miuix-vue contributors
// SPDX-License-Identifier: Apache-2.0
//
// Ported from miuix-ui/.../basic/Slider.kt.
//
// Geometry (1:1 with Canvas math in SliderTrack):
//   barHeight    = SliderDefaults.MinHeight = 28
//   thumbRadius  = barHeight / 2            = 14
//   knobRadius   = thumbRadius * 0.72       = 10.08  (visible thumb)
//   availableW   = barWidth - 2 * thumbRadius        (thumb travel range)
//   thumbCenter  = thumbRadius + fraction * availableW
// Fill is drawn as a line with strokeWidth = barHeight + cap = Round, so the
// visible right edge of the fill is thumbCenter + thumbRadius (the cap adds
// thumbRadius of half-circle past the line endpoint).
//
// Animation (1:1 with source):
//   thumb scale (press/drag/hover):  folmeSpring(0.6, 987) → 1.0 ↔ 1.127
//   track alpha overlay on drag:     tween 150ms, 0 → 0.044 (black)
//
// Hover only triggers when the *mouse* cursor enters the thumb's hit area:
//   hitRadius = knobRadius + thumbRadius * 0.5 = 10.08 + 7 = 17.08
// Touch hover is impossible; touch only fires press/drag (matches source's
// `change.type != PointerType.Mouse` early-continue).
//
// Progress fill width is bound directly via :style (no motion-v wrapper) so
// the fill tracks the cursor 1:1 during drag with no spring lag. miuix's
// fill spring (0.9, 1755 dragging / 0.96, 322 idle) is functionally close
// to instant at those stiffnesses; revisit if visual settle on release
// reveals a perceptible gap.
//
// POC scope: keyPoints + magneticThreshold and VerticalSlider / RangeSlider
// not yet ported.

import { Motion } from 'motion-v'
import { computed, onMounted, onUnmounted, ref } from 'vue'
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

// Dimensions from SliderDefaults + SliderTrack Canvas math.
const TRACK_HEIGHT = 28
const THUMB_RADIUS = TRACK_HEIGHT / 2 // 14
const KNOB_RADIUS = THUMB_RADIUS * 0.72 // 10.08
const THUMB_HIT_RADIUS = KNOB_RADIUS + THUMB_RADIUS * 0.5 // 17.08
const SCALE_ACTIVE = 1.127

const thumbScaleTransition = folmeSpring(0.6, 987)
const trackAlphaTransition = { duration: 0.15 }

const trackRef = ref<HTMLElement | null>(null)
const trackWidth = ref(0)
const pressed = ref(false)
const hoveredThumb = ref(false)
const isDragging = ref(false)
let activePointerId: number | null = null
let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  if (!trackRef.value) return
  trackWidth.value = trackRef.value.getBoundingClientRect().width
  if (typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(() => {
      if (trackRef.value) trackWidth.value = trackRef.value.getBoundingClientRect().width
    })
    resizeObserver.observe(trackRef.value)
  }
})

onUnmounted(() => {
  resizeObserver?.disconnect()
  resizeObserver = null
})

const range = computed(() => props.max - props.min)
const fraction = computed(() => {
  if (range.value <= 0) return 0
  return Math.max(0, Math.min(1, (props.modelValue - props.min) / range.value))
})

const availableWidth = computed(() => Math.max(0, trackWidth.value - 2 * THUMB_RADIUS))
const thumbCenterX = computed(() => THUMB_RADIUS + fraction.value * availableWidth.value)
// Round line cap extends visible fill past thumbCenter by thumbRadius.
const fillWidth = computed(() => thumbCenterX.value + THUMB_RADIUS)

const thumbScale = computed(() => {
  if (props.disabled) return 1
  if (pressed.value || hoveredThumb.value || isDragging.value) return SCALE_ACTIVE
  return 1
})

function snapToStep(value: number): number {
  if (props.step <= 0) return value
  const steps = Math.round((value - props.min) / props.step)
  return props.min + steps * props.step
}

function emitValueFromClientX(clientX: number): void {
  if (!trackRef.value) return
  const rect = trackRef.value.getBoundingClientRect()
  // Map clientX into the available drag region [thumbRadius, trackWidth - thumbRadius].
  const localX = clientX - rect.left
  const usable = availableWidth.value
  const x = Math.max(0, Math.min(usable, localX - THUMB_RADIUS))
  const f = usable > 0 ? x / usable : 0
  const raw = props.min + f * range.value
  const next = snapToStep(raw)
  const clamped = Math.max(props.min, Math.min(props.max, next))
  if (clamped !== props.modelValue) {
    emit('update:modelValue', clamped)
    emit('change', clamped)
  }
}

function updateThumbHover(event: PointerEvent): void {
  if (props.disabled || event.pointerType !== 'mouse') {
    hoveredThumb.value = false
    return
  }
  if (!trackRef.value) return
  const rect = trackRef.value.getBoundingClientRect()
  const dx = event.clientX - rect.left - thumbCenterX.value
  hoveredThumb.value = Math.abs(dx) <= THUMB_HIT_RADIUS
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
  if (activePointerId === event.pointerId) {
    emitValueFromClientX(event.clientX)
    return
  }
  updateThumbHover(event)
}

function onPointerUp(event: PointerEvent): void {
  if (activePointerId !== event.pointerId) return
  pressed.value = false
  isDragging.value = false
  activePointerId = null
  ;(event.currentTarget as HTMLElement).releasePointerCapture(event.pointerId)
  updateThumbHover(event)
}

function onPointerLeave(): void {
  hoveredThumb.value = false
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
    @pointerleave="onPointerLeave"
  >
    <div class="m-slider__fill" :style="{ width: `${fillWidth}px` }" />
    <Motion
      class="m-slider__drag-overlay"
      :initial="false"
      :animate="{ opacity: isDragging ? 0.044 : 0 }"
      :transition="trackAlphaTransition"
    />
    <Motion
      class="m-slider__thumb"
      :initial="false"
      :style="{ left: `${thumbCenterX - KNOB_RADIUS}px` }"
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
  height: 28px;
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
    width: 0; // explicit default — Vue :style binding drives the actual width
    background: var(--m-color-primary);
    border-radius: 9999px;
    pointer-events: none;
  }

  // Mirrors SliderTrack's drawRect(Color.Black, alpha) during isDragging.
  &__drag-overlay {
    position: absolute;
    inset: 0;
    background: #000;
    opacity: 0;
    pointer-events: none;
  }

  &__thumb {
    position: absolute;
    // Track 28 - knob 20.16 = 7.84 of vertical space → 3.92 above and below.
    top: 3.92px;
    width: 20.16px;
    height: 20.16px;
    border-radius: 50%;
    background: var(--m-color-on-primary);
    transform-origin: center center;
    pointer-events: none;
  }
}
</style>
