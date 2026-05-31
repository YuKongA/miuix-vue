<script setup lang="ts">
// Copyright 2026, miuix-vue contributors
// SPDX-License-Identifier: Apache-2.0
//
// Ported from miuix-ui/.../basic/Slider.kt → RangeSlider (horizontal only;
// matches source, which doesn't define a vertical range slider).
//
// Two thumbs share one track. modelValue is `[start, end]`. While dragging, an
// internal copy diverges from the prop so the parent's clamping doesn't bounce
// the value mid-drag; on release we sync back. This mirrors the `if (!isDragging)`
// guard around `currentStartValue / currentEndValue` in the source.
//
// Cross-over behavior (1:1 with source): when the dragged thumb meets the other
// at the same value AND the drag still pushes in the crossing direction, drag
// ownership swaps to the other thumb (carrying the running offset over).
//
// Geometry / animation / snap rules match `Slider.vue` — see header there.
// keyPointRadius for RangeSlider is `SliderDefaults.KeyPointRadius = 3.855dp`
// (source uses this constant only on the range track; Slider uses barHeight/7.5).

import { animate, Motion, motionValue } from 'motion-v'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { folmeSpring } from '../../anim'

defineOptions({ name: 'MiuixRangeSlider' })

type RangeValue = [number, number]

interface Props {
  modelValue?: RangeValue
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  showKeyPoints?: boolean
  keyPoints?: number[]
  magnetThreshold?: number
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [0, 100] as RangeValue,
  min: 0,
  max: 100,
  step: 0,
  disabled: false,
  showKeyPoints: false,
  keyPoints: () => [],
  magnetThreshold: 0.02,
})

const emit = defineEmits<{
  'update:modelValue': [value: RangeValue]
  change: [value: RangeValue]
  'change-end': []
}>()

const TRACK_THICKNESS = 28
const THUMB_RADIUS = TRACK_THICKNESS / 2
const KNOB_RADIUS = THUMB_RADIUS * 0.72
const KNOB_OFFSET = THUMB_RADIUS - KNOB_RADIUS
const THUMB_HIT_RADIUS = KNOB_RADIUS + THUMB_RADIUS * 0.5
const KEYPOINT_RADIUS = 3.855 // source: SliderDefaults.KeyPointRadius
const SCALE_ACTIVE = 1.127

const thumbScaleTransition = folmeSpring(0.6, 987)
const trackAlphaTransition = { duration: 0.15, ease: [0.4, 0, 0.2, 1] as const }
const progressDraggingSpec = folmeSpring(0.9, 1755)
const progressIdleSpec = folmeSpring(0.96, 322)

const trackRef = ref<HTMLElement | null>(null)
const trackLength = ref(0)
const pressed = ref(false)
const isDraggingStart = ref(false)
const isDraggingEnd = ref(false)
const isDragging = computed(() => isDraggingStart.value || isDraggingEnd.value)
const isHoveringStartThumb = ref(false)
const isHoveringEndThumb = ref(false)
const lastDraggedIsStart = ref(true)
let activePointerId: number | null = null
let resizeObserver: ResizeObserver | null = null

// `startDragOffset` / `endDragOffset` are accumulated drag positions in track-
// local px. We update them by adding per-move deltas (not by snapping to the
// raw pointer) — this matches `startDragOffset += dragAmount` in source and
// preserves "hysteresis at the limits" (the slider doesn't immediately follow
// the pointer back after being clamped against the other thumb).
let startDragOffset = 0
let endDragOffset = 0
let lastPointerLocal = 0

function clampToRange(v: number): number {
  return Math.max(props.min, Math.min(props.max, v))
}

const coercedStart = computed(() => clampToRange(props.modelValue[0]))
const coercedEnd = computed(() => clampToRange(props.modelValue[1]))

// Internal "live" values during drag — diverge from props until dragStop.
const currentStartValue = ref(coercedStart.value)
const currentEndValue = ref(coercedEnd.value)
watch([coercedStart, coercedEnd], ([s, e]) => {
  if (!isDragging.value) {
    currentStartValue.value = s
    currentEndValue.value = e
  }
})

const range = computed(() => props.max - props.min)

const stepFractions = computed<number[]>(() => {
  if (props.step <= 0 || range.value <= 0) return []
  const out: number[] = []
  const eps = props.step * 1e-6
  for (let v = props.min; v <= props.max + eps; v += props.step) {
    out.push(Math.max(0, Math.min(1, (v - props.min) / range.value)))
  }
  return out
})

const customKeyFractions = computed<number[]>(() => {
  if (!props.keyPoints || props.keyPoints.length === 0 || range.value <= 0) return []
  return props.keyPoints.map((v) => Math.max(0, Math.min(1, (v - props.min) / range.value)))
})

