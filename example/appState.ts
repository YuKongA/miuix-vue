// Example-wide UI state (mirrors the miuix example's AppState). The FPS
// monitor is an app-level overlay, so its toggle is shared between SettingsPage
// (the switch) and App.vue (the overlay) via this module-level ref.
import { ref } from 'vue'

export const showFpsMonitor = ref(false)
