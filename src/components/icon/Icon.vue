<script setup lang="ts">
// Copyright 2026, miuix-vue contributors
// SPDX-License-Identifier: Apache-2.0
//
// Ported from miuix-ui/.../basic/Icon.kt.
//
// Single-color icon. tint defaults to LocalContentColor (here: currentColor,
// inherited). Default size 24 when the icon has no intrinsic size.
//
// Two ways to supply the glyph:
//   1. default slot — an <svg> using fill="currentColor" (the basic icons).
//   2. `icon` prop — extended-pack data (an ExtendedIcon picked by `weight`, or
//      a resolved ExtendedIconWeightData). The renderer draws the path in its
//      own viewBox with the pack's uniform vertical-flip transform + nonzero
//      fill-rule, so the whole 155×5 pack works without 775 components.

import { computed } from 'vue'
import type {
  ExtendedIcon,
  ExtendedIconWeightData,
  MiuixIconWeight,
} from '../../icons/extended/icons'

defineOptions({ name: 'MiuixIcon' })

interface Props {
  /** Icon edge length in px. Defaults to 24 (DefaultIconSize). */
  size?: number
  /** Tint color. Defaults to inherited content color. `none` disables tint. */
  color?: string
  /** Extended-pack icon: a full ExtendedIcon (picked by `weight`) or resolved weight data. */
  icon?: ExtendedIcon | ExtendedIconWeightData
  /** Weight to use when `icon` is a full ExtendedIcon. Defaults to `regular`. */
  weight?: MiuixIconWeight
}

const props = withDefaults(defineProps<Props>(), {
  size: 24,
  weight: 'regular',
})

const style = computed(() => ({
  width: `${props.size}px`,
  height: `${props.size}px`,
  color: props.color && props.color !== 'none' ? props.color : undefined,
}))

// Resolve `icon` (full pack icon → pick weight; otherwise it's already weight data).
const glyph = computed<ExtendedIconWeightData | null>(() => {
  const i = props.icon
  if (!i) return null
  return 'regular' in i ? i[props.weight] : i
})
</script>

<template>
  <span class="m-icon" :class="{ 'm-icon--no-tint': props.color === 'none' }" :style="style">
    <svg v-if="glyph" :viewBox="`0 0 ${glyph.vw} ${glyph.vh}`" fill="none" aria-hidden="true">
      <!-- The pack is uniform: vertical-flip transform + fill-rule nonzero. -->
      <path
        :d="glyph.d"
        :transform="`matrix(1 0 0 -1 0 ${glyph.vh})`"
        fill="currentColor"
        fill-rule="nonzero"
        clip-rule="nonzero"
      />
    </svg>
    <slot v-else />
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
