import type { LoginForm } from './user'

// 统一的响应参数
export interface Response<T = any> {
  message: string
  code: number
  data: T | null
  timestamp: string
}

export type { LoginForm }