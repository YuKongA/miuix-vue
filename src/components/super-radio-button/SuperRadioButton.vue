<script setup lang="ts">
// Copyright 2026, miuix-vue contributors
// SPDX-License-Identifier: Apache-2.0
//
// Ported from miuix-preference/.../RadioButtonPreference.kt.
//
// BasicComponent row with a RadioButton at the start (default, 5dp gap) or end.
// Clicking the row or the radio fires `select` (radios don't toggle off — the
// parent owns which option is selected). `modelValue` reflects selected state.

import { MiuixBasicComponent } from '../basic-component'
import { MiuixRadioButton } from '../radio-button'

defineOptions({ name: 'MiuixSuperRadioButton' })

interface Props {
  /** Whether this option is selected (v-model). */
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
  select: []
}>()

function select(): void {
  if (props.disabled) return
  if (!props.modelValue) emit('update:modelValue', true)
  emit('select')
}
</script>

<template>
  <MiuixBasicComponent
    :title="props.title"
    :summary="props.summary"
    :disabled="props.disabled"
    clickable
    @click="select"
  >
    <template v-if="props.location === 'start' || $slots.start" #start>
      <span
        v-if="props.location === 'start'"
        class="m-super-radio__control m-super-radio__control--start"
        @click.stop
        @pointerdown.stop
      >
        <MiuixRadioButton
          :model-value="props.modelValue"
          :disabled="props.disabled"
          @click="select"
        />
      </span>
      <slot name="start" />
    </template>
    <template #end>
      <span v-if="$slots.end" class="m-super-radio__end-extra">
        <slot name="end" />
      </span>
      <span
        v-if="props.location === 'end'"
        class="m-super-radio__control"
        @click.stop
        @pointerdown.stop
      >
        <MiuixRadioButton
          :model-value="props.modelValue"
          :disabled="props.disabled"
          @click="select"
        />
      </span>
    </template>
    <template v-if="$slots.bottom" #bottom>
      <slot name="bottom" />
    </template>
  </MiuixBasicComponent>
</template>

<style lang="scss">
.m-super-radio__control {
  display: inline-flex;
  align-items: center;

  &--start {
    margin-right: 5px;
  }
}

.m-super-radio__end-extra {
  display: inline-flex;
  align-items: center;
  margin-right: 8px;
  color: var(--m-color-on-surface-variant-actions);
}
</style>
