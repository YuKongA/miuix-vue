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
export { MiuixSuperSwitch } from './components/super-switch'
export { MiuixSuperArrow } from './components/super-arrow'
export { MiuixSuperCheckbox } from './components/super-checkbox'
export { MiuixSuperRadioButton } from './components/super-radio-button'
export { MiuixTabRow } from './components/tab-row'
export { MiuixProgressIndicator } from './components/progress-indicator'
export { MiuixSuperDropdown, type MiuixDropdownItem } from './components/super-dropdown'
export { MiuixSuperSpinner } from './components/super-spinner'
export {
  MiuixSnackbarHost,
  showSnackbar,
  dismissSnackbar,
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
export { MiuixScaffold } from './components/scaffold'

export { IconArrowRight, IconArrowUpDown, IconCheck, IconSearch } from './icons'

export const version = '0.0.0'
