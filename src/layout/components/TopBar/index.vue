<template>
  <el-menu class="topbar-menu" :ellipsis="false" :default-active="activeMenu" :active-text-color="theme" mode="horizontal">
    <sidebar-item :key="route.path + index" v-for="(route, index) in topMenus" :item="route" :base-path="route.path" />

    <el-sub-menu index="more" class="el-sub-menu__hide-arrow" v-if="moreRoutes.length > 0">
      <template #title>
        <span>更多菜单</span>
      </template>
      <sidebar-item :key="route.path + index" v-for="(route, index) in moreRoutes" :item="route" :base-path="route.path" />
    </el-sub-menu>
  </el-menu>
</template>

<script setup lang="ts">
import SidebarItem from '../Sidebar/SidebarItem.vue'
import useAppStore from '@/store/modules/app'
import useSettingsStore from '@/store/modules/settings'
import usePermissionStore from '@/store/modules/permission'

const route = useRoute()
const appStore = useAppStore()
const settingsStore = useSettingsStore()
const permissionStore = usePermissionStore()

const sidebarRouters = computed(() => permissionStore.sidebarRouters)
const theme = computed(() => settingsStore.theme)
const device = computed(() => appStore.device)
const activeMenu = computed(() => {
  const { meta, path } = route
  if (meta.activeMenu) {
    return meta.activeMenu
  }
  return path
})

const visibleNumber = ref<number>(5)
const topMenus = computed(() => {
  return permissionStore.sidebarRouters.filter((f: any) => !f.hidden).slice(0, visibleNumber.value)
})
const moreRoutes = computed(() => {
  return permissionStore.sidebarRouters.filter((f: any) => !f.hidden).slice(visibleNumber.value)
})
function setVisibleNumber(): void {
  const width = document.body.getBoundingClientRect().width / 3
  visibleNumber.value = Math.max(1, parseInt(String(width / 85)))
}

onMounted(() => {
  window.addEventListener('resize', setVisibleNumber)
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', setVisibleNumber)
})

onMounted(() => {
  setVisibleNumber()
})
</script>

<style lang="scss">
.topbar-menu.el-menu--horizontal {
  height: 44px !important;
  border-bottom: none !important;
  background: transparent !important;
}

.topbar-menu.el-menu--horizontal .el-sub-menu__title,
.topbar-menu.el-menu--horizontal .el-menu-item {
  height: 38px !important;
  line-height: 38px !important;
  padding: 0 14px !important;
  margin: 3px 4px !important;
  border-radius: 14px;
  border-bottom: none !important;
  color: var(--studio-text, #334155) !important;
  font-weight: 750;
  letter-spacing: 0.01em;
  transition: background 0.2s ease, color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
}

.topbar-menu.el-menu--horizontal > .el-menu-item,
.topbar-menu.el-menu--horizontal > .el-sub-menu .el-sub-menu__title {
  float: left;
}

.topbar-menu.el-menu--horizontal .el-menu-item:hover,
.topbar-menu.el-menu--horizontal .el-sub-menu__title:hover {
  color: v-bind(theme) !important;
  background: color-mix(in srgb, v-bind(theme) 10%, transparent) !important;
  box-shadow: inset 0 0 0 1px color-mix(in srgb, v-bind(theme) 12%, transparent);
  transform: translateY(-1px);
}

.el-sub-menu.is-active .svg-icon,
.el-menu-item.is-active .svg-icon + span,
.el-sub-menu.is-active .svg-icon + span,
.el-sub-menu.is-active .el-sub-menu__title span,
.topbar-menu.el-menu--horizontal .el-menu-item.is-active,
.topbar-menu.el-menu--horizontal .el-sub-menu.is-active > .el-sub-menu__title {
  color: v-bind(theme) !important;
}

.topbar-menu.el-menu--horizontal .el-menu-item.is-active,
.topbar-menu.el-menu--horizontal .el-sub-menu.is-active > .el-sub-menu__title {
  background: color-mix(in srgb, v-bind(theme) 12%, transparent) !important;
  box-shadow: inset 0 0 0 1px color-mix(in srgb, v-bind(theme) 18%, transparent), 0 8px 18px rgba(37, 99, 235, 0.06);
}

.topbar-menu .el-sub-menu .el-sub-menu__icon-arrow {
  position: static;
  margin-left: 8px;
  margin-top: 0px;
  display: block !important;
}
</style>
