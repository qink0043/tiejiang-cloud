// types/transfer.ts

export type TransferStatus =
  | 'pending' // 等待中
  | 'uploading' // 上传中
  | 'downloading' // 下载中
  | 'paused' // 已暂停
  | 'success' // 成功
  | 'error' // 失败
  | 'cancelled' // 已取消

export type TransferType = 'upload' | 'download'

export interface TransferTask {
  id: string
  fileId?: string
  name: string
  size: number
  type: TransferType
  status: TransferStatus
  progress: number
  speed?: number
  transferredSize?: number
  startTime: number
  endTime?: number
  error?: string
  path?: string // 文件路径
  file?: File
}
