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
// Label states (LabelAnimState):
//   Hidden      — no label prop
//   Placeholder — useLabelAsPlaceholder && text present → label hidden
//   Normal      — text empty → label shown at 17px over the input (placeholder)
//   Floating    — text present (!useLabelAsPlaceholder) → label floats up
//                 (-insideMargin/2 = -8) and shrinks to 10px; text shifts down 8.
// Border/label transitions use Compose default springs ≈ a short ease here.

import { computed, ref, useSlots } from 'vue'

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
// Native placeholder only when there is no managed label.
const nativePlaceholder = computed(() => (props.label ? undefined : props.placeholder))

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
      'm-input--focused': focused,
      'm-input--disabled': props.disabled,
      'm-input--with-leading': !!slots.leading,
      'm-input--with-trailing': !!slots.trailing,
    }"
  >
    <span v-if="slots.leading" class="m-input__icon m-input__icon--leading">
      <slot name="leading" />
    </span>
    <span class="m-input__content">
      <span
        v-if="labelVisible"
        class="m-input__label"
        :class="{ 'm-input__label--floating': floating }"
      >
        {{ props.label }}
      </span>
      <textarea
        v-if="!props.singleLine"
        class="m-input__field"
        :class="{ 'm-input__field--floating': floating }"
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
        :class="{ 'm-input__field--floating': floating }"
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
  // Border drawn as inset box-shadow: 0 → 2px, color bg → primary, animated.
  box-shadow: inset 0 0 0 0 var(--m-color-primary);
  transition: box-shadow 200ms ease-out;
  cursor: text;

  &--focused {
    box-shadow: inset 0 0 0 2px var(--m-color-primary);
  }

  &--disabled {
    cursor: not-allowed;
    opacity: 0.5;
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
    transition:
      transform 200ms ease-out,
      font-size 200ms ease-out;

    &--floating {
      font-size: 10px;
      transform: translateY(-8px);
    }
  }

  &--with-leading &__label {
    left: 12px;
  }

  &__field {
    width: 100%;
    box-sizing: border-box;
    margin: 0;
    padding: 16px;
    border: 0;
    outline: 0;
    background: transparent;
    color: var(--m-color-on-surface-container);
    font-family: inherit;
    font-size: var(--m-text-main-size);
    line-height: 1.2;
    caret-color: var(--m-color-primary);
    resize: none;
    transition:
      padding-top 200ms ease-out,
      padding-bottom 200ms ease-out;

    // Floating label: shift text down by insideMargin/2 (8) to clear the label.
    &--floating {
      padding-top: 24px;
      padding-bottom: 8px;
    }

    &::placeholder {
      color: var(--m-color-on-secondary-container);
      opacity: 1;
    }

    &:disabled {
      cursor: not-allowed;
      -webkit-text-fill-color: var(--m-color-disabled-on-surface);
      color: var(--m-color-disabled-on-surface);
    }
  }

  &--with-leading &__field {
    padding-left: 12px;
  }
  &--with-trailing &__field {
    padding-right: 12px;
  }
}
</style>
