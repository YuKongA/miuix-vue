<script setup lang="ts">
// Copyright 2026, miuix-vue contributors
// SPDX-License-Identifier: Apache-2.0
//
// Internal generic color slider (ColorSlider in ColorPicker.kt). Height 26,
// capsule, a horizontal gradient with a 0.5px gray border, and a 20px white
// ring indicator (6px stroke + soft glow). The value (0..1) maps so the
// indicator center travels from half-height to width - half-height
// (handleSliderInteraction).

import { onMounted, onUnmounted, ref } from 'vue'

defineOptions({ name: 'MiuixColorSlider' })

interface Props {
  modelValue?: number
  /** CSS gradient (e.g. 'linear-gradient(to right, ...)'). */
  gradient: string
  /** Render an alpha checkerboard behind the gradient. */
  checker?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: 0,
  checker: false,
})

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
    <div class="m-color-slider__gradient" :style="{ backgroundImage: gradient }" />
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
    box-shadow: inset 0 0 0 0.5px rgba(128, 128, 128, 0.1);
  }

  &__indicator {
    position: absolute;
    top: 50%;
    width: 20px;
    height: 20px;
    margin-top: -10px;
    margin-left: -10px;
    border-radius: 50%;
    border: 3px solid #fff;
    box-sizing: border-box;
    box-shadow: 0 0 2px rgba(0, 0, 0, 0.25);
    pointer-events: none;
  }
}
</style>
