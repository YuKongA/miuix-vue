<script setup lang="ts">
// IconPage — the full miuix extended icon pack (155 icons × 5 weights).
// Mirrors miuix's IconPage: a searchable accordion list; each row shows the
// Regular glyph and expands to compare Light / Normal / Regular / Medium /
// Demibold side by side. One row open at a time.
import { computed, ref } from 'vue'
import { MiuixIcon, MiuixSearchBar, MiuixSmallTitle } from '@/index'
import { allExtendedIcons, ExpandLess, ExpandMore, type MiuixIconWeight } from '@/icons/extended'

const WEIGHTS: MiuixIconWeight[] = ['light', 'normal', 'regular', 'medium', 'demibold']

const query = ref('')
const expandedName = ref<string | null>(null)

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  return q ? allExtendedIcons.filter((i) => i.name.toLowerCase().includes(q)) : allExtendedIcons
})

function toggle(name: string): void {
  expandedName.value = expandedName.value === name ? null : name
}
</script>

<template>
  <div class="page">
    <MiuixSmallTitle :text="`Icon (${allExtendedIcons.length})`" />

    <div class="icon-search">
      <MiuixSearchBar v-model="query" label="Search icons" />
    </div>

    <div v-if="filtered.length" class="icon-list">
      <div class="icon-list__header">
        <span class="icon-list__head-name">Name</span>
        <span class="icon-list__head-hint">Tap to compare weights</span>
      </div>
      <button
        v-for="ic in filtered"
        :key="ic.name"
        type="button"
        class="icon-row"
        :class="{ 'icon-row--expanded': expandedName === ic.name }"
        @click="toggle(ic.name)"
      >
        <span class="icon-row__main">
          <span class="icon-row__name">{{ ic.name }}</span>
          <MiuixIcon :icon="ic" weight="regular" :size="24" />
          <MiuixIcon
            class="icon-row__chevron"
            :icon="expandedName === ic.name ? ExpandLess : ExpandMore"
            :size="18"
            color="var(--m-color-on-surface-variant-actions)"
          />
        </span>
        <span v-if="expandedName === ic.name" class="icon-row__weights">
          <span v-for="w in WEIGHTS" :key="w" class="icon-weight">
            <MiuixIcon :icon="ic" :weight="w" :size="28" />
            <span class="icon-weight__label">{{ w }}</span>
          </span>
        </span>
      </button>
    </div>
    <div v-else class="icon-empty">No icons match “{{ query }}”.</div>
  </div>
</template>

<style lang="scss">
.icon-search {
  padding: 0 0 6px;
}

.icon-list {
  margin: 0 12px 12px;
  border-radius: 16px;
  background: var(--m-color-surface-container);
  overflow: hidden;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px 8px;
  }
  &__head-name {
    font-size: var(--m-text-footnote1-size);
    color: var(--m-color-on-surface-variant-actions);
  }
  &__head-hint {
    font-size: var(--m-text-footnote2-size);
    color: var(--m-color-on-surface-variant-actions);
  }
}

.icon-row {
  display: flex;
  flex-direction: column;
  width: 100%;
  box-sizing: border-box;
  padding: 6px 16px;
  border: 0;
  background: transparent;
  color: var(--m-color-on-surface);
  font-family: inherit;
  text-align: left;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;

  &:active {
    background: var(--m-color-on-background);
  }

  &__main {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__name {
    flex: 1;
    min-width: 0;
    font-size: var(--m-text-body2-size);
  }

  &__weights {
    display: flex;
    align-items: flex-start;
    padding: 10px 0 4px;
  }
}

.icon-weight {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  gap: 4px;

  &__label {
    font-size: var(--m-text-footnote2-size);
    color: var(--m-color-on-surface-variant-actions);
    text-transform: capitalize;
  }
}

.icon-empty {
  padding: 24px 16px;
  text-align: center;
  color: var(--m-color-on-surface-variant-summary);
}
</style>
