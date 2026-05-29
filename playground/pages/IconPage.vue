<script setup lang="ts">
// IconPage — grid of the built-in miuix icons (the set ported so far).
import { MiuixIcon, MiuixSmallTitle, MiuixText } from '@/index'
import { IconArrowRight, IconArrowUpDown, IconCheck, IconSearch } from '@/icons'

const icons = [
  { name: 'ArrowRight', comp: IconArrowRight },
  { name: 'ArrowUpDown', comp: IconArrowUpDown },
  { name: 'Check', comp: IconCheck },
  { name: 'Search', comp: IconSearch },
]
</script>

<template>
  <div class="page">
    <MiuixSmallTitle text="Icons" />
    <div class="icon-grid">
      <div v-for="ic in icons" :key="ic.name" class="icon-cell">
        <MiuixIcon :size="28"><component :is="ic.comp" /></MiuixIcon>
        <MiuixText type="footnote1" color="var(--m-color-on-surface-variant-summary)">{{
          ic.name
        }}</MiuixText>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.icon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(96px, 1fr));
  gap: 12px;
  padding: 0 12px 24px;
}
.icon-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 8px;
  border-radius: var(--m-radius-md);
  background: var(--m-color-surface-container);
  color: var(--m-color-on-surface-container);
}
</style>
