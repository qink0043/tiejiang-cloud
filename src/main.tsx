// src/main.tsx
import { useContext, useEffect, useState } from 'react'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { ConfigProvider, FloatButton, Modal, Space, theme } from 'antd'
import { Provider } from 'react-redux'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import 'antd/dist/reset.css'
import '@ant-design/v5-patch-for-react-19'
import './styles/theme.scss'
import './styles/global.scss'
import router from './routes'
import { ThemeProvider, ThemeContext } from './contexts/ThemeContext'
import store from './stores'
import { CustomerServiceOutlined } from '@ant-design/icons'

// 创建 QueryClient 实例
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2, // 失败重试 2 次
      staleTime: 30000, // 30秒内数据新鲜，不重新请求
      gcTime: 300000, // 缓存 5 分钟 (之前叫 cacheTime)
      refetchOnWindowFocus: false, // 窗口聚焦时不自动重新请求
      refetchOnReconnect: true, // 网络重连时重新请求
    },
    mutations: {
      retry: 0, // mutation 失败重试 1 次
    },
  },
})

const RootApp = () => {
  const { isDarkMode } = useContext(ThemeContext)
  const { defaultAlgorithm, darkAlgorithm } = theme
  const [isModalOpen, setIsModalOpen] = useState(false)

  // 点击联系我
  const handleCallMeClick = () => {
    setIsModalOpen(true)
  }

  useEffect(() => {
    // 页面加载时和主题模式改变时，动态切换 body 上的类名
    if (isDarkMode) {
      document.body.classList.add('dark-theme')
    } else {
      document.body.classList.remove('dark-theme')
    }
  }, [isDarkMode])

  return (
    <ConfigProvider
      theme={{
        algorithm: isDarkMode ? darkAlgorithm : defaultAlgorithm,
      }}
    >
      <RouterProvider router={router} />
      <FloatButton
        shape="circle"
        type="primary"
        style={{ insetInlineEnd: 94 }}
        tooltip={<div>联系我</div>}
        icon={<CustomerServiceOutlined />}
        onClick={handleCallMeClick}
      />
      <Modal
        title="联系我"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
      >
        <Space direction="vertical">
          <p>
            QQ: <span>3208013769</span>
          </p>
          <p>
            微信：<span>qink0043</span>
          </p>
          <p>备注来意~</p>
        </Space>
      </Modal>
    </ConfigProvider>
  )
}

const root = createRoot(document.getElementById('root')!)
root.render(
  <StrictMode>
    <ThemeProvider>
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <RootApp />
          {/* 开发环境显示 React Query DevTools */}
          {import.meta.env.DEV && (
            <ReactQueryDevtools initialIsOpen={false} position="bottom" />
          )}
        </QueryClientProvider>
      </Provider>
    </ThemeProvider>
  </StrictMode>,
)
