<script setup lang="ts">
// MainPage — 1:1 with miuix example MainPage section list + per-section padding.
import { onMounted, onUnmounted, ref } from 'vue'
import { AnimatePresence, Motion } from 'motion-v'
import {
  MiuixArrowPreference,
  MiuixBasicComponent,
  MiuixBottomSheet,
  MiuixButton,
  MiuixCard,
  MiuixCheckbox,
  MiuixCheckboxPreference,
  MiuixColorPicker,
  MiuixDialog,
  MiuixDropdownPreference,
  MiuixInput,
  MiuixNumberPicker,
  MiuixProgressIndicator,
  MiuixRadioButtonPreference,
  MiuixRangeSlider,
  MiuixSearchBar,
  MiuixSlider,
  MiuixSmallTitle,
  MiuixSpinnerPreference,
  MiuixSwitch,
  MiuixSwitchPreference,
  MiuixTabRow,
  MiuixText,
  dismissNewestSnackbar,
  dismissOldestSnackbar,
  showSnackbar,
  type MiuixDropdownItem,
} from '@/index'

// SearchBar
const searchQuery = ref('')
const searchExpanded = ref(false)
const searchSuggestions = ['Suggestion 0', 'Suggestion 1', 'Suggestion 2', 'Suggestion 3']

// Checkbox
const cbA = ref(false)
const cbB = ref(true)
type Tri = 'off' | 'indeterminate' | 'on'
const cbTri = ref<Tri>('indeterminate')
function cycleTri(): void {
  cbTri.value =
    cbTri.value === 'off' ? 'indeterminate' : cbTri.value === 'indeterminate' ? 'on' : 'off'
}
const cbPrefEnd = ref(false)
const cbPref = ref(false)

// RadioButton
const radioIndex = ref(0)

// Switch
const swA = ref(false)
const swB = ref(true)
const swPrefExpand = ref(false)
const swPref = ref(false)
// AnimatedVisibility default size spring: spring(StiffnessMediumLow=400, ratio 1).
const expandSpring = { type: 'spring' as const, stiffness: 400, damping: 40 }

// Arrow
const volume = ref(50)
const volumeDialogOpen = ref(false)
const volumeText = ref('50')
function openVolumeDialog(): void {
  volumeText.value = String(Math.round(volume.value))
  volumeDialogOpen.value = true
}
function confirmVolume(): void {
  const n = Number(volumeText.value)
  if (!Number.isNaN(n)) volume.value = Math.min(100, Math.max(0, n))
  volumeDialogOpen.value = false
}

// Dialog
const dialogOpen = ref(false)
// Card long-press demo: open a dialog and keep the card held-down while it shows.
const cardDialogOpen = ref(false)
const cardHoldDown = ref(false)
function onCardLongPress(): void {
  cardDialogOpen.value = true
  cardHoldDown.value = true
}
function onCardDialogClose(): void {
  cardHoldDown.value = false
}

// BottomSheet
const bottomSheetOpen = ref(false)
const bottomSheetSwitch = ref(true)
const bottomSheetSlider = ref(50)

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
const clickCount = ref(0)
const submitCount = ref(0)
function onCancelClick(): void {
  clickCount.value += 1
  cancelText.value = `Click: ${clickCount.value}`
}
function onSubmitClick(): void {
  submitCount.value += 1
  submitText.value = `Click: ${submitCount.value}`
}

