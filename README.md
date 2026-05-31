# miuix-vue

Vue 3 port of [miuix](https://github.com/YuKongA/miuix)'s visual and animation design language, for the Web.

Status: **POC**. 6 components, 1:1 with miuix source for every spring, dimension, and easing.

## What's in the box

| Component       | What it does                                                                              |
| :-------------- | :---------------------------------------------------------------------------------------- |
| `MiuixButton`   | `default` / `primary` variants, MiuixIndication alpha overlay on hover/focus/press        |
| `MiuixCard`     | `none` / `sink` / `tilt` press feedback with folmeSpring(0.8, 600) and folmeSpring(0.6, 400) |
| `MiuixInput`    | v-model input, focus border 0 → 2px in primary color                                      |
| `MiuixSwitch`   | drag + click toggle, three springs (offset / scale / track color), 50% snap threshold     |
| `MiuixSlider`   | drag + tap to position, folmeSpring(0.6, 987) thumb scale, two progress springs           |
| `MiuixDialog`   | Teleport + spring enter via folmeSpringByResponse(0.9, 0.3), DecelerateEasing(1.5) dim    |

Plus:

- `setTheme('light' \| 'dark')` and `useTheme()` for theming
- `folmeSpring(dampingRatio, stiffness)` + `folmeSpringByResponse(damping, response)` helpers
- `accelerateEasing` / `decelerateEasing` / `sinOutEasing` ports of miuix custom easings
- 53 color tokens and 14 text-style tokens as CSS variables (light + dark)

## Installation

```sh
bun add miuix-vue motion-v
# peers: vue >= 3.4, motion-v >= 2
```

## Usage

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { MiuixButton, MiuixSwitch, MiuixDialog, setTheme } from 'miuix-vue'
import 'miuix-vue/style.css'

const checked = ref(false)
const open = ref(false)
</script>

<template>
  <MiuixSwitch v-model="checked" />
  <MiuixButton type="primary" @click="open = true">Open</MiuixButton>
  <MiuixDialog v-model="open" title="Hello">
    <p>Body content.</p>
    <template #footer="{ close }">
      <MiuixButton @click="close">Cancel</MiuixButton>
      <MiuixButton type="primary" @click="close">OK</MiuixButton>
    </template>
  </MiuixDialog>
</template>
```

### Theming

Two themes ship out of the box, light and dark:

```ts
import { setTheme } from 'miuix-vue'
setTheme('dark')
```

All tokens are CSS variables under `:root` (light) and `.m-theme-dark`. Override globally or per-instance:

```vue
<MiuixButton type="primary" style="--m-color-primary: #ff5b8a"> Custom </MiuixButton>
```

### Animation helpers

```ts
import { folmeSpring, folmeSpringByResponse, decelerateEasing } from 'miuix-vue'

// Compose's spring(dampingRatio=0.7, stiffness=987) becomes:
folmeSpring(0.7, 987) // { type: 'spring', stiffness: 987, damping: ≈43.98, mass: 1 }

// Compose's folmeSpring(damping=0.9, response=0.3s) becomes:
folmeSpringByResponse(0.9, 0.3) // stiffness = (2π / 0.3)² ≈ 4376

// 4 custom easings, pass `decelerateEasing(1.5)` to motion-v's transition.ease
decelerateEasing(1.5)
```

## Development

```sh
bun install
bun run dev # example app at http://localhost:5173
bun run build # library build to dist/
bun run lint
bun run format
```

Project rules (1:1 visual parity, API conventions, Bun-only) are in [CLAUDE.md](./CLAUDE.md).

## Why this exists

miuix's interaction language — spring-based, not duration-based — feels distinct on Compose Android/Desktop. This package validates whether that feel survives the trip to Web/Vue. Every spring constant, every dp dimension, every easing curve traces back to a line in `miuix-ui/src/commonMain/`.

## License

Apache-2.0
