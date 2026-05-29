<script setup lang="ts">
// Copyright 2026, miuix-vue contributors
// SPDX-License-Identifier: Apache-2.0
//
// Ported from miuix-ui/.../basic/ProgressIndicator.kt
// (Linear / Circular / Infinite, unified via `type` per CLAUDE.md rule #2).
//
// Defaults: linear height 6; circular size 30 / stroke 4; infinite size 20 /
//   stroke 2 / dot 2. fg primary, bg secondaryContainer (infinite: gray).
// Determinate linear fill = height + (width - height) * progress (so 0 → a dot).
// Determinate circular sweep = 0.1° + (360-0.1)*progress from -90°, round cap.
// Indeterminate linear: a 45%-wide segment sweeps + wraps every 1250ms (linear).
// Indeterminate circular: arc rotates (1000ms) while sweep breathes 30↔120°
//   (1600ms). Infinite: full ring + dot orbiting at r - 2*dot every 800ms.
// `progress` null → indeterminate.

import { computed } from 'vue'

defineOptions({ name: 'MiuixProgressIndicator' })

interface Props {
  type?: 'linear' | 'circular' | 'infinite'
  /** 0..1, or null/undefined for indeterminate. */
  progress?: number | null
  /** Linear height / circular+infinite diameter in px. */
  size?: number
  strokeWidth?: number
  /** Infinite indicator color; defaults to gray (source default). */
  color?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'linear',
  progress: null,
})

const LINEAR_H = 6
const CIRC_SIZE = 30
const CIRC_STROKE = 4
const INF_SIZE = 20
const INF_STROKE = 2
const INF_DOT = 2

const isIndeterminate = computed(() => props.progress == null)
const clamped = computed(() => Math.max(0, Math.min(1, props.progress ?? 0)))

// ---- linear ----
const linearH = computed(() => props.size ?? LINEAR_H)
const linearFillWidth = computed(
  () => `calc(${linearH.value}px + (100% - ${linearH.value}px) * ${clamped.value})`,
)

// ---- circular ----
const circSize = computed(() => props.size ?? CIRC_SIZE)
const circStroke = computed(() => props.strokeWidth ?? CIRC_STROKE)
const circR = computed(() => (circSize.value - circStroke.value) / 2)
const circC = computed(() => 2 * Math.PI * circR.value)
const circDeterminateDash = computed(() => {
  const sweep = 0.1 + (360 - 0.1) * clamped.value
  const visible = (sweep / 360) * circC.value
  return `${visible} ${circC.value - visible}`
})

// ---- infinite ----
const infSize = computed(() => props.size ?? INF_SIZE)
const infStroke = computed(() => props.strokeWidth ?? INF_STROKE)
const infR = computed(() => (infSize.value - infStroke.value) / 2)
const infOrbitR = computed(() => infR.value - 2 * INF_DOT)
// Source default Color.Gray = 0xFF888888 (CSS `gray` is #808080 — not the same).
const infColor = computed(() => props.color ?? '#888888')
</script>

