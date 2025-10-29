import React, { useContext } from 'react'
import { Layout, Switch, Button, Avatar, Dropdown } from 'antd'
import { BulbOutlined } from '@ant-design/icons'
import { ThemeContext } from '../../contexts/ThemeContext'
import './styles.scss'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState } from '@/stores/types/store'

const { Header: AntdHeader } = Layout
import IconFont from '../../contexts/IconFontContext'
import { logout } from '@/stores/modules/user'
import { useNavigate } from 'react-router-dom'

const Header: React.FC = () => {
  // 使用 useContext 消费 ThemeContext
  const { isDarkMode, toggleTheme } = useContext(ThemeContext)
  const { userInfo } = useSelector((state: RootState) => state.user)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  
  // 退出登录
  const handleLogout = () => {
    dispatch(logout())
    // 跳转到登录页
    navigate('/login')
  }

  return (
    <AntdHeader className="header-container" style={{ padding: 0 }}>
      <div className="logo">
        <span>铁匠云盘</span>
      </div>
      <div className="option-btns">
        <span>
          <BulbOutlined />
          {isDarkMode ? '暗色模式' : '亮色模式'}
        </span>
        {/* 直接调用从 Context 中获取的 toggleTheme 函数 */}
        <Switch checked={isDarkMode} onChange={toggleTheme} />
        <Button shape="round">
          <IconFont type="icon-chuanshu" />
        </Button>
        <div className="user-info">
          <Dropdown
            trigger={['click']}
            menu={{
              items: [
                {
                  label: '个人中心',
                  key: 'profile',
                  icon: <IconFont type="icon-yonghu" />,
                },
                {
                  label: '退出登录',
                  key: 'logout',
                  icon: <IconFont type="icon-tuichu" />,
                  onClick: handleLogout,
                },
              ],
            }}
          >
            <Avatar size={48} src={userInfo?.avatar} />
          </Dropdown>
        </div>
      </div>
    </AntdHeader>
  )
}

export default Header
