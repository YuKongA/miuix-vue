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
//   transformOrigin = anchor spawn corner (End-aligned → top/bottom/centre right)
//   clip-reveal: visible band grows from the top (below) / bottom (above) / centre
//   anchor = the end-actions block (value + arrow), NOT the whole row: miuix nests
//     the popup inside BasicComponent's endActions Row, so anchorBounds is that
//     block. End-aligned → popup right edge = block right edge (inset by the row's
//     16dp padding); it spawns 8dp below the block (≈ row centre), not below the row.
//   placement = dropdownPositionProvider's 3 branches: below if it fits below, else
//     above if it fits, else centred on the anchor; offsets coerced on-screen, with
//     an 8dp viewport gap (vertical margin) and no horizontal margin.
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
// Spawn side relative to the anchor (miuix dropdownPositionProvider's 3-branch choice).
const placement = ref<'below' | 'above' | 'middle'>('below')
const anchorRef = ref<HTMLElement | null>(null)
const popupRef = ref<HTMLElement | null>(null)
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

// scale 0.15 + 0.85·fraction; clip-reveal grows from the spawn edge (popupClipReveal):
// below → from the top, above → from the bottom, middle → symmetric from the centre.
const motionStyle = computed(() => {
  const f = fraction.value
  const clamped = Math.max(0, Math.min(1, f))
  const hidden = (1 - clamped) * 100
  let clipPath: string
  if (placement.value === 'below') clipPath = `inset(0 0 ${hidden}% 0 round 16px)`
  else if (placement.value === 'above') clipPath = `inset(${hidden}% 0 0 0 round 16px)`
  else clipPath = `inset(${hidden / 2}% 0 ${hidden / 2}% 0 round 16px)`
  return {
    transform: `scale(${0.15 + 0.85 * f})`,
    opacity: String(alpha.value),
    clipPath,
  }
})

