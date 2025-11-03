import { configureStore } from '@reduxjs/toolkit'
import userReducer from '../modules/user'
import filesReducer from '../modules/files'
import transferReducer from '../modules/transfer'

export const store = configureStore({
  reducer: {
    user: userReducer,
    files: filesReducer,
    transfer: transferReducer,
  },
})

// 🔑 推导 RootState 和 AppDispatch
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
