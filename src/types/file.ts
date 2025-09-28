// 定义文件类型
export interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size?: number; // 文件大小，单位字节
  extension?: string; // 文件扩展名
  path: string; // 文件路径
  createdAt: string; // 创建时间
  updatedAt: string; // 更新时间
  ownerId: number; // 所有者ID
  shared?: boolean; // 是否共享
  thumbnail?: string; // 缩略图URL
}

// 定义存储空间使用情况
export interface StorageInfo {
  total: number; // 总空间，单位字节
  used: number; // 已用空间，单位字节
  free: number; // 剩余空间，单位字节
}

// 定义文件搜索参数
export interface FileSearchParams {
  keyword?: string;
  type?: 'all' | 'file' | 'folder';
  orderBy?: 'name' | 'size' | 'updatedAt';
  orderDirection?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

// 文件操作结果
export interface FileOperationResult {
  success: boolean;
  message?: string;
  data?: any;
}

// 文件分类统计
export interface FileTypeStats {
  type: string; // 文件类型
  count: number; // 数量
  size: number; // 总大小
}