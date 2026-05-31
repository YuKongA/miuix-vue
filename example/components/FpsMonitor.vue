<script setup lang="ts">
// 1:1 port of the miuix example's utils/FPSMonitor.kt.
//
// Compose measures frame timing with `withFrameNanos`; the web equivalent is
// requestAnimationFrame (its DOMHighResTimeStamp is real per-frame render time —
// the same signal stats.js / DevTools' FPS meter read). So this is a genuine FPS
// monitor, not an estimate.
//
// Shows AVG fps + the 1% LOW fps over a rolling 5s window (the 1% low = average of
// the slowest 1% of frames, surfacing stutter the average hides). Health colours
// track refFps = the highest avg seen in the last 30s. Draggable pill at top-centre.

import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

// ms equivalents of FPSMonitor.kt's ns constants.
const WINDOW_MS = 5_000 // 5s rolling window
const WINDOW_FRAME_CAP = 1_200 // ~240Hz × 5s upper bound
const MIN_SAMPLES = 30 // need ~0.5s of data before reporting
const REFRESH_INTERVAL_MS = 500 // refresh stats twice per second
const IDLE_THRESHOLD_MS = 500 // ignore gaps > 500ms (idle/background frames)
const REF_HISTORY_MS = 30_000 // refFps reflects the best avg in the last 30s
const REF_HISTORY_CAP = 120 // hard cap on stored avg ticks

// healthColor palette (Color(0xFF…) → rgb tuples) + Compose's Color.Gray.
const GREEN: RGB = [54, 209, 103] // 0xFF36D167
const YELLOW: RGB = [255, 178, 29] // 0xFFFFB21D
const RED: RGB = [255, 91, 41] // 0xFFFF5B29
const GRAY = 'rgb(136, 136, 136)' // Color.Gray

type RGB = [number, number, number]

const avg = ref(0)
const low1 = ref(0)
const refFps = ref(0)

const avgColor = computed(() => healthColor(avg.value, refFps.value))
const lowColor = computed(() => healthColor(low1.value, refFps.value))