const visibleKeyFractions = computed<number[]>(() => {
  if (customKeyFractions.value.length > 0) return customKeyFractions.value
  if (props.showKeyPoints) return stepFractions.value
  return []
})

const magnetFractions = computed<number[]>(() => customKeyFractions.value)

// Two independent spring-animated values for the two thumbs.
const animatedStartMv = motionValue(coercedStart.value)
const animatedEndMv = motionValue(coercedEnd.value)
const animatedStart = ref(coercedStart.value)
const animatedEnd = ref(coercedEnd.value)
const unsubscribeStart = animatedStartMv.on('change', (v: number) => {
  animatedStart.value = v
})
const unsubscribeEnd = animatedEndMv.on('change', (v: number) => {
  animatedEnd.value = v
})
let startAnim: { stop: () => void } | null = null
let endAnim: { stop: () => void } | null = null

function retargetStart(target: number, dragging: boolean): void {
  startAnim?.stop()
  startAnim = animate(animatedStartMv, target, dragging ? progressDraggingSpec : progressIdleSpec)
}
function retargetEnd(target: number, dragging: boolean): void {
  endAnim?.stop()
  endAnim = animate(animatedEndMv, target, dragging ? progressDraggingSpec : progressIdleSpec)
}

watch(currentStartValue, (v) => retargetStart(v, isDragging.value))
watch(currentEndValue, (v) => retargetEnd(v, isDragging.value))
watch(isDragging, (d) => {
  retargetStart(currentStartValue.value, d)
  retargetEnd(currentEndValue.value, d)
})

function measureTrack(): void {
  if (!trackRef.value) return
  trackLength.value = trackRef.value.getBoundingClientRect().width
}

onMounted(() => {
  if (!trackRef.value) return
  measureTrack()
  if (typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(() => measureTrack())
    resizeObserver.observe(trackRef.value)
  }
})

onUnmounted(() => {
  resizeObserver?.disconnect()
  resizeObserver = null
  startAnim?.stop()
  endAnim?.stop()
  unsubscribeStart()
  unsubscribeEnd()
})

const availableLen = computed(() => Math.max(0, trackLength.value - 2 * THUMB_RADIUS))

function valueToFraction(v: number): number {
  if (range.value <= 0) return 0
  return Math.max(0, Math.min(1, (v - props.min) / range.value))
}

// Source RangeSlider has no reverseDirection; direction is purely LTR here.
const startThumbCenter = computed(
  () => THUMB_RADIUS + valueToFraction(animatedStart.value) * availableLen.value,
)
const endThumbCenter = computed(
  () => THUMB_RADIUS + valueToFraction(animatedEnd.value) * availableLen.value,
)

// Fill spans between the two thumbs.
const fillStyle = computed<Record<string, string>>(() => {
  const a = Math.min(startThumbCenter.value, endThumbCenter.value)
  const b = Math.max(startThumbCenter.value, endThumbCenter.value)
  const left = Math.max(0, a - THUMB_RADIUS)
  const right = Math.min(trackLength.value, b + THUMB_RADIUS)
  return {
    top: '0',
    bottom: '0',
    left: `${left}px`,
    width: `${Math.max(0, right - left)}px`,
  }
})

const startThumbStyle = computed<Record<string, string>>(() => ({
  top: `${KNOB_OFFSET}px`,
  left: `${startThumbCenter.value - KNOB_RADIUS}px`,
}))
const endThumbStyle = computed<Record<string, string>>(() => ({
  top: `${KNOB_OFFSET}px`,
  left: `${endThumbCenter.value - KNOB_RADIUS}px`,
}))

const startThumbScale = computed(() => {
  if (props.disabled) return 1
  if (isDraggingStart.value || pressed.value || isHoveringStartThumb.value) return SCALE_ACTIVE
  return 1
})
const endThumbScale = computed(() => {
  if (props.disabled) return 1
  if (isDraggingEnd.value || pressed.value || isHoveringEndThumb.value) return SCALE_ACTIVE
  return 1
})

interface KeyPointRender {
  key: number
  style: Record<string, string>
  selected: boolean
}

const keyPointRenders = computed<KeyPointRender[]>(() => {
  const fractions = visibleKeyFractions.value
  if (fractions.length === 0) return []
  const out: KeyPointRender[] = []
  const len = availableLen.value
  const size = `${KEYPOINT_RADIUS * 2}px`
  const lo = Math.min(startThumbCenter.value, endThumbCenter.value)
  const hi = Math.max(startThumbCenter.value, endThumbCenter.value)
  for (let i = 0; i < fractions.length; i++) {
    const stepF = fractions[i] as number
    const pos = THUMB_RADIUS + stepF * len
    const selected = pos >= lo && pos <= hi
    out.push({
      key: i,
      style: {
        left: `${pos - KEYPOINT_RADIUS}px`,
        top: '50%',
        transform: 'translateY(-50%)',
        width: size,
        height: size,
      },
      selected,
    })
  }
  return out
})

