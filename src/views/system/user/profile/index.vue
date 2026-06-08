<template>
   <div class="app-container profile-page">
      <el-row :gutter="20" class="profile-grid">
         <el-col :span="6" :xs="24">
            <el-card class="box-card profile-card">
               <template v-slot:header>
                 <div class="clearfix">
                   <span>个人信息</span>
                 </div>
               </template>
               <div>
                  <div class="text-center">
                     <userAvatar />
                  </div>
                  <ul class="list-group list-group-striped">
                     <li class="list-group-item">
                        <svg-icon icon-class="user" />用户名称
                        <div class="pull-right">{{ state.user.userName }}</div>
                     </li>
                     <li class="list-group-item">
                        <svg-icon icon-class="phone" />手机号码
                        <div class="pull-right">{{ state.user.phonenumber }}</div>
                     </li>
                     <li class="list-group-item">
                        <svg-icon icon-class="email" />用户邮箱
                        <div class="pull-right">{{ state.user.email }}</div>
                     </li>
                     <li class="list-group-item">
                        <svg-icon icon-class="tree" />所属部门
                        <div class="pull-right" v-if="state.user.dept">{{ state.user.dept.deptName }} / {{ state.postGroup }}</div>
                     </li>
                     <li class="list-group-item">
                        <svg-icon icon-class="peoples" />所属角色
                        <div class="pull-right">{{ state.roleGroup }}</div>
                     </li>
                     <li class="list-group-item">
                        <svg-icon icon-class="date" />创建日期
                        <div class="pull-right">{{ state.user.createTime }}</div>
                     </li>
                  </ul>
               </div>
            </el-card>
         </el-col>
         <el-col :span="18" :xs="24">
            <el-card class="profile-card profile-tabs-card">
               <template v-slot:header>
                 <div class="clearfix">
                   <span>基本资料</span>
                 </div>
               </template>
               <el-tabs v-model="selectedTab">
                  <el-tab-pane label="基本资料" name="userinfo">
                     <userInfo :user="state.user" />
                  </el-tab-pane>
                  <el-tab-pane label="修改密码" name="resetPwd">
                     <resetPwd />
                  </el-tab-pane>
               </el-tabs>
            </el-card>
         </el-col>
      </el-row>
   </div>
</template>

<script setup lang="ts" name="Profile">
import userAvatar from "./userAvatar.vue"
import userInfo from "./userInfo.vue"
import resetPwd from "./resetPwd.vue"
import { getUserProfile } from "@/api/system/user"
import type { SysUser } from '@/types/api/system/user'

const route = useRoute()
const selectedTab = ref<string>("userinfo")

interface UserProfileState {
  user: SysUser
  roleGroup: string
  postGroup: string
}

const state = reactive<UserProfileState>({
  user: {} as SysUser,
  roleGroup: '',
  postGroup: ''
})

function getUser() {
  getUserProfile().then(response => {
    state.user = response.data
    state.roleGroup = response.roleGroup
    state.postGroup = response.postGroup
  })
}

onMounted(() => {
  const activeTab = route.params && route.params.activeTab
  if (activeTab) {
    selectedTab.value = activeTab as string
  }
  getUser()
})
</script>

<style lang="scss" scoped>
.profile-page {
  min-height: 100%;

  :deep(.profile-grid) {
    padding: 0;
    border: 0;
    background: transparent;
    box-shadow: none;
  }
}

.profile-card {
  overflow: hidden;
  border-radius: 24px;

  :deep(.el-card__header) {
    padding: 18px 22px !important;
    border-bottom: 1px solid rgba(226, 232, 240, 0.9);
    background: linear-gradient(180deg, rgba(248, 251, 255, 0.98) 0%, rgba(255, 255, 255, 0.96) 100%);
    color: var(--studio-title);
    font-size: 16px;
    font-weight: 800;
  }

  :deep(.el-card__body) {
    padding: 22px !important;
  }
}

.profile-tabs-card {
  min-height: 520px;

  :deep(.el-tabs__header) {
    margin-bottom: 22px;
  }

  :deep(.el-tabs__item) {
    font-weight: 700;
    color: var(--studio-muted);
  }

  :deep(.el-tabs__item.is-active) {
    color: var(--studio-accent);
  }
}

.list-group-striped > .list-group-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 46px;
  border-color: rgba(226, 232, 240, 0.78);
  color: var(--studio-text);
}

.list-group-item :deep(.svg-icon) {
  margin-right: 8px;
  color: var(--studio-accent);
}

.pull-right {
  max-width: 58%;
  color: var(--studio-title);
  font-weight: 700;
  text-align: right;
}
</style>
