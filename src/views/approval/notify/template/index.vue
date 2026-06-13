<template>
  <div class="app-container notify-template-page">
    <el-card shadow="never">
      <template #header><div class="card-header"><span>通知模板配置</span><el-button type="primary" icon="Plus" @click="handleAdd" v-hasPermi="['audit:notify:template:add']">新增模板</el-button></div></template>
      <el-alert title="模板按 审批模板编码 + 事件 + 渠道 匹配，支持变量：${businessTitle}、${applicantName}、${content}、${instanceId}。" type="info" show-icon :closable="false" class="mb12" />
      <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch">
        <el-form-item label="审批模板" prop="templateCode"><el-input v-model="queryParams.templateCode" placeholder="如 leave_apply" clearable style="width: 180px" @keyup.enter="handleQuery" /></el-form-item>
        <el-form-item label="事件" prop="eventCode"><el-select v-model="queryParams.eventCode" placeholder="全部" clearable style="width: 130px"><el-option v-for="item in eventOptions" :key="item.value" :label="item.label" :value="item.value" /></el-select></el-form-item>
        <el-form-item label="渠道" prop="channelCode"><el-select v-model="queryParams.channelCode" placeholder="全部" clearable style="width: 150px"><el-option v-for="item in channelOptions" :key="item.value" :label="item.label" :value="item.value" /></el-select></el-form-item>
        <el-form-item><el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button><el-button icon="Refresh" @click="resetQuery">重置</el-button></el-form-item>
      </el-form>
      <el-row :gutter="10" class="mb8">
        <el-col :span="1.5"><el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate" v-hasPermi="['audit:notify:template:edit']">修改</el-button></el-col>
        <el-col :span="1.5"><el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete" v-hasPermi="['audit:notify:template:remove']">删除</el-button></el-col>
        <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" />
      </el-row>
      <el-table v-loading="loading" :data="templateList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="匹配范围" min-width="260"><template #default="scope"><div class="main-title">{{ scope.row.templateCode }}</div><div class="sub-text">{{ eventLabel(scope.row.eventCode) }} / {{ channelLabel(scope.row.channelCode) }}</div></template></el-table-column>
        <el-table-column label="标题模板" prop="titleTemplate" min-width="220" show-overflow-tooltip />
        <el-table-column label="内容模板" prop="contentTemplate" min-width="320" show-overflow-tooltip />
        <el-table-column label="状态" align="center" width="100"><template #default="scope"><el-tag :type="scope.row.status === '0' ? 'success' : 'info'">{{ scope.row.status === '0' ? '启用' : '停用' }}</el-tag></template></el-table-column>
        <el-table-column label="操作" align="center" width="180"><template #default="scope"><el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['audit:notify:template:edit']">修改</el-button><el-button link type="danger" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['audit:notify:template:remove']">删除</el-button></template></el-table-column>
      </el-table>
      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>

    <el-dialog :title="title" v-model="open" width="760px" append-to-body>
      <el-form ref="templateRef" :model="form" :rules="rules" label-width="110px">
        <el-row :gutter="12">
          <el-col :span="12"><el-form-item label="审批模板编码" prop="templateCode"><el-input v-model="form.templateCode" placeholder="如 leave_apply" :disabled="!!form.templateId" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="通知事件" prop="eventCode"><el-select v-model="form.eventCode" :disabled="!!form.templateId"><el-option v-for="item in eventOptions" :key="item.value" :label="item.label" :value="item.value" /></el-select></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="通知渠道" prop="channelCode"><el-select v-model="form.channelCode" :disabled="!!form.templateId"><el-option v-for="item in channelOptions" :key="item.value" :label="item.label" :value="item.value" /></el-select></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="状态"><el-radio-group v-model="form.status"><el-radio value="0">启用</el-radio><el-radio value="1">停用</el-radio></el-radio-group></el-form-item></el-col>
        </el-row>
        <el-form-item label="标题模板" prop="titleTemplate"><el-input v-model="form.titleTemplate" placeholder="如 审批通过通知" /></el-form-item>
        <el-form-item label="内容模板" prop="contentTemplate"><el-input v-model="form.contentTemplate" type="textarea" :rows="6" placeholder="如 ${businessTitle}已通过，申请人：${applicantName}" /></el-form-item>
        <el-form-item label="常用变量"><el-space wrap><el-tag v-for="item in variables" :key="item" class="var-tag" @click="copyVar(item)">{{ item }}</el-tag></el-space></el-form-item>
        <el-form-item label="备注"><el-input v-model="form.remark" type="textarea" /></el-form-item>
      </el-form>
      <template #footer><div class="dialog-footer"><el-button type="primary" @click="submitForm">确 定</el-button><el-button @click="cancel">取 消</el-button></div></template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="NotifyTemplate">
