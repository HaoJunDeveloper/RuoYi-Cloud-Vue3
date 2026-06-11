<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch">
      <el-form-item label="标题" prop="businessTitle"><el-input v-model="queryParams.businessTitle" placeholder="请输入业务标题" clearable style="width: 220px" @keyup.enter="handleQuery" /></el-form-item>
      <el-form-item><el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button><el-button icon="Refresh" @click="resetQuery">重置</el-button><el-button type="primary" icon="Plus" @click="handleStart" v-hasPermi="['audit:instance:start']">发起申请</el-button></el-form-item>
    </el-form>
    <el-table v-loading="loading" :data="instanceList">
      <el-table-column label="单号" align="center" prop="instanceNo" min-width="170" />
      <el-table-column label="标题" align="center" prop="businessTitle" min-width="180" />
      <el-table-column label="业务类型" align="center" prop="businessType" width="120" />
      <el-table-column label="状态" align="center" prop="status" width="100"><template #default="scope"><el-tag :type="statusType(scope.row.status)">{{ statusText(scope.row.status) }}</el-tag></template></el-table-column>
      <el-table-column label="申请时间" align="center" prop="applyTime" width="160" />
      <el-table-column label="操作" align="center" width="180"><template #default="scope"><el-button link type="primary" @click="handleDetail(scope.row)">详情</el-button><el-button link type="primary" @click="handleCancel(scope.row)" v-if="scope.row.status === '1'" v-hasPermi="['audit:instance:cancel']">撤销</el-button></template></el-table-column>
    </el-table>
    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    <el-dialog title="发起审批" v-model="open" width="720px" append-to-body>
      <el-form ref="applyRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="模板编码" prop="templateCode"><el-input v-model="form.templateCode" placeholder="请输入模板编码" /></el-form-item>
        <el-form-item label="业务类型" prop="businessType"><el-input v-model="form.businessType" placeholder="请输入业务类型" /></el-form-item>
        <el-form-item label="业务主键" prop="businessId"><el-input v-model="form.businessId" placeholder="请输入业务主键" /></el-form-item>
        <el-form-item label="业务标题" prop="businessTitle"><el-input v-model="form.businessTitle" placeholder="请输入业务标题" /></el-form-item>
        <el-form-item label="业务快照"><el-input v-model="form.businessSnapshot" type="textarea" :rows="5" placeholder="JSON 快照" /></el-form-item>
      </el-form>
      <template #footer><div class="dialog-footer"><el-button type="primary" @click="submitStart">确 定</el-button><el-button @click="open = false">取 消</el-button></div></template>
    </el-dialog>
  </div>
</template>
<script setup lang="ts" name="AuditMy">
import { listMyAuditInstance, startAudit, cancelAudit } from '@/api/approval/instance'
import type { AuditInstanceQueryParams, AuditStartRequest, SysAuditInstance } from '@/types'
const { proxy } = getCurrentInstance()
const router = useRouter()
const instanceList = ref<SysAuditInstance[]>([]), loading = ref(true), showSearch = ref(true), total = ref(0), open = ref(false)
const data = reactive({ queryParams: { pageNum: 1, pageSize: 10 } as AuditInstanceQueryParams, form: {} as AuditStartRequest, rules: { templateCode: [{ required: true, message: '模板编码不能为空', trigger: 'blur' }], businessType: [{ required: true, message: '业务类型不能为空', trigger: 'blur' }], businessId: [{ required: true, message: '业务主键不能为空', trigger: 'blur' }], businessTitle: [{ required: true, message: '业务标题不能为空', trigger: 'blur' }] } })
const { queryParams, form, rules } = toRefs(data)
function getList() { loading.value = true; listMyAuditInstance(queryParams.value).then(res => { instanceList.value = res.rows; total.value = res.total; loading.value = false }) }
function handleQuery() { queryParams.value.pageNum = 1; getList() }
function resetQuery() { proxy.resetForm('queryRef'); handleQuery() }
function handleStart() { form.value = {}; open.value = true }
function submitStart() { proxy.$refs['applyRef'].validate((valid: boolean) => { if (!valid) return; startAudit(form.value).then(() => { proxy.$modal.msgSuccess('提交成功'); open.value = false; getList() }) }) }
function handleCancel(row: SysAuditInstance) { proxy.$modal.confirm('确认撤销该审批？').then(() => cancelAudit(row.instanceId!)).then(() => { proxy.$modal.msgSuccess('撤销成功'); getList() }) }
function handleDetail(row: SysAuditInstance) { router.push('/audit/detail/' + row.instanceId) }
function statusText(status?: string) { return ({ '0': '草稿', '1': '审核中', '2': '已通过', '3': '已驳回', '4': '已撤销' } as Record<string, string>)[status || ''] || status }
function statusType(status?: string) { return ({ '1': 'warning', '2': 'success', '3': 'danger', '4': 'info' } as Record<string, string>)[status || ''] || 'info' }
getList()
</script>