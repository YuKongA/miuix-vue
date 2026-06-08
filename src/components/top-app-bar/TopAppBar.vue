<script setup lang="ts">
// Copyright 2026, miuix-vue contributors
// SPDX-License-Identifier: Apache-2.0
//
// Ported from miuix-ui/.../basic/TopAppBar.kt.
//
// Two forms (mirroring miuix's SmallTopAppBar + TopAppBar), chosen by the
// consumer — e.g. by window size, like the example's AdaptiveTopAppBar
// (wide → pinned, narrow → collapsing; miuix `shouldShowSplitPane()`):
//   • pinned (default) — the 52-tall bar pinned at the top. title3 (20) Medium
//     centred, optional subtitle (body2, onSurfaceVariantSummary) below it.
//   • `large` — the scroll-driven COLLAPSING large-title bar. The large title
//     (title1 (32) Normal, left-aligned, titlePadding 26) scrolls away under the
//     sticky 52-bar; as it goes the small title cross-fades in.
//
// PLACEMENT: put the bar as a child of the scroll container it reacts to (e.g.
// first child of a MiuixScrollArea). The root is `display:contents` (see <style>)
// so its row / large title / bottom band become direct children of the scroll
// content — that's what lets the sticky 52-row pin across the WHOLE page instead
// of only the bar's own height.
//
// Collapse mechanics,逐字 from TopAppBarLayout:
//   collapsedFraction = |scrollTop| / expansion  (expansion = large block height,
//     = miuix heightOffsetLimit magnitude = largeTitle Column height).
//   largeTitleAlpha   = 1 - (collapsedFraction * 3).coerceIn(0,1)  — fades out
//     over the first 1/3 of the collapse.
//   smallTitleVisible = collapsedFraction * 3 >= 1  — flips at the same 1/3 point;
//     on flip the small title springs its graphicsLayer alpha (0↔1) and
//     translationY (20↔0): show = folmeSpring(damping 1.0, response 0.3),
//     hide = folmeSpring(damping 1.0, response 0.15).
//   title / largeTitle / subtitle colours animate tween 50ms (CSS transition).
//   expandedBottomPadding = SubtitleBottomPadding 8 (with subtitle) else
//     LargeTitleBottomPadding 4 — the gap below the large title (a margin, so it
//     stays out of the measured expansion).
//
// Platform mapping (铁律#1 — only where Compose nested-scroll can't map 1:1, same
// call ScrollArea makes): the bar is driven by the scroll container's NATIVE
// scrollTop instead of a nestedScroll connection / TopAppBarState. The large
// title living in scroll flow reproduces ExitUntilCollapsed exactly (it occupies
// `expansion` px of scroll the content scrolls THROUGH before the page moves).
// The settle (snapAnimationSpec = spring(stiffness=2500), NoBouncy): if a scroll
// leaves the bar intermediate, animate scrollTop to fully-open / -closed with that
// exact spring. It fires ONLY after a TOUCH gesture releases (`touchend`) and the
// post-release momentum settles. Wheel / trackpad scrolling never snaps: there's
// no clean gesture end, and a mid-scroll snap just fights the user (the jitter we
// hit when this was driven off `scrollend`). A new touch or any wheel cancels an
// in-flight snap. Decay/fling is the browser's. The blur/overlappedFraction and
// window-insets paths are out of scope (no blur in this port).

import { computed, onBeforeUnmount, onMounted, ref, useSlots, watch } from 'vue'
import { animate, motionValue } from 'motion-v'
import { MiuixText } from '../text'
import { folmeSpring, folmeSpringByResponse } from '../../anim'

defineOptions({ name: 'MiuixTopAppBar' })

interface Props {
  title?: string
  /** Large title text; defaults to title. */
  largeTitle?: string
  subtitle?: string
  /** Enable the scroll-driven collapsing large-title form. */
  large?: boolean
  color?: string
  /**
   * Explicit scroll container the collapse reacts to. When omitted (the common
   * case), the nearest scrollable ancestor is used — e.g. the MiuixScrollArea
   * this bar is placed inside.
   */
  scrollTarget?: HTMLElement | null
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  large: false,
  color: 'var(--m-color-surface)',
})

