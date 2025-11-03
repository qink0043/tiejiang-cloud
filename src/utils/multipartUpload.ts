// utils/multipartUpload.ts
import OSS from 'ali-oss'
import { getOSSClient } from './oss'
import SparkMD5 from 'spark-md5'

// 分片上传配置
export interface MultipartUploadConfig {
  file: File
  objectKey: string // OSS 中的文件路径
  partSize?: number // 分片大小，默认 5MB
  parallel?: number // 并行上传数，默认 3
  onProgress?: (percent: number, checkpoint?: UploadCheckpoint) => void
  onPartComplete?: (partNum: number, totalParts: number) => void
}

// 上传检查点（用于断点续传）- 扩展 OSS 的 Checkpoint 类型
export interface UploadCheckpoint {
  file: File
  name: string // OSS Checkpoint 必需的属性
  fileSize: number
  partSize: number
  uploadId: string
  objectKey: string // 在 OSS SDK 中对应 name
  doneParts: Array<{
    number: number
    etag: string
  }>
  fileHash?: string // 文件哈希值，用于验证文件是否改变
}

// 计算文件 MD5 哈希
export const calculateFileHash = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const chunkSize = 2 * 1024 * 1024 // 2MB
    const chunks = Math.ceil(file.size / chunkSize)
    let currentChunk = 0
    const spark = new SparkMD5.ArrayBuffer()
    const fileReader = new FileReader()

    fileReader.onload = (e) => {
      spark.append(e.target?.result as ArrayBuffer)
      currentChunk++

      if (currentChunk < chunks) {
        loadNext()
      } else {
        resolve(spark.end())
      }
    }

    fileReader.onerror = () => {
      reject(new Error('文件读取失败'))
    }

    const loadNext = () => {
      const start = currentChunk * chunkSize
      const end = Math.min(start + chunkSize, file.size)
      fileReader.readAsArrayBuffer(file.slice(start, end))
    }

    loadNext()
  })
}

// 本地存储检查点
const CHECKPOINT_KEY_PREFIX = 'oss_upload_checkpoint_'

const saveCheckpoint = (taskId: string, checkpoint: Partial<UploadCheckpoint>) => {
  try {
    // 保存时移除 File 对象，因为它不能序列化
    const { file, ...checkpointData } = checkpoint
    localStorage.setItem(
      `${CHECKPOINT_KEY_PREFIX}${taskId}`,
      JSON.stringify(checkpointData)
    )
  } catch (error) {
    console.error('保存检查点失败:', error)
  }
}

const loadCheckpoint = (taskId: string): Partial<UploadCheckpoint> | null => {
  try {
    const data = localStorage.getItem(`${CHECKPOINT_KEY_PREFIX}${taskId}`)
    return data ? JSON.parse(data) : null
  } catch (error) {
    console.error('加载检查点失败:', error)
    return null
  }
}

const removeCheckpoint = (taskId: string) => {
  try {
    localStorage.removeItem(`${CHECKPOINT_KEY_PREFIX}${taskId}`)
  } catch (error) {
    console.error('删除检查点失败:', error)
  }
}

// 分片上传管理器类
export class MultipartUploadManager {
  private client: OSS | null = null
  private abortController: AbortController | null = null
  private isPaused = false
  private taskId: string

  constructor(taskId: string) {
    this.taskId = taskId
  }

