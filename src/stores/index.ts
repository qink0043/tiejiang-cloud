import { configureStore } from '@reduxjs/toolkit'
import userReducer from './modules/user'
import filesReducer from './modules/files'
import transferReducer from './modules/transfer'

const store = configureStore({
  reducer: {
    user: userReducer,
    files: filesReducer,
    transfer: transferReducer,
  },
})

export default store
