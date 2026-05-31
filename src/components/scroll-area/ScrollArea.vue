<script setup lang="ts">
// Copyright 2026, miuix-vue contributors
// SPDX-License-Identifier: Apache-2.0
//
// Ported from miuix-ui/.../basic/ScrollBar.kt (VerticalScrollBar + ScrollBarDefaults).
// miuix's ScrollBar is an OVERLAY bar an app draws over a scroll container
// (`Box { LazyColumn(...); VerticalScrollBar(rememberScrollBarAdapter(state)) }`,
// MainPage.kt). The Vue-idiomatic shape is a wrapper that owns the scroll viewport
// (like Radix ScrollArea) and overlays the thumb — so consumers just wrap content.
// Vertical only (the "side" bar); horizontal overflow is clipped.
//
// 1:1 with ScrollBarDefaults:
//   ThumbWidth 3.64 → DragThumbWidth 6 (hover/drag), 150ms FastOutSlowIn
//   ThumbAlpha 0.1  → DragThumbAlpha 0.3 (hover/drag), 150ms FastOutSlowIn
//   EndPadding 3.46 (gap from the right edge); CornerRadius = ThumbWidth/2 (pill)
//   ThumbMinLength 36; thumb length = trackSize · viewport/content, ≥ 36
//   visibility: 1 on scroll/hover/drag; after FadeDelay 1000ms → fade over
//     FadeDurationMillis 500ms (tween). Hover strip = ThumbWidth + EndPadding·2.
//   thumb colour = onSurface; effective alpha = thumbAlpha · visibility (nested
//     opacities multiply: __bar carries visibility, __thumb carries thumbAlpha).
//   Track is not drawn (miuix trackColor defaults to Unspecified / hidden).

import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { animate, motionValue } from 'motion-v'

defineOptions({ name: 'MiuixScrollArea' })

// ScrollBarDefaults (dp = px @ 1x DPR).
const THUMB_WIDTH = 3.64
const END_PADDING = 3.46
const THUMB_MIN_LENGTH = 36
const FADE_DELAY = 1000
const FADE_DURATION = 0.5 // 500ms, in seconds for motion-v
const HOVER_STRIP = THUMB_WIDTH + END_PADDING * 2
// FastOutSlowInEasing — Compose's default tween easing.
const FAST_OUT_SLOW_IN = [0.4, 0, 0.2, 1] as const

const rootRef = ref<HTMLElement | null>(null)
const viewportRef = ref<HTMLElement | null>(null)
const contentRef = ref<HTMLElement | null>(null)

const hasOverflow = ref(false)
const thumbTop = ref(0)
const thumbHeight = ref(0)
const isHovered = ref(false)
const isDragging = ref(false)
const highlighted = computed(() => isHovered.value || isDragging.value)

// visibility (0..1) — set to 1 instantly on activity, faded to 0 by motion-v.
const visMv = motionValue(0)
const visibility = ref(0)
visMv.on('change', (v: number) => (visibility.value = v))
let visAnim: { stop: () => void } | null = null
let hideTimer: ReturnType<typeof setTimeout> | null = null

const thumbStyle = computed(() => ({
  height: `${thumbHeight.value}px`,
  transform: `translateY(${thumbTop.value}px)`,
}))

function recompute(): void {
  const vp = viewportRef.value
  if (!vp) return
  const { scrollTop, clientHeight, scrollHeight } = vp
  // trackSize = the viewport height (no track padding: the app's bars sit outside
  // the scroll area, unlike miuix's in-LazyColumn contentPadding).
  const track = clientHeight
  const overflowing = scrollHeight - clientHeight > 1
  hasOverflow.value = overflowing
  if (!overflowing) return
  const visiblePart = clientHeight / scrollHeight
  const len = Math.max(track * visiblePart, THUMB_MIN_LENGTH)
  const maxThumb = track - len
  const maxScroll = scrollHeight - clientHeight
  // Round the length so sub-pixel scrollHeight noise doesn't retrigger the 150ms
  // length transition mid-scroll; the offset stays float (transform, no transition).
  thumbHeight.value = Math.round(len)
  thumbTop.value = maxScroll > 0 ? (scrollTop / maxScroll) * maxThumb : 0
}

function showBar(): void {
  visAnim?.stop()
  visAnim = null
  if (hideTimer) {
    clearTimeout(hideTimer)
    hideTimer = null
  }
  visMv.set(1)
}

function scheduleHide(): void {
  if (hideTimer) clearTimeout(hideTimer)
  hideTimer = setTimeout(() => {
    hideTimer = null
    visAnim?.stop()
    visAnim = animate(visMv, 0, { duration: FADE_DURATION, ease: FAST_OUT_SLOW_IN })
  }, FADE_DELAY)
}

function onScroll(): void {
  recompute()
  if (!hasOverflow.value) return
  showBar()
  if (!highlighted.value) scheduleHide()
}

