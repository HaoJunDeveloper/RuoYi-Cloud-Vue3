<template>
  <div class="app-container audit-flow-page">
    <el-row :gutter="16" class="flow-layout">
      <el-col :span="6">
        <el-card shadow="never" class="template-panel">
          <template #header><div class="card-header"><span>审批场景</span><el-button text type="primary" @click="loadTemplates">刷新</el-button></div></template>
          <el-scrollbar height="520px">
            <div class="template-card" :class="{ active: !queryParams.templateId }" @click="selectTemplate()"><div class="template-name">全部流程</div><div class="template-meta">查看所有模板下的流程</div></div>
            <div v-for="item in templateList" :key="item.templateId" class="template-card" :class="{ active: queryParams.templateId === item.templateId }" @click="selectTemplate(item)"><div class="template-name">{{ item.templateName }}</div><div class="template-meta">{{ item.businessType || item.templateCode }}</div></div>
            <el-empty v-if="templateList.length === 0" description="暂无审批模板" />
          </el-scrollbar>
        </el-card>
      </el-col>

      <el-col :span="18">
        <el-card shadow="never">
          <template #header><div class="card-header"><div><span>流程配置</span><span v-if="currentTemplate" class="header-sub"> / {{ currentTemplate.templateName }}</span></div><el-button type="primary" icon="Plus" @click="handleAdd" v-hasPermi="['audit:flow:add']">新增流程</el-button></div></template>
          <el-alert title="流程负责决定谁审批、按什么顺序审批。审批人从用户或角色中选择，不再手动填写 ID。" type="info" show-icon :closable="false" class="mb12" />
          <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch">
            <el-form-item label="流程名称" prop="flowName"><el-input v-model="queryParams.flowName" placeholder="请输入流程名称" clearable style="width: 200px" /></el-form-item>
            <el-form-item label="状态" prop="status"><el-select v-model="queryParams.status" clearable placeholder="全部状态" style="width: 140px" @change="handleQuery"><el-option label="草稿" value="0" /><el-option label="已发布" value="1" /></el-select></el-form-item>
            <el-form-item><el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button><el-button icon="Refresh" @click="resetQuery">重置</el-button></el-form-item>
          </el-form>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" class="mb8" />
          <el-table v-loading="loading" :data="flowList">
            <template #empty><el-empty description="暂无审批流程"><el-button type="primary" @click="handleAdd" v-hasPermi="['audit:flow:add']">为当前场景配置流程</el-button></el-empty></template>
            <el-table-column label="流程信息" min-width="240"><template #default="scope"><div class="main-title">{{ scope.row.flowName }}</div><div class="sub-text">模板ID：{{ scope.row.templateId }} · 版本：v{{ scope.row.version }}</div></template></el-table-column>
            <el-table-column label="状态" align="center" width="110"><template #default="scope"><el-tag :type="scope.row.status === '1' ? 'success' : 'info'">{{ scope.row.status === '1' ? '已发布' : '草稿' }}</el-tag></template></el-table-column>
            <el-table-column label="发布时间" align="center" prop="publishTime" width="170" />
            <el-table-column label="联动操作" align="center" width="260"><template #default="scope"><el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['audit:flow:edit']">配置节点</el-button><el-button link type="success" icon="Promotion" @click="handlePublish(scope.row)" v-hasPermi="['audit:flow:publish']">发布</el-button><el-button link type="danger" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['audit:flow:remove']">删除</el-button></template></el-table-column>
          </el-table>
          <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
        </el-card>
      </el-col>
    </el-row>

    <el-dialog :title="title" v-model="open" width="1040px" append-to-body>
      <el-form ref="flowRef" :model="form" label-width="100px">
        <el-row :gutter="12">
          <el-col :span="8"><el-form-item label="审批场景"><el-select v-model="form.templateId" filterable placeholder="请选择模板" style="width: 100%" @change="syncFlowName"><el-option v-for="item in templateList" :key="item.templateId" :label="item.templateName" :value="item.templateId!" /></el-select></el-form-item></el-col>
          <el-col :span="8"><el-form-item label="流程名称"><el-input v-model="form.flowName" /></el-form-item></el-col>
          <el-col :span="8"><el-form-item label="版本"><el-input-number v-model="form.version" :min="1" /></el-form-item></el-col>
        </el-row>
        <el-divider content-position="left">节点配置</el-divider>
        <el-table :data="form.nodes" border>
          <el-table-column label="顺序" width="90"><template #default="scope"><el-input-number v-model="scope.row.nodeOrder" :min="1" size="small" :controls="false" /></template></el-table-column>
          <el-table-column label="节点名称" min-width="150"><template #default="scope"><el-input v-model="scope.row.nodeName" placeholder="如 直属上级审批" /></template></el-table-column>
          <el-table-column label="签批方式" width="130"><template #default="scope"><el-select v-model="scope.row.signType"><el-option label="依次签" value="sequence" /><el-option label="会签" value="parallel" /></el-select></template></el-table-column>
          <el-table-column label="审批人类型" width="150"><template #default="scope"><el-select v-model="scope.row.approverType" @change="clearApprover(scope.row)"><el-option label="指定用户" value="user" /><el-option label="指定角色" value="role" /><el-option label="部门负责人" value="dept_leader" /><el-option label="直属上级" value="leader" /></el-select></template></el-table-column>
          <el-table-column label="审批人" min-width="230">
            <template #default="scope">
              <el-select v-if="scope.row.approverType === 'user'" v-model="scope.row.approverIds" multiple filterable placeholder="请选择审批用户" style="width: 100%" @change="syncApproverValue(scope.row)">
                <el-option v-for="user in userOptions" :key="user.userId" :label="user.nickName || user.userName" :value="user.userId!" />
              </el-select>
              <el-select v-else-if="scope.row.approverType === 'role'" v-model="scope.row.approverIds" multiple filterable placeholder="请选择审批角色" style="width: 100%" @change="syncApproverValue(scope.row)">
                <el-option v-for="role in roleOptions" :key="role.roleId" :label="role.roleName" :value="role.roleId!" />
              </el-select>
              <el-tag v-else type="info">{{ scope.row.approverType === 'dept_leader' ? '按申请人部门负责人自动匹配' : '按申请人直属上级自动匹配' }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="80"><template #default="scope"><el-button link type="danger" @click="removeNode(scope.$index)">删除</el-button></template></el-table-column>
        </el-table>
        <el-button class="mt10" type="primary" plain icon="Plus" @click="addNode">添加节点</el-button>
      </el-form>
      <template #footer><div class="dialog-footer"><el-button type="primary" @click="submitForm">确 定</el-button><el-button @click="open = false">取 消</el-button></div></template>
    </el-dialog>
  </div>
</template>
<script setup lang="ts" name="AuditFlow">
import { listAuditTemplate } from '@/api/approval/template'
import { listAuditFlow, getAuditFlow, addAuditFlow, updateAuditFlow, publishAuditFlow, delAuditFlow } from '@/api/approval/flow'
import { listUser } from '@/api/system/user'
import { listRole } from '@/api/system/role'
import type { AuditFlowQueryParams, SysAuditFlow, SysAuditNode, SysAuditTemplate, SysRole, SysUser } from '@/types'

type FlowNodeForm = SysAuditNode & { approverIds?: number[] }

const route = useRoute()
const { proxy } = getCurrentInstance()
const flowList = ref<SysAuditFlow[]>([])
const templateList = ref<SysAuditTemplate[]>([])
const userOptions = ref<SysUser[]>([])
const roleOptions = ref<SysRole[]>([])
const loading = ref(true)
const showSearch = ref(true)
const open = ref(false)
const total = ref(0)
const title = ref('')
const data = reactive({ form: { version: 1, status: '0', nodes: [] } as SysAuditFlow & { nodes?: FlowNodeForm[] }, queryParams: { pageNum: 1, pageSize: 10 } as AuditFlowQueryParams })
const { form, queryParams } = toRefs(data)
const currentTemplate = computed(() => templateList.value.find(item => item.templateId === queryParams.value.templateId))

function loadTemplates() {
  listAuditTemplate({ pageNum: 1, pageSize: 100, status: '0' }).then(res => {
    templateList.value = res.rows || []
    const routeTemplateId = Number(route.query.templateId)
    if (routeTemplateId && !queryParams.value.templateId) { queryParams.value.templateId = routeTemplateId; getList() }
  })
}
function loadApproverOptions() {
  Promise.all([listUser({ pageNum: 1, pageSize: 50, status: '0' }), listRole({ pageNum: 1, pageSize: 200, status: '0' })]).then(([userRes, roleRes]) => {
    userOptions.value = userRes.rows || []
    roleOptions.value = roleRes.rows || []
  })
}
function getList() { loading.value = true; listAuditFlow(queryParams.value).then(res => { flowList.value = res.rows; total.value = res.total; loading.value = false }) }
function selectTemplate(item?: SysAuditTemplate) { queryParams.value.templateId = item?.templateId; handleQuery() }
function handleQuery() { queryParams.value.pageNum = 1; getList() }
function resetQuery() { proxy.resetForm('queryRef'); queryParams.value.templateId = currentTemplate.value?.templateId; handleQuery() }
function reset() { form.value = { templateId: queryParams.value.templateId, version: 1, status: '0', nodes: [] }; syncFlowName() }
function handleAdd() { reset(); loadApproverOptions(); open.value = true; title.value = '添加审批流程' }
function handleUpdate(row: SysAuditFlow) {
  loadApproverOptions()
  getAuditFlow(row.flowId!).then(res => {
    form.value = res.data || {}
    form.value.nodes = (form.value.nodes || []).map(node => ({ ...node, approverIds: parseApproverIds(node.approverValue) }))
    open.value = true
    title.value = '配置审批流程'
  })
}
function syncFlowName() {
  const selected = templateList.value.find(item => item.templateId === form.value.templateId)
  if (selected && !form.value.flowName) form.value.flowName = `${selected.templateName}审批流程`
}
function addNode() { form.value.nodes!.push({ nodeOrder: form.value.nodes!.length + 1, signType: 'sequence', approverType: 'user', approverIds: [], approverValue: '', passPolicy: 'all' }) }
function removeNode(index: number) { form.value.nodes!.splice(index, 1) }
function clearApprover(row: FlowNodeForm) { row.approverIds = []; row.approverValue = ['dept_leader', 'leader'].includes(row.approverType || '') ? row.approverType : '' }
function syncApproverValue(row: FlowNodeForm) { row.approverValue = (row.approverIds || []).join(',') }
function parseApproverIds(value?: string) { return (value || '').split(',').map(item => Number(item)).filter(Boolean) }
function submitForm() {
  form.value.nodes = (form.value.nodes || []).map(node => {
    const next = { ...node }
    if (['user', 'role'].includes(next.approverType || '')) next.approverValue = (next.approverIds || []).join(',')
    delete next.approverIds
    return next
  })
  const req = form.value.flowId ? updateAuditFlow(form.value) : addAuditFlow(form.value)
  req.then(() => { proxy.$modal.msgSuccess('操作成功'); open.value = false; getList() })
}
function handlePublish(row: SysAuditFlow) { publishAuditFlow(row.flowId!).then(() => { proxy.$modal.msgSuccess('发布成功'); getList() }) }
function handleDelete(row: SysAuditFlow) { proxy.$modal.confirm('是否确认删除该审批流程？').then(() => delAuditFlow(row.flowId!)).then(() => { proxy.$modal.msgSuccess('删除成功'); getList() }) }
loadTemplates()
getList()
</script>
<style lang="scss" scoped>
.flow-layout { align-items: stretch; }
.card-header { display: flex; align-items: center; justify-content: space-between; }
.header-sub { color: #909399; font-size: 13px; }
.template-panel { height: 100%; }
.template-card { padding: 12px; border: 1px solid #ebeef5; border-radius: 8px; margin-bottom: 10px; cursor: pointer; transition: all .15s; }
.template-card:hover, .template-card.active { border-color: var(--el-color-primary); background: #ecf5ff; }
.template-name { font-weight: 600; margin-bottom: 6px; }
.template-meta { font-size: 12px; color: #909399; }
.main-title { font-weight: 600; color: #303133; }
.sub-text { color: #909399; font-size: 12px; margin-top: 4px; }
.mb8 { margin-bottom: 8px; }
.mb12 { margin-bottom: 12px; }
.mt10 { margin-top: 10px; }
</style>