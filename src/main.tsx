// src/main.tsx
import { useContext, useEffect } from 'react'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { ConfigProvider, theme } from 'antd'
import 'antd/dist/reset.css'
import '@ant-design/v5-patch-for-react-19'
import './styles/theme.scss'
import router from './routes'
import { ThemeProvider, ThemeContext } from './contexts/ThemeContext'

const RootApp = () => {
  const { isDarkMode } = useContext(ThemeContext)
  const { defaultAlgorithm, darkAlgorithm } = theme

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
    </ConfigProvider>
  )
}

const root = createRoot(document.getElementById('root')!)
root.render(
  <StrictMode>
    <ThemeProvider>
      <RootApp />
    </ThemeProvider>
  </StrictMode>,
)