function snapToStep(value: number): number {
  if (props.step <= 0) return value
  const n = Math.round((value - props.min) / props.step)
  return props.min + n * props.step
}

function fractionToValue(f: number): number {
  const clamped = Math.max(0, Math.min(1, f))
  const linear = props.min + clamped * range.value
  if (props.step > 0) {
    return clampToRange(snapToStep(linear))
  }
  const magnets = magnetFractions.value
  if (magnets.length > 0) {
    let bestF = magnets[0] as number
    let bestD = Math.abs(bestF - clamped)
    for (let i = 1; i < magnets.length; i++) {
      const candidate = magnets[i] as number
      const d = Math.abs(candidate - clamped)
      if (d < bestD) {
        bestD = d
        bestF = candidate
      }
    }
    if (bestD < props.magnetThreshold) {
      return props.min + bestF * range.value
    }
  }
  return linear
}

function offsetToValue(offsetPx: number): number {
  const len = availableLen.value
  if (len <= 0) return props.min
  const visual = Math.max(0, Math.min(1, (offsetPx - THUMB_RADIUS) / len))
  return fractionToValue(visual)
}

function emitChange(start: number, end: number): void {
  if (start !== props.modelValue[0] || end !== props.modelValue[1]) {
    const next: RangeValue = [start, end]
    emit('update:modelValue', next)
    emit('change', next)
  }
}

function pointerLocalX(event: PointerEvent): number {
  if (!trackRef.value) return 0
  return event.clientX - trackRef.value.getBoundingClientRect().left
}

function hitTestThumbs(localX: number): { hitStart: boolean; hitEnd: boolean } {
  const startX = startThumbCenter.value
  const endX = endThumbCenter.value
  return {
    hitStart: Math.abs(localX - startX) <= THUMB_HIT_RADIUS,
    hitEnd: Math.abs(localX - endX) <= THUMB_HIT_RADIUS,
  }
}

function updateThumbHover(event: PointerEvent): void {
  if (props.disabled || event.pointerType !== 'mouse') {
    isHoveringStartThumb.value = false
    isHoveringEndThumb.value = false
    return
  }
  const { hitStart, hitEnd } = hitTestThumbs(pointerLocalX(event))
  isHoveringStartThumb.value = hitStart
  isHoveringEndThumb.value = hitEnd
}

function onPointerDown(event: PointerEvent): void {
  if (props.disabled) return
  const local = pointerLocalX(event)
  const { hitStart, hitEnd } = hitTestThumbs(local)

  pressed.value = true
  activePointerId = event.pointerId
  ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
  lastPointerLocal = local

  if (hitStart && !hitEnd) {
    isDraggingStart.value = true
    startDragOffset = local
  } else if (!hitStart && hitEnd) {
    isDraggingEnd.value = true
    endDragOffset = local
  } else if (hitStart && hitEnd) {
    if (lastDraggedIsStart.value) {
      isDraggingStart.value = true
      startDragOffset = local
    } else {
      isDraggingEnd.value = true
      endDragOffset = local
    }
  } else {
    // Bare track: jump the closer thumb to the click, then drag from there
    // (click-to-set, Web idiom per CLAUDE.md #2; miuix moves only on drag).
    // Clicking directly on a thumb just grabs it (no jump) for fine-tuning.
    const diffStart = Math.abs(local - startThumbCenter.value)
    const diffEnd = Math.abs(local - endThumbCenter.value)
    const candidate = offsetToValue(local)
    if (diffStart <= diffEnd) {
      isDraggingStart.value = true
      startDragOffset = local
      const newStart = Math.min(candidate, currentEndValue.value)
      currentStartValue.value = newStart
      emitChange(newStart, currentEndValue.value)
    } else {
      isDraggingEnd.value = true
      endDragOffset = local
      const newEnd = Math.max(candidate, currentStartValue.value)
      currentEndValue.value = newEnd
      emitChange(currentStartValue.value, newEnd)
    }
  }
}

