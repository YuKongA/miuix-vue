<script setup lang="ts">
// Copyright 2026, miuix-vue contributors
// SPDX-License-Identifier: Apache-2.0
//
// Ported from miuix-ui/.../basic/Text.kt + theme/TextStyles.kt.
//
// miuix's Text resolves font size / weight / color in this precedence:
//   explicit param > style preset > LocalContentColor (for color).
// The 14 text-style presets are CSS classes mapping to the --m-text-* tokens;
// `type` selects one. Color defaults to `currentColor` (inherits the ambient
// content color, mirroring LocalContentColor).

import { computed } from 'vue'

defineOptions({ name: 'MiuixText' })

export type MiuixTextType =
  | 'main'
  | 'paragraph'
  | 'body1'
  | 'body2'
  | 'button'
  | 'footnote1'
  | 'footnote2'
  | 'headline1'
  | 'headline2'
  | 'subtitle'
  | 'title1'
  | 'title2'
  | 'title3'
  | 'title4'

export type MiuixTextWeight = 'normal' | 'medium' | 'semibold' | 'bold' | number

interface Props {
  /** Text style preset from TextStyles.kt. Defaults to `main`. */
  type?: MiuixTextType
  /** Explicit color override; falls back to inherited content color. */
  color?: string
  /** Explicit font size override (number → px). */
  size?: number | string
  /** Font weight override. */
  weight?: MiuixTextWeight
  /** Text alignment. */
  align?: 'start' | 'center' | 'end' | 'justify'
  /** Rendered element tag. */
  as?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'main',
})

const WEIGHT_MAP: Record<string, number> = {
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
}

const style = computed(() => {
  const out: Record<string, string> = {}
  if (props.color) out.color = props.color
  if (props.size != null)
    out.fontSize = typeof props.size === 'number' ? `${props.size}px` : props.size
  if (props.weight != null) {
    out.fontWeight = String(
      typeof props.weight === 'number' ? props.weight : WEIGHT_MAP[props.weight],
    )
  }
  if (props.align)
    out.textAlign = props.align === 'start' ? 'left' : props.align === 'end' ? 'right' : props.align
  return out
})
</script>

<template>
  <component
    :is="props.as ?? 'span'"
    class="m-text"
    :class="`m-text--${props.type}`"
    :style="style"
  >
    <slot />
  </component>
</template>

<style lang="scss">
.m-text {
  color: currentColor;
  font-family: inherit;
  // main (default)
  font-size: var(--m-text-main-size);
  font-weight: 400;
  line-height: 1.2;

  &--paragraph {
    font-size: var(--m-text-paragraph-size);
    line-height: var(--m-text-paragraph-line-height);
  }
  &--body1 {
    font-size: var(--m-text-body1-size);
  }
  &--body2 {
    font-size: var(--m-text-body2-size);
  }
  &--button {
    font-size: var(--m-text-button-size);
  }
  &--footnote1 {
    font-size: var(--m-text-footnote1-size);
  }
  &--footnote2 {
    font-size: var(--m-text-footnote2-size);
  }
  &--headline1 {
    font-size: var(--m-text-headline1-size);
  }
  &--headline2 {
    font-size: var(--m-text-headline2-size);
  }
  &--subtitle {
    font-size: var(--m-text-subtitle-size);
    font-weight: var(--m-text-subtitle-weight);
  }
  &--title1 {
    font-size: var(--m-text-title1-size);
  }
  &--title2 {
    font-size: var(--m-text-title2-size);
  }
  &--title3 {
    font-size: var(--m-text-title3-size);
  }
  &--title4 {
    font-size: var(--m-text-title4-size);
  }
}
</style>
