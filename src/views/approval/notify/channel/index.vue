<template>
  <div class="app-container notify-page">
    <el-card shadow="never">
      <template #header><div class="card-header"><span>通知渠道配置</span><el-button type="primary" icon="Plus" @click="handleAdd" v-hasPermi="['audit:notify:channel:add']">新增渠道</el-button></div></template>
      <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch">
        <el-form-item label="渠道编码" prop="channelCode"><el-input v-model="queryParams.channelCode" placeholder="如 SMS" clearable style="width: 180px" @keyup.enter="handleQuery" /></el-form-item>
        <el-form-item label="渠道名称" prop="channelName"><el-input v-model="queryParams.channelName" placeholder="请输入渠道名称" clearable style="width: 180px" @keyup.enter="handleQuery" /></el-form-item>
        <el-form-item label="状态" prop="status"><el-select v-model="queryParams.status" placeholder="全部" clearable style="width: 120px"><el-option label="启用" value="0" /><el-option label="停用" value="1" /></el-select></el-form-item>
        <el-form-item><el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button><el-button icon="Refresh" @click="resetQuery">重置</el-button></el-form-item>
      </el-form>
      <el-row :gutter="10" class="mb8">
        <el-col :span="1.5"><el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate" v-hasPermi="['audit:notify:channel:edit']">修改</el-button></el-col>
        <el-col :span="1.5"><el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete" v-hasPermi="['audit:notify:channel:remove']">删除</el-button></el-col>
        <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" />
      </el-row>
      <el-table v-loading="loading" :data="channelList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="渠道" min-width="220"><template #default="scope"><div class="main-title">{{ scope.row.channelName }}</div><div class="sub-text">{{ scope.row.channelCode }}</div></template></el-table-column>
        <el-table-column label="状态" align="center" width="100"><template #default="scope"><el-tag :type="scope.row.status === '0' ? 'success' : 'info'">{{ scope.row.status === '0' ? '启用' : '停用' }}</el-tag></template></el-table-column>
        <el-table-column label="配置摘要" min-width="360"><template #default="scope"><el-text truncated>{{ formatConfigSummary(scope.row) }}</el-text></template></el-table-column>
        <el-table-column label="更新时间" align="center" prop="updateTime" width="160" />
        <el-table-column label="操作" align="center" width="180"><template #default="scope"><el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['audit:notify:channel:edit']">修改</el-button><el-button link type="danger" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['audit:notify:channel:remove']">删除</el-button></template></el-table-column>
      </el-table>
      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>

    <el-dialog :title="title" v-model="open" width="820px" append-to-body>
      <el-alert title="按渠道类型填写配置，保存时会自动生成渠道配置 JSON。" type="info" show-icon :closable="false" class="mb12" />
      <el-form ref="channelRef" :model="form" :rules="rules" label-width="110px">
        <el-row :gutter="12">
          <el-col :span="12"><el-form-item label="渠道编码" prop="channelCode"><el-select v-model="form.channelCode" placeholder="请选择渠道" :disabled="!!form.channelId" style="width: 100%" @change="handleChannelCodeChange"><el-option v-for="item in channelOptions" :key="item.value" :label="item.label" :value="item.value" /></el-select></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="渠道名称" prop="channelName"><el-input v-model="form.channelName" placeholder="如 短信" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="状态"><el-radio-group v-model="form.status"><el-radio value="0">启用</el-radio><el-radio value="1">停用</el-radio></el-radio-group></el-form-item></el-col>
        </el-row>

        <template v-if="form.channelCode === 'SMS'">
          <el-divider content-position="left">短信配置</el-divider>
          <el-row :gutter="12">
            <el-col :span="24"><el-form-item label="网关地址" prop="configForm.url"><el-input v-model="configForm.url" placeholder="https://example.com/sms/send" /></el-form-item></el-col>
            <el-col :span="12"><el-form-item label="访问令牌"><el-input v-model="configForm.accessToken" type="password" show-password placeholder="Bearer token 可选" /></el-form-item></el-col>
            <el-col :span="12"><el-form-item label="短信签名"><el-input v-model="configForm.signName" placeholder="如 若依审批" /></el-form-item></el-col>
            <el-col :span="12"><el-form-item label="模板编码"><el-input v-model="configForm.templateCode" placeholder="如 AUDIT_NOTIFY" /></el-form-item></el-col>
          </el-row>
        </template>

        <template v-else-if="form.channelCode === 'EMAIL'">
          <el-divider content-position="left">邮件配置</el-divider>
          <el-row :gutter="12">
            <el-col :span="24"><el-form-item label="网关地址" prop="configForm.url"><el-input v-model="configForm.url" placeholder="https://example.com/email/send" /></el-form-item></el-col>
            <el-col :span="12"><el-form-item label="访问令牌"><el-input v-model="configForm.accessToken" type="password" show-password placeholder="Bearer token 可选" /></el-form-item></el-col>
            <el-col :span="12"><el-form-item label="发件人"><el-input v-model="configForm.from" placeholder="noreply@example.com" /></el-form-item></el-col>
          </el-row>
        </template>

        <template v-else-if="form.channelCode === 'WECHAT_WORK'">
          <el-divider content-position="left">企业微信配置</el-divider>
          <el-row :gutter="12">
            <el-col :span="24"><el-form-item label="机器人地址" prop="configForm.webhookUrl"><el-input v-model="configForm.webhookUrl" placeholder="https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=..." /></el-form-item></el-col>
            <el-col :span="12"><el-form-item label="指定成员"><el-input v-model="configForm.toUser" placeholder="可选，留空则使用接收人用户ID" /></el-form-item></el-col>
          </el-row>
        </template>

        <template v-else>
          <el-divider content-position="left">自定义配置</el-divider>
          <el-form-item label="渠道配置" prop="channelConfig"><el-input v-model="form.channelConfig" type="textarea" :rows="8" placeholder='{"url":"","accessToken":""}' /></el-form-item>
        </template>

        <el-form-item label="配置预览"><el-input :model-value="configPreview" type="textarea" :rows="6" readonly /></el-form-item>
        <el-form-item label="备注"><el-input v-model="form.remark" type="textarea" /></el-form-item>
      </el-form>
      <template #footer><div class="dialog-footer"><el-button type="primary" @click="submitForm">确 定</el-button><el-button @click="cancel">取 消</el-button></div></template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="NotifyChannel">
