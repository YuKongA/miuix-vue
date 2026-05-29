<script setup lang="ts">
// ColorPage — swatches of the miuix color-scheme tokens (light/dark adaptive).
import { MiuixSmallTitle, MiuixText } from '@/index'

const groups: Array<{ title: string; tokens: Array<{ name: string; var: string; on: string }> }> = [
  {
    title: 'Primary',
    tokens: [
      { name: 'primary', var: '--m-color-primary', on: '--m-color-on-primary' },
      {
        name: 'primaryVariant',
        var: '--m-color-primary-variant',
        on: '--m-color-on-primary-variant',
      },
      {
        name: 'primaryContainer',
        var: '--m-color-primary-container',
        on: '--m-color-on-primary-container',
      },
    ],
  },
  {
    title: 'Secondary',
    tokens: [
      { name: 'secondary', var: '--m-color-secondary', on: '--m-color-on-secondary' },
      {
        name: 'secondaryVariant',
        var: '--m-color-secondary-variant',
        on: '--m-color-on-secondary-variant',
      },
      {
        name: 'secondaryContainer',
        var: '--m-color-secondary-container',
        on: '--m-color-on-secondary-container',
      },
    ],
  },
  {
    title: 'Tertiary / Error',
    tokens: [
      {
        name: 'tertiaryContainer',
        var: '--m-color-tertiary-container',
        on: '--m-color-on-tertiary-container',
      },
      { name: 'error', var: '--m-color-error', on: '--m-color-on-error' },
      {
        name: 'errorContainer',
        var: '--m-color-error-container',
        on: '--m-color-on-error-container',
      },
    ],
  },
  {
    title: 'Surface / Background',
    tokens: [
      { name: 'background', var: '--m-color-background', on: '--m-color-on-background' },
      { name: 'surface', var: '--m-color-surface', on: '--m-color-on-surface' },
      {
        name: 'surfaceContainer',
        var: '--m-color-surface-container',
        on: '--m-color-on-surface-container',
      },
      {
        name: 'surfaceContainerHigh',
        var: '--m-color-surface-container-high',
        on: '--m-color-on-surface-container-high',
      },
      {
        name: 'surfaceContainerHighest',
        var: '--m-color-surface-container-highest',
        on: '--m-color-on-surface-container-highest',
      },
    ],
  },
]
</script>

<template>
  <div class="page">
    <template v-for="g in groups" :key="g.title">
      <MiuixSmallTitle :text="g.title" />
      <div class="color-grid">
        <div
          v-for="t in g.tokens"
          :key="t.name"
          class="color-swatch"
          :style="{ background: `var(${t.var})`, color: `var(${t.on})` }"
        >
          <MiuixText type="body2" weight="medium">{{ t.name }}</MiuixText>
        </div>
      </div>
    </template>
    <div style="height: 24px" />
  </div>
</template>

<style lang="scss">
.color-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 12px;
  padding: 0 12px 12px;
}
.color-swatch {
  display: flex;
  align-items: flex-end;
  min-height: 72px;
  padding: 12px;
  border-radius: var(--m-radius-md);
  box-shadow: inset 0 0 0 0.75px var(--m-color-divider-line);
}
</style>
