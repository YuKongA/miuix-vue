<script setup lang="ts">
// Copyright 2026, miuix-vue contributors
// SPDX-License-Identifier: Apache-2.0
//
// Ported from miuix-ui/.../basic/Slider.kt (Slider + VerticalSlider, unified
// here via `orientation` per Vue idiom — see CLAUDE.md rule #2).
//
// Geometry (1:1 with Canvas math in SliderTrack):
//   trackThickness = SliderDefaults.MinHeight = 28
//   thumbRadius    = trackThickness / 2       = 14
//   knobRadius     = thumbRadius * 0.72       = 10.08  (visible thumb)
//   knobOffset     = thumbRadius - knobRadius = 3.92   (centers knob in track)
//   availableLen   = trackLen - 2 * thumbRadius        (thumb travel range)
//   thumbCenter    = thumbRadius + effectiveFraction * availableLen
// Fill is a Canvas line with stroke = trackThickness + Round caps, so the
// visible fill extends past the line endpoint by thumbRadius (clipped by the
// rounded track shape).
//
// Animation (1:1 with source):
//   progress value (drag):           folmeSpring(0.9, 1755)
//   progress value (idle / settle):  folmeSpring(0.96, 322)
//   thumb scale (press/drag/hover):  folmeSpring(0.6, 987) → 1.0 ↔ 1.127
//   track alpha overlay on drag:     tween 150ms, 0 → 0.044 (black)
//
// Snap behavior:
//   step > 0       → hard snap to step (HTML <input type=range> idiom).
//                    miuix's `steps: Int` (count between endpoints) is
//                    re-expressed as `step: number` (size) per CLAUDE.md #2.
//   keyPoints set  → magnetic soft snap if within magnetThreshold (default 2%).
//                    Source treats `keyPoints` and `steps` as independent; the
//                    Vue port mirrors that — `step` wins over `keyPoints` for
//                    snap behavior, matching `resolveValueFromFraction`.
//   else           → continuous.
//
// Hover only triggers when the *mouse* cursor enters the thumb's hit area:
//   hitRadius = knobRadius + thumbRadius * 0.5 = 17.08
// Touch hover is impossible; touch only fires press/drag (matches source's
// `change.type != PointerType.Mouse` early-continue).

import { animate, Motion, motionValue } from 'motion-v'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { folmeSpring } from '../../anim'

defineOptions({ name: 'MiuixSlider' })

type Orientation = 'horizontal' | 'vertical'

interface Props {
  modelValue?: number
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  orientation?: Orientation
  reverseDirection?: boolean
  showKeyPoints?: boolean
  keyPoints?: number[]
  magnetThreshold?: number
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: 0,
  min: 0,
  max: 100,
  step: 0,
  disabled: false,
  orientation: 'horizontal',
  reverseDirection: false,
  showKeyPoints: false,
  keyPoints: () => [],
  magnetThreshold: 0.02,
})

const emit = defineEmits<{
  'update:modelValue': [value: number]
  change: [value: number]
  'change-end': []
}>()

const SCALE_ACTIVE = 1.127

// Geometry derives from the ACTUAL cross-axis thickness (track height for
// horizontal, width for vertical), mirroring miuix's Canvas math where
// thumbRadius = bar(Height|Width)/2. Hardcoding 28 skewed the knob + key
// points whenever the thickness differed (e.g. the 25dp vertical sliders).
const trackThickness = ref(28)
const thumbRadius = computed(() => trackThickness.value / 2)
const knobRadius = computed(() => thumbRadius.value * 0.72)
const knobOffset = computed(() => thumbRadius.value - knobRadius.value)
const keyPointRadius = computed(() => trackThickness.value / 7.5)
const thumbHitRadius = computed(() => knobRadius.value + thumbRadius.value * 0.5)

const thumbScaleTransition = folmeSpring(0.6, 987)
// tween(150) with Compose's default FastOutSlowInEasing (cubic-bezier .4,0,.2,1).
const trackAlphaTransition = { duration: 0.15, ease: [0.4, 0, 0.2, 1] as const }
const progressDraggingSpec = folmeSpring(0.9, 1755)
const progressIdleSpec = folmeSpring(0.96, 322)

const isVertical = computed(() => props.orientation === 'vertical')

const trackRef = ref<HTMLElement | null>(null)
const trackLength = ref(0)
const pressed = ref(false)
const hoveredThumb = ref(false)
const isDragging = ref(false)
let activePointerId: number | null = null
let resizeObserver: ResizeObserver | null = null

const coercedValue = computed(() => Math.max(props.min, Math.min(props.max, props.modelValue)))
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

