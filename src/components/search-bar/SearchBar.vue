<script setup lang="ts">
// Copyright 2026, miuix-vue contributors
// SPDX-License-Identifier: Apache-2.0
//
// Ported from miuix-ui/.../basic/SearchBar.kt (SearchBar + InputField), merged
// into one Vue component (per CLAUDE.md rule #2).
//
// Capsule input: bg surfaceContainerHigh, circle shape, min-height 45, leading
// Search icon (start 16 / end 8, onSurfaceContainerHigh), input font 17 Medium,
// label shown only when empty AND collapsed, trailing clear X when query
// present. Focusing expands the bar: a Cancel action slides in and the results
// content (default slot) reveals. SearchBar insideMargin 12×0.

import { ref } from 'vue'
import { Motion, AnimatePresence } from 'motion-v'
import { IconSearch } from '../../icons'

defineOptions({ name: 'MiuixSearchBar' })

interface Props {
  modelValue?: string
  expanded?: boolean
  label?: string
  cancelText?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  expanded: false,
  label: 'Search',
  cancelText: 'Cancel',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'update:expanded': [value: boolean]
  search: [value: string]
}>()

const inputRef = ref<HTMLInputElement | null>(null)

function onInput(e: Event): void {
  emit('update:modelValue', (e.target as HTMLInputElement).value)
}
function expand(): void {
  if (!props.expanded) emit('update:expanded', true)
}
function cancel(): void {
  emit('update:modelValue', '')
  emit('update:expanded', false)
  inputRef.value?.blur()
}
function clear(): void {
  emit('update:modelValue', '')
  inputRef.value?.focus()
}
function onEnter(): void {
  emit('search', props.modelValue)
}

const cancelTransition = { type: 'spring' as const, stiffness: 400, damping: 34 }
</script>

<template>
  <div class="m-search-bar">
    <div class="m-search-bar__row">
      <label class="m-search-bar__field">
        <span class="m-search-bar__leading"><IconSearch /></span>
        <span class="m-search-bar__input-wrap">
          <span v-if="!props.modelValue && !props.expanded" class="m-search-bar__label">
            {{ props.label }}
          </span>
          <input
            ref="inputRef"
            class="m-search-bar__input"
            type="search"
            :value="props.modelValue"
            @input="onInput"
            @focus="expand"
            @keydown.enter.prevent="onEnter"
          />
        </span>
        <button
          v-if="props.modelValue"
          type="button"
          class="m-search-bar__clear"
          aria-label="Clear"
          @mousedown.prevent
          @click="clear"
        >
          <svg viewBox="0 0 24 24" width="16" height="16">
            <circle cx="12" cy="12" r="11" fill="currentColor" opacity="0.12" />
            <path
              d="M8 8 L16 16 M16 8 L8 16"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              fill="none"
            />
          </svg>
        </button>
      </label>
      <AnimatePresence :initial="false">
        <Motion
          v-if="props.expanded"
          class="m-search-bar__cancel-wrap"
          :initial="{ opacity: 0, width: 0 }"
          :animate="{ opacity: 1, width: 'auto' }"
          :exit="{ opacity: 0, width: 0 }"
          :transition="cancelTransition"
        >
          <button type="button" class="m-search-bar__cancel" @click="cancel">
            {{ props.cancelText }}
          </button>
        </Motion>
      </AnimatePresence>
    </div>

    <AnimatePresence :initial="false">
      <Motion
        v-if="props.expanded"
        class="m-search-bar__results"
        :initial="{ opacity: 0, height: 0 }"
        :animate="{ opacity: 1, height: 'auto' }"
        :exit="{ opacity: 0, height: 0 }"
        :transition="{ duration: 0.2, ease: 'easeOut' }"
      >
        <slot />
      </Motion>
    </AnimatePresence>
  </div>
</template>

<style lang="scss">
.m-search-bar {
  width: 100%;

  &__row {
    display: flex;
    align-items: center;
    // insideMargin 12 horizontal.
    padding: 0 12px;
  }

  &__field {
    display: flex;
    align-items: center;
    flex: 1;
    min-width: 0;
    min-height: 45px;
    border-radius: 9999px;
    background: var(--m-color-surface-container-high);
    cursor: text;
  }

  &__leading {
    display: inline-flex;
    align-items: center;
    padding-left: 16px;
    padding-right: 8px;
    color: var(--m-color-on-surface-container-high);
  }

  &__input-wrap {
    position: relative;
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: center;
  }

  &__label {
    position: absolute;
    left: 0;
    color: var(--m-color-on-surface-container-high);
    font-size: 17px;
    font-weight: 500;
    pointer-events: none;
  }

  &__input {
    width: 100%;
    min-width: 0;
    margin: 0;
    padding: 0;
    border: 0;
    outline: 0;
    background: transparent;
    color: var(--m-color-on-surface);
    font-family: inherit;
    font-size: 17px;
    font-weight: 500;
    caret-color: var(--m-color-primary);
    appearance: none;

    &::-webkit-search-cancel-button {
      display: none;
    }
  }

  &__clear {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: none;
    padding-left: 8px;
    padding-right: 16px;
    border: 0;
    background: transparent;
    color: var(--m-color-on-surface-container-highest);
    cursor: pointer;
  }

  &__cancel-wrap {
    overflow: hidden;
    flex: none;
  }

  &__cancel {
    padding: 0 12px;
    border: 0;
    background: transparent;
    color: var(--m-color-primary);
    font-family: inherit;
    font-size: 17px;
    font-weight: 700;
    white-space: nowrap;
    cursor: pointer;
  }

  &__results {
    overflow: hidden;
  }
}
</style>
