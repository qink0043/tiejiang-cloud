import type { LoginForm, Response } from '@/types'
import http from '.'
import type {
  EmailRegisterForm,
  LoginResponse,
  UsernameRegisterForm,
} from '@/types/user'
import type { AxiosResponse } from 'axios'

// 登录
export const login = (
  loginForm: LoginForm,
): Promise<AxiosResponse<LoginResponse>> => {
  return http.post<LoginResponse>('/user/login', loginForm)
}

// 获取邮箱验证码
export const getEmailCaptcha = (
  email: string,
): Promise<AxiosResponse<Response>> => {
  return http.post<Response>('/email/send-code', { email })
}

// 邮箱注册
export const emailRegister = (
  registerForm: EmailRegisterForm,
): Promise<AxiosResponse<Response>> => {
  return http.post<Response>('/user/register/email', registerForm)
}

// 用户名注册
export const usernameRegister = (
  registerForm: UsernameRegisterForm,
): Promise<AxiosResponse<Response>> => {
  return http.post<Response>('/user/register/username', registerForm)
}
