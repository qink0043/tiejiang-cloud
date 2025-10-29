import Layout from '@/Layout/Layout'
import LoginPage from '@/views/Login'
import HomePage from '@/views/Home'

import { createBrowserRouter, Navigate } from 'react-router-dom'
import GalleryPage from '@/views/Gallery'
import TransferPage from '@/views/Transfer'

// 配置路由实例
const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <Layout />,
      children: [
        // 当访问 '/' 时，自动重定向到 '/home'
        {
          index: true, // 表示该子路由是默认路由
          element: <Navigate to="/home" replace />,
        },
        {
          path: '/home',
          element: <HomePage />,
        },
        {
          path: '/gallery',
          element: <GalleryPage />,
        },
        {
          path: '/transfer',
          element: <TransferPage />,
        },
      ],
    },
    {
      path: '/login',
      element: <LoginPage />,
    },
  ],
  {
    basename: '/cloud',
  },
)

export default router
