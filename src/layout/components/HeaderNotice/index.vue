<template>
  <div>
    <el-popover ref="noticePopover" placement="bottom-end" :width="340" trigger="manual" v-model:visible="noticeVisible" popper-class="notice-popover">
      <div class="notice-header">
        <el-tabs v-model="activeTab" class="notice-tabs" @tab-change="handleTabChange">
          <el-tab-pane label="通知公告" name="notice" />
          <el-tab-pane label="审批待办" name="audit" />
        </el-tabs>
        <span class="notice-mark-all" @click="markAllRead">全部已读</span>
      </div>

      <div v-if="noticeLoading" class="notice-loading">
        <el-icon class="is-loading"><Loading /></el-icon> 加载中...
      </div>

      <template v-else-if="activeTab === 'notice'">
        <div v-if="noticeList.length === 0" class="notice-empty">
          <el-icon style="font-size:24px;display:block;margin-bottom:6px;"><Postcard /></el-icon>
          暂无公告
        </div>
        <div v-else>
          <div v-for="item in noticeList" :key="item.noticeId" class="notice-item" :class="{ 'is-read': item.isRead }" @click="previewNotice(item)">
            <el-tag size="small" :type="item.noticeType === '1' ? 'warning' : 'success'" class="notice-tag">
              {{ item.noticeType === '1' ? '通知' : '公告' }}
            </el-tag>
            <span class="notice-item-title">{{ item.noticeTitle }}</span>
            <span class="notice-item-date">{{ item.createTime }}</span>
          </div>
        </div>
      </template>

      <template v-else>
        <div v-if="auditList.length === 0" class="notice-empty">
          <el-icon style="font-size:24px;display:block;margin-bottom:6px;"><Postcard /></el-icon>
          暂无待办
        </div>
        <div v-else>
          <div v-for="item in auditList" :key="item.msgId" class="notice-item" :class="{ 'is-read': item.isRead === '1' }" @click="openAuditMessage(item)">
            <el-tag size="small" type="danger" class="notice-tag">审批</el-tag>
            <span class="notice-item-title">{{ item.msgTitle }}：{{ item.msgContent }}</span>
            <span class="notice-item-date">{{ item.createTime }}</span>
          </div>
        </div>
      </template>

      <template #reference>
        <div class="right-menu-item hover-effect notice-trigger" @mouseenter="onNoticeEnter" @mouseleave="onNoticeLeave">
          <svg-icon icon-class="bell" />
          <span v-if="unreadCount > 0" class="notice-badge">{{ unreadCount }}</span>
        </div>
      </template>
    </el-popover>

    <notice-detail-view ref="noticeViewRef" />
  </div>
</template>

<script setup lang="ts">
import NoticeDetailView from './DetailView.vue'
import { listNoticeTop, markNoticeRead, markNoticeReadAll } from '@/api/system/notice'
import { listAuditMessageTop, markAuditMessageRead, markAuditMessageReadAll } from '@/api/approval/message'
import type { SysNotice } from '@/types/api/system/notice'
import type { SysMessage } from '@/types'

interface PopperElement extends HTMLElement {
  _noticeBound?: boolean
}

const router = useRouter()
const noticePopover = ref<InstanceType<typeof import('element-plus')['ElPopover']> | null>(null)
const noticeList = ref<SysNotice[]>([])
const auditList = ref<SysMessage[]>([])
const noticeUnreadCount = ref<number>(0)
const auditUnreadCount = ref<number>(0)
const unreadCount = computed(() => noticeUnreadCount.value + auditUnreadCount.value)
const noticeLoading = ref<boolean>(false)
const noticeVisible = ref<boolean>(false)
const activeTab = ref<'notice' | 'audit'>('notice')
const noticeLeaveTimer = ref<ReturnType<typeof setTimeout> | null>(null)
const { proxy } = getCurrentInstance()

function loadNoticeTop(): void {
  noticeLoading.value = true
  Promise.all([listNoticeTop(), listAuditMessageTop()]).then(([noticeRes, auditRes]) => {
    noticeList.value = noticeRes.data || []
    noticeUnreadCount.value = noticeRes.unreadCount !== undefined ? noticeRes.unreadCount : noticeList.value.filter((n: SysNotice) => !n.isRead).length
    auditList.value = auditRes.data || []
    auditUnreadCount.value = auditRes.unreadCount || 0
  }).finally(() => {
    noticeLoading.value = false
  })
}

onMounted(() => loadNoticeTop())

