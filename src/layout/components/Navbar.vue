<template>
  <div class="navbar" :class="'nav' + settingsStore.navType">
    <hamburger id="hamburger-container" :is-active="appStore.sidebar.opened" class="hamburger-container" @toggleClick="toggleSideBar" />
    <breadcrumb v-if="settingsStore.navType == 1" id="breadcrumb-container" class="breadcrumb-container" />
    <top-nav v-if="settingsStore.navType == 2" id="topmenu-container" class="topmenu-container" />
    <template v-if="settingsStore.navType == 3">
      <logo v-show="settingsStore.sidebarLogo" :collapse="false"></logo>
      <top-bar id="topbar-container" class="topbar-container" />
    </template>

    <div class="right-menu">
      <template v-if="appStore.device !== 'mobile'">
        <header-search id="header-search" class="right-menu-item" />

        <el-tooltip content="工作室官网" effect="dark" placement="bottom">
          <ruo-yi-git id="ruoyi-git" class="right-menu-item hover-effect" />
        </el-tooltip>

        <el-tooltip content="联系我们" effect="dark" placement="bottom">
          <ruo-yi-doc id="ruoyi-doc" class="right-menu-item hover-effect" />
        </el-tooltip>

        <screenfull id="screenfull" class="right-menu-item hover-effect" />

        <el-tooltip content="主题模式" effect="dark" placement="bottom">
          <div class="right-menu-item hover-effect theme-switch-wrapper" @click="toggleTheme">
            <svg-icon v-if="settingsStore.isDark" icon-class="sunny" />
            <svg-icon v-if="!settingsStore.isDark" icon-class="moon" />
          </div>
        </el-tooltip>

        <el-tooltip content="布局大小" effect="dark" placement="bottom">
          <size-select id="size-select" class="right-menu-item hover-effect" />
        </el-tooltip>

        <el-tooltip content="消息通知" effect="dark" placement="bottom">
          <header-notice id="header-notice" class="right-menu-item hover-effect" />
        </el-tooltip>
      </template>

      <el-dropdown @command="handleCommand" class="avatar-container right-menu-item hover-effect" trigger="hover">
        <div class="avatar-wrapper">
          <img :src="userStore.avatar" class="user-avatar" alt="用户头像" />
          <span class="user-nickname"> {{ userStore.nickName }} </span>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <router-link to="/user/profile">
              <el-dropdown-item>个人中心</el-dropdown-item>
            </router-link>
            <el-dropdown-item command="setLayout" v-if="settingsStore.showSettings">
                <span>布局设置</span>
            </el-dropdown-item>
            <el-dropdown-item command="lockScreen">
                <span>锁定屏幕</span>
            </el-dropdown-item>
            <el-dropdown-item divided command="logout">
              <span>退出登录</span>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElMessageBox } from 'element-plus'
import Breadcrumb from '@/components/Breadcrumb/index.vue'
import TopNav from './TopNav/index.vue'
import TopBar from './TopBar/index.vue'
import Logo from './Sidebar/Logo.vue'
import Hamburger from '@/components/Hamburger/index.vue'
import Screenfull from '@/components/Screenfull/index.vue'
import SizeSelect from '@/components/SizeSelect/index.vue'
import HeaderSearch from '@/components/HeaderSearch/index.vue'
import RuoYiGit from '@/components/RuoYi/Git/index.vue'
import RuoYiDoc from '@/components/RuoYi/Doc/index.vue'
import useAppStore from '@/store/modules/app'
import useUserStore from '@/store/modules/user'
import useLockStore from '@/store/modules/lock'
import useSettingsStore from '@/store/modules/settings'
import HeaderNotice from './HeaderNotice'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()
const userStore = useUserStore()
const lockStore = useLockStore()
const settingsStore = useSettingsStore()

function toggleSideBar(): void {
  appStore.toggleSideBar()
}

function handleCommand(command: string): void {
  switch (command) {
    case "setLayout":
      setLayout()
      break
    case "lockScreen":
      lockScreen()
      break
    case "logout":
      logout()
      break
    default:
      break
  }
}

function logout(): void {
  ElMessageBox.confirm('确定注销并退出系统吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    userStore.logOut().then(() => {
      location.href = '/index'
    })
  }).catch(() => { })
}

const emits = defineEmits(['setLayout'])
function setLayout(): void {
  emits('setLayout')
}

function lockScreen() {
  const currentPath = route.fullPath
  lockStore.lockScreen(currentPath)
  router.push('/lock')
}

