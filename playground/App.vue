<script setup lang="ts">
// miuix-vue example app — mirrors the miuix example shell: a Scaffold with a
// TopAppBar, a 5-tab bottom NavigationBar, and a keep-alive paged body
// (Home / Icon / Color / TextStyle / Settings).
import { computed, ref } from 'vue'
import {
  MiuixIconButton,
  MiuixNavigationBar,
  MiuixScaffold,
  MiuixSnackbarHost,
  MiuixTopAppBar,
  useTheme,
  type MiuixNavigationItem,
} from '@/index'
import MainPage from './pages/MainPage.vue'
import IconPage from './pages/IconPage.vue'
import ColorPage from './pages/ColorPage.vue'
import TextStylePage from './pages/TextStylePage.vue'
import SettingsPage from './pages/SettingsPage.vue'

const { theme, setTheme } = useTheme()
function toggleTheme(): void {
  setTheme(theme.value === 'light' ? 'dark' : 'light')
}

const pages = [MainPage, IconPage, ColorPage, TextStylePage, SettingsPage]
const titles = ['Home', 'Icon', 'Color', 'TextStyle', 'Settings']
const navItems: MiuixNavigationItem[] = titles.map((label) => ({ label }))

const navIndex = ref(0)
const activePage = computed(() => pages[navIndex.value])
const activeTitle = computed(() => titles[navIndex.value])

// Simple per-tab glyphs (the miuix nav icons aren't part of the ported set).
const glyphs = ['▤', '✦', '◑', 'A', '⚙']
</script>

<template>
  <MiuixScaffold class="app">
    <template #top-bar>
      <MiuixTopAppBar :title="activeTitle" class="app__bar">
        <template #actions>
          <MiuixIconButton aria-label="Toggle theme" @click="toggleTheme">
            <span class="app__theme-glyph">{{ theme === 'light' ? '☾' : '☀' }}</span>
          </MiuixIconButton>
        </template>
      </MiuixTopAppBar>
    </template>

    <Transition name="page" mode="out-in">
      <KeepAlive>
        <component :is="activePage" :key="navIndex" />
      </KeepAlive>
    </Transition>

    <template #bottom-bar>
      <MiuixNavigationBar v-model="navIndex" :items="navItems">
        <template #icon="{ index }">
          <span class="app__nav-glyph">{{ glyphs[index] }}</span>
        </template>
      </MiuixNavigationBar>
    </template>
  </MiuixScaffold>

  <MiuixSnackbarHost />
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
  height: 100vh;

  // Bars + scroll body sit on the surface backdrop behind the cards.
  .m-scaffold__body,
  &__bar,
  .m-navigation-bar {
    background: var(--m-color-surface);
  }

  &__theme-glyph {
    font-size: 20px;
    line-height: 1;
  }

  &__nav-glyph {
    font-size: 20px;
    line-height: 1;
  }
}

.page-enter-active,
.page-leave-active {
  transition: opacity 0.18s ease;
}
.page-enter-from,
.page-leave-to {
  opacity: 0;
}
</style>
