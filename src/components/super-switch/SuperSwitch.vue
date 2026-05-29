<script setup lang="ts">
// Copyright 2026, miuix-vue contributors
// SPDX-License-Identifier: Apache-2.0
//
// Ported from miuix-preference/.../SwitchPreference.kt.
//
// BasicComponent row (title + summary) with a Switch at the end. Clicking the
// row toggles; clicking the switch toggles once (its events are stopped so the
// row click does not also fire). Optional extra `end` content sits left of the
// switch with an 8dp gap.

import { MiuixBasicComponent } from '../basic-component'
import { MiuixSwitch } from '../switch'

defineOptions({ name: 'MiuixSuperSwitch' })

interface Props {
  modelValue?: boolean
  title?: string
  summary?: string
  disabled?: boolean
  holdDown?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  disabled: false,
  holdDown: false,
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
    :hold-down="props.holdDown"
    clickable
    @click="toggle"
  >
    <template v-if="$slots.start" #start>
      <slot name="start" />
    </template>
    <template #end>
      <span v-if="$slots.end" class="m-super-switch__end-extra">
        <slot name="end" />
      </span>
      <span class="m-super-switch__control" @click.stop @pointerdown.stop>
        <MiuixSwitch
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
.m-super-switch__end-extra {
  display: inline-flex;
  align-items: center;
  margin-right: 8px;
  color: var(--m-color-on-surface-variant-actions);
}

.m-super-switch__control {
  display: inline-flex;
  align-items: center;
}
</style>
