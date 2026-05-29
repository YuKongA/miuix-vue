<script setup lang="ts">
// Copyright 2026, miuix-vue contributors
// SPDX-License-Identifier: Apache-2.0
//
// Ported from miuix-preference OverlayDropdownPreference + basic/Dropdown.kt
// (DropdownImpl). Web collapses the Overlay/Window variants to one anchored
// popup (per goal). `spinner` enables the richer item layout (color swatch +
// summary) used by SpinnerPreference.
//
// Row: BasicComponent (title/summary) with the selected value + ArrowUpDown
//   (10×16, onSurfaceVariantActions) at the end.
// Popup item (DropdownImpl): horizontal padding 20, first/last vertical 20,
//   middle 12; title body1 (16) Medium, summary body2 (14); selected →
//   primary text + Check (20px primary). Container surfaceContainer.

import { computed, nextTick, ref } from 'vue'
import { AnimatePresence, Motion } from 'motion-v'
import { MiuixBasicComponent } from '../basic-component'
import { IconArrowUpDown, IconCheck } from '../../icons'
import { folmeSpringByResponse } from '../../anim'

defineOptions({ name: 'MiuixSuperDropdown' })

export interface MiuixDropdownItem {
  text: string
  summary?: string
  /** Color swatch (spinner mode). */
  color?: string
  disabled?: boolean
}

interface Props {
  /** Selected index (v-model). */
  modelValue?: number
  title?: string
  summary?: string
  /** Plain string items or rich items. */
  items?: Array<string | MiuixDropdownItem>
  disabled?: boolean
  /** Spinner mode: show color swatch + summary, and swatch in the trigger. */
  spinner?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: 0,
  items: () => [],
  disabled: false,
  spinner: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: number]
  'update:expanded': [value: boolean]
}>()

const popupEnter = folmeSpringByResponse(0.9, 0.3)
const popupExit = { duration: 0.18, ease: 'easeOut' as const }

const open = ref(false)
const triggerRef = ref<HTMLElement | null>(null)
const popupStyle = ref<Record<string, string>>({})

const normalized = computed<MiuixDropdownItem[]>(() =>
  props.items.map((it) => (typeof it === 'string' ? { text: it } : it)),
)
const selected = computed(() => normalized.value[props.modelValue])

function computePosition(): void {
  const el = triggerRef.value
  if (!el || typeof window === 'undefined') return
  const rect = el.getBoundingClientRect()
  const vw = window.innerWidth
  const vh = window.innerHeight
  const margin = 12
  const right = vw - rect.right
  const belowSpace = vh - rect.bottom - margin
  const aboveSpace = rect.top - margin
  const placeBelow = belowSpace >= 220 || belowSpace >= aboveSpace
  if (placeBelow) {
    popupStyle.value = {
      top: `${rect.bottom + 4}px`,
      right: `${right}px`,
      maxHeight: `${belowSpace}px`,
      transformOrigin: 'top right',
    }
  } else {
    popupStyle.value = {
      bottom: `${vh - rect.top + 4}px`,
      right: `${right}px`,
      maxHeight: `${aboveSpace}px`,
      transformOrigin: 'bottom right',
    }
  }
}

function toggle(): void {
  if (props.disabled) return
  open.value = !open.value
  emit('update:expanded', open.value)
  if (open.value) nextTick(computePosition)
}

function close(): void {
  if (!open.value) return
  open.value = false
  emit('update:expanded', false)
}

function selectIndex(index: number): void {
  const item = normalized.value[index]
  if (item?.disabled) return
  emit('update:modelValue', index)
  close()
}
</script>

