<script setup lang="ts">
// ColorPage — 1:1 with the miuix example ColorPage.kt / ColorsPreview.
//
// Renders every color-scheme token as a 100px swatch in a 2-column grid, for
// three palettes at once: the current theme, the light theme, and the dark
// theme. The light/dark cards are force-scoped via the `.m-theme-light` /
// `.m-theme-dark` token scopes, so each swatch's `var(--m-color-*)` resolves to
// that palette regardless of which theme the app is currently in.
//
// (miuix's page also shows "Dynamic Light/Dark"; dynamic color is out of scope
// for this port — see CLAUDE.md "仅 Light / Dark 两套" — so those are omitted.)
import { computed } from 'vue'
import { MiuixCard, MiuixSmallTitle, MiuixText, useTheme } from '@/index'

// The token list + ordering are copied verbatim from ColorsPreview's colorList
// in ColorPage.kt. sliderBackground is intentionally absent — miuix's page does
// not preview it either.
const COLOR_TOKENS = [
  'primary',
  'onPrimary',
  'primaryVariant',
  'onPrimaryVariant',
  'error',
  'onError',
  'errorContainer',
  'onErrorContainer',
  'disabledPrimary',
  'disabledOnPrimary',
  'disabledPrimaryButton',
  'disabledOnPrimaryButton',
  'disabledPrimarySlider',
  'primaryContainer',
  'onPrimaryContainer',
  'secondary',
  'onSecondary',
  'secondaryVariant',
  'onSecondaryVariant',
  'disabledSecondary',
  'disabledOnSecondary',
  'disabledSecondaryVariant',
  'disabledOnSecondaryVariant',
  'secondaryContainer',
  'onSecondaryContainer',
  'secondaryContainerVariant',
  'onSecondaryContainerVariant',
  'tertiaryContainer',
  'onTertiaryContainer',
  'tertiaryContainerVariant',
  'background',
  'onBackground',
  'onBackgroundVariant',
  'surface',
  'onSurface',
  'surfaceVariant',
  'onSurfaceSecondary',
  'onSurfaceVariantSummary',
  'onSurfaceVariantActions',
  'disabledOnSurface',
  'surfaceContainer',
  'onSurfaceContainer',
  'onSurfaceContainerVariant',
  'surfaceContainerHigh',
  'onSurfaceContainerHigh',
  'surfaceContainerHighest',
  'onSurfaceContainerHighest',
  'outline',
  'dividerLine',
  'windowDimming',
  'sliderKeyPoint',
  'sliderKeyPointForeground',
] as const

type SectionId = 'current' | 'light' | 'dark'
interface Section {
  id: SectionId
  title: string
  /** Token-scope class that forces this palette; omitted for the live theme. */
  cls?: string
}
const sections: Section[] = [
  { id: 'current', title: 'Current Theme Colors' },
  { id: 'light', title: 'Light Theme Colors', cls: 'm-theme-light' },
  { id: 'dark', title: 'Dark Theme Colors', cls: 'm-theme-dark' },
]

interface Block {
  name: string
  displayName: string
  /** CSS variable holding this token's value. */
  varName: string
  /** The paired token's variable (e.g. primary↔onPrimary), or null. */
  pairVar: string | null
}

// camelCase token name → CSS variable / display label, matching ColorPage.kt:
//   varName: `--m-color-` + kebab-case
//   displayName: a space before each capital, first letter upper-cased.
const kebab = (name: string): string => name.replace(/[A-Z]/g, (c) => '-' + c.toLowerCase())
const varOf = (name: string): string => `--m-color-${kebab(name)}`
const displayNameOf = (name: string): string =>
  name
    .replace(/([A-Z])/g, ' $1')
    .trim()
    .replace(/^./, (c) => c.toUpperCase())

// ColorsPreview pairs each block with its complement: an `onX` swatch is drawn
// in X's color (and vice-versa) when the partner is also in the list. The label
// is then the partner's color; otherwise it falls back to luminance (below).
const names = new Set<string>(COLOR_TOKENS)
function pairVarOf(name: string): string | null {
  if (name.startsWith('on')) {
    const rest = name.slice(2)
    const base = rest.charAt(0).toLowerCase() + rest.slice(1)
    if (names.has(base)) return varOf(base)
  } else {
    const onName = 'on' + name.charAt(0).toUpperCase() + name.slice(1)
    if (names.has(onName)) return varOf(onName)
  }
  return null
}

