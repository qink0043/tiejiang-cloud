import Layout from '@/views/Layout/Layout'
import Login from '@/views/Login'

import { createBrowserRouter } from 'react-router-dom'

// 配置路由实例
const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
  },
  {
    path: '/login',
    element: <Login />,
  },
])

export default router
