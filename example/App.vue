<script setup lang="ts">
// miuix-vue example app
import { computed, ref, watch } from 'vue'
import {
  MiuixIcon,
  MiuixIconButton,
  MiuixNavigationBar,
  MiuixScrollArea,
  MiuixSnackbarHost,
  MiuixTopAppBar,
  useTheme,
  type MiuixNavigationItem,
} from '@/index'
import { Create, Edit, HorizontalSplit, Image, Settings, Theme } from '@/icons/extended'
import { showFpsMonitor } from './appState'
import FpsMonitor from './components/FpsMonitor.vue'
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

// Each tab keeps its own scroll position: save the outgoing tab's scrollTop
// before the switch, restore the incoming tab's on page enter.
interface Scroller {
  getScrollTop: () => number
  setScrollTop: (top: number) => void
}
const scrollerRef = ref<Scroller | null>(null)
const scrollPositions = new Map<number, number>()

watch(
  navIndex,
  (_next, prev) => {
    scrollPositions.set(prev, scrollerRef.value?.getScrollTop() ?? 0)
  },
  { flush: 'pre' },
)

function onPageEnter(): void {
  scrollerRef.value?.setScrollTop(scrollPositions.get(navIndex.value) ?? 0)
}
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

    <MiuixScrollArea ref="scrollerRef" class="app__body">
      <Transition name="page" mode="out-in" @enter="onPageEnter">
        <KeepAlive>
          <component :is="activePage" :key="navIndex" />
        </KeepAlive>
      </Transition>
    </MiuixScrollArea>

    <div class="app__bottom">
      <MiuixNavigationBar v-model="navIndex" :items="navItems">
        <template #icon="{ index }">
          <MiuixIcon :icon="navIcons[index]" :size="26" />
        </template>
      </MiuixNavigationBar>
    </div>
  </div>

  <MiuixSnackbarHost />

  <Transition name="fps-fade">
    <FpsMonitor v-if="showFpsMonitor" />
  </Transition>
</template>

<style lang="scss">
html,
body {
  margin: 0;
  height: 100%;
}

body {
  font-family:
    'MiSans VF',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    Oxygen,
    Ubuntu,
    Cantarell,
    sans-serif;
  background: var(--m-color-background);
  color: var(--m-color-on-background);
}

.app {
  display: flex;
  flex-direction: column;
  height: 100dvh;
  min-height: 0;
  background: var(--m-color-surface);

  &__top,
  &__bottom {
    flex: none;
    z-index: 10;
  }

  // flex:1 + min-height:0 makes the body take exactly the gap between the fixed
  // bars; MiuixScrollArea scrolls internally (its viewport clips overflow-x, so
  // the Card tilt's 3D pop-out never spawns a transient page scrollbar).
  &__body {
    flex: 1;
    min-height: 0;
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

// FPSMonitor AnimatedVisibility(fadeIn()/fadeOut()).
.fps-fade-enter-active,
.fps-fade-leave-active {
  transition: opacity 0.2s ease;
}
.fps-fade-enter-from,
.fps-fade-leave-to {
  opacity: 0;
}
</style>
