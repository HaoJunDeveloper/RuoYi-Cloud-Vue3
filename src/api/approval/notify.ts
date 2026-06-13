import request from '@/utils/request'
import type {
  AjaxResult,
  NotifyChannelQueryParams,
  NotifyLogQueryParams,
  NotifyTemplateQueryParams,
  SysNotifyChannel,
  SysNotifyLog,
  SysNotifyTemplate,
  TableDataInfo
} from '@/types'

export function listNotifyChannel(query: NotifyChannelQueryParams): Promise<TableDataInfo<SysNotifyChannel[]>> {
  return request({ url: '/audit/notify/channel/list', method: 'get', params: query })
}

export function getNotifyChannel(channelId: number): Promise<AjaxResult<SysNotifyChannel>> {
  return request({ url: '/audit/notify/channel/' + channelId, method: 'get' })
}

export function addNotifyChannel(data: SysNotifyChannel): Promise<AjaxResult> {
  return request({ url: '/audit/notify/channel', method: 'post', data })
}

export function updateNotifyChannel(data: SysNotifyChannel): Promise<AjaxResult> {
  return request({ url: '/audit/notify/channel', method: 'put', data })
}

export function delNotifyChannel(channelIds: number | number[]): Promise<AjaxResult> {
  return request({ url: '/audit/notify/channel/' + channelIds, method: 'delete' })
}

export function listNotifyTemplate(query: NotifyTemplateQueryParams): Promise<TableDataInfo<SysNotifyTemplate[]>> {
  return request({ url: '/audit/notify/template/list', method: 'get', params: query })
}

export function getNotifyTemplate(templateId: number): Promise<AjaxResult<SysNotifyTemplate>> {
  return request({ url: '/audit/notify/template/' + templateId, method: 'get' })
}

export function addNotifyTemplate(data: SysNotifyTemplate): Promise<AjaxResult> {
  return request({ url: '/audit/notify/template', method: 'post', data })
}

export function updateNotifyTemplate(data: SysNotifyTemplate): Promise<AjaxResult> {
  return request({ url: '/audit/notify/template', method: 'put', data })
}

export function delNotifyTemplate(templateIds: number | number[]): Promise<AjaxResult> {
  return request({ url: '/audit/notify/template/' + templateIds, method: 'delete' })
}

export function listNotifyLog(query: NotifyLogQueryParams): Promise<TableDataInfo<SysNotifyLog[]>> {
  return request({ url: '/audit/notify/log/list', method: 'get', params: query })
}

export function retryNotifyLog(logId: number): Promise<AjaxResult> {
  return request({ url: '/audit/notify/log/retry/' + logId, method: 'post' })
}
