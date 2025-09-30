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
      if (res.data.code === 200) {
        return res.data.data
      } else {
        return thunkAPI.rejectWithValue(res.data.message)
      }
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
      const res = await getUserInfo()
      if (res.data.code === 200) {
        return res.data.data
      } else {
        return thunkAPI.rejectWithValue(res.data.message)
      }
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.message)
    }
  },
)

// 初始状态
const initialState: UserState = {
  token: localStorage.getItem('token') || '',
  userInfo: {},
  loginLoading: false,
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    logout(state) {
      state.token = ''
      state.userInfo = {}
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
        const token = action.payload?.token || ''
        state.token = token
        state.userInfo = action.payload?.userInfo || {}
        if (token) {
          localStorage.setItem('token', token)
        }
      })
      .addCase(loginAction.rejected, (state, action) => {
        state.loginLoading = false
        message.error(action.payload as string)
      })
      // 获取用户信息
      .addCase(getUserInfoAction.fulfilled, (state, action) => {
        state.userInfo = (action.payload as UserInfo) || ({} as UserInfo)
      })
      .addCase(getUserInfoAction.rejected, (_, action) => {
        message.error(action.payload as string)
      })
  },
})

export const { logout } = userSlice.actions
export default userSlice.reducer
