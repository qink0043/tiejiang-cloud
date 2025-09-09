import type { Response } from '.'

export interface LoginForm {
  emailOrUsername: string
  password: string
}

export interface UserInfo {
  id: number
  email: string
  username: string
  avatar: string
}

export interface EmailRegisterForm {
  email: string
  password: string
  confirmPassword: string
  captcha: string
}

export interface UsernameRegisterForm {
  username: string
  password: string
  confirmPassword: string
}

export interface LoginData {
  token: string
  userInfo: UserInfo
  expiresIn?: number // token过期时间（秒）
}

export type LoginResponse = Response<LoginData>
