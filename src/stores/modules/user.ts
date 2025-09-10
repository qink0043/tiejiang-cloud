import { login } from '@/api/user'
import type { LoginForm } from '@/types'
import { createSlice, type Dispatch } from '@reduxjs/toolkit'

const userStore = createSlice({
  name: 'user',
  initialState: {
    token: '',
    userInfo: {},
  },
  reducers: {
    setToken(state, action) {
      state.token = action.payload
      if (action.payload) {
        localStorage.setItem('token', action.payload)
      } else {
        localStorage.removeItem('token')
      }
    },
    setUserInfo(state, action) {
      state.userInfo = action.payload
    },
    logout(state) {
      state.token = ''
      state.userInfo = {}
      localStorage.removeItem('token')
    },
  },
})

// 解构出actionCreator
const { setToken, setUserInfo, logout } = userStore.actions

// 导出reducer
const userReducer = userStore.reducer

// 异步方法 完成登录获取token和用户信息
export const fetchLogin = (loginForm: LoginForm) => {
  return async (dispatch: Dispatch) => {
    const res = await login(loginForm)
    if (res.data.code === 200) {
      dispatch(setToken(res.data.data?.token))
      dispatch(setUserInfo(res.data.data?.userInfo))
    }
  }
}

export { setToken, setUserInfo, logout }
export default userReducer
