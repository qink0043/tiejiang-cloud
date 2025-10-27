import type { LoginForm, Response } from '@/types'
import http from '..'
import type {
  EmailRegisterForm,
  LoginResponse,
  UsernameRegisterForm,
} from '@/types/user'

// 登录
export const login = (
  loginForm: LoginForm,
): Promise<LoginResponse> => {
  return http.post<LoginResponse>('/user/login', loginForm)
}

// 获取用户信息
export const getUserInfo = () => {
  return http.get<LoginResponse>('/user/me')
}

// 获取邮箱验证码
export const getEmailCaptcha = (
  email: string,
): Promise<Response> => {
  return http.post<Response>('/email/send-code', { email })
}

// 邮箱注册
export const emailRegister = (
  registerForm: EmailRegisterForm,
): Promise<Response> => {
  return http.post<Response>('/user/register/email', registerForm)
}

// 用户名注册
export const usernameRegister = (
  registerForm: UsernameRegisterForm,
): Promise<Response> => {
  return http.post<Response>('/user/register/username', registerForm)
}