function computePosition(): void {
  const anchor = anchorRef.value
  const popup = popupRef.value
  if (!anchor || !popup || typeof window === 'undefined') return
  const rect = anchor.getBoundingClientRect()
  const vw = window.innerWidth
  const vh = window.innerHeight
  // dropdownPositionProvider margins: PaddingValues(horizontal 0, vertical 8).
  const margin = 8
  // offsetHeight/offsetWidth are the natural (pre-transform) box; the popup is
  // mounted unconstrained (popupStyle = {}) and invisible until runEnter.
  const popupHeight = popup.offsetHeight
  const popupWidth = popup.offsetWidth

  // X — Align.End: popup right edge = anchor right edge, then coerce the left edge
  // into [0, vw - popupWidth] so the popup never runs off either viewport edge
  // (miuix coerceIn on offsetX; horizontal margin 0). Anchored via CSS `right`.
  const left = Math.min(Math.max(rect.right - popupWidth, 0), Math.max(vw - popupWidth, 0))
  const right = vw - left - popupWidth

  // Y — miuix's 3 branches: below if it fits below, else above if it fits there,
  // else centre on the anchor. Decision uses the raw gap (margin lives in the offset).
  const spaceBelow = vh - rect.bottom
  const spaceAbove = rect.top
  if (spaceBelow > popupHeight) {
    placement.value = 'below'
    popupStyle.value = {
      top: `${rect.bottom + margin}px`,
      right: `${right}px`,
      // Keep miuix's 8dp gap at the anchor and the viewport bottom.
      maxHeight: `${Math.max(spaceBelow - margin * 2, 0)}px`,
      transformOrigin: 'top right',
    }
  } else if (spaceAbove > popupHeight) {
    placement.value = 'above'
    popupStyle.value = {
      bottom: `${vh - rect.top + margin}px`,
      right: `${right}px`,
      maxHeight: `${Math.max(spaceAbove - margin * 2, 0)}px`,
      transformOrigin: 'bottom right',
    }
  } else {
    // Fits neither side: centre on the anchor's midpoint, clamped on-screen.
    placement.value = 'middle'
    const center = rect.top + rect.height / 2
    const top = Math.min(
      Math.max(center - popupHeight / 2, margin),
      Math.max(vh - popupHeight - margin, margin),
    )
    popupStyle.value = {
      top: `${top}px`,
      right: `${right}px`,
      maxHeight: `${Math.max(vh - margin * 2, 0)}px`,
      transformOrigin: 'right center',
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
  // AlphaEnterAnimationSpec: tween 200ms, default easing = FastOutSlowIn.
  aAnim = animate(alphaMv, 1, { duration: 0.2, ease: [0.4, 0, 0.2, 1] })
  // DimEnterAnimationSpec: tween 300ms SinOut.
  dAnim = animate(dimMv, 1, { duration: 0.3, ease: sinOutEasing })
}

function runExit(): void {
  stopAnims()
  fAnim = animate(fractionMv, 0, fractionSpec)
  // DimExitAnimationSpec: tween 150ms SinOut.
  dAnim = animate(dimMv, 0, { duration: 0.15, ease: sinOutEasing })
  // AlphaExitAnimationSpec: tween 150ms, default easing = FastOutSlowIn.
  aAnim = animate(alphaMv, 0, {
    duration: 0.15,
    ease: [0.4, 0, 0.2, 1],
    onComplete: () => {
      rendered.value = false
    },
  })
}

function openPopup(): void {
  if (props.disabled || open.value) return
  open.value = true
  rendered.value = true
  // Clear last open's offsets so the freshly-mounted popup measures at its natural
  // height (the below/above choice needs it); it stays invisible until runEnter.
  popupStyle.value = {}
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
  <div class="m-dropdown-preference" :class="{ 'm-dropdown-preference--disabled': props.disabled }">
    <MiuixBasicComponent
      :title="props.title"
      :summary="props.summary"
      :disabled="props.disabled"
      :hold-down="open"
      clickable
      @click="toggle"
    >
      <template #end>
        <span ref="anchorRef" class="m-dropdown-preference__end">
          <span
            v-if="spinner && selected?.color"
            class="m-dropdown-preference__swatch"
            :style="{ background: selected.color }"
          />
          <span class="m-dropdown-preference__value">{{ selected?.text }}</span>
          <span class="m-dropdown-preference__arrow"><IconArrowUpDown /></span>
        </span>
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
          ref="popupRef"
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
  // The popup anchor: the end-actions block (swatch? + value + arrow), matching
  // miuix's endActions Row. Its right edge / vertical centre drive popup placement.
  &__end {
    display: inline-flex;
    align-items: center;
  }

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

  // Disabled trigger: value + arrow dim to the disabled action color, matching
  // miuix (actionColor = disabledOnSecondaryVariant when !enabled) so the right
  // side reads as disabled like the title/summary, not the enabled actions color.
  &--disabled &__value,
  &--disabled &__arrow {
    color: var(--m-color-disabled-on-secondary-variant);
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
    // ListPopup MinWidth 200 / MaxWidth 288.
    min-width: 200px;
    max-width: 288px;
    padding: 0;
    border-radius: 16px;
    background: var(--m-color-surface-container);
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.18);
    overflow-y: auto;
    will-change: transform, opacity, clip-path;
  }

  &__item {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    box-sizing: border-box;
    padding: 12px 20px;
    border: 0;
    outline: none;
    background: var(--m-color-surface-container);
    color: var(--m-color-on-surface-container);
    font-family: inherit;
    text-align: left;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;

    // MiuixIndication: the default indication of miuix's .selectable() on each
    // row — an onBackground overlay, additive hover .06 / focus .08 / press .10,
    // 120ms linear. Disabled rows get none; hover is gated so a touch tap (which
    // emulates :hover) doesn't leave the feedback stuck.
    &:not(:disabled) {
      &::after {
        content: '';
        position: absolute;
        inset: 0;
        background: var(--m-color-on-background);
        opacity: 0;
        transition: opacity 120ms linear;
        pointer-events: none;
      }
      &:focus-visible::after {
        opacity: 0.08;
      }
      &:active::after {
        opacity: 0.1;
      }
      &:focus-visible:active::after {
        opacity: 0.18;
      }

      @media (hover: hover) {
        &:hover::after {
          opacity: 0.06;
        }
        &:hover:focus-visible::after {
          opacity: 0.14;
        }
        &:hover:active::after {
          opacity: 0.16;
        }
        &:hover:focus-visible:active::after {
          opacity: 0.24;
        }
      }
    }

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
      // checkColor: !enabled → disabledOnSecondaryVariant (not the primary
      // selectedIndicatorColor) even when this disabled row is the selected one.
      .m-dropdown-preference__check {
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
    // DropdownDefaults.MaxItemTextWidth.
    max-width: 216px;
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
