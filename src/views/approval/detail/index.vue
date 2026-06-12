<template>
  <div class="app-container audit-detail-page">
    <el-card shadow="never" v-loading="loading" class="detail-hero">
      <div class="hero-main">
        <div>
          <div class="hero-title">{{ instance.businessTitle || '审批详情' }}</div>
          <div class="hero-sub">{{ instance.instanceNo || '-' }} · {{ instance.businessType || '未分类' }}</div>
        </div>
        <el-tag size="large" :type="statusType(instance.status)">{{ statusText(instance.status) }}</el-tag>
      </div>
      <el-steps :active="stepActive" finish-status="success" process-status="process" simple class="mt16">
        <el-step title="已提交" />
        <el-step title="审批中" />
        <el-step :title="finishStepTitle" />
      </el-steps>
    </el-card>

    <el-row :gutter="16" class="mt16">
      <el-col :span="16">
        <el-card shadow="never">
          <template #header><div class="card-header"><span>申请内容</span><el-button text type="primary" @click="goMy">返回我的申请</el-button></div></template>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="申请人">{{ instance.applicantName || '-' }}</el-descriptions-item>
            <el-descriptions-item label="申请时间">{{ instance.applyTime || '-' }}</el-descriptions-item>
            <el-descriptions-item label="业务编号">{{ instance.businessId || '-' }}</el-descriptions-item>
            <el-descriptions-item label="完成时间">{{ instance.finishTime || '-' }}</el-descriptions-item>
          </el-descriptions>

          <el-divider content-position="left">业务信息</el-divider>
          <el-descriptions v-if="snapshotItems.length > 0" :column="2" border>
            <el-descriptions-item v-for="item in snapshotItems" :key="item.label" :label="item.label">{{ item.value || '-' }}</el-descriptions-item>
          </el-descriptions>
          <el-input v-else :model-value="instance.businessSnapshot" type="textarea" :rows="6" readonly placeholder="暂无业务快照" />
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card shadow="never">
          <template #header><span>处理流转</span></template>
          <el-timeline v-if="records.length > 0">
            <el-timeline-item v-for="item in records" :key="item.recordId" :timestamp="item.actionTime" :type="recordType(item.action)">
              <div class="record-title">{{ item.approverName || '系统' }} · {{ actionText(item.action) }}</div>
              <div class="record-comment">{{ item.comment || '无审批意见' }}</div>
            </el-timeline-item>
          </el-timeline>
          <el-empty v-else description="暂无审批记录" />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>
<script setup lang="ts" name="AuditDetail">
import { getAuditInstance, listAuditRecords } from '@/api/approval/instance'
import type { SysAuditInstance, SysAuditRecord } from '@/types'

const route = useRoute()
const router = useRouter()
const loading = ref(true)
const instance = ref<SysAuditInstance>({})
const records = ref<SysAuditRecord[]>([])
const snapshotItems = computed(() => parseSnapshot(instance.value.businessSnapshot))
const stepActive = computed(() => {
  if (['2', '3', '4'].includes(instance.value.status || '')) return 3
  if (instance.value.status === '1') return 2
  return 1
})
const finishStepTitle = computed(() => {
  if (instance.value.status === '2') return '已通过'
  if (instance.value.status === '3') return '已驳回'
  if (instance.value.status === '4') return '已撤销'
  return '待完成'
})

function getInfo() {
  const id = Number(route.params.instanceId)
  loading.value = true
  Promise.all([getAuditInstance(id), listAuditRecords(id)]).then(([detail, recordRes]) => {
    instance.value = detail.data || {}
    records.value = recordRes.data || []
    loading.value = false
  })
}
function parseSnapshot(snapshot?: string) {
  if (!snapshot) return []
  try {
    const data = JSON.parse(snapshot)
    if (!data || typeof data !== 'object' || Array.isArray(data)) return []
    return Object.keys(data).map(key => ({ label: key, value: formatValue(data[key]) }))
  } catch {
    return []
  }
}
function formatValue(value: any) {
  if (value === null || value === undefined) return ''
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}
function goMy() { router.push('/audit/my') }
function statusText(status?: string) { return ({ '0': '草稿', '1': '审核中', '2': '已通过', '3': '已驳回', '4': '已撤销' } as Record<string, string>)[status || ''] || status }
function statusType(status?: string) { return ({ '1': 'warning', '2': 'success', '3': 'danger', '4': 'info' } as Record<string, string>)[status || ''] || 'info' }
function actionText(action?: string) { return ({ '0': '提交', '1': '通过', '2': '驳回', '3': '转审', '4': '加签', '5': '撤销', '6': '完成' } as Record<string, string>)[action || ''] || action }
function recordType(action?: string) { return ({ '1': 'success', '2': 'danger', '5': 'info', '6': 'success' } as Record<string, string>)[action || ''] || 'primary' }
getInfo()
</script>
<style lang="scss" scoped>
.detail-hero { background: linear-gradient(135deg, #f5f9ff, #ffffff); }
.hero-main { display: flex; align-items: center; justify-content: space-between; }
.hero-title { font-size: 22px; font-weight: 700; color: #303133; margin-bottom: 8px; }
.hero-sub { color: #909399; font-size: 13px; }
.card-header { display: flex; align-items: center; justify-content: space-between; }
.record-title { font-weight: 600; color: #303133; margin-bottom: 6px; }
.record-comment { color: #606266; font-size: 13px; line-height: 1.6; }
.mt16 { margin-top: 16px; }
</style>