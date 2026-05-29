<script setup lang="ts">
// Copyright 2026, miuix-vue contributors
// SPDX-License-Identifier: Apache-2.0
//
// Ported from miuix-ui/.../basic/Scaffold.kt (web essentials).
//
// A full-height layout: fixed top bar, scrolling content, fixed bottom bar, and
// an optional floating action button anchored bottom-end. Background defaults to
// the theme background.

import { useSlots } from 'vue'

defineOptions({ name: 'MiuixScaffold' })

interface Props {
  color?: string
}

const props = withDefaults(defineProps<Props>(), {
  // Scaffold.kt: containerColor defaults to colorScheme.surface.
  color: 'var(--m-color-surface)',
})

const slots = useSlots()
</script>

<template>
  <div class="m-scaffold" :style="{ background: props.color }">
    <div v-if="slots['top-bar']" class="m-scaffold__top">
      <slot name="top-bar" />
    </div>
    <div class="m-scaffold__body">
      <slot />
      <div v-if="slots.fab" class="m-scaffold__fab">
        <slot name="fab" />
      </div>
    </div>
    <div v-if="slots['bottom-bar']" class="m-scaffold__bottom">
      <slot name="bottom-bar" />
    </div>
  </div>
</template>

<style lang="scss">
.m-scaffold {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;

  &__top {
    flex: none;
    z-index: 10;
  }

  &__body {
    position: relative;
    flex: 1;
    min-height: 0;
    overflow-y: auto;
  }

  &__fab {
    position: absolute;
    // Scaffold.kt FabSpacing = 12.dp.
    right: 12px;
    bottom: 12px;
    z-index: 5;
  }

  &__bottom {
    flex: none;
    z-index: 10;
  }
}
</style>
