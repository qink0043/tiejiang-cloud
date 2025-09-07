import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import router from './routes'
import { ThemeProvider } from './contexts/ThemeContext'
import { useAntdTheme } from './hooks/useAntdTheme' // 新增的hook
import '@/styles/theme.scss'
import 'antd/dist/reset.css' // 确保Ant Design样式重置
import './index.scss'

// Ant Design主题包装组件
const AntdConfigWrapper = () => {
  const { algorithm } = useAntdTheme();
  
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        algorithm,
        token: {
          colorPrimary: 'var(--primary-color)',
          colorBgContainer: 'var(--card-background)',
          colorText: 'var(--text-color)',
          colorTextSecondary: 'var(--text-color-secondary)',
          colorBorder: 'var(--border-color)',
          colorBgElevated: 'var(--card-background)',
        },
        components: {
          Input: {
            colorBgContainer: 'var(--input-background)',
            colorBorder: 'var(--border-color)',
            hoverBorderColor: 'var(--input-hover-border)',
            activeBorderColor: 'var(--primary-color)',
            activeShadow: 'var(--input-focus-shadow)',
          },
          Select: {
            colorBgContainer: 'var(--input-background)',
            colorBorder: 'var(--border-color)',
          },
        },
      }}
    >
      <RouterProvider router={router} />
    </ConfigProvider>
  );
};

const root = createRoot(document.getElementById('root')!)
root.render(
  <StrictMode>
    <ThemeProvider>
      <AntdConfigWrapper />
    </ThemeProvider>
  </StrictMode>
)