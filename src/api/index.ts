import axios, { type AxiosResponse } from 'axios'
import store from '@/stores'
import { logout } from '@/stores/modules/user'

const http = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  timeout: 5000,
})

// 请求拦截器
http.interceptors.request.use(
  (config) => {
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// 响应拦截器
http.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse<Response> => {
    return response
  },
  (error) => {
    if (error.respinse && error.response.status === 401) {
      // 处理未授权错误
      localStorage.removeItem('token')
      store.dispatch(logout())
    }
    return Promise.reject(error)
  },
)

export default http
