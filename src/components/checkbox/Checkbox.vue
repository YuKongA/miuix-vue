<script setup lang="ts">
// Copyright 2026, miuix-vue contributors
// SPDX-License-Identifier: Apache-2.0
//
// Ported from miuix-ui/.../basic/Checkbox.kt.
//
// 26dp circle. Background animates secondary↔primary (tween 300ms,
// FastOutSlowInEasing = cubic-bezier(.4,0,.2,1)); foreground (stroke) likewise.
// The checkmark is the source's 3-point polyline mapped into the 26px box
// (viewport 23, stroke = size*0.09), round cap/join, trim window [0.186, 0.803].
// crossCenterGravitation morphs the polyline toward the centre to become the
// indeterminate dash; it animates (200ms to Indeterminate / 150ms away,
// FastOutSlowIn). Check alpha tweens 10ms in / 150ms out. Press applies
// SinkFeedback(0.85, spring(0.99, 986.96)).

import { animate, Motion, motionValue } from 'motion-v'
import { computed, onUnmounted, ref, watch } from 'vue'
import { folmeSpring } from '../../anim'

defineOptions({ name: 'MiuixCheckbox' })

interface Props {
  modelValue?: boolean
  indeterminate?: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  indeterminate: false,
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  change: [value: boolean]
  // Fired on every activation; lets a parent drive multi-state (e.g. tri-state)
  // cycling via one-way :model-value + :indeterminate (mirrors miuix onClick).
  click: []
}>()

// SinkFeedback(sinkAmount = 0.85, spring(0.99, 986.96))
const sinkSpring = folmeSpring(0.99, 986.96)
const pressed = ref(false)

const checked = computed(() => props.modelValue || props.indeterminate)

// 3-point checkmark in the 26px box, and the centre it gravitates toward.
const STROKE_WIDTH = 26 * 0.09 // 2.34
const S = { x: 5.652, y: 10.626 }
const M = { x: 11.643, y: 16.843 }
const E = { x: 20.235, y: 5.765 }
const CENTER = 13
const TRIM_START = 0.186
const TRIM_END = 0.803

const lerp = (a: number, b: number, t: number): number => a + (b - a) * t

// crossCenterGravitation: 0 = check, 1 = centred dash (indeterminate).
const gravMv = motionValue(props.indeterminate ? 1 : 0)
const grav = ref(props.indeterminate ? 1 : 0)
gravMv.on('change', (v: number) => (grav.value = v))
let gravAnim: { stop: () => void } | null = null
watch(
  () => props.indeterminate,
  (ind) => {
    gravAnim?.stop()
    // 200ms toward Indeterminate, 150ms away (FastOutSlowInEasing).
    gravAnim = animate(gravMv, ind ? 1 : 0, {
      duration: ind ? 0.2 : 0.15,
      ease: [0.4, 0, 0.2, 1],
    })
  },
)
onUnmounted(() => gravAnim?.stop())

// Trimmed [0.186, 0.803] path through the gravitated points.
const checkPath = computed(() => {
  const g = grav.value
  const sX = S.x
  const sY = lerp(S.y, CENTER, g)
  const mX = lerp(M.x, CENTER, g)
  const mY = lerp(M.y, CENTER, g)
  const eX = E.x
  const eY = lerp(E.y, CENTER, g)
  const len1 = Math.hypot(mX - sX, mY - sY)
  const len2 = Math.hypot(eX - mX, eY - mY)
  const total = len1 + len2 || 1
  const pointAt = (dist: number): [number, number] => {
    if (dist <= len1) {
      const r = len1 ? dist / len1 : 0
      return [lerp(sX, mX, r), lerp(sY, mY, r)]
    }
    const r = len2 ? (dist - len1) / len2 : 0
    return [lerp(mX, eX, r), lerp(mY, eY, r)]
  }
  const dStart = total * TRIM_START
  const dEnd = total * TRIM_END
  const [p0x, p0y] = pointAt(dStart)
  const [p1x, p1y] = pointAt(dEnd)
  const f = (n: number): string => n.toFixed(3)
  if (dStart < len1 && dEnd > len1) {
    return `M${f(p0x)} ${f(p0y)} L${f(mX)} ${f(mY)} L${f(p1x)} ${f(p1y)}`
  }
  return `M${f(p0x)} ${f(p0y)} L${f(p1x)} ${f(p1y)}`
})

