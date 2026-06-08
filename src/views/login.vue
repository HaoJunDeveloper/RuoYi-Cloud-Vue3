<template>
  <div class="login studio-login">
    <section class="login-hero">
      <p class="login-label">专业软件开发工作室</p>
      <h1>灏钧软件开发工作室</h1>
      <p class="login-subtitle">专业游戏开发运营 · 软件开发外包服务</p>
      <p class="login-desc">用清晰的项目管理后台承载交付进度、服务协同、系统配置与运营数据。</p>
      <div class="login-tags">
        <span>游戏开发</span>
        <span>软件开发</span>
        <span>技术咨询</span>
        <span>持续服务</span>
      </div>
    </section>

    <el-form ref="loginRef" :model="loginForm" :rules="loginRules" class="login-form">
      <div class="form-brand">
        <span>HJ</span>
        <div>
          <h3>{{ title }}</h3>
          <p>工作室管理后台</p>
        </div>
      </div>
      <el-form-item prop="username">
        <el-input
          v-model="loginForm.username"
          type="text"
          size="large"
          auto-complete="off"
          placeholder="账号"
          aria-label="账号"
        >
          <template #prefix><svg-icon icon-class="user" class="el-input__icon input-icon" /></template>
        </el-input>
      </el-form-item>
      <el-form-item prop="password">
        <el-input
          v-model="loginForm.password"
          type="password"
          size="large"
          auto-complete="off"
          placeholder="密码"
          aria-label="密码"
          @keyup.enter="handleLogin"
        >
          <template #prefix><svg-icon icon-class="password" class="el-input__icon input-icon" /></template>
        </el-input>
      </el-form-item>
      <el-form-item prop="code" v-if="captchaEnabled" class="code-row">
        <el-input
          v-model="loginForm.code"
          size="large"
          auto-complete="off"
          placeholder="验证码"
          aria-label="验证码"
          @keyup.enter="handleLogin"
        >
          <template #prefix><svg-icon icon-class="validCode" class="el-input__icon input-icon" /></template>
        </el-input>
        <div class="login-code">
          <img v-if="codeUrl" :src="codeUrl" @click="getCode" class="login-code-img" alt="验证码图片"/>
          <span v-else>9999</span>
        </div>
      </el-form-item>
      <div class="form-options">
        <el-checkbox v-model="loginForm.rememberMe">记住密码</el-checkbox>
        <span>开发固定验证码：9999</span>
      </div>
      <el-form-item style="width:100%;">
        <el-button
          :loading="loading"
          size="large"
          type="primary"
          class="login-button"
          @click.prevent="handleLogin"
        >
          <span v-if="!loading">进入工作台</span>
          <span v-else>正在进入...</span>
        </el-button>
        <div class="register-link" v-if="register">
          <router-link class="link-type" :to="'/register'">立即注册</router-link>
        </div>
      </el-form-item>
    </el-form>
    <div class="el-login-footer">
      <span>{{ footerContent }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getCodeImg } from "@/api/login"
import Cookies from "js-cookie"
import { encrypt, decrypt } from "@/utils/jsencrypt"
import useUserStore from '@/store/modules/user'
import defaultSettings from '@/settings'
import type { LoginForm } from '@/types/api/login'

const title = import.meta.env.VITE_APP_TITLE
const footerContent = defaultSettings.footerContent
const userStore = useUserStore()
const route = useRoute()
const router = useRouter()
const { proxy } = getCurrentInstance()

const loginForm = ref<LoginForm>({
  username: "admin",
  password: "admin123",
  rememberMe: false,
  code: "9999",
  uuid: ""
})

const loginRules = {
  username: [{ required: true, trigger: "blur", message: "请输入您的账号" }],
  password: [{ required: true, trigger: "blur", message: "请输入您的密码" }],
  code: [{ required: true, trigger: "change", message: "请输入验证码" }]
}

const codeUrl = ref("")
const loading = ref(false)
const captchaEnabled = ref(true)
const register = ref(false)
const redirect = ref<string | undefined>(undefined)

watch(route, (newRoute: any) => {
    redirect.value = (newRoute.query && newRoute.query.redirect) as string | undefined
}, { immediate: true })

function handleLogin(): void {
  proxy.$refs.loginRef.validate((valid: boolean) => {
    if (valid) {
      loading.value = true
      if (loginForm.value.rememberMe) {
        Cookies.set("username", loginForm.value.username, { expires: 30 })
        Cookies.set("password", encrypt(loginForm.value.password), { expires: 30 })
        Cookies.set("rememberMe", loginForm.value.rememberMe, { expires: 30 })
      } else {
        Cookies.remove("username")
        Cookies.remove("password")
        Cookies.remove("rememberMe")
      }
      userStore.login(loginForm.value).then(() => {
        const query = route.query
        const otherQueryParams = Object.keys(query).reduce((acc: Record<string, any>, cur) => {
          if (cur !== "redirect") {
            acc[cur] = query[cur]
          }
          return acc
        }, {})
        router.push({ path: redirect.value || "/", query: otherQueryParams })
      }).catch(() => {
        loading.value = false
        if (captchaEnabled.value) {
          getCode()
        }
      })
    }
  })
}

function getCode(): void {
  getCodeImg().then(res => {
    captchaEnabled.value = res.captchaEnabled === undefined ? true : res.captchaEnabled
    loginForm.value.code = "9999"
    if (captchaEnabled.value) {
      codeUrl.value = "data:image/gif;base64," + res.img
      loginForm.value.uuid = res.uuid
    }
  }).catch(() => {
    loginForm.value.code = "9999"
    codeUrl.value = ""
  })
}

