import http from '..'

// 获取sts临时凭证
export const getSTSConfig = async () => {
  return http.post('/sts/sts-token')
}