const slots = useSlots()

// TopAppBarDefaults (dp = px @ 1x DPR). CollapsedHeight 52 is fixed in CSS
// (the sticky row's min-height and the bottom band's sticky `top`).
const LARGE_TITLE_BOTTOM_PADDING = 4
const SUBTITLE_BOTTOM_PADDING = 8
// smallTitle hidden-state graphicsLayer translationY.
const HIDDEN_TRANSLATION_Y = 20

// expandedBottomPadding: SubtitleBottomPadding (8) with a subtitle, else
// LargeTitleBottomPadding (4).
const bottomPad = computed(() =>
  props.subtitle ? `${SUBTITLE_BOTTOM_PADDING}px` : `${LARGE_TITLE_BOTTOM_PADDING}px`,
)

// The root is `display:contents`, so the sticky row must carry its own opaque
// background to mask whatever scrolls under it (and, in pinned form, the
// subtitle's extra bottom padding).
const rowStyle = computed(() =>
  props.large
    ? { background: props.color }
    : { background: props.color, paddingBottom: bottomPad.value },
)

const rootRef = ref<HTMLElement | null>(null)
const largeRef = ref<HTMLElement | null>(null)

// ---- small-title graphicsLayer (alpha + translationY), spring-driven on flip ----
const smallAlphaMv = motionValue(0)
const smallTyMv = motionValue(HIDDEN_TRANSLATION_Y)
const smallAlpha = ref(0)
const smallTy = ref(HIDDEN_TRANSLATION_Y)
smallAlphaMv.on('change', (v: number) => (smallAlpha.value = v))
smallTyMv.on('change', (v: number) => (smallTy.value = v))

// In the collapsing form the centred title is the *small* title that springs in
// (graphicsLayer alpha + translationY). In pinned form it is simply the always-on
// title — no binding, so it renders at the default opacity 1 / no transform.
const smallTitleStyle = computed(() =>
  props.large
    ? { opacity: smallAlpha.value, transform: `translateY(${smallTy.value}px)` }
    : undefined,
)

// largeTitleAlpha = 1 - (collapsedFraction * 3).coerceIn(0,1) — bound directly.
const largeAlpha = ref(1)

let smallVisible = false
let smallAlphaAnim: { stop: () => void } | null = null
let smallTyAnim: { stop: () => void } | null = null

function setSmallVisible(visible: boolean): void {
  if (visible === smallVisible) return
  smallVisible = visible
  smallAlphaAnim?.stop()
  smallTyAnim?.stop()
  const spec = visible ? folmeSpringByResponse(1.0, 0.3) : folmeSpringByResponse(1.0, 0.15)
  smallAlphaAnim = animate(smallAlphaMv, visible ? 1 : 0, spec)
  smallTyAnim = animate(smallTyMv, visible ? 0 : HIDDEN_TRANSLATION_Y, spec)
}

// ---- scroll + settle wiring ----
const clamp = (x: number, lo: number, hi: number): number => Math.max(lo, Math.min(hi, x))

let container: HTMLElement | null = null
let expansion = 0 // = large block height (|heightOffsetLimit|)

// settle (snapAnimationSpec = spring(stiffness=2500), NoBouncy → dampingRatio 1).
const SETTLE_SPEC = folmeSpring(1.0, 2500)
// After a touch releases, snap once the post-release momentum has been idle this
// long (re-armed by momentum scroll events). Only touch arms it (touchSettlePending);
// wheel / trackpad scrolling never snaps. The window must exceed the gap between
// momentum scroll events so it waits for momentum to finish.
const SETTLE_IDLE_MS = 150
const settleMv = motionValue(0)
let settleAnim: { stop: () => void } | null = null
let settling = false
let settleTarget = 0
let settleTimer: ReturnType<typeof setTimeout> | null = null
// Set on touchend, consumed by the snap — gates snapping to touch gestures only.
let touchSettlePending = false
settleMv.on('change', (v: number) => {
  if (container) container.scrollTop = v
})

