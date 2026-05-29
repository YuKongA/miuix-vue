<script setup lang="ts">
// miuix-vue example app — a TopAppBar, a 5-tab bottom NavigationBar, and a
// keep-alive paged body (Home / Icon / Color / TextStyle / Settings). The
// app shell is plain flex layout (no Scaffold): on web, flexbox auto-sizes
// the scroll body between the fixed bars, so no measure/inset coordination is
// needed. SnackbarHost stays a standalone teleport singleton.
import { computed, ref } from 'vue'
import {
  MiuixIcon,
  MiuixIconButton,
  MiuixNavigationBar,
  MiuixSnackbarHost,
  MiuixTopAppBar,
  useTheme,
  type MiuixNavigationItem,
} from '@/index'
import { Create, Edit, HorizontalSplit, Image, Settings, Theme } from '@/icons/extended'
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
// Per-tab glyphs — same as the miuix example (AppContent.kt navigationItems).
const navIcons = [HorizontalSplit, Create, Image, Edit, Settings]

const navIndex = ref(0)
const activePage = computed(() => pages[navIndex.value])
const activeTitle = computed(() => titles[navIndex.value])
</script>

<template>
  <div class="app">
    <div class="app__top">
      <MiuixTopAppBar :title="activeTitle" class="app__bar">
        <template #actions>
          <MiuixIconButton aria-label="Toggle theme" @click="toggleTheme">
            <MiuixIcon :icon="Theme" :size="24" />
          </MiuixIconButton>
        </template>
      </MiuixTopAppBar>
    </div>

    <div class="app__body">
      <Transition name="page" mode="out-in">
        <KeepAlive>
          <component :is="activePage" :key="navIndex" />
        </KeepAlive>
      </Transition>
    </div>

    <div class="app__bottom">
      <MiuixNavigationBar v-model="navIndex" :items="navItems">
        <template #icon="{ index }">
          <MiuixIcon :icon="navIcons[index]" :size="26" />
        </template>
      </MiuixNavigationBar>
    </div>
  </div>

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
  display: flex;
  flex-direction: column;
  height: 100vh;
  min-height: 0;
  background: var(--m-color-surface);

  &__top,
  &__bottom {
    flex: none;
    z-index: 10;
  }

  // flex:1 + min-height:0 makes the body take exactly the gap between the
  // fixed bars and scroll internally (the one flex invariant worth pinning).
  &__body {
    position: relative;
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    // The Card tilt's 3D pop-out is visual overflow; clip it horizontally so it
    // never spawns a transient page scrollbar (vertical scroll still works).
    overflow-x: hidden;
  }

  // Bars + scroll body sit on the surface backdrop behind the cards.
  &__body,
  &__bar,
  .m-navigation-bar {
    background: var(--m-color-surface);
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
