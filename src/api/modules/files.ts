import http from '..'
import type { FileItem } from '@/types/file'

export interface UploadFileParams {
  file: File
  path: string
  onProgress?: (percent: number) => void
}

export interface CreateFolderParams {
  name: string
  path: string
}

export interface MoveFileParams {
  fileId: string
  targetPath: string
}

export interface RenameFileParams {
  fileId: string
  newName: string
}

export const fileApi = {
  // 获取文件列表
  getFiles: async (path: string = '/'): Promise<FileItem[]> => {
    return http.get('/files', { params: { path } })
  },

  // 获取单个文件信息
  getFileById: async (fileId: string): Promise<FileItem> => {
    return http.get(`/files/${fileId}`)
  },

  // 上传文件
  uploadFile: async (params: UploadFileParams): Promise<FileItem> => {
    const formData = new FormData()
    formData.append('file', params.file)
    formData.append('path', params.path)
    return http.post('/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (params.onProgress && progressEvent.total) {
          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total,
          )
          params.onProgress(percent)
        }
      },
    })
  },

  // 创建文件夹
  createFolder: async (params: CreateFolderParams): Promise<FileItem> => {
    return http.post('/files/folder', params)
  },

  // 删除文件
  deleteFile: async (fileId: string): Promise<void> => {
    return http.delete(`/files/${fileId}`)
  },

  // 批量删除文件
  batchDeleteFiles: async (fileIds: string[]): Promise<void> => {
    return http.post('/files/batch-delete', { fileIds })
  },

  // 重命名文件
  renameFile: async (params: RenameFileParams): Promise<FileItem> => {
    return http.put(`/files/${params.fileId}/rename`, {
      name: params.newName,
    })
  },

  // 移动文件
  moveFile: async (params: MoveFileParams): Promise<FileItem> => {
    return http.put(`/files/${params.fileId}/move`, {
      targetPath: params.targetPath,
    })
  },

  // 下载文件
  downloadFile: async (fileId: string): Promise<Blob> => {
    return http.get(`/files/${fileId}/download`, {
      responseType: 'blob',
    })
  },

  // 搜索文件
  searchFiles: async (keyword: string): Promise<FileItem[]> => {
    return http.get('/files/search', { params: { keyword } })
  },
}
