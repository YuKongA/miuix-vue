<script setup lang="ts">
// Copyright 2026, miuix-vue contributors
// SPDX-License-Identifier: Apache-2.0
//
// Ported from miuix-preference OverlaySpinnerPreference. A Spinner is a Dropdown
// whose items carry an icon (here a color swatch) + summary, and whose trigger
// shows the selected item richly. Implemented as MiuixDropdownPreference in spinner
// mode (web collapses Overlay/Window to one popup per goal).

import { MiuixDropdownPreference, type MiuixDropdownItem } from '../dropdown-preference'

defineOptions({ name: 'MiuixSpinnerPreference' })

interface Props {
  modelValue?: number
  title?: string
  summary?: string
  items?: Array<string | MiuixDropdownItem>
  disabled?: boolean
}

withDefaults(defineProps<Props>(), {
  modelValue: 0,
  items: () => [],
  disabled: false,
})

defineEmits<{
  'update:modelValue': [value: number]
  'update:expanded': [value: boolean]
}>()
</script>

<template>
  <MiuixDropdownPreference
    spinner
    :model-value="modelValue"
    :title="title"
    :summary="summary"
    :items="items"
    :disabled="disabled"
    @update:model-value="$emit('update:modelValue', $event)"
    @update:expanded="$emit('update:expanded', $event)"
  />
</template>
