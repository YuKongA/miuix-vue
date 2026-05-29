<script setup lang="ts">
// Copyright 2026, miuix-vue contributors
// SPDX-License-Identifier: Apache-2.0
//
// Ported from miuix-preference/.../ArrowPreference.kt.
//
// BasicComponent row with a trailing ArrowRight (10×16) tinted
// onSurfaceVariantActions (disabled → disabledOnSecondaryVariant). Optional
// `end` content sits left of the arrow (8dp gap); `start` / `bottom` slots and
// holdDown are supported. The whole row is clickable.

import { computed } from 'vue'
import { MiuixBasicComponent } from '../basic-component'
import { IconArrowRight } from '../../icons'

defineOptions({ name: 'MiuixSuperArrow' })

interface Props {
  title?: string
  summary?: string
  disabled?: boolean
  holdDown?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  holdDown: false,
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const arrowColor = computed(() =>
  props.disabled
    ? 'var(--m-color-disabled-on-secondary-variant)'
    : 'var(--m-color-on-surface-variant-actions)',
)

function onClick(event: MouseEvent): void {
  if (props.disabled) return
  emit('click', event)
}
</script>

<template>
  <MiuixBasicComponent
    :title="props.title"
    :summary="props.summary"
    :disabled="props.disabled"
    :hold-down="props.holdDown"
    clickable
    @click="onClick"
  >
    <template v-if="$slots.start" #start>
      <slot name="start" />
    </template>
    <template #end>
      <span v-if="$slots.end" class="m-super-arrow__end-extra">
        <slot name="end" />
      </span>
      <span class="m-super-arrow__chevron" :style="{ color: arrowColor }">
        <IconArrowRight />
      </span>
    </template>
    <template v-if="$slots.bottom" #bottom>
      <slot name="bottom" />
    </template>
  </MiuixBasicComponent>
</template>

<style lang="scss">
.m-super-arrow__end-extra {
  display: inline-flex;
  align-items: center;
  margin-right: 8px;
  color: var(--m-color-on-surface-variant-actions);
}

.m-super-arrow__chevron {
  display: inline-flex;
  align-items: center;
}
</style>
