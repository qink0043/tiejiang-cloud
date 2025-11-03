// stores/modules/transfer.ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { TransferTask } from '@/types/transfer'

interface TransferState {
  tasks: TransferTask[]
  history: TransferTask[]
}

const initialState: TransferState = {
  tasks: [], // 正在进行的任务
  history: [], // 历史记录
}

const transferSlice = createSlice({
  name: 'transfer',
  initialState,
  reducers: {
    // 添加新任务
    addTask: (state, action: PayloadAction<TransferTask>) => {
      state.tasks.push(action.payload)
    },

    // 更新任务进度
    updateTaskProgress: (
      state,
      action: PayloadAction<{ id: string; progress: number; speed?: number }>
    ) => {
      const task = state.tasks.find((t) => t.id === action.payload.id)
      if (task) {
        task.progress = action.payload.progress
        task.speed = action.payload.speed
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

    // 任务完成
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

    // 任务失败
    failTask: (
      state,
      action: PayloadAction<{ id: string; error: string }>
    ) => {
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

    // 取消任务
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

    // 清除历史记录
    clearHistory: (state) => {
      state.history = []
    },

    // 删除单条历史记录
    removeHistoryItem: (state, action: PayloadAction<string>) => {
      state.history = state.history.filter((t) => t.id !== action.payload)
    },

    // 重试失败的任务（将其从历史移回任务列表）
    retryTask: (state, action: PayloadAction<string>) => {
      const historyIndex = state.history.findIndex((t) => t.id === action.payload)
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
  },
})

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

export default transferSlice.reducer