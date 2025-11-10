import http from '..'
import type { AxiosResponse } from 'axios'

// 定义返回数据结构
interface PublicGalleryItem {
  id: string
  url: string
  uploader_name: string
  created_at: string
  is_R18: boolean
}

interface PublicGalleryResponse {
  list: PublicGalleryItem[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

// 获取公共图库列表
export const getPublicGalleryList = (
  page: number = 1,
  pageSize: number = 20,
) => {
  return http.get<PublicGalleryResponse>('/public-gallery/list', {
    params: {
      page,
      pageSize,
    },
  })
}

// 上传文件到公共图库
export const uploadToPublicGallery = (fileId: string) => {
  return http.post('/public-gallery/add', {
    fileId,
  })
}