function onPointerMove(event: PointerEvent): void {
  if (activePointerId !== event.pointerId) {
    updateThumbHover(event)
    return
  }
  const local = pointerLocalX(event)
  const dragAmount = local - lastPointerLocal
  lastPointerLocal = local

  if (isDraggingStart.value) {
    lastDraggedIsStart.value = true
    const tentative = startDragOffset + dragAmount
    const candidate = offsetToValue(tentative)
    const newStart = Math.min(candidate, currentEndValue.value)
    const crossCondition = dragAmount > 0
    if (
      newStart >= currentEndValue.value &&
      crossCondition &&
      currentStartValue.value === currentEndValue.value
    ) {
      isDraggingStart.value = false
      isDraggingEnd.value = true
      endDragOffset = tentative
      const newEnd = Math.max(offsetToValue(endDragOffset), currentStartValue.value)
      currentEndValue.value = newEnd
      emitChange(currentStartValue.value, newEnd)
    } else {
      startDragOffset = tentative
      currentStartValue.value = newStart
      emitChange(newStart, currentEndValue.value)
    }
  } else if (isDraggingEnd.value) {
    lastDraggedIsStart.value = false
    const tentative = endDragOffset + dragAmount
    const candidate = offsetToValue(tentative)
    const newEnd = Math.max(candidate, currentStartValue.value)
    const crossCondition = dragAmount < 0
    if (
      newEnd <= currentStartValue.value &&
      crossCondition &&
      currentStartValue.value === currentEndValue.value
    ) {
      isDraggingEnd.value = false
      isDraggingStart.value = true
      startDragOffset = tentative
      const newStart = Math.min(offsetToValue(startDragOffset), currentEndValue.value)
      currentStartValue.value = newStart
      emitChange(newStart, currentEndValue.value)
    } else {
      endDragOffset = tentative
      currentEndValue.value = newEnd
      emitChange(currentStartValue.value, newEnd)
    }
  }
}

function onPointerUp(event: PointerEvent): void {
  if (activePointerId !== event.pointerId) return
  pressed.value = false
  const wasDragging = isDragging.value
  isDraggingStart.value = false
  isDraggingEnd.value = false
  activePointerId = null
  ;(event.currentTarget as HTMLElement).releasePointerCapture(event.pointerId)
  updateThumbHover(event)
  if (wasDragging) emit('change-end')
}

function onPointerLeave(): void {
  isHoveringStartThumb.value = false
  isHoveringEndThumb.value = false
}
</script>

<template>
  <div
    ref="trackRef"
    role="slider"
    tabindex="0"
    class="m-range-slider"
    :class="{ 'm-range-slider--disabled': props.disabled }"
    :aria-valuemin="props.min"
    :aria-valuemax="props.max"
    :aria-valuenow="props.modelValue[1]"
    :aria-disabled="props.disabled"
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @pointerup="onPointerUp"
    @pointercancel="onPointerUp"
    @pointerleave="onPointerLeave"
  >
    <div class="m-range-slider__fill" :style="fillStyle" />
    <Motion
      class="m-range-slider__drag-overlay"
      :initial="false"
      :animate="{ opacity: isDragging ? 0.044 : 0 }"
      :transition="trackAlphaTransition"
    />
    <div
      v-for="kp in keyPointRenders"
      :key="kp.key"
      class="m-range-slider__keypoint"
      :class="{ 'm-range-slider__keypoint--selected': kp.selected }"
      :style="kp.style"
    />
    <Motion
      class="m-range-slider__thumb"
      :initial="false"
      :style="startThumbStyle"
      :animate="{ scale: startThumbScale }"
      :transition="thumbScaleTransition"
    />
    <Motion
      class="m-range-slider__thumb"
      :initial="false"
      :style="endThumbStyle"
      :animate="{ scale: endThumbScale }"
      :transition="thumbScaleTransition"
    />
  </div>
</template>

<style lang="scss">
.m-range-slider {
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

  // Disabled swaps to the dedicated disabled tokens (miuix SliderColors); key
  // points are not enabled-dependent, so they stay unchanged.
  &--disabled {
    cursor: not-allowed;
    background: var(--m-color-disabled-secondary);

    .m-range-slider__fill {
      background: var(--m-color-disabled-primary-slider);
    }
    .m-range-slider__thumb {
      background: var(--m-color-disabled-on-primary);
    }
  }

  &:focus-visible {
    box-shadow: 0 0 0 2px var(--m-color-primary);
  }

  &__fill {
    position: absolute;
    background: var(--m-color-primary);
    border-radius: 9999px;
    pointer-events: none;
  }

  &__drag-overlay {
    position: absolute;
    inset: 0;
    background: #000;
    opacity: 0;
    pointer-events: none;
  }

  &__keypoint {
    position: absolute;
    border-radius: 50%;
    background: var(--m-color-slider-key-point);
    pointer-events: none;
  }

  &__keypoint--selected {
    background: var(--m-color-slider-key-point-foreground);
  }

  &__thumb {
    position: absolute;
    width: 20.16px;
    height: 20.16px;
    border-radius: 50%;
    background: var(--m-color-on-primary);
    transform-origin: center center;
    pointer-events: none;
  }
}
</style>