function scrollTop(): number {
  return container?.scrollTop ?? 0
}

function applyScroll(): void {
  if (expansion <= 0) {
    largeAlpha.value = 1
    setSmallVisible(false)
    return
  }
  const fraction = clamp(scrollTop() / expansion, 0, 1)
  largeAlpha.value = 1 - clamp(fraction * 3, 0, 1)
  setSmallVisible(fraction * 3 >= 1)
  if (settling) {
    // Our own snap write — release the flag once it has reached the target.
    if (Math.abs(scrollTop() - settleTarget) < 0.5) settling = false
  } else if (touchSettlePending) {
    // Touch-driven scroll: re-arm during the post-release momentum so the snap
    // fires once it settles. Wheel scrolls leave touchSettlePending false → no snap.
    scheduleSettle()
  }
}

function scheduleSettle(): void {
  clearSettleTimer()
  settleTimer = setTimeout(runSettle, SETTLE_IDLE_MS)
}

function clearSettleTimer(): void {
  if (settleTimer) {
    clearTimeout(settleTimer)
    settleTimer = null
  }
}

function cancelSettle(): void {
  touchSettlePending = false
  clearSettleTimer()
  settleAnim?.stop()
  settleAnim = null
  settling = false
}

// A touch gesture released — arm the snap; momentum (if any) re-arms it via scroll.
function onTouchEnd(): void {
  if (!props.large || expansion <= 0) return
  touchSettlePending = true
  scheduleSettle()
}

function runSettle(): void {
  settleTimer = null
  touchSettlePending = false // consume — one snap per touch gesture
  if (!props.large || settling || expansion <= 0) return
  const top = scrollTop()
  const fraction = clamp(top / expansion, 0, 1)
  // settleAppBar early-out: nothing to do when already (nearly) open or closed.
  if (fraction < 0.01 || fraction >= 1) return
  settleTarget = fraction < 0.5 ? 0 : expansion
  settling = true
  settleMv.set(top)
  settleAnim = animate(settleMv, settleTarget, SETTLE_SPEC)
}

function measure(): void {
  expansion = largeRef.value?.offsetHeight ?? 0
}

function findScrollParent(el: HTMLElement | null): HTMLElement | null {
  let node = el?.parentElement ?? null
  while (node) {
    const overflowY = getComputedStyle(node).overflowY
    if (overflowY === 'auto' || overflowY === 'scroll') return node
    node = node.parentElement
  }
  return null
}

let ro: ResizeObserver | null = null

function attach(): void {
  if (!props.large) return
  container = props.scrollTarget ?? findScrollParent(rootRef.value)
  measure()
  applyScroll()
  if (container) {
    container.addEventListener('scroll', applyScroll, { passive: true })
    // Snap only when a touch gesture releases (+ its momentum settles).
    container.addEventListener('touchend', onTouchEnd, { passive: true })
    // A fresh touch, a touch-cancel, or ANY wheel/trackpad scroll stops an
    // in-flight / pending snap — wheel scrolling itself never arms one.
    container.addEventListener('touchstart', cancelSettle, { passive: true })
    container.addEventListener('touchcancel', cancelSettle, { passive: true })
    container.addEventListener('wheel', cancelSettle, { passive: true })
  }
  if (typeof ResizeObserver !== 'undefined' && largeRef.value) {
    ro = new ResizeObserver(() => {
      measure()
      applyScroll()
    })
    ro.observe(largeRef.value)
  }
}

function detach(): void {
  if (container) {
    container.removeEventListener('scroll', applyScroll)
    container.removeEventListener('touchend', onTouchEnd)
    container.removeEventListener('touchstart', cancelSettle)
    container.removeEventListener('touchcancel', cancelSettle)
    container.removeEventListener('wheel', cancelSettle)
  }
  container = null
  ro?.disconnect()
  ro = null
  cancelSettle()
  smallAlphaAnim?.stop()
  smallTyAnim?.stop()
}

