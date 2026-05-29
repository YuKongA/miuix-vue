<script setup lang="ts">
// Copyright 2026, miuix-vue contributors
// SPDX-License-Identifier: Apache-2.0
//
// Ported from miuix-ui/.../basic/Component.kt (BasicComponent).
//
// The list-row primitive every Preference row builds on.
//   - min-height 56, fillMaxWidth, insideMargin PaddingValues(16)
//   - title:   headline1 size (17), weight Medium (500), color onBackground
//   - summary: body2 size (14), color onSurfaceVariantSummary
//   - start / center / end / bottom action regions, 8dp spacers
//   - when clickable+enabled, draws the MiuixIndication alpha overlay
//     (onBackground, additive hover .06 / focus .08 / press .10, 120ms linear)
//
// miuix caps the end region at 60% of remaining width with intrinsic sizing;
// here flexbox gives center `flex:1; min-width:0` so end keeps its natural
// width and center truncates — visually equivalent for the row use cases.

import { computed, useSlots } from 'vue'
import { MiuixText } from '../text'

defineOptions({ name: 'MiuixBasicComponent' })

interface Props {
  title?: string
  summary?: string
  /** Title color override; defaults to onBackground (disabled → disabledOnSecondaryVariant). */
  titleColor?: string
  /** Summary color override; defaults to onSurfaceVariantSummary. */
  summaryColor?: string
  disabled?: boolean
  /** Whether the row reacts to clicks (cursor + indication overlay). */
  clickable?: boolean
  /** Sustained held-down visual state (e.g. while an attached dialog is open). */
  holdDown?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  clickable: false,
  holdDown: false,
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const slots = useSlots()

const interactive = computed(() => props.clickable && !props.disabled)

const resolvedTitleColor = computed(() => {
  if (props.titleColor) return props.titleColor
  return props.disabled
    ? 'var(--m-color-disabled-on-secondary-variant)'
    : 'var(--m-color-on-background)'
})

const resolvedSummaryColor = computed(() => {
  if (props.summaryColor) return props.summaryColor
  return props.disabled
    ? 'var(--m-color-disabled-on-secondary-variant)'
    : 'var(--m-color-on-surface-variant-summary)'
})

function onClick(event: MouseEvent): void {
  if (!interactive.value) return
  emit('click', event)
}
</script>

<template>
  <div
    class="m-basic-component"
    :class="{
      'm-basic-component--clickable': interactive,
      'm-basic-component--disabled': props.disabled,
      'm-basic-component--hold-down': props.holdDown,
    }"
    :role="interactive ? 'button' : undefined"
    :tabindex="interactive ? 0 : undefined"
    @click="onClick"
    @keydown.enter.prevent="interactive && emit('click', $event as unknown as MouseEvent)"
    @keydown.space.prevent="interactive && emit('click', $event as unknown as MouseEvent)"
  >
    <div class="m-basic-component__row">
      <div v-if="slots.start" class="m-basic-component__start">
        <slot name="start" />
      </div>
      <div class="m-basic-component__center">
        <slot>
          <MiuixText
            v-if="props.title != null"
            type="headline1"
            weight="medium"
            :color="resolvedTitleColor"
          >
            {{ props.title }}
          </MiuixText>
          <MiuixText v-if="props.summary != null" type="body2" :color="resolvedSummaryColor">
            {{ props.summary }}
          </MiuixText>
        </slot>
      </div>
      <div v-if="slots.end" class="m-basic-component__end">
        <slot name="end" />
      </div>
    </div>
    <div v-if="slots.bottom" class="m-basic-component__bottom" @click.stop @pointerdown.stop>
      <slot name="bottom" />
    </div>
  </div>
</template>

<style lang="scss">
.m-basic-component {
  position: relative;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 100%;
  min-height: 56px;
  padding: 16px;
  -webkit-tap-highlight-color: transparent;

  &__row {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__start {
    flex: none;
    display: flex;
    align-items: center;
  }

  &__center {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
  }

  &__end {
    flex: none;
    display: flex;
    align-items: center;
    margin-left: auto;
  }

  &__bottom {
    margin-top: 8px;
  }

  &--clickable {
    cursor: pointer;
    outline: none;

    // MiuixIndication alpha overlay (onBackground), additive, 120ms linear.
    &::after {
      content: '';
      position: absolute;
      inset: 0;
      background: var(--m-color-on-background);
      opacity: 0;
      transition: opacity 120ms linear;
      pointer-events: none;
    }
    &:hover::after {
      opacity: 0.06;
    }
    &:focus-visible::after {
      opacity: 0.08;
    }
    &:hover:focus-visible::after {
      opacity: 0.14;
    }
    &:active::after {
      opacity: 0.1;
    }
    &:hover:active::after {
      opacity: 0.16;
    }
  }

  // Sustained hold-down (HoldDownInteraction) → press alpha (0.10).
  &--hold-down::after {
    content: '';
    position: absolute;
    inset: 0;
    background: var(--m-color-on-background);
    opacity: 0.1;
    pointer-events: none;
  }

  &--disabled {
    cursor: not-allowed;
  }
}
</style>
