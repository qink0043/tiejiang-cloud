import { Layout as AntdLayout } from 'antd';
import { Outlet } from 'react-router-dom';
import Header from './Header';

const { Content } = AntdLayout;

const Layout = () => {
  return (
    <AntdLayout style={{ minHeight: '100vh' }}>
      <Header />
      <AntdLayout>
        <Content style={{ margin: '24px 16px 0', overflow: 'initial' }}>
          {/* Outlet 组件会渲染当前匹配的子路由组件 */}
          <Outlet />
        </Content>
      </AntdLayout>
    </AntdLayout>
  );
};

export default Layout;