// Visible ticks: keyPoints override step ticks; showKeyPoints toggles step ticks.
// Matches `computeKeyPointFractions` in source.
const visibleKeyFractions = computed<number[]>(() => {
  if (customKeyFractions.value.length > 0) return customKeyFractions.value
  if (props.showKeyPoints) return stepFractions.value
  return []
})

// Magnetic snap targets: only when `keyPoints` is set (matches `step > 0` vs
// `keyPoints != null` branches in `resolveValueFromFraction`).
const magnetFractions = computed<number[]>(() => customKeyFractions.value)

const animatedValueMv = motionValue(coercedValue.value)
const animatedValue = ref(coercedValue.value)
const unsubscribeAnimatedValue = animatedValueMv.on('change', (v: number) => {
  animatedValue.value = v
})
let currentProgressAnim: { stop: () => void } | null = null

function retargetProgress(target: number, dragging: boolean): void {
  currentProgressAnim?.stop()
  currentProgressAnim = animate(
    animatedValueMv,
    target,
    dragging ? progressDraggingSpec : progressIdleSpec,
  )
}

watch(coercedValue, (v) => retargetProgress(v, isDragging.value))
watch(isDragging, (d) => retargetProgress(coercedValue.value, d))

function measureTrack(): void {
  if (!trackRef.value) return
  const rect = trackRef.value.getBoundingClientRect()
  trackLength.value = isVertical.value ? rect.height : rect.width
  trackThickness.value = isVertical.value ? rect.width : rect.height
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
  currentProgressAnim?.stop()
  unsubscribeAnimatedValue()
})

watch(isVertical, measureTrack)

const fraction = computed(() => {
  if (range.value <= 0) return 0
  return Math.max(0, Math.min(1, (animatedValue.value - props.min) / range.value))
})

const availableLen = computed(() => Math.max(0, trackLength.value - 2 * thumbRadius.value))

// Vertical default = bottom-to-top, so fraction=1 sits at the top (y=thumbRadius).
const effectiveFraction = computed(() => {
  const f = fraction.value
  if (isVertical.value) return props.reverseDirection ? f : 1 - f
  return props.reverseDirection ? 1 - f : f
})

const thumbCenter = computed(() => thumbRadius.value + effectiveFraction.value * availableLen.value)

// All branches return the same key set so the resulting shape matches
// `Record<string, string>` without producing `... | undefined` properties.
const fillStyle = computed<Record<string, string>>(() => {
  const center = thumbCenter.value
  if (isVertical.value) {
    // Source draws from y=barHeight (bottom) to y=centerY in Canvas coords.
    // In CSS y grows downward, so fill is bottom-anchored regardless of reverse.
    const fillH = Math.max(0, trackLength.value - (center - thumbRadius.value))
    return {
      left: '0',
      right: '0',
      top: 'auto',
      bottom: '0',
      width: 'auto',
      height: `${fillH}px`,
    }
  }
  if (props.reverseDirection) {
    const leftPx = Math.max(0, center - thumbRadius.value)
    return {
      top: '0',
      bottom: '0',
      left: `${leftPx}px`,
      right: '0',
      width: 'auto',
      height: 'auto',
    }
  }
  const w = Math.min(trackLength.value, center + thumbRadius.value)
  return {
    top: '0',
    bottom: '0',
    left: '0',
    right: 'auto',
    width: `${w}px`,
    height: 'auto',
  }
})

const thumbStyle = computed<Record<string, string>>(() => {
  const center = thumbCenter.value
  // Knob diameter = 2 * knobRadius (scales with the actual track thickness).
  const size = `${knobRadius.value * 2}px`
  if (isVertical.value) {
    return {
      left: `${knobOffset.value}px`,
      top: `${center - knobRadius.value}px`,
      width: size,
      height: size,
    }
  }
  return {
    top: `${knobOffset.value}px`,
    left: `${center - knobRadius.value}px`,
    width: size,
    height: size,
  }
})

