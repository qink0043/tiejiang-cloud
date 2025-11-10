// stores/modules/transfer.ts
import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { TransferTask } from '@/types/transfer'
import * as transferApi from '@/api/modules/transfer'

interface TransferState {
  tasks: TransferTask[]
  history: TransferTask[]
  loading: boolean
  error: string | null
}

const initialState: TransferState = {
  tasks: [], // 正在进行的任务
  history: [], // 历史记录
  loading: false,
  error: null,
}

// 添加新任务并创建数据库记录
const addTaskWithApi = createAsyncThunk(
  'transfer/addTaskWithApi',
  async (task: TransferTask) => {
    const response = await transferApi.createTransfer({
      fileId: task.fileId,
      fileName: task.name,
      fileSize: task.size,
      transferType: task.type,
    })
    return { ...task, id: response.id }
  }
)

// 更新任务进度并同步到数据库
const updateTaskProgressWithApi = createAsyncThunk(
  'transfer/updateTaskProgressWithApi',
  async ({ id, progress, speed, transferredSize }: {
    id: string
    progress: number
    speed?: number
    transferredSize?: number
  }) => {
    await transferApi.updateTransferProgress(id, {
      progress,
      speed,
      transferredSize,
    })
    return { id, progress, speed, transferredSize }
  }
)

// 完成任务并同步到数据库
const completeTaskWithApi = createAsyncThunk(
  'transfer/completeTaskWithApi',
  async ({ id, fileId }: { id: string; fileId?: string }) => {
    await transferApi.completeTransfer(id, { fileId })
    return id
  }
)

// 任务失败并同步到数据库
const failTaskWithApi = createAsyncThunk(
  'transfer/failTaskWithApi',
  async ({ id, error }: { id: string; error: string }) => {
    await transferApi.failTransfer(id, { error })
    return { id, error }
  }
)

// 取消任务并同步到数据库
const cancelTaskWithApi = createAsyncThunk(
  'transfer/cancelTaskWithApi',
  async (id: string) => {
    await transferApi.cancelTransfer(id)
    return id
  }
)

// 加载进行中的任务
const loadActiveTasks = createAsyncThunk(
  'transfer/loadActiveTasks',
  async () => {
    const response = await transferApi.getTransfers({ status: 'in_progress' })
    return response.list
  }
)

// 加载历史记录
const loadHistory = createAsyncThunk(
  'transfer/loadHistory',
  async (params?: { page?: number; pageSize?: number }) => {
    const response = await transferApi.getTransfers({
      status: 'completed',
      ...params,
    })
    return response
  }
)

// 删除历史记录
const removeHistoryItemWithApi = createAsyncThunk(
  'transfer/removeHistoryItemWithApi',
  async (id: string) => {
    await transferApi.deleteTransfer(id)
    return id
  }
)

// 清空历史记录
const clearHistoryWithApi = createAsyncThunk(
  'transfer/clearHistoryWithApi',
  async () => {
    await transferApi.clearCompletedTransfers()
  }
)

// 批量删除历史记录
const batchDeleteHistoryWithApi = createAsyncThunk(
  'transfer/batchDeleteHistoryWithApi',
  async (ids: string[]) => {
    await transferApi.batchDeleteTransfers(ids)
    return ids
  }
)

