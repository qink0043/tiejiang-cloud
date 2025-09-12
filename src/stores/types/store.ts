import { configureStore } from '@reduxjs/toolkit'
import userReducer from '../modules/user'

export const store = configureStore({
  reducer: {
    user: userReducer,
  },
})

// 🔑 推导 RootState 和 AppDispatch
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
