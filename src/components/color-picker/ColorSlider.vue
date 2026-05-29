<script setup lang="ts">
// Copyright 2026, miuix-vue contributors
// SPDX-License-Identifier: Apache-2.0
//
// Internal generic color slider (ColorSlider in ColorPicker.kt). Height 26,
// capsule, a horizontal gradient with a 0.5px gray border, and a 20px white
// ring indicator (6px stroke + soft glow). The value (0..1) maps so the
// indicator center travels from half-height to width - half-height
// (handleSliderInteraction).
//
// The source's Brush.horizontalGradient runs startX = height/2 (13) to
// endX = width - 13 with TileMode.Clamp — i.e. the colour ramp is inset by 13px
// each side and the ends are held flat. We reproduce that with px-anchored
// colour stops: each stop sits at calc(13px + (100% - 26px) * at), and CSS
// clamps to the first/last colour outside the first/last stop.

import { computed, onMounted, onUnmounted, ref } from 'vue'

defineOptions({ name: 'MiuixColorSlider' })

interface ColorStop {
  /** CSS colour. */
  color: string
  /** Position along the inset ramp, 0..1. */
  at: number
}

interface Props {
  modelValue?: number
  /** Colour ramp as ordered stops (0..1); inset by 13px per side at render. */
  stops: ColorStop[]
  /** Render an alpha checkerboard behind the gradient. */
  checker?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: 0,
  checker: false,
})

// startX = height/2 = 13, endX = width - 13 → ramp width = 100% - 26px.
const gradientCss = computed(
  () =>
    `linear-gradient(to right, ${props.stops
      .map((stop) => `${stop.color} calc(13px + (100% - 26px) * ${stop.at})`)
      .join(', ')})`,
)

const emit = defineEmits<{ 'update:modelValue': [value: number] }>()

const HEIGHT = 26
const INDICATOR = 20

const trackRef = ref<HTMLElement | null>(null)
const width = ref(0)
let ro: ResizeObserver | null = null
let active: number | null = null

function measure(): void {
  if (trackRef.value) width.value = trackRef.value.clientWidth
}
onMounted(() => {
  measure()
  if (trackRef.value && typeof ResizeObserver !== 'undefined') {
    ro = new ResizeObserver(measure)
    ro.observe(trackRef.value)
  }
})
onUnmounted(() => ro?.disconnect())

function valueFromX(clientX: number): number {
  if (!trackRef.value) return props.modelValue
  const rect = trackRef.value.getBoundingClientRect()
  const half = HEIGHT / 2
  const eff = rect.width - HEIGHT
  if (eff <= 0) return 0
  const x = Math.min(rect.width - half, Math.max(half, clientX - rect.left))
  return Math.min(1, Math.max(0, (x - half) / eff))
}

function onDown(e: PointerEvent): void {
  active = e.pointerId
  ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  emit('update:modelValue', valueFromX(e.clientX))
}
function onMove(e: PointerEvent): void {
  if (active !== e.pointerId) return
  emit('update:modelValue', valueFromX(e.clientX))
}
function onUp(e: PointerEvent): void {
  if (active !== e.pointerId) return
  active = null
  ;(e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId)
}

function indicatorLeft(): number {
  const eff = width.value - HEIGHT
  return props.modelValue * eff + HEIGHT / 2
}
</script>

<template>
  <div
    ref="trackRef"
    class="m-color-slider"
    :class="{ 'm-color-slider--checker': props.checker }"
    @pointerdown="onDown"
    @pointermove="onMove"
    @pointerup="onUp"
    @pointercancel="onUp"
  >
    <div class="m-color-slider__gradient" :style="{ backgroundImage: gradientCss }" />
    <div
      class="m-color-slider__indicator"
      :style="{ left: `${indicatorLeft()}px` }"
      :data-size="INDICATOR"
    />
  </div>
</template>

<style lang="scss">
.m-color-slider {
  position: relative;
  width: 100%;
  height: 26px;
  border-radius: 9999px;
  overflow: hidden;
  touch-action: none;
  cursor: pointer;

  &--checker {
    background-image: conic-gradient(#ccc 25%, #aaa 0 50%, #ccc 0 75%, #aaa 0);
    background-size: 6px 6px;
  }

  &__gradient {
    position: absolute;
    inset: 0;
    border-radius: inherit;
    // borderColor = Color.Gray.copy(0.1) = rgba(136,136,136,0.1) (Color.Gray is
    // 0xFF888888, not CSS gray #808080); 0.5px stroke over the full capsule.
    box-shadow: inset 0 0 0 0.5px rgba(136, 136, 136, 0.1);
  }

  &__indicator {
    position: absolute;
    top: 50%;
    width: 20px;
    height: 20px;
    margin-top: -10px;
    margin-left: -10px;
    border-radius: 50%;
    // White ring: 6dp stroke (ringCenterRadius 7 → spans radius 4..10).
    border: 6px solid #fff;
    box-sizing: border-box;
    // glow: radialGradient peaking at black 0.25 around the ring band ±2dp.
    box-shadow: 0 0 2px rgba(0, 0, 0, 0.25);
    pointer-events: none;
  }
}
</style>
