# miuix-vue

[![npm version](https://img.shields.io/npm/v/miuix-vue.svg)](https://www.npmjs.com/package/miuix-vue)
[![npm downloads](https://img.shields.io/npm/dm/miuix-vue.svg)](https://www.npmjs.com/package/miuix-vue)
[![license](https://img.shields.io/npm/l/miuix-vue.svg)](./LICENSE)

A Vue 3 component library with a clean, modern design language and physically-based spring animations.

## Installation

```sh
npm install miuix-vue motion-v vue
# pnpm add miuix-vue motion-v vue
# yarn add miuix-vue motion-v vue
# bun add miuix-vue motion-v vue
```

`vue` (^3.4) and `motion-v` (^2) are peer dependencies.

## Usage

Import the components you need and the stylesheet once at your app entry:

```ts
// main.ts
import 'miuix-vue/style.css'
```

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { MiuixButton, MiuixSwitch } from 'miuix-vue'

const on = ref(false)
</script>

<template>
  <MiuixButton type="primary" @click="on = !on">Toggle</MiuixButton>
  <MiuixSwitch v-model="on" />
</template>
```

Components follow Vue conventions: string-enum props (`type="primary"`, `size="large"`), `v-model` for state, boolean flags (`disabled`, `loading`), slots for content, and emits for events.

## Theming

Colors, radii, and text styles are exposed as CSS variables, so you can override any token in your own stylesheet. The active theme is toggled by a `.m-theme-dark` class on `<html>`, managed for you:

```ts
import { setThemeMode, useTheme } from 'miuix-vue'

setThemeMode('system') // 'system' (follows OS) | 'light' | 'dark'

const { theme } = useTheme() // reactive 'light' | 'dark'
```

## Icons

`MiuixIcon` renders any icon from the extended pack, which ships as a separate entry so it stays out of your bundle until you import it:

```vue
<script setup lang="ts">
import { MiuixIcon } from 'miuix-vue'
import { Alarm } from 'miuix-vue/icons'
</script>

<template>
  <MiuixIcon :icon="Alarm" weight="regular" :size="24" />
</template>
```

Individual icons tree-shake; each is available in five weights (`light` / `normal` / `regular` / `medium` / `demibold`).

## Components

| Group                       | Components                                                                                                               |
| :-------------------------- | :----------------------------------------------------------------------------------------------------------------------- |
| **Basics**                  | Button · IconButton · FloatingActionButton · Card · Surface · BasicComponent · Text · SmallTitle · Divider · Icon        |
| **Inputs**                  | Switch · Slider · RangeSlider · Input · Checkbox · RadioButton · NumberPicker · ColorPicker · SearchBar                  |
| **Preference rows**         | SwitchPreference · ArrowPreference · CheckboxPreference · RadioButtonPreference · DropdownPreference · SpinnerPreference |
| **Navigation & containers** | TopAppBar · NavigationBar · TabRow · BottomSheet · Dialog · ScrollArea                                                   |
| **Feedback**                | ProgressIndicator · Snackbar                                                                                             |

Snackbars are driven imperatively via `showSnackbar()` + a single `<MiuixSnackbarHost />`.

## Development

This repo is a library plus a multi-page example app. [Bun](https://bun.sh) is the package manager.

```sh
bun install          # install dependencies
bun run dev          # start the example app on localhost:5173
bun run build        # type-check and build the library to dist/
bun run type-check   # vue-tsc type check
bun run lint         # oxlint + ESLint
bun run format       # Prettier
```

## Credits

The design language and animation curves are based on [miuix](https://github.com/compose-miuix-ui/miuix), the Compose Multiplatform UI library. The underlying visual design draws on Xiaomi's design language; all related design rights belong to Xiaomi.

This is an independent, community project. It is **not** affiliated with, endorsed by, or sponsored by Xiaomi, and is not associated with MIUI or HyperOS. "Xiaomi", "MIUI", and "HyperOS" are trademarks of Xiaomi Corporation and are used here for descriptive purposes only.
