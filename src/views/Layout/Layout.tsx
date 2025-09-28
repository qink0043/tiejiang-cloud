import { Layout as AntdLayout } from 'antd'
import { Outlet } from 'react-router-dom'
import Header from './Header'
import Sider from './Sider'
import './styles.scss'

const { Content } = AntdLayout

const Layout = () => {
  return (
    <AntdLayout style={{ minHeight: '100vh' }}>
      <Sider />
      <AntdLayout style={{ marginLeft: 250, minHeight: '100vh' }}>
        <Header />
        <Content style={{ 
          margin: '88px 16px 0', 
          overflow: 'initial',
          backgroundColor: 'transparent'
        }}>
          {/* Outlet 组件会渲染当前匹配的子路由组件 */}
          <Outlet />
        </Content>
      </AntdLayout>
    </AntdLayout>
  )
}

export default Layout
