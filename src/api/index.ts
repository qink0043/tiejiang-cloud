import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse, type AxiosError } from 'axios';

/**
 * 响应数据接口定义
 */
interface ResponseData<T = any> {
  code: number;
  message: string;
  data: T;
}

/**
 * 自定义请求配置
 */
interface CustomRequestConfig extends AxiosRequestConfig {
  skipErrorHandler?: boolean; // 是否跳过错误处理
  showLoading?: boolean; // 是否显示loading
}

/**
 * 创建 axios 实例
 */
const service: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_REACT_APP_API_BASE_URL, // API 基础路径
  timeout: 15000, // 请求超时时间
  headers: {
    'Content-Type': 'application/json;charset=utf-8',
  },
});

/**
 * 请求拦截器
 */
service.interceptors.request.use(
  (config: any) => {
    // 从 localStorage 获取 token
    const token = localStorage.getItem('token');

    // 如果 token 存在,添加到请求头
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 显示 loading (可选)
    if (config.showLoading) {
      // 这里可以调用你的 loading 组件或状态管理
      // store.dispatch(setLoading(true));
    }

    // 可以在这里添加其他自定义头部
    // config.headers['X-Custom-Header'] = 'custom-value';

    return config;
  },
  (error: AxiosError) => {
    // 请求错误处理
    console.error('请求错误:', error);
    return Promise.reject(error);
  }
);

/**
 * 响应拦截器
 */
service.interceptors.response.use(
  (response: AxiosResponse<ResponseData>) => {
    // 隐藏 loading
    // store.dispatch(setLoading(false));

    const { code, message, data } = response.data;

    // 根据自定义的业务状态码进行处理
    switch (code) {
      case 200:
        // 请求成功
        return data;

      case 401:
        // 未授权,清除 token 并跳转到登录页
        localStorage.removeItem('token');
        window.location.href = '/login';
        return Promise.reject(new Error(message || '未授权,请重新登录'));

      case 403:
        // 无权限
        console.error('无权限访问:', message);
        return Promise.reject(new Error(message || '无权限访问'));

      case 500:
        // 服务器错误
        console.error('服务器错误:', message);
        return Promise.reject(new Error(message || '服务器错误'));

      default:
        // 其他错误
        console.error('请求失败:', message);
        return Promise.reject(new Error(message || '请求失败'));
    }
  },
  (error: AxiosError<ResponseData>) => {
    // 隐藏 loading
    // store.dispatch(setLoading(false));

    // 处理 HTTP 错误
    let errorMessage = '请求失败';

    if (error.response) {
      // 服务器返回了错误响应
      const { status, data } = error.response;

      switch (status) {
        case 400:
          errorMessage = data?.message || '请求参数错误';
          break;
        case 401:
          errorMessage = '未授权,请重新登录';
          localStorage.removeItem('token');
          window.location.href = '/login';
          break;
        case 403:
          errorMessage = '拒绝访问';
          break;
        case 404:
          errorMessage = '请求的资源不存在';
          break;
        case 500:
          errorMessage = '服务器内部错误';
          break;
        case 502:
          errorMessage = '网关错误';
          break;
        case 503:
          errorMessage = '服务不可用';
          break;
        case 504:
          errorMessage = '网关超时';
          break;
        default:
          errorMessage = data?.message || `请求失败(${status})`;
      }
    } else if (error.request) {
      // 请求已发送但没有收到响应
      if (error.message.includes('timeout')) {
        errorMessage = '请求超时,请稍后重试';
      } else if (error.message.includes('Network Error')) {
        errorMessage = '网络连接失败,请检查网络设置';
      } else {
        errorMessage = '网络错误,请稍后重试';
      }
    } else {
      // 请求配置出错
      errorMessage = error.message || '请求配置错误';
    }

    console.error('响应错误:', errorMessage);

    // 可以在这里调用全局提示组件
    // message.error(errorMessage);

    return Promise.reject(error);
  }
);

/**
 * 封装的请求方法
 */
class HttpRequest {
  /**
   * GET 请求
   */
  get<T = any>(url: string, config?: CustomRequestConfig): Promise<T> {
    return service.get(url, config);
  }

  /**
   * POST 请求
   */
  post<T = any>(url: string, data?: any, config?: CustomRequestConfig): Promise<T> {
    return service.post(url, data, config);
  }

  /**
   * PUT 请求
   */
  put<T = any>(url: string, data?: any, config?: CustomRequestConfig): Promise<T> {
    return service.put(url, data, config);
  }

  /**
   * DELETE 请求
   */
  delete<T = any>(url: string, config?: CustomRequestConfig): Promise<T> {
    return service.delete(url, config);
  }

  /**
   * PATCH 请求
   */
  patch<T = any>(url: string, data?: any, config?: CustomRequestConfig): Promise<T> {
    return service.patch(url, data, config);
  }

  /**
   * 上传文件
   */
  upload<T = any>(url: string, file: File | FormData, onProgress?: (progress: number) => void): Promise<T> {
    const formData = file instanceof FormData ? file : new FormData();
    if (file instanceof File) {
      formData.append('file', file);
    }

    return service.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });
  }

  /**
   * 下载文件
   */
  download(url: string, filename?: string, config?: CustomRequestConfig): Promise<void> {
    return service.get(url, {
      ...config,
      responseType: 'blob',
    }).then((blob: any) => {
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename || 'download');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    });
  }
}

// 导出实例
export const http = new HttpRequest();

// 导出 axios 实例(用于特殊场景)
export default service;