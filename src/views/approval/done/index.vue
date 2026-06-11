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
      <el-table-column label="完成时间" align="center" prop="finishTime" width="160" />
      <el-table-column label="状态" align="center" prop="taskStatus" width="100"><template #default="scope"><el-tag>{{ taskStatusText(scope.row.taskStatus) }}</el-tag></template></el-table-column>
      <el-table-column label="操作" align="center" width="100"><template #default="scope"><el-button link type="primary" @click="handleDetail(scope.row)">详情</el-button></template></el-table-column>
    </el-table>
    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
  </div>
</template>
<script setup lang="ts" name="AuditDone">
import { listDoneTask } from '@/api/approval/task'
import type { AuditTaskQueryParams, SysAuditTask } from '@/types'
const { proxy } = getCurrentInstance()
const router = useRouter()
const taskList = ref<SysAuditTask[]>([]), loading = ref(true), showSearch = ref(true), total = ref(0)
const queryParams = ref<AuditTaskQueryParams>({ pageNum: 1, pageSize: 10 })
function getList() { loading.value = true; listDoneTask(queryParams.value).then(res => { taskList.value = res.rows; total.value = res.total; loading.value = false }) }
function handleQuery() { queryParams.value.pageNum = 1; getList() }
function resetQuery() { proxy.resetForm('queryRef'); handleQuery() }
function handleDetail(row: SysAuditTask) { router.push('/audit/detail/' + row.instanceId) }
function taskStatusText(status?: string) { return ({ '1': '已通过', '2': '已驳回', '3': '已转审', '4': '已加签', '5': '已关闭' } as Record<string, string>)[status || ''] || status }
getList()
</script>