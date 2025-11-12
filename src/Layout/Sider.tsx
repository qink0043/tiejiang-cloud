import React, { useContext } from 'react'
import { Layout, Menu, Progress, Card, Typography } from 'antd'
import { FileOutlined } from '@ant-design/icons'
import type { MenuProps } from 'antd'
import { ThemeContext } from '../contexts/ThemeContext'
import type { RootState } from '@/stores/types/store'
import { formatFileSize } from '@/utils'
import { useNavigate, useLocation } from 'react-router-dom'
import IconFont from '@/contexts/IconFontContext'
import { useSelector } from 'react-redux'

const { Sider: AntdSider } = Layout
const { Title, Text } = Typography

interface SiderProps {
  collapsed?: boolean
  onCollapse?: (collapsed: boolean) => void
}

const Sider: React.FC<SiderProps> = ({ collapsed, onCollapse }) => {
  const { isDarkMode } = useContext(ThemeContext)
  const { userInfo } = useSelector((state: RootState) => state.user)
  const storagePercentage = Math.round(
    ((userInfo?.storage_used || 0) / (userInfo?.storage_quota || 0)) * 100,
  )
  const navigate = useNavigate()
  const location = useLocation()

  const menuItems: MenuProps['items'] = [
    {
      key: '/home',
      icon: <FileOutlined />,
      label: '我的文件',
      className: 'menu-item',
    },
    {
      key: '/gallery',
      icon: <IconFont type="icon-tukuguanli" />,
      label: '公共图库',
      className: 'menu-item',
    },
    {
      key: '/transfer',
      icon: <IconFont type="icon-chuanshu" />,
      label: '文件传输',
      className: 'menu-item',
    },
  ]
  const handleMenuClick: MenuProps['onClick'] = (e) => {
    navigate(e.key)
  }

  return (
    <AntdSider
      width={250}
      collapsed={collapsed}
      onCollapse={onCollapse}
      collapsible
      collapsedWidth={80}
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
        {collapsed ? (
          <div
            style={{
              padding: '12px 0',
              textAlign: 'center',
              height: 60,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: '#1890ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: 12,
              }}
              title={`${storagePercentage}%`}
            >
              {storagePercentage}%
            </div>
          </div>
        ) : (
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
              已用: {formatFileSize(userInfo?.storage_used || 0)} / 总共:{' '}
              {formatFileSize(userInfo?.storage_quota || 0)}
            </Text>
          </Card>
        )}
      </div>

      {/* 菜单项 */}
      <div className="menu-container">
        <Menu
          mode="inline"
          items={menuItems}
          className="main-menu"
          onClick={handleMenuClick}
          selectedKeys={[location.pathname]}
        />
      </div>
    </AntdSider>
  )
}

export default Sider
