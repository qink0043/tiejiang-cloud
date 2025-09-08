import type { LoginForm } from "@/types"
import http from "."
import type { LoginResponse, RegisterForm, RegisterResponse, UserInfoResponse } from "@/types/user"

export const login = (loginForm: LoginForm) => {
  return http.post<LoginResponse>('/user/login', loginForm)
}

export const getUserInfo = () => {
  return http.get<UserInfoResponse>('/user/info')
}

export const register = (registerForm: RegisterForm) => {
  return http.post<RegisterResponse>('/user/register', registerForm)
}
