<script setup lang="ts">
// Copyright 2026, miuix-vue contributors
// SPDX-License-Identifier: Apache-2.0
//
// Ported from miuix-ui/.../basic/NavigationBar.kt (NavigationBar + Item,
// IconAndText mode). Item height 64, icon 26, label 12; selected =
// onSurfaceContainer / bold, unselected = onSurfaceContainer @ 0.4 alpha,
// pressed dims further. A top HorizontalDivider; bg surface.
//
// Vue idiom: `items` array + v-model selected index; per-item icon via the
// scoped `icon` slot (`{ item, index, selected }`).

import { computed } from 'vue'
import { MiuixDivider } from '../divider'

defineOptions({ name: 'MiuixNavigationBar' })

export interface MiuixNavigationItem {
  label: string
}

interface Props {
  modelValue?: number
  items?: MiuixNavigationItem[]
  showDivider?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: 0,
  items: () => [],
  showDivider: true,
})

const emit = defineEmits<{ 'update:modelValue': [value: number] }>()

const selectedIndex = computed(() => props.modelValue)

function select(index: number): void {
  if (index !== props.modelValue) emit('update:modelValue', index)
}
</script>

<template>
  <nav class="m-navigation-bar">
    <MiuixDivider v-if="props.showDivider" />
    <div class="m-navigation-bar__row">
      <button
        v-for="(item, index) in props.items"
        :key="index"
        type="button"
        class="m-navigation-bar__item"
        :class="{ 'm-navigation-bar__item--selected': index === selectedIndex }"
        role="tab"
        :aria-selected="index === selectedIndex"
        @click="select(index)"
      >
        <span class="m-navigation-bar__icon">
          <slot name="icon" :item="item" :index="index" :selected="index === selectedIndex" />
        </span>
        <span class="m-navigation-bar__label">{{ item.label }}</span>
      </button>
    </div>
  </nav>
</template>

<style lang="scss">
.m-navigation-bar {
  width: 100%;
  background: var(--m-color-surface);

  &__row {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__item {
    flex: 1;
    height: 64px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    gap: 2px;
    padding: 0;
    border: 0;
    background: transparent;
    // unselected: onSurfaceContainer @ 0.4
    color: var(--m-color-on-surface-container);
    opacity: 0.4;
    font-family: inherit;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    transition: opacity 200ms ease;

    &:active {
      opacity: 0.6;
    }

    &--selected {
      opacity: 1;

      .m-navigation-bar__label {
        font-weight: 700;
      }
    }
  }

  &__icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 26px;
    height: 26px;
    margin-top: 8px;
  }

  &__label {
    font-size: 12px;
    line-height: 1;
    margin-bottom: 8px;
  }
}
</style>
