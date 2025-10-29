import Layout from '@/views/Layout/Layout'
import LoginPage from '@/views/Login'
import HomePage from '@/views/Home'

import { createBrowserRouter } from 'react-router-dom'
import GalleryPage from '@/views/Gallery'

// 配置路由实例
const router = createBrowserRouter(
  [
    {
      path: '',
      element: <Layout />,
      children: [
        {
          path: '/home',
          element: <HomePage />,
        },
        {
          path: '/gallery',
          element: <GalleryPage />,
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
