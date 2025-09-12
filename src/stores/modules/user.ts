import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { login } from '@/api/user'
import type { LoginForm } from '@/types'
import { message } from 'antd'

// 登录
export const loginAction = createAsyncThunk(
  'user/login',
  async (loginForm: LoginForm, { rejectWithValue }) => {
    try {
      const res = await login(loginForm)
      if (res.data.code === 200) {
        return res.data.data
      } else {
        return rejectWithValue(res.data.message)
      }
    } catch (err: any) {
      return rejectWithValue(err.message)
    }
  }
)

const userSlice = createSlice({
  name: 'user',
  initialState: {
    token: localStorage.getItem('token') || '',
    userInfo: {},
    loginLoading: false,
  },
  reducers: {
    logout(state) {
      state.token = ''
      state.userInfo = {}
      localStorage.removeItem('token') 
    },
  },
  extraReducers: (builder) => {
    builder
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
  },
})

export const { logout } = userSlice.actions
export default userSlice.reducer
