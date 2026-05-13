<script setup lang="ts">
import { MiuixButton, MiuixCard, useTheme } from '@/index'

const { theme, setTheme } = useTheme()

function toggleTheme(): void {
  setTheme(theme.value === 'light' ? 'dark' : 'light')
}
</script>

<template>
  <main class="playground">
    <header class="playground__header">
      <h1>miuix-vue playground</h1>
      <MiuixButton type="primary" @click="toggleTheme"> Theme: {{ theme }} </MiuixButton>
    </header>

    <section class="playground__section">
      <h2>Button</h2>
      <div class="row">
        <MiuixButton>Default</MiuixButton>
        <MiuixButton type="primary">Primary</MiuixButton>
        <MiuixButton disabled>Disabled</MiuixButton>
        <MiuixButton type="primary" disabled>Primary disabled</MiuixButton>
      </div>
    </section>

    <section class="playground__section">
      <h2>Card</h2>
      <div class="row">
        <MiuixCard class="demo-card">
          <p>Static card (no press feedback).</p>
        </MiuixCard>
        <MiuixCard press-feedback="sink" class="demo-card">
          <p>Press me — sinks to 0.94 with folmeSpring(0.8, 600).</p>
        </MiuixCard>
        <MiuixCard press-feedback="tilt" class="demo-card">
          <p>Press a corner — tilts ±8° with folmeSpring(0.6, 400).</p>
        </MiuixCard>
      </div>
    </section>
  </main>
</template>

<style lang="scss">
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  background: var(--m-color-background);
  color: var(--m-color-on-background);
}

.playground {
  max-width: 960px;
  margin: 0 auto;
  padding: 32px 24px 64px;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 32px;
  }

  &__section {
    margin-top: 32px;
  }
}

.row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

h1 {
  margin: 0;
  font-size: var(--m-text-title2-size);
}

h2 {
  font-size: var(--m-text-title4-size);
  margin: 0 0 16px;
}

.demo-card {
  width: 220px;

  .m-card {
    padding: 16px;
  }

  p {
    margin: 0;
    font-size: var(--m-text-body1-size);
  }
}
</style>
