import request from '@/utils/request'
import type { AjaxResult, TableDataInfo, SysAuditFlow, AuditFlowQueryParams } from '@/types'

export function listAuditFlow(query: AuditFlowQueryParams): Promise<TableDataInfo<SysAuditFlow[]>> {
  return request({ url: '/audit/flow/list', method: 'get', params: query })
}

export function getAuditFlow(flowId: number): Promise<AjaxResult<SysAuditFlow>> {
  return request({ url: '/audit/flow/' + flowId, method: 'get' })
}

export function addAuditFlow(data: SysAuditFlow): Promise<AjaxResult> {
  return request({ url: '/audit/flow', method: 'post', data })
}

export function updateAuditFlow(data: SysAuditFlow): Promise<AjaxResult> {
  return request({ url: '/audit/flow', method: 'put', data })
}

export function publishAuditFlow(flowId: number): Promise<AjaxResult> {
  return request({ url: '/audit/flow/publish/' + flowId, method: 'put' })
}

export function delAuditFlow(flowIds: number | number[]): Promise<AjaxResult> {
  return request({ url: '/audit/flow/' + flowIds, method: 'delete' })
}