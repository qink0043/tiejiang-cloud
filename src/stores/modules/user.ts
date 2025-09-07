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
    },
  },
})

// 解构出actionCreator
const { setToken } = userStore.actions

// 导出reducer
const userReducer = userStore.reducer

// 异步方法 完成登录获取token
const fetchLogin = (loginForm: LoginForm) => {
  return async (dispatch: Dispatch) => {
    const res = await login(loginForm)
    if (res.data.code === 200 ) {
      dispatch(setToken(res.data.data?.token))
    }
  }
}

export { setToken }
export default userReducer
