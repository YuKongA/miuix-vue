<script setup lang="ts">
// Copyright 2026, miuix-vue contributors
// SPDX-License-Identifier: Apache-2.0
//
// Ported from miuix-ui/.../basic/FloatingActionButton.kt.
//
// 60×60 circle, containerColor = primary, shadow elevation 4, centered content.
// Wraps the clickable Surface, so it carries the MiuixIndication overlay
// (onBackground; additive hover .06 / focus .08 / press .10). Per CLAUDE.md
// rule #2, size/shape/color are fixed CSS / CSS-variable customization points,
// not per-instance props.

defineOptions({ name: 'MiuixFloatingActionButton' })

interface Props {
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
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
  // FloatingActionButtonDefaults: MinWidth/MinHeight 60, CircleShape, primary.
  min-width: var(--m-fab-min-width, 60px);
  min-height: var(--m-fab-min-height, 60px);
  padding: 0;
  border: 0;
  border-radius: var(--m-fab-radius, 9999px);
  background: var(--m-fab-color, var(--m-color-primary));
  color: var(--m-color-on-primary);
  // shadowElevation 4.
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
  &:focus-visible::after {
    opacity: 0.08;
  }
  &:active::after {
    opacity: 0.1;
  }
  &:focus-visible:active::after {
    opacity: 0.18;
  }

  // Hover only on real pointers; on touch :hover sticks after a tap.
  @media (hover: hover) {
    &:hover::after {
      opacity: 0.06;
    }
    &:hover:focus-visible::after {
      opacity: 0.14;
    }
    &:hover:active::after {
      opacity: 0.16;
    }
    &:hover:focus-visible:active::after {
      opacity: 0.24;
    }
  }

  &--disabled {
    cursor: not-allowed;
    &::after {
      display: none;
    }
  }
}
</style>
