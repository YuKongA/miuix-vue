<script setup lang="ts">
// miuix-vue example — mirrors the miuix `example/` MainPage section list.
// Each section is a SmallTitle + Card of rows, inside a Scaffold-like layout
// (Home top bar + scrolling content column).
import { onMounted, onUnmounted, ref } from 'vue'
import {
  MiuixBasicComponent,
  MiuixButton,
  MiuixCard,
  MiuixCheckbox,
  MiuixColorPicker,
  MiuixDialog,
  MiuixDivider,
  MiuixIconButton,
  MiuixInput,
  MiuixNumberPicker,
  MiuixProgressIndicator,
  MiuixRangeSlider,
  MiuixSearchBar,
  MiuixSlider,
  MiuixSmallTitle,
  MiuixSnackbarHost,
  MiuixSuperArrow,
  MiuixSuperCheckbox,
  MiuixSuperDropdown,
  MiuixSuperRadioButton,
  MiuixSuperSpinner,
  MiuixSuperSwitch,
  MiuixSwitch,
  MiuixTabRow,
  MiuixText,
  showSnackbar,
  type MiuixDropdownItem,
  useTheme,
} from '@/index'

const { theme, setTheme } = useTheme()
function toggleTheme(): void {
  setTheme(theme.value === 'light' ? 'dark' : 'light')
}

// SearchBar
const searchQuery = ref('')
const searchExpanded = ref(false)
const searchSuggestions = ['Suggestion 0', 'Suggestion 1', 'Suggestion 2', 'Suggestion 3']
function pickSuggestion(s: string): void {
  searchQuery.value = s
  searchExpanded.value = false
}

// Checkbox
const cbA = ref(false)
const cbB = ref(true)
const cbIndeterminate = ref(true)
const superCbEnd = ref(false)
const superCb = ref(false)

// RadioButton
const radioIndex = ref(0)

// Switch
const swA = ref(false)
const swB = ref(true)
const superSwitchExpand = ref(false)
const superSwitch = ref(false)

// Arrow
const volume = ref(50)
const volumeDialogOpen = ref(false)
const volumeText = ref('50')

// Dialog
const dialogOpen = ref(false)

// Dropdown / Spinner
const dropdownIndex = ref(0)
const dropdownOptions = ['Option 1', 'Option 2', 'Option 3', 'Option 4']
const spinnerIndex = ref(0)
const spinnerOptions: MiuixDropdownItem[] = [
  { text: 'Option 1', summary: 'Red', color: '#FF5B29' },
  { text: 'Option 2', summary: 'Green', color: '#36D167' },
  { text: 'Option 3', summary: 'Blue', color: '#3482FF' },
  { text: 'Option 4', summary: 'Yellow', color: '#FFB21D' },
]

// Button
const cancelText = ref('Cancel')
const submitText = ref('Submit')
let clickCount = 0
let submitCount = 0
function onCancel(): void {
  clickCount += 1
  cancelText.value = `Click: ${clickCount}`
}
function onSubmit(): void {
  submitCount += 1
  submitText.value = `Click: ${submitCount}`
}

// ProgressIndicator
const animatedProgress = ref(0)
const progressValues: Array<number | null> = [0, 0.25, 0.5, 0.75, 1, null]
let rafId = 0
let start = 0
function tick(t: number): void {
  if (!start) start = t
  const phase = ((t - start) % 2000) / 1000
  animatedProgress.value = phase <= 1 ? phase : 2 - phase
  rafId = requestAnimationFrame(tick)
}
onMounted(() => {
  rafId = requestAnimationFrame(tick)
})
onUnmounted(() => cancelAnimationFrame(rafId))

// TextField
const text1 = ref('')
const text2 = ref('')
const text3 = ref('')
const text4 = ref('')

// Slider
const sliderNormal = ref(30)
const sliderSteps = ref(100)
const sliderStepPoints = ref(5)
const sliderCustom = ref(25)
const sliderDisabled = ref(70)
const rangeNormal = ref<[number, number]>([20, 80])
const rangeSteps = ref<[number, number]>([2, 8])
const rangeCustom = ref<[number, number]>([20, 80])
const rangeDisabled = ref<[number, number]>([30, 70])
const vSlider1 = ref(30)
const vSlider2 = ref(5)
const vSlider3 = ref(5)
const vSlider4 = ref(50)
const vSliderDisabled = ref(70)

