<script setup lang="ts">
// TextStylePage — samples of the 14 miuix text styles.
import { MiuixCard, MiuixSmallTitle, MiuixText, type MiuixTextType } from '@/index'

const styles: Array<{ type: MiuixTextType; label: string }> = [
  { type: 'title1', label: 'Title1 · 32' },
  { type: 'title2', label: 'Title2 · 24' },
  { type: 'title3', label: 'Title3 · 20' },
  { type: 'title4', label: 'Title4 · 18' },
  { type: 'main', label: 'Main · 17' },
  { type: 'paragraph', label: 'Paragraph · 17' },
  { type: 'headline1', label: 'Headline1 · 17' },
  { type: 'headline2', label: 'Headline2 · 16' },
  { type: 'body1', label: 'Body1 · 16' },
  { type: 'body2', label: 'Body2 · 14' },
  { type: 'subtitle', label: 'Subtitle · 14 bold' },
  { type: 'footnote1', label: 'Footnote1 · 13' },
  { type: 'footnote2', label: 'Footnote2 · 11' },
]
</script>

<template>
  <div class="page">
    <MiuixSmallTitle text="TextStyle" />
    <MiuixCard class="ts-card">
      <div v-for="s in styles" :key="s.type" class="ts-row">
        <MiuixText :type="s.type">The quick brown fox</MiuixText>
        <MiuixText type="footnote2" color="var(--m-color-on-surface-variant-summary)">{{
          s.label
        }}</MiuixText>
      </div>
    </MiuixCard>
    <div style="height: 24px" />
  </div>
</template>

<style lang="scss">
.ts-card {
  margin: 0 12px 12px;
}
.ts-row {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 12px 16px;

  & + & {
    border-top: 0.75px solid var(--m-color-divider-line);
  }
}
</style>
