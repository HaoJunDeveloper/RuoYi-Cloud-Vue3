<template>
  <div :class="{ 'hidden': hidden }" class="pagination-container">
    <el-pagination
      :background="background"
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :layout="layout"
      :page-sizes="pageSizes"
      :pager-count="pagerCount"
      :total="total"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
  </div>
</template>

<script setup lang="ts">
import { scrollTo } from '@/utils/scroll-to'

const props = defineProps({
  total: {
    required: true,
    type: Number
  },
  page: {
    type: Number,
    default: 1
  },
  limit: {
    type: Number,
    default: 20
  },
  pageSizes: {
    type: Array,
    default() {
      return [10, 20, 30, 50]
    }
  },
  // 移动端页码按钮的数量端默认值5
  pagerCount: {
    type: Number,
    default: document.body.clientWidth < 992 ? 5 : 7
  },
  layout: {
    type: String,
    default: 'total, sizes, prev, pager, next, jumper'
  },
  background: {
    type: Boolean,
    default: true
  },
  autoScroll: {
    type: Boolean,
    default: true
  },
  hidden: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits()
const currentPage = computed({
  get() {
    return props.page
  },
  set(val: number) {
    emit('update:page', val)
  }
})
const pageSize = computed({
  get() {
    return props.limit
  },
  set(val: number){
    emit('update:limit', val)
  }
})

function handleSizeChange(val: number) {
  if (currentPage.value * val > props.total) {
    currentPage.value = 1
  }
  emit('pagination', { page: currentPage.value, limit: val })
  if (props.autoScroll) {
    scrollTo(0, 800)
  }
}

function handleCurrentChange(val: number) {
  emit('pagination', { page: val, limit: pageSize.value })
  if (props.autoScroll) {
    scrollTo(0, 800)
  }
}
</script>

<style scoped>
.pagination-container {
  background: transparent;
}
.pagination-container :deep(.el-pagination) {
  --el-pagination-bg-color: transparent;
  --el-pagination-button-bg-color: rgba(255, 255, 255, 0.96);
  --el-pagination-hover-color: var(--studio-accent, #2563eb);
  --el-pagination-button-disabled-bg-color: rgba(241, 245, 249, 0.88);
}
.pagination-container :deep(.btn-prev),
.pagination-container :deep(.btn-next),
.pagination-container :deep(.el-pager li) {
  border-radius: 12px;
  border: 1px solid rgba(226, 232, 240, 0.95);
  box-shadow: 0 6px 14px rgba(15, 23, 42, 0.04);
}
.pagination-container :deep(.el-pager li.is-active) {
  background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
  color: #fff;
  border-color: transparent;
}

:global(html.dark) .pagination-container :deep(.el-pagination) {
  --el-pagination-bg-color: transparent;
  --el-pagination-text-color: var(--el-text-color-regular);
  --el-pagination-button-color: var(--el-text-color-regular);
  --el-pagination-button-bg-color: rgba(15, 23, 42, 0.82);
  --el-pagination-button-disabled-color: rgba(148, 163, 184, 0.42);
  --el-pagination-button-disabled-bg-color: rgba(15, 23, 42, 0.42);
  --el-pagination-hover-color: #eff6ff;
}

:global(html.dark) .pagination-container :deep(.btn-prev),
:global(html.dark) .pagination-container :deep(.btn-next),
:global(html.dark) .pagination-container :deep(.el-pager li),
:global(html.dark) .pagination-container :deep(.el-pagination__sizes .el-select__wrapper),
:global(html.dark) .pagination-container :deep(.el-pagination__jump .el-input__wrapper) {
  background: rgba(15, 23, 42, 0.82) !important;
  border: 1px solid rgba(148, 163, 184, 0.16) !important;
  color: var(--el-text-color-regular) !important;
  box-shadow: inset 0 0 0 1px rgba(148, 163, 184, 0.1) !important;
}

:global(html.dark) .pagination-container :deep(.el-pagination.is-background .btn-prev),
:global(html.dark) .pagination-container :deep(.el-pagination.is-background .btn-next),
:global(html.dark) .pagination-container :deep(.el-pagination.is-background .el-pager li) {
  background: rgba(15, 23, 42, 0.82) !important;
  border-color: rgba(148, 163, 184, 0.16) !important;
  color: var(--el-text-color-regular) !important;
}

:global(html.dark) .pagination-container :deep(.btn-prev:hover),
:global(html.dark) .pagination-container :deep(.btn-next:hover),
:global(html.dark) .pagination-container :deep(.el-pager li:hover),
:global(html.dark) .pagination-container :deep(.el-pagination__sizes .el-select__wrapper:hover),
:global(html.dark) .pagination-container :deep(.el-pagination__jump .el-input__wrapper:hover) {
  background: rgba(30, 41, 59, 0.92) !important;
  border-color: rgba(96, 165, 250, 0.24) !important;
  color: #eff6ff !important;
}

:global(html.dark) .pagination-container :deep(.el-pager li.is-active),
:global(html.dark) .pagination-container :deep(.el-pagination.is-background .el-pager li.is-active) {
  background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%) !important;
  color: #fff !important;
  border-color: transparent !important;
  box-shadow: 0 10px 22px rgba(37, 99, 235, 0.24) !important;
}

:global(html.dark) .pagination-container :deep(.el-pagination__total),
:global(html.dark) .pagination-container :deep(.el-pagination__jump),
:global(html.dark) .pagination-container :deep(.el-pagination__sizes) {
  color: var(--el-text-color-regular) !important;
}

:global(html.dark) .pagination-container :deep(.el-pagination__jump .el-input__inner),
:global(html.dark) .pagination-container :deep(.el-pagination__sizes .el-select__selected-item),
:global(html.dark) .pagination-container :deep(.btn-prev .el-icon),
:global(html.dark) .pagination-container :deep(.btn-next .el-icon) {
  color: var(--el-text-color-regular) !important;
}
.pagination-container.hidden {
  display: none;
}
</style>