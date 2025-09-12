import { logout } from '@/stores/modules/user'
import { store } from '@/stores/types/store'
import { message } from 'antd'
import axios, { AxiosError, type AxiosResponse } from 'axios'

const http = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  timeout: 5000,
})

// 请求拦截器
http.interceptors.request.use(
  (config) => {
    // 从state中获取token
    const token = store.getState().user.token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// 响应拦截器
http.interceptors.response.use(
  <T>(response: AxiosResponse<T>): T => {
    return response.data
  },
  <T>(error: AxiosError<T>): Promise<T> => {
    const { response } = error
    if (response) {
      if (response.status === 401) {
        message.error('登录已过期，请重新登录')
        store.dispatch(logout())
        if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
      }
    }
    return Promise.reject(error)
  },
)

export default http
