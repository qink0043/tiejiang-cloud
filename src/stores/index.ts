import { configureStore } from '@reduxjs/toolkit'
import userReducer from './modules/user'
import filesReducer from './modules/files'

const store = configureStore({
  reducer: {
    user: userReducer,
    files: filesReducer,
  },
})

export default store