// TabRow
const tab1 = ref(0)
const tab2 = ref(0)
const tabs1 = ['Tab 1', 'Tab 2', 'Tab 3']
const tabs2 = ['Tab 1', 'Tab 2', 'Tab 3', 'Tab 4', 'Tab 5', 'Tab 6']

// NumberPicker
const hourValue = ref(16)
const minuteValue = ref(30)
const pad2 = (v: number): string => String(v).padStart(2, '0')

// ColorPicker
const pickedColor = ref('#3482ff')

function openVolumeDialog(): void {
  volumeText.value = String(Math.round(volume.value))
  volumeDialogOpen.value = true
}
function confirmVolume(): void {
  const n = Number(volumeText.value)
  if (!Number.isNaN(n)) volume.value = Math.min(100, Math.max(0, n))
  volumeDialogOpen.value = false
}
</script>

<template>
  <div class="app">
    <header class="app__bar">
      <div class="app__bar-inner">
        <MiuixText type="title3" weight="medium">Home</MiuixText>
        <MiuixIconButton aria-label="Toggle theme" @click="toggleTheme">
          <span class="app__theme-glyph">{{ theme === 'light' ? '☾' : '☀' }}</span>
        </MiuixIconButton>
      </div>
    </header>

    <main class="app__scroll">
      <div class="app__content">
        <!-- SearchBar -->
        <MiuixSmallTitle text="SearchBar" />
        <MiuixSearchBar
          v-model="searchQuery"
          v-model:expanded="searchExpanded"
          label="Search"
          class="search-section"
        >
          <MiuixBasicComponent
            v-for="s in searchSuggestions"
            :key="s"
            :title="s"
            clickable
            @click="pickSuggestion(s)"
          />
        </MiuixSearchBar>

        <!-- Basic Component -->
        <MiuixSmallTitle text="Basic Component" />
        <MiuixCard class="section-card">
          <MiuixBasicComponent title="Title" summary="Summary">
            <template #start><MiuixText>Start</MiuixText></template>
            <template #end>
              <MiuixText type="body2" color="var(--m-color-on-surface-variant-actions)"
                >End1</MiuixText
              >
              <span style="width: 8px"></span>
              <MiuixText type="body2" color="var(--m-color-on-surface-variant-actions)"
                >End2</MiuixText
              >
            </template>
          </MiuixBasicComponent>
          <MiuixBasicComponent title="Title" summary="Summary" disabled>
            <template #start>
              <MiuixText color="var(--m-color-disabled-on-secondary-variant)">Start</MiuixText>
            </template>
            <template #end>
              <MiuixText type="body2" color="var(--m-color-disabled-on-secondary-variant)"
                >End1</MiuixText
              >
              <span style="width: 8px"></span>
              <MiuixText type="body2" color="var(--m-color-disabled-on-secondary-variant)"
                >End2</MiuixText
              >
            </template>
          </MiuixBasicComponent>
        </MiuixCard>

        <!-- Checkbox -->
        <MiuixSmallTitle text="Checkbox" />
        <MiuixCard class="section-card">
          <div class="control-row">
            <MiuixCheckbox v-model="cbA" />
            <MiuixCheckbox v-model="cbB" />
            <MiuixCheckbox v-model="cbIndeterminate" indeterminate />
            <MiuixCheckbox :model-value="false" disabled />
            <MiuixCheckbox :model-value="true" disabled />
          </div>
          <MiuixSuperCheckbox v-model="superCbEnd" location="end" title="Checkbox">
            <template #end>
              <MiuixText type="body2" color="var(--m-color-on-surface-variant-actions)">{{
                superCbEnd
              }}</MiuixText>
            </template>
          </MiuixSuperCheckbox>
          <MiuixSuperCheckbox v-model="superCb" title="Checkbox" :summary="`State: ${superCb}`" />
          <MiuixSuperCheckbox :model-value="true" disabled title="Disabled Checkbox" />
        </MiuixCard>

        <!-- RadioButton -->
        <MiuixSmallTitle text="RadioButton" />
        <MiuixCard class="section-card">
          <MiuixSuperRadioButton
            :model-value="radioIndex === 0"
            title="Option A"
            :summary="`Selected: ${radioIndex === 0}`"
            @select="radioIndex = 0"
          />
          <MiuixSuperRadioButton
            :model-value="radioIndex === 1"
            title="Option B"
            :summary="`Selected: ${radioIndex === 1}`"
            @select="radioIndex = 1"
          />
          <MiuixSuperRadioButton
            :model-value="radioIndex === 2"
            title="Option C"
            :summary="`Selected: ${radioIndex === 2}`"
            @select="radioIndex = 2"
          />
          <MiuixSuperRadioButton :model-value="true" disabled title="Disabled RadioButton" />
        </MiuixCard>

        <!-- Switch -->
        <MiuixSmallTitle text="Switch" />
        <MiuixCard class="section-card">
          <div class="control-row control-row--start">
            <MiuixSwitch v-model="swA" />
            <MiuixSwitch v-model="swB" />
            <MiuixSwitch :model-value="false" disabled />
            <MiuixSwitch :model-value="true" disabled />
          </div>
          <MiuixSuperSwitch
            v-model="superSwitchExpand"
            title="Switch"
            summary="Click to expand a Switch"
          />
          <MiuixSuperSwitch v-if="superSwitchExpand" v-model="superSwitch" title="Switch">
            <template #end>
              <MiuixText type="body2" color="var(--m-color-on-surface-variant-actions)">{{
                superSwitch
              }}</MiuixText>
            </template>
          </MiuixSuperSwitch>
          <MiuixSuperSwitch :model-value="true" disabled title="Disabled Switch" />
        </MiuixCard>

        <!-- Arrow -->
        <MiuixSmallTitle text="Arrow" />
        <MiuixCard class="section-card">
          <MiuixSuperArrow title="Arrow" @click="() => {}">
            <template #end>
              <MiuixText type="body2" color="var(--m-color-on-surface-variant-actions)"
                >End</MiuixText
              >
            </template>
          </MiuixSuperArrow>
          <MiuixSuperArrow
            title="Arrow + Slider + Dialog"
            :hold-down="volumeDialogOpen"
            @click="openVolumeDialog"
          >
            <template #end>
              <MiuixText type="body2" color="var(--m-color-on-surface-variant-actions)"
                >{{ Math.round(volume) }}%</MiuixText
              >
            </template>
            <template #bottom>
              <MiuixSlider v-model="volume" />
            </template>
          </MiuixSuperArrow>
          <MiuixSuperArrow title="Disabled Arrow" disabled>
            <template #end>
              <MiuixText type="body2" color="var(--m-color-disabled-on-secondary-variant)"
                >End</MiuixText
              >
            </template>
          </MiuixSuperArrow>
        </MiuixCard>

        <!-- Dialog -->
        <MiuixSmallTitle text="Dialog" />
        <MiuixCard class="section-card section-card--pad">
          <MiuixButton type="primary" @click="dialogOpen = true">Show Dialog</MiuixButton>
        </MiuixCard>

        <!-- Dropdown -->
        <MiuixSmallTitle text="Dropdown" />
        <MiuixCard class="section-card">
          <MiuixSuperDropdown
            v-model="dropdownIndex"
            title="Dropdown"
            :summary="`Selected: ${dropdownOptions[dropdownIndex]}`"
            :items="dropdownOptions"
          />
          <MiuixSuperDropdown
            :model-value="0"
            disabled
            title="Disabled Dropdown"
            :items="['Option 1']"
          />
        </MiuixCard>

        <!-- Spinner -->
        <MiuixSmallTitle text="Spinner" />
        <MiuixCard class="section-card">
          <MiuixSuperSpinner
            v-model="spinnerIndex"
            title="Spinner"
            :summary="spinnerOptions[spinnerIndex]?.summary"
            :items="spinnerOptions"
          />
          <MiuixSuperSpinner
            :model-value="0"
            disabled
            title="Disabled Spinner"
            :items="[{ text: 'Option 5' }]"
          />
        </MiuixCard>

        <!-- Button -->
        <MiuixSmallTitle text="Button" />
        <MiuixCard class="section-card section-card--pad">
          <div class="button-row">
            <MiuixButton class="grow" @click="onCancel">{{ cancelText }}</MiuixButton>
            <MiuixButton class="grow" type="primary" @click="onSubmit">{{
              submitText
            }}</MiuixButton>
          </div>
          <div class="button-row">
            <MiuixButton class="grow" disabled>Disabled</MiuixButton>
            <MiuixButton class="grow" type="primary" disabled>Disabled</MiuixButton>
          </div>
        </MiuixCard>

        <!-- Snackbar -->
        <MiuixSmallTitle text="Snackbar" />
        <MiuixCard class="section-card section-card--pad">
          <div class="button-row">
            <MiuixButton
              class="grow"
              @click="showSnackbar({ message: 'A short snackbar message.' })"
            >
              Show
            </MiuixButton>
            <MiuixButton
              class="grow"
              @click="showSnackbar({ message: 'With an action.', actionLabel: 'Undo' })"
            >
              Action
            </MiuixButton>
            <MiuixButton
              class="grow"
              @click="
                showSnackbar({ message: 'Dismissible.', withDismissAction: true, duration: 'long' })
              "
            >
              Dismiss
            </MiuixButton>
          </div>
        </MiuixCard>

        <!-- ProgressIndicator -->
        <MiuixSmallTitle text="ProgressIndicator" />
        <MiuixCard class="section-card section-card--pad">
          <div class="progress-stack">
            <MiuixProgressIndicator type="linear" :progress="animatedProgress" />
            <MiuixProgressIndicator
              v-for="(p, i) in progressValues"
              :key="i"
              type="linear"
              :progress="p"
            />
          </div>
          <div class="progress-circulars">
            <MiuixProgressIndicator type="circular" :progress="animatedProgress" />
            <MiuixProgressIndicator
              v-for="(p, i) in progressValues"
              :key="i"
              type="circular"
              :progress="p"
            />
            <MiuixProgressIndicator type="infinite" color="var(--m-color-on-background-variant)" />
          </div>
        </MiuixCard>

        <!-- TextField -->
        <MiuixSmallTitle text="TextField" />
        <div class="field-stack">
          <MiuixInput v-model="text1" />
          <MiuixInput v-model="text2" label="With title" />
          <MiuixInput v-model="text3" label="State-based" />
          <MiuixInput
            v-model="text4"
            label="Placeholder & SingleLine"
            use-label-as-placeholder
            single-line
          />
        </div>

        <!-- Slider -->
        <MiuixSmallTitle text="Slider" />
        <MiuixCard class="section-card section-card--pad">
          <div class="slider-stack">
            <MiuixText type="body2">Normal: {{ Math.round(sliderNormal) }}%</MiuixText>
            <MiuixSlider v-model="sliderNormal" />
            <MiuixText type="body2">Steps: {{ Math.round(sliderSteps) }}/200</MiuixText>
            <MiuixSlider v-model="sliderSteps" :max="200" :step="1" />
            <MiuixText type="body2"
              >Steps with Key Points: {{ Math.round(sliderStepPoints) }}/8</MiuixText
            >
            <MiuixSlider v-model="sliderStepPoints" :max="8" :step="1" show-key-points />
            <MiuixText type="body2">Custom Key Points: {{ Math.round(sliderCustom) }}%</MiuixText>
            <MiuixSlider
              v-model="sliderCustom"
              :key-points="[0, 25, 50, 75, 100]"
              show-key-points
            />
            <MiuixText type="body2">Disabled: {{ Math.round(sliderDisabled) }}%</MiuixText>
            <MiuixSlider v-model="sliderDisabled" disabled />
          </div>
        </MiuixCard>

        <!-- RangeSlider -->
        <MiuixSmallTitle text="RangeSlider" />
        <MiuixCard class="section-card section-card--pad">
          <div class="slider-stack">
            <MiuixText type="body2">Range: {{ rangeNormal[0] }}% - {{ rangeNormal[1] }}%</MiuixText>
            <MiuixRangeSlider v-model="rangeNormal" />
            <MiuixText type="body2"
              >With Key Points: {{ rangeSteps[0] }} - {{ rangeSteps[1] }}</MiuixText
            >
            <MiuixRangeSlider v-model="rangeSteps" :max="8" :step="1" show-key-points />
            <MiuixText type="body2"
              >Custom Points: {{ rangeCustom[0] }}% - {{ rangeCustom[1] }}%</MiuixText
            >
            <MiuixRangeSlider
              v-model="rangeCustom"
              :key-points="[0, 20, 40, 60, 80, 100]"
              show-key-points
            />
            <MiuixText type="body2"
              >Disabled: {{ rangeDisabled[0] }}% - {{ rangeDisabled[1] }}%</MiuixText
            >
            <MiuixRangeSlider v-model="rangeDisabled" disabled />
          </div>
        </MiuixCard>

        <!-- VerticalSlider -->
        <MiuixSmallTitle text="VerticalSlider" />
        <MiuixCard class="section-card section-card--pad">
          <div class="vslider-row">
            <div class="vslider">
              <MiuixSlider v-model="vSlider1" orientation="vertical" /><MiuixText type="footnote2"
                >Normal {{ Math.round(vSlider1) }}%</MiuixText
              >
            </div>
            <div class="vslider">
              <MiuixSlider v-model="vSlider2" orientation="vertical" :max="6" :step="1" /><MiuixText
                type="footnote2"
                >Steps {{ Math.round(vSlider2) }}/6</MiuixText
              >
            </div>
            <div class="vslider">
              <MiuixSlider
                v-model="vSlider3"
                orientation="vertical"
                :max="6"
                :step="1"
                show-key-points
              /><MiuixText type="footnote2">Points {{ Math.round(vSlider3) }}/6</MiuixText>
            </div>
            <div class="vslider">
              <MiuixSlider
                v-model="vSlider4"
                orientation="vertical"
                :key-points="[0, 25, 50, 75, 100]"
                show-key-points
              /><MiuixText type="footnote2">Custom {{ Math.round(vSlider4) }}%</MiuixText>
            </div>
            <div class="vslider">
              <MiuixSlider v-model="vSliderDisabled" orientation="vertical" disabled /><MiuixText
                type="footnote2"
                >Disabled {{ Math.round(vSliderDisabled) }}%</MiuixText
              >
            </div>
          </div>
        </MiuixCard>

        <!-- TabRow -->
        <MiuixSmallTitle text="TabRow" />
        <MiuixTabRow v-model="tab1" :tabs="tabs1" class="section-card" />
        <MiuixCard class="section-card section-card--pad">
          <MiuixTabRow v-model="tab2" :tabs="tabs2" contour />
          <div class="tab-content">
            <MiuixText>Content of {{ tabs2[tab2] }}</MiuixText>
          </div>
        </MiuixCard>

        <!-- NumberPicker -->
        <MiuixSmallTitle text="NumberPicker" />
        <MiuixCard class="section-card section-card--pad">
          <div class="number-picker-row">
            <MiuixNumberPicker
              v-model="hourValue"
              :min="0"
              :max="23"
              :label="pad2"
              wrap-around
              class="grow"
            />
            <MiuixText :size="20" weight="bold">:</MiuixText>
            <MiuixNumberPicker
              v-model="minuteValue"
              :min="0"
              :max="59"
              :label="pad2"
              wrap-around
              class="grow"
            />
          </div>
        </MiuixCard>

        <!-- ColorPicker -->
        <MiuixSmallTitle text="ColorPicker" />
        <MiuixCard class="section-card section-card--pad">
          <MiuixColorPicker v-model="pickedColor" />
          <MiuixText
            type="body2"
            color="var(--m-color-on-surface-variant-summary)"
            style="margin-top: 12px; display: block"
          >
            {{ pickedColor }}
          </MiuixText>
        </MiuixCard>

        <!-- Card -->
        <MiuixSmallTitle text="Card" />
        <MiuixCard
          class="section-card section-card--pad"
          style="background: var(--m-color-primary-variant)"
        >
          <MiuixText :size="19" weight="semibold" color="var(--m-color-on-primary-variant)"
            >Card</MiuixText
          >
          <MiuixText :size="17" color="var(--m-color-on-primary-variant)"
            >ShowIndication: true</MiuixText
          >
        </MiuixCard>
        <div class="card-row">
          <MiuixCard press-feedback="sink" class="section-card section-card--pad grow">
            <MiuixText :size="18" weight="medium">Card</MiuixText>
            <MiuixText type="paragraph" color="var(--m-color-on-surface-variant-summary)"
              >PressFeedback Type: Sink</MiuixText
            >
          </MiuixCard>
          <MiuixCard press-feedback="tilt" class="section-card section-card--pad grow">
            <MiuixText :size="18" weight="medium">Card</MiuixText>
            <MiuixText type="paragraph" color="var(--m-color-on-surface-variant-summary)"
              >PressFeedback Type: Tilt</MiuixText
            >
          </MiuixCard>
        </div>

        <MiuixDivider />
        <div class="footer">
          <MiuixText type="footnote1" color="var(--m-color-on-surface-variant-summary)"
            >miuix-vue · Vue 3 port of miuix</MiuixText
          >
        </div>
      </div>
    </main>

    <MiuixSnackbarHost />

    <MiuixDialog v-model="dialogOpen" title="Dialog" summary="This is a dialog summary text.">
      <template #default="{ close }">
        <div class="dialog-actions">
          <MiuixButton class="grow" @click="close">Cancel</MiuixButton>
          <MiuixButton class="grow" type="primary" @click="close">Confirm</MiuixButton>
        </div>
      </template>
    </MiuixDialog>

    <MiuixDialog v-model="volumeDialogOpen" title="Adjust Volume" summary="Enter 0-100">
      <template #default="{ close }">
        <MiuixInput v-model="volumeText" single-line style="margin-bottom: 16px" />
        <div class="dialog-actions">
          <MiuixButton class="grow" @click="close">Cancel</MiuixButton>
          <MiuixButton class="grow" type="primary" @click="confirmVolume">Confirm</MiuixButton>
        </div>
      </template>
    </MiuixDialog>
  </div>
