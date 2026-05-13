<script setup lang="ts">
// Copyright 2026, miuix-vue contributors
// SPDX-License-Identifier: Apache-2.0
//
// Ported from miuix-ui/.../basic/TextField.kt (placeholder-only flavor).
//
// POC scope:
//   - v-model + placeholder + disabled + readonly
//   - 16px corner radius, 16x16 padding (TextFieldDefaults)
//   - Focus border 0 → 2px in primary color
//   - Background secondaryContainer, caret + border = primary
// TODO (MVP): floating label, leading/trailing icons, text styles param.

import { ref } from 'vue'

defineOptions({ name: 'MiuixInput' })

interface Props {
  modelValue?: string
  placeholder?: string
  disabled?: boolean
  readonly?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: '',
  disabled: false,
  readonly: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
}>()

const focused = ref(false)

function onInput(event: Event): void {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
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
    }"
  >
    <input
      class="m-input__field"
      type="text"
      :value="props.modelValue"
      :placeholder="props.placeholder"
      :disabled="props.disabled"
      :readonly="props.readonly"
      @input="onInput"
      @focus="onFocus"
      @blur="onBlur"
    />
  </label>
</template>

<style lang="scss">
// miuix TextFieldDefaults: cornerRadius=16, padding 16x16, borderWidth focused=2/unfocused=0.
// Border drawn as inset box-shadow so 0→2px can animate without affecting layout.
.m-input {
  display: inline-flex;
  align-items: center;
  min-width: 240px;
  padding: 16px;
  border-radius: var(--m-radius-md);
  background: var(--m-color-secondary-container);
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

  &__field {
    flex: 1;
    width: 100%;
    min-width: 0;
    margin: 0;
    padding: 0;
    border: 0;
    outline: 0;
    background: transparent;
    color: var(--m-color-on-surface-container);
    font-family: inherit;
    font-size: var(--m-text-main-size);
    line-height: 1.2;
    caret-color: var(--m-color-primary);

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
}
</style>
