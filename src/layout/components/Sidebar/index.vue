<template>
  <div :class="['sidebar-theme-wrapper', {'has-logo':showLogo}, sideTheme]" class="sidebar-container">
    <logo v-if="showLogo" :collapse="isCollapse" />
    <el-scrollbar wrap-class="scrollbar-wrapper">
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        :background-color="getMenuBackground"
        :text-color="getMenuTextColor"
        :unique-opened="true"
        :active-text-color="theme"
        :collapse-transition="false"
        mode="vertical"
        :class="sideTheme"
      >
        <sidebar-item
          v-for="(route, index) in sidebarRouters"
          :key="route.path + index"
          :item="route"
          :base-path="route.path"
        />
      </el-menu>
    </el-scrollbar>
  </div>
</template>

<script setup lang="ts">
import Logo from './Logo.vue'
import SidebarItem from './SidebarItem.vue'
import variables from '@/assets/styles/variables.module.scss'
import useAppStore from '@/store/modules/app'
import useSettingsStore from '@/store/modules/settings'
import usePermissionStore from '@/store/modules/permission'

const route = useRoute()
const appStore = useAppStore()
const settingsStore = useSettingsStore()
const permissionStore = usePermissionStore()

const sidebarRouters = computed(() => permissionStore.sidebarRouters)
const showLogo = computed(() => settingsStore.sidebarLogo)
const sideTheme = computed(() => settingsStore.sideTheme)
const theme = computed(() => settingsStore.theme)
const isCollapse = computed(() => !appStore.sidebar.opened)

// 获取菜单背景色
const getMenuBackground = computed(() => {
  if (settingsStore.isDark) {
    return 'var(--sidebar-bg)'
  }
  return sideTheme.value === 'theme-dark' ? variables.menuBg : variables.menuLightBg
})

// 获取菜单文字颜色
const getMenuTextColor = computed(() => {
  if (settingsStore.isDark) {
    return 'var(--sidebar-text)'
  }
  return sideTheme.value === 'theme-dark' ? variables.menuText : variables.menuLightText
})

const activeMenu = computed(() => {
  const { meta, path } = route
  if (meta.activeMenu) {
    return meta.activeMenu
  }
  return path
})
</script>

<style lang="scss" scoped>
.sidebar-container {
  background: var(--studio-sidebar-bg, v-bind(getMenuBackground));

  .scrollbar-wrapper {
    background: transparent;
  }

  .el-menu {
    border: none;
    height: 100%;
    width: 100% !important;
    padding: 12px 10px 18px;
    background: transparent !important;

    .svg-icon {
      position: relative;
      z-index: 2;
      flex-shrink: 0;
      font-size: 16px;
      opacity: 0.9;
    }

    .menu-title {
      position: relative;
      z-index: 2;
      font-weight: 650;
      letter-spacing: 0.01em;
    }

    .el-menu-item,
    .el-sub-menu__title {
      position: relative;
      height: 42px !important;
      line-height: 42px !important;
      margin: 4px 0;
      border-radius: 14px;
      color: v-bind(getMenuTextColor);
      overflow: hidden;
      transition: color 0.18s ease, background 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease;

      &::after {
        content: '';
        position: absolute;
        inset: 0;
        opacity: 0;
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.12), transparent 58%);
        transition: opacity 0.18s ease;
      }

      &:hover {
        color: #fff !important;
        background: rgba(37, 99, 235, 0.18) !important;
        box-shadow: inset 0 0 0 1px rgba(96, 165, 250, 0.18);
        transform: translateX(2px);

        &::after {
          opacity: 1;
        }
      }
    }

    .el-menu-item {
      color: v-bind(getMenuTextColor);

      &.is-active {
        color: #fff !important;
        background: linear-gradient(135deg, var(--current-color, #2563eb), #38bdf8) !important;
        box-shadow: 0 14px 28px rgba(37, 99, 235, 0.26);

        &::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 0;
          width: 3px;
          height: 22px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.92);
          transform: translateY(-50%);
        }
      }
    }

    .el-sub-menu.is-active > .el-sub-menu__title {
      color: #fff !important;
      background: var(--studio-sidebar-active, rgba(37, 99, 235, 0.24)) !important;
      box-shadow: inset 0 0 0 1px rgba(96, 165, 250, 0.16);
    }

    :deep(.nest-menu) {
      margin: 2px 0 6px;
      padding-left: 8px;
      border-left: 1px solid rgba(148, 163, 184, 0.14);

      .el-menu-item,
      .el-sub-menu__title {
        height: 38px !important;
        line-height: 38px !important;
        margin: 3px 0;
        border-radius: 12px;
        font-size: 13px;
      }
    }
  }

  &.theme-light {
    background: rgba(255, 255, 255, 0.96);

    .el-menu {
      .el-menu-item,
      .el-sub-menu__title {
        color: #334155;

        &:hover {
          color: var(--current-color, #2563eb) !important;
          background: var(--studio-accent-soft, rgba(37, 99, 235, 0.1)) !important;
          box-shadow: inset 0 0 0 1px rgba(37, 99, 235, 0.08);
        }
      }

      .el-menu-item.is-active,
      .el-sub-menu.is-active > .el-sub-menu__title {
        color: var(--current-color, #2563eb) !important;
        background: linear-gradient(135deg, rgba(37, 99, 235, 0.14), rgba(14, 165, 233, 0.08)) !important;
        box-shadow: inset 3px 0 0 var(--current-color, #2563eb), 0 10px 22px rgba(37, 99, 235, 0.08);
      }

      :deep(.nest-menu) {
        border-left-color: rgba(37, 99, 235, 0.12);
      }
    }
  }
}
</style>
