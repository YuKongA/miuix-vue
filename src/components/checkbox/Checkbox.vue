<script setup lang="ts">
// Copyright 2026, miuix-vue contributors
// SPDX-License-Identifier: Apache-2.0
//
// Ported from miuix-ui/.../basic/Checkbox.kt.
//
// 26dp circle. Background animates secondary↔primary (tween 300ms,
// FastOutSlowInEasing = cubic-bezier(.4,0,.2,1)). The checkmark is the source's
// 3-point polyline mapped into the 26px box (viewport 23, stroke = size*0.09),
// round cap/join. Checked geometry uses the source trim window [0.186, 0.803];
// the tips are pre-trimmed and the stroke "draws on" via dashoffset (~200ms).
// Indeterminate collapses the polyline to a centered horizontal dash
// (crossCenterGravitation = 1). Press applies SinkFeedback(0.85, spring(0.99, 986.96)).

import { Motion } from 'motion-v'
import { computed, ref } from 'vue'
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
}>()

// SinkFeedback(sinkAmount = 0.85, spring(0.99, 986.96))
const sinkSpring = folmeSpring(0.99, 986.96)
const pressed = ref(false)

const checked = computed(() => props.modelValue || props.indeterminate)

// Pre-trimmed checkmark (trim window [0.186, 0.803]) in the 26px box.
const CHECK_PATH = 'M8.576 13.66 L11.643 16.843 L17.499 9.293'
// Gravitated (indeterminate) centered dash, same trim window.
const DASH_PATH = 'M8.364 13 L17.36 13'
const STROKE_WIDTH = 26 * 0.09 // 2.34

const checkPath = computed(() => (props.indeterminate ? DASH_PATH : CHECK_PATH))

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

function toggle(): void {
  if (props.disabled) return
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
    <svg class="m-checkbox__mark" viewBox="0 0 26 26" :style="{ opacity: checked ? 1 : 0 }">
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
    // alpha in: 10ms, out: 150ms (FastOutSlowInEasing)
    transition: opacity 150ms cubic-bezier(0.4, 0, 0.2, 1);
  }

  &__path {
    // "draw on": dash window of length 1 (pathLength), offset hides it.
    stroke-dasharray: 1;
    stroke-dashoffset: 1;
    transition: stroke-dashoffset 200ms cubic-bezier(0.4, 0, 0.2, 1);

    &--drawn {
      stroke-dashoffset: 0;
    }
  }
}
</style>
