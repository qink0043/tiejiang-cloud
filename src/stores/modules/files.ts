import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

interface FilesState {
  currentPath: string
  selectedFiles: string[]
  viewMode: 'list' | 'gallery'
  sortBy: 'name' | 'size' | 'date'
  sortOrder: 'asc' | 'desc'
  searchKeyword: string
}

const initialState: FilesState = {
  currentPath: '/',
  selectedFiles: [],
  viewMode: 'list',
  sortBy: 'date',
  sortOrder: 'desc',
  searchKeyword: '',
}

const filesSlice = createSlice({
  name: 'files',
  initialState,
  reducers: {
    setCurrentPath: (state, action: PayloadAction<string>) => {
      state.currentPath = action.payload
      state.selectedFiles = [] // 切换路径时清空选中
    },
    setSelectedFiles: (state, action: PayloadAction<string[]>) => {
      state.selectedFiles = action.payload
    },
    toggleSelectFile: (state, action: PayloadAction<string>) => {
      const fileId = action.payload
      const index = state.selectedFiles.indexOf(fileId)
      if (index > -1) {
        state.selectedFiles.splice(index, 1)
      } else {
        state.selectedFiles.push(fileId)
      }
    },
    clearSelection: (state) => {
      state.selectedFiles = []
    },
    setViewMode: (state, action: PayloadAction<'list' | 'gallery'>) => {
      state.viewMode = action.payload
    },
    setSortBy: (state, action: PayloadAction<'name' | 'size' | 'date'>) => {
      state.sortBy = action.payload
    },
    toggleSortOrder: (state) => {
      state.sortOrder = state.sortOrder === 'asc' ? 'desc' : 'asc'
    },
    setSearchKeyword: (state, action: PayloadAction<string>) => {
      state.searchKeyword = action.payload
    },
  },
})

export const {
  setCurrentPath,
  setSelectedFiles,
  toggleSelectFile,
  clearSelection,
  setViewMode,
  setSortBy,
  toggleSortOrder,
  setSearchKeyword,
} = filesSlice.actions

export default filesSlice.reducer