function handleTabChange(): void {
  loadNoticeTop()
}

function onNoticeEnter(): void {
  clearTimeout(noticeLeaveTimer.value ?? undefined)
  noticeVisible.value = true
  nextTick(() => {
    const popper = (noticePopover.value as any)?.popperRef?.contentRef as PopperElement | undefined
    if (popper && !popper._noticeBound) {
      popper._noticeBound = true
      popper.addEventListener('mouseenter', () => clearTimeout(noticeLeaveTimer.value ?? undefined))
      popper.addEventListener('mouseleave', () => {
        noticeLeaveTimer.value = setTimeout(() => { noticeVisible.value = false }, 100)
      })
    }
  })
}

function onNoticeLeave(): void {
  noticeLeaveTimer.value = setTimeout(() => { noticeVisible.value = false }, 150)
}

function previewNotice(item: SysNotice): void {
  if (!item.isRead) {
    markNoticeRead(item.noticeId!).catch(() => {})
    const idx = noticeList.value.indexOf(item)
    if (idx !== -1) noticeList.value[idx] = { ...item, isRead: true }
    noticeUnreadCount.value = Math.max(0, noticeUnreadCount.value - 1)
  }
  proxy.$refs["noticeViewRef"].open(item.noticeId)
}

function openAuditMessage(item: SysMessage): void {
  if (item.isRead !== '1') {
    markAuditMessageRead(item.msgId!).catch(() => {})
    const idx = auditList.value.indexOf(item)
    if (idx !== -1) auditList.value[idx] = { ...item, isRead: '1' }
    auditUnreadCount.value = Math.max(0, auditUnreadCount.value - 1)
  }
  noticeVisible.value = false
  if (item.bizId) {
    router.push('/audit/detail/' + item.bizId)
  }
}

function markAllRead(): void {
  if (activeTab.value === 'notice') {
    const ids = noticeList.value.map((n: SysNotice) => n.noticeId).join(',')
    if (!ids) return
    markNoticeReadAll(ids).catch(() => {})
    noticeList.value = noticeList.value.map((n: SysNotice) => ({ ...n, isRead: true }))
    noticeUnreadCount.value = 0
    return
  }
  markAuditMessageReadAll().catch(() => {})
  auditList.value = auditList.value.map((n: SysMessage) => ({ ...n, isRead: '1' }))
  auditUnreadCount.value = 0
}
</script>

<style lang="scss" scoped>
.notice-trigger {
  position: relative;
  transform: translateX(-6px);
  .svg-icon { width: 1.2em; height: 1.2em; vertical-align: -0.2em; }
  .notice-badge {
    position: absolute;
    top: 7px;
    right: -3px;
    background: #f56c6c;
    color: #fff;
    border-radius: 10px;
    font-size: 10px;
    height: 16px;
    line-height: 16px;
    padding: 0 4px;
    min-width: 16px;
    text-align: center;
    white-space: nowrap;
    pointer-events: none;
  }
}
.notice-popover { padding: 0 !important; }
.notice-popover .notice-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  background: #f7f9fb;
  border-bottom: 1px solid #eee;
}
.notice-tabs { flex: 1; }
.notice-tabs :deep(.el-tabs__header) { margin: 0; }
.notice-tabs :deep(.el-tabs__nav-wrap::after) { display: none; }
.notice-popover .notice-mark-all {
  font-size: 12px;
  color: var(--el-color-primary);
  cursor: pointer;
  padding-left: 10px;
}
.notice-popover .notice-loading,
.notice-popover .notice-empty {
  padding: 24px;
  text-align: center;
  color: #bbb;
  font-size: 12px;
  line-height: 1.8;
}
.notice-popover .notice-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-bottom: 1px solid #f5f5f5;
  cursor: pointer;
  transition: background 0.15s;
}
.notice-popover .notice-item:last-child { border-bottom: none; }
.notice-popover .notice-item:hover { background: #f7f9fb; }
.notice-popover .notice-item.is-read .notice-tag,
.notice-popover .notice-item.is-read .notice-item-title,
.notice-popover .notice-item.is-read .notice-item-date { opacity: 0.45; filter: grayscale(1); color: #999; }
.notice-popover .notice-tag { flex-shrink: 0; }
.notice-popover .notice-item-title {
  flex: 1;
  font-size: 12px;
  color: #333;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.notice-popover .notice-item-date {
  flex-shrink: 0;
  font-size: 11px;
  color: #bbb;
}
</style>