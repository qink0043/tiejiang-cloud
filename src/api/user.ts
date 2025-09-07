import type { LoginForm } from "@/types"
import http from "."
import type { LoginResponse } from "@/types/user"

export const login = (loginForm: LoginForm) => {
  return http.post<LoginResponse>('/auth/login', loginForm)
}
