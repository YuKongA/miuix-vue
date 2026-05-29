<script setup lang="ts">
// Copyright 2026, miuix-vue contributors
// SPDX-License-Identifier: Apache-2.0
//
// Ported from miuix-ui/.../basic/TopAppBar.kt (static form — the scroll-driven
// large-title collapse is omitted for the web MVP).
//
// Collapsed bar height 52, bg surface. Small title: title3 (20) Medium, centered.
// Large mode adds a left-aligned large title (title1 (32) Normal, titlePadding 26)
// + optional subtitle (onSurfaceVariantSummary, bottom padding 8) below the bar.
// navigationIcon padding 16 (start), action icon padding 16 (end).

import { useSlots } from 'vue'
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
</script>

<template>
  <div class="m-top-app-bar" :style="{ background: props.color }">
    <div class="m-top-app-bar__row">
      <div class="m-top-app-bar__nav">
        <slot name="navigation" />
      </div>
      <div v-if="!props.large" class="m-top-app-bar__title">
        <MiuixText type="title3" weight="medium" color="var(--m-color-on-surface)">
          {{ props.title }}
        </MiuixText>
      </div>
      <div class="m-top-app-bar__actions">
        <slot name="actions" />
      </div>
    </div>
    <div v-if="props.large" class="m-top-app-bar__large">
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

  &__row {
    position: relative;
    display: flex;
    align-items: center;
    min-height: 52px;
  }

  &__nav {
    display: flex;
    align-items: center;
    padding-left: 16px;
    min-width: 0;
  }

  &__title {
    position: absolute;
    left: 0;
    right: 0;
    display: flex;
    justify-content: center;
    pointer-events: none;
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-left: auto;
    padding-right: 16px;
  }

  &__large {
    padding: 0 26px 8px;
  }

  &__bottom {
    width: 100%;
  }
}
</style>
