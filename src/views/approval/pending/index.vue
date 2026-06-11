<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch">
      <el-form-item label="标题" prop="businessTitle"><el-input v-model="queryParams.businessTitle" placeholder="请输入业务标题" clearable style="width: 220px" @keyup.enter="handleQuery" /></el-form-item>
      <el-form-item><el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button><el-button icon="Refresh" @click="resetQuery">重置</el-button></el-form-item>
    </el-form>
    <el-table v-loading="loading" :data="taskList">
      <el-table-column label="任务ID" align="center" prop="taskId" width="90" />
      <el-table-column label="业务标题" align="center" prop="businessTitle" min-width="180" />
      <el-table-column label="申请人" align="center" prop="applicantName" width="120" />
      <el-table-column label="创建时间" align="center" prop="createTime" width="160" />
      <el-table-column label="操作" align="center" width="260"><template #default="scope"><el-button link type="primary" @click="handleAction(scope.row, 'pass')" v-hasPermi="['audit:task:pass']">通过</el-button><el-button link type="danger" @click="handleAction(scope.row, 'reject')" v-hasPermi="['audit:task:reject']">驳回</el-button><el-button link type="primary" @click="handleDetail(scope.row)">详情</el-button></template></el-table-column>
    </el-table>
    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    <el-dialog :title="actionTitle" v-model="open" width="560px" append-to-body>
      <el-form :model="actionForm" label-width="80px"><el-form-item label="意见"><el-input v-model="actionForm.comment" type="textarea" :rows="4" /></el-form-item></el-form>
      <template #footer><div class="dialog-footer"><el-button type="primary" @click="submitAction">确 定</el-button><el-button @click="open = false">取 消</el-button></div></template>
    </el-dialog>
  </div>
</template>
<script setup lang="ts" name="AuditPending">
import { listPendingTask, passTask, rejectTask } from '@/api/approval/task'
import type { AuditActionRequest, AuditTaskQueryParams, SysAuditTask } from '@/types'
const { proxy } = getCurrentInstance()
const router = useRouter()
const taskList = ref<SysAuditTask[]>([]), loading = ref(true), showSearch = ref(true), total = ref(0), open = ref(false), actionType = ref(''), actionTitle = ref('')
const data = reactive({ queryParams: { pageNum: 1, pageSize: 10 } as AuditTaskQueryParams, actionForm: {} as AuditActionRequest })
const { queryParams, actionForm } = toRefs(data)
function getList() { loading.value = true; listPendingTask(queryParams.value).then(res => { taskList.value = res.rows; total.value = res.total; loading.value = false }) }
function handleQuery() { queryParams.value.pageNum = 1; getList() }
function resetQuery() { proxy.resetForm('queryRef'); handleQuery() }
function handleAction(row: SysAuditTask, type: string) { actionForm.value = { taskId: row.taskId }; actionType.value = type; actionTitle.value = type === 'pass' ? '审批通过' : '审批驳回'; open.value = true }
function submitAction() { const req = actionType.value === 'pass' ? passTask(actionForm.value) : rejectTask(actionForm.value); req.then(() => { proxy.$modal.msgSuccess('操作成功'); open.value = false; getList() }) }
function handleDetail(row: SysAuditTask) { router.push('/audit/detail/' + row.instanceId) }
getList()
</script>