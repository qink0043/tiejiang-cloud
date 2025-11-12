import React, { useEffect, useRef } from 'react'
import {
  Button,
  Input,
  Upload,
  Space,
  Table,
  Radio,
  Image,
  Modal,
  Spin,
  Dropdown,
  message,
} from 'antd'
import {
  SearchOutlined,
  UploadOutlined,
  FolderAddOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  FolderOutlined,
  FileTextOutlined,
  MoreOutlined,
  VideoCameraOutlined,
  FileUnknownOutlined,
  DownloadOutlined,
  DeleteOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { formatFileSize } from '@/utils'
import type { FileItem } from '@/types/file'
import './styles.scss'
import { useAppDispatch, useAppSelector } from '@/stores/hooks'
import { setViewMode, setSearchKeyword } from '@/stores/modules/files'
import {
  useFiles,
  useUploadFile,
  useCreateFolder,
  useDeleteFile,
  useBatchDeleteFiles,
} from '@/hooks/useFiles'
import { CSSTransition } from 'react-transition-group'
import { useNavigate } from 'react-router-dom'
import IconFont from '@/contexts/IconFontContext'
import { uploadToPublicGallery } from '@/api/modules/publicGallery'
import {
  addTaskWithApi,
  updateTaskProgressWithApi,
  completeTaskWithApi,
  failTaskWithApi,
} from '@/stores/modules/transfer'
import { v4 as uuidv4 } from 'uuid'
import { MultipartUploadManager } from '@/utils/multipartUpload'
import { useContextMenu } from 'react-contexify'
import { ContexifyMenu } from '@/contexts/ContexifyContext'

const { Search } = Input

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const getFileIcon = (type: string, extension?: string) => {
  if (type === 'folder') {
    return <FolderOutlined style={{ fontSize: '18px', color: '#1890ff' }} />
  }
  switch (extension?.toLowerCase()) {
    case 'doc':
    case 'docx':
      return <FileTextOutlined style={{ fontSize: '18px', color: '#2f54eb' }} />
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
      return <MoreOutlined style={{ fontSize: '18px', color: '#52c41a' }} />
    case 'mp4':
      return (
        <VideoCameraOutlined style={{ fontSize: '18px', color: '#fa8c16' }} />
      )
    default:
      return (
        <FileUnknownOutlined style={{ fontSize: '18px', color: '#d9d9d9' }} />
      )
  }
}

// 判断是否为图片文件
const isImageFile = (extension?: string): boolean => {
  if (!extension) return false
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg']
  return imageExtensions.includes(extension.toLowerCase())
}

// 图片占位符组件
const ImagePlaceholder: React.FC = () => (
  <div className="image-placeholder-skeleton">
    <div className="skeleton-shimmer"></div>
  </div>
)

const HomePage: React.FC = () => {
  const dispatch = useAppDispatch()
  const { currentPath, viewMode, searchKeyword, selectedFiles } =
    useAppSelector((state) => state.files)

  // React Query Hooks
  const { data: files = [], isLoading, error } = useFiles(currentPath)
  const uploadFileMutation = useUploadFile(currentPath)
  const createFolderMutation = useCreateFolder(currentPath)
  const deleteFileMutation = useDeleteFile(currentPath)
  const batchDeleteMutation = useBatchDeleteFiles(currentPath)
  const navigate = useNavigate()
  const { show } = useContextMenu({ id: 'demo' })

  // 搜索过滤
  const filteredFiles = searchKeyword
    ? files.filter((file) =>
        file.name.toLowerCase().includes(searchKeyword.toLowerCase()),
      )
    : files

  // 图片文件
  const imageFiles = filteredFiles.filter(
    (file) => file.type === 'file' && isImageFile(file.extension),
  )

  const handleSearch = (value: string) => {
    dispatch(setSearchKeyword(value))
  }
  // 存储上传管理器实例
  const uploadManagers = new Map<string, MultipartUploadManager>()
  const handleUpload = async (file: File) => {
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
    }

    return false // 阻止默认上传
  }

  const handleCreateFolder = () => {
    Modal.confirm({
      title: '新建文件夹',
      content: (
        <Input
          placeholder="请输入文件夹名称"
          id="folder-name-input"
          autoFocus
        />
      ),
      cancelText: '取消',
      okText: '新建',
      onOk: () => {
        const input = document.getElementById(
          'folder-name-input',
        ) as HTMLInputElement
        const folderName = input?.value.trim()
        if (folderName) {
          createFolderMutation.mutate({
            name: folderName,
            path: currentPath,
          })
        }
      },
    })
  }

  // 处理删除文件
  const handleDelete = (fileId: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个文件吗？此操作不可恢复。',
      cancelText: '取消',
      okText: '删除',
      okType: 'danger',
      onOk: () => {
        deleteFileMutation.mutate(fileId)
      },
    })
  }

  // 处理批量删除文件
  const handleBatchDelete = () => {
    if (selectedFiles.length === 0) return

    Modal.confirm({
      title: '确认批量删除',
      content: `确定要删除选中的 ${selectedFiles.length} 个文件吗？此操作不可恢复。`,
      okText: '删除',
      okType: 'danger',
      onOk: () => {
        batchDeleteMutation.mutate(selectedFiles)
      },
    })
  }

  // 处理上传到公共图库
  const handleUploadToGallery = (fileId: string) => {
    uploadToPublicGallery(fileId)
      .then(() => {
        message.success('上传到公共图库成功')
      })
      .catch((err) => {
        message.error(err.response.data.message)
      })
  }

  // 处理下载文件
  const handleDownload = (file: FileItem) => {
    message.success('下载成功')
    console.log(file)
  }

  // 处理表格右键
  const handleContextMenu = (e: React.MouseEvent, record: FileItem) => {
    e.preventDefault()
    show({ event: e })
    console.log(record.name)
  }

  const columns: ColumnsType<FileItem> = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      width: 500,
      render: (name: string, record: FileItem) => (
        <Space>
          {getFileIcon(record.type, record.extension)}
          <span
            className={record.type === 'folder' ? 'file-folder' : 'file-name'}
          >
            {name}
          </span>
        </Space>
      ),
    },
    {
      title: '大小',
      dataIndex: 'size',
      key: 'size',
      render: (size?: number) => (size ? formatFileSize(size) : '-'),
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (createdAt: string) => formatDate(createdAt),
    },
    {
      title: '修改时间',
      dataIndex: 'updated_at',
      key: 'updated_at',
      render: (updatedAt: string) => formatDate(updatedAt),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record: FileItem) => (
        <Dropdown
          menu={{
            items: [
              {
                key: 'download',
                label: (
                  <span onClick={() => handleDownload(record)}>
                    <DownloadOutlined /> 下载
                  </span>
                ),
                disabled: record.type === 'folder',
              },
              {
                key: 'delete',
                label: (
                  <span onClick={() => handleDelete(record.id)}>
                    <DeleteOutlined /> 删除
                  </span>
                ),
              },
              {
                key: 'uploadToGallery',
                label: (
                  <span onClick={() => handleUploadToGallery(record.id)}>
                    <IconFont type="icon-tukuguanli" /> 上传到公共图库
                  </span>
                ),
                disabled:
                  record.type === 'folder' || !isImageFile(record.extension),
              },
            ],
          }}
        >
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ]
  if (error) {
    return (
      <div className="error-container">
        <p>加载失败: {(error as Error).message}</p>
        <Button onClick={() => navigate(0)}>重新加载</Button>
      </div>
    )
  }

  const HomePageRef = useRef(null)
  // 在页面卸载时清理所有上传管理器
  useEffect(() => {
    return () => {
      uploadManagers.forEach((manager) => {
        manager.pause() // 暂停所有上传，保存检查点
      })
    }
  }, [])
  return (
    <CSSTransition
      nodeRef={HomePageRef}
      in={true}
      timeout={300}
      classNames="fade"
    >
      <div ref={HomePageRef} className="home-container">
        <div className="home-header">
          <Space>
            <Search
              placeholder="搜索文件或文件夹"
              allowClear
              enterButton={<SearchOutlined />}
              size="middle"
              onSearch={handleSearch}
              style={{ width: 300 }}
            />
            <Upload beforeUpload={handleUpload} showUploadList={false} multiple>
              <Button
                type="primary"
                icon={<UploadOutlined />}
                loading={uploadFileMutation.isPending}
              >
                上传文件
              </Button>
            </Upload>
            <Button
              type="default"
              icon={<FolderAddOutlined />}
              onClick={handleCreateFolder}
              loading={createFolderMutation.isPending}
            >
              新建文件夹
            </Button>
            {selectedFiles.length > 0 && (
              <Button
                danger
                onClick={handleBatchDelete}
                loading={batchDeleteMutation.isPending}
              >
                删除选中 ({selectedFiles.length})
              </Button>
            )}
          </Space>

          <Radio.Group
            value={viewMode}
            onChange={(e) => dispatch(setViewMode(e.target.value))}
            buttonStyle="solid"
          >
            <Radio.Button value="list">
              <UnorderedListOutlined /> 列表
            </Radio.Button>
            <Radio.Button value="gallery">
              <AppstoreOutlined /> 图库
            </Radio.Button>
          </Radio.Group>
        </div>

        <Spin spinning={isLoading} size="large" tip="加载中...">
          {viewMode === 'list' ? (
            <div className="file-list-container">
              <Table
                columns={columns}
                dataSource={filteredFiles}
                rowKey="id"
                pagination={{ pageSize: 10 }}
                onRow={(record) => ({
                  onContextMenu: (e) => handleContextMenu(e, record),
                })}
              />
            </div>
          ) : (
            <div className="gallery-view">
              <Image.PreviewGroup>
                <div className="masonry-grid">
                  {imageFiles.map((file) => (
                    <div key={file.id} className="masonry-item">
                      <div className="image-card">
                        <Image
                          src={file.thumbnail || file.oss_url}
                          alt={file.name}
                          preview
                          placeholder={<ImagePlaceholder />}
                          onLoad={(e) => {
                            const img = e.currentTarget as HTMLImageElement
                            img.style.opacity = '1'
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Image.PreviewGroup>
              {imageFiles.length === 0 && (
                <div className="empty-gallery">
                  <p>暂无图片文件</p>
                </div>
              )}
            </div>
          )}
        </Spin>
        <ContexifyMenu MENU_ID="demo" />
      </div>
    </CSSTransition>
  )
}

export default HomePage
