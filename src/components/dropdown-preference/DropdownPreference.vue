<script setup lang="ts">
// Copyright 2026, miuix-vue contributors
// SPDX-License-Identifier: Apache-2.0
//
// Ported from miuix-preference OverlayDropdownPreference + basic/Dropdown.kt
// (DropdownImpl) + layout/ListPopupLayout + basic/ListPopup (ListPopupContent).
// Web collapses the Overlay/Window variants to one anchored popup (per goal).
// `spinner` enables the richer item layout (color swatch + summary).
//
// Popup animation = miuix ListPopup, 1:1:
//   fraction: spring(dampingRatio 0.82, stiffness 362.5)  → scale 0.15 + 0.85·f
//   alpha:    tween 200ms in / 150ms out
//   dim:      windowDimming, tween 300ms SinOut in / 150ms out
//   transformOrigin = anchor spawn corner (End-aligned → top/bottom right)
//   clip-reveal: visible height grows from the top (below) / bottom (above)
// Row: BasicComponent (title/summary) + selected value + ArrowUpDown.
// Item (DropdownImpl): pad 20 horizontal, first/last 20 / middle 12 vertical;
//   title body1 (16) Medium, summary body2 (14); selected → primary + Check 20.

import { computed, nextTick, onUnmounted, ref } from 'vue'
import { animate, motionValue } from 'motion-v'
import { MiuixBasicComponent } from '../basic-component'
import { IconArrowUpDown, IconCheck } from '../../icons'
import { sinOutEasing } from '../../anim'

defineOptions({ name: 'MiuixDropdownPreference' })

export interface MiuixDropdownItem {
  text: string
  summary?: string
  /** Color swatch (spinner mode). */
  color?: string
  disabled?: boolean
}

