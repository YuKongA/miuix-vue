<script setup lang="ts">
// SettingsPage — app-style settings rows built from preference components.
import { computed, ref } from 'vue'
import {
  MiuixArrowPreference,
  MiuixButton,
  MiuixCard,
  MiuixDialog,
  MiuixDropdownPreference,
  MiuixSmallTitle,
  MiuixSwitchPreference,
  useTheme,
  setTheme,
} from '@/index'

const { theme } = useTheme()
const darkMode = computed({
  get: () => theme.value === 'dark',
  set: (v: boolean) => setTheme(v ? 'dark' : 'light'),
})

const fps = ref(false)
const langIndex = ref(0)
const languages = ['System', 'English', '简体中文']
const aboutOpen = ref(false)
</script>

<template>
  <div class="page">
    <MiuixSmallTitle text="Appearance" />
    <MiuixCard class="set-card">
      <MiuixSwitchPreference
        v-model="darkMode"
        title="Dark mode"
        summary="Toggle light / dark theme"
      />
      <MiuixSwitchPreference v-model="fps" title="Show FPS monitor" />
      <MiuixDropdownPreference v-model="langIndex" title="Language" :items="languages" />
    </MiuixCard>

    <MiuixSmallTitle text="About" />
    <MiuixCard class="set-card">
      <MiuixArrowPreference
        title="About miuix-vue"
        summary="Version 0.0.0"
        :hold-down="aboutOpen"
        @click="aboutOpen = true"
      />
      <MiuixArrowPreference
        title="Source"
        summary="github.com/compose-miuix-ui/miuix"
        @click="() => {}"
      />
    </MiuixCard>

    <MiuixDialog
      v-model="aboutOpen"
      title="miuix-vue"
      summary="A Vue 3 port of miuix's visual + animation design language."
    >
      <template #default="{ close }">
        <MiuixButton type="primary" style="width: 100%" @click="close">OK</MiuixButton>
      </template>
    </MiuixDialog>
    <div style="height: 24px" />
  </div>
</template>

<style lang="scss">
.set-card {
  margin: 0 12px 12px;
}
</style>
