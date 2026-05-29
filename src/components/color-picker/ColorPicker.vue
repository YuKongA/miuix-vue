<script setup lang="ts">
// Copyright 2026, miuix-vue contributors
// SPDX-License-Identifier: Apache-2.0
//
// Ported from miuix-ui/.../basic/ColorPicker.kt (HsvColorPicker — the default
// ColorSpace.HSV). The OkHSV/OkLab/OkLch spaces are out of scope for the web
// MVP (they need the OkLab transform tables); HSV covers the example.
//
// Layout: optional preview bar (26, capsule) + Hue / Saturation / Value / Alpha
// ColorSliders, 12dp gap. Gradients per the source:
//   hue: full spectrum; saturation: white→hue; value: black→(hue,sat);
//   alpha: transparent→opaque over a checkerboard.

import { computed, ref, watch } from 'vue'
import ColorSlider from './ColorSlider.vue'

defineOptions({ name: 'MiuixColorPicker' })

interface Props {
  /** v-model color as a CSS rgb/rgba/hex string. */
  modelValue?: string
  showPreview?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '#3482ff',
  showPreview: true,
})

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const h = ref(0) // 0..360
const s = ref(0) // 0..1
const v = ref(0) // 0..1
const alpha = ref(1) // 0..1

function hsvToRgb(hh: number, ss: number, vv: number): [number, number, number] {
  const c = vv * ss
  const x = c * (1 - Math.abs(((hh / 60) % 2) - 1))
  const m = vv - c
  let r = 0
  let g = 0
  let b = 0
  if (hh < 60) [r, g, b] = [c, x, 0]
  else if (hh < 120) [r, g, b] = [x, c, 0]
  else if (hh < 180) [r, g, b] = [0, c, x]
  else if (hh < 240) [r, g, b] = [0, x, c]
  else if (hh < 300) [r, g, b] = [x, 0, c]
  else [r, g, b] = [c, 0, x]
  return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)]
}

function rgbToHsv(r: number, g: number, b: number): [number, number, number] {
  const rr = r / 255
  const gg = g / 255
  const bb = b / 255
  const max = Math.max(rr, gg, bb)
  const min = Math.min(rr, gg, bb)
  const d = max - min
  let hh = 0
  if (d !== 0) {
    if (max === rr) hh = ((gg - bb) / d) % 6
    else if (max === gg) hh = (bb - rr) / d + 2
    else hh = (rr - gg) / d + 4
    hh *= 60
    if (hh < 0) hh += 360
  }
  const ss = max === 0 ? 0 : d / max
  return [hh, ss, max]
}

function parseColor(input: string): { r: number; g: number; b: number; a: number } | null {
  const str = input.trim()
  let m = /^#([0-9a-f]{3})$/i.exec(str)
  if (m) {
    const hex = m[1]!
    return {
      r: parseInt(hex[0]! + hex[0], 16),
      g: parseInt(hex[1]! + hex[1], 16),
      b: parseInt(hex[2]! + hex[2], 16),
      a: 1,
    }
  }
  m = /^#([0-9a-f]{6})([0-9a-f]{2})?$/i.exec(str)
  if (m) {
    const hex = m[1]!
    return {
      r: parseInt(hex.slice(0, 2), 16),
      g: parseInt(hex.slice(2, 4), 16),
      b: parseInt(hex.slice(4, 6), 16),
      a: m[2] ? parseInt(m[2], 16) / 255 : 1,
    }
  }
  m = /^rgba?\(([^)]+)\)$/i.exec(str)
  if (m) {
    const parts = m[1]!.split(',').map((p) => parseFloat(p))
    return { r: parts[0] ?? 0, g: parts[1] ?? 0, b: parts[2] ?? 0, a: parts[3] ?? 1 }
  }
  return null
}

function rgbaString(r: number, g: number, b: number, a: number): string {
  return a >= 1 ? `rgb(${r}, ${g}, ${b})` : `rgba(${r}, ${g}, ${b}, ${Number(a.toFixed(3))})`
}

const selectedColor = computed(() => {
  const [r, g, b] = hsvToRgb(h.value, s.value, v.value)
  return rgbaString(r, g, b, alpha.value)
})

// Initialize + re-sync when the external color differs from the internal one.
function syncFrom(input: string): void {
  const parsed = parseColor(input)
  if (!parsed) return
  const [hh, ss, vv] = rgbToHsv(parsed.r, parsed.g, parsed.b)
  h.value = hh
  s.value = ss
  v.value = vv
  alpha.value = parsed.a
}
syncFrom(props.modelValue)
watch(
  () => props.modelValue,
  (val) => {
    if (val !== selectedColor.value) syncFrom(val)
  },
)

function emitChange(): void {
  emit('update:modelValue', selectedColor.value)
}

// Hue spectrum: anchors every 60° (red→yellow→green→cyan→blue→magenta→red).
// HSV→RGB is piecewise-linear in sRGB across each 60° band, so these 7 exact
// 1/6-fraction stops reproduce generateHsvHueColors()'s 36-step ramp exactly.
const hueStops = [
  { color: '#f00', at: 0 },
  { color: '#ff0', at: 1 / 6 },
  { color: '#0f0', at: 2 / 6 },
  { color: '#0ff', at: 3 / 6 },
  { color: '#00f', at: 4 / 6 },
  { color: '#f0f', at: 5 / 6 },
  { color: '#f00', at: 1 },
]
const saturationStops = computed(() => {
  const [r, g, b] = hsvToRgb(h.value, 1, 1)
  return [
    { color: '#fff', at: 0 },
    { color: `rgb(${r}, ${g}, ${b})`, at: 1 },
  ]
})
const valueStops = computed(() => {
  const [r, g, b] = hsvToRgb(h.value, s.value, 1)
  return [
    { color: '#000', at: 0 },
    { color: `rgb(${r}, ${g}, ${b})`, at: 1 },
  ]
})
const alphaStops = computed(() => {
  const [r, g, b] = hsvToRgb(h.value, s.value, v.value)
  return [
    { color: `rgba(${r}, ${g}, ${b}, 0)`, at: 0 },
    { color: `rgb(${r}, ${g}, ${b})`, at: 1 },
  ]
})

const hueValue = computed({
  get: () => h.value / 360,
  set: (val) => {
    h.value = val * 360
    emitChange()
  },
})
function setSat(val: number): void {
  s.value = val
  emitChange()
}
function setVal(val: number): void {
  v.value = val
  emitChange()
}
function setAlpha(val: number): void {
  alpha.value = val
  emitChange()
}
</script>

<template>
  <div class="m-color-picker">
    <div
      v-if="props.showPreview"
      class="m-color-picker__preview"
      :style="{ background: selectedColor }"
    />
    <ColorSlider v-model="hueValue" :stops="hueStops" />
    <ColorSlider :model-value="s" :stops="saturationStops" @update:model-value="setSat" />
    <ColorSlider :model-value="v" :stops="valueStops" @update:model-value="setVal" />
    <ColorSlider :model-value="alpha" :stops="alphaStops" checker @update:model-value="setAlpha" />
  </div>
</template>

<style lang="scss">
.m-color-picker {
  display: flex;
  flex-direction: column;
  gap: 12px;

  &__preview {
    width: 100%;
    height: 26px;
    border-radius: 9999px;
  }
}
</style>