interface Props {
  modelValue?: number
  title?: string
  summary?: string
  items?: Array<string | MiuixDropdownItem>
  disabled?: boolean
  /** Spinner mode: color swatch + summary, and swatch in the trigger. */
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

// ListPopupDefaults springs/tweens.
const fractionSpec = {
  type: 'spring' as const,
  stiffness: 362.5,
  damping: 2 * 0.82 * Math.sqrt(362.5),
}

const open = ref(false)
const rendered = ref(false)
const placeBelow = ref(true)
const triggerRef = ref<HTMLElement | null>(null)
const popupStyle = ref<Record<string, string>>({})

const fractionMv = motionValue(0)
const alphaMv = motionValue(0)
const dimMv = motionValue(0)
const fraction = ref(0)
const alpha = ref(0)
const dim = ref(0)
fractionMv.on('change', (v: number) => (fraction.value = v))
alphaMv.on('change', (v: number) => (alpha.value = v))
dimMv.on('change', (v: number) => (dim.value = v))
let fAnim: { stop: () => void } | null = null
let aAnim: { stop: () => void } | null = null
let dAnim: { stop: () => void } | null = null

const normalized = computed<MiuixDropdownItem[]>(() =>
  props.items.map((it) => (typeof it === 'string' ? { text: it } : it)),
)
const selected = computed(() => normalized.value[props.modelValue])

// scale 0.15 + 0.85·fraction; clip-reveal height grows from the spawn edge.
const motionStyle = computed(() => {
  const f = fraction.value
  const clamped = Math.max(0, Math.min(1, f))
  const hidden = (1 - clamped) * 100
  return {
    transform: `scale(${0.15 + 0.85 * f})`,
    opacity: String(alpha.value),
    clipPath: placeBelow.value
      ? `inset(0 0 ${hidden}% 0 round 16px)`
      : `inset(${hidden}% 0 0 0 round 16px)`,
  }
})

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
  const below = belowSpace >= 220 || belowSpace >= aboveSpace
  placeBelow.value = below
  if (below) {
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

function stopAnims(): void {
  fAnim?.stop()
  aAnim?.stop()
  dAnim?.stop()
}

function runEnter(): void {
  stopAnims()
  fAnim = animate(fractionMv, 1, fractionSpec)
  aAnim = animate(alphaMv, 1, { duration: 0.2, ease: 'linear' })
  dAnim = animate(dimMv, 1, { duration: 0.3, ease: sinOutEasing })
}

function runExit(): void {
  stopAnims()
  fAnim = animate(fractionMv, 0, fractionSpec)
  dAnim = animate(dimMv, 0, { duration: 0.15, ease: 'linear' })
  aAnim = animate(alphaMv, 0, {
    duration: 0.15,
    ease: 'linear',
    onComplete: () => {
      rendered.value = false
    },
  })
}

function openPopup(): void {
  if (props.disabled || open.value) return
  open.value = true
  rendered.value = true
  emit('update:expanded', true)
  nextTick(() => {
    computePosition()
    runEnter()
  })
}

function close(): void {
  if (!open.value) return
  open.value = false
  emit('update:expanded', false)
  runExit()
}

function toggle(): void {
  if (open.value) close()
  else openPopup()
}

function selectIndex(index: number): void {
  const item = normalized.value[index]
  if (item?.disabled) return
  emit('update:modelValue', index)
  close()
}

onUnmounted(stopAnims)
</script>

<template>
  <div ref="triggerRef" class="m-dropdown-preference">
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
          class="m-dropdown-preference__swatch"
          :style="{ background: selected.color }"
        />
        <span class="m-dropdown-preference__value">{{ selected?.text }}</span>
        <span class="m-dropdown-preference__arrow"><IconArrowUpDown /></span>
      </template>
    </MiuixBasicComponent>

    <Teleport to="body">
      <div v-if="rendered" class="m-dropdown-preference__layer">
        <div
          class="m-dropdown-preference__dim"
          :style="{ opacity: dim }"
          @click="close"
          @contextmenu.prevent="close"
        />
        <div
          class="m-dropdown-preference__popup"
          :style="{ ...popupStyle, ...motionStyle }"
          role="listbox"
        >
          <button
            v-for="(item, index) in normalized"
            :key="index"
            type="button"
            class="m-dropdown-preference__item"
            :class="{
              'm-dropdown-preference__item--selected': index === props.modelValue,
              'm-dropdown-preference__item--disabled': item.disabled,
              'm-dropdown-preference__item--first': index === 0,
              'm-dropdown-preference__item--last': index === normalized.length - 1,
            }"
            role="option"
            :aria-selected="index === props.modelValue"
            :disabled="item.disabled"
            @click="selectIndex(index)"
          >
            <span class="m-dropdown-preference__item-main">
              <span
                v-if="spinner && item.color"
                class="m-dropdown-preference__swatch m-dropdown-preference__swatch--cell"
                :style="{ background: item.color }"
              />
              <span class="m-dropdown-preference__item-text">
                <span class="m-dropdown-preference__item-title">{{ item.text }}</span>
                <span v-if="item.summary" class="m-dropdown-preference__item-summary">{{
                  item.summary
                }}</span>
              </span>
            </span>
            <span
              class="m-dropdown-preference__check"
              :class="{ 'm-dropdown-preference__check--on': index === props.modelValue }"
            >
              <IconCheck />
            </span>
          </button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style lang="scss">
.m-dropdown-preference {
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

  &__layer {
    position: fixed;
    inset: 0;
    z-index: 1100;
  }

  &__dim {
    position: absolute;
    inset: 0;
    background: var(--m-color-window-dimming);
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
    will-change: transform, opacity, clip-path;
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
      .m-dropdown-preference__item-title {
        color: var(--m-color-primary);
      }
      .m-dropdown-preference__item-summary {
        color: var(--m-color-primary);
      }
    }
    &--disabled {
      cursor: not-allowed;
      .m-dropdown-preference__item-title,
      .m-dropdown-preference__item-summary {
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