<template>
  <div ref="triggerRef" class="m-super-dropdown">
    <MiuixBasicComponent
      :title="props.title"
      :summary="props.summary"
      :disabled="props.disabled"
      :hold-down="open"
      clickable
      @click="toggle"
    >
      <template #end>
        <span
          v-if="spinner && selected?.color"
          class="m-super-dropdown__swatch"
          :style="{ background: selected.color }"
        />
        <span class="m-super-dropdown__value">{{ selected?.text }}</span>
        <span class="m-super-dropdown__arrow"><IconArrowUpDown /></span>
      </template>
    </MiuixBasicComponent>

    <Teleport to="body">
      <AnimatePresence>
        <div
          v-if="open"
          class="m-super-dropdown__overlay"
          @click="close"
          @contextmenu.prevent="close"
        >
          <Motion
            class="m-super-dropdown__popup"
            :style="popupStyle"
            :initial="{ opacity: 0, scale: 0.8 }"
            :animate="{ opacity: 1, scale: 1 }"
            :exit="{ opacity: 0, scale: 0.8 }"
            :transition="popupEnter"
            :exit-transition="popupExit"
            role="listbox"
            @click.stop
          >
            <button
              v-for="(item, index) in normalized"
              :key="index"
              type="button"
              class="m-super-dropdown__item"
              :class="{
                'm-super-dropdown__item--selected': index === props.modelValue,
                'm-super-dropdown__item--disabled': item.disabled,
                'm-super-dropdown__item--first': index === 0,
                'm-super-dropdown__item--last': index === normalized.length - 1,
              }"
              role="option"
              :aria-selected="index === props.modelValue"
              :disabled="item.disabled"
              @click="selectIndex(index)"
            >
              <span class="m-super-dropdown__item-main">
                <span
                  v-if="spinner && item.color"
                  class="m-super-dropdown__swatch m-super-dropdown__swatch--cell"
                  :style="{ background: item.color }"
                />
                <span class="m-super-dropdown__item-text">
                  <span class="m-super-dropdown__item-title">{{ item.text }}</span>
                  <span v-if="item.summary" class="m-super-dropdown__item-summary">{{
                    item.summary
                  }}</span>
                </span>
              </span>
              <span
                class="m-super-dropdown__check"
                :class="{ 'm-super-dropdown__check--on': index === props.modelValue }"
              >
                <IconCheck />
              </span>
            </button>
          </Motion>
        </div>
      </AnimatePresence>
    </Teleport>
  </div>
</template>

<style lang="scss">
.m-super-dropdown {
  &__value {
    color: var(--m-color-on-surface-variant-actions);
    font-size: var(--m-text-body2-size);
  }

  &__arrow {
    display: inline-flex;
    align-items: center;
    margin-left: 8px;
    color: var(--m-color-on-surface-variant-actions);
  }

  &__swatch {
    display: inline-block;
    width: 22px;
    height: 22px;
    margin-right: 8px;
    border-radius: 6px;

    &--cell {
      width: 26px;
      height: 26px;
      margin-right: 12px;
      flex: none;
    }
  }

  &__overlay {
    position: fixed;
    inset: 0;
    z-index: 1100;
  }

  &__popup {
    position: fixed;
    min-width: 200px;
    max-width: 280px;
    padding: 0;
    border-radius: 16px;
    background: var(--m-color-surface-container);
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.18);
    overflow-y: auto;
  }

  &__item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    box-sizing: border-box;
    padding: 12px 20px;
    border: 0;
    background: var(--m-color-surface-container);
    color: var(--m-color-on-surface-container);
    font-family: inherit;
    text-align: left;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;

    &--first {
      padding-top: 20px;
    }
    &--last {
      padding-bottom: 20px;
    }
    &--selected {
      .m-super-dropdown__item-title {
        color: var(--m-color-primary);
      }
      .m-super-dropdown__item-summary {
        color: var(--m-color-primary);
      }
    }
    &--disabled {
      cursor: not-allowed;
      .m-super-dropdown__item-title,
      .m-super-dropdown__item-summary {
        color: var(--m-color-disabled-on-secondary-variant);
      }
    }
  }

  &__item-main {
    display: flex;
    align-items: center;
    min-width: 0;
  }

  &__item-text {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  &__item-title {
    font-size: var(--m-text-body1-size);
    font-weight: 500;
  }

  &__item-summary {
    font-size: var(--m-text-body2-size);
    color: var(--m-color-on-surface-variant-summary);
  }

  &__check {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    margin-left: 12px;
    color: var(--m-color-primary);
    opacity: 0;
    flex: none;

    &--on {
      opacity: 1;
    }

    svg {
      width: 20px;
      height: 20px;
    }
  }
}
</style>
