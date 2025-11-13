import React from 'react'
import { Menu, Item, Separator, useContextMenu } from 'react-contexify'
import 'react-contexify/dist/ReactContexify.css'
import './index.scss'
import type { FileItem } from '@/types/file'
import { fileApi } from '@/api/modules/files'
import { message } from 'antd'
import type { ItemParams } from 'react-contexify'

// 定义右键菜单的ID常量
export const FILE_LIST_MENU_ID = 'file-list-menu'

interface ContextMenuHandlerParams {
  file: FileItem
}

// 处理文件下载
const handleDownload = async ({ file }: ContextMenuHandlerParams) => {
  try {
    // 调用API下载文件
    const blob = await fileApi.downloadFile(file.id)
    
    // 创建下载链接
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = file.name
    document.body.appendChild(a)
    a.click()
    
    // 清理
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
    
    message.success('文件下载成功')
  } catch (error) {
    console.error('下载失败:', error)
    message.error('文件下载失败')
  }
}

export const ContexifyMenu = () => {
  const { hideAll } = useContextMenu({ id: FILE_LIST_MENU_ID })

  // 处理菜单项点击
  const handleItemClick = ({ id, props }: ItemParams) => {
    hideAll()
    
    const params: ContextMenuHandlerParams = {
      file: props!.file
    }
    
    switch (id) {
      case 'download':
        handleDownload(params)
        break
      case 'delete':
        // 删除功能将在其他地方处理
        break
      case 'uploadToGallery':
        // 上传到公共图库功能将在其他地方处理
        break
      default:
        break
    }
  }

  return (
    <Menu id={FILE_LIST_MENU_ID} animation="scale">
      <Item id="download" onClick={handleItemClick}>
        <DownloadOutlined /> 下载
      </Item>
      <Item id="delete" disabled onClick={handleItemClick}>
        <DeleteOutlined /> 删除
      </Item>
      <Separator />
      <Item id="uploadToGallery" disabled onClick={handleItemClick}>
        <UploadOutlined /> 上传到公共图库
      </Item>
    </Menu>
  )
}

// 为了保持向后兼容性，导出旧的组件
export const ContexifyMenuOld = (props: { MENU_ID: string }) => {
  const { MENU_ID } = props
  return (
    <Menu id={MENU_ID} animation="scale">
      <Item id="1">Item 1</Item>
      <Item id="2">Item 2</Item>
      <Separator />
      <Item id="3">Item 3</Item>
    </Menu>
  )
}

// 图标组件
const DownloadOutlined = () => <span>📥</span>
const DeleteOutlined = () => <span>🗑️</span>
const UploadOutlined = () => <span>📤</span>