const BLOCKS: Block[] = COLOR_TOKENS.map((name) => ({
  name,
  displayName: displayNameOf(name),
  varName: varOf(name),
  pairVar: pairVarOf(name),
}))

// ---- Luminance fallback for un-paired tokens ----
// miuix's ColorBlock labels an un-paired swatch black when its luminance > 0.5,
// white otherwise. We read each token's resolved value from a hidden probe in
// the target theme scope — no color literals are duplicated in JS; everything
// comes from tokens.scss (the single source of truth).
function parseRgb(value: string): [number, number, number] | null {
  const v = value.trim()
  if (v.startsWith('#')) {
    let hex = v.slice(1)
    if (hex.length === 3 || hex.length === 4) {
      hex = hex
        .split('')
        .map((c) => c + c)
        .join('')
    }
    if (hex.length < 6) return null
    return [
      parseInt(hex.slice(0, 2), 16),
      parseInt(hex.slice(2, 4), 16),
      parseInt(hex.slice(4, 6), 16),
    ]
  }
  const m = v.match(/rgba?\(([^)]+)\)/i)
  if (m && m[1]) {
    const [r, g, b] = m[1]
      .split(/[,\s/]+/)
      .filter(Boolean)
      .map(Number)
    if (r === undefined || g === undefined || b === undefined) return null
    return [r, g, b]
  }
  return null
}

// Port of Compose Color.luminance(): sRGB EOTF expansion + Rec.709 luma weights.
// Alpha is ignored (the original computes luminance on the straight RGB).
function channel(c: number): number {
  const cs = c / 255
  return cs <= 0.04045 ? cs / 12.92 : Math.pow((cs + 0.055) / 1.055, 2.4)
}
function luminance(r: number, g: number, b: number): number {
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
}

function readFallback(themeClass: string | null): Record<string, string> {
  const out: Record<string, string> = {}
  if (typeof document === 'undefined') return out
  const probe = document.createElement('div')
  if (themeClass) probe.className = themeClass
  probe.style.display = 'none'
  document.body.appendChild(probe)
  const cs = getComputedStyle(probe)
  for (const b of BLOCKS) {
    if (b.pairVar) continue
    const rgb = parseRgb(cs.getPropertyValue(b.varName))
    out[b.name] = rgb && luminance(rgb[0], rgb[1], rgb[2]) > 0.5 ? '#000000' : '#ffffff'
  }
  document.body.removeChild(probe)
  return out
}

// Light/dark palettes are static, so read each once. The current theme equals
// one of them, switched reactively on the live theme.
const lightFallback = readFallback('m-theme-light')
const darkFallback = readFallback('m-theme-dark')
const { theme } = useTheme()
const currentFallback = computed(() => (theme.value === 'dark' ? darkFallback : lightFallback))

function labelColor(id: SectionId, block: Block): string {
  if (block.pairVar) return `var(${block.pairVar})`
  const map = id === 'light' ? lightFallback : id === 'dark' ? darkFallback : currentFallback.value
  return map[block.name] ?? 'currentColor'
}
function blockStyle(id: SectionId, block: Block): Record<string, string> {
  return { background: `var(${block.varName})`, borderColor: labelColor(id, block) }
}
</script>

<template>
  <div class="page">
    <template v-for="section in sections" :key="section.id">
      <MiuixSmallTitle :text="section.title" />
      <MiuixCard class="color-card" :class="section.cls">
        <div class="color-grid">
          <div
            v-for="block in BLOCKS"
            :key="block.name"
            class="color-block"
            :style="blockStyle(section.id, block)"
          >
            <MiuixText class="color-block__label" :color="labelColor(section.id, block)">{{
              block.displayName
            }}</MiuixText>
          </div>
        </div>
      </MiuixCard>
    </template>
  </div>
</template>

<style lang="scss">
.color-card {
  margin: 0 12px 12px;
  // insideMargin horizontal=16 + ColorsPreview top=16 + each row's bottom=16
  // collapse to a uniform 16px frame; the 16px grid gap supplies the rest.
  .m-card {
    padding: 16px;
  }
}

.color-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.color-block {
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  height: 100px;
  // ColorBlockCornerRadius = 12.dp; squircleBorder 1.dp in the label color.
  border: 1px solid;
  border-radius: 12px;
}

.color-block__label {
  // Text(modifier = padding(12.dp)), centered.
  padding: 12px;
  text-align: center;
  overflow-wrap: anywhere;
}
</style>
