<script setup lang="ts">
import { ref } from 'vue'
import {
  MiuixButton,
  MiuixCard,
  MiuixDialog,
  MiuixInput,
  MiuixSlider,
  MiuixSwitch,
  useTheme,
} from '@/index'

const inputValue = ref('')
const switchA = ref(false)
const switchB = ref(true)
const sliderValue = ref(35)
const sliderStepped = ref(20)
const dialogOpen = ref(false)

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
      <h2>Slider</h2>
      <div class="stack">
        <div class="slider-row">
          <MiuixSlider v-model="sliderValue" />
          <span class="echo">value: {{ Math.round(sliderValue) }}</span>
        </div>
        <div class="slider-row">
          <MiuixSlider v-model="sliderStepped" :step="10" />
          <span class="echo">stepped (step=10): {{ sliderStepped }}</span>
        </div>
        <div class="slider-row">
          <MiuixSlider v-model="sliderValue" disabled />
          <span class="echo">disabled</span>
        </div>
      </div>
    </section>

    <section class="playground__section">
      <h2>Switch</h2>
      <div class="row row--align">
        <label class="switch-row">
          <MiuixSwitch v-model="switchA" />
          <span>off → on (drag past 50% or click)</span>
        </label>
        <label class="switch-row">
          <MiuixSwitch v-model="switchB" />
          <span>currently {{ switchB ? 'on' : 'off' }}</span>
        </label>
        <label class="switch-row">
          <MiuixSwitch v-model="switchA" disabled />
          <span>disabled</span>
        </label>
      </div>
    </section>

    <section class="playground__section">
      <h2>Input</h2>
      <div class="row">
        <MiuixInput v-model="inputValue" placeholder="Type something..." />
        <MiuixInput v-model="inputValue" placeholder="Read only" readonly />
        <MiuixInput v-model="inputValue" placeholder="Disabled" disabled />
      </div>
      <p class="echo">value: {{ inputValue || '(empty)' }}</p>
    </section>

    <section class="playground__section">
      <h2>Dialog</h2>
      <div class="row">
        <MiuixButton type="primary" @click="dialogOpen = true">Open dialog</MiuixButton>
      </div>
      <MiuixDialog v-model="dialogOpen" title="Demo dialog">
        <p>
          spring enter via folmeSpringByResponse(0.9, 0.3) (≈ stiffness 4376), dim with
          DecelerateEasing(1.5) over 300ms. Click outside or "Cancel" to dismiss.
        </p>
        <template #footer="{ close }">
          <MiuixButton @click="close">Cancel</MiuixButton>
          <MiuixButton type="primary" @click="close">OK</MiuixButton>
        </template>
      </MiuixDialog>
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
  background: var(--m-color-surface);
  color: var(--m-color-on-surface);
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

.stack {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.slider-row {
  display: grid;
  grid-template-columns: 1fr 160px;
  align-items: center;
  gap: 16px;
}

.row--align {
  align-items: center;
}

.switch-row {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  font-size: var(--m-text-body1-size);
}

.echo {
  margin: 12px 0 0;
  font-size: var(--m-text-footnote1-size);
  color: var(--m-color-on-surface-variant-summary);
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
