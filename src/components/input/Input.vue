<script setup lang="ts">
// Copyright 2026, miuix-vue contributors
// SPDX-License-Identifier: Apache-2.0
//
// Ported from miuix-ui/.../basic/TextField.kt.
//
// TextFieldDefaults: cornerRadius 16, insideMargin 16×16, border 0 (unfocused) →
// 2 (focused, BorderWidth), label font 17 (normal) → 10 (floating), label weight
// Medium, bg secondaryContainer, label onSecondaryContainer, border + caret primary.
//
// TextFieldChrome animates border width/color, label offset and label font size
// via animateDpAsState / animateColorAsState, i.e. the Compose default spring
// spring(dampingRatio=1, stiffness=StiffnessMedium=1500) = folmeSpring(1, 1500).
// We drive `focusProgress` (border) and `floatProgress` (label/field shift) as
// motion values with that spring.
//
// Label states (LabelAnimState):
//   Hidden      — no label prop
//   Placeholder — useLabelAsPlaceholder && text present → label hidden
//   Normal      — text empty → label shown at 17px over the input (placeholder)
//   Floating    — text present (!useLabelAsPlaceholder) → label floats up
//                 (-insideMargin/2 = -8) and shrinks to 10px; text shifts down 8.
// When an icon is present its side inside-margin is dropped to 0 (gap = 0dp);
// the icon supplies its own spacing — there is no 12dp gap in the source.

import { animate, motionValue } from 'motion-v'
import { computed, onUnmounted, ref, useSlots, watch } from 'vue'
import { folmeSpring } from '../../anim'

defineOptions({ name: 'MiuixInput' })

interface Props {
  modelValue?: string
  /** Floating label text. When set, drives the 4-state label animation. */
  label?: string
  /** When true, the label is only a placeholder (hidden once text is entered). */
  useLabelAsPlaceholder?: boolean
  /** Plain placeholder, used only when no `label` is provided. */
  placeholder?: string
  disabled?: boolean
  readonly?: boolean
  /** Single line (input) vs multi-line (textarea). */
  singleLine?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  label: '',
  useLabelAsPlaceholder: false,
  placeholder: '',
  disabled: false,
  readonly: false,
  singleLine: true,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
}>()

const slots = useSlots()
const focused = ref(false)

const hasText = computed(() => props.modelValue.length > 0)
const labelVisible = computed(
  () => !!props.label && !(props.useLabelAsPlaceholder && hasText.value),
)
const floating = computed(() => !!props.label && !props.useLabelAsPlaceholder && hasText.value)
const nativePlaceholder = computed(() => (props.label ? undefined : props.placeholder))

// Compose default spring for animateDpAsState / animateColorAsState.
const SPRING = folmeSpring(1, 1500)

const focusMv = motionValue(0)
const floatMv = motionValue(floating.value ? 1 : 0)
const focusProgress = ref(0)
const floatProgress = ref(floating.value ? 1 : 0)
focusMv.on('change', (v: number) => (focusProgress.value = v))
floatMv.on('change', (v: number) => (floatProgress.value = v))
let focusAnim: { stop: () => void } | null = null
let floatAnim: { stop: () => void } | null = null

watch(focused, (v) => {
  focusAnim?.stop()
  focusAnim = animate(focusMv, v ? 1 : 0, SPRING)
})
watch(floating, (v) => {
  floatAnim?.stop()
  floatAnim = animate(floatMv, v ? 1 : 0, SPRING)
})
onUnmounted(() => {
  focusAnim?.stop()
  floatAnim?.stop()
})

