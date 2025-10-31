import axios, {
  type AxiosRequestConfig,
  type AxiosResponse,
  type AxiosError,
} from 'axios'
import type { CustomAxiosInstance } from './types'
import { message } from 'antd'

/**
 * 响应数据接口定义
 */
interface ResponseData<T = any> {
  code: number
  message: string
  data: T
}

/**
 * 自定义请求配置
 */
interface CustomRequestConfig extends AxiosRequestConfig {
  skipErrorHandler?: boolean // 是否跳过错误处理
  showLoading?: boolean // 是否显示loading
}

/**
 * 创建 axios 实例
 */
const service: CustomAxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL, // API 基础路径
  timeout: 15000, // 请求超时时间
  headers: {
    'Content-Type': 'application/json;charset=utf-8',
  },
})

/**
 * 请求拦截器
 */
service.interceptors.request.use(
  (config: any) => {
    // 从 localStorage 获取 token
    const token = localStorage.getItem('token')

    // 如果 token 存在,添加到请求头
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // 显示 loading (可选)
    if (config.showLoading) {
      // 这里可以调用你的 loading 组件或状态管理
      // store.dispatch(setLoading(true));
    }

    // 可以在这里添加其他自定义头部
    // config.headers['X-Custom-Header'] = 'custom-value';

    return config
  },
  (error: AxiosError) => {
    // 请求错误处理
    console.error('请求错误:', error)
    return Promise.reject(error)
  },
)

/**
 * 响应拦截器
 */
service.interceptors.response.use(
  <T>(
    response: AxiosResponse<{ code: number; message: string; data: T }>,
  ): T => {
    // 隐藏 loading
    // store.dispatch(setLoading(false));

    const { code, message, data } = response.data

    // 根据自定义的业务状态码进行处理
    switch (code) {
      case 200:
        // 请求成功
        return data

      case 401:
        // 未授权,清除 token 并跳转到登录页
        localStorage.removeItem('token')
        window.location.replace('/cloud/login')
        throw new Error(message || '未授权,请重新登录')

      case 403:
        // 无权限
        console.error('无权限访问:', message)
        throw new Error(message || '无权限访问')

      case 500:
        // 服务器错误
        console.error('服务器错误:', message)
        throw new Error(message || '服务器错误')

      default:
        // 其他错误
        console.error('请求失败:', message)
        throw new Error(message || '请求失败')
    }
  },
  (error: AxiosError<ResponseData>) => {
    // 隐藏 loading
    // store.dispatch(setLoading(false));

    // 处理 HTTP 错误
    let errorMessage = '请求失败'

    if (error.response) {
      // 服务器返回了错误响应
      console.log('服务器返回错误响应:', error.response);
      
      const { status, data } = error.response

      switch (status) {
        case 400:
          errorMessage = data?.message || '请求参数错误'
          break
        case 401:
          errorMessage =  data?.message || '未授权,请重新登录'

          window.location.href = '/cloud/login'
          break
        case 403:
          errorMessage = data?.message || '拒绝访问'
          break
        case 404:
          errorMessage = data?.message || '请求的资源不存在'
          break
        case 500:
          errorMessage = data?.message || '服务器内部错误'
          break
        case 502:
          errorMessage = data?.message || '网关错误'
          break
        case 503:
          errorMessage = data?.message || '服务不可用'
          break
        case 504:
          errorMessage = data?.message || '网关超时'
          break
        default:
          errorMessage = data?.message || `请求失败(${status})`
      }
    } else if (error.request) {
      // 请求已发送但没有收到响应
      if (error.message.includes('timeout')) {
        errorMessage = '请求超时,请稍后重试'
      } else if (error.message.includes('Network Error')) {
        errorMessage = '网络连接失败,请检查网络设置'
      } else {
        errorMessage = '网络错误,请稍后重试'
      }
    } else {
      // 请求配置出错
      errorMessage = error.message || '请求配置错误'
    }

    console.error('响应错误:', errorMessage)

    message.error(errorMessage);

    return Promise.reject(error)
  },
)

/**
 * 封装的请求方法
 */
class HttpRequest {
  get<T = any>(url: string, config?: CustomRequestConfig): Promise<T> {
    return service.get<any, T>(url, config)
  }

  post<T = any>(
    url: string,
    data?: any,
    config?: CustomRequestConfig,
  ): Promise<T> {
    return service.post<any, T>(url, data, config)
  }

  put<T = any>(
    url: string,
    data?: any,
    config?: CustomRequestConfig,
  ): Promise<T> {
    return service.put<any, T>(url, data, config)
  }

  delete<T = any>(url: string, config?: CustomRequestConfig): Promise<T> {
    return service.delete<any, T>(url, config)
  }

  patch<T = any>(
    url: string,
    data?: any,
    config?: CustomRequestConfig,
  ): Promise<T> {
    return service.patch<any, T>(url, data, config)
  }
}

// 导出实例
export const http = new HttpRequest()

// 导出 axios 实例(用于特殊场景)
export default service
