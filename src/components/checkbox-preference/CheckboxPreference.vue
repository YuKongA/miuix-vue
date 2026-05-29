<script setup lang="ts">
// Copyright 2026, miuix-vue contributors
// SPDX-License-Identifier: Apache-2.0
//
// Ported from miuix-preference/.../CheckboxPreference.kt.
//
// BasicComponent row with a Checkbox at the start (default) or end. The row
// click toggles; the checkbox toggles once (events stopped). Start checkbox has
// a 5dp gap to the title; end extra content sits left of an end checkbox.

import { MiuixBasicComponent } from '../basic-component'
import { MiuixCheckbox } from '../checkbox'

defineOptions({ name: 'MiuixCheckboxPreference' })

interface Props {
  modelValue?: boolean
  title?: string
  summary?: string
  disabled?: boolean
  location?: 'start' | 'end'
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  disabled: false,
  location: 'start',
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  change: [value: boolean]
}>()

function setValue(v: boolean): void {
  emit('update:modelValue', v)
  emit('change', v)
}

function toggle(): void {
  if (props.disabled) return
  setValue(!props.modelValue)
}
</script>

<template>
  <MiuixBasicComponent
    :title="props.title"
    :summary="props.summary"
    :disabled="props.disabled"
    clickable
    @click="toggle"
  >
    <template v-if="props.location === 'start' || $slots.start" #start>
      <span
        v-if="props.location === 'start'"
        class="m-checkbox-preference__control m-checkbox-preference__control--start"
        @click.stop
        @pointerdown.stop
      >
        <MiuixCheckbox
          :model-value="props.modelValue"
          :disabled="props.disabled"
          @update:model-value="setValue"
        />
      </span>
      <slot name="start" />
    </template>
    <template #end>
      <span v-if="$slots.end" class="m-checkbox-preference__end-extra">
        <slot name="end" />
      </span>
      <span
        v-if="props.location === 'end'"
        class="m-checkbox-preference__control"
        @click.stop
        @pointerdown.stop
      >
        <MiuixCheckbox
          :model-value="props.modelValue"
          :disabled="props.disabled"
          @update:model-value="setValue"
        />
      </span>
    </template>
    <template v-if="$slots.bottom" #bottom>
      <slot name="bottom" />
    </template>
  </MiuixBasicComponent>
</template>

<style lang="scss">
.m-checkbox-preference__control {
  display: inline-flex;
  align-items: center;

  &--start {
    margin-right: 5px;
  }
}

.m-checkbox-preference__end-extra {
  display: inline-flex;
  align-items: center;
  // 8dp spacer; endActions inherit the ambient colour (no BasicComponent tint).
  margin-right: 8px;
}
</style>
