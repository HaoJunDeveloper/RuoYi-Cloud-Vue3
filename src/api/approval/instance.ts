import request from '@/utils/request'
import type { AjaxResult, TableDataInfo, SysAuditInstance, SysAuditRecord, AuditStartRequest, AuditInstanceQueryParams } from '@/types'

export function listMyAuditInstance(query: AuditInstanceQueryParams): Promise<TableDataInfo<SysAuditInstance[]>> {
  return request({ url: '/audit/instance/my/list', method: 'get', params: query })
}

export function getAuditInstance(instanceId: number): Promise<AjaxResult<SysAuditInstance>> {
  return request({ url: '/audit/instance/' + instanceId, method: 'get' })
}

export function listAuditRecords(instanceId: number): Promise<AjaxResult<SysAuditRecord[]>> {
  return request({ url: '/audit/instance/' + instanceId + '/records', method: 'get' })
}

export function startAudit(data: AuditStartRequest): Promise<AjaxResult<SysAuditInstance>> {
  return request({ url: '/audit/instance/start', method: 'post', data })
}

export function cancelAudit(instanceId: number): Promise<AjaxResult> {
  return request({ url: '/audit/instance/cancel/' + instanceId, method: 'put' })
}