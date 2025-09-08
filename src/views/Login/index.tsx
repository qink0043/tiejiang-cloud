import { Button, Card, Form, Input, Switch } from 'antd'
import logo from '@/assets/logo.jpg'
import { ThemeContext } from '@/contexts/ThemeContext'
import { useContext } from 'react'
import '@/views/Login/index.scss'
import type { LoginForm } from '@/types'
import { fetchLogin } from '@/stores/modules/user'
import { useDispatch } from 'react-redux'

const Login: React.FC = () => {
  const { isDarkMode, toggleTheme } = useContext(ThemeContext)
  const dispatch = useDispatch()
  const onFinish = (values: LoginForm) => {
    // 登录逻辑
    fetchLogin(values)(dispatch)
  }
  const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo)
  }

  return (
    <div className="login">
      <Switch
        checked={isDarkMode}
        onChange={toggleTheme}
        className="theme-switch"
      />
      <Card className="login-container">
        <img src={logo} alt="logo" className="login-logo" />
        {/* 登录表单 */}
        <Form
          validateTrigger={'onBlur'}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
        >
          <Form.Item
            name="emailOrUsername"
            rules={[{ required: true, message: '请输入用户名或邮箱!' }]}
          >
            <Input size="large" placeholder="用户名或邮箱" />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: '你忘了输密码!' }]}
          >
            <Input size="large" placeholder="密码" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" size="large" block>
              登录
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}

export default Login
