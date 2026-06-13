import type { BaseEntity, PageDomain } from "../common"

export interface SysNotifyChannel extends BaseEntity {
  channelId?: number
  channelCode?: string
  channelName?: string
  channelConfig?: string
  status?: string
}

export interface NotifyChannelQueryParams extends PageDomain {
  channelCode?: string
  channelName?: string
  status?: string
}

export interface SysNotifyTemplate extends BaseEntity {
  templateId?: number
  templateCode?: string
  eventCode?: string
  channelCode?: string
  titleTemplate?: string
  contentTemplate?: string
  status?: string
}

export interface NotifyTemplateQueryParams extends PageDomain {
  templateCode?: string
  eventCode?: string
  channelCode?: string
  status?: string
}

export interface SysNotifyLog extends BaseEntity {
  logId?: number
  channelCode?: string
  receiverId?: number
  receiverTarget?: string
  bizType?: string
  bizId?: string
  sendStatus?: string
  requestBody?: string
  responseBody?: string
  errorMsg?: string
  retryCount?: number
  maxRetryCount?: number
  nextRetryTime?: string
}

export interface NotifyLogQueryParams extends PageDomain {
  logId?: number
  channelCode?: string
  receiverId?: number
  bizType?: string
  bizId?: string
  sendStatus?: string
}
