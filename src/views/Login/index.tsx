import {
  Button,
  Card,
  Divider,
  Form,
  Input,
  message,
  Segmented,
  Select,
  Switch,
} from 'antd'
import classNames from 'classnames'
import logo from '@/assets/logo.png'
import { ThemeContext } from '@/contexts/ThemeContext'
import { useContext, useEffect, useState } from 'react'
import '@/views/Login/index.scss'
import type { LoginForm } from '@/types'
import { fetchLogin } from '@/stores/modules/user'
import { useDispatch } from 'react-redux'
import type { RegisterForm } from '@/types/user'

type Align = '登录' | '注册'
const Login: React.FC = () => {
  const { isDarkMode, toggleTheme } = useContext(ThemeContext)
  const [alignValue, setAlignValue] = useState<Align>('登录')
  const [registerType, setRegisterType] = useState<
    'email' | 'username' | 'phone' | 'qq' | ''
  >('')
  // 登录表单
  const [loginForm, setLoginForm] = useState<LoginForm>({
    emailOrUsername: '',
    password: '',
  })
  // 注册表单
  const [registerForm, setRegisterForm] = useState<RegisterForm>({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    captcha: '',
  })
  const dispatch = useDispatch()
  const onLoginFinish = (values: LoginForm) => {
    // 登录逻辑
    fetchLogin(values)(dispatch)
  }

  const onRegisterFinish = (values: RegisterForm) => {
    // 注册逻辑
    console.log(values)
  }
  const onLoginFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo)
  }
  const onRegisterFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo)
  }
  // 切换登陆注册清空表单
  const onAlignChange = (value: Align) => {
    setAlignValue(value)
    setLoginForm({
      emailOrUsername: '',
      password: '',
    })
    setRegisterForm({
      email: '',
      username: '',
      password: '',
      confirmPassword: '',
      captcha: '',
    })
  }

  // 可供选择的邮箱后缀
  const emails = (
    <Select
      defaultValue="qq.com"
      options={[
        {
          label: 'qq.com',
          value: 'qq.com',
        },
        {
          label: '163.com',
          value: '163.com',
        },
        {
          label: 'gmail.com',
          value: 'gmail.com',
        },
      ]}
    />
  )

  useEffect(() => {
    if (registerType === 'qq' || registerType === 'phone') {
      message.open({
        type: 'info',
        content: '暂不支持！',
      })
      setRegisterType('')
    }
  }, [registerType])

  return (
    <div className="login">
      <Switch
        checked={isDarkMode}
        onChange={toggleTheme}
        className="theme-switch"
      />
      <Card className="login-container">
        <img src={logo} alt="logo" className="login-logo" />
        <div className="segmented-container">
          <Segmented
            value={alignValue}
            size="large"
            style={{ marginBottom: 8 }}
            onChange={onAlignChange}
            options={['登录', '注册']}
            block
          />
        </div>
        {/* 登录 */}
        {alignValue === '登录' && (
          <Form
            validateTrigger={'onBlur'}
            onFinish={onLoginFinish}
            onFinishFailed={onLoginFinishFailed}
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
            <Button type="link" size="large" block>
              忘记密码
            </Button>
          </Form>
        )}
        {/* 注册表单 */}
        {alignValue === '注册' && (
          <div className="register-container">
            <div
              className={classNames('select-container', {
                active: registerType !== '',
              })}
            >
              <div className="select-btns">
                <Button
                  type="default"
                  size="large"
                  shape="round"
                  block
                  onClick={() => setRegisterType('email')}
                >
                  邮箱注册→
                </Button>
                <Button
                  type="default"
                  size="large"
                  shape="round"
                  block
                  onClick={() => setRegisterType('username')}
                >
                  用户名注册→
                </Button>
              </div>
              <Divider children="其他方式注册" />
              <div className="other btns">
                <Button
                  type="default"
                  size="large"
                  shape="round"
                  block
                  onClick={() => {
                    setRegisterType('phone')
                  }}
                >
                  手机号注册
                </Button>
                <Button
                  type="default"
                  size="large"
                  shape="round"
                  block
                  onClick={() => {
                    setRegisterType('qq')
                  }}
                >
                  QQ注册
                </Button>
              </div>
            </div>
            <div
              className={classNames('register-form', {
                active: registerType !== '',
              })}
            >
              <Button
                type="default"
                onClick={() => {
                  setRegisterType('')
                }}
                className="back-btn"
              >
                ←返回
              </Button>
              {/* 邮箱注册 */}
              {registerType === 'email' && (
                <Form
                  validateTrigger={'onBlur'}
                  onFinish={onRegisterFinish}
                  onFinishFailed={onRegisterFinishFailed}
                >
                  <Form.Item
                    name="email"
                    rules={[{ required: true, message: '请输入邮箱!' }]}
                  >
                    <Input addonAfter={emails} size='large' placeholder="请输入邮箱" />
                  </Form.Item>
                  <Form.Item
                    name="captcha"
                    rules={[{ required: true, message: '请输入验证码!' }]}
                  >
                    <Input.OTP
                      size="large"
                      formatter={(value) => value.replace(/\D/g, '')}
                    />
                  </Form.Item>
                  <Form.Item>
                    <Button type="primary" htmlType="submit" size="large" block>
                      获取验证码
                    </Button>
                  </Form.Item>
                </Form>
              )}
              {/* 用户名注册 */}
              {registerType === 'username' && (
                <Form
                  validateTrigger={'onBlur'}
                  onFinish={onRegisterFinish}
                  onFinishFailed={onRegisterFinishFailed}
                >
                  <Form.Item
                    name="username"
                    rules={[{ required: true, message: '请输入用户名!' }]}
                  >
                    <Input size="large" placeholder="用户名" />
                  </Form.Item>
                  <Form.Item
                    name="password"
                    rules={[{ required: true, message: '请输入密码!' }]}
                  >
                    <Input size="large" placeholder="密码" />
                  </Form.Item>
                  <Form.Item
                    name="confirmPassword"
                    rules={[{ required: true, message: '请输入确认密码!' }]}
                  >
                    <Input size="large" placeholder="确认密码" />
                  </Form.Item>
                  <Form.Item>
                    <Button type="primary" htmlType="submit" size="large" block>
                      注册
                    </Button>
                  </Form.Item>
                </Form>
              )}
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}

export default Login
