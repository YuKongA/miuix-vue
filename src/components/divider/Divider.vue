<script setup lang="ts">
// Copyright 2026, miuix-vue contributors
// SPDX-License-Identifier: Apache-2.0
//
// Ported from miuix-ui/.../basic/Divider.kt (HorizontalDivider + VerticalDivider,
// unified via `orientation` per CLAUDE.md rule #2).
//
// DividerDefaults: thickness 0.75dp, color = dividerLine.

defineOptions({ name: 'MiuixDivider' })

interface Props {
  orientation?: 'horizontal' | 'vertical'
  /** Thickness in px; defaults to DividerDefaults.Thickness (0.75). */
  thickness?: number
  /** Color override; defaults to dividerLine. */
  color?: string
}

const props = withDefaults(defineProps<Props>(), {
  orientation: 'horizontal',
  thickness: 0.75,
})
</script>

<template>
  <div
    class="m-divider"
    :class="`m-divider--${props.orientation}`"
    :style="{
      [props.orientation === 'horizontal' ? 'height' : 'width']: `${props.thickness}px`,
      background: props.color ?? 'var(--m-color-divider-line)',
    }"
  />
</template>

<style lang="scss">
.m-divider {
  flex: none;

  &--horizontal {
    width: 100%;
  }

  &--vertical {
    height: 100%;
  }
}
</style>
