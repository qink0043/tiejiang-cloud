import { Button, Card, Form, Input, Switch } from 'antd';
import logo from '@/assets/logo.jpg'
import '@/views/Login/index.scss'
import { ThemeContext } from '@/contexts/ThemeContext';
import { useContext } from 'react';

const Login: React.FC = () => {
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  return (
    <div className="login">
      <Switch checked={isDarkMode} onChange={toggleTheme} className='theme-switch'/>
      <Card className="login-container">
        <img src={logo} alt="logo" className="login-logo" />
        {/* 登录表单 */}
        <Form>
          <Form.Item name="username">
            <Input size='large' placeholder="请输入用户名或邮箱" />
          </Form.Item>
          <Form.Item name="password">
            <Input size='large' placeholder="请输入密码" />
          </Form.Item>
          <Form.Item>
            <Button type="primary">Happy Work</Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}

export default Login;