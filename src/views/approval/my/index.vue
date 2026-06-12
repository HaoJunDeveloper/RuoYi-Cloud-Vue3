<template>
  <div class="app-container audit-my-page">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>我的申请</span>
          <el-button type="primary" icon="Plus" @click="handleStart" v-hasPermi="['audit:instance:start']">发起申请</el-button>
        </div>
      </template>
      <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch">
        <el-form-item label="标题" prop="businessTitle">
          <el-input v-model="queryParams.businessTitle" placeholder="请输入申请标题" clearable style="width: 220px" @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="queryParams.status" clearable placeholder="全部状态" style="width: 160px" @change="handleQuery">
            <el-option label="审核中" value="1" />
            <el-option label="已通过" value="2" />
            <el-option label="已驳回" value="3" />
            <el-option label="已撤销" value="4" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
          <el-button icon="Refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table v-loading="loading" :data="instanceList">
        <template #empty>
          <el-empty description="还没有发起过审批">
            <el-button type="primary" @click="handleStart" v-hasPermi="['audit:instance:start']">去发起申请</el-button>
          </el-empty>
        </template>
        <el-table-column label="申请信息" min-width="260">
          <template #default="scope">
            <div class="main-title">{{ scope.row.businessTitle || '未命名申请' }}</div>
            <div class="sub-text">{{ scope.row.instanceNo || '-' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="业务场景" align="center" prop="businessType" width="140" />
        <el-table-column label="当前状态" align="center" prop="status" width="120">
          <template #default="scope"><el-tag :type="statusType(scope.row.status)">{{ statusText(scope.row.status) }}</el-tag></template>
        </el-table-column>
        <el-table-column label="申请时间" align="center" prop="applyTime" width="170" />
        <el-table-column label="操作" align="center" width="180">
          <template #default="scope">
            <el-button link type="primary" @click="handleDetail(scope.row)">看进度</el-button>
            <el-button link type="danger" @click="handleCancel(scope.row)" v-if="scope.row.status === '1'" v-hasPermi="['audit:instance:cancel']">撤销</el-button>
          </template>
        </el-table-column>
      </el-table>
      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>

    <el-dialog title="发起审批" v-model="open" width="860px" append-to-body class="audit-apply-dialog">
      <el-steps :active="selectedTemplate ? 1 : 0" finish-status="success" simple class="mb16">
        <el-step title="选择场景" />
        <el-step title="填写申请" />
        <el-step title="提交审批" />
      </el-steps>

      <el-row :gutter="16">
        <el-col :span="9">
          <div class="panel-title">审批场景</div>
          <el-scrollbar max-height="420px">
            <div
              v-for="item in enabledTemplates"
              :key="item.templateId"
              class="template-card"
              :class="{ active: form.templateCode === item.templateCode }"
              @click="selectTemplate(item)"
            >
              <div class="template-name">{{ item.templateName }}</div>
              <div class="template-meta">{{ item.businessType || item.templateCode }}</div>
            </div>
            <el-empty v-if="enabledTemplates.length === 0" description="暂无可用审批模板" />
          </el-scrollbar>
        </el-col>
        <el-col :span="15">
          <el-alert v-if="selectedTemplate" :title="`当前选择：${selectedTemplate.templateName}`" type="success" show-icon :closable="false" class="mb12" />
          <el-alert v-else title="请先从左侧选择审批场景" type="info" show-icon :closable="false" class="mb12" />
          <el-form ref="applyRef" :model="form" :rules="rules" label-width="96px">
            <el-form-item label="申请标题" prop="businessTitle">
              <el-input v-model="form.businessTitle" placeholder="例如：张三 6月请假申请" />
            </el-form-item>
            <el-form-item label="业务编号" prop="businessId">
              <el-input v-model="form.businessId" placeholder="可填写业务单号，不填则自动生成" />
            </el-form-item>
            <template v-if="schemaFields.length > 0">
              <el-divider content-position="left">申请内容</el-divider>
              <el-form-item v-for="field in schemaFields" :key="field.prop" :label="field.label">
                <el-select v-if="field.type === 'select'" v-model="snapshotForm[field.prop]" clearable :placeholder="field.placeholder || `请选择${field.label}`">
                  <el-option v-for="option in field.options" :key="option.value" :label="option.label" :value="option.value" />
                </el-select>
                <el-date-picker v-else-if="field.type === 'date'" v-model="snapshotForm[field.prop]" type="date" value-format="YYYY-MM-DD" :placeholder="field.placeholder || `请选择${field.label}`" />
                <el-input-number v-else-if="field.type === 'number'" v-model="snapshotForm[field.prop]" :min="0" style="width: 100%" />
                <el-input v-else v-model="snapshotForm[field.prop]" :type="field.type === 'textarea' ? 'textarea' : 'text'" :rows="3" :placeholder="field.placeholder || `请输入${field.label}`" />
              </el-form-item>
            </template>
            <template v-else>
              <el-divider content-position="left">申请内容</el-divider>
              <el-form-item label="申请说明">
                <el-input v-model="snapshotForm.reason" type="textarea" :rows="4" placeholder="请填写申请原因、时间、金额或其他必要信息" />
              </el-form-item>
            </template>
          </el-form>
        </el-col>
      </el-row>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" :disabled="!selectedTemplate" @click="submitStart">提交审批</el-button>
          <el-button @click="open = false">取消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>
<script setup lang="ts" name="AuditMy">
import { listAuditTemplate } from '@/api/approval/template'
import { listMyAuditInstance, startAudit, cancelAudit } from '@/api/approval/instance'
import type { AuditInstanceQueryParams, AuditStartRequest, SysAuditInstance, SysAuditTemplate } from '@/types'

interface SchemaOption { label: string; value: string | number }
interface SchemaField { prop: string; label: string; type?: string; placeholder?: string; options?: SchemaOption[] }

const { proxy } = getCurrentInstance()
const router = useRouter()
const route = useRoute()
const instanceList = ref<SysAuditInstance[]>([])
const templateList = ref<SysAuditTemplate[]>([])
const snapshotForm = ref<Record<string, any>>({})
const loading = ref(true)
const showSearch = ref(true)
const total = ref(0)
const open = ref(false)
const data = reactive({
  queryParams: { pageNum: 1, pageSize: 10 } as AuditInstanceQueryParams,
  form: {} as AuditStartRequest,
  rules: {
    templateCode: [{ required: true, message: '请选择审批场景', trigger: 'change' }],
    businessType: [{ required: true, message: '业务类型不能为空', trigger: 'blur' }],
    businessTitle: [{ required: true, message: '申请标题不能为空', trigger: 'blur' }]
  }
})
const { queryParams, form, rules } = toRefs(data)
const enabledTemplates = computed(() => templateList.value.filter(item => item.status !== '1'))
const selectedTemplate = computed(() => templateList.value.find(item => item.templateCode === form.value.templateCode))
const schemaFields = computed<SchemaField[]>(() => parseSchema(selectedTemplate.value?.formSchema))

function getList() {
  loading.value = true
  listMyAuditInstance(queryParams.value).then(res => {
    instanceList.value = res.rows
    total.value = res.total
    loading.value = false
  })
}
function loadTemplates() {
  listAuditTemplate({ pageNum: 1, pageSize: 100, status: '0' }).then(res => {
    templateList.value = res.rows || []
    const routeTemplateCode = route.query.templateCode as string | undefined
    if (routeTemplateCode) {
      const matched = templateList.value.find(item => item.templateCode === routeTemplateCode)
      if (matched) {
        open.value = true
        selectTemplate(matched)
      }
    }
  })
}
function handleQuery() { queryParams.value.pageNum = 1; getList() }
function resetQuery() { proxy.resetForm('queryRef'); handleQuery() }
function handleStart() {
  form.value = {}
  snapshotForm.value = {}
  open.value = true
  if (templateList.value.length === 0) loadTemplates()
}
function selectTemplate(item: SysAuditTemplate) {
  form.value.templateCode = item.templateCode
  form.value.businessType = item.businessType
  form.value.businessTitle = form.value.businessTitle || `${item.templateName || '审批'}申请`
  snapshotForm.value = {}
}
function submitStart() {
  proxy.$refs['applyRef'].validate((valid: boolean) => {
    if (!valid) return
    const payload: AuditStartRequest = {
      ...form.value,
      businessId: form.value.businessId || `AUDIT-${Date.now()}`,
      businessSnapshot: JSON.stringify(buildSnapshot(), null, 2)
    }
    startAudit(payload).then((res) => {
      proxy.$modal.msgSuccess('提交成功')
      open.value = false
      getList()
      if (res.data?.instanceId) router.push('/audit/detail/' + res.data.instanceId)
    })
  })
}
function buildSnapshot() {
  const result: Record<string, any> = {}
  schemaFields.value.forEach(field => { result[field.label] = snapshotForm.value[field.prop] ?? '' })
  if (schemaFields.value.length === 0) result['申请说明'] = snapshotForm.value.reason || ''
  return result
}
function parseSchema(schema?: string): SchemaField[] {
  if (!schema) return []
  try {
    const data = JSON.parse(schema)
    const fields = Array.isArray(data) ? data : data.fields
    if (!Array.isArray(fields)) return []
    return fields.map((item: any, index: number) => ({
      prop: item.prop || item.field || `field${index}`,
      label: item.label || item.title || `字段${index + 1}`,
      type: item.type || 'text',
      placeholder: item.placeholder,
      options: Array.isArray(item.options) ? item.options : []
    }))
  } catch {
    return []
  }
}
function handleCancel(row: SysAuditInstance) {
  proxy.$modal.confirm('确认撤销该审批？').then(() => cancelAudit(row.instanceId!)).then(() => { proxy.$modal.msgSuccess('撤销成功'); getList() })
}
function handleDetail(row: SysAuditInstance) { router.push('/audit/detail/' + row.instanceId) }
function statusText(status?: string) { return ({ '0': '草稿', '1': '审核中', '2': '已通过', '3': '已驳回', '4': '已撤销' } as Record<string, string>)[status || ''] || status }
function statusType(status?: string) { return ({ '1': 'warning', '2': 'success', '3': 'danger', '4': 'info' } as Record<string, string>)[status || ''] || 'info' }
getList()
loadTemplates()
</script>
<style lang="scss" scoped>
.audit-overview { margin-bottom: 16px; }
.overview-card { min-height: 132px; }
.overview-card.primary { background: linear-gradient(135deg, #eef5ff, #ffffff); border-color: #d9ecff; }
.overview-title { font-size: 18px; font-weight: 600; margin-bottom: 8px; }
.overview-desc { color: #666; font-size: 13px; margin-bottom: 18px; }
.card-header { display: flex; align-items: center; justify-content: space-between; }
.main-title { font-weight: 600; color: #303133; }
.sub-text { color: #909399; font-size: 12px; margin-top: 4px; }
.panel-title { font-weight: 600; margin-bottom: 10px; }
.template-card { padding: 12px; border: 1px solid #ebeef5; border-radius: 8px; margin-bottom: 10px; cursor: pointer; transition: all .15s; }
.template-card:hover, .template-card.active { border-color: var(--el-color-primary); background: #ecf5ff; }
.template-name { font-weight: 600; margin-bottom: 6px; }
.template-meta { font-size: 12px; color: #909399; }
.mb12 { margin-bottom: 12px; }
.mb16 { margin-bottom: 16px; }
</style>