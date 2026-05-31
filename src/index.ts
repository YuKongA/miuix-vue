// Copyright 2026, miuix-vue contributors
// SPDX-License-Identifier: Apache-2.0

import './theme/tokens.scss'

export { setTheme, useTheme, type Theme } from './theme'
export {
  folmeSpring,
  folmeSpringByResponse,
  accelerateEasing,
  decelerateEasing,
  sinOutEasing,
  type EasingFn,
} from './anim'

export { MiuixButton, type MiuixButtonType } from './components/button'
export { MiuixCard, type MiuixCardPressFeedback } from './components/card'
export { MiuixDialog } from './components/dialog'
export { MiuixInput } from './components/input'
export { MiuixSlider, MiuixRangeSlider } from './components/slider'
export { MiuixSwitch } from './components/switch'
export { MiuixText, type MiuixTextType, type MiuixTextWeight } from './components/text'
export { MiuixSmallTitle } from './components/small-title'
export { MiuixDivider } from './components/divider'
export { MiuixSurface } from './components/surface'
export { MiuixBasicComponent } from './components/basic-component'
export { MiuixIcon } from './components/icon'
export { MiuixIconButton } from './components/icon-button'
export { MiuixCheckbox } from './components/checkbox'
export { MiuixRadioButton } from './components/radio-button'
export { MiuixSwitchPreference } from './components/switch-preference'
export { MiuixArrowPreference } from './components/arrow-preference'
export { MiuixCheckboxPreference } from './components/checkbox-preference'
export { MiuixRadioButtonPreference } from './components/radio-button-preference'
export { MiuixTabRow } from './components/tab-row'
export { MiuixProgressIndicator } from './components/progress-indicator'
export { MiuixDropdownPreference, type MiuixDropdownItem } from './components/dropdown-preference'
export { MiuixSpinnerPreference } from './components/spinner-preference'
export {
  MiuixSnackbarHost,
  showSnackbar,
  dismissSnackbar,
  dismissNewestSnackbar,
  dismissOldestSnackbar,
  type SnackbarOptions,
  type SnackbarResult,
  type SnackbarDuration,
} from './components/snackbar'
export { MiuixSearchBar } from './components/search-bar'
export { MiuixNumberPicker } from './components/number-picker'
export { MiuixColorPicker } from './components/color-picker'
export { MiuixFloatingActionButton } from './components/fab'
export { MiuixTopAppBar } from './components/top-app-bar'
export { MiuixNavigationBar, type MiuixNavigationItem } from './components/navigation-bar'
export { MiuixBottomSheet } from './components/bottom-sheet'
export { MiuixScrollArea } from './components/scroll-area'

export { IconArrowRight, IconArrowUpDown, IconCheck, IconSearch } from './icons'

// Replaced at build time with package.json's version (Vite `define`, see env.d.ts).
export const version = __APP_VERSION__
