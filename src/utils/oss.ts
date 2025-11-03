// utils/ossClient.ts
import { getSTSConfig } from '@/api/modules/sts'
import OSS from 'ali-oss'

// OSS 配置接口
export interface OSSConfig {
  region: string
  accessKeyId: string
  accessKeySecret: string
  bucket: string
  stsToken?: string // STS 临时凭证
}

// 获取 OSS 配置（从后端获取临时凭证）
export const getOSSConfig = async (): Promise<OSSConfig> => {
  // 调用后端接口获取 STS 临时凭证
  const res = await getSTSConfig()
  console.log(res);
  return {
    region: res.region,
    accessKeyId: res.accessKeyId,
    accessKeySecret: res.accessKeySecret,
    bucket: res.bucket,
    stsToken: res.securityToken
  }
}

// 创建 OSS 客户端
export const createOSSClient = async (): Promise<OSS> => {
  const config = await getOSSConfig()
  
  return new OSS({
    region: config.region,
    accessKeyId: config.accessKeyId,
    accessKeySecret: config.accessKeySecret,
    bucket: config.bucket,
    stsToken: config.stsToken,
    // 超时时间
    timeout: 60000,
  })
}

// 刷新 OSS 客户端（当 STS token 过期时）
let ossClientInstance: OSS | null = null
let tokenExpireTime: number = 0

export const getOSSClient = async (): Promise<OSS> => {
  const now = Date.now()
  
  // 如果 token 快过期了（提前 5 分钟刷新），重新创建客户端
  // if (!ossClientInstance || now >= tokenExpireTime - 5 * 60 * 1000) {
    ossClientInstance = await createOSSClient()
    // STS token 通常有效期 1 小时
    tokenExpireTime = now + 60 * 60 * 1000
  // }
  
  return ossClientInstance
}