// Border: 0 → 2px (inset box-shadow), primary (invisible at width 0 anyway).
const rootStyle = computed(() => ({
  boxShadow: `inset 0 0 0 ${(2 * focusProgress.value).toFixed(3)}px var(--m-color-primary)`,
}))
// Label floats up by insideMargin/2 (8) and shrinks 17 → 10.
const labelStyle = computed(() => ({
  transform: `translateY(${(-8 * floatProgress.value).toFixed(3)}px)`,
  fontSize: `${(17 - 7 * floatProgress.value).toFixed(3)}px`,
}))
// Field text shifts down by 8 when the label floats (vertical inside-margin 16).
const fieldStyle = computed(() => ({
  paddingTop: `${(16 + 8 * floatProgress.value).toFixed(3)}px`,
  paddingBottom: `${(16 - 8 * floatProgress.value).toFixed(3)}px`,
}))

function onInput(event: Event): void {
  emit('update:modelValue', (event.target as HTMLInputElement | HTMLTextAreaElement).value)
}
function onFocus(event: FocusEvent): void {
  focused.value = true
  emit('focus', event)
}
function onBlur(event: FocusEvent): void {
  focused.value = false
  emit('blur', event)
}
</script>

<template>
  <label
    class="m-input"
    :class="{
      'm-input--disabled': props.disabled,
      'm-input--with-leading': !!slots.leading,
      'm-input--with-trailing': !!slots.trailing,
    }"
    :style="rootStyle"
  >
    <span v-if="slots.leading" class="m-input__icon m-input__icon--leading">
      <slot name="leading" />
    </span>
    <span class="m-input__content">
      <span
        v-if="labelVisible"
        class="m-input__label"
        :class="{ 'm-input__label--floating': floating }"
        :style="labelStyle"
      >
        {{ props.label }}
      </span>
      <textarea
        v-if="!props.singleLine"
        class="m-input__field"
        :style="fieldStyle"
        :value="props.modelValue"
        :placeholder="nativePlaceholder"
        :disabled="props.disabled"
        :readonly="props.readonly"
        rows="1"
        @input="onInput"
        @focus="onFocus"
        @blur="onBlur"
      />
      <input
        v-else
        class="m-input__field"
        :style="fieldStyle"
        type="text"
        :value="props.modelValue"
        :placeholder="nativePlaceholder"
        :disabled="props.disabled"
        :readonly="props.readonly"
        @input="onInput"
        @focus="onFocus"
        @blur="onBlur"
      />
    </span>
    <span v-if="slots.trailing" class="m-input__icon m-input__icon--trailing">
      <slot name="trailing" />
    </span>
  </label>
</template>

<style lang="scss">
.m-input {
  position: relative;
  display: flex;
  align-items: stretch;
  width: 100%;
  border-radius: var(--m-radius-md);
  background: var(--m-color-secondary-container);
  // Border (inset box-shadow) width is spring-driven inline (rootStyle).
  cursor: text;

  &--disabled {
    cursor: not-allowed;
  }

  &__icon {
    display: flex;
    align-items: center;
    flex: none;
    color: var(--m-color-on-secondary-container);

    &--leading {
      padding-left: 16px;
    }
    &--trailing {
      padding-right: 16px;
    }
  }

  &__content {
    position: relative;
    flex: 1;
    min-width: 0;
    display: flex;
  }

  &__label {
    position: absolute;
    left: 16px;
    top: 16px;
    color: var(--m-color-on-secondary-container);
    font-size: 17px;
    font-weight: 500;
    line-height: 1.2;
    pointer-events: none;
    transform-origin: top left;
  }

  // Icon present → drop that side's inside-margin to 0 (gap = 0; icon supplies it).
  &--with-leading &__label {
    left: 0;
  }

  &__field {
    width: 100%;
    box-sizing: border-box;
    margin: 0;
    padding: 0 16px;
    border: 0;
    outline: 0;
    background: transparent;
    color: var(--m-color-on-background);
    font-family: inherit;
    font-size: var(--m-text-main-size);
    line-height: 1.2;
    caret-color: var(--m-color-primary);
    resize: none;

    &::placeholder {
      color: var(--m-color-on-secondary-container);
      opacity: 1;
    }

    &:disabled {
      cursor: not-allowed;
    }
  }

  &--with-leading &__field {
    padding-left: 0;
  }
  &--with-trailing &__field {
    padding-right: 0;
  }
}
</style>
