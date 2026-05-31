<script setup lang="ts">
// TextStylePage — mirrors the miuix example's TextStylePage.kt. Each of the 14
// text styles is sampled in three scripts (Chinese / English / digits+symbols),
// with a name + size header, grouped into Title / Headline / Body / Footnote
// cards plus an "All Styles Overview".
import { MiuixCard, MiuixSmallTitle, MiuixText, type MiuixTextType } from '@/index'

interface Entry {
  type: MiuixTextType
  name: string
  desc: string
}

// Order + descriptions copied from TextStylePage.kt's styleEntries.
const entries: Entry[] = [
  { type: 'title1', name: 'title1', desc: '32sp' },
  { type: 'title2', name: 'title2', desc: '24sp' },
  { type: 'title3', name: 'title3', desc: '20sp' },
  { type: 'title4', name: 'title4', desc: '18sp' },
  { type: 'headline1', name: 'headline1', desc: '17sp' },
  { type: 'headline2', name: 'headline2', desc: '16sp' },
  { type: 'subtitle', name: 'subtitle', desc: '14sp / Bold' },
  { type: 'main', name: 'main', desc: '17sp' },
  { type: 'paragraph', name: 'paragraph', desc: '17sp / lineHeight 1.2em' },
  { type: 'body1', name: 'body1', desc: '16sp' },
  { type: 'body2', name: 'body2', desc: '14sp' },
  { type: 'button', name: 'button', desc: '17sp' },
  { type: 'footnote1', name: 'footnote1', desc: '13sp' },
  { type: 'footnote2', name: 'footnote2', desc: '11sp' },
]

const groups: Array<{ title: string; items: Entry[] }> = [
  { title: 'Title Styles', items: entries.slice(0, 4) },
  { title: 'Headline Styles', items: entries.slice(4, 6) },
  { title: 'Body Styles', items: entries.slice(6, 12) },
  { title: 'Footnote Styles', items: entries.slice(12, 14) },
  { title: 'All Styles Overview', items: entries },
]

// SAMPLE_TEXT_CN / EN / NUM from TextStylePage.kt.
const SAMPLE_CN = '天地玄黄 宇宙洪荒'
const SAMPLE_EN = 'The Quick Brown Fox Jumps'
const SAMPLE_NUM = '0123456789 !@#$%&'
</script>

<template>
  <div class="page">
    <template v-for="g in groups" :key="g.title">
      <MiuixSmallTitle :text="g.title" />
      <MiuixCard class="ts-card">
        <div
          v-for="(s, i) in g.items"
          :key="s.name"
          class="ts-item"
          :class="{ 'ts-item--divided': i > 0 }"
        >
          <div class="ts-item__head">
            <MiuixText type="footnote1" color="var(--m-color-on-surface)">{{ s.name }}</MiuixText>
            <MiuixText type="footnote2" color="var(--m-color-on-surface-variant-summary)">{{
              s.desc
            }}</MiuixText>
          </div>
          <MiuixText :type="s.type" class="ts-item__sample" color="var(--m-color-on-surface)">{{
            SAMPLE_CN
          }}</MiuixText>
          <MiuixText :type="s.type" class="ts-item__sample" color="var(--m-color-on-surface)">{{
            SAMPLE_EN
          }}</MiuixText>
          <MiuixText
            :type="s.type"
            class="ts-item__sample"
            color="var(--m-color-on-surface-variant-summary)"
            >{{ SAMPLE_NUM }}</MiuixText
          >
        </div>
      </MiuixCard>
    </template>
  </div>
</template>

<style lang="scss">
.ts-card {
  margin: 0 12px 12px;
  // insideMargin = PaddingValues(horizontal = 16.dp); items + dividers inset 16px.
  .m-card {
    padding: 0 16px;
  }
}

.ts-item {
  display: flex;
  flex-direction: column;
  // TextStyleItem: Column padding(vertical = 10.dp).
  padding: 10px 0;

  // HorizontalDivider between items (vertical padding 2dp in source).
  &--divided {
    border-top: 0.75px solid var(--m-color-divider-line);
  }

  &__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    // Spacer(8.dp) between the header row and the first sample.
    margin-bottom: 8px;
  }

  // Spacer(2.dp) between consecutive sample lines.
  &__sample + &__sample {
    margin-top: 2px;
  }
}
</style>
