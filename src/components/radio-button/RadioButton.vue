<script setup lang="ts">
// Copyright 2026, miuix-vue contributors
// SPDX-License-Identifier: Apache-2.0
//
// Ported from miuix-ui/.../basic/RadioButton.kt.
//
// 26dp circle, no background. When selected, a checkmark (viewport 56, path
// M10.9 29 L23.1 40.8 L44 16, stroke = 7/56 * size, round cap/join, color =
// primary) draws via trimEnd 0→1 over 300ms (FastOutSlowInEasing); alpha in
// 10ms / out 150ms. Press applies SinkFeedback(0.85, spring(0.99, 986.96)).
// Unselected shows nothing.

import { Motion } from 'motion-v'
import { computed, ref } from 'vue'
import { folmeSpring } from '../../anim'

defineOptions({ name: 'MiuixRadioButton' })

interface Props {
  /** Whether this radio is selected. */
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

const sinkSpring = folmeSpring(0.99, 986.96)
const pressed = ref(false)

// Checkmark mapped from 56-viewport into the 26px box.
const CHECK_PATH = 'M5.061 13.464 L10.725 18.943 L20.429 7.429'
const STROKE_WIDTH = (7 / 56) * 26 // 3.25

const color = computed(() =>
  props.disabled ? 'var(--m-color-disabled-primary)' : 'var(--m-color-primary)',
)
const scale = computed(() => (pressed.value && !props.disabled ? 0.85 : 1))

function select(): void {
  if (props.disabled) return
  if (!props.modelValue) {
    emit('update:modelValue', true)
    emit('change', true)
  }
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
    class="m-radio"
    :class="{ 'm-radio--disabled': props.disabled }"
    role="radio"
    tabindex="0"
    :aria-checked="props.modelValue"
    :aria-disabled="props.disabled"
    :animate="{ scale }"
    :transition="sinkSpring"
    @pointerdown="onDown"
    @pointerup="onUp"
    @pointerleave="onUp"
    @pointercancel="onUp"
    @click="select"
    @keydown.space.prevent="select"
    @keydown.enter.prevent="select"
  >
    <svg
      class="m-radio__mark"
      viewBox="0 0 26 26"
      :style="{
        opacity: props.modelValue ? 1 : 0,
        transitionDuration: props.modelValue ? '10ms' : '150ms',
      }"
    >
      <path
        :d="CHECK_PATH"
        fill="none"
        :stroke="color"
        :stroke-width="STROKE_WIDTH"
        stroke-linecap="round"
        stroke-linejoin="round"
        pathLength="1"
        class="m-radio__path"
        :class="{ 'm-radio__path--drawn': props.modelValue }"
      />
    </svg>
  </Motion>
</template>

<style lang="scss">
.m-radio {
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

  &__mark {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    transition: opacity 150ms cubic-bezier(0.4, 0, 0.2, 1);
  }

  &__path {
    stroke-dasharray: 1;
    stroke-dashoffset: 1;
    transition: stroke-dashoffset 300ms cubic-bezier(0.4, 0, 0.2, 1);

    &--drawn {
      stroke-dashoffset: 0;
    }
  }
}
</style>