const transferSlice = createSlice({
  name: 'transfer',
  initialState,
  reducers: {
    // 本地添加任务（不调用 API）
    addTask: (state, action: PayloadAction<TransferTask>) => {
      state.tasks.push(action.payload)
    },

    // 本地更新任务进度（不调用 API）
    updateTaskProgress: (
      state,
      action: PayloadAction<{ id: string; progress: number; speed?: number; transferredSize?: number }>,
    ) => {
      const task = state.tasks.find((t) => t.id === action.payload.id)
      if (task) {
        task.progress = action.payload.progress
        task.speed = action.payload.speed
        task.transferredSize = action.payload.transferredSize
        if (task.status === 'pending') {
          task.status = 'uploading'
        }
      }
    },

    // 暂停任务
    pauseTask: (state, action: PayloadAction<string>) => {
      const task = state.tasks.find((t) => t.id === action.payload)
      if (task) {
        task.status = 'paused'
      }
    },

    // 恢复任务
    resumeTask: (state, action: PayloadAction<string>) => {
      const task = state.tasks.find((t) => t.id === action.payload)
      if (task) {
        task.status = 'uploading'
      }
    },

    // 本地任务完成（不调用 API）
    completeTask: (state, action: PayloadAction<string>) => {
      const taskIndex = state.tasks.findIndex((t) => t.id === action.payload)
      if (taskIndex !== -1) {
        const task = state.tasks[taskIndex]
        task.status = 'success'
        task.progress = 100
        task.endTime = Date.now()

        // 移动到历史记录
        state.history.unshift(task)
        state.tasks.splice(taskIndex, 1)
      }
    },

    // 本地任务失败（不调用 API）
    failTask: (state, action: PayloadAction<{ id: string; error: string }>) => {
      const taskIndex = state.tasks.findIndex((t) => t.id === action.payload.id)
      if (taskIndex !== -1) {
        const task = state.tasks[taskIndex]
        task.status = 'error'
        task.error = action.payload.error
        task.endTime = Date.now()

        // 移动到历史记录
        state.history.unshift(task)
        state.tasks.splice(taskIndex, 1)
      }
    },

    // 本地取消任务（不调用 API）
    cancelTask: (state, action: PayloadAction<string>) => {
      const taskIndex = state.tasks.findIndex((t) => t.id === action.payload)
      if (taskIndex !== -1) {
        const task = state.tasks[taskIndex]
        task.status = 'cancelled'
        task.endTime = Date.now()

        // 移动到历史记录
        state.history.unshift(task)
        state.tasks.splice(taskIndex, 1)
      }
    },

    // 本地清除历史记录（不调用 API）
    clearHistory: (state) => {
      state.history = []
    },

    // 本地删除单条历史记录（不调用 API）
    removeHistoryItem: (state, action: PayloadAction<string>) => {
      state.history = state.history.filter((t) => t.id !== action.payload)
    },

    // 重试失败的任务
    retryTask: (state, action: PayloadAction<string>) => {
      const historyIndex = state.history.findIndex(
        (t) => t.id === action.payload,
      )
      if (historyIndex !== -1) {
        const task = state.history[historyIndex]
        task.status = 'pending'
        task.progress = 0
        task.error = undefined
        task.startTime = Date.now()
        task.endTime = undefined

        // 移回任务列表
        state.tasks.push(task)
        state.history.splice(historyIndex, 1)
      }
    },

    // 设置错误
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
  },

  extraReducers: (builder) => {
    // addTaskWithApi
    builder.addCase(addTaskWithApi.pending, (state) => {
      state.loading = true
      state.error = null
    })
    builder.addCase(addTaskWithApi.fulfilled, (state, action) => {
      state.loading = false
      state.tasks.push(action.payload)
    })
    builder.addCase(addTaskWithApi.rejected, (state, action) => {
      state.loading = false
      state.error = action.error.message || '创建任务失败'
    })

    // updateTaskProgressWithApi
    builder.addCase(updateTaskProgressWithApi.fulfilled, (state, action) => {
      const task = state.tasks.find((t) => t.id === action.payload.id)
      if (task) {
        task.progress = action.payload.progress
        task.speed = action.payload.speed
        task.transferredSize = action.payload.transferredSize
        if (task.status === 'pending') {
          task.status = 'uploading'
        }
      }
    })

    // completeTaskWithApi
    builder.addCase(completeTaskWithApi.fulfilled, (state, action) => {
      const taskIndex = state.tasks.findIndex((t) => t.id === action.payload)
      if (taskIndex !== -1) {
        const task = state.tasks[taskIndex]
        task.status = 'success'
        task.progress = 100
        task.endTime = Date.now()

        // 移动到历史记录
        state.history.unshift(task)
        state.tasks.splice(taskIndex, 1)
      }
    })

    // failTaskWithApi
    builder.addCase(failTaskWithApi.fulfilled, (state, action) => {
      const taskIndex = state.tasks.findIndex((t) => t.id === action.payload.id)
      if (taskIndex !== -1) {
        const task = state.tasks[taskIndex]
        task.status = 'error'
        task.error = action.payload.error
        task.endTime = Date.now()

        // 移动到历史记录
        state.history.unshift(task)
        state.tasks.splice(taskIndex, 1)
      }
    })

    // cancelTaskWithApi
    builder.addCase(cancelTaskWithApi.fulfilled, (state, action) => {
      const taskIndex = state.tasks.findIndex((t) => t.id === action.payload)
      if (taskIndex !== -1) {
        const task = state.tasks[taskIndex]
        task.status = 'cancelled'
        task.endTime = Date.now()

        // 移动到历史记录
        state.history.unshift(task)
        state.tasks.splice(taskIndex, 1)
      }
    })

    // loadActiveTasks
    builder.addCase(loadActiveTasks.pending, (state) => {
      state.loading = true
      state.error = null
    })
    builder.addCase(loadActiveTasks.fulfilled, (state, action) => {
      state.loading = false
      // 将数据库记录转换为 TransferTask 格式
      state.tasks = action.payload.map((record) => ({
        id: record.id,
        fileId: record.file_id || undefined,
        name: record.file_name,
        size: record.file_size,
        type: record.transfer_type,
        status: mapStatusToTaskStatus(record.status),
        progress: record.progress,
        speed: record.speed,
        transferredSize: record.transferred_size,
        startTime: new Date(record.started_at).getTime(),
        endTime: record.completed_at ? new Date(record.completed_at).getTime() : undefined,
        error: record.error_message || undefined,
      }))
    })
    builder.addCase(loadActiveTasks.rejected, (state, action) => {
      state.loading = false
      state.error = action.error.message || '加载任务失败'
    })

    // loadHistory
    builder.addCase(loadHistory.pending, (state) => {
      state.loading = true
      state.error = null
    })
    builder.addCase(loadHistory.fulfilled, (state, action) => {
      state.loading = false
      // 将数据库记录转换为 TransferTask 格式
      state.history = action.payload.list.map((record) => ({
        id: record.id,
        fileId: record.file_id || undefined,
        name: record.file_name,
        size: record.file_size,
        type: record.transfer_type,
        status: mapStatusToTaskStatus(record.status),
        progress: record.progress,
        speed: record.speed,
        transferredSize: record.transferred_size,
        startTime: new Date(record.started_at).getTime(),
        endTime: record.completed_at ? new Date(record.completed_at).getTime() : undefined,
        error: record.error_message || undefined,
      }))
    })
    builder.addCase(loadHistory.rejected, (state, action) => {
      state.loading = false
      state.error = action.error.message || '加载历史记录失败'
    })

    // removeHistoryItemWithApi
    builder.addCase(removeHistoryItemWithApi.fulfilled, (state, action) => {
      state.history = state.history.filter((t) => t.id !== action.payload)
    })

    // clearHistoryWithApi
    builder.addCase(clearHistoryWithApi.fulfilled, (state) => {
      state.history = []
    })

    // batchDeleteHistoryWithApi
    builder.addCase(batchDeleteHistoryWithApi.fulfilled, (state, action) => {
      state.history = state.history.filter((t) => !action.payload.includes(t.id))
    })
  },
})

// 辅助函数：将数据库状态映射到任务状态
function mapStatusToTaskStatus(status: string): TransferTask['status'] {
  const statusMap: Record<string, TransferTask['status']> = {
    pending: 'pending',
    in_progress: 'uploading',
    completed: 'success',
    failed: 'error',
    cancelled: 'cancelled',
  }
  return statusMap[status] || 'pending'
}

export const {
  addTask,
  updateTaskProgress,
  pauseTask,
  resumeTask,
  completeTask,
  failTask,
  cancelTask,
  clearHistory,
  removeHistoryItem,
  retryTask,
} = transferSlice.actions

// 导出异步 actions
export {
  addTaskWithApi,
  updateTaskProgressWithApi,
  completeTaskWithApi,
  failTaskWithApi,
  cancelTaskWithApi,
  loadActiveTasks,
  loadHistory,
  removeHistoryItemWithApi,
  clearHistoryWithApi,
  batchDeleteHistoryWithApi,
}

export default transferSlice.reducer
