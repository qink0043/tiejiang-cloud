import { configureStore } from '@reduxjs/toolkit'
import userReducer from '../modules/user'
import filesReducer from '../modules/files'

export const store = configureStore({
  reducer: {
    user: userReducer,
    files: filesReducer,
  },
})

// 🔑 推导 RootState 和 AppDispatch
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch