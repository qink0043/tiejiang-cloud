import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fileApi } from '@/api/modules/files'
import type { FileItem, UploadFileParams } from '@/types/file'
import type { CreateFolderParams } from '@/api/modules/files'
import { message } from 'antd'

// Query Keys 常量
export const FILE_QUERY_KEYS = {
  all: ['files'] as const,
  lists: () => [...FILE_QUERY_KEYS.all, 'list'] as const,
  list: (path: string) => [...FILE_QUERY_KEYS.lists(), path] as const,
  details: () => [...FILE_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...FILE_QUERY_KEYS.details(), id] as const,
  search: (keyword: string) =>
    [...FILE_QUERY_KEYS.all, 'search', keyword] as const,
}

/**
 * 获取文件列表
 */
export const useFiles = (path: string = '/') => {
  return useQuery({
    queryKey: FILE_QUERY_KEYS.list(path),
    queryFn: () => fileApi.getFiles(path),
    staleTime: 30000, // 30秒内数据新鲜，不重新请求
    gcTime: 300000, // 缓存 5 分钟
    retry: 2, // 失败重试 2 次
  })
}

/**
 * 获取单个文件详情
 */
export const useFileDetail = (fileId: string) => {
  return useQuery({
    queryKey: FILE_QUERY_KEYS.detail(fileId),
    queryFn: () => fileApi.getFileById(fileId),
    enabled: !!fileId, // 只有当 fileId 存在时才执行
  })
}

/**
 * 搜索文件
 */
export const useSearchFiles = (keyword: string) => {
  return useQuery({
    queryKey: FILE_QUERY_KEYS.search(keyword),
    queryFn: () => fileApi.searchFiles(keyword),
    enabled: keyword.length > 0, // 只有当有搜索关键词时才执行
  })
}

/**
 * 上传文件
 */
export const useUploadFile = (path: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (params: UploadFileParams) => fileApi.uploadFile(params),
    onSuccess: (newFile) => {
      // 更新缓存：将新文件添加到列表中
      queryClient.setQueryData<FileItem[]>(
        FILE_QUERY_KEYS.list(path),
        (oldFiles) => {
          if (!oldFiles) return [newFile]
          return [newFile, ...oldFiles]
        },
      )
      message.success('上传成功')
    },
    onError: (error: any) => {
      message.error(`上传失败: ${error.message || '未知错误'}`)
    },
  })
}

/**
 * 创建文件夹
 */
export const useCreateFolder = (path: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (params: CreateFolderParams) => fileApi.createFolder(params),
    onSuccess: (newFolder) => {
      queryClient.setQueryData<FileItem[]>(
        FILE_QUERY_KEYS.list(path),
        (oldFiles) => {
          if (!oldFiles) return [newFolder]
          return [newFolder, ...oldFiles]
        },
      )
      message.success('文件夹创建成功')
    },
    onError: (error: any) => {
      message.error(`创建失败: ${error.message || '未知错误'}`)
    },
  })
}

/**
 * 删除文件
 */
export const useDeleteFile = (path: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (fileId: string) => fileApi.deleteFile(fileId),
    onSuccess: (_, fileId) => {
      // 从缓存中移除该文件
      queryClient.setQueryData<FileItem[]>(
        FILE_QUERY_KEYS.list(path),
        (oldFiles) => {
          if (!oldFiles) return []
          return oldFiles.filter((file) => file.id !== fileId)
        },
      )
      message.success('删除成功')
    },
    onError: (error: any) => {
      message.error(`删除失败: ${error.message || '未知错误'}`)
    },
  })
}

/**
 * 批量删除文件
 */
export const useBatchDeleteFiles = (path: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (fileIds: string[]) => fileApi.batchDeleteFiles(fileIds),
    onSuccess: (_, fileIds) => {
      queryClient.setQueryData<FileItem[]>(
        FILE_QUERY_KEYS.list(path),
        (oldFiles) => {
          if (!oldFiles) return []
          return oldFiles.filter((file) => !fileIds.includes(file.id))
        },
      )
      message.success(`已删除 ${fileIds.length} 个文件`)
    },
    onError: (error: any) => {
      message.error(`批量删除失败: ${error.message || '未知错误'}`)
    },
  })
}

/**
 * 重命名文件
 */
export const useRenameFile = (path: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ fileId, newName }: { fileId: string; newName: string }) =>
      fileApi.renameFile({ fileId, newName }),
    onSuccess: (updatedFile) => {
      queryClient.setQueryData<FileItem[]>(
        FILE_QUERY_KEYS.list(path),
        (oldFiles) => {
          if (!oldFiles) return []
          return oldFiles.map((file) =>
            file.id === updatedFile.id ? updatedFile : file,
          )
        },
      )
      message.success('重命名成功')
    },
    onError: (error: any) => {
      message.error(`重命名失败: ${error.message || '未知错误'}`)
    },
  })
}

/**
 * 移动文件
 */
export const useMoveFile = (sourcePath: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      fileId,
      targetPath,
    }: {
      fileId: string
      targetPath: string
    }) => fileApi.moveFile({ fileId, targetPath }),
    onSuccess: (_, { fileId, targetPath }) => {
      // 从源路径移除
      queryClient.setQueryData<FileItem[]>(
        FILE_QUERY_KEYS.list(sourcePath),
        (oldFiles) => {
          if (!oldFiles) return []
          return oldFiles.filter((file) => file.id !== fileId)
        },
      )
      // 使目标路径缓存失效
      queryClient.invalidateQueries({
        queryKey: FILE_QUERY_KEYS.list(targetPath),
      })
      message.success('移动成功')
    },
    onError: (error: any) => {
      message.error(`移动失败: ${error.message || '未知错误'}`)
    },
  })
}
