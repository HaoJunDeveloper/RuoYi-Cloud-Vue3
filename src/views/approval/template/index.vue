<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch">
      <el-form-item label="模板名称" prop="templateName">
        <el-input v-model="queryParams.templateName" placeholder="请输入模板名称" clearable style="width: 200px" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="业务类型" prop="businessType">
        <el-input v-model="queryParams.businessType" placeholder="请输入业务类型" clearable style="width: 200px" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5"><el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['audit:template:add']">新增</el-button></el-col>
      <el-col :span="1.5"><el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate" v-hasPermi="['audit:template:edit']">修改</el-button></el-col>
      <el-col :span="1.5"><el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete" v-hasPermi="['audit:template:remove']">删除</el-button></el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" />
    </el-row>

    <el-table v-loading="loading" :data="templateList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="模板ID" align="center" prop="templateId" width="90" />
      <el-table-column label="模板编码" align="center" prop="templateCode" />
      <el-table-column label="模板名称" align="center" prop="templateName" />
      <el-table-column label="业务类型" align="center" prop="businessType" />
      <el-table-column label="状态" align="center" prop="status" width="90">
        <template #default="scope"><el-tag :type="scope.row.status === '0' ? 'success' : 'info'">{{ scope.row.status === '0' ? '正常' : '停用' }}</el-tag></template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" width="160" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['audit:template:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['audit:template:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />

    <el-dialog :title="title" v-model="open" width="760px" append-to-body>
      <el-form ref="templateRef" :model="form" :rules="rules" label-width="100px">
        <el-row>
          <el-col :span="12"><el-form-item label="模板编码" prop="templateCode"><el-input v-model="form.templateCode" placeholder="如 leave_apply" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="模板名称" prop="templateName"><el-input v-model="form.templateName" placeholder="请输入模板名称" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="业务类型" prop="businessType"><el-input v-model="form.businessType" placeholder="请输入业务类型" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="状态"><el-radio-group v-model="form.status"><el-radio value="0">正常</el-radio><el-radio value="1">停用</el-radio></el-radio-group></el-form-item></el-col>
          <el-col :span="24"><el-form-item label="表单配置"><el-input v-model="form.formSchema" type="textarea" :rows="4" placeholder="JSON 配置" /></el-form-item></el-col>
          <el-col :span="24"><el-form-item label="通知配置"><el-input v-model="form.notifyConfig" type="textarea" :rows="4" placeholder="JSON 配置" /></el-form-item></el-col>
          <el-col :span="24"><el-form-item label="备注"><el-input v-model="form.remark" type="textarea" /></el-form-item></el-col>
        </el-row>
      </el-form>
      <template #footer><div class="dialog-footer"><el-button type="primary" @click="submitForm">确 定</el-button><el-button @click="cancel">取 消</el-button></div></template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="AuditTemplate">
import { listAuditTemplate, getAuditTemplate, addAuditTemplate, updateAuditTemplate, delAuditTemplate } from '@/api/approval/template'
import type { AuditTemplateQueryParams, SysAuditTemplate } from '@/types'

const { proxy } = getCurrentInstance()
const templateList = ref<SysAuditTemplate[]>([])
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
function reset() { form.value = { status: '0' } }
function handleQuery() { queryParams.value.pageNum = 1; getList() }
function resetQuery() { proxy.resetForm('queryRef'); handleQuery() }
function handleSelectionChange(selection: SysAuditTemplate[]) { ids.value = selection.map(item => item.templateId!); single.value = selection.length !== 1; multiple.value = !selection.length }
function handleAdd() { reset(); open.value = true; title.value = '添加审批模板' }
function handleUpdate(row?: SysAuditTemplate) { reset(); const id = row?.templateId || ids.value[0]; getAuditTemplate(id!).then(res => { form.value = res.data || {}; open.value = true; title.value = '修改审批模板' }) }
function submitForm() { proxy.$refs['templateRef'].validate((valid: boolean) => { if (!valid) return; const req = form.value.templateId ? updateAuditTemplate(form.value) : addAuditTemplate(form.value); req.then(() => { proxy.$modal.msgSuccess('操作成功'); open.value = false; getList() }) }) }
function handleDelete(row?: SysAuditTemplate) { const templateIds = row?.templateId || ids.value; proxy.$modal.confirm('是否确认删除审批模板编号为"' + templateIds + '"的数据项？').then(() => delAuditTemplate(templateIds)).then(() => { getList(); proxy.$modal.msgSuccess('删除成功') }) }
getList()
</script>