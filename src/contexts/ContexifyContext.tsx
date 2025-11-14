import { Menu, Item, Separator, useContextMenu } from 'react-contexify'
import 'react-contexify/dist/ReactContexify.css'
import './index.scss'
import type { FileItem } from '@/types/file'
import { fileApi } from '@/api/modules/files'
import { message } from 'antd'
import type { ItemParams } from 'react-contexify'
import type { GalleryImage } from '@/views/Gallery/index'

// 定义右键菜单的ID常量
export const FILE_LIST_MENU_ID = 'file-list-menu'
export const GALLERY_IMAGE_MENU_ID = 'gallery-image-menu'

interface ContextMenuHandlerParams {
  file: FileItem
  onDelete: (fileId: string) => void
  onDownload: (file: FileItem) => void
  onUploadToGallery: (fileId: string) => void
}

interface GalleryContextMenuHandlerParams {
  image: GalleryImage
  onToggleR18: (image: GalleryImage) => void
}

// 处理文件下载
const handleDownload = async ({ file }: { file: FileItem }) => {
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

export const FileListContexifyMenu = () => {
  const { hideAll } = useContextMenu({ id: FILE_LIST_MENU_ID })

  // 处理菜单项点击
  const handleItemClick = ({ id, props }: ItemParams) => {
    hideAll()

    const params: ContextMenuHandlerParams = {
      file: props!.file,
      onDelete: props!.onDelete,
      onDownload: props!.onDownload,
      onUploadToGallery: props!.onUploadToGallery,
    }

    switch (id) {
      case 'download':
        if (params.file.type !== 'folder') {
          handleDownload({ file: params.file })
        }
        break
      case 'delete':
        params.onDelete(params.file.id)
        break
      case 'uploadToGallery':
        if (params.file.type !== 'folder') {
          params.onUploadToGallery(params.file.id)
        }
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
      <Item id="delete" onClick={handleItemClick}>
        <DeleteOutlined /> 删除
      </Item>
      <Separator />
      <Item id="uploadToGallery" onClick={handleItemClick}>
        <UploadOutlined /> 上传到公共图库
      </Item>
    </Menu>
  )
}

export const GalleryImageContexifyMenu = () => {
  const { hideAll } = useContextMenu({ id: GALLERY_IMAGE_MENU_ID })

  // 处理菜单项点击
  const handleItemClick = ({ id, props }: ItemParams) => {
    hideAll()

    const params: GalleryContextMenuHandlerParams = {
      image: props!.image,
      onToggleR18: props!.onToggleR18,
    }

    switch (id) {
      case 'toggleR18':
        params.onToggleR18(params.image)
        break
      default:
        break
    }
  }

  return (
    <Menu id={GALLERY_IMAGE_MENU_ID} animation="scale">
      <Item id="toggleR18" onClick={handleItemClick}>
        <TagOutlined /> <span id="toggle-r18-text">标记为R18</span>
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
const TagOutlined = () => <span>🏷️</span>
