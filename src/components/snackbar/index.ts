// Copyright 2026, miuix-vue contributors
// SPDX-License-Identifier: Apache-2.0

export { default as MiuixSnackbarHost } from './SnackbarHost.vue'
export {
  showSnackbar,
  dismissSnackbar,
  dismissNewestSnackbar,
  dismissOldestSnackbar,
  type SnackbarOptions,
  type SnackbarResult,
  type SnackbarDuration,
} from './useSnackbar'
