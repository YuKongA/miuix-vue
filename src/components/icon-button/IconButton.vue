<script setup lang="ts">
// Copyright 2026, miuix-vue contributors
// SPDX-License-Identifier: Apache-2.0
//
// Ported from miuix-ui/.../basic/IconButton.kt.
//
// IconButtonDefaults: minWidth 40, minHeight 40, cornerRadius 40 (→ circle),
// backgroundColor Unspecified (transparent). Clickable uses LocalIndication →
// the MiuixIndication alpha overlay (onBackground, additive, 120ms linear),
// clipped to the rounded shape.

import { computed } from 'vue'

defineOptions({ name: 'MiuixIconButton' })

interface Props {
  disabled?: boolean
  /** Background color; defaults to transparent (Color.Unspecified). */
  backgroundColor?: string
  /** Corner radius in px; defaults to 40 (fully round at default size). */
  cornerRadius?: number
  minWidth?: number
  minHeight?: number
  /** Held-down visual state (e.g. while an attached popup is open). */
  holdDown?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  backgroundColor: 'transparent',
  cornerRadius: 40,
  minWidth: 40,
  minHeight: 40,
  holdDown: false,
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const style = computed(() => ({
  minWidth: `${props.minWidth}px`,
  minHeight: `${props.minHeight}px`,
  borderRadius: `${props.cornerRadius}px`,
  background: props.backgroundColor,
}))

function onClick(event: MouseEvent): void {
  if (props.disabled) return
  emit('click', event)
}
</script>

<template>
  <button
    type="button"
    class="m-icon-button"
    :class="{
      'm-icon-button--disabled': props.disabled,
      'm-icon-button--hold-down': props.holdDown,
    }"
    :style="style"
    :disabled="props.disabled"
    @click="onClick"
  >
    <slot />
  </button>
</template>

<style lang="scss">
.m-icon-button {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 0;
  color: var(--m-color-on-background);
  appearance: none;
  cursor: pointer;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: var(--m-color-on-background);
    opacity: 0;
    transition: opacity 120ms linear;
    pointer-events: none;
  }
  &:hover::after {
    opacity: 0.06;
  }
  &:focus-visible::after {
    opacity: 0.08;
  }
  &:hover:focus-visible::after {
    opacity: 0.14;
  }
  &:active::after,
  &--hold-down::after {
    opacity: 0.1;
  }
  &:hover:active::after {
    opacity: 0.16;
  }

  &--disabled {
    cursor: not-allowed;

    &::after {
      display: none;
    }
  }
}
</style>
