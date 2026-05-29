<script setup lang="ts">
// Copyright 2026, miuix-vue contributors
// SPDX-License-Identifier: Apache-2.0
//
// Ported from miuix-ui/.../basic/Icon.kt.
//
// Single-color icon. tint defaults to LocalContentColor (here: currentColor,
// inherited). Default size 24 when the icon has no intrinsic size. Pass the
// vector as the default slot (an <svg> using fill="currentColor"), or provide
// pre-built SVG via the icons module.

import { computed } from 'vue'

defineOptions({ name: 'MiuixIcon' })

interface Props {
  /** Icon edge length in px. Defaults to 24 (DefaultIconSize). */
  size?: number
  /** Tint color. Defaults to inherited content color. `none` disables tint. */
  color?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 24,
})

const style = computed(() => ({
  width: `${props.size}px`,
  height: `${props.size}px`,
  color: props.color && props.color !== 'none' ? props.color : undefined,
}))
</script>

<template>
  <span class="m-icon" :class="{ 'm-icon--no-tint': props.color === 'none' }" :style="style">
    <slot />
  </span>
</template>

<style lang="scss">
.m-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: none;
  color: currentColor;

  svg {
    width: 100%;
    height: 100%;
    display: block;
  }

  &:not(.m-icon--no-tint) svg {
    fill: currentColor;
  }
}
</style>
