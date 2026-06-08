<template>
  <div :class="classObj" class="app-wrapper" :style="{ '--current-color': theme, '--current-color-light': theme + '1a', '--current-color-dark-bg': theme + '33' }">
    <div v-if="device === 'mobile' && sidebar.opened" class="drawer-bg" @click="handleClickOutside"/>
    <sidebar v-if="!sidebar.hide" class="sidebar-container" />
    <div :class="{ hasTagsView: needTagsView, sidebarHide: sidebar.hide }" class="main-container">
      <div :class="{ 'fixed-header': fixedHeader }">
        <navbar @setLayout="setLayout" />
        <tags-view v-if="needTagsView" />
      </div>
      <app-main />
      <settings ref="settingRef" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useWindowSize } from '@vueuse/core'
import Sidebar from './components/Sidebar/index.vue'
import { AppMain, Navbar, Settings, TagsView } from './components'
import useAppStore from '@/store/modules/app'
import useSettingsStore from '@/store/modules/settings'

const settingsStore = useSettingsStore()
const theme = computed(() => settingsStore.theme)
const sidebar = computed(() => useAppStore().sidebar)
const device = computed(() => useAppStore().device)
const needTagsView = computed(() => settingsStore.tagsView)
const fixedHeader = computed(() => settingsStore.fixedHeader)

const classObj = computed(() => ({
  hideSidebar: !sidebar.value.opened,
  openSidebar: sidebar.value.opened,
  withoutAnimation: sidebar.value.withoutAnimation,
  mobile: device.value === 'mobile'
}))

const { width, height } = useWindowSize()
const WIDTH = 992 // refer to Bootstrap's responsive design

watch(() => device.value, () => {
  if (device.value === 'mobile' && sidebar.value.opened) {
    useAppStore().closeSideBar({ withoutAnimation: false })
  }
})

watchEffect(() => {
  if (width.value - 1 < WIDTH) {
    useAppStore().toggleDevice('mobile')
    useAppStore().closeSideBar({ withoutAnimation: true })
  } else {
    useAppStore().toggleDevice('desktop')
  }
})

function handleClickOutside(): void {
  useAppStore().closeSideBar({ withoutAnimation: false })
}

const settingRef = ref(null)
function setLayout() {
  settingRef.value.openSetting()
}
</script>

<style lang="scss" scoped>
@use "@/assets/styles/mixin.scss" as mix;
@use "@/assets/styles/variables.module.scss" as vars;

.app-wrapper {
  @include mix.clearfix;
  position: relative;
  height: 100%;
  width: 100%;
  color: var(--studio-text, #334155);
  background: var(--studio-shell-bg, #f4f7fb);
  overflow-x: hidden;

  &::before,
  &::after {
    content: '';
    position: fixed;
    pointer-events: none;
    z-index: 0;
  }

  &::before {
    top: 0;
    right: 0;
    width: 42vw;
    height: 42vw;
    min-width: 360px;
    min-height: 360px;
    background: radial-gradient(circle, rgba(14, 165, 233, 0.14), transparent 62%);
    transform: translate(28%, -34%);
  }

  &::after {
    left: 200px;
    bottom: -180px;
    width: 520px;
    height: 520px;
    background: radial-gradient(circle, rgba(37, 99, 235, 0.08), transparent 64%);
  }

  &.mobile.openSidebar {
    position: fixed;
    top: 0;
  }
}

.main-container {
  position: relative;
  z-index: 1;
  min-height: 100vh;
}

.app-wrapper :deep(.app-main) {
  background: transparent;
  padding: 18px;
  box-sizing: border-box;
}

.main-container:has(.fixed-header) {
  height: 100vh;
  overflow: hidden;
}

.drawer-bg {
  position: fixed;
  inset: 0;
  z-index: 999;
  width: 100%;
  height: 100%;
  background: rgba(15, 23, 42, 0.42);
  backdrop-filter: blur(4px);
}

.fixed-header {
  position: fixed;
  top: 0;
  right: 0;
  z-index: 9;
  width: calc(100% - #{vars.$base-sidebar-width});
  transition: width 0.28s;
  border-bottom: 1px solid var(--studio-border, rgba(148, 163, 184, 0.18));
  background: var(--studio-panel, rgba(255, 255, 255, 0.88));
  backdrop-filter: blur(18px);
  box-shadow: var(--studio-shadow-soft, 0 10px 26px rgba(15, 23, 42, 0.06));
}

.hideSidebar .fixed-header {
  width: calc(100% - 54px);
}

.sidebarHide .fixed-header {
  width: 100%;
}

.mobile .fixed-header {
  width: 100%;
}

@media (max-width: 768px) {
  .app-wrapper :deep(.app-main) {
    padding: 12px;
  }
}
</style>
