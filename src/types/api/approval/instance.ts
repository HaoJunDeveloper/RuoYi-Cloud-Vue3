import type { BaseEntity, PageDomain } from "../common"

export interface SysAuditInstance extends BaseEntity {
  instanceId?: number
  instanceNo?: string
  templateCode?: string
  flowId?: number
  businessType?: string
  businessId?: string
  businessTitle?: string
  businessSnapshot?: string
  callbackUrl?: string
  applicantId?: number
  applicantName?: string
  applicantDeptId?: number
  currentNodeId?: number
  status?: string
  applyTime?: string
  finishTime?: string
}

export interface SysAuditTask {
  taskId?: number
  instanceId?: number
  nodeId?: number
  approverId?: number
  approverName?: string
  taskStatus?: string
  readStatus?: string
  claimTime?: string
  finishTime?: string
  createTime?: string
  updateTime?: string
  businessTitle?: string
  businessType?: string
  applicantName?: string
}

export interface SysAuditRecord {
  recordId?: number
  instanceId?: number
  taskId?: number
  nodeId?: number
  approverId?: number
  approverName?: string
  action?: string
  comment?: string
  actionTime?: string
}

export interface AuditStartRequest {
  templateCode?: string
  businessType?: string
  businessId?: string
  businessTitle?: string
  businessSnapshot?: string
  callbackUrl?: string
}

export interface AuditActionRequest {
  taskId?: number
  comment?: string
  targetUserId?: number
}

export interface AuditInstanceQueryParams extends PageDomain {
  businessTitle?: string
  status?: string
}

export interface AuditTaskQueryParams extends PageDomain {
  businessTitle?: string
}