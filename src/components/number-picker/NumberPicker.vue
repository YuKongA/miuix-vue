<script setup lang="ts">
// Copyright 2026, miuix-vue contributors
// SPDX-License-Identifier: Apache-2.0
//
// Ported from miuix-ui/.../basic/NumberPicker.kt.
//
// Vertical wheel: itemHeight 45, visibleItemCount 5 (odd, ≥3), text title1 (32)
// SemiBold. Items fade/scale/recolor by distance from center:
//   normalizedDistance = min(|d| / (half + 0.5), 1)
//   alpha = (1-nd)(1 - nd*0.5);  scale = 1 - 0.2*nd;  yOffset = d * itemHeight
//   color lerps onSurface → onSurfaceSecondary (same hue, alpha-dominated → we
//   use onSurface with the computed alpha).
// Drag moves the offset by dy/itemHeight; release snaps to the nearest item
// (spring 1, 400) with momentum from the fling velocity. Wheel steps by one.
//
// The scroll/drag hit area is the digit column by default. To widen it (e.g. so
// a narrow column is easier to grab on web), set the CSS variable
// `--m-number-picker-hit-padding` (default 0) — it adds grabbable horizontal
// padding flanking the digits without moving them off-centre.

import { computed, ref } from 'vue'
import { animate, motionValue } from 'motion-v'

defineOptions({ name: 'MiuixNumberPicker' })

interface Props {
  modelValue?: number
  min?: number
  max?: number
  visibleItemCount?: number
  itemHeight?: number
  wrapAround?: boolean
  disabled?: boolean
  /** Maps a value to its display string. */
  label?: (value: number) => string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: 0,
  min: 0,
  max: 10,
  visibleItemCount: 5,
  itemHeight: 45,
  wrapAround: false,
  disabled: false,
  label: (v: number) => String(v),
})

const emit = defineEmits<{
  'update:modelValue': [value: number]
  change: [value: number]
}>()

const snapSpring = { type: 'spring' as const, stiffness: 400, damping: 40 }

const count = computed(() => props.max - props.min + 1)
const half = computed(() => Math.floor(props.visibleItemCount / 2))
const coerced = computed(() => Math.min(props.max, Math.max(props.min, props.modelValue)))
const currentIndex = computed(() => coerced.value - props.min)
const totalHeight = computed(() => props.itemHeight * props.visibleItemCount)

// The wheel sizes to its widest label so the scroll/drag hit area is the digit
// column only (not a full-width strip). Items are absolutely positioned, so an
// invisible sizer carrying the longest label gives the container its width.
const widestLabel = computed(() => {
  let widest = ''
  for (let v = props.min; v <= props.max; v++) {
    const s = props.label(v)
    if (s.length > widest.length) widest = s
  }
  return widest || '0'
})

const offset = ref(0)
const offsetMv = motionValue(0)
offsetMv.on('change', (v: number) => {
  offset.value = v
})
let anim: { stop: () => void } | null = null

let activePointer: number | null = null
let lastY = 0
let lastT = 0
let velocity = 0

const renderItems = computed(() => {
  const off = offset.value
  const centerItemOffset = off - Math.round(off)
  const roundedOffset = Math.round(off)
  const h = half.value
  const c = count.value
  const ih = props.itemHeight
  const out: Array<{ key: string; text: string; style: Record<string, string> }> = []
  for (let i = -h - 1; i <= h + 1; i++) {
    const raw = currentIndex.value + i + roundedOffset
    let idx: number
    if (props.wrapAround) {
      idx = ((raw % c) + c) % c
    } else {
      if (raw < 0 || raw >= c) continue
      idx = raw
    }
    const d = i - centerItemOffset
    const nd = Math.min(Math.abs(d) / (h + 0.5), 1)
    // graphicsLayer.alpha = (1-nd)(1 - 0.5*nd). When enabled, the text color
    // also lerps onSurface(α1) → onSurfaceSecondary(α0.8), i.e. an extra
    // (1 - 0.2*nd) alpha factor; the two multiply. (The rgb difference is nil
    // in light and ~242→255 in dark — negligible, kept as the onSurface var.)
    // Disabled uses a single flat colour, so only the geometric alpha applies.
    const alpha = props.disabled
      ? (1 - nd) * (1 - nd * 0.5)
      : (1 - nd) * (1 - nd * 0.5) * (1 - 0.2 * nd)
    const scale = 1 - 0.2 * nd
    const y = d * ih
    out.push({
      key: `${i}-${idx}`,
      text: props.label(props.min + idx),
      style: {
        opacity: String(alpha),
        transform: `translateY(${y}px) scale(${scale})`,
        height: `${ih}px`,
        marginTop: `${-ih / 2}px`,
      },
    })
  }
  return out
})