// Snackbar
const actionText = ref('Action')
async function snackbarAction(): Promise<void> {
  actionText.value = 'Action: Alive'
  const result = await showSnackbar({ message: 'This message has an action', actionLabel: 'Undo' })
  actionText.value = result === 'action' ? 'Action: Undo' : 'Action: Expired'
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
onMounted(() => (rafId = requestAnimationFrame(tick)))
onUnmounted(() => cancelAnimationFrame(rafId))

// TextField
const text1 = ref('')
const text2 = ref('')
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
const pickedColor = ref('rgb(52, 130, 255)')
</script>

<template>
  <div class="page">
    <!-- SearchBar -->
    <MiuixSmallTitle text="SearchBar" />
    <MiuixSearchBar
      v-model="searchQuery"
      v-model:expanded="searchExpanded"
      label="Search"
      class="ex-mb12"
    >
      <MiuixBasicComponent
        v-for="s in searchSuggestions"
        :key="s"
        :title="s"
        clickable
        @click="((searchQuery = s), (searchExpanded = false))"
      />
    </MiuixSearchBar>

    <!-- Basic Component -->
    <MiuixSmallTitle text="Basic Component" />
    <MiuixCard class="ex-card">
      <MiuixBasicComponent title="Title" summary="Summary">
        <template #start><MiuixText>Start</MiuixText></template>
        <template #end>
          <MiuixText type="body2" color="var(--m-color-on-surface-variant-actions)">End1</MiuixText>
          <span class="ex-gap8" />
          <MiuixText type="body2" color="var(--m-color-on-surface-variant-actions)">End2</MiuixText>
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
          <span class="ex-gap8" />
          <MiuixText type="body2" color="var(--m-color-disabled-on-secondary-variant)"
            >End2</MiuixText
          >
        </template>
      </MiuixBasicComponent>
    </MiuixCard>

    <!-- Checkbox -->
    <MiuixSmallTitle text="Checkbox" />
    <MiuixCard class="ex-card">
      <div class="ex-control-row ex-control-row--between">
        <MiuixCheckbox v-model="cbA" />
        <MiuixCheckbox v-model="cbB" />
        <MiuixCheckbox
          :model-value="cbTri === 'on'"
          :indeterminate="cbTri === 'indeterminate'"
          @click="cycleTri"
        />
        <MiuixCheckbox :model-value="false" disabled />
        <MiuixCheckbox :model-value="true" disabled />
        <MiuixCheckbox :model-value="false" indeterminate disabled />
      </div>
      <MiuixCheckboxPreference v-model="cbPrefEnd" location="end" title="Checkbox">
        <template #end>
          <MiuixText type="body2" color="var(--m-color-on-surface-variant-actions)">{{
            cbPrefEnd
          }}</MiuixText>
        </template>
      </MiuixCheckboxPreference>
      <MiuixCheckboxPreference v-model="cbPref" title="Checkbox" :summary="`State: ${cbPref}`" />
      <MiuixCheckboxPreference :model-value="true" disabled title="Disabled Checkbox" />
    </MiuixCard>

    <!-- RadioButton -->
    <MiuixSmallTitle text="RadioButton" />
    <MiuixCard class="ex-card">
      <MiuixRadioButtonPreference
        :model-value="radioIndex === 0"
        title="Option A"
        :summary="`Selected: ${radioIndex === 0}`"
        @select="radioIndex = 0"
      />
      <MiuixRadioButtonPreference
        :model-value="radioIndex === 1"
        title="Option B"
        :summary="`Selected: ${radioIndex === 1}`"
        @select="radioIndex = 1"
      />
      <MiuixRadioButtonPreference
        :model-value="radioIndex === 2"
        title="Option C"
        :summary="`Selected: ${radioIndex === 2}`"
        @select="radioIndex = 2"
      />
      <MiuixRadioButtonPreference :model-value="true" disabled title="Disabled RadioButton" />
    </MiuixCard>

    <!-- Switch -->
    <MiuixSmallTitle text="Switch" />
    <MiuixCard class="ex-card">
      <div class="ex-control-row ex-control-row--between">
        <MiuixSwitch v-model="swA" />
        <MiuixSwitch v-model="swB" />
        <MiuixSwitch :model-value="false" disabled />
        <MiuixSwitch :model-value="true" disabled />
      </div>
      <MiuixSwitchPreference
        v-model="swPrefExpand"
        title="Switch"
        summary="Click to expand a Switch"
      />
      <AnimatePresence :initial="false">
        <Motion
          v-if="swPrefExpand"
          class="ex-expand"
          :initial="{ height: 0, opacity: 0 }"
          :animate="{ height: 'auto', opacity: 1 }"
          :exit="{ height: 0, opacity: 0 }"
          :transition="expandSpring"
        >
          <MiuixSwitchPreference v-model="swPref" title="Switch">
            <template #end>
              <MiuixText type="body2" color="var(--m-color-on-surface-variant-actions)">{{
                swPref
              }}</MiuixText>
            </template>
          </MiuixSwitchPreference>
        </Motion>
      </AnimatePresence>
      <MiuixSwitchPreference :model-value="true" disabled title="Disabled Switch" />
    </MiuixCard>

    <!-- Arrow -->
    <MiuixSmallTitle text="Arrow" />
    <MiuixCard class="ex-card">
      <MiuixArrowPreference title="Arrow" @click="() => {}">
        <template #end>
          <MiuixText type="body2" color="var(--m-color-on-surface-variant-actions)">End</MiuixText>
        </template>
      </MiuixArrowPreference>
      <MiuixArrowPreference
        title="Arrow + Slider + Dialog"
        :hold-down="volumeDialogOpen"
        @click="openVolumeDialog"
      >
        <template #end>
          <MiuixText type="body2" color="var(--m-color-on-surface-variant-actions)"
            >{{ Math.round(volume) }}%</MiuixText
          >
        </template>
        <template #bottom><MiuixSlider v-model="volume" /></template>
      </MiuixArrowPreference>
      <MiuixArrowPreference title="Disabled Arrow" disabled>
        <template #end>
          <MiuixText type="body2" color="var(--m-color-disabled-on-secondary-variant)"
            >End</MiuixText
          >
        </template>
      </MiuixArrowPreference>
    </MiuixCard>

    <!-- Dialog -->
    <MiuixSmallTitle text="Dialog" />
    <MiuixCard class="ex-card">
      <MiuixArrowPreference
        title="Dialog"
        summary="Click to show a Dialog"
        :hold-down="dialogOpen"
        @click="dialogOpen = true"
      />
    </MiuixCard>

    <!-- BottomSheet -->
    <MiuixSmallTitle text="BottomSheet" />
    <MiuixCard class="ex-card">
      <MiuixArrowPreference
        title="BottomSheet"
        summary="Click to show a BottomSheet"
        :hold-down="bottomSheetOpen"
        @click="bottomSheetOpen = true"
      />
    </MiuixCard>

    <!-- Dropdown -->
    <MiuixSmallTitle text="Dropdown" />
    <MiuixCard class="ex-card">
      <MiuixDropdownPreference
        v-model="dropdownIndex"
        title="Dropdown"
        :summary="`Selected: ${dropdownOptions[dropdownIndex]}`"
        :items="dropdownOptions"
      />
      <MiuixDropdownPreference
        :model-value="0"
        disabled
        title="Disabled Dropdown"
        :items="['Option 1']"
      />
    </MiuixCard>

    <!-- Spinner -->
    <MiuixSmallTitle text="Spinner" />
    <MiuixCard class="ex-card">
      <MiuixSpinnerPreference
        v-model="spinnerIndex"
        title="Spinner"
        :summary="spinnerOptions[spinnerIndex]?.summary"
        :items="spinnerOptions"
      />
      <MiuixSpinnerPreference
        :model-value="0"
        disabled
        title="Disabled Spinner"
        :items="[{ text: 'Option 5' }]"
      />
    </MiuixCard>

    <!-- Button (no card) -->
    <MiuixSmallTitle text="Button" />
    <div class="ex-block">
      <div class="ex-btn-row">
        <MiuixButton class="ex-grow" @click="onCancelClick">{{ cancelText }}</MiuixButton>
        <MiuixButton class="ex-grow" type="primary" @click="onSubmitClick">{{
          submitText
        }}</MiuixButton>
      </div>
      <div class="ex-btn-row">
        <MiuixButton class="ex-grow" disabled>Disabled</MiuixButton>
        <MiuixButton class="ex-grow" type="primary" disabled>Disabled</MiuixButton>
      </div>
    </div>

    <!-- Snackbar -->
    <MiuixSmallTitle text="Snackbar" />
    <MiuixCard class="ex-card">
      <div class="ex-snackbar-col">
        <div class="ex-btn-row">
          <MiuixButton class="ex-grow" @click="dismissOldestSnackbar()">Dismiss oldest</MiuixButton>
          <MiuixButton class="ex-grow" @click="dismissNewestSnackbar()">Dismiss newest</MiuixButton>
        </div>
        <div class="ex-btn-row">
          <MiuixButton class="ex-grow" @click="showSnackbar({ message: 'This is a short message' })"
            >Short (4s)</MiuixButton
          >
          <MiuixButton
            class="ex-grow"
            @click="
              showSnackbar({
                message: 'This is a long message to display more text content',
                duration: 'long',
              })
            "
            >Long (10s)</MiuixButton
          >
        </div>
        <div class="ex-btn-row">
          <MiuixButton
            class="ex-grow"
            @click="
              showSnackbar({ message: 'This message will last for 2 seconds', duration: 2000 })
            "
            >Custom (2s)</MiuixButton
          >
          <MiuixButton class="ex-grow" type="primary" @click="snackbarAction()">{{
            actionText
          }}</MiuixButton>
        </div>
        <div class="ex-btn-row">
          <MiuixButton
            class="ex-grow"
            @click="
              showSnackbar({
                message: 'This message can be removed via the close button',
                withDismissAction: true,
                duration: 'long',
              })
            "
            >Dismissible</MiuixButton
          >
          <MiuixButton
            class="ex-grow"
            @click="
              showSnackbar({
                message: 'Indefinite message, dismiss manually',
                withDismissAction: true,
                duration: 'indefinite',
              })
            "
            >Indefinite</MiuixButton
          >
        </div>
      </div>
    </MiuixCard>

    <!-- ProgressIndicator (no card) -->
    <MiuixSmallTitle text="ProgressIndicator" />
    <div class="ex-progress-linear">
      <MiuixProgressIndicator type="linear" :progress="animatedProgress" />
      <MiuixProgressIndicator
        v-for="(p, i) in progressValues"
        :key="i"
        type="linear"
        :progress="p"
      />
    </div>
    <div class="ex-progress-circular">
      <MiuixProgressIndicator type="circular" :progress="animatedProgress" />
      <MiuixProgressIndicator
        v-for="(p, i) in progressValues"
        :key="i"
        type="circular"
        :progress="p"
      />
      <MiuixProgressIndicator type="infinite" color="var(--m-color-on-background-variant)" />
    </div>

    <!-- TextField (no card) -->
    <MiuixSmallTitle text="TextField" />
    <div class="ex-field-stack">
      <MiuixInput v-model="text1" />
      <MiuixInput v-model="text2" label="With title" />
      <MiuixInput
        v-model="text4"
        label="Placeholder & SingleLine"
        use-label-as-placeholder
        single-line
      />
    </div>

    <!-- Slider -->
    <MiuixSmallTitle text="Slider" />
    <MiuixCard class="ex-card">
      <div class="ex-slider-stack">
        <MiuixText type="body2">Normal: {{ Math.round(sliderNormal) }}%</MiuixText>
        <MiuixSlider v-model="sliderNormal" />
        <MiuixText type="body2">Steps: {{ Math.round(sliderSteps) }}/200</MiuixText>
        <MiuixSlider v-model="sliderSteps" :max="200" :step="1" />
        <MiuixText type="body2"
          >Steps with Key Points: {{ Math.round(sliderStepPoints) }}/8</MiuixText
        >
        <MiuixSlider v-model="sliderStepPoints" :max="8" :step="1" show-key-points />
        <MiuixText type="body2">Custom Key Points: {{ Math.round(sliderCustom) }}%</MiuixText>
        <MiuixSlider v-model="sliderCustom" :key-points="[0, 25, 50, 75, 100]" show-key-points />
        <MiuixText type="body2">Disabled: {{ Math.round(sliderDisabled) }}%</MiuixText>
        <MiuixSlider v-model="sliderDisabled" disabled />
      </div>
    </MiuixCard>

    <!-- RangeSlider -->
    <MiuixSmallTitle text="RangeSlider" />
    <MiuixCard class="ex-card">
      <div class="ex-slider-stack">
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
    <MiuixCard class="ex-card">
      <div class="ex-vslider-row">
        <div class="ex-vslider">
          <MiuixSlider v-model="vSlider1" orientation="vertical" /><MiuixText type="footnote2"
            >Normal {{ Math.round(vSlider1) }}%</MiuixText
          >
        </div>
        <div class="ex-vslider">
          <MiuixSlider v-model="vSlider2" orientation="vertical" :max="6" :step="1" /><MiuixText
            type="footnote2"
            >Steps {{ Math.round(vSlider2) }}/6</MiuixText
          >
        </div>
        <div class="ex-vslider">
          <MiuixSlider
            v-model="vSlider3"
            orientation="vertical"
            :max="6"
            :step="1"
            show-key-points
          /><MiuixText type="footnote2">Points {{ Math.round(vSlider3) }}/6</MiuixText>
        </div>
        <div class="ex-vslider">
          <MiuixSlider
            v-model="vSlider4"
            orientation="vertical"
            :key-points="[0, 25, 50, 75, 100]"
            show-key-points
          /><MiuixText type="footnote2">Custom {{ Math.round(vSlider4) }}%</MiuixText>
        </div>
        <div class="ex-vslider">
          <MiuixSlider v-model="vSliderDisabled" orientation="vertical" disabled /><MiuixText
            type="footnote2"
            >Disabled {{ Math.round(vSliderDisabled) }}%</MiuixText
          >
        </div>
      </div>
    </MiuixCard>

    <!-- TabRow -->
    <MiuixSmallTitle text="TabRow" />
    <div class="ex-block"><MiuixTabRow v-model="tab1" :tabs="tabs1" /></div>
    <MiuixCard class="ex-card ex-card--pad">
      <MiuixTabRow v-model="tab2" :tabs="tabs2" contour />
      <div class="ex-tab-content">
        <MiuixText>Content of {{ tabs2[tab2] }}</MiuixText>
      </div>
    </MiuixCard>

    <!-- NumberPicker -->
    <MiuixSmallTitle text="NumberPicker" />
    <MiuixCard class="ex-card">
      <div class="ex-number-row">
        <MiuixNumberPicker
          v-model="hourValue"
          :min="0"
          :max="23"
          :label="pad2"
          wrap-around
          class="ex-grow"
        />
        <MiuixText :size="20" weight="bold">:</MiuixText>
        <MiuixNumberPicker
          v-model="minuteValue"
          :min="0"
          :max="59"
          :label="pad2"
          wrap-around
          class="ex-grow"
        />
      </div>
    </MiuixCard>

    <!-- ColorPicker -->
    <MiuixSmallTitle text="ColorPicker (HSV)" />
    <MiuixCard class="ex-card ex-card--pad">
      <MiuixText type="body1" class="ex-mb12 ex-block-text">{{ pickedColor }}</MiuixText>
      <MiuixColorPicker v-model="pickedColor" :show-preview="false" />
    </MiuixCard>

    <!-- Card -->
    <MiuixSmallTitle text="Card" />
    <MiuixCard
      show-indication
      class="ex-card ex-card--pad"
      style="--m-card-color: var(--m-color-primary-variant)"
    >
      <MiuixText :size="19" weight="semibold" color="var(--m-color-on-primary-variant)"
        >Card</MiuixText
      >
      <MiuixText :size="17" color="var(--m-color-on-primary-variant)"
        >ShowIndication: true</MiuixText
      >
    </MiuixCard>
    <div class="ex-card-row">
      <MiuixCard press-feedback="sink" class="ex-card--pad ex-grow">
        <MiuixText :size="18" weight="medium">Card</MiuixText>
        <MiuixText type="paragraph" color="var(--m-color-on-surface-variant-summary)"
          >PressFeedback<br />Type: Sink</MiuixText
        >
      </MiuixCard>
      <MiuixCard press-feedback="tilt" class="ex-card--pad ex-grow">
        <MiuixText :size="18" weight="medium">Card</MiuixText>
        <MiuixText type="paragraph" color="var(--m-color-on-surface-variant-summary)"
          >PressFeedback<br />Type: Tilt</MiuixText
        >
      </MiuixCard>
    </div>
    <MiuixCard
      press-feedback="sink"
      show-indication
      :hold-down="cardHoldDown"
      class="ex-card ex-card--pad"
      @long-press="onCardLongPress"
    >
      <MiuixText :size="18" weight="medium">Card</MiuixText>
      <MiuixText type="paragraph" color="var(--m-color-on-surface-variant-summary)"
        >Long press to show dialog</MiuixText
      >
    </MiuixCard>

    <div class="ex-spacer" />

    <!-- Overlays -->
    <MiuixDialog
      v-model="dialogOpen"
      title="Dialog"
      summary="A dialog component inside MiuixPopupHost."
    >
      <template #default="{ close }">
        <div class="ex-dialog-actions">
          <MiuixButton class="ex-grow" @click="close">Cancel</MiuixButton>
          <MiuixButton class="ex-grow" type="primary" @click="close">Confirm</MiuixButton>
        </div>
      </template>
    </MiuixDialog>

    <MiuixDialog
      v-model="cardDialogOpen"
      title="Long Press Action"
      summary="Triggered by long pressing the card."
      @close="onCardDialogClose"
    >
      <template #default="{ close }">
        <div class="ex-dialog-actions">
          <MiuixButton class="ex-grow" @click="close">Cancel</MiuixButton>
          <MiuixButton class="ex-grow" type="primary" @click="close">Confirm</MiuixButton>
        </div>
      </template>
    </MiuixDialog>

    <MiuixDialog v-model="volumeDialogOpen" title="Adjust Volume" summary="Enter 0-100">
      <template #default="{ close }">
        <MiuixInput v-model="volumeText" single-line class="ex-mb16" />
        <div class="ex-dialog-actions">
          <MiuixButton class="ex-grow" @click="close">Cancel</MiuixButton>
          <MiuixButton class="ex-grow" type="primary" @click="confirmVolume">Confirm</MiuixButton>
        </div>
      </template>
    </MiuixDialog>

    <MiuixBottomSheet v-model="bottomSheetOpen" title="BottomSheet">
      <template #start-action>
        <MiuixButton @click="bottomSheetOpen = false">Cancel</MiuixButton>
      </template>
      <template #end-action>
        <MiuixButton type="primary" @click="bottomSheetOpen = false">OK</MiuixButton>
      </template>
      <MiuixSmallTitle text="Behavior Settings" />
      <MiuixCard style="--m-card-color: var(--m-color-secondary-container)" class="ex-mb12">
        <MiuixSwitchPreference
          v-model="bottomSheetSwitch"
          title="A Switch"
          summary="Inside the sheet"
        />
      </MiuixCard>
      <div class="ex-sheet-slider"><MiuixSlider v-model="bottomSheetSlider" /></div>
    </MiuixBottomSheet>
  </div>
</template>

<style lang="scss">
.page {
  padding-bottom: 24px;
}

// Card with rows (no inner padding) — 12px side margins, 12 bottom.
.ex-card {
  margin: 0 12px 12px;

  &--pad .m-card {
    padding: 16px;
  }
}

// Non-card section body (Button / ProgressIndicator linear / TextField / TabRow).
.ex-block {
  padding: 0 12px;
  margin-bottom: 12px;
}

.ex-mb12 {
  margin-bottom: 12px;
}
.ex-mb16 {
  margin-bottom: 16px;
}
.ex-block-text {
  display: block;
}
.ex-gap8 {
  width: 8px;
}
.ex-spacer {
  height: 12px;
}

.ex-btn-row {
  display: flex;
  gap: 12px;

  & + & {
    margin-top: 12px;
  }
}
.ex-grow {
  flex: 1;
}

// Clip while the height spring runs (expand/collapse).
.ex-expand {
  overflow: hidden;
}

.ex-control-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px;

  &--between {
    justify-content: space-between;
  }
}

