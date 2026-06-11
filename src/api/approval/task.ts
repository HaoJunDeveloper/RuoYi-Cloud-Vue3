import request from '@/utils/request'
import type { AjaxResult, TableDataInfo, SysAuditTask, AuditActionRequest, AuditTaskQueryParams } from '@/types'

export function listPendingTask(query: AuditTaskQueryParams): Promise<TableDataInfo<SysAuditTask[]>> {
  return request({ url: '/audit/instance/task/pending', method: 'get', params: query })
}

export function listDoneTask(query: AuditTaskQueryParams): Promise<TableDataInfo<SysAuditTask[]>> {
  return request({ url: '/audit/instance/task/done', method: 'get', params: query })
}

export function passTask(data: AuditActionRequest): Promise<AjaxResult> {
  return request({ url: '/audit/instance/task/pass', method: 'put', data })
}

export function rejectTask(data: AuditActionRequest): Promise<AjaxResult> {
  return request({ url: '/audit/instance/task/reject', method: 'put', data })
}

export function transferTask(data: AuditActionRequest): Promise<AjaxResult> {
  return request({ url: '/audit/instance/task/transfer', method: 'put', data })
}

export function addSignTask(data: AuditActionRequest): Promise<AjaxResult> {
  return request({ url: '/audit/instance/task/addSign', method: 'put', data })
}