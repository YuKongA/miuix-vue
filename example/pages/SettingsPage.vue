<script setup lang="ts">
// SettingsPage — app-style settings rows built from preference components.
import { computed, ref } from 'vue'
import {
  MiuixArrowPreference,
  MiuixButton,
  MiuixCard,
  MiuixDialog,
  MiuixSmallTitle,
  MiuixSwitchPreference,
  useTheme,
  setTheme,
} from '@/index'
import { showFpsMonitor } from '../appState'

const { theme } = useTheme()
const darkMode = computed({
  get: () => theme.value === 'dark',
  set: (v: boolean) => setTheme(v ? 'dark' : 'light'),
})

const aboutOpen = ref(false)
// Version + build commit, injected by Vite `define` (vite.config.ts).
const versionSummary = `Version ${__APP_VERSION__} (${__GIT_HASH__})`

// Web equivalent of the miuix example's uriHandler.openUri — opens the repo in a
// new tab; noopener/noreferrer so the opened page can't reach back via window.opener.
const REPO_URL = 'https://github.com/YuKongA/miuix-vue'
function openRepo(): void {
  window.open(REPO_URL, '_blank', 'noopener,noreferrer')
}
</script>

<template>
  <div class="page">
    <MiuixSmallTitle text="Appearance" />
    <MiuixCard class="set-card">
      <MiuixSwitchPreference v-model="darkMode" title="Dark mode" />
      <MiuixSwitchPreference v-model="showFpsMonitor" title="Show FPS monitor" />
    </MiuixCard>

    <MiuixSmallTitle text="About" />
    <MiuixCard class="set-card">
      <MiuixArrowPreference
        title="About miuix-vue"
        :summary="versionSummary"
        :hold-down="aboutOpen"
        @click="aboutOpen = true"
      />
      <MiuixArrowPreference
        title="Github repo"
        summary="github.com/YuKongA/miuix-vue"
        @click="openRepo"
      />
    </MiuixCard>

    <MiuixDialog v-model="aboutOpen" title="miuix-vue" summary="A UI library for Vue 3.">
      <template #default="{ close }">
        <MiuixButton type="primary" style="width: 100%" @click="close">OK</MiuixButton>
      </template>
    </MiuixDialog>
  </div>
</template>

<style lang="scss">
.set-card {
  margin: 0 12px 12px;
}
</style>
