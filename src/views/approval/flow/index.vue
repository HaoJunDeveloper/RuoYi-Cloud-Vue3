<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch">
      <el-form-item label="模板ID" prop="templateId"><el-input v-model="queryParams.templateId" placeholder="请输入模板ID" clearable style="width: 160px" /></el-form-item>
      <el-form-item label="流程名称" prop="flowName"><el-input v-model="queryParams.flowName" placeholder="请输入流程名称" clearable style="width: 200px" /></el-form-item>
      <el-form-item><el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button><el-button icon="Refresh" @click="resetQuery">重置</el-button></el-form-item>
    </el-form>
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5"><el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['audit:flow:add']">新增</el-button></el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" />
    </el-row>
    <el-table v-loading="loading" :data="flowList">
      <el-table-column label="流程ID" align="center" prop="flowId" width="90" />
      <el-table-column label="模板ID" align="center" prop="templateId" width="90" />
      <el-table-column label="流程名称" align="center" prop="flowName" />
      <el-table-column label="版本" align="center" prop="version" width="80" />
      <el-table-column label="状态" align="center" width="100"><template #default="scope"><el-tag :type="scope.row.status === '1' ? 'success' : 'info'">{{ scope.row.status === '1' ? '已发布' : '草稿' }}</el-tag></template></el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['audit:flow:edit']">配置</el-button>
          <el-button link type="primary" icon="Promotion" @click="handlePublish(scope.row)" v-hasPermi="['audit:flow:publish']">发布</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['audit:flow:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    <el-dialog :title="title" v-model="open" width="900px" append-to-body>
      <el-form ref="flowRef" :model="form" label-width="100px">
        <el-row>
          <el-col :span="8"><el-form-item label="模板ID"><el-input-number v-model="form.templateId" :min="1" /></el-form-item></el-col>
          <el-col :span="8"><el-form-item label="流程名称"><el-input v-model="form.flowName" /></el-form-item></el-col>
          <el-col :span="8"><el-form-item label="版本"><el-input-number v-model="form.version" :min="1" /></el-form-item></el-col>
        </el-row>
        <el-divider content-position="left">节点配置</el-divider>
        <el-table :data="form.nodes" border>
          <el-table-column label="顺序" width="90"><template #default="scope"><el-input-number v-model="scope.row.nodeOrder" :min="1" size="small" /></template></el-table-column>
          <el-table-column label="节点名称"><template #default="scope"><el-input v-model="scope.row.nodeName" /></template></el-table-column>
          <el-table-column label="签批方式" width="130"><template #default="scope"><el-select v-model="scope.row.signType"><el-option label="依次签" value="sequence" /><el-option label="会签" value="parallel" /></el-select></template></el-table-column>
          <el-table-column label="审批人类型" width="140"><template #default="scope"><el-select v-model="scope.row.approverType"><el-option label="指定用户" value="user" /><el-option label="指定角色" value="role" /></el-select></template></el-table-column>
          <el-table-column label="审批人值"><template #default="scope"><el-input v-model="scope.row.approverValue" placeholder="多个ID用英文逗号分隔" /></template></el-table-column>
          <el-table-column label="操作" width="80"><template #default="scope"><el-button link type="danger" @click="removeNode(scope.$index)">删除</el-button></template></el-table-column>
        </el-table>
        <el-button class="mt10" type="primary" plain icon="Plus" @click="addNode">添加节点</el-button>
      </el-form>
      <template #footer><div class="dialog-footer"><el-button type="primary" @click="submitForm">确 定</el-button><el-button @click="open = false">取 消</el-button></div></template>
    </el-dialog>
  </div>
</template>
<script setup lang="ts" name="AuditFlow">
import { listAuditFlow, getAuditFlow, addAuditFlow, updateAuditFlow, publishAuditFlow, delAuditFlow } from '@/api/approval/flow'
import type { AuditFlowQueryParams, SysAuditFlow } from '@/types'
const { proxy } = getCurrentInstance()
const flowList = ref<SysAuditFlow[]>([]), loading = ref(true), showSearch = ref(true), open = ref(false), total = ref(0), title = ref('')
const data = reactive({ form: { version: 1, status: '0', nodes: [] } as SysAuditFlow, queryParams: { pageNum: 1, pageSize: 10 } as AuditFlowQueryParams })
const { form, queryParams } = toRefs(data)
function getList() { loading.value = true; listAuditFlow(queryParams.value).then(res => { flowList.value = res.rows; total.value = res.total; loading.value = false }) }
function handleQuery() { queryParams.value.pageNum = 1; getList() }
function resetQuery() { proxy.resetForm('queryRef'); handleQuery() }
function reset() { form.value = { version: 1, status: '0', nodes: [] } }
function handleAdd() { reset(); open.value = true; title.value = '添加审批流程' }
function handleUpdate(row: SysAuditFlow) { getAuditFlow(row.flowId!).then(res => { form.value = res.data || {}; form.value.nodes = form.value.nodes || []; open.value = true; title.value = '配置审批流程' }) }
function addNode() { form.value.nodes!.push({ nodeOrder: form.value.nodes!.length + 1, signType: 'sequence', approverType: 'user', passPolicy: 'all' }) }
function removeNode(index: number) { form.value.nodes!.splice(index, 1) }
function submitForm() { const req = form.value.flowId ? updateAuditFlow(form.value) : addAuditFlow(form.value); req.then(() => { proxy.$modal.msgSuccess('操作成功'); open.value = false; getList() }) }
function handlePublish(row: SysAuditFlow) { publishAuditFlow(row.flowId!).then(() => { proxy.$modal.msgSuccess('发布成功'); getList() }) }
function handleDelete(row: SysAuditFlow) { proxy.$modal.confirm('是否确认删除该审批流程？').then(() => delAuditFlow(row.flowId!)).then(() => { proxy.$modal.msgSuccess('删除成功'); getList() }) }
getList()
</script>