<template>
  <div class="register">
    <el-form ref="registerRef" :model="registerForm" :rules="registerRules" class="register-form">
      <h3 class="title">{{ title }}</h3>
      <el-form-item prop="username">
        <el-input 
          v-model="registerForm.username" 
          type="text" 
          size="large" 
          auto-complete="off" 
          placeholder="账号"
        >
          <template #prefix><svg-icon icon-class="user" class="el-input__icon input-icon" /></template>
        </el-input>
      </el-form-item>
      <el-form-item prop="password" :rules="registerPwdValidator">
        <el-input
          v-model="registerForm.password"
          type="password"
          size="large" 
          auto-complete="off"
          placeholder="密码"
          @keyup.enter="handleRegister"
        >
          <template #prefix><svg-icon icon-class="password" class="el-input__icon input-icon" /></template>
        </el-input>
      </el-form-item>
      <el-form-item prop="confirmPassword">
        <el-input
          v-model="registerForm.confirmPassword"
          type="password"
          size="large" 
          auto-complete="off"
          placeholder="确认密码"
          @keyup.enter="handleRegister"
        >
          <template #prefix><svg-icon icon-class="password" class="el-input__icon input-icon" /></template>
        </el-input>
      </el-form-item>
      <el-form-item prop="code" v-if="captchaEnabled">
        <el-input
          size="large" 
          v-model="registerForm.code"
          auto-complete="off"
          placeholder="验证码"
          style="width: 63%"
          @keyup.enter="handleRegister"
        >
          <template #prefix><svg-icon icon-class="validCode" class="el-input__icon input-icon" /></template>
        </el-input>
        <div class="register-code">
          <img :src="codeUrl" @click="getCode" class="register-code-img"/>
        </div>
      </el-form-item>
      <el-form-item style="width:100%;">
        <el-button
          :loading="loading"
          size="large" 
          type="primary"
          style="width:100%;"
          @click.prevent="handleRegister"
        >
          <span v-if="!loading">注 册</span>
          <span v-else>注 册 中...</span>
        </el-button>
        <div style="float: right;">
          <router-link class="link-type" :to="'/login'">使用已有账户登录</router-link>
        </div>
      </el-form-item>
    </el-form>
    <!--  底部  -->
    <div class="el-register-footer">
      <span>{{ footerContent }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElMessageBox } from "element-plus"
import { getCodeImg, register } from "@/api/login"
import defaultSettings from '@/settings'
import { usePasswordRule } from "@/utils/passwordRule"
import type { RegisterForm } from '@/types/api/login'

const title = import.meta.env.VITE_APP_TITLE
const footerContent = defaultSettings.footerContent
const router = useRouter()
const { proxy } = getCurrentInstance()
const { registerPwdValidator } = usePasswordRule()

const registerForm = ref<RegisterForm>({
  username: "",
  password: "",
  confirmPassword: "",
  code: "",
  uuid: ""
})

const equalToPassword = (rule: any, value: string, callback: (error?: Error) => void): void => {
  if (registerForm.value.password !== value) {
    callback(new Error("两次输入的密码不一致"))
  } else {
    callback()
  }
}

const registerRules = {
  username: [
    { required: true, trigger: "blur", message: "请输入您的账号" },
    { min: 2, max: 20, message: "用户账号长度必须介于 2 和 20 之间", trigger: "blur" }
  ],
  confirmPassword: [
    { required: true, trigger: "blur", message: "请再次输入您的密码" },
    { required: true, validator: equalToPassword, trigger: "blur" }
  ],
  code: [{ required: true, trigger: "change", message: "请输入验证码" }]
}

const codeUrl = ref<string>("")
const loading = ref<boolean>(false)
const captchaEnabled = ref<boolean>(true)

function handleRegister(): void {
  proxy.$refs.registerRef.validate((valid: boolean) => {
    if (valid) {
      loading.value = true
      register(registerForm.value).then(() => {
        const username = registerForm.value.username
        ElMessageBox.alert("<font color='red'>恭喜你，您的账号 " + username + " 注册成功！</font>", "系统提示", {
          dangerouslyUseHTMLString: true,
          type: "success",
        }).then(() => {
          router.push("/login")
        }).catch(() => {})
      }).catch(() => {
        loading.value = false
        if (captchaEnabled) {
          getCode()
        }
      })
    }
  })
}

function getCode(): void {
  getCodeImg().then(res => {
    captchaEnabled.value = res.captchaEnabled === undefined ? true : res.captchaEnabled
    if (captchaEnabled.value) {
      codeUrl.value = "data:image/gif;base64," + res.img
      registerForm.value.uuid = res.uuid
    }
  })
}

getCode()
</script>

<style lang='scss' scoped>
.register {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100%;
  overflow: hidden;
  background:
    radial-gradient(circle at 16% 12%, rgba(59, 130, 246, 0.24), transparent 28%),
    radial-gradient(circle at 82% 18%, rgba(14, 165, 233, 0.18), transparent 30%),
    linear-gradient(135deg, #071326 0%, #0f2f62 48%, #f8fbff 49%, #eef4ff 100%);
}

.register::before {
  content: "";
  position: absolute;
  inset: 24px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 32px;
  pointer-events: none;
}

.title {
  margin: 0 auto 28px;
  text-align: center;
  color: var(--studio-title);
  font-size: 26px;
  font-weight: 900;
  letter-spacing: 1px;
}

.register-form {
  position: relative;
  z-index: 1;
  width: 430px;
  padding: 34px 34px 18px;
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 28px 70px rgba(15, 23, 42, 0.22);
  backdrop-filter: blur(18px);

  .el-input {
    height: 44px;

    :deep(.el-input__wrapper) {
      border-radius: 14px;
      box-shadow: 0 0 0 1px rgba(226, 232, 240, 0.95) inset;
      background: rgba(248, 250, 252, 0.88);
    }

    input {
      height: 44px;
    }
  }

  .input-icon {
    height: 42px;
    width: 15px;
    margin-left: 2px;
    color: var(--studio-accent);
  }
}

.register-tip {
  font-size: 13px;
  text-align: center;
  color: #bfbfbf;
}

.register-code {
  width: 33%;
  height: 44px;
  float: right;

  img {
    cursor: pointer;
    vertical-align: middle;
  }
}

.el-register-footer {
  position: fixed;
  z-index: 1;
  bottom: 16px;
  width: 100%;
  text-align: center;
  color: rgba(255, 255, 255, 0.78);
  font-size: 12px;
  letter-spacing: 1px;
}

.register-code-img {
  height: 44px;
  padding-left: 12px;
  border-radius: 12px;
}
</style>
