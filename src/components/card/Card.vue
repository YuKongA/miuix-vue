<script setup lang="ts">
// Copyright 2026, miuix-vue contributors
// SPDX-License-Identifier: Apache-2.0
//
// Ported from miuix-ui/.../basic/Card.kt + utils/PressFeedback.kt.
//
// Sink and tilt press feedback animations match miuix exactly:
// SinkFeedback: scale 1.0 → 0.94 with folmeSpring(0.8, 600)
// TiltFeedback: rotationX/Y ±8° with folmeSpring(0.6, 400)
//             pivot follows touch quadrant, cameraDistance 12 * density

import { Motion } from 'motion-v'
import { computed, onUnmounted, ref } from 'vue'
import { folmeSpring } from '../../anim'

defineOptions({ name: 'MiuixCard' })

export type MiuixCardPressFeedback = 'none' | 'sink' | 'tilt'

interface Props {
  /** Visual press feedback. miuix PressFeedbackType. */
  pressFeedback?: MiuixCardPressFeedback
  // Background / content color are CSS-variable customization points
  // (--m-card-color / --m-card-content-color), not props, per CLAUDE.md rule #2.
  /** Draw the MiuixIndication alpha overlay on hover/press. */
  showIndication?: boolean
  /** Latch the press feedback on (e.g. while a long-press dialog is open). */
  holdDown?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  pressFeedback: 'none',
  showIndication: false,
  holdDown: false,
})

// showIndication wires the MiuixIndication via the pressable hover/press path,
// independent of click — a non-clickable card (e.g. the primaryVariant demo)
// still shows it. So gate the overlay on the flag alone.
const showOverlay = computed(() => props.showIndication)

const emit = defineEmits<{
  click: [event: MouseEvent]
  longPress: []
}>()

const SINK_AMOUNT = 0.94
const TILT_AMOUNT = 8
const LONG_PRESS_MS = 500
// Perspective = card width × this factor. The ±8° angle is fixed (miuix
// tiltAmount); a larger factor pushes the camera back, easing the press depth.
const TILT_PERSPECTIVE_FACTOR = 1.6

const sinkSpring = folmeSpring(0.8, 600)
const tiltSpring = folmeSpring(0.6, 400)

const pressed = ref(false)
const tiltX = ref(0)
const tiltY = ref(0)
const tiltOriginX = ref('50%')
const tiltOriginY = ref('50%')
// Perspective scales with the card width so the tilt's foreshortening is
// size-invariant (mirrors Compose's density-relative cameraDistance). A fixed
// tiny value (e.g. 12px) is degenerate: the near edge folds through the camera.
const tiltPerspective = ref('1000px')

const isInteractive = computed(() => props.pressFeedback !== 'none')
// Sink/tilt stay engaged while held down (HoldDownInteraction in source).
const engaged = computed(() => pressed.value || props.holdDown)

const animateTarget = computed(() => {
  if (props.pressFeedback === 'sink') {
    return { scale: engaged.value ? SINK_AMOUNT : 1 }
  }
  if (props.pressFeedback === 'tilt') {
    return { rotateX: tiltX.value, rotateY: tiltY.value }
  }
  return {}
})

const motionTransition = computed(() => {
  if (props.pressFeedback === 'sink') return sinkSpring
  if (props.pressFeedback === 'tilt') return tiltSpring
  return { duration: 0 }
})

const cardStyle = computed(() => ({
  transformOrigin: `${tiltOriginX.value} ${tiltOriginY.value}`,
  cursor: isInteractive.value ? 'pointer' : undefined,
}))

// Perspective lives on the wrapper. The camera (perspective-origin) sits at the
// same pivot corner as the card's transform-origin — Android's RenderNode places
// the camera at the pivot — so the pressed corner lifts toward the viewer.
const wrapperStyle = computed(() =>
  props.pressFeedback === 'tilt'
    ? {
        perspective: tiltPerspective.value,
        perspectiveOrigin: `${tiltOriginX.value} ${tiltOriginY.value}`,
      }
    : undefined,
)

let pressTimer: ReturnType<typeof setTimeout> | null = null
let longPressed = false

function clearPressTimer(): void {
  if (pressTimer !== null) {
    clearTimeout(pressTimer)
    pressTimer = null
  }
}

