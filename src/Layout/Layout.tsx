import { Layout as AntdLayout, Grid } from 'antd'
import { Outlet } from 'react-router-dom'
import Header from './Header'
import Sider from './Sider'
import './styles.scss'
import { TransitionGroup } from 'react-transition-group'
import { useEffect, useState } from 'react'
import { getUserInfoAction } from '@/stores/modules/user'
import { useAppDispatch } from '@/stores/hooks'

const { Content } = AntdLayout
const { useBreakpoint } = Grid

const Layout = () => {
  const dispatch = useAppDispatch()
  const [collapsed, setCollapsed] = useState(false)
  const screens = useBreakpoint()

  useEffect(() => {
    dispatch(getUserInfoAction())
  }, [dispatch])

  // 根据屏幕尺寸自动折叠侧边栏
  useEffect(() => {
    if (screens.xs) {
      setCollapsed(true)
    } else {
      setCollapsed(false)
    }
  }, [screens])

  const toggleCollapsed = () => {
    setCollapsed(!collapsed)
  }

  return (
    <AntdLayout style={{ minHeight: '100vh' }}>
      <Sider collapsed={collapsed} onCollapse={setCollapsed} />
      <AntdLayout
        style={{ 
          marginLeft: collapsed ? 80 : 250, 
          minHeight: '100vh',
          transition: 'margin-left 0.2s'
        }}
      >
        <Header collapsed={collapsed} onCollapse={toggleCollapsed} />
        <Content
          style={{
            margin: '88px 16px 0',
            overflow: 'hidden',
            backgroundColor: 'transparent',
          }}
        >
          <TransitionGroup>
            {/* Outlet 组件会渲染当前匹配的子路由组件 */}
            <Outlet />
          </TransitionGroup>
        </Content>
      </AntdLayout>
    </AntdLayout>
  )
}

export default Layout