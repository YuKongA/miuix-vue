<script setup lang="ts">
// Copyright 2026, miuix-vue contributors
// SPDX-License-Identifier: Apache-2.0
//
// Ported from miuix-ui/.../basic/Button.kt.
//
// Dimensions, colors, and press feedback (alpha-overlay indication)
// follow miuix's ButtonDefaults + MiuixIndication 1:1.

defineOptions({ name: 'MiuixButton' })

export type MiuixButtonType = 'default' | 'primary'

interface Props {
  /** 'default' maps to miuix buttonColors(); 'primary' maps to buttonColorsPrimary(). */
  type?: MiuixButtonType
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'default',
  disabled: false,
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
    class="m-button"
    :class="[`m-button--${props.type}`, { 'm-button--disabled': props.disabled }]"
    :disabled="props.disabled"
    @click="onClick"
  >
    <slot />
  </button>
</template>

<style lang="scss">
// 1dp = 1px @ 1x DPR.
// minWidth 58, minHeight 40, padding 16x13, cornerRadius 16 — miuix ButtonDefaults.
.m-button {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 58px;
  min-height: 40px;
  padding: 13px 16px;
  border: 0;
  border-radius: var(--m-radius-md);
  background: var(--m-color-secondary-variant);
  color: var(--m-color-on-secondary-variant);
  font-family: inherit;
  font-size: var(--m-text-button-size);
  line-height: 1;
  appearance: none;
  cursor: pointer;
  user-select: none;
  -webkit-tap-highlight-color: transparent;

  // MiuixIndication alpha overlay: hover 0.06, focus 0.08, press 0.10 — ADDITIVE
  // when multiple states overlap (utils/MiuixIndication.kt updateStates()).
  // Animated with linear 120ms tween.
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

  &--primary {
    background: var(--m-color-primary);
    color: var(--m-color-on-primary);
  }

  &--disabled {
    cursor: not-allowed;
    background: var(--m-color-disabled-secondary-variant);
    color: var(--m-color-disabled-on-secondary-variant);

    &::after {
      display: none;
    }
  }

  &--primary.m-button--disabled {
    background: var(--m-color-disabled-primary-button);
    color: var(--m-color-disabled-on-primary-button);
  }
}
</style>