function getCookie(): void {
  const username = Cookies.get("username")
  const password = Cookies.get("password")
  const rememberMe = Cookies.get("rememberMe")
  loginForm.value = {
    username: username === undefined ? loginForm.value.username : username,
    password: password === undefined ? loginForm.value.password : decrypt(password),
    rememberMe: rememberMe === undefined ? false : Boolean(rememberMe),
    code: "9999",
    uuid: loginForm.value.uuid
  }
}

getCode()
getCookie()
</script>

<style lang='scss' scoped>
.login {
  position: relative;
  display: grid;
  width: 100vw;
  height: 100vh;
  grid-template-columns: minmax(480px, 680px) minmax(320px, 440px);
  gap: clamp(48px, 6vw, 96px);
  align-items: center;
  justify-content: center;
  padding: clamp(28px, 5vh, 56px) clamp(28px, 6vw, 96px) clamp(42px, 7vh, 72px);
  overflow: hidden;
  background:
    linear-gradient(135deg, rgba(15, 23, 42, 0.88), rgba(30, 64, 175, 0.82)),
    url("../assets/images/login-background.jpg") center/cover;
}

.login::before,
.login::after {
  content: '';
  position: absolute;
  border-radius: 999px;
  background: rgba(59, 130, 246, 0.26);
  filter: blur(12px);
}

.login::before {
  width: 360px;
  height: 360px;
  left: -120px;
  top: -140px;
}

.login::after {
  width: 420px;
  height: 420px;
  right: -160px;
  bottom: -180px;
}

.login-hero,
.login-form {
  position: relative;
  z-index: 1;
}

.login-hero {
  max-width: 720px;
  color: #fff;
}

.login-label {
  margin: 0 0 18px;
  color: #93c5fd;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.16em;
}

.login-hero h1 {
  margin: 0;
  font-size: clamp(38px, 5vw, 68px);
  line-height: 1.06;
  letter-spacing: -0.05em;
}

.login-subtitle {
  margin: 24px 0 0;
  color: #dbeafe;
  font-size: 22px;
  font-weight: 600;
}

.login-desc {
  max-width: 620px;
  margin: 16px 0 0;
  color: #cbd5e1;
  font-size: 16px;
  line-height: 1.8;
}

.login-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 34px;
}

.login-tags span {
  padding: 10px 16px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 999px;
  color: #e0f2fe;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(12px);
}

.login-form {
  width: 100%;
  padding: 34px;
  border: 1px solid rgba(255, 255, 255, 0.22);
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 28px 70px rgba(15, 23, 42, 0.32);
  backdrop-filter: blur(22px);
}

.form-brand {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 30px;
}

.form-brand span {
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  color: #fff;
  background: linear-gradient(135deg, #2563eb, #60a5fa);
  font-weight: 800;
  letter-spacing: -0.04em;
}

.form-brand h3 {
  margin: 0;
  color: #0f172a;
  font-size: 22px;
}

.form-brand p {
  margin: 4px 0 0;
  color: #64748b;
}

.login-form :deep(.el-form-item) {
  margin-bottom: 16px;
}

.login-form :deep(.el-form-item__content) {
  min-height: 44px;
}

.login-form :deep(.el-input__wrapper) {
  min-height: 44px;
  border-radius: 12px;
  box-shadow: 0 0 0 1px #e2e8f0 inset;
}

.input-icon {
  width: 15px;
  height: 15px;
  color: #64748b;
}

.code-row :deep(.el-form-item__content) {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 108px;
  gap: 10px;
}

.login-code {
  height: 44px;
  overflow: hidden;
  border: 1px solid #dbeafe;
  border-radius: 12px;
  background: #eff6ff;
  color: #2563eb;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 17px;
  font-weight: 800;
  letter-spacing: 0.16em;
}

.login-code-img {
  width: 100%;
  height: 100%;
  cursor: pointer;
  object-fit: cover;
}

.form-options {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin: 0 0 18px;
  color: #64748b;
  font-size: 13px;
}

.login-button {
  width: 100%;
  height: 44px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #2563eb, #3b82f6);
  font-weight: 700;
  box-shadow: 0 16px 28px rgba(37, 99, 235, 0.26);
}

.register-link {
  width: 100%;
  margin-top: 14px;
  text-align: right;
}

.el-login-footer {
  position: absolute;
  z-index: 1;
  bottom: 22px;
  left: 0;
  width: 100%;
  text-align: center;
  color: rgba(255, 255, 255, 0.68);
  font-size: 12px;
  letter-spacing: 1px;
  pointer-events: none;
}

html.dark .login {
  .login-form {
    background: rgba(30, 41, 59, 0.88) !important;
    border-color: rgba(148, 163, 184, 0.22);
  }

  .form-brand h3 {
    color: #f8fafc;
  }

  .form-brand p,
  .form-options {
    color: #cbd5e1;
  }
}

@media (max-width: 980px) {
  .login {
    grid-template-columns: 1fr;
    gap: clamp(16px, 3vh, 28px);
    align-content: center;
    justify-content: stretch;
    padding: clamp(20px, 4vh, 32px) 18px clamp(34px, 6vh, 56px);
  }

  .login-hero {
    text-align: center;
    margin: 0 auto;
  }

  .login-tags {
    justify-content: center;
  }

  .login-form {
    max-width: 420px;
    margin: 0 auto;
    padding: 24px;
  }

  .el-login-footer {
    bottom: 20px;
    padding: 0 18px;
  }
}
</style>