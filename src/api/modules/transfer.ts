// api/modules/transfer.ts
import http from '..'

export interface TransferRecord {
  id: string
  file_id: string | null
  file_name: string
  file_size: number
  transfer_type: 'upload' | 'download'
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled'
  progress: number
  speed: number
  transferred_size: number
  error_message: string | null
  owner_id: number
  started_at: string
  completed_at: string | null
  created_at: string
  updated_at: string
}

export interface CreateTransferParams {
  fileId?: string
  fileName: string
  fileSize: number
  transferType: 'upload' | 'download'
}

export interface UpdateProgressParams {
  progress: number
  speed?: number
  transferredSize?: number
}

export interface CompleteTransferParams {
  fileId?: string
}

export interface FailTransferParams {
  error: string
}

export interface GetTransfersParams {
  status?: 'in_progress' | 'completed' | 'failed' | 'cancelled'
  page?: number
  pageSize?: number
}

export interface TransfersResponse {
  list: TransferRecord[]
  total: number
  page: number
  pageSize: number
}

// 创建传输记录
export const createTransfer = (params: CreateTransferParams) => {
  return http<TransferRecord>({
    url: '/transfers',
    method: 'POST',
    data: params,
  })
}

// 更新传输进度
export const updateTransferProgress = (
  id: string,
  params: UpdateProgressParams,
) => {
  return http<TransferRecord>({
    url: `/transfers/${id}/progress`,
    method: 'PUT',
    data: params,
  })
}

// 标记传输完成
export const completeTransfer = (
  id: string,
  params?: CompleteTransferParams,
) => {
  return http<TransferRecord>({
    url: `/transfers/${id}/complete`,
    method: 'PUT',
    data: params || {},
  })
}

// 标记传输失败
export const failTransfer = (id: string, params: FailTransferParams) => {
  return http<TransferRecord>({
    url: `/transfers/${id}/fail`,
    method: 'PUT',
    data: params,
  })
}

// 取消传输
export const cancelTransfer = (id: string) => {
  return http<TransferRecord>({
    url: `/transfers/${id}/cancel`,
    method: 'PUT',
  })
}

// 获取传输记录列表
export const getTransfers = (params?: GetTransfersParams) => {
  return http<TransfersResponse>({
    url: '/transfers',
    method: 'GET',
    params,
  })
}

// 获取单个传输记录详情
export const getTransferDetail = (id: string) => {
  return http<TransferRecord>({
    url: `/transfers/${id}`,
    method: 'GET',
  })
}

// 删除传输记录
export const deleteTransfer = (id: string) => {
  return http({
    url: `/transfers/${id}`,
    method: 'DELETE',
  })
}

// 批量删除传输记录
export const batchDeleteTransfers = (ids: string[]) => {
  return http({
    url: '/transfers/batch-delete',
    method: 'POST',
    data: { ids },
  })
}

// 清空已完成的传输记录
export const clearCompletedTransfers = () => {
  return http({
    url: '/transfers/clear-completed',
    method: 'POST',
  })
}
