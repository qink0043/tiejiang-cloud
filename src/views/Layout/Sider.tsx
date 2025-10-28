import React, { useContext } from 'react'
import { Layout, Avatar, Menu, Progress, Card, Typography } from 'antd'
import { FileOutlined } from '@ant-design/icons'
import type { MenuProps } from 'antd'
import { ThemeContext } from '../../contexts/ThemeContext'
import type { StorageInfo } from '@/types'
import { formatFileSize } from '@/utils'
import { useSelector } from 'react-redux'
import type { RootState } from '@/stores/types/store'

const { Sider: AntdSider } = Layout
const { Title, Text } = Typography

// 模拟存储信息
const mockStorageInfo: StorageInfo = {
  total: 10737418240, // 10GB
  used: 3221225472, // 3GB
  free: 7516192768, // 7GB
}

const Sider: React.FC = () => {
  const { isDarkMode } = useContext(ThemeContext)
  const { userInfo } = useSelector((state: RootState) => state.user)
  const storagePercentage = (mockStorageInfo.used / mockStorageInfo.total) * 100

  const menuItems: MenuProps['items'] = [
    {
      key: '1',
      icon: <FileOutlined />,
      label: '我的图片',
      className: 'menu-item',
    },
  ]

  return (
    <AntdSider
      width={250}
      theme={isDarkMode ? 'dark' : 'light'}
      style={{
        position: 'fixed',
        height: '100vh',
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 10,
        boxShadow: '2px 0 8px 0 rgba(29, 35, 41, 0.05)',
      }}
    >
      {/* 用户信息和存储空间 */}
      <div className="sider-header">
        <div className="user-info">
          <Avatar size={48} src={userInfo?.avatar} />
          <Title level={5} className="username">
            {userInfo?.username}
          </Title>
        </div>

        <Card className="storage-card" size="small">
          <Title level={5}>存储空间</Title>
          <Progress
            percent={storagePercentage}
            status="active"
            strokeColor={{
              '0%': '#108ee9',
              '100%': '#87d068',
            }}
          />
          <Text type="secondary">
            已用: {formatFileSize(mockStorageInfo.used)} / 总共:{' '}
            {formatFileSize(mockStorageInfo.total)}
          </Text>
        </Card>
      </div>

      {/* 菜单项 */}
      <div className="menu-container">
        <Menu
          mode="inline"
          items={menuItems}
          selectedKeys={['1']}
          className="main-menu"
        />
      </div>
    </AntdSider>
  )
}

export default Sider
