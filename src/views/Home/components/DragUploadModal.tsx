import React, { useState, useRef } from 'react'
import { Modal, Button, List, message, Typography } from 'antd'
import { UploadOutlined, DeleteOutlined, FileOutlined } from '@ant-design/icons'
import type { UploadFile } from 'antd/lib/upload/interface'
import { useUploadFile } from '@/hooks/useFiles'
import { useAppDispatch } from '@/stores/hooks'
import {
  addTaskWithApi,
  updateTaskProgressWithApi,
  completeTaskWithApi,
  failTaskWithApi,
} from '@/stores/modules/transfer'
import { v4 as uuidv4 } from 'uuid'
import { MultipartUploadManager } from '@/utils/multipartUpload'

const { Text } = Typography

interface DragUploadModalProps {
  open: boolean
  onCancel: () => void
  onUpload: (file: File) => Promise<boolean>
  currentPath: string
}

const DragUploadModal: React.FC<DragUploadModalProps> = ({
  open,
  onCancel,
  currentPath,
}) => {
  const [fileList, setFileList] = useState<UploadFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const uploadManagers = useRef(
    new Map<string, MultipartUploadManager>(),
  ).current
  const dispatch = useAppDispatch()
  const uploadFileMutation = useUploadFile(currentPath)

  // 移除文件
  const handleRemoveFile = (file: UploadFile) => {
    const newFileList = fileList.filter((item) => item.uid !== file.uid)
    setFileList(newFileList)
  }

  // 清空文件列表
  const handleClearAll = () => {
    setFileList([])
  }

  // 拖拽上传处理
  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const items = e.dataTransfer.items
    const files: File[] = []

    if (items) {
      // 处理拖拽的文件和文件夹
      for (let i = 0; i < items.length; i++) {
        const item = items[i].webkitGetAsEntry()
        if (item) {
          await traverseFileTree(item, files)
        }
      }
    } else {
      // 处理拖拽的文件（兼容处理）
      const dragFiles = Array.from(e.dataTransfer.files)
      files.push(...dragFiles)
    }

    // 将文件添加到列表
    const newFileList = files.map((file) => {
      const uid = uuidv4()
      return {
        uid,
        name: file.name,
        status: 'done',
        originFileObj: file,
        size: file.size,
        type: file.type,
      } as UploadFile
    })

    setFileList((prev) => [...prev, ...newFileList])
  }

  // 递归遍历文件夹
  const traverseFileTree = async (
    item: FileSystemEntry,
    files: File[],
    path = '',
  ): Promise<void> => {
    if (item.isFile) {
      // 处理文件
      const fileEntry = item as FileSystemFileEntry
      return new Promise<void>((resolve) => {
        fileEntry.file((file) => {
          files.push(file)
          resolve()
        })
      })
    } else if (item.isDirectory) {
      // 处理文件夹
      const dirEntry = item as FileSystemDirectoryEntry
      const dirReader = dirEntry.createReader()

      return new Promise<void>((resolve) => {
        const readEntries = () => {
          dirReader.readEntries((entries) => {
            if (entries.length === 0) {
              resolve()
            } else {
              const promises: Promise<void>[] = []
              entries.forEach((entry) => {
                promises.push(
                  traverseFileTree(entry, files, `${path}${item.name}/`),
                )
              })

              Promise.all(promises).then(() => {
                readEntries()
              })
            }
          })
        }
        readEntries()
      })
    }
  }

  // 上传单个文件
  const uploadSingleFile = async (file: File): Promise<boolean> => {
    // 创建任务ID
    const taskId = uuidv4()

    // 创建上传管理器
    const manager = new MultipartUploadManager(taskId)
    uploadManagers.set(taskId, manager)

    // 添加到传输任务
    const task = {
      id: taskId,
      name: file.name,
      type: 'upload' as const,
      status: 'pending' as const,
      progress: 0,
      size: file.size,
      startTime: Date.now(),
      path: currentPath,
    }

    // 先创建数据库记录
    try {
      await dispatch(
        addTaskWithApi({
          ...task,
          file: file, // 保存文件引用，用于恢复上传
        }),
      ).unwrap()
    } catch (error: any) {
      message.error(`创建传输记录失败: ${error.message}`)
      return false
    }

    try {
      // 执行上传
      await uploadFileMutation.mutateAsync({
        file,
        path: currentPath,
        taskId,
        onProgress: (progress, speed) => {
          // 更新进度
          dispatch(
            updateTaskProgressWithApi({
              id: taskId,
              progress,
              speed,
            }),
          )
        },
      })

      // 上传成功
      dispatch(completeTaskWithApi({ id: taskId }))
      message.success(`${file.name} 上传成功`)

      // 清理管理器
      uploadManagers.delete(taskId)
      return true
    } catch (error: any) {
      // 上传失败
      dispatch(
        failTaskWithApi({
          id: taskId,
          error: error.message || '上传失败',
        }),
      )
      message.error(`${file.name} 上传失败: ${error.message}`)

      // 清理管理器
      uploadManagers.delete(taskId)
      return false
    }
  }

  // 开始上传所有文件
  const handleStartUpload = async () => {
    if (fileList.length === 0) {
      message.warning('请先选择文件')
      return
    }

    setIsUploading(true)

    // 逐个上传文件
    for (const fileItem of fileList) {
      if (fileItem.originFileObj) {
        await uploadSingleFile(fileItem.originFileObj)
      }
    }

    // 上传完成后关闭模态框并清空列表
    setIsUploading(false)
    setFileList([])
    onCancel()
  }

  // 阻止拖拽事件默认行为
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  return (
    <Modal
      title="拖拽上传文件"
      open={open}
      onCancel={() => {
        if (!isUploading) {
          onCancel()
          setFileList([])
        }
      }}
      footer={[
        <Button
          key="clear"
          onClick={handleClearAll}
          disabled={fileList.length === 0 || isUploading}
        >
          清空列表
        </Button>,
        <Button key="cancel" onClick={onCancel} disabled={isUploading}>
          取消
        </Button>,
        <Button
          key="upload"
          type="primary"
          onClick={handleStartUpload}
          loading={isUploading}
          disabled={fileList.length === 0}
        >
          开始上传
        </Button>,
      ]}
      width={600}
      closable={!isUploading}
      maskClosable={!isUploading}
    >
      <div
        className="drag-upload-area"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        style={{
          border: '2px dashed #d9d9d9',
          borderRadius: '6px',
          padding: '20px',
          textAlign: 'center',
          backgroundColor: '#fafafa',
          cursor: 'pointer',
          marginBottom: '20px',
          transition: 'border-color 0.3s',
        }}
        onMouseEnter={(e) => {
          if (!isUploading) {
            e.currentTarget.style.borderColor = '#40a9ff'
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = '#d9d9d9'
        }}
      >
        <UploadOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
        <p style={{ margin: '10px 0' }}>
          拖拽文件或文件夹到此处，或点击选择文件
        </p>
        <Button type="primary" icon={<UploadOutlined />} disabled={isUploading}>
          选择文件
        </Button>
        <input
          type="file"
          multiple
          style={{ display: 'none' }}
          onChange={(e) => {
            if (e.target.files) {
              const files = Array.from(e.target.files)
              const newFileList = files.map((file) => {
                const uid = uuidv4()
                return {
                  uid,
                  name: file.name,
                  status: 'done',
                  originFileObj: file,
                  size: file.size,
                  type: file.type,
                } as UploadFile
              })
              setFileList((prev) => [...prev, ...newFileList])
            }
            e.target.value = '' // 重置input，允许重复选择相同文件
          }}
          id="fileInput"
        />
        <label
          htmlFor="fileInput"
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            top: 0,
            left: 0,
            cursor: isUploading ? 'not-allowed' : 'pointer',
            opacity: 0,
          }}
        />
      </div>

      {fileList.length > 0 && (
        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '10px',
            }}
          >
            <Text strong>已选择 {fileList.length} 个文件</Text>
          </div>

          <List
            dataSource={fileList}
            renderItem={(file) => (
              <List.Item
                actions={[
                  <Button
                    key="remove"
                    type="text"
                    icon={<DeleteOutlined />}
                    onClick={() => handleRemoveFile(file)}
                    disabled={isUploading}
                  />,
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <FileOutlined
                      style={{ fontSize: '16px', color: '#1890ff' }}
                    />
                  }
                  title={file.name}
                  description={`${(file.size! / 1024 / 1024).toFixed(2)} MB`}
                />
              </List.Item>
            )}
            size="small"
            bordered
            style={{ maxHeight: '300px', overflow: 'auto' }}
          />
        </div>
      )}

      {fileList.length === 0 && (
        <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
          <p>暂无文件</p>
        </div>
      )}
    </Modal>
  )
}

export default DragUploadModal
