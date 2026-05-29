<script setup lang="ts">
// Copyright 2026, miuix-vue contributors
// SPDX-License-Identifier: Apache-2.0
//
// Ported from miuix-ui/.../basic/TabRow.kt (TabRow + TabRowWithContour, unified
// via `contour` per CLAUDE.md rule #2).
//
// Defaults (TabRowDefaults):
//   TabRow:        height 42, radius 12, tab min 76 / max 98, spacing 9, text body1 (16)
//   WithContour:   height 45, radius 8,  tab min 62 / max 84, spacing 5, text body2 (14),
//                  contour padding 5 → outer radius 13
//   colors: bg surface / content onSurfaceVariantSummary;
//           selected bg surfaceContainer / content onBackground
// Equal tab widths via calculateTabWidth (clamped to [min,max]); the selected
// indicator slides with tween 200ms linear. Selected tab text is bold.

import { Motion } from 'motion-v'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'

defineOptions({ name: 'MiuixTabRow' })

interface Props {
  modelValue?: number
  tabs?: string[]
  contour?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: 0,
  tabs: () => [],
  contour: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: number]
}>()

const defaults = computed(() =>
  props.contour
    ? { height: 45, radius: 8, minW: 62, maxW: 84, spacing: 5, pad: 5, textSize: 14 }
    : { height: 42, radius: 12, minW: 76, maxW: 98, spacing: 9, pad: 0, textSize: 16 },
)

const indicatorTransition = { duration: 0.2, ease: 'linear' as const }

const containerRef = ref<HTMLElement | null>(null)
const availableWidth = ref(0)
let ro: ResizeObserver | null = null

function measure(): void {
  if (!containerRef.value) return
  availableWidth.value = containerRef.value.clientWidth - defaults.value.pad * 2
}

onMounted(() => {
  if (!containerRef.value) return
  measure()
  if (typeof ResizeObserver !== 'undefined') {
    ro = new ResizeObserver(measure)
    ro.observe(containerRef.value)
  }
})
onUnmounted(() => {
  ro?.disconnect()
  ro = null
})
watch(() => props.contour, measure)

// Mirrors calculateTabWidth in source.
const tabWidth = computed(() => {
  const d = defaults.value
  const count = props.tabs.length
  if (count === 0) return d.minW
  const totalSpacing = count > 1 ? (count - 1) * d.spacing : 0
  const contentWidth = availableWidth.value - totalSpacing
  if (contentWidth <= 0) return d.minW
  const ideal = contentWidth / count
  if (ideal < d.minW) return d.minW
  if (ideal > d.maxW) {
    const totalMax = d.maxW * count + totalSpacing
    return totalMax < availableWidth.value ? ideal : d.maxW
  }
  return ideal
})

const indicatorOffset = computed(() => props.modelValue * (tabWidth.value + defaults.value.spacing))

// Auto-scroll the selected tab toward the centre (TabRow.kt lines 126-134):
//   scrollToItem(index, -(availableWidth - tabWidth)/2)
// → the tab's start sits centreOffset into the viewport. Instant on first
// settle, smooth thereafter.
const scrollRef = ref<HTMLElement | null>(null)
// Mirrors lastSettledSelectedTabIndex: snap on first settle and on geometry
// changes for the already-selected tab; animate only when the selection moves.
let lastSettledIndex = -1

function centerSelected(): void {
  const el = scrollRef.value
  if (!el) return
  const centerOffset = (availableWidth.value - tabWidth.value) / 2
  const target = props.modelValue * (tabWidth.value + defaults.value.spacing) - centerOffset
  const max = el.scrollWidth - el.clientWidth
  const animate = lastSettledIndex >= 0 && lastSettledIndex !== props.modelValue
  el.scrollTo({
    left: Math.max(0, Math.min(max, target)),
    behavior: animate ? 'smooth' : 'auto',
  })
  lastSettledIndex = props.modelValue
}

watch(() => [props.modelValue, tabWidth.value, availableWidth.value], centerSelected, {
  flush: 'post',
})
onMounted(centerSelected)

function select(index: number): void {
  if (index !== props.modelValue) emit('update:modelValue', index)
}
</script>

<template>
  <div
    ref="containerRef"
    class="m-tab-row"
    :class="{ 'm-tab-row--contour': props.contour }"
    :style="{ height: `${defaults.height}px`, '--m-tab-radius': `${defaults.radius}px` }"
  >
    <div ref="scrollRef" class="m-tab-row__scroll" :style="{ padding: `${defaults.pad}px` }">
      <div class="m-tab-row__track" :style="{ gap: `${defaults.spacing}px` }">
        <Motion
          class="m-tab-row__indicator"
          :style="{ width: `${tabWidth}px`, borderRadius: `${defaults.radius}px` }"
          :initial="false"
          :animate="{ x: indicatorOffset }"
          :transition="indicatorTransition"
        />
        <button
          v-for="(tab, index) in props.tabs"
          :key="index"
          type="button"
          class="m-tab-row__item"
          :class="{ 'm-tab-row__item--selected': index === props.modelValue }"
          :style="{
            width: `${tabWidth}px`,
            borderRadius: `${defaults.radius}px`,
            fontSize: `${defaults.textSize}px`,
          }"
          role="tab"
          :aria-selected="index === props.modelValue"
          @click="select(index)"
        >
          <span class="m-tab-row__label">{{ tab }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.m-tab-row {
  position: relative;
  width: 100%;
  box-sizing: border-box;
  background: var(--m-color-surface);

  &--contour {
    background: transparent;

    .m-tab-row__scroll {
      box-sizing: border-box;
      background: var(--m-color-surface);
      // outer radius = tab radius + 5 contour padding
      border-radius: calc(var(--m-tab-radius) + 5px);
    }
  }

  &__scroll {
    position: relative;
    width: 100%;
    height: 100%;
    overflow-x: auto;
    overflow-y: hidden;
    scrollbar-width: none;

    &::-webkit-scrollbar {
      display: none;
    }
  }

  // Indicator lives inside the track so it shares the tabs' origin (already
  // inset by the scroll's contour padding) — no left/top offset mismatch.
  &__indicator {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    height: 100%;
    background: var(--m-color-surface-container);
    pointer-events: none;
  }

  &__track {
    position: relative;
    display: flex;
    height: 100%;
    width: max-content;
  }

  &__item {
    flex: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    padding: 0 12px;
    border: 0;
    background: transparent;
    color: var(--m-color-on-surface-variant-summary);
    font-family: inherit;
    font-weight: 400;
    appearance: none;
    cursor: pointer;
    user-select: none;
    -webkit-tap-highlight-color: transparent;

    &--selected {
      color: var(--m-color-on-background);
      font-weight: 700;
    }
  }

  &--contour &__item {
    padding: 0;
  }

  &__label {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
}
</style>