function onRootMove(e: PointerEvent): void {
  const root = rootRef.value
  if (!root || !hasOverflow.value) return
  const rect = root.getBoundingClientRect()
  const hovered = e.clientX >= rect.right - HOVER_STRIP
  if (hovered === isHovered.value) return
  isHovered.value = hovered
  if (hovered) showBar()
  else if (!isDragging.value && visibility.value > 0) scheduleHide()
}

function onRootLeave(): void {
  if (!isHovered.value) return
  isHovered.value = false
  if (!isDragging.value && visibility.value > 0) scheduleHide()
}

let dragStartY = 0
let dragStartScroll = 0

function onThumbDown(e: PointerEvent): void {
  if (e.button !== 0) return
  const vp = viewportRef.value
  if (!vp) return
  e.preventDefault()
  isDragging.value = true
  dragStartY = e.clientY
  dragStartScroll = vp.scrollTop
  ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  showBar()
}

function onThumbMove(e: PointerEvent): void {
  if (!isDragging.value) return
  const vp = viewportRef.value
  if (!vp) return
  const maxThumb = vp.clientHeight - thumbHeight.value
  if (maxThumb <= 0) return
  const maxScroll = vp.scrollHeight - vp.clientHeight
  // Map thumb travel → content scroll: dragging the full thumb range scrolls the
  // full content range (miuix SliderAdapter.scrollScale, inverted).
  vp.scrollTop = dragStartScroll + ((e.clientY - dragStartY) / maxThumb) * maxScroll
}

function onThumbUp(e: PointerEvent): void {
  if (!isDragging.value) return
  isDragging.value = false
  ;(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId)
  if (!isHovered.value && visibility.value > 0) scheduleHide()
}

let ro: ResizeObserver | null = null

onMounted(() => {
  recompute()
  if (typeof ResizeObserver !== 'undefined') {
    ro = new ResizeObserver(() => recompute())
    if (viewportRef.value) ro.observe(viewportRef.value)
    if (contentRef.value) ro.observe(contentRef.value)
  }
})

onBeforeUnmount(() => {
  ro?.disconnect()
  ro = null
  visAnim?.stop()
  if (hideTimer) clearTimeout(hideTimer)
})

// Native scroll container — position is just scrollTop. Expose get/set so a parent
// can persist it (e.g. per-tab scroll restoration); set also refreshes the thumb.
defineExpose({
  getScrollTop: (): number => viewportRef.value?.scrollTop ?? 0,
  setScrollTop: (top: number): void => {
    if (!viewportRef.value) return
    viewportRef.value.scrollTop = top
    recompute()
  },
})
</script>

<template>
  <div ref="rootRef" class="m-scroll-area" @pointermove="onRootMove" @pointerleave="onRootLeave">
    <div ref="viewportRef" class="m-scroll-area__viewport" @scroll="onScroll">
      <div ref="contentRef" class="m-scroll-area__content"><slot /></div>
    </div>
    <div v-show="hasOverflow" class="m-scroll-area__bar" :style="{ opacity: visibility }">
      <div
        class="m-scroll-area__thumb"
        :class="{ 'm-scroll-area__thumb--active': highlighted }"
        :style="thumbStyle"
        @pointerdown="onThumbDown"
        @pointermove="onThumbMove"
        @pointerup="onThumbUp"
        @pointercancel="onThumbUp"
      />
    </div>
  </div>
</template>

<style lang="scss">
.m-scroll-area {
  position: relative;
  box-sizing: border-box;
  overflow: hidden;

  &__viewport {
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    overflow-x: hidden;
    overflow-y: auto;
    // Hide the native bar — the miuix overlay thumb replaces it.
    scrollbar-width: none;
    -ms-overflow-style: none;
    &::-webkit-scrollbar {
      width: 0;
      height: 0;
      display: none;
    }
  }

  &__content {
    min-height: 0;
  }

  // Carries the auto-hide visibility (0..1). pointer-events:none so content under
  // the overlay stays clickable; only the thumb opts back in.
  &__bar {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 1;
  }

  &__thumb {
    position: absolute;
    top: 0;
    right: 3.46px; // EndPadding
    width: 3.64px; // ThumbWidth
    background: var(--m-color-on-surface);
    border-radius: 999px; // CornerRadius = ThumbWidth/2 → pill (clamped to half-width)
    opacity: 0.1; // ThumbAlpha
    pointer-events: auto;
    touch-action: none;
    cursor: default;
    // DragAnimationDurationMillis 150ms, FastOutSlowIn. Width + alpha on highlight;
    // length on content-size change. NOT transform — the offset must track scroll.
    transition:
      width 150ms cubic-bezier(0.4, 0, 0.2, 1),
      height 150ms cubic-bezier(0.4, 0, 0.2, 1),
      opacity 150ms cubic-bezier(0.4, 0, 0.2, 1);

    &--active {
      width: 6px; // DragThumbWidth
      opacity: 0.3; // DragThumbAlpha
    }
  }
}
</style>
