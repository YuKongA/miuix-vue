<script setup lang="ts">
// Copyright 2026, miuix-vue contributors
// SPDX-License-Identifier: Apache-2.0
//
// Ported from miuix-ui/.../basic/TopAppBar.kt (static form — the scroll-driven
// large-title collapse is omitted for the web MVP).
//
// Collapsed bar height 52, bg surface. Small title: title3 (20) Medium, centered
// (titlePadding 26 horizontal); an optional subtitle (body2, onSurfaceVariantSummary)
// sits centered directly below it. Large mode swaps in a left-aligned large title
// (title1 (32) Normal, titlePadding 26) + optional subtitle below the bar.
// navigationIcon padding 16 (start), action icon padding 16 (end), actions gap 0.
// The bottom padding before bottomContent = SubtitleBottomPadding 8 when a subtitle
// is present, else LargeTitleBottomPadding 4. Title colours animate tween 50ms.

import { computed, useSlots } from 'vue'
import { MiuixText } from '../text'

defineOptions({ name: 'MiuixTopAppBar' })

interface Props {
  title?: string
  /** Large title text; defaults to title. */
  largeTitle?: string
  subtitle?: string
  /** Show the large title block below the collapsed bar. */
  large?: boolean
  color?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  large: false,
  color: 'var(--m-color-surface)',
})

const slots = useSlots()

// expandedBottomPadding: SubtitleBottomPadding (8) with a subtitle, else
// LargeTitleBottomPadding (4). Applied below whichever title block is last.
const bottomPad = computed(() => (props.subtitle ? '8px' : '4px'))
</script>

<template>
  <div class="m-top-app-bar" :style="{ background: props.color }">
    <div
      class="m-top-app-bar__row"
      :style="!props.large ? { paddingBottom: bottomPad } : undefined"
    >
      <div class="m-top-app-bar__nav">
        <slot name="navigation" />
      </div>
      <div v-if="!props.large" class="m-top-app-bar__title">
        <MiuixText type="title3" weight="medium" color="var(--m-color-on-surface)">
          {{ props.title }}
        </MiuixText>
        <MiuixText
          v-if="props.subtitle"
          type="body2"
          color="var(--m-color-on-surface-variant-summary)"
        >
          {{ props.subtitle }}
        </MiuixText>
      </div>
      <div class="m-top-app-bar__actions">
        <slot name="actions" />
      </div>
    </div>
    <div v-if="props.large" class="m-top-app-bar__large" :style="{ paddingBottom: bottomPad }">
      <MiuixText type="title1" color="var(--m-color-on-surface)">
        {{ props.largeTitle ?? props.title }}
      </MiuixText>
      <MiuixText
        v-if="props.subtitle"
        type="body2"
        color="var(--m-color-on-surface-variant-summary)"
      >
        {{ props.subtitle }}
      </MiuixText>
    </div>
    <div v-if="slots.bottom" class="m-top-app-bar__bottom">
      <slot name="bottom" />
    </div>
  </div>
</template>

<style lang="scss">
.m-top-app-bar {
  width: 100%;

  // animateColorAsState(tween 50ms) on the title / large title / subtitle.
  .m-text {
    transition: color 50ms linear;
  }

  &__row {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 52px;
  }

  // Navigation / actions are pinned to the collapsed 52px band (verticalCenter
  // = 26) so they stay put when a subtitle grows the row.
  &__nav,
  &__actions {
    position: absolute;
    top: 0;
    height: 52px;
    display: flex;
    align-items: center;
  }
  &__nav {
    left: 0;
    padding-left: 16px;
    min-width: 0;
  }
  &__actions {
    right: 0;
    // actions Row uses Arrangement.End — no inter-icon spacing.
    gap: 0;
    padding-right: 16px;
  }

  &__title {
    display: flex;
    flex-direction: column;
    align-items: center;
    // titlePadding 26 horizontal.
    padding: 0 26px;
    text-align: center;
    pointer-events: none;
  }

  &__large {
    // titlePadding 26 horizontal; bottom padding bound inline (4 / 8).
    padding: 0 26px;
  }

  &__bottom {
    width: 100%;
  }
}
</style>
