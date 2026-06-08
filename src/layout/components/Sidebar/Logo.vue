<template>
  <div class="sidebar-logo-container" :class="{ 'collapse': collapse }">
    <transition name="sidebarLogoFade">
      <router-link v-if="collapse" key="collapse" class="sidebar-logo-link" to="/">
        <img v-if="logo" :src="logo" class="sidebar-logo" />
        <h1 v-else class="sidebar-title">{{ title }}</h1>
      </router-link>
      <router-link v-else key="expand" class="sidebar-logo-link" to="/">
        <img v-if="logo" :src="logo" class="sidebar-logo" />
        <h1 class="sidebar-title">{{ title }}</h1>
      </router-link>
    </transition>
  </div>
</template>

<script setup lang="ts">
import logo from '@/assets/logo/logo.png'
import useSettingsStore from '@/store/modules/settings'
import variables from '@/assets/styles/variables.module.scss'

defineProps({
  collapse: {
    type: Boolean,
    required: true
  }
})

const title = import.meta.env.VITE_APP_TITLE
const settingsStore = useSettingsStore()
const sideTheme = computed(() => settingsStore.sideTheme)

// 获取Logo背景色
const getLogoBackground = computed(() => {
  if (settingsStore.isDark) {
    return 'var(--sidebar-bg)'
  }
  if (settingsStore.navType == 3) {
    return variables.menuLightBg
  }
  return sideTheme.value === 'theme-dark' ? variables.menuBg : variables.menuLightBg
})

// 获取Logo文字颜色
const getLogoTextColor = computed(() => {
  if (settingsStore.isDark) {
    return 'var(--sidebar-logo-text)'
  }
  if (settingsStore.navType == 3) {
    return variables.menuLightText
  }
  return sideTheme.value === 'theme-dark' ? '#fff' : variables.menuLightText
})
</script>

<style lang="scss" scoped>
.sidebarLogoFade-enter-active {
  transition: opacity 0.35s ease, transform 0.35s ease;
}

.sidebarLogoFade-enter,
.sidebarLogoFade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

.sidebar-logo-container {
  position: relative;
  height: 64px;
  line-height: 64px;
  padding: 10px 12px;
  background: transparent;
  text-align: center;
  overflow: hidden;
  box-sizing: border-box;

  &::after {
    content: '';
    position: absolute;
    left: 16px;
    right: 16px;
    bottom: 0;
    height: 1px;
    background: rgba(148, 163, 184, 0.14);
  }

  & .sidebar-logo-link {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    width: 100%;
    border-radius: 16px;
    background: var(--studio-sidebar-card, rgba(15, 23, 42, 0.42));
    box-shadow: inset 0 0 0 1px rgba(148, 163, 184, 0.14), 0 14px 24px rgba(15, 23, 42, 0.1);
    text-decoration: none;
    transition: background 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;

    &:hover {
      transform: translateY(-1px);
      box-shadow: inset 0 0 0 1px rgba(96, 165, 250, 0.22), 0 16px 28px rgba(15, 23, 42, 0.14);
    }

    & .sidebar-logo {
      width: 30px;
      height: 30px;
      vertical-align: middle;
      margin-right: 10px;
      border-radius: 10px;
      box-shadow: 0 8px 18px rgba(15, 23, 42, 0.16);
    }

    & .sidebar-title {
      display: inline-block;
      max-width: 128px;
      margin: 0;
      color: v-bind(getLogoTextColor);
      font-weight: 850;
      line-height: 1;
      font-size: 14px;
      font-family: Avenir, Helvetica Neue, Arial, Helvetica, sans-serif;
      letter-spacing: 0.03em;
      vertical-align: middle;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  &.collapse {
    height: 64px;
    padding: 10px 8px;

    &::after {
      left: 10px;
      right: 10px;
    }

    .sidebar-logo-link {
      border-radius: 15px;
    }

    .sidebar-logo {
      margin-right: 0px;
    }
  }
}
</style>