import { addNotifyTemplate, delNotifyTemplate, getNotifyTemplate, listNotifyTemplate, updateNotifyTemplate } from '@/api/approval/notify'
import type { NotifyTemplateQueryParams, SysNotifyTemplate } from '@/types'

const { proxy } = getCurrentInstance()
const templateList = ref<SysNotifyTemplate[]>([])
const loading = ref(true)
const showSearch = ref(true)
const ids = ref<number[]>([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const open = ref(false)
const title = ref('')
const eventOptions = [
  { label: '提交', value: 'submit' },
  { label: '通过', value: 'pass' },
  { label: '驳回', value: 'reject' },
  { label: '撤销', value: 'cancel' }
]
const channelOptions = [
  { label: '站内消息', value: 'IN_APP' },
  { label: '短信', value: 'SMS' },
  { label: '邮件', value: 'EMAIL' },
  { label: '企业微信', value: 'WECHAT_WORK' }
]
const variables = ['${businessTitle}', '${applicantName}', '${content}', '${instanceId}', '${businessType}', '${businessId}', '${event}']
const data = reactive({
  form: {} as SysNotifyTemplate,
  queryParams: { pageNum: 1, pageSize: 10 } as NotifyTemplateQueryParams,
  rules: {
    templateCode: [{ required: true, message: '审批模板编码不能为空', trigger: 'blur' }],
    eventCode: [{ required: true, message: '通知事件不能为空', trigger: 'change' }],
    channelCode: [{ required: true, message: '通知渠道不能为空', trigger: 'change' }],
    titleTemplate: [{ required: true, message: '标题模板不能为空', trigger: 'blur' }],
    contentTemplate: [{ required: true, message: '内容模板不能为空', trigger: 'blur' }]
  }
})
const { queryParams, form, rules } = toRefs(data)

function getList() { loading.value = true; listNotifyTemplate(queryParams.value).then(res => { templateList.value = res.rows; total.value = res.total; loading.value = false }) }
function cancel() { open.value = false; reset() }
function reset() { form.value = { status: '0', eventCode: 'submit', channelCode: 'IN_APP' } }
function handleQuery() { queryParams.value.pageNum = 1; getList() }
function resetQuery() { proxy.resetForm('queryRef'); handleQuery() }
function handleSelectionChange(selection: SysNotifyTemplate[]) { ids.value = selection.map(item => item.templateId!); single.value = selection.length !== 1; multiple.value = !selection.length }
function handleAdd() { reset(); open.value = true; title.value = '新增通知模板' }
function handleUpdate(row?: SysNotifyTemplate) { reset(); const id = row?.templateId || ids.value[0]; getNotifyTemplate(id!).then(res => { form.value = res.data || {}; open.value = true; title.value = '修改通知模板' }) }
function submitForm() { proxy.$refs['templateRef'].validate((valid: boolean) => { if (!valid) return; const req = form.value.templateId ? updateNotifyTemplate(form.value) : addNotifyTemplate(form.value); req.then(() => { proxy.$modal.msgSuccess('操作成功'); open.value = false; getList() }) }) }
function handleDelete(row?: SysNotifyTemplate) { const templateIds = row?.templateId || ids.value; proxy.$modal.confirm('是否确认删除通知模板编号为"' + templateIds + '"的数据项？').then(() => delNotifyTemplate(templateIds)).then(() => { getList(); proxy.$modal.msgSuccess('删除成功') }) }
function eventLabel(value?: string) { return eventOptions.find(item => item.value === value)?.label || value }
function channelLabel(value?: string) { return channelOptions.find(item => item.value === value)?.label || value }
function copyVar(value: string) { proxy.$modal.msgSuccess('可复制变量：' + value) }
getList()
</script>

<style lang="scss" scoped>
.card-header { display: flex; align-items: center; justify-content: space-between; }
.main-title { font-weight: 600; color: #303133; }
.sub-text { color: #909399; font-size: 12px; margin-top: 4px; }
.mb8 { margin-bottom: 8px; }
.mb12 { margin-bottom: 12px; }
.var-tag { cursor: pointer; }
</style>
