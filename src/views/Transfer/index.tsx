// pages/TransferPage/index.tsx
import React, { useEffect, useState } from 'react'
import {
  Card,
  List,
  Progress,
  Button,
  Empty,
  Tag,
  Space,
  Tabs,
  Statistic,
  Row,
  Col,
  Popconfirm,
  Typography,
  message,
} from 'antd'
import {
  UploadOutlined,
  DownloadOutlined,
  CloseCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  DeleteOutlined,
  StopOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined,
  ReloadOutlined,
} from '@ant-design/icons'
import { useAppSelector, useAppDispatch } from '@/stores/hooks'
import {
  clearHistory,
  removeHistoryItem,
  pauseTask,
  resumeTask,
  retryTask,
  loadHistory,
  cancelTaskWithApi,
  completeTaskWithApi,
  failTaskWithApi,
  updateTaskProgressWithApi,
} from '@/stores/modules/transfer'
import { formatFileSize } from '@/utils'
import type { TransferTask } from '@/types/transfer'
import { MultipartUploadManager } from '@/utils/multipartUpload'
import './styles.scss'

const { Title, Text } = Typography

// 全局上传管理器映射
const uploadManagers = new Map<string, MultipartUploadManager>()

const TransferPage: React.FC = () => {
  const dispatch = useAppDispatch()
  const { tasks, history } = useAppSelector((state) => state.transfer)
  const [activeTab, setActiveTab] = useState('ongoing')

  // 格式化速度
  const formatSpeed = (speed?: number): string => {
    if (!speed) return '-'
    if (speed < 1024) return `${speed.toFixed(0)} B/s`
    if (speed < 1024 * 1024) return `${(speed / 1024).toFixed(2)} KB/s`
    return `${(speed / (1024 * 1024)).toFixed(2)} MB/s`
  }

  // 计算剩余时间
  const formatRemainTime = (task: TransferTask): string => {
    if (!task.speed || task.progress === 0) return '-'
    const remainSize = task.size * (1 - task.progress / 100)
    const remainSeconds = Math.ceil(remainSize / task.speed)

    if (remainSeconds < 60) return `${remainSeconds}秒`
    if (remainSeconds < 3600) return `${Math.ceil(remainSeconds / 60)}分钟`
    return `${Math.ceil(remainSeconds / 3600)}小时`
  }

  // 格式化时间
  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp)
    return date.toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // 获取状态标签
  const getStatusTag = (status: TransferTask['status']) => {
    const statusMap = {
      pending: {
        color: 'default',
        icon: <ClockCircleOutlined />,
        text: '等待中',
      },
      uploading: {
        color: 'processing',
        icon: <UploadOutlined />,
        text: '上传中',
      },
      downloading: {
        color: 'processing',
        icon: <DownloadOutlined />,
        text: '下载中',
      },
      paused: {
        color: 'warning',
        icon: <PauseCircleOutlined />,
        text: '已暂停',
      },
      success: {
        color: 'success',
        icon: <CheckCircleOutlined />,
        text: '已完成',
      },
      error: { color: 'error', icon: <CloseCircleOutlined />, text: '失败' },
      cancelled: { color: 'default', icon: <StopOutlined />, text: '已取消' },
    }
    const config = statusMap[status]
    return (
      <Tag color={config.color} icon={config.icon}>
        {config.text}
      </Tag>
    )
  }

  // 暂停任务
  const handlePauseTask = (taskId: string) => {
    const manager = uploadManagers.get(taskId)
    if (manager) {
      manager.pause()
      dispatch(pauseTask(taskId))
      message.info('任务已暂停')
    }
  }

  // 恢复任务
  const handleResumeTask = async (task: TransferTask) => {
    if (!task.file) {
      message.error('无法恢复：文件引用丢失')
      return
    }

    const manager =
      uploadManagers.get(task.id) || new MultipartUploadManager(task.id)
    uploadManagers.set(task.id, manager)

    dispatch(resumeTask(task.id))

    try {
      await manager.resume({
        file: task.file,
        objectKey: `${task.path}/${task.name}`,
        onProgress: (progress) => {
          dispatch(
            updateTaskProgressWithApi({
              id: task.id,
              progress,
            }),
          )
        },
      })

      dispatch(completeTaskWithApi({ id: task.id, fileId: task.fileId }))
      message.success('上传完成')
      uploadManagers.delete(task.id)
    } catch (error: any) {
      dispatch(
        failTaskWithApi({
          id: task.id,
          error: error.message,
        }),
      )
      message.error('上传失败')
      uploadManagers.delete(task.id)
    }
  }

  // 取消任务
  const handleCancelTask = async (taskId: string) => {
    const manager = uploadManagers.get(taskId)
    if (manager) {
      await manager.cancel()
      uploadManagers.delete(taskId)
    }
    dispatch(cancelTaskWithApi(taskId))
    message.info('任务已取消')
  }

  // 重试任务
  const handleRetryTask = async (task: TransferTask) => {
    if (!task.file) {
      message.error('无法重试：文件引用丢失')
      return
    }

    dispatch(retryTask(task.id))

    // 创建新的管理器并开始上传
    const manager = new MultipartUploadManager(task.id)
    uploadManagers.set(task.id, manager)

    try {
      await manager.upload({
        file: task.file,
        objectKey: `${task.path}/${task.name}`,
        onProgress: (progress) => {
          dispatch(
            updateTaskProgressWithApi({
              id: task.id,
              progress,
            }),
          )
        },
      })

      dispatch(completeTaskWithApi({ id: task.id, fileId: task.fileId }))
      message.success('上传完成')
      uploadManagers.delete(task.id)
    } catch (error: any) {
      dispatch(
        failTaskWithApi({
          id: task.id,
          error: error.message,
        }),
      )
      message.error('上传失败')
      uploadManagers.delete(task.id)
    }
  }

  // 清空历史
  const handleClearHistory = () => {
    dispatch(clearHistory())
    message.success('历史记录已清空')
  }

  // 删除历史记录
  const handleDeleteHistory = (taskId: string) => {
    dispatch(removeHistoryItem(taskId))
  }

  // 渲染正在进行的任务
  const renderOngoingTasks = () => (
    <List
      className="transfer-list"
      dataSource={tasks}
      locale={{ emptyText: <Empty description="暂无进行中的任务" /> }}
      renderItem={(task) => (
        <List.Item
          className="transfer-item"
          actions={[
            task.status === 'uploading' && (
              <Button
                key="pause"
                type="text"
                icon={<PauseCircleOutlined />}
                size="small"
                onClick={() => handlePauseTask(task.id)}
              >
                暂停
              </Button>
            ),
            task.status === 'paused' && (
              <Button
                key="resume"
                type="primary"
                icon={<PlayCircleOutlined />}
                size="small"
                onClick={() => handleResumeTask(task)}
              >
                继续
              </Button>
            ),
            <Popconfirm
              key="cancel"
              title="确定取消该任务？已上传的分片将被保留以便继续上传"
              onConfirm={() => handleCancelTask(task.id)}
            >
              <Button
                type="text"
                danger
                icon={<CloseCircleOutlined />}
                size="small"
              >
                取消
              </Button>
            </Popconfirm>,
          ].filter(Boolean)}
        >
          <List.Item.Meta
            avatar={
              task.type === 'upload' ? (
                <UploadOutlined style={{ fontSize: 24, color: '#1890ff' }} />
              ) : (
                <DownloadOutlined style={{ fontSize: 24, color: '#52c41a' }} />
              )
            }
            title={
              <Space>
                <Text strong>{task.name}</Text>
                {getStatusTag(task.status)}
              </Space>
            }
            description={
              <div className="task-details">
                <Progress
                  percent={Math.round(task.progress)}
                  size="small"
                  status={
                    task.status === 'error'
                      ? 'exception'
                      : task.status === 'paused'
                        ? 'normal'
                        : 'active'
                  }
                />
                <Space size="large" className="task-info">
                  {task.status !== 'paused' && (
                    <>
                      <Text type="secondary">
                        速度: {formatSpeed(task.speed)}
                      </Text>
                      <Text type="secondary">
                        剩余: {formatRemainTime(task)}
                      </Text>
                    </>
                  )}
                  <Text type="secondary">
                    大小: {formatFileSize(task.size)}
                  </Text>
                  {task.status === 'paused' && (
                    <Text type="warning">已暂停，可继续上传</Text>
                  )}
                </Space>
              </div>
            }
          />
        </List.Item>
      )}
    />
  )

  // 渲染历史记录
  const renderHistory = () => (
    <div>
      {history.length > 0 && (
        <div className="history-actions">
          <Popconfirm
            title="确定清空所有历史记录？"
            onConfirm={handleClearHistory}
          >
            <Button icon={<DeleteOutlined />} size="small">
              清空历史
            </Button>
          </Popconfirm>
        </div>
      )}
      <List
        className="transfer-list"
        dataSource={history}
        locale={{ emptyText: <Empty description="暂无历史记录" /> }}
        renderItem={(task) => (
          <List.Item
            className="transfer-item"
            actions={[
              task.status === 'error' && task.file && (
                <Button
                  key="retry"
                  type="primary"
                  icon={<ReloadOutlined />}
                  size="small"
                  onClick={() => handleRetryTask(task)}
                >
                  重试
                </Button>
              ),
              <Button
                key="delete"
                type="text"
                danger
                icon={<DeleteOutlined />}
                size="small"
                onClick={() => handleDeleteHistory(task.id)}
              >
                删除
              </Button>,
            ].filter(Boolean)}
          >
            <List.Item.Meta
              avatar={
                task.type === 'upload' ? (
                  <UploadOutlined style={{ fontSize: 24, color: '#1890ff' }} />
                ) : (
                  <DownloadOutlined
                    style={{ fontSize: 24, color: '#52c41a' }}
                  />
                )
              }
              title={
                <Space>
                  <Text
                    strong={task.status === 'success'}
                    delete={task.status === 'error'}
                  >
                    {task.name}
                  </Text>
                  {getStatusTag(task.status)}
                </Space>
              }
              description={
                <Space direction="vertical" size={2}>
                  <Text type="secondary">
                    大小: {formatFileSize(task.size)}
                  </Text>
                  <Text type="secondary">
                    {task.type === 'upload' ? '上传' : '下载'}时间:{' '}
                    {formatTime(task.startTime)}
                    {task.endTime && ` - ${formatTime(task.endTime)}`}
                  </Text>
                  {task.error && <Text type="danger">错误: {task.error}</Text>}
                </Space>
              }
            />
          </List.Item>
        )}
      />
    </div>
  )

  // 统计数据
  const stats = {
    ongoing: tasks.filter((t) => t.status === 'uploading').length,
    paused: tasks.filter((t) => t.status === 'paused').length,
    completed: history.filter((t) => t.status === 'success').length,
    failed: history.filter((t) => t.status === 'error').length,
    total: tasks.length + history.length,
  }
  // 获取传输任务
  useEffect(() => {
    dispatch(loadHistory())
  }, [])

  return (
    <div className="transfer-page">
      <div className="transfer-header">
        <Title level={3}>传输管理</Title>
        <Row gutter={16} className="stats-row">
          <Col span={6}>
            <Card>
              <Statistic
                title="上传中"
                value={stats.ongoing}
                prefix={<UploadOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="已暂停"
                value={stats.paused}
                prefix={<PauseCircleOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="已完成"
                value={stats.completed}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="失败"
                value={stats.failed}
                prefix={<CloseCircleOutlined />}
                valueStyle={{ color: '#ff4d4f' }}
              />
            </Card>
          </Col>
        </Row>
      </div>

      <Card className="transfer-content">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'ongoing',
              label: `进行中 (${tasks.length})`,
              children: renderOngoingTasks(),
            },
            {
              key: 'history',
              label: `历史记录 (${history.length})`,
              children: renderHistory(),
            },
          ]}
        />
      </Card>
    </div>
  )
}

export default TransferPage
