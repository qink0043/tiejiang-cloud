import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { getUserInfo, login } from '@/api/modules/user'
import type { LoginForm, UserInfo } from '@/types'
import { message } from 'antd'

// 定义初始状态类型
interface UserState {
  token: string
  userInfo: UserInfo
  loginLoading: boolean
}

// 登录
export const loginAction = createAsyncThunk(
  'user/login',
  async (loginForm: LoginForm, thunkAPI) => {
    try {
      const res = await login(loginForm)
      return res
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || '登录失败')
    }
  },
)

// 获取用户信息
export const getUserInfoAction = createAsyncThunk(
  'user/getUserInfo',
  async (_, thunkAPI) => {
    try {
      return await getUserInfo()
    } catch (err: any) {
      message.error(err.response?.data?.message || '获取用户信息失败')
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || '获取用户信息失败',
      )
    }
  },
)

// 初始状态
const initialState: UserState = {
  token: localStorage.getItem('token') || '',
  userInfo: {} as UserInfo,
  loginLoading: false,
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    logout(state) {
      state.token = ''
      state.userInfo = {} as UserInfo
      localStorage.removeItem('token')
    },
  },
  extraReducers: (builder) => {
    builder
      // 登录
      .addCase(loginAction.pending, (state) => {
        state.loginLoading = true
      })
      .addCase(loginAction.fulfilled, (state, action) => {
        state.loginLoading = false
        console.log('登录返回:', action.payload)
        const token = (action.payload as any)?.token || ''
        state.token = token
        if (token) {
          localStorage.setItem('token', token)
        }
      })
      .addCase(loginAction.rejected, (state) => {
        state.loginLoading = false
      })
      // 获取用户信息
      .addCase(getUserInfoAction.fulfilled, (state, action) => {
        state.userInfo = (action.payload as UserInfo) || ({} as UserInfo)
      })
  },
})

export const { logout } = userSlice.actions
export default userSlice.reducer
