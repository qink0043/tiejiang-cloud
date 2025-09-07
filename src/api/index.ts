import type { Response } from '@/types'
import axios, { type AxiosResponse } from 'axios'

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
  (response: AxiosResponse): AxiosResponse => {
    return response
  },
  (error) => {
    return Promise.reject(error)
  },
)

export default http