const thumbScale = computed(() => {
  if (props.disabled) return 1
  if (pressed.value || hoveredThumb.value || isDragging.value) return SCALE_ACTIVE
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
  const size = `${keyPointRadius.value * 2}px`
  for (let i = 0; i < fractions.length; i++) {
    const stepF = fractions[i] as number
    const effStep = isVertical.value
      ? props.reverseDirection
        ? stepF
        : 1 - stepF
      : props.reverseDirection
        ? 1 - stepF
        : stepF
    const pos = thumbRadius.value + effStep * len
    // Tick is "selected" (foreground color) when it lies on the filled side.
    // Source: horizontal non-reverse → x <= centerX; reverse → x >= centerX.
    //         vertical → y >= centerY (always — fill is bottom-anchored).
    const selected = isVertical.value
      ? pos >= thumbCenter.value
      : props.reverseDirection
        ? pos >= thumbCenter.value
        : pos <= thumbCenter.value
    const style = isVertical.value
      ? {
          top: `${pos - keyPointRadius.value}px`,
          left: '50%',
          transform: 'translateX(-50%)',
          width: size,
          height: size,
        }
      : {
          left: `${pos - keyPointRadius.value}px`,
          top: '50%',
          transform: 'translateY(-50%)',
          width: size,
          height: size,
        }
    out.push({ key: i, style, selected })
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
    return Math.max(props.min, Math.min(props.max, snapToStep(linear)))
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

function pointerToVisualFraction(event: PointerEvent): number {
  if (!trackRef.value) return 0
  const rect = trackRef.value.getBoundingClientRect()
  const len = availableLen.value
  if (len <= 0) return 0
  const local = isVertical.value
    ? event.clientY - rect.top - thumbRadius.value
    : event.clientX - rect.left - thumbRadius.value
  return Math.max(0, Math.min(1, local / len))
}

function emitValueFromPointer(event: PointerEvent): void {
  const visual = pointerToVisualFraction(event)
  const fractionForValue = isVertical.value
    ? props.reverseDirection
      ? visual
      : 1 - visual
    : props.reverseDirection
      ? 1 - visual
      : visual
  const next = fractionToValue(fractionForValue)
  if (next !== props.modelValue) {
    emit('update:modelValue', next)
    emit('change', next)
  }
}

function updateThumbHover(event: PointerEvent): void {
  if (props.disabled || event.pointerType !== 'mouse') {
    hoveredThumb.value = false
    return
  }
  if (!trackRef.value) return
  const rect = trackRef.value.getBoundingClientRect()
  const pointer = isVertical.value ? event.clientY - rect.top : event.clientX - rect.left
  hoveredThumb.value = Math.abs(pointer - thumbCenter.value) <= thumbHitRadius.value
}

function onPointerDown(event: PointerEvent): void {
  if (props.disabled) return
  pressed.value = true
  isDragging.value = true
  activePointerId = event.pointerId
  ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
  emitValueFromPointer(event)
}

function onPointerMove(event: PointerEvent): void {
  if (activePointerId === event.pointerId) {
    emitValueFromPointer(event)
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
  emit('change-end')
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
    :class="[`m-slider--${props.orientation}`, { 'm-slider--disabled': props.disabled }]"
    :aria-valuemin="props.min"
    :aria-valuemax="props.max"
    :aria-valuenow="props.modelValue"
    :aria-disabled="props.disabled"
    :aria-orientation="props.orientation"
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @pointerup="onPointerUp"
    @pointercancel="onPointerUp"
    @pointerleave="onPointerLeave"
  >
    <div class="m-slider__fill" :style="fillStyle" />
    <Motion
      class="m-slider__drag-overlay"
      :initial="false"
      :animate="{ opacity: isDragging ? 0.044 : 0 }"
      :transition="trackAlphaTransition"
    />
    <div
      v-for="kp in keyPointRenders"
      :key="kp.key"
      class="m-slider__keypoint"
      :class="{ 'm-slider__keypoint--selected': kp.selected }"
      :style="kp.style"
    />
    <Motion
      class="m-slider__thumb"
      :initial="false"
      :style="thumbStyle"
      :animate="{ scale: thumbScale }"
      :transition="thumbScaleTransition"
    />
  </div>
</template>

<style lang="scss">
.m-slider {
  position: relative;
  display: block;
  background: var(--m-color-slider-background);
  cursor: pointer;
  user-select: none;
  touch-action: none;
  outline: none;
  overflow: hidden;
  border-radius: 9999px;

  &--horizontal {
    width: 100%;
    height: 28px;
  }

  &--vertical {
    width: 28px;
    height: 100%;
    min-height: 80px;
  }

  // Disabled swaps to the dedicated disabled tokens at full alpha (miuix
  // SliderColors); key points are NOT enabled-dependent, so they stay unchanged.
  &--disabled {
    cursor: not-allowed;
    background: var(--m-color-disabled-secondary);

    .m-slider__fill {
      background: var(--m-color-disabled-primary-slider);
    }
    .m-slider__thumb {
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

  // Mirrors SliderTrack's drawRect(Color.Black, alpha) during isDragging.
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
    // width / height come from inline style (knobRadius * 2, thickness-derived).
    border-radius: 50%;
    background: var(--m-color-on-primary);
    transform-origin: center center;
    pointer-events: none;
  }
}
</style>
