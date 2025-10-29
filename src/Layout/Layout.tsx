import { Layout as AntdLayout } from 'antd'
import { Outlet } from 'react-router-dom'
import Header from './Header'
import Sider from './Sider'
import './styles.scss'
import { TransitionGroup } from 'react-transition-group'
import { useEffect } from 'react'
import { getUserInfoAction } from '@/stores/modules/user'
import { useAppDispatch } from '@/stores/hooks'

const { Content } = AntdLayout

const Layout = () => {
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(getUserInfoAction())
  }, [dispatch])
  return (
    <AntdLayout style={{ minHeight: '100vh' }}>
      <Sider />
      <AntdLayout style={{ marginLeft: 250, minHeight: '100vh' }}>
        <Header />
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
