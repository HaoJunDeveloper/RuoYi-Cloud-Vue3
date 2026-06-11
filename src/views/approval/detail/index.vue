<template>
  <div class="app-container">
    <el-card shadow="never" v-loading="loading">
      <template #header><span>审批详情</span></template>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="单号">{{ instance.instanceNo }}</el-descriptions-item>
        <el-descriptions-item label="标题">{{ instance.businessTitle }}</el-descriptions-item>
        <el-descriptions-item label="业务类型">{{ instance.businessType }}</el-descriptions-item>
        <el-descriptions-item label="状态">{{ statusText(instance.status) }}</el-descriptions-item>
        <el-descriptions-item label="申请人">{{ instance.applicantName }}</el-descriptions-item>
        <el-descriptions-item label="申请时间">{{ instance.applyTime }}</el-descriptions-item>
      </el-descriptions>
      <el-divider content-position="left">业务快照</el-divider>
      <el-input :model-value="instance.businessSnapshot" type="textarea" :rows="6" readonly />
      <el-divider content-position="left">审批记录</el-divider>
      <el-timeline>
        <el-timeline-item v-for="item in records" :key="item.recordId" :timestamp="item.actionTime">
          <el-card shadow="never"><div>{{ item.approverName }} - {{ actionText(item.action) }}</div><div class="text-muted">{{ item.comment }}</div></el-card>
        </el-timeline-item>
      </el-timeline>
    </el-card>
  </div>
</template>
<script setup lang="ts" name="AuditDetail">
import { getAuditInstance, listAuditRecords } from '@/api/approval/instance'
import type { SysAuditInstance, SysAuditRecord } from '@/types'
const route = useRoute()
const loading = ref(true)
const instance = ref<SysAuditInstance>({})
const records = ref<SysAuditRecord[]>([])
function getInfo() { const id = Number(route.params.instanceId); loading.value = true; Promise.all([getAuditInstance(id), listAuditRecords(id)]).then(([detail, recordRes]) => { instance.value = detail.data || {}; records.value = recordRes.data || []; loading.value = false }) }
function statusText(status?: string) { return ({ '0': '草稿', '1': '审核中', '2': '已通过', '3': '已驳回', '4': '已撤销' } as Record<string, string>)[status || ''] || status }
function actionText(action?: string) { return ({ '0': '提交', '1': '通过', '2': '驳回', '3': '转审', '4': '加签', '5': '撤销', '6': '完成' } as Record<string, string>)[action || ''] || action }
getInfo()
</script>