const bgColor = computed(() => {
  if (props.disabled) {
    return checked.value ? 'var(--m-color-disabled-primary)' : 'var(--m-color-disabled-secondary)'
  }
  return checked.value ? 'var(--m-color-primary)' : 'var(--m-color-secondary)'
})

const fgColor = computed(() => {
  if (props.disabled) return 'var(--m-color-disabled-on-primary)'
  return checked.value ? 'var(--m-color-on-primary)' : 'var(--m-color-secondary)'
})

const scale = computed(() => (pressed.value && !props.disabled ? 0.85 : 1))
// Check alpha: 10ms appearing, 150ms disappearing.
const markStyle = computed(() => ({
  opacity: checked.value ? 1 : 0,
  transitionDuration: checked.value ? '10ms' : '150ms',
}))

function toggle(): void {
  if (props.disabled) return
  emit('click')
  const next = !props.modelValue
  emit('update:modelValue', next)
  emit('change', next)
}

function onDown(): void {
  if (!props.disabled) pressed.value = true
}
function onUp(): void {
  pressed.value = false
}
</script>

<template>
  <Motion
    class="m-checkbox"
    :class="{ 'm-checkbox--disabled': props.disabled }"
    role="checkbox"
    tabindex="0"
    :aria-checked="props.indeterminate ? 'mixed' : props.modelValue"
    :aria-disabled="props.disabled"
    :animate="{ scale }"
    :transition="sinkSpring"
    @pointerdown="onDown"
    @pointerup="onUp"
    @pointerleave="onUp"
    @pointercancel="onUp"
    @click="toggle"
    @keydown.space.prevent="toggle"
    @keydown.enter.prevent="toggle"
  >
    <span class="m-checkbox__bg" :style="{ background: bgColor }" />
    <svg class="m-checkbox__mark" viewBox="0 0 26 26" :style="markStyle">
      <path
        :d="checkPath"
        fill="none"
        :stroke="fgColor"
        :stroke-width="STROKE_WIDTH"
        stroke-linecap="round"
        stroke-linejoin="round"
        pathLength="1"
        class="m-checkbox__path"
        :class="{ 'm-checkbox__path--drawn': checked }"
      />
    </svg>
  </Motion>
</template>

<style lang="scss">
.m-checkbox {
  position: relative;
  display: inline-block;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  cursor: pointer;
  user-select: none;
  outline: none;
  -webkit-tap-highlight-color: transparent;
  transform-origin: center center;

  &--disabled {
    cursor: not-allowed;
  }

  &:focus-visible {
    box-shadow: 0 0 0 2px var(--m-color-primary);
  }

  &__bg {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    // tween 300ms FastOutSlowInEasing
    transition: background-color 300ms cubic-bezier(0.4, 0, 0.2, 1);
  }

  &__mark {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    // alpha: 10ms in / 150ms out (duration set inline per direction).
    transition: opacity 150ms cubic-bezier(0.4, 0, 0.2, 1);
  }

  &__path {
    // foreground color tween 300ms (Checkbox.kt animateColor).
    transition:
      stroke-dashoffset 200ms cubic-bezier(0.4, 0, 0.2, 1),
      stroke 300ms cubic-bezier(0.4, 0, 0.2, 1);
    // "draw on": dash window of length 1 (pathLength), offset hides it.
    stroke-dasharray: 1;
    stroke-dashoffset: 1;

    &--drawn {
      stroke-dashoffset: 0;
    }
  }
}
</style>
