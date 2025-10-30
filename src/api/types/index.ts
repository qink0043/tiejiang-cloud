import type { AxiosRequestConfig } from 'axios'
import type { AxiosInstance } from 'node_modules/axios/index.d.cts'

export interface CustomAxiosInstance extends AxiosInstance {
  <T = any, R = T>(config: AxiosRequestConfig): Promise<R>
  get<T = any, R = T>(url: string, config?: AxiosRequestConfig): Promise<R>
  delete<T = any, R = T>(url: string, config?: AxiosRequestConfig): Promise<R>
  head<T = any, R = T>(url: string, config?: AxiosRequestConfig): Promise<R>
  options<T = any, R = T>(url: string, config?: AxiosRequestConfig): Promise<R>
  post<T = any, R = T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<R>
  put<T = any, R = T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<R>
  patch<T = any, R = T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<R>
}
