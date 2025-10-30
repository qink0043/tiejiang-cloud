import { useState } from 'react'
import { ConfigProvider, Button, Space, theme } from 'antd'
import { BulbOutlined } from '@ant-design/icons'

const { defaultAlgorithm, darkAlgorithm } = theme

const App = () => {
  const [isDarkMode, setIsDarkMode] = useState(false)

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
  }

  return (
    <ConfigProvider
      theme={{
        algorithm: isDarkMode ? darkAlgorithm : defaultAlgorithm,
      }}
    >
      <div
        style={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background-color 0.3s',
        }}
      >
        <Space
          direction="vertical"
          size="large"
          style={{ textAlign: 'center' }}
        >
          <h1>主题切换示例</h1>
          <p>当前主题是: {isDarkMode ? '暗色模式' : '亮色模式'}</p>
          <Button type="primary" icon={<BulbOutlined />} onClick={toggleTheme}>
            切换主题
          </Button>
        </Space>
      </div>
    </ConfigProvider>
  )
}

export default App
