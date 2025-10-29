import http from '..'

// 获取公共图库列表
export const getPublicGalleryList = (page: number = 1, pageSize: number = 20) => {
  return http.get('/public-gallery/list', {
    params: {
      page,
      pageSize,
    }
  })
}

// 上传文件到公共图库
export const uploadToPublicGallery = (fileId: string) => {
  return http.post('/public-gallery/add', {
    fileId,
  })
}