async function toggleTheme(event?: MouseEvent): Promise<void> {
  const x = event?.clientX || window.innerWidth / 2
  const y = event?.clientY || window.innerHeight / 2
  const wasDark = settingsStore.isDark

  const isReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
  const isSupported = typeof (document as any).startViewTransition === 'function' && !isReducedMotion

  if (!isSupported) {
    settingsStore.toggleTheme()
    return
  }

  try {
    const transition = document.startViewTransition(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10))
      settingsStore.toggleTheme()
      await nextTick()
    })
    await transition.ready

    const endRadius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y))
    const clipPath = [`circle(0px at ${x}px ${y}px)`, `circle(${endRadius}px at ${x}px ${y}px)`]
    document.documentElement.animate(
      {
        clipPath: !wasDark ? [...clipPath].reverse() : clipPath
      }, {
        duration: 650,
        easing: "cubic-bezier(0.4, 0, 0.2, 1)",
        fill: "forwards",
        pseudoElement: !wasDark ? "::view-transition-old(root)" : "::view-transition-new(root)"
      }
    )
    await transition.finished
  } catch (error) {
    console.warn("View transition failed, falling back to immediate toggle:", error)
    settingsStore.toggleTheme()
  }
}
</script>

<style lang='scss' scoped>
.navbar.nav3 {
  .hamburger-container {
    display: none !important;
  }
}

.navbar {
  height: 64px;
  overflow: hidden;
  position: relative;
  padding: 0 18px 0 12px;
  background: transparent;
  border-bottom: none;
  box-shadow: none;
  display: flex;
  align-items: center;
  box-sizing: border-box;

  .hamburger-container {
    line-height: 40px;
    width: 40px;
    height: 40px;
    cursor: pointer;
    transition: background 0.2s ease, color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
    -webkit-tap-highlight-color: transparent;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    margin-right: 10px;
    border-radius: 14px;
    color: var(--studio-muted, #64748b);

    &:hover {
      color: var(--studio-accent, #2563eb);
      background: var(--studio-accent-soft, rgba(37, 99, 235, 0.1));
      box-shadow: inset 0 0 0 1px rgba(37, 99, 235, 0.08);
      transform: translateY(-1px);
    }
  }

  .breadcrumb-container {
    flex-shrink: 0;
    color: var(--studio-muted, #64748b);
  }

  .topmenu-container {
    position: absolute;
    left: 64px;
    right: 360px;
    overflow: hidden;
  }

  .topbar-container {
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: center;
    overflow: hidden;
    margin-left: 8px;
  }

  .right-menu {
    height: 100%;
    line-height: 50px;
    display: flex;
    align-items: center;
    gap: 8px;
    margin-left: auto;

    &:focus {
      outline: none;
    }

    .right-menu-item {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 40px;
      height: 40px;
      padding: 0 10px;
      border-radius: 14px;
      font-size: 17px;
      color: var(--studio-muted, #64748b);
      vertical-align: text-bottom;
      box-sizing: border-box;

      &.hover-effect {
        cursor: pointer;
        transition: background 0.2s ease, color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;

        &:hover {
          color: var(--studio-accent, #2563eb);
          background: var(--studio-accent-soft, rgba(37, 99, 235, 0.1));
          box-shadow: inset 0 0 0 1px rgba(37, 99, 235, 0.08);
          transform: translateY(-1px);
        }
      }

      &.theme-switch-wrapper {
        display: flex;
        align-items: center;

        svg {
          transition: transform 0.3s;

          &:hover {
            transform: scale(1.15) rotate(-8deg);
          }
        }
      }
    }

    .avatar-container {
      min-width: auto;
      height: 42px;
      margin-right: 0;
      padding: 0 5px 0 11px;
      border-radius: 999px;
      background: var(--studio-panel-solid, rgba(255, 255, 255, 0.86));
      box-shadow: inset 0 0 0 1px var(--studio-border, rgba(148, 163, 184, 0.22)), 0 8px 20px rgba(15, 23, 42, 0.05);

      .avatar-wrapper {
        position: relative;
        display: inline-flex;
        align-items: center;
        height: 100%;
        right: 0;
        margin-top: 0;
        gap: 8px;

        .user-avatar {
          cursor: pointer;
          width: 30px;
          height: 30px;
          margin-right: 0;
          border-radius: 50%;
          box-shadow: 0 8px 18px rgba(15, 23, 42, 0.12);
        }

        .user-nickname{
          position: static;
          max-width: 96px;
          color: var(--studio-title, #0f172a);
          font-size: 13px;
          font-weight: 800;
          line-height: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        i {
          cursor: pointer;
          position: absolute;
          right: -20px;
          top: 25px;
          font-size: 12px;
        }
      }
    }
  }
}

@media (max-width: 992px) {
  .navbar {
    padding-right: 10px;

    .topmenu-container {
      right: 220px;
    }

    .right-menu {
      gap: 4px;
    }
  }
}
</style>
