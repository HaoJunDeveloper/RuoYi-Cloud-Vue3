import type { PageDomain } from "../common"

export interface SysMessage {
  msgId?: number
  receiverId?: number
  msgTitle?: string
  msgContent?: string
  msgType?: string
  bizType?: string
  bizId?: string
  linkUrl?: string
  isRead?: string
  readTime?: string
  createTime?: string
}

export interface MessageQueryParams extends PageDomain {
  isRead?: string
  msgType?: string
}

export interface MessageTopResult {
  code: number
  msg: string
  data: SysMessage[]
  unreadCount: number
}