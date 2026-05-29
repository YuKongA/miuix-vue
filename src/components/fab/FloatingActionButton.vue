<script setup lang="ts">
// Copyright 2026, miuix-vue contributors
// SPDX-License-Identifier: Apache-2.0
//
// Ported from miuix-ui/.../basic/FloatingActionButton.kt.
//
// 60×60 circle, containerColor primary, shadow elevation 4, centered content.
// Uses the Surface clickable indication overlay (onBackground alpha).

defineOptions({ name: 'MiuixFloatingActionButton' })

interface Props {
  /** Background color; defaults to primary. */
  color?: string
  /** Border radius in px; defaults to fully round. */
  cornerRadius?: number
  minWidth?: number
  minHeight?: number
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  color: 'var(--m-color-primary)',
  cornerRadius: 9999,
  minWidth: 60,
  minHeight: 60,
  disabled: false,
})

const emit = defineEmits<{ click: [event: MouseEvent] }>()

function onClick(event: MouseEvent): void {
  if (props.disabled) return
  emit('click', event)
}
</script>

<template>
  <button
    type="button"
    class="m-fab"
    :class="{ 'm-fab--disabled': props.disabled }"
    :style="{
      minWidth: `${props.minWidth}px`,
      minHeight: `${props.minHeight}px`,
      borderRadius: `${props.cornerRadius}px`,
      background: props.color,
    }"
    :disabled="props.disabled"
    @click="onClick"
  >
    <slot />
  </button>
</template>

<style lang="scss">
.m-fab {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 0;
  color: var(--m-color-on-primary);
  // shadowElevation 4
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
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
  &:active::after {
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
