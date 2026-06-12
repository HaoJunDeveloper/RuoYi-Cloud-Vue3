<template>
  <div class="app-container audit-template-page">
    <el-card shadow="never">
      <template #header><div class="card-header"><span>审批模板</span><el-button type="primary" icon="Plus" @click="handleAdd" v-hasPermi="['audit:template:add']">新增模板</el-button></div></template>
      <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch">
        <el-form-item label="模板名称" prop="templateName"><el-input v-model="queryParams.templateName" placeholder="请输入模板名称" clearable style="width: 200px" @keyup.enter="handleQuery" /></el-form-item>
        <el-form-item label="业务类型" prop="businessType"><el-input v-model="queryParams.businessType" placeholder="如 leave、expense" clearable style="width: 200px" @keyup.enter="handleQuery" /></el-form-item>
        <el-form-item><el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button><el-button icon="Refresh" @click="resetQuery">重置</el-button></el-form-item>
      </el-form>
      <el-row :gutter="10" class="mb8">
        <el-col :span="1.5"><el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate" v-hasPermi="['audit:template:edit']">修改</el-button></el-col>
        <el-col :span="1.5"><el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete" v-hasPermi="['audit:template:remove']">删除</el-button></el-col>
        <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" />
      </el-row>
      <el-table v-loading="loading" :data="templateList" @selection-change="handleSelectionChange">
        <template #empty><el-empty description="暂无审批模板"><el-button type="primary" @click="handleAdd" v-hasPermi="['audit:template:add']">创建第一个模板</el-button></el-empty></template>
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="模板信息" min-width="240"><template #default="scope"><div class="main-title">{{ scope.row.templateName }}</div><div class="sub-text">{{ scope.row.templateCode }}</div></template></el-table-column>
        <el-table-column label="业务场景" align="center" prop="businessType" width="140" />
        <el-table-column label="状态" align="center" prop="status" width="100"><template #default="scope"><el-tag :type="scope.row.status === '0' ? 'success' : 'info'">{{ scope.row.status === '0' ? '可发起' : '已停用' }}</el-tag></template></el-table-column>
        <el-table-column label="创建时间" align="center" prop="createTime" width="160" />
        <el-table-column label="联动操作" align="center" width="260"><template #default="scope"><el-button link type="primary" @click="goFlow(scope.row)">配置流程</el-button><el-button link type="primary" @click="goApply(scope.row)">发起申请</el-button><el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['audit:template:edit']">修改</el-button><el-button link type="danger" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['audit:template:remove']">删除</el-button></template></el-table-column>
      </el-table>
      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>

    <el-dialog :title="title" v-model="open" width="920px" append-to-body>
      <el-alert title="只需要配置字段和通知开关，系统会自动生成表单配置和通知配置。" type="info" show-icon :closable="false" class="mb12" />
      <el-form ref="templateRef" :model="form" :rules="rules" label-width="100px">
        <el-row :gutter="12">
          <el-col :span="12"><el-form-item label="模板编码" prop="templateCode"><el-input v-model="form.templateCode" placeholder="如 leave_apply" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="模板名称" prop="templateName"><el-input v-model="form.templateName" placeholder="如 请假申请" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="业务类型" prop="businessType"><el-input v-model="form.businessType" placeholder="如 leave" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="状态"><el-radio-group v-model="form.status"><el-radio value="0">可发起</el-radio><el-radio value="1">停用</el-radio></el-radio-group></el-form-item></el-col>
        </el-row>

        <el-divider content-position="left">申请表单字段</el-divider>
        <el-table :data="formFields" border size="small">
          <el-table-column label="字段名称" min-width="160"><template #default="scope"><el-input v-model="scope.row.label" placeholder="如 请假天数" /></template></el-table-column>
          <el-table-column label="字段标识" min-width="150"><template #default="scope"><el-input v-model="scope.row.prop" placeholder="如 days" /></template></el-table-column>
          <el-table-column label="字段类型" width="130"><template #default="scope"><el-select v-model="scope.row.type"><el-option label="文本" value="text" /><el-option label="多行文本" value="textarea" /><el-option label="数字" value="number" /><el-option label="日期" value="date" /><el-option label="下拉选择" value="select" /></el-select></template></el-table-column>
          <el-table-column label="提示文案" min-width="160"><template #default="scope"><el-input v-model="scope.row.placeholder" placeholder="用户填写时的提示" /></template></el-table-column>
          <el-table-column label="选项" min-width="180"><template #default="scope"><el-input v-model="scope.row.optionsText" :disabled="scope.row.type !== 'select'" placeholder="如 事假,病假,年假" /></template></el-table-column>
          <el-table-column label="必填" width="80"><template #default="scope"><el-switch v-model="scope.row.required" /></template></el-table-column>
          <el-table-column label="操作" width="80"><template #default="scope"><el-button link type="danger" @click="removeField(scope.$index)">删除</el-button></template></el-table-column>
        </el-table>
        <el-button class="mt10" type="primary" plain icon="Plus" @click="addField">添加字段</el-button>

        <el-divider content-position="left">通知配置</el-divider>
        <el-checkbox-group v-model="notifyEvents">
          <el-checkbox label="submit">提交后通知审批人</el-checkbox>
          <el-checkbox label="pass">通过后通知申请人</el-checkbox>
          <el-checkbox label="reject">驳回后通知申请人</el-checkbox>
          <el-checkbox label="cancel">撤销后通知审批人</el-checkbox>
        </el-checkbox-group>
        <el-form-item label="备注" class="mt16"><el-input v-model="form.remark" type="textarea" /></el-form-item>
      </el-form>
      <template #footer><div class="dialog-footer"><el-button type="primary" @click="submitForm">确 定</el-button><el-button @click="cancel">取 消</el-button></div></template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="AuditTemplate">
