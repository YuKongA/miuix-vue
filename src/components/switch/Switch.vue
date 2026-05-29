<script setup lang="ts">
// Copyright 2026, miuix-vue contributors
// SPDX-License-Identifier: Apache-2.0
//
// Ported from miuix-ui/.../basic/Switch.kt.
//
// Three springs from source (NOT approximated):
//   thumb offset:    folmeSpring(0.7, 987)
//   thumb scale:     folmeSpring(0.6, 987)
//   track color:     folmeSpring(0.99, 438.6)
//
// Drag behavior (1:1 with miuix):
//   - rawDragOffset accumulates movementX / 2 (halved)
//   - dragOffset clamped to [-21, 0] when checked, [0, 21] when unchecked
//   - On pointerup: if |dragOffset| > 10.5 → toggle; else if no real drag → click toggle
//   - Reset dragOffset / rawDragOffset to 0 on release
// Haptic feedback intentionally NOT ported — Web vibrate API is inconsistent.

import { Motion } from 'motion-v'
import { computed, ref } from 'vue'
import { folmeSpring } from '../../anim'

defineOptions({ name: 'MiuixSwitch' })

interface Props {
  modelValue?: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  change: [value: boolean]
}>()

// Dimensions from SwitchDefaults (Switch.kt lines 143, 156):
// track 49x28, thumb 20, thumb off-position left=4, on-position left=25.
const THUMB_TRAVEL = 21 // 25 - 4
const DRAG_HALF = 10.5 // 21 / 2 — half-way snap threshold
const SCALE_HOVER_PRESS = 1.127

const thumbOffsetTransition = folmeSpring(0.7, 987)
const thumbScaleTransition = folmeSpring(0.6, 987)
const trackColorTransition = folmeSpring(0.99, 438.6)

const pressed = ref(false)
const hovered = ref(false)
const dragOffset = ref(0)
const rawDragOffset = ref(0)
let activePointerId: number | null = null
let dragStartX = 0
let didDrag = false

const thumbX = computed(() => {
  const base = props.modelValue ? THUMB_TRAVEL : 0
  return base + dragOffset.value
})

const thumbScale = computed(() => {
  if (props.disabled) return 1
  if (pressed.value || hovered.value || dragOffset.value !== 0) return SCALE_HOVER_PRESS
  return 1
})

function toggle(): void {
  if (props.disabled) return
  const next = !props.modelValue
  emit('update:modelValue', next)
  emit('change', next)
}

function onPointerDown(event: PointerEvent): void {
  if (props.disabled) return
  pressed.value = true
  didDrag = false
  dragStartX = event.clientX
  rawDragOffset.value = 0
  dragOffset.value = 0
  activePointerId = event.pointerId
  ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
}

function onPointerMove(event: PointerEvent): void {
  if (activePointerId !== event.pointerId) return
  if (Math.abs(event.clientX - dragStartX) > 3) didDrag = true
  rawDragOffset.value += event.movementX / 2
  dragOffset.value = props.modelValue
    ? Math.max(-THUMB_TRAVEL, Math.min(0, rawDragOffset.value))
    : Math.max(0, Math.min(THUMB_TRAVEL, rawDragOffset.value))
}

function onPointerUp(event: PointerEvent): void {
  if (activePointerId !== event.pointerId) return
  const wasDrag = didDrag
  const snapped = Math.abs(dragOffset.value) > DRAG_HALF

  pressed.value = false
  dragOffset.value = 0
  rawDragOffset.value = 0
  activePointerId = null
  ;(event.currentTarget as HTMLElement).releasePointerCapture(event.pointerId)

  if (wasDrag) {
    if (snapped) toggle()
  } else {
    toggle()
  }
}

function onPointerCancel(event: PointerEvent): void {
  if (activePointerId !== event.pointerId) return
  pressed.value = false
  dragOffset.value = 0
  rawDragOffset.value = 0
  activePointerId = null
}

function onPointerEnter(): void {
  if (!props.disabled) hovered.value = true
}

function onPointerLeave(): void {
  hovered.value = false
}
</script>

<template>
  <Motion
    role="switch"
    tabindex="0"
    class="m-switch"
    :class="{
      'm-switch--checked': props.modelValue,
      'm-switch--disabled': props.disabled,
    }"
    :aria-checked="props.modelValue"
    :aria-disabled="props.disabled"
    :animate="{
      backgroundColor: props.modelValue
        ? props.disabled
          ? 'var(--m-color-disabled-primary)'
          : 'var(--m-color-primary)'
        : props.disabled
          ? 'var(--m-color-disabled-secondary)'
          : 'var(--m-color-secondary)',
    }"
    :transition="trackColorTransition"
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @pointerup="onPointerUp"
    @pointercancel="onPointerCancel"
    @pointerenter="onPointerEnter"
    @pointerleave="onPointerLeave"
    @keydown.space.prevent="toggle"
    @keydown.enter.prevent="toggle"
  >
    <Motion
      class="m-switch__thumb"
      :initial="false"
      :animate="{ x: thumbX, scale: thumbScale }"
      :transition="{
        x: thumbOffsetTransition,
        scale: thumbScaleTransition,
      }"
    />
  </Motion>
</template>

<style lang="scss">
.m-switch {
  position: relative;
  display: inline-block;
  width: 49px;
  height: 28px;
  border-radius: 9999px;
  cursor: pointer;
  user-select: none;
  touch-action: none; // disable browser pan/scroll on drag
  -webkit-tap-highlight-color: transparent;
  outline: none;

  &:focus-visible {
    box-shadow: 0 0 0 2px var(--m-color-primary);
  }

  &--disabled {
    cursor: not-allowed;
  }

  &__thumb {
    position: absolute;
    top: 4px;
    left: 4px;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: var(--m-color-on-primary);
    transform-origin: center center;
    pointer-events: none;
    // miuix animates thumb color via animateColorAsState (default color spring,
    // ≈ critically-damped, fast). checked/unchecked are both onPrimary/onSecondary
    // = white so this is usually a no-op, but keep it faithful for overrides.
    transition: background-color 100ms linear;
  }

  &:not(.m-switch--checked) &__thumb {
    background: var(--m-color-on-secondary);
  }
  &.m-switch--checked &__thumb {
    background: var(--m-color-on-primary);
  }
  &.m-switch--disabled.m-switch--checked &__thumb {
    background: var(--m-color-disabled-on-primary);
  }
  &.m-switch--disabled:not(.m-switch--checked) &__thumb {
    background: var(--m-color-disabled-on-secondary);
  }
}
</style>
