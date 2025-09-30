import React, { useState, useEffect } from 'react'
import {
  Card,
  Button,
  Input,
  Upload,
  message,
  Space,
  Table,
  Dropdown,
} from 'antd'
import {
  SearchOutlined,
  UploadOutlined,
  FolderAddOutlined,
  DownloadOutlined,
  DeleteOutlined,
  MoreOutlined,
  FileTextOutlined,
  FolderOutlined,
  VideoCameraOutlined,
  AudioOutlined,
  FileUnknownOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { formatFileSize } from '@/utils'
import type { UploadProps } from 'antd/es/upload/interface'
import type { FileItem } from '@/types/file'
import './styles.scss'
import { getUserInfoAction } from '@/stores/modules/user'
import { useDispatch } from 'react-redux'
import type { AppDispatch } from '@/stores/types/store'

const { Search } = Input

// 模拟文件数据
const generateMockFiles = (): FileItem[] => {
  const mockFiles: FileItem[] = [
    {
      id: '1',
      name: '项目文档',
      type: 'folder',
      path: '/',
      createdAt: '2023-09-01T10:00:00Z',
      updatedAt: '2023-09-01T10:00:00Z',
      ownerId: 1,
    },
    {
      id: '2',
      name: '产品设计图',
      type: 'folder',
      path: '/',
      createdAt: '2023-09-02T14:30:00Z',
      updatedAt: '2023-09-02T14:30:00Z',
      ownerId: 1,
    },
    {
      id: '3',
      name: '工作报告.docx',
      type: 'file',
      size: 2097152, // 2MB
      extension: 'docx',
      path: '/',
      createdAt: '2023-09-03T09:15:00Z',
      updatedAt: '2023-09-03T09:15:00Z',
      ownerId: 1,
    },
    {
      id: '4',
      name: '会议记录.pdf',
      type: 'file',
      size: 5242880, // 5MB
      extension: 'pdf',
      path: '/',
      createdAt: '2023-09-04T16:45:00Z',
      updatedAt: '2023-09-04T16:45:00Z',
      ownerId: 1,
    },
    {
      id: '5',
      name: '项目计划.xlsx',
      type: 'file',
      size: 1048576, // 1MB
      extension: 'xlsx',
      path: '/',
      createdAt: '2023-09-05T11:20:00Z',
      updatedAt: '2023-09-05T11:20:00Z',
      ownerId: 1,
    },
    {
      id: '6',
      name: '产品展示图.jpg',
      type: 'file',
      size: 3145728, // 3MB
      extension: 'jpg',
      path: '/',
      createdAt: '2023-09-06T13:10:00Z',
      updatedAt: '2023-09-06T13:10:00Z',
      ownerId: 1,
      thumbnail: 'https://via.placeholder.com/150',
    },
    {
      id: '7',
      name: '演示视频.mp4',
      type: 'file',
      size: 15728640, // 15MB
      extension: 'mp4',
      path: '/',
      createdAt: '2023-09-07T15:30:00Z',
      updatedAt: '2023-09-07T15:30:00Z',
      ownerId: 1,
    },
  ]
  return mockFiles
}

// 格式化日期
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

// 获取文件图标
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
    case 'avi':
    case 'mov':
      return (
        <VideoCameraOutlined style={{ fontSize: '18px', color: '#fa8c16' }} />
      )
    case 'mp3':
    case 'wav':
    case 'flac':
      return <AudioOutlined style={{ fontSize: '18px', color: '#eb2f96' }} />
    case 'zip':
    case 'rar':
    case '7z':
      return (
        <FileUnknownOutlined style={{ fontSize: '18px', color: '#13c2c2' }} />
      )
    default:
      return (
        <FileUnknownOutlined style={{ fontSize: '18px', color: '#d9d9d9' }} />
      )
  }
}

const HomePage: React.FC = () => {
  const [files, setFiles] = useState<FileItem[]>([])
  const [filteredFiles, setFilteredFiles] = useState<FileItem[]>([])
  const [searchKeyword, setSearchKeyword] = useState('')
  const [currentPath, setCurrentPath] = useState('/')
  const dispatch = useDispatch<AppDispatch>()

  useEffect(() => {
    // 模拟从API获取文件列表
    setFiles(generateMockFiles())

    // 初始化时获取用户信息
    dispatch(getUserInfoAction())
  }, [])

  useEffect(() => {
    // 根据搜索关键词过滤文件
    if (searchKeyword) {
      const filtered = files.filter((file) =>
        file.name.toLowerCase().includes(searchKeyword.toLowerCase()),
      )
      setFilteredFiles(filtered)
    } else {
      setFilteredFiles(files)
    }
  }, [files, searchKeyword])

  // 处理搜索
  const handleSearch = (value: string) => {
    setSearchKeyword(value)
  }

  // 处理上传
  const handleUpload: UploadProps['onChange'] = ({ file, fileList }) => {
    console.log(file, fileList)
  }

  // 新建文件夹
  const handleCreateFolder = () => {
    const folderName = window.prompt('请输入文件夹名称：')
    if (folderName) {
      const newFolder: FileItem = {
        id: `folder-${Date.now()}`,
        name: folderName,
        type: 'folder',
        path: currentPath,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ownerId: 1,
      }
      setFiles((prev) => [newFolder, ...prev])
      message.success(`文件夹 "${folderName}" 创建成功`)
    }
  }

  // 处理文件删除
  const handleDelete = (fileId: string) => {
    setFiles((prev) => prev.filter((file) => file.id !== fileId))
    message.success('文件已删除')
  }

  // 处理文件下载
  const handleDownload = (file: FileItem) => {
    message.success(`${file.name} 开始下载`)
    // 实际项目中这里应该调用下载API
  }

  // 文件列表列定义
  const columns: ColumnsType<FileItem> = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
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
      title: '修改时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
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
                    <DownloadOutlined />
                    下载
                  </span>
                ),
                disabled: record.type === 'folder',
              },
              {
                key: 'delete',
                label: (
                  <span onClick={() => handleDelete(record.id)}>
                    <DeleteOutlined />
                    删除
                  </span>
                ),
              },
            ],
          }}
        >
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ]

  // 上传配置
  const uploadProps: UploadProps = {
    name: 'file',
    multiple: true,
    action: '/api/upload', // 实际项目中替换为真实的上传接口
    onChange: handleUpload,
    showUploadList: false,
    accept: '*',
  }

  return (
    <div className="home-container">
      {/* 页面头部 */}
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
          <Upload {...uploadProps}>
            <Button type="primary" icon={<UploadOutlined />}>
              上传文件
            </Button>
          </Upload>
          <Button
            type="default"
            icon={<FolderAddOutlined />}
            onClick={handleCreateFolder}
          >
            新建文件夹
          </Button>
        </Space>
      </div>

      {/* 文件列表 */}
      <Card className="file-list-card">
        <Table
          columns={columns}
          dataSource={filteredFiles}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          rowClassName={(record) =>
            record.type === 'folder' ? 'folder-row' : 'file-row'
          }
          onRow={(record) => ({
            onClick: () => {
              if (record.type === 'folder') {
                // 模拟进入文件夹
                setCurrentPath(`${currentPath}${record.name}/`)
              }
            },
          })}
        />
      </Card>
    </div>
  )
}

export default HomePage
