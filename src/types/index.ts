import type {
  LoginForm,
  RegisterForm,
  UserInfo,
  EmailRegisterForm,
  UsernameRegisterForm,
  LoginData,
  LoginResponse,
} from './user'
import type {
  FileItem,
  StorageInfo,
  FileSearchParams,
  FileOperationResult,
  FileTypeStats,
} from './file'

// 统一的响应参数
export interface Response<T = any> {
  message: string
  code: number
  data: T | null
  timestamp: string
}

// 用户相关类型
export type {
  LoginForm,
  RegisterForm,
  UserInfo,
  EmailRegisterForm,
  UsernameRegisterForm,
  LoginData,
  LoginResponse,
}

// 文件相关类型
export type {
  FileItem,
  StorageInfo,
  FileSearchParams,
  FileOperationResult,
  FileTypeStats,
}
