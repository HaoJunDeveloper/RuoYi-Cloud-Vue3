import request from '@/utils/request'
import type { AjaxResult, MessageQueryParams, MessageTopResult, SysMessage, TableDataInfo } from '@/types'

export function listAuditMessage(query: MessageQueryParams): Promise<TableDataInfo<SysMessage[]>> {
  return request({ url: '/audit/message/list', method: 'get', params: query })
}

export function listAuditMessageTop(): Promise<MessageTopResult> {
  return request({ url: '/audit/message/top', method: 'get' })
}

export function markAuditMessageRead(msgId: number): Promise<AjaxResult> {
  return request({ url: '/audit/message/read/' + msgId, method: 'post' })
}

export function markAuditMessageReadAll(): Promise<AjaxResult> {
  return request({ url: '/audit/message/readAll', method: 'post' })
}