onMounted(() => {
  if (props.large) attach()
})

onBeforeUnmount(detach)

// Allow toggling `large` / re-targeting at runtime (e.g. the adaptive form
// switching on resize). flush:'post' so the large-title element has rendered
// before attach() measures it / observes it.
watch(
  () => [props.large, props.scrollTarget],
  () => {
    detach()
    if (props.large) attach()
  },
  { flush: 'post' },
)
</script>

<template>
  <div ref="rootRef" class="m-top-app-bar" :class="{ 'm-top-app-bar--large': props.large }">
    <!-- Collapsed 52-bar. Pinned mode: the static row. Large mode: sticky, opaque,
         carrying the small title that springs in as the large title scrolls off. -->
    <div class="m-top-app-bar__row" :style="rowStyle">
      <div class="m-top-app-bar__nav">
        <slot name="navigation" />
      </div>
      <div class="m-top-app-bar__title" :style="smallTitleStyle">
        <MiuixText type="title3" weight="medium" color="var(--m-color-on-surface)">
          {{ props.title }}
        </MiuixText>
        <MiuixText
          v-if="props.subtitle"
          type="body2"
          color="var(--m-color-on-surface-variant-summary)"
        >
          {{ props.subtitle }}
        </MiuixText>
      </div>
      <div class="m-top-app-bar__actions">
        <slot name="actions" />
      </div>
    </div>

    <!-- Large title (collapsing). In scroll flow, left-aligned; scrolls under the
         sticky row and cross-fades with the small title. Its measured height is
         the collapse `expansion`; the bottom gap is a margin (excluded from it). -->
    <div
      v-if="props.large"
      ref="largeRef"
      class="m-top-app-bar__large"
      :style="{ opacity: largeAlpha, marginBottom: bottomPad }"
    >
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

    <div v-if="slots.bottom" class="m-top-app-bar__bottom" :style="{ background: props.color }">
      <slot name="bottom" />
    </div>
  </div>
</template>

<style lang="scss">
.m-top-app-bar {
  // No box of its own: the row / large title / bottom band promote to direct
  // children of the scroll content so the sticky row pins across the whole page.
  display: contents;

  // animateColorAsState(tween 50ms) on the title / large title / subtitle.
  // tween's default easing is FastOutSlowIn (not linear).
  .m-text {
    transition: color 50ms cubic-bezier(0.4, 0, 0.2, 1);
  }

  // The collapsed 52 bar — sticky at the top of the scroll viewport in both forms
  // (z above the large title / page so its opaque bg masks them sliding under).
  &__row {
    position: sticky;
    top: 0;
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 52px;
  }

  // Navigation / actions are pinned to the collapsed 52px band (verticalCenter
  // = 26) so they stay put when a subtitle grows the row.
  &__nav,
  &__actions {
    position: absolute;
    top: 0;
    height: 52px;
    display: flex;
    align-items: center;
  }
  &__nav {
    left: 0;
    padding-left: 16px;
    min-width: 0;
  }
  &__actions {
    right: 0;
    // actions Row uses Arrangement.End — no inter-icon spacing.
    gap: 0;
    padding-right: 16px;
  }

  &__title {
    display: flex;
    flex-direction: column;
    align-items: center;
    // titlePadding 26 horizontal.
    padding: 0 26px;
    text-align: center;
    pointer-events: none;
  }

  // Large title (collapsing form) — in scroll flow, slides under the sticky row;
  // titlePadding 26 horizontal, bottom gap bound inline as a margin.
  &__large {
    position: relative;
    z-index: 0;
    padding: 0 26px;
  }

  // Bottom band (sub-toolbar) — pinned just under the collapsed row.
  &__bottom {
    position: sticky;
    top: 52px;
    z-index: 1;
  }
}
</style>