function clampOffset(v: number): number {
  if (props.wrapAround) return v
  return Math.max(-currentIndex.value, Math.min(count.value - 1 - currentIndex.value, v))
}

function onPointerDown(e: PointerEvent): void {
  if (props.disabled) return
  anim?.stop()
  activePointer = e.pointerId
  lastY = e.clientY
  lastT = e.timeStamp
  velocity = 0
  ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
}

function onPointerMove(e: PointerEvent): void {
  if (activePointer !== e.pointerId) return
  const dy = e.clientY - lastY
  const dt = e.timeStamp - lastT || 16
  velocity = dy / dt // px per ms
  lastY = e.clientY
  lastT = e.timeStamp
  offsetMv.set(clampOffset(offset.value - dy / props.itemHeight))
}

function commit(target: number): void {
  const offsetInt = Math.round(target)
  let newIndex: number
  if (props.wrapAround) {
    newIndex = (((currentIndex.value + offsetInt) % count.value) + count.value) % count.value
  } else {
    newIndex = Math.max(0, Math.min(count.value - 1, currentIndex.value + offsetInt))
  }
  const newValue = props.min + newIndex
  offsetMv.set(0)
  offset.value = 0
  if (newValue !== coerced.value) {
    emit('update:modelValue', newValue)
    emit('change', newValue)
  }
}

function onPointerUp(e: PointerEvent): void {
  if (activePointer !== e.pointerId) return
  activePointer = null
  ;(e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId)
  // Momentum: convert velocity (px/ms) to items, add to current offset.
  const velItems = (-velocity * 1000) / props.itemHeight // items per second
  const projected = clampOffset(offset.value + velItems * 0.12)
  const target = clampOffset(Math.round(projected))
  anim = animate(offsetMv, target, {
    ...snapSpring,
    onComplete: () => commit(target),
  })
}

function onWheel(e: WheelEvent): void {
  if (props.disabled) return
  e.preventDefault()
  const dir = Math.sign(e.deltaY)
  if (dir === 0) return
  commit(clampOffset(dir))
}
</script>

<template>
  <div
    class="m-number-picker"
    :class="{ 'm-number-picker--disabled': props.disabled }"
    :style="{ height: `${totalHeight}px` }"
  >
    <!-- The wheel is content-width and centered, so wheel-scroll / drag only
         act over the digit column — not the full (weighted) picker width. -->
    <div
      class="m-number-picker__wheel"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerUp"
      @wheel="onWheel"
    >
      <!-- Invisible sizer: establishes the content width (digit column). -->
      <span class="m-number-picker__sizer" aria-hidden="true">{{ widestLabel }}</span>
      <div
        v-for="item in renderItems"
        :key="item.key"
        class="m-number-picker__item"
        :style="item.style"
      >
        {{ item.text }}
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.m-number-picker {
  position: relative;
  // Fills the space it is given (e.g. weight(1f) in the source); the wheel is
  // centered within so the digits sit centered in that column.
  display: flex;
  justify-content: center;
  align-items: stretch;
  overflow: hidden;

  &__wheel {
    position: relative;
    height: 100%;
    // Content-width via the sizer → the scroll/drag hit area is the digits only.
    // --m-number-picker-hit-padding (default 0) flanks the digits with extra
    // grabbable padding so the interactive range can be widened on demand; the
    // digits stay centred because items span the padding box and are centred.
    padding-left: var(--m-number-picker-hit-padding, 0);
    padding-right: var(--m-number-picker-hit-padding, 0);
    touch-action: none;
    user-select: none;
    cursor: grab;

    &:active {
      cursor: grabbing;
    }
  }

  &--disabled &__wheel {
    cursor: not-allowed;
  }

  &__sizer {
    display: block;
    visibility: hidden;
    font-size: var(--m-text-title1-size);
    font-weight: 600;
    line-height: 1;
    white-space: nowrap;
    pointer-events: none;
  }

  // Disabled: every item uses the flat disabledOnSecondary token (not a
  // blanket wheel opacity), matching NumberPickerColors.
  &--disabled &__item {
    color: var(--m-color-disabled-on-secondary);
  }

  &__item {
    position: absolute;
    left: 0;
    right: 0;
    top: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--m-color-on-surface);
    font-size: var(--m-text-title1-size);
    font-weight: 600;
    line-height: 1;
    white-space: nowrap;
    pointer-events: none;
    will-change: transform, opacity;
  }
}
</style>