import { listAuditTemplate, getAuditTemplate, addAuditTemplate, updateAuditTemplate, delAuditTemplate } from '@/api/approval/template'
import type { AuditTemplateQueryParams, SysAuditTemplate } from '@/types'

interface FormFieldConfig { prop: string; label: string; type: string; placeholder?: string; required: boolean; optionsText?: string }

const { proxy } = getCurrentInstance()
const router = useRouter()
const templateList = ref<SysAuditTemplate[]>([])
const formFields = ref<FormFieldConfig[]>([])
const notifyEvents = ref<string[]>(['submit', 'pass', 'reject'])
const loading = ref(true)
const showSearch = ref(true)
const ids = ref<number[]>([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const open = ref(false)
const title = ref('')
const data = reactive({
  form: {} as SysAuditTemplate,
  queryParams: { pageNum: 1, pageSize: 10 } as AuditTemplateQueryParams,
  rules: {
    templateCode: [{ required: true, message: '模板编码不能为空', trigger: 'blur' }],
    templateName: [{ required: true, message: '模板名称不能为空', trigger: 'blur' }],
    businessType: [{ required: true, message: '业务类型不能为空', trigger: 'blur' }]
  }
})
const { queryParams, form, rules } = toRefs(data)

function getList() {
  loading.value = true
  listAuditTemplate(queryParams.value).then(res => { templateList.value = res.rows; total.value = res.total; loading.value = false })
}
function cancel() { open.value = false; reset() }
function reset() { form.value = { status: '0' }; formFields.value = defaultFields(); notifyEvents.value = ['submit', 'pass', 'reject'] }
function handleQuery() { queryParams.value.pageNum = 1; getList() }
function resetQuery() { proxy.resetForm('queryRef'); handleQuery() }
function handleSelectionChange(selection: SysAuditTemplate[]) { ids.value = selection.map(item => item.templateId!); single.value = selection.length !== 1; multiple.value = !selection.length }
function handleAdd() { reset(); open.value = true; title.value = '添加审批模板' }
function handleUpdate(row?: SysAuditTemplate) {
  reset()
  const id = row?.templateId || ids.value[0]
  getAuditTemplate(id!).then(res => {
    form.value = res.data || {}
    formFields.value = parseFormSchema(form.value.formSchema)
    notifyEvents.value = parseNotifyConfig(form.value.notifyConfig)
    open.value = true
    title.value = '修改审批模板'
  })
}
function addField() { formFields.value.push({ prop: '', label: '', type: 'text', required: false }) }
function removeField(index: number) { formFields.value.splice(index, 1) }
function submitForm() {
  proxy.$refs['templateRef'].validate((valid: boolean) => {
    if (!valid) return
    form.value.formSchema = buildFormSchema()
    form.value.notifyConfig = buildNotifyConfig()
    const req = form.value.templateId ? updateAuditTemplate(form.value) : addAuditTemplate(form.value)
    req.then(() => { proxy.$modal.msgSuccess('操作成功'); open.value = false; getList() })
  })
}
function buildFormSchema() {
  const fields = formFields.value.filter(item => item.prop && item.label).map(item => ({
    prop: item.prop,
    label: item.label,
    type: item.type,
    placeholder: item.placeholder,
    required: item.required,
    options: item.type === 'select' ? (item.optionsText || '').split(',').map(text => text.trim()).filter(Boolean).map(text => ({ label: text, value: text })) : undefined
  }))
  return JSON.stringify({ fields })
}
function buildNotifyConfig() { return JSON.stringify({ channel: ['IN_APP'], events: notifyEvents.value }) }
function parseFormSchema(schema?: string): FormFieldConfig[] {
  if (!schema) return defaultFields()
  try {
    const data = JSON.parse(schema)
    const fields = Array.isArray(data) ? data : data.fields
    if (!Array.isArray(fields) || fields.length === 0) return defaultFields()
    return fields.map((item: any) => ({ prop: item.prop || item.field || '', label: item.label || item.title || '', type: item.type || 'text', placeholder: item.placeholder || '', required: !!item.required, optionsText: Array.isArray(item.options) ? item.options.map((option: any) => option.label || option.value).join(',') : '' }))
  } catch { return defaultFields() }
}
function parseNotifyConfig(config?: string) {
  if (!config) return ['submit', 'pass', 'reject']
  try { const data = JSON.parse(config); return Array.isArray(data.events) ? data.events : ['submit', 'pass', 'reject'] } catch { return ['submit', 'pass', 'reject'] }
}
function defaultFields(): FormFieldConfig[] { return [{ prop: 'reason', label: '申请原因', type: 'textarea', required: true }] }
function handleDelete(row?: SysAuditTemplate) { const templateIds = row?.templateId || ids.value; proxy.$modal.confirm('是否确认删除审批模板编号为"' + templateIds + '"的数据项？').then(() => delAuditTemplate(templateIds)).then(() => { getList(); proxy.$modal.msgSuccess('删除成功') }) }
function goFlow(row: SysAuditTemplate) { router.push({ path: '/audit/flow', query: { templateId: row.templateId, templateName: row.templateName } }) }
function goApply(row: SysAuditTemplate) { router.push({ path: '/audit/my', query: { templateCode: row.templateCode } }) }
getList()
</script>
<style lang="scss" scoped>
.template-guide { margin-bottom: 16px; }
.guide-card { min-height: 108px; }
.guide-card.primary { background: linear-gradient(135deg, #eef5ff, #ffffff); border-color: #d9ecff; }
.guide-title { font-size: 17px; font-weight: 600; margin-bottom: 8px; }
.guide-desc { color: #666; font-size: 13px; line-height: 1.7; }
.card-header { display: flex; align-items: center; justify-content: space-between; }
.main-title { font-weight: 600; color: #303133; }
.sub-text { color: #909399; font-size: 12px; margin-top: 4px; }
.mb8 { margin-bottom: 8px; }
.mb12 { margin-bottom: 12px; }
.mt10 { margin-top: 10px; }
.mt16 { margin-top: 16px; }
</style>