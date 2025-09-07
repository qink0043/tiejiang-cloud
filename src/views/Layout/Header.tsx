// src/components/Layout/Header.tsx
import React, { useContext } from 'react';
import { Layout, Switch, Space } from 'antd';
import { BulbOutlined } from '@ant-design/icons';
import { ThemeContext } from '../../contexts/ThemeContext'; // 导入你的 Context

const { Header: AntdHeader } = Layout;

const Header: React.FC = () => {
  // 使用 useContext 消费 ThemeContext
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);

  return (
    <AntdHeader
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 50px',
      }}
    >
      <div className="logo" />
      <Space>
        <span>
          <BulbOutlined />
          {isDarkMode ? '暗色模式' : '亮色模式'}
        </span>
        {/* 直接调用从 Context 中获取的 toggleTheme 函数 */}
        <Switch checked={isDarkMode} onChange={toggleTheme} />
      </Space>
    </AntdHeader>
  );
};

export default Header;