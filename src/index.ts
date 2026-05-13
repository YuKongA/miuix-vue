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
export { MiuixSlider } from './components/slider'
export { MiuixSwitch } from './components/switch'

export const version = '0.0.0'
