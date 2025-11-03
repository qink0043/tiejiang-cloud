// types/transfer.ts

export type TransferType = 'upload' | 'download'
export type TransferStatus =
  | 'pending'
  | 'uploading'
  | 'paused'
  | 'success'
  | 'error'
  | 'cancelled'

export interface TransferTask {
  id: string
  name: string
  type: TransferType
  status: TransferStatus
  progress: number // 0-100
  size: number // 文件大小（字节）
  speed?: number // 传输速度（字节/秒）
  startTime: number // 开始时间戳
  endTime?: number // 结束时间戳
  error?: string // 错误信息
  path?: string // 文件路径
  file?: File // 原始文件对象（用于恢复上传）
}
