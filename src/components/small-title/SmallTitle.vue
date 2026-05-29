<script setup lang="ts">
// Copyright 2026, miuix-vue contributors
// SPDX-License-Identifier: Apache-2.0
//
// Ported from miuix-ui/.../basic/SmallTitle.kt.
//
// Subtitle text style (14px / weight 700), color = onBackgroundVariant,
// inside margin PaddingValues(horizontal = 28, vertical = 8).

import { MiuixText } from '../text'

defineOptions({ name: 'MiuixSmallTitle' })

interface Props {
  text?: string
  /** Color override; defaults to onBackgroundVariant. */
  color?: string
}

const props = withDefaults(defineProps<Props>(), {
  text: '',
})
</script>

<template>
  <div class="m-small-title">
    <MiuixText type="subtitle" :color="props.color ?? 'var(--m-color-on-background-variant)'">
      <slot>{{ props.text }}</slot>
    </MiuixText>
  </div>
</template>

<style lang="scss">
.m-small-title {
  padding: 8px 28px;
}
</style>
