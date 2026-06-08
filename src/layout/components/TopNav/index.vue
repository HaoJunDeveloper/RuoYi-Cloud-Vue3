<template>
  <el-menu
    :default-active="activeMenu"
    mode="horizontal"
    @select="handleSelect"
    :ellipsis="false"
  >
    <template v-for="(item, index) in topMenus">
      <el-menu-item :style="{'--theme': theme}" :index="item.path" :key="index" v-if="index < visibleNumber">
        <svg-icon
        v-if="item.meta && item.meta.icon && item.meta.icon !== '#'"
        :icon-class="item.meta.icon"/>
        {{ item.meta.title }}
      </el-menu-item>
    </template>

    <!-- 顶部菜单超出数量折叠 -->
    <el-sub-menu :style="{'--theme': theme}" index="more" v-if="topMenus.length > visibleNumber">
      <template #title>更多菜单</template>
      <template v-for="(item, index) in topMenus">
        <el-menu-item
          :index="item.path"
          :key="index"
          v-if="index >= visibleNumber">
        <svg-icon
          v-if="item.meta && item.meta.icon && item.meta.icon !== '#'"
          :icon-class="item.meta.icon"/>
        {{ item.meta.title }}
        </el-menu-item>
      </template>
    </el-sub-menu>
  </el-menu>
</template>

<script setup lang="ts">
import { constantRoutes } from "@/router"
import { isHttp } from '@/utils/validate'
import useAppStore from '@/store/modules/app'
import useSettingsStore from '@/store/modules/settings'
import usePermissionStore from '@/store/modules/permission'

// 顶部栏初始数
const visibleNumber = ref<number | null>(null)
// 当前激活菜单的 index
const currentIndex = ref<string | null>(null)
// 隐藏侧边栏路由
const hideList = ['/index', '/user/profile']

const appStore = useAppStore()
const settingsStore = useSettingsStore()
const permissionStore = usePermissionStore()
const route = useRoute()
const router = useRouter()

// 主题颜色
const theme = computed(() => settingsStore.theme)
// 所有的路由信息
const routers = computed(() => permissionStore.topbarRouters)

// 顶部显示菜单
const topMenus = computed(() => {
  const topMenus: any[] = []
  routers.value.map((menu: any) => {
    if (menu.hidden !== true) {
      // 兼容顶部栏一级菜单内部跳转
      if (menu.path === '/' && menu.children) {
          topMenus.push(menu.children[0])
      } else {
          topMenus.push(menu)
      }
    }
  })
  return topMenus
})

// 设置子路由
const childrenMenus = computed(() => {
  const childrenMenus: any[] = []
  routers.value.map((router: any) => {
    for (const item in router.children) {
      if (router.children[item].parentPath === undefined) {
        if(router.path === "/") {
          router.children[item].path = "/" + router.children[item].path
        } else {
          if(!isHttp(router.children[item].path)) {
            router.children[item].path = router.path + "/" + router.children[item].path
          }
        }
        router.children[item].parentPath = router.path
      }
      childrenMenus.push(router.children[item])
    }
  })
  return constantRoutes.concat(childrenMenus)
})

// 默认激活的菜单
const activeMenu = computed(() => {
  const path = route.path
  let activePath = path
  if (path !== undefined && path.lastIndexOf("/") > 0 && hideList.indexOf(path) === -1) {
    const tmpPath = path.substring(1, path.length)
    if (!route.meta.link) {
      activePath = "/" + tmpPath.substring(0, tmpPath.indexOf("/"))
      appStore.toggleSideBarHide(false)
    }
  } else if(!(route as any).children) {
    activePath = path
    appStore.toggleSideBarHide(true)
  }
  activeRoutes(activePath)
  return activePath
})

function setVisibleNumber(): void {
  const width = document.body.getBoundingClientRect().width / 3
  visibleNumber.value = Math.max(1, parseInt(String(width / 85)))
}

function handleSelect(key: string, keyPath: string[]): void {
  currentIndex.value = key
  const route = routers.value.find((item: any) => item.path === key)
  if (isHttp(key)) {
    // http(s):// 路径新窗口打开
    window.open(key, "_blank")
  } else if (!route || !route.children) {
    // 没有子路由路径内部打开
    const routeMenu = childrenMenus.value.find((item: any) => item.path === key)
    if (routeMenu && routeMenu.query) {
      const query = JSON.parse(routeMenu.query)
      router.push({ path: key, query: query })
    } else {
      router.push({ path: key })
    }
    appStore.toggleSideBarHide(true)
  } else {
    // 显示左侧联动菜单
    activeRoutes(key)
    appStore.toggleSideBarHide(false)
  }
}

function activeRoutes(key: string){
  const routes: any[] = []
  if (childrenMenus.value && childrenMenus.value.length > 0) {
    childrenMenus.value.map((item: any) => {
      if (key == item.parentPath || (key == "index" && "" == item.path)) {
        routes.push(item)
      }
    })
  }
  if(routes.length > 0) {
    permissionStore.setSidebarRouters(routes)
  } else {
    appStore.toggleSideBarHide(true)
  }
  return routes
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
.topmenu-container.el-menu--horizontal {
  height: 44px !important;
  border-bottom: none;
  background: transparent;
}

.topmenu-container.el-menu--horizontal > .el-menu-item,
.topmenu-container.el-menu--horizontal > .el-sub-menu .el-sub-menu__title {
  float: left;
  height: 38px !important;
  line-height: 38px !important;
  color: var(--studio-text, #334155) !important;
  padding: 0 14px !important;
  margin: 3px 4px !important;
  border-radius: 14px;
  border-bottom: none !important;
  font-weight: 750;
  letter-spacing: 0.01em;
  transition: background 0.2s ease, color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
}

.topmenu-container.el-menu--horizontal > .el-menu-item.is-active,
.topmenu-container.el-menu--horizontal > .el-sub-menu.is-active .el-sub-menu__title {
  color: #{'var(--theme)'} !important;
  background: color-mix(in srgb, #{'var(--theme)'} 12%, transparent);
  box-shadow: inset 0 0 0 1px color-mix(in srgb, #{'var(--theme)'} 18%, transparent), 0 8px 18px rgba(37, 99, 235, 0.06);
}

/* 顶部菜单交互 */
.topmenu-container.el-menu--horizontal > .el-menu-item:not(.is-disabled):focus,
.topmenu-container.el-menu--horizontal > .el-menu-item:not(.is-disabled):hover,
.topmenu-container.el-menu--horizontal > .el-sub-menu .el-sub-menu__title:hover {
  color: #{'var(--theme)'} !important;
  background: color-mix(in srgb, #{'var(--theme)'} 10%, transparent) !important;
  box-shadow: inset 0 0 0 1px color-mix(in srgb, #{'var(--theme)'} 12%, transparent);
  transform: translateY(-1px);
}

/* 图标右间距 */
.topmenu-container .svg-icon {
  margin-right: 6px;
}

/* topmenu more arrow */
.topmenu-container .el-sub-menu .el-sub-menu__icon-arrow {
  position: static;
  vertical-align: middle;
  margin-left: 8px;
  margin-top: 0px;
}
</style>
