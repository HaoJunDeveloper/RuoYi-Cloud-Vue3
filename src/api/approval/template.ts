import request from '@/utils/request'
import type { AjaxResult, TableDataInfo, SysAuditTemplate, AuditTemplateQueryParams } from '@/types'

export function listAuditTemplate(query: AuditTemplateQueryParams): Promise<TableDataInfo<SysAuditTemplate[]>> {
  return request({ url: '/audit/template/list', method: 'get', params: query })
}

export function getAuditTemplate(templateId: number): Promise<AjaxResult<SysAuditTemplate>> {
  return request({ url: '/audit/template/' + templateId, method: 'get' })
}

export function addAuditTemplate(data: SysAuditTemplate): Promise<AjaxResult> {
  return request({ url: '/audit/template', method: 'post', data })
}

export function updateAuditTemplate(data: SysAuditTemplate): Promise<AjaxResult> {
  return request({ url: '/audit/template', method: 'put', data })
}

export function delAuditTemplate(templateIds: number | number[]): Promise<AjaxResult> {
  return request({ url: '/audit/template/' + templateIds, method: 'delete' })
}