function rgbStr(c: RGB): string {
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`
}

function lerp(a: RGB, b: RGB, t: number): string {
  return rgbStr([
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
  ])
}

function healthColor(value: number, ref: number): string {
  if (ref === 0 || value === 0) return GRAY
  const pct = Math.min(Math.max(value / ref, 0), 1)
  if (pct >= 0.75) return lerp(YELLOW, GREEN, (pct - 0.75) / 0.25)
  if (pct >= 0.5) return lerp(RED, YELLOW, (pct - 0.5) / 0.25)
  return rgbStr(RED)
}

// --- frame sampling (mirrors the withFrameNanos loop) ---
const samples: number[] = [] // frame deltas, ms
const avgHistory: { t: number; avg: number }[] = []
let sumMs = 0
let lastTs = 0
let nextRefreshTs = 0
let rafId = 0

function computeStats(): { avg: number; low1: number } {
  const size = samples.length
  const avgMs = sumMs / size
  const sorted = [...samples].sort((a, b) => a - b)
  const low1Count = Math.max(Math.floor(size / 100), 1)
  let low1SumMs = 0
  for (let i = size - low1Count; i < size; i++) low1SumMs += sorted[i]!
  const low1AvgMs = low1SumMs / low1Count
  // .toInt() truncates toward zero.
  return { avg: Math.trunc(1000 / avgMs), low1: Math.trunc(1000 / low1AvgMs) }
}

function onFrame(ts: number): void {
  if (lastTs !== 0) {
    const delta = ts - lastTs
    if (delta > 0 && delta <= IDLE_THRESHOLD_MS) {
      samples.push(delta)
      sumMs += delta
      while (sumMs > WINDOW_MS && samples.length > MIN_SAMPLES) sumMs -= samples.shift()!
      while (samples.length > WINDOW_FRAME_CAP) sumMs -= samples.shift()!
      if (ts >= nextRefreshTs && samples.length >= MIN_SAMPLES) {
        const s = computeStats()
        avg.value = s.avg
        low1.value = s.low1
        avgHistory.push({ t: ts, avg: s.avg })
        while (avgHistory.length > 1 && ts - avgHistory[0]!.t > REF_HISTORY_MS) avgHistory.shift()
        while (avgHistory.length > REF_HISTORY_CAP) avgHistory.shift()
        refFps.value = Math.max(...avgHistory.map((a) => a.avg))
        nextRefreshTs = ts + REFRESH_INTERVAL_MS
      }
    }
  }
  lastTs = ts
  rafId = requestAnimationFrame(onFrame)
}

// --- draggable pill ---
const containerRef = ref<HTMLElement | null>(null)
const pillRef = ref<HTMLElement | null>(null)
const offset = ref({ x: 0, y: 0 })
let drag: { px: number; py: number; ox: number; oy: number } | null = null

function clampOffset(raw: { x: number; y: number }): { x: number; y: number } {
  const c = containerRef.value
  const p = pillRef.value
  if (!c || !p) return raw
  const xRange = Math.max((c.clientWidth - p.offsetWidth) / 2, 0)
  const yMax = Math.max(c.clientHeight - p.offsetHeight, 0)
  return {
    x: Math.min(Math.max(raw.x, -xRange), xRange),
    y: Math.min(Math.max(raw.y, 0), yMax),
  }
}

const pillStyle = computed(() => ({
  transform: `translate(${Math.round(offset.value.x)}px, ${Math.round(offset.value.y)}px)`,
}))

function onPointerDown(e: PointerEvent): void {
  e.preventDefault()
  drag = { px: e.clientX, py: e.clientY, ox: offset.value.x, oy: offset.value.y }
  pillRef.value?.setPointerCapture(e.pointerId)
}

function onPointerMove(e: PointerEvent): void {
  if (!drag) return
  offset.value = clampOffset({
    x: drag.ox + (e.clientX - drag.px),
    y: drag.oy + (e.clientY - drag.py),
  })
}

function onPointerUp(e: PointerEvent): void {
  drag = null
  pillRef.value?.releasePointerCapture?.(e.pointerId)
}

let ro: ResizeObserver | null = null

onMounted(() => {
  rafId = requestAnimationFrame(onFrame)
  if (typeof ResizeObserver !== 'undefined' && containerRef.value) {
    ro = new ResizeObserver(() => (offset.value = clampOffset(offset.value)))
    ro.observe(containerRef.value)
  }
})

onBeforeUnmount(() => {
  cancelAnimationFrame(rafId)
  ro?.disconnect()
})
</script>

<template>
  <div ref="containerRef" class="fps-monitor">
    <div
      ref="pillRef"
      class="fps-monitor__pill"
      :style="pillStyle"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerUp"
    >
      <template v-if="avg === 0">
        <span class="fps-monitor__muted">--</span>
      </template>
      <template v-else>
        <span
          ><span class="fps-monitor__muted">AVG </span
          ><span :style="{ color: avgColor }">{{ avg }}</span></span
        >
        <span class="fps-monitor__muted">·</span>
        <span
          ><span class="fps-monitor__muted">LOW </span
          ><span :style="{ color: lowColor }">{{ low1 }}</span></span
        >
      </template>
    </div>
  </div>
</template>

<style lang="scss">
.fps-monitor {
  position: fixed;
  inset: 0;
  z-index: 9000;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: env(safe-area-inset-top);
  pointer-events: none;

  &__pill {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    border-radius: 12px;
    // surfaceContainerHigh @ 50% alpha.
    background: color-mix(in srgb, var(--m-color-surface-container-high) 50%, transparent);
    font-size: var(--m-text-body2-size);
    line-height: 1.2;
    white-space: nowrap;
    cursor: grab;
    touch-action: none;
    pointer-events: auto;
    user-select: none;
    // Smooth the health-colour change (approximates animateColorAsState).
    span {
      transition: color 0.2s ease;
    }
  }

  &__muted {
    color: var(--m-color-on-surface-secondary);
  }
}
</style>
