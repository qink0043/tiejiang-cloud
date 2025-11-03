import {
  MultipartUploadManager,
  shouldUseMultipart,
  simpleUpload,
} from '@/utils/multipartUpload'
import http from '..'
import type { FileItem, UploadFileParams } from '@/types/file'

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

  // 上传文件（支持分片和断点续传）
  uploadFile: async (params: UploadFileParams): Promise<FileItem> => {
    const { file, path, onProgress, taskId } = params

    // 1. 先调用后端接口准备上传
    const prepareResponse = await http.post<{
      objectKey: string
      fileId: string
    }>('/files/prepare-upload', {
      fileName: file.name,
      fileSize: file.size,
      path: path,
    })

    const { objectKey, fileId } = prepareResponse

    try {
      // 2. 判断是否使用分片上传
      if (shouldUseMultipart(file.size)) {
        // 大文件：使用分片上传
        const manager = new MultipartUploadManager(taskId || fileId)

        let lastUpdateTime = Date.now()
        let lastLoaded = 0

        await manager.upload({
          file,
          objectKey,
          partSize: 5 * 1024 * 1024, // 5MB 分片
          parallel: 3, // 并行上传 3 个分片
          onProgress: (percent) => {
            // 计算上传速度
            const now = Date.now()
            const timeDiff = (now - lastUpdateTime) / 1000 // 秒
            const loaded = (file.size * percent) / 100
            const loadedDiff = loaded - lastLoaded

            if (timeDiff > 0) {
              const speed = loadedDiff / timeDiff // 字节/秒
              onProgress?.(percent, speed)
            }

            lastUpdateTime = now
            lastLoaded = loaded
          },
        })
      } else {
        // 小文件：简单上传
        let lastUpdateTime = Date.now()
        let lastLoaded = 0

        await simpleUpload(file, objectKey, (percent) => {
          const now = Date.now()
          const timeDiff = (now - lastUpdateTime) / 1000
          const loaded = (file.size * percent) / 100
          const loadedDiff = loaded - lastLoaded

          if (timeDiff > 0) {
            const speed = loadedDiff / timeDiff
            onProgress?.(percent, speed)
          }

          lastUpdateTime = now
          lastLoaded = loaded
        })
      }

      // 3. 通知后端上传完成
      const fileItem = await http.post<FileItem>('/files/complete-upload', {
        fileId,
        objectKey,
        fileName: file.name,
        fileSize: file.size,
        path: path,
      })

      return fileItem
    } catch (error: any) {
      // 如果上传失败，通知后端
      await http
        .post('/files/upload-failed', {
          fileId,
          error: error.message,
        })
        .catch(() => {
          // 忽略通知失败的错误
        })

      throw error
    }
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
