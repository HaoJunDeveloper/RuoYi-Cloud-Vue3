import type { BaseEntity, PageDomain } from "../common"

export interface SysAuditTemplate extends BaseEntity {
  templateId?: number
  templateCode?: string
  templateName?: string
  businessType?: string
  formSchema?: string
  notifyConfig?: string
  status?: string
}

export interface AuditTemplateQueryParams extends PageDomain {
  templateCode?: string
  templateName?: string
  businessType?: string
  status?: string
}

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

export interface SysAuditNode extends BaseEntity {
  nodeId?: number
  flowId?: number
  nodeName?: string
  nodeOrder?: number
  signType?: string
  approverType?: string
  approverValue?: string
  passPolicy?: string
  passPercent?: number
}

export interface SysAuditFlow extends BaseEntity {
  flowId?: number
  templateId?: number
  flowName?: string
  version?: number
  status?: string
  publishTime?: string
  nodes?: SysAuditNode[]
}

export interface AuditFlowQueryParams extends PageDomain {
  templateId?: number
  flowName?: string
  status?: string
}