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
import '@/views/Login/style.scss'
import type { LoginForm } from '@/types'
import type { EmailRegisterForm, UsernameRegisterForm } from '@/types/user'
import {
  emailRegister,
  getEmailCaptcha,
  usernameRegister,
} from '@/api/modules/user'
import { useAppDispatch, useAppSelector } from '@/stores/hooks'
import { loginAction } from '@/stores/modules/user'
import { useNavigate } from 'react-router-dom'

type Align = '登录' | '注册'
const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const { isDarkMode, toggleTheme } = useContext(ThemeContext)
  const [alignValue, setAlignValue] = useState<Align>('登录')
  const [registerType, setRegisterType] = useState<
    'email' | 'username' | 'phone' | 'qq' | ''
  >('')
  // 是否已发送验证码
  const [isCaptchaSent, setIsCaptchaSent] = useState(false)
  // 邮箱后缀
  const [emailSuffix, setEmailSuffix] = useState('@qq.com')
  // 登录表单
  const [loginForm, setLoginForm] = useState<LoginForm>({
    emailOrUsername: '',
    password: '',
  })
  // 邮箱注册表单
  const [emailRegisterForm, setEmailRegisterForm] = useState<EmailRegisterForm>(
    {
      email: '',
      password: '',
      confirmPassword: '',
      captcha: '',
    },
  )
  // 用户名注册表单
  const [usernameRegisterForm, setUsernameRegisterForm] =
    useState<UsernameRegisterForm>({
      username: '',
      password: '',
      confirmPassword: '',
    })

  const dispatch = useAppDispatch()
  const loginLoading = useAppSelector((state) => state.user.loginLoading)
  const onLoginFinish = async (values: LoginForm) => {
    // 登录
    await dispatch(loginAction(values)).unwrap()
    // 登录成功后，跳转到首页
    message.success('登录成功！')
    navigate('/')
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
    setEmailRegisterForm({
      email: '',
      password: '',
      confirmPassword: '',
      captcha: '',
    })
  }

  // 邮箱注册
  const onEmailRegisterFinish = async (values: EmailRegisterForm) => {
    console.log(values)
    // 如果发送过验证码
    if (isCaptchaSent) {
      try {
        const res = await emailRegister(values)
        if (res.data.code === 200) {
          // 注册
        } else {
          throw new Error(res.data.message)
        }
      } catch (error: any) {
        message.open({
          type: 'error',
          content: error.response.data.message,
        })
        return
      }
      return
    } else {
      // 发送验证码
      try {
        values.email = `${values.email}${emailSuffix}`
        console.log(values)
        const res = await getEmailCaptcha(values.email)
        if (res.data.code === 200) {
          message.open({
            type: 'success',
            content: '验证码已发送！',
          })
          setIsCaptchaSent(true)
        } else {
          throw new Error(res.data.message)
        }
      } catch (error: any) {
        message.open({
          type: 'error',
          content: error.response.data.message,
        })
      }
    }
  }
  // 用户名注册
  const onUsernameRegisterFinish = async (values: UsernameRegisterForm) => {
    console.log(values)
    try {
      const res = await usernameRegister(values)
      if (res.data.code === 200) {
        message.open({
          type: 'success',
          content: '注册成功！',
        })
      } else {
        throw new Error(res.data.message)
      }
    } catch (error: any) {
      message.open({
        type: 'error',
        content: error.response.data.message,
      })
      return
    }
  }

  // 可供选择的邮箱后缀
  const emails = (
    <Select
      defaultValue="@qq.com"
      onChange={(value) => setEmailSuffix(value)}
      options={[
        {
          label: '@qq.com',
          value: '@qq.com',
        },
        {
          label: '@163.com',
          value: '@163.com',
        },
        {
          label: '@gmail.com',
          value: '@gmail.com',
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
            <Button type="link" size="large">
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
                ←选择注册方式
              </Button>
              {/* 邮箱注册 */}
              {registerType === 'email' && (
                <Form
                  validateTrigger={'onBlur'}
                  onFinish={onEmailRegisterFinish}
                  onFinishFailed={onRegisterFinishFailed}
                >
                  <Form.Item
                    name="email"
                    rules={[{ required: true, message: '请输入邮箱!' }]}
                  >
                    <Input
                      addonAfter={emails}
                      size="large"
                      placeholder="请输入邮箱"
                    />
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
                      {isCaptchaSent ? '注册' : '获取验证码'}
                    </Button>
                  </Form.Item>
                  {isCaptchaSent && (
                    <Button type="link" size="large">
                      重新获取验证码
                    </Button>
                  )}
                </Form>
              )}
              {/* 用户名注册 */}
              {registerType === 'username' && (
                <Form
                  validateTrigger={'onBlur'}
                  onFinish={onUsernameRegisterFinish}
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

export default LoginPage
