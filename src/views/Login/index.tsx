import { Button, Card, Form, Input } from 'antd';
import logo from '@/assets/logo.jpg'
import '@/views/Login/index.scss'

const Login = () => {
  return (
    <div className="login">
      <Card className="login-container">
        <img src={logo} alt="logo" className="login-logo" />
        {/* 登录表单 */}
        <Form>
          <Form.Item>
            <Input size='large' placeholder="请输入用户名或邮箱" />
          </Form.Item>
          <Form.Item>
            <Input size='large' placeholder="请输入密码" />
          </Form.Item>
          <Form.Item>
            <Button size='large' htmlType='submit' type='primary' block>登录</Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}

export default Login;