.ex-snackbar-col {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px;
}

// ProgressIndicator: linear bars (h15), circulars (h12 FlowRow).
.ex-progress-linear {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 0 15px 12px;
}
.ex-progress-circular {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
  justify-content: space-evenly;
  padding: 0 12px 12px;
}

.ex-field-stack {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 0 12px;
  margin-bottom: 12px;
}

// Slider card contents: 12px side padding; label→slider 4, slider→next 12.
.ex-slider-stack {
  padding: 12px;
  display: flex;
  flex-direction: column;

  .m-text {
    margin-bottom: 4px;
  }
  .m-slider {
    margin-bottom: 12px;
  }
  .m-slider:last-child {
    margin-bottom: 0;
  }
}

.ex-vslider-row {
  display: flex;
  justify-content: space-evenly;
  gap: 8px;
  padding: 12px;
}
.ex-vslider {
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

.ex-tab-content {
  margin-top: 12px;
}

.ex-number-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 12px;
  // Widen each wheel's grabbable zone beyond the bare digits (the digits stay
  // centred); demonstrates --m-number-picker-hit-padding.
  --m-number-picker-hit-padding: 24px;
}

.ex-card-row {
  display: flex;
  gap: 12px;
  margin: 0 12px 12px;
}

.ex-dialog-actions {
  display: flex;
  gap: 12px;
}

.ex-sheet-slider {
  padding: 0 4px 8px;
}
</style>
