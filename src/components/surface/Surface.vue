<script setup lang="ts">
// Copyright 2026, miuix-vue contributors
// SPDX-License-Identifier: Apache-2.0
//
// Ported from miuix-ui/.../basic/Surface.kt.
//
// A themed container. Defaults: color = surface, contentColor = onSurface,
// RectangleShape (no radius), shadowElevation 0. The clickable overload adds
// the MiuixIndication alpha overlay (LocalIndication).

import { computed } from 'vue'

defineOptions({ name: 'MiuixSurface' })

interface Props {
  /** Background color; defaults to surface. */
  color?: string
  /** Content (text) color; defaults to onSurface. */
  contentColor?: string
  /** Border radius in px; defaults to 0 (RectangleShape). */
  radius?: number
  clickable?: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  color: 'var(--m-color-surface)',
  contentColor: 'var(--m-color-on-surface)',
  radius: 0,
  clickable: false,
  disabled: false,
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const interactive = computed(() => props.clickable && !props.disabled)

const style = computed(() => ({
  background: props.color,
  color: props.contentColor,
  borderRadius: props.radius ? `${props.radius}px` : undefined,
}))

function onClick(event: MouseEvent): void {
  if (!interactive.value) return
  emit('click', event)
}
</script>

<template>
  <div
    class="m-surface"
    :class="{ 'm-surface--clickable': interactive }"
    :style="style"
    :role="interactive ? 'button' : undefined"
    :tabindex="interactive ? 0 : undefined"
    @click="onClick"
  >
    <slot />
  </div>
</template>

<style lang="scss">
.m-surface {
  position: relative;

  &--clickable {
    cursor: pointer;
    outline: none;

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
    &:active::after {
      opacity: 0.1;
    }
    &:hover:active::after {
      opacity: 0.16;
    }
    &:focus-visible:active::after {
      opacity: 0.18;
    }
    &:hover:focus-visible:active::after {
      opacity: 0.24;
    }
  }
}
</style>