import { addNotifyChannel, delNotifyChannel, getNotifyChannel, listNotifyChannel, updateNotifyChannel } from '@/api/approval/notify'
import type { NotifyChannelQueryParams, SysNotifyChannel } from '@/types'

type ChannelCode = 'IN_APP' | 'SMS' | 'EMAIL' | 'WECHAT_WORK'
type ChannelConfig = Record<string, string>

const { proxy } = getCurrentInstance()
const channelList = ref<SysNotifyChannel[]>([])
const loading = ref(true)
const showSearch = ref(true)
const ids = ref<number[]>([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const open = ref(false)
const title = ref('')
const configForm = reactive<ChannelConfig>({})
const channelOptions = [
  { label: '站内消息', value: 'IN_APP' },
  { label: '短信', value: 'SMS' },
  { label: '邮件', value: 'EMAIL' },
  { label: '企业微信', value: 'WECHAT_WORK' }
]
const data = reactive({
  form: {} as SysNotifyChannel,
  queryParams: { pageNum: 1, pageSize: 10 } as NotifyChannelQueryParams,
  rules: {
    channelCode: [{ required: true, message: '渠道编码不能为空', trigger: 'change' }],
    channelName: [{ required: true, message: '渠道名称不能为空', trigger: 'blur' }]
  }
})
const { queryParams, form, rules } = toRefs(data)
const configPreview = computed(() => buildConfigText())

function getList() { loading.value = true; listNotifyChannel(queryParams.value).then(res => { channelList.value = res.rows; total.value = res.total; loading.value = false }) }
function cancel() { open.value = false; reset() }
function reset() { form.value = { status: '1', channelCode: 'SMS', channelName: '短信', channelConfig: '{}' }; setConfigForm(defaultConfig('SMS')) }
function handleQuery() { queryParams.value.pageNum = 1; getList() }
function resetQuery() { proxy.resetForm('queryRef'); handleQuery() }
function handleSelectionChange(selection: SysNotifyChannel[]) { ids.value = selection.map(item => item.channelId!); single.value = selection.length !== 1; multiple.value = !selection.length }
function handleAdd() { reset(); open.value = true; title.value = '新增通知渠道' }
function handleUpdate(row?: SysNotifyChannel) { reset(); const id = row?.channelId || ids.value[0]; getNotifyChannel(id!).then(res => { form.value = res.data || {}; setConfigForm(parseConfig(form.value.channelConfig)); open.value = true; title.value = '修改通知渠道' }) }
function submitForm() {
  form.value.channelConfig = buildConfigText()
  const missing = validateConfig()
  if (missing) { proxy.$modal.msgError(missing); return }
  proxy.$refs['channelRef'].validate((valid: boolean) => {
    if (!valid) return
    const req = form.value.channelId ? updateNotifyChannel(form.value) : addNotifyChannel(form.value)
    req.then(() => { proxy.$modal.msgSuccess('操作成功'); open.value = false; getList() })
  })
}
function handleDelete(row?: SysNotifyChannel) { const channelIds = row?.channelId || ids.value; proxy.$modal.confirm('是否确认删除通知渠道编号为"' + channelIds + '"的数据项？').then(() => delNotifyChannel(channelIds)).then(() => { getList(); proxy.$modal.msgSuccess('删除成功') }) }
function handleChannelCodeChange(value: ChannelCode) {
  form.value.channelName = channelOptions.find(item => item.value === value)?.label || form.value.channelName
  setConfigForm(defaultConfig(value))
}
function defaultConfig(type?: string): ChannelConfig {
  if (type === 'SMS') return { url: '', accessToken: '', signName: '若依审批', templateCode: 'AUDIT_NOTIFY' }
  if (type === 'EMAIL') return { url: '', accessToken: '', from: 'noreply@example.com' }
  if (type === 'WECHAT_WORK') return { webhookUrl: '', toUser: '' }
  return {}
}
function parseConfig(text?: string): ChannelConfig {
  try { return { ...defaultConfig(form.value.channelCode), ...(JSON.parse(text || '{}') || {}) } } catch { return defaultConfig(form.value.channelCode) }
}
function setConfigForm(config: ChannelConfig) {
  Object.keys(configForm).forEach(key => delete configForm[key])
  Object.assign(configForm, config)
}
function buildConfigText() {
  if (form.value.channelCode === 'IN_APP') return '{}'
  if (!['SMS', 'EMAIL', 'WECHAT_WORK'].includes(form.value.channelCode || '')) return form.value.channelConfig || '{}'
  return JSON.stringify(configForm, null, 2)
}
function validateConfig() {
  if (form.value.channelCode === 'SMS' && !configForm.url) return '短信网关地址不能为空'
  if (form.value.channelCode === 'EMAIL' && !configForm.url) return '邮件网关地址不能为空'
  if (form.value.channelCode === 'WECHAT_WORK' && !configForm.webhookUrl) return '企业微信机器人地址不能为空'
  try { JSON.parse(form.value.channelConfig || '{}') } catch { return '渠道配置必须是合法 JSON' }
  return ''
}
function formatConfigSummary(row: SysNotifyChannel) {
  const config = parseRowConfig(row.channelConfig)
  if (row.channelCode === 'IN_APP') return '无需外部配置'
  if (row.channelCode === 'SMS') return `网关：${config.url || '未配置'}，签名：${config.signName || '未配置'}，模板：${config.templateCode || '未配置'}`
  if (row.channelCode === 'EMAIL') return `网关：${config.url || '未配置'}，发件人：${config.from || '未配置'}`
  if (row.channelCode === 'WECHAT_WORK') return `机器人：${config.webhookUrl || '未配置'}，成员：${config.toUser || '按接收人匹配'}`
  return row.channelConfig || '{}'
}
function parseRowConfig(text?: string): ChannelConfig {
  try { return JSON.parse(text || '{}') || {} } catch { return {} }
}
getList()
</script>

<style lang="scss" scoped>
.card-header { display: flex; align-items: center; justify-content: space-between; }
.main-title { font-weight: 600; color: #303133; }
.sub-text { color: #909399; font-size: 12px; margin-top: 4px; }
.mb8 { margin-bottom: 8px; }
.mb12 { margin-bottom: 12px; }
</style>