  // 开始上传
  async upload(config: MultipartUploadConfig): Promise<OSS.MultipartUploadResult> {
    this.client = await getOSSClient()
    this.abortController = new AbortController()
    this.isPaused = false

    const {
      file,
      objectKey,
      partSize = 5 * 1024 * 1024, // 默认 5MB
      parallel = 3,
      onProgress,
    } = config

    // 检查是否有断点
    let checkpoint = loadCheckpoint(this.taskId)
    let fileHash: string | undefined

    // 如果有断点，验证文件是否改变
    if (checkpoint && checkpoint.fileHash) {
      fileHash = await calculateFileHash(file)

      // 文件改变了，清除旧的检查点
      if (fileHash !== checkpoint.fileHash) {
        removeCheckpoint(this.taskId)
        checkpoint = null
      }
    }

    // 如果没有文件哈希，计算一个
    if (!fileHash) {
      fileHash = await calculateFileHash(file)
    }

    try {
      // 构建符合 OSS SDK 要求的 checkpoint 对象
      let ossCheckpoint: OSS.Checkpoint | undefined = undefined

      if (checkpoint && checkpoint.uploadId && checkpoint.doneParts) {
        ossCheckpoint = {
          file,
          name: objectKey, // OSS SDK 使用 name 而不是 objectKey
          fileSize: checkpoint.fileSize || file.size,
          partSize: checkpoint.partSize || partSize,
          uploadId: checkpoint.uploadId,
          doneParts: checkpoint.doneParts,
        }
      }

      // 使用 OSS SDK 的分片上传
      const result = await this.client.multipartUpload(objectKey, file, {
        partSize,
        parallel,
        checkpoint: ossCheckpoint,

        progress: (percent, cpt) => {
          // 当 all parts 上传完成 (percent === 1) 时，SDK 可能会调用
          // progress(1.0, undefined)，此时 cpt 为 undefined。
          // 必须在这里添加一个
          if (!cpt) {
            // 如果没有 checkpoint 对象（例如已完成），
            // 仅回调最终进度，然后停止执行后续的 saveCheckpoint
            onProgress?.(percent * 100);
            return;
          }

          // 只有在 cpt 存在时，才保存检查点
          const checkpointData: Partial<UploadCheckpoint> = {
            name: cpt.name,
            objectKey: cpt.name, // 保存为 objectKey 方便理解
            fileSize: cpt.fileSize,
            partSize: cpt.partSize,
            uploadId: cpt.uploadId,
            doneParts: cpt.doneParts,
            fileHash,
          }
          saveCheckpoint(this.taskId, checkpointData)

          // 回调进度
          onProgress?.(percent * 100, {
            ...checkpointData,
            file,
          } as UploadCheckpoint)
        },

        // 自定义头部
        headers: {
          'Content-Type': file.type || 'application/octet-stream',
          // 可以在这里添加自定义元信息
          'x-oss-meta-filename': encodeURIComponent(file.name),
          'x-oss-meta-filesize': file.size.toString(),
        },
      })

      // 上传成功，删除检查点
      removeCheckpoint(this.taskId)

      return result
    } catch (error: any) {
      if (error && error.name === 'cancel') {
        console.log('上传已取消')
        // 你可以根据需要决定是否要 re-throw
        throw new Error('上传已取消')
      }
      console.error('分片上传失败:', error)

      // 其他错误，保留检查点供下次续传
      throw error
    }
  }

  // 暂停上传
  pause() {
    this.isPaused = true
    this.abortController?.abort()
  }

  // 恢复上传
  async resume(config: MultipartUploadConfig) {
    if (!this.isPaused) return
    return this.upload(config)
  }

  // 取消上传
  async cancel() {
    this.abortController?.abort()

    // 取消 OSS 上的分片上传任务
    const checkpoint = loadCheckpoint(this.taskId)
    if (checkpoint && checkpoint.uploadId && this.client) {
      try {
        // 使用 name 字段（对应 objectKey）
        await this.client.abortMultipartUpload(
          checkpoint.name || checkpoint.objectKey || '',
          checkpoint.uploadId
        )
      } catch (error) {
        console.error('取消 OSS 上传任务失败:', error)
      }
    }

    // 删除检查点
    removeCheckpoint(this.taskId)
  }

  // 获取上传进度
  getCheckpoint(): Partial<UploadCheckpoint> | null {
    return loadCheckpoint(this.taskId)
  }
}

// 判断是否需要分片上传
export const shouldUseMultipart = (fileSize: number): boolean => {
  // 大于 10MB 使用分片
  return fileSize > 10 * 1024 * 1024
}

// 简单上传（小文件）
export const simpleUpload = async (
  file: File,
  objectKey: string,
  onProgress?: (percent: number) => void
): Promise<OSS.PutObjectResult> => {
  const client = await getOSSClient()

  // OSS SDK 的 put 方法不支持 progress 回调
  // 对于小文件，我们可以在上传前后触发进度回调
  if (onProgress) {
    onProgress(0)
  }

  const result = await client.put(objectKey, file, {
    headers: {
      'Content-Type': file.type || 'application/octet-stream',
      // 使用 OSS 自定义元信息头部
      'x-oss-meta-filename': encodeURIComponent(file.name),
      'x-oss-meta-filesize': file.size.toString(),
    },
  })

  if (onProgress) {
    onProgress(100)
  }

  return result
}