function onPointerDown(event: PointerEvent): void {
  pressed.value = true
  longPressed = false

  // Capture the pointer so the press holds (the 3D tilt changes hit geometry
  // and would otherwise fire pointerleave → reset). ONLY for a card that does
  // its own press feedback: a plain `none` container must not capture, or it
  // would steal pointerup/click from interactive children (checkbox, switch,
  // preference rows) and they'd stop responding.
  const el = event.currentTarget as HTMLElement
  if (isInteractive.value) {
    el.setPointerCapture?.(event.pointerId)
  }

  if (props.pressFeedback === 'tilt') {
    const rect = el.getBoundingClientRect()
    const offsetX = event.clientX - rect.left
    const offsetY = event.clientY - rect.top
    const halfW = rect.width / 2
    const halfH = rect.height / 2

    tiltPerspective.value = `${rect.width * TILT_PERSPECTIVE_FACTOR}px`
    tiltOriginX.value = offsetX < halfW ? '100%' : '0%'
    tiltOriginY.value = offsetY < halfH ? '100%' : '0%'
    tiltX.value = offsetY < halfH ? TILT_AMOUNT : -TILT_AMOUNT
    tiltY.value = offsetX < halfW ? -TILT_AMOUNT : TILT_AMOUNT
  }

  clearPressTimer()
  pressTimer = setTimeout(() => {
    longPressed = true
    emit('longPress')
  }, LONG_PRESS_MS)
}

function release(): void {
  pressed.value = false
  // Spring the rotation back to flat about the SAME pivot it tilted around —
  // leave tiltOrigin alone. Snapping the pivot to centre here would make the
  // still-tilted card swing about a new point mid-spring, popping the pivot
  // side up. The origin is harmless at rest (rotation 0) and is recomputed on
  // the next press.
  tiltX.value = 0
  tiltY.value = 0
  clearPressTimer()
}

function onClick(event: MouseEvent): void {
  // A completed long-press swallows the click (combinedClickable parity).
  if (longPressed) {
    longPressed = false
    return
  }
  emit('click', event)
}

onUnmounted(clearPressTimer)
</script>

<template>
  <div class="m-card-wrapper" :style="wrapperStyle">
    <Motion
      class="m-card"
      :class="[`m-card--feedback-${props.pressFeedback}`, { 'm-card--indication': showOverlay }]"
      :style="cardStyle"
      :animate="animateTarget"
      :transition="motionTransition"
      @pointerdown="onPointerDown"
      @pointerup="release"
      @pointercancel="release"
      @pointerleave="release"
      @click="onClick"
    >
      <slot />
    </Motion>
  </div>
</template>

<style lang="scss">
// 3D tilt needs perspective on a parent so the rotation renders with depth.
// The value is bound inline (wrapperStyle) to the card's pixel width, since
// Compose's cameraDistance is density-relative and a fixed tiny px is degenerate.
.m-card-wrapper {
  // Block by default so cards fill the available width (miuix fillMaxWidth).
  display: block;
}

.m-card {
  position: relative;
  // Mobile webkit (Android Chrome / iOS Safari) paints a tap highlight that
  // ignores border-radius — a tap would flash a right-angle block over the
  // rounded card. Kill it; the press feedback / indication overlay is the
  // intended visual. (No effect on desktop, which has no tap highlight.)
  -webkit-tap-highlight-color: transparent;
  // miuix Card content is a ColumnScope — children stack vertically.
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: var(--m-radius-md);
  // Theme via CSS variables (rule #2); defaults are the surfaceContainer tokens.
  background: var(--m-card-color, var(--m-color-surface-container));
  color: var(--m-card-content-color, var(--m-color-on-surface-container));

  &--feedback-tilt {
    // backface visibility prevents flicker during the 3D rotation
    backface-visibility: hidden;
    will-change: transform;
  }

  // MiuixIndication alpha overlay on press (onBackground, additive, 120ms linear).
  &--indication::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: var(--m-color-on-background);
    opacity: 0;
    transition: opacity 120ms linear;
    pointer-events: none;
  }
  &--indication:focus-visible::after {
    opacity: 0.08;
  }
  &--indication:active::after {
    opacity: 0.1;
  }
  &--indication:focus-visible:active::after {
    opacity: 0.18;
  }

  // Hover only on real pointers; on touch :hover sticks after a tap.
  @media (hover: hover) {
    &--indication:hover::after {
      opacity: 0.06;
    }
    &--indication:hover:focus-visible::after {
      opacity: 0.14;
    }
    &--indication:hover:active::after {
      opacity: 0.16;
    }
    &--indication:hover:focus-visible:active::after {
      opacity: 0.24;
    }
  }
}
</style>
