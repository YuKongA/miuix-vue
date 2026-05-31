<script setup lang="ts">
// Copyright 2026, miuix-vue contributors
// SPDX-License-Identifier: Apache-2.0
//
// Ported from miuix-ui/.../basic/IconButton.kt.
//
// IconButtonDefaults: minWidth 40, minHeight 40, cornerRadius 40 (→ circle),
// backgroundColor Unspecified (transparent). Per CLAUDE.md rule #2 these are
// fixed CSS / CSS-variable customization points, not per-instance props.
// Clickable uses LocalIndication → the MiuixIndication alpha overlay
// (onBackground; additive hover .06 / focus .08 / press .10 / hold-down .10;
// press is ignored while held down — Switch.kt's `isPressed && !isHoldDown`).

defineOptions({ name: 'MiuixIconButton' })

interface Props {
  disabled?: boolean
  /** Held-down visual state (e.g. while an attached popup is open). */
  holdDown?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  holdDown: false,
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

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
  // IconButtonDefaults: minWidth/minHeight 40, cornerRadius 40, bg transparent.
  min-width: var(--m-icon-button-min-width, 40px);
  min-height: var(--m-icon-button-min-height, 40px);
  padding: 0;
  border: 0;
  border-radius: var(--m-icon-button-radius, 40px);
  background: var(--m-icon-button-bg, transparent);
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

  // Additive MiuixIndication table (no hold-down): press path stacks.
  &:focus-visible::after {
    opacity: 0.08;
  }
  &:active::after {
    opacity: 0.1;
  }
  &:focus-visible:active::after {
    opacity: 0.18;
  }

  // Hold-down: press is ignored; hold-down 0.10 stacks with hover/focus.
  &--hold-down::after {
    opacity: 0.1;
  }
  &--hold-down:focus-visible::after {
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
    &--hold-down:hover::after {
      opacity: 0.16;
    }
    &--hold-down:hover:focus-visible::after {
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