<template>
  <!-- LINEAR -->
  <div
    v-if="props.type === 'linear'"
    class="m-progress m-progress--linear"
    :style="{ height: `${linearH}px` }"
    role="progressbar"
  >
    <template v-if="isIndeterminate">
      <!-- A 45%-wide bar sweeps 0→100%; the piece exiting the right re-enters
           from the left (overflow clips the rest), matching drawIndeterminateSegment. -->
      <span class="m-progress__linear-seg m-progress__linear-seg--main" />
      <span class="m-progress__linear-seg m-progress__linear-seg--wrap" />
    </template>
    <span v-else class="m-progress__linear-fill" :style="{ width: linearFillWidth }" />
  </div>

  <!-- CIRCULAR -->
  <svg
    v-else-if="props.type === 'circular'"
    class="m-progress m-progress--circular"
    :class="{ 'm-progress--circular-indet': isIndeterminate }"
    :width="circSize"
    :height="circSize"
    :viewBox="`0 0 ${circSize} ${circSize}`"
    role="progressbar"
  >
    <circle
      class="m-progress__circ-bg"
      :cx="circSize / 2"
      :cy="circSize / 2"
      :r="circR"
      fill="none"
      :stroke-width="circStroke"
    />
    <circle
      class="m-progress__circ-fg"
      :cx="circSize / 2"
      :cy="circSize / 2"
      :r="circR"
      fill="none"
      :stroke-width="circStroke"
      stroke-linecap="round"
      :stroke-dasharray="isIndeterminate ? undefined : circDeterminateDash"
      :style="
        isIndeterminate
          ? { '--m-circ-circumference': circC }
          : { transform: 'rotate(-90deg)', transformOrigin: 'center' }
      "
    />
  </svg>

  <!-- INFINITE -->
  <svg
    v-else
    class="m-progress m-progress--infinite"
    :width="infSize"
    :height="infSize"
    :viewBox="`0 0 ${infSize} ${infSize}`"
    role="progressbar"
  >
    <circle
      :cx="infSize / 2"
      :cy="infSize / 2"
      :r="infR"
      fill="none"
      :stroke="infColor"
      :stroke-width="infStroke"
      stroke-linecap="round"
    />
    <g class="m-progress__inf-orbit" :style="{ transformOrigin: 'center' }">
      <circle :cx="infSize / 2 + infOrbitR" :cy="infSize / 2" :r="INF_DOT" :fill="infColor" />
    </g>
  </svg>
</template>

<style lang="scss">
.m-progress {
  &--linear {
    position: relative;
    width: 100%;
    border-radius: 9999px;
    background: var(--m-color-secondary-container);
    overflow: hidden;
  }

  &__linear-fill {
    position: absolute;
    inset: 0 auto 0 0;
    height: 100%;
    border-radius: 9999px;
    background: var(--m-color-primary);
    // Source draws the determinate width directly each frame (no implicit tween).
  }

  &__linear-seg {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 45%;
    border-radius: 9999px;
    background: var(--m-color-primary);
    animation-duration: 1250ms;
    animation-timing-function: linear;
    animation-iteration-count: infinite;
  }
  &__linear-seg--main {
    animation-name: m-progress-linear-main;
  }
  &__linear-seg--wrap {
    animation-name: m-progress-linear-wrap;
  }

  &__circ-bg {
    stroke: var(--m-color-secondary-container);
  }

  &__circ-fg {
    stroke: var(--m-color-primary);
  }

  &--circular-indet .m-progress__circ-fg {
    transform-origin: center;
    animation:
      m-progress-circ-rotate 1000ms linear infinite,
      m-progress-circ-sweep 1600ms linear infinite;
  }

  &__inf-orbit {
    animation: m-progress-inf-rotate 800ms linear infinite;
  }
}

// Main bar: left 0 → 100% (its right tail is clipped past 100%).
@keyframes m-progress-linear-main {
  0% {
    left: 0%;
  }
  100% {
    left: 100%;
  }
}
// Wrap bar: trails one period behind (-100% → 0%), so the slice exiting the
// right re-enters at the left — overflow:hidden clips the off-screen remainder.
@keyframes m-progress-linear-wrap {
  0% {
    left: -100%;
  }
  100% {
    left: 0%;
  }
}

@keyframes m-progress-circ-rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes m-progress-circ-sweep {
  // sweep 30° → 120° → 30°; dasharray relative to circumference.
  0% {
    stroke-dasharray: calc(var(--m-circ-circumference) * 30 / 360)
      calc(var(--m-circ-circumference) * 330 / 360);
  }
  50% {
    stroke-dasharray: calc(var(--m-circ-circumference) * 120 / 360)
      calc(var(--m-circ-circumference) * 240 / 360);
  }
  100% {
    stroke-dasharray: calc(var(--m-circ-circumference) * 30 / 360)
      calc(var(--m-circ-circumference) * 330 / 360);
  }
}

@keyframes m-progress-inf-rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