</template>

<style lang="scss">
html,
body {
  margin: 0;
  height: 100%;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  background: var(--m-color-background);
  color: var(--m-color-on-background);
}

.app {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: var(--m-color-background);

  &__bar {
    flex: none;
    position: sticky;
    top: 0;
    z-index: 10;
    background: var(--m-color-surface);
  }

  &__bar-inner {
    max-width: 640px;
    margin: 0 auto;
    height: 56px;
    padding: 0 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__theme-glyph {
    font-size: 20px;
    line-height: 1;
  }

  &__scroll {
    flex: 1;
    overflow-y: auto;
    background: var(--m-color-surface);
  }

  &__content {
    max-width: 640px;
    margin: 0 auto;
    padding: 8px 0 32px;
  }
}

.search-section {
  margin-bottom: 12px;
}

.section-card {
  margin: 0 12px 12px;

  &--pad {
    padding: 16px;
  }
}

.control-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px;
  justify-content: space-between;

  &--start {
    justify-content: flex-start;
    gap: 6px;
  }
}

.button-row {
  display: flex;
  gap: 12px;

  & + & {
    margin-top: 12px;
  }
}

.grow {
  flex: 1;
}

.progress-stack {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 0 3px;
}

.progress-circulars {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
  justify-content: space-evenly;
  margin-top: 16px;
}

.field-stack {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 0 12px 12px;
}

.slider-stack {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.vslider-row {
  display: flex;
  justify-content: space-evenly;
  gap: 8px;
}

.vslider {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  height: 160px;

  .m-slider--vertical {
    width: 25px;
    flex: 1;
  }
}

.tab-content {
  margin-top: 12px;
}

.number-picker-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.card-row {
  display: flex;
  gap: 12px;
  margin: 0 12px 12px;

  .section-card {
    margin: 0;
  }
}

.dialog-actions {
  display: flex;
  gap: 12px;
}
</style>
