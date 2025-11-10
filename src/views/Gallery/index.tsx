import { useEffect, useRef } from 'react'
import './styles.scss'
import CSSTransition from 'react-transition-group/CSSTransition'
import { useInfiniteQuery } from '@tanstack/react-query'
import Masonry from 'react-masonry-css'
import { Image, Spin, Tag } from 'antd'
import { getPublicGalleryList } from '@/api/modules/publicGallery'

// 每页加载数量
const PAGE_SIZE = 20

// 定义图片数据结构
interface GalleryImage {
  id: string
  url: string
  uploader_name: string
  created_at: string
  is_R18: boolean
}

interface GalleryResponse {
  list: GalleryImage[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

const GalleryPage: React.FC = () => {
  const GalleryPageRef = useRef(null)
  const bottomRef = useRef<HTMLDivElement | null>(null)

  // -------------------------------
  // React Query 无限加载逻辑
  // -------------------------------
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useInfiniteQuery<GalleryResponse>({
      queryKey: ['publicGallery'],
      initialPageParam: 1,
      queryFn: async ({ pageParam = 1 }) => {
        const response = await getPublicGalleryList(
          pageParam as number,
          PAGE_SIZE,
        )
        console.log('response', response);
        
        return response
      },
      getNextPageParam: (lastPage) => {
        const { pagination } = lastPage
        const nextPage = pagination.page + 1
        return nextPage <= pagination.totalPages ? nextPage : undefined
      },
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 30,
    })

  // -------------------------------
  // IntersectionObserver 无限滚动
  // -------------------------------
  useEffect(() => {
    if (!bottomRef.current) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage()
        }
      },
      { threshold: 0.1 },
    )
    observer.observe(bottomRef.current)
    return () => observer.disconnect()
  }, [bottomRef, hasNextPage, isFetchingNextPage])

  // 从 list 中获取图片数组
  const allImages = data?.pages.flatMap((page) => page.list) ?? []

  // -------------------------------
  // Masonry 瀑布流配置
  // -------------------------------
  const breakpointColumnsObj = {
    default: 4,
    1200: 3,
    768: 2,
    480: 1,
  }
  return (
    <CSSTransition
      nodeRef={GalleryPageRef}
      in={true}
      timeout={300}
      classNames="fade"
    >
      <div ref={GalleryPageRef} className="gallery-container">
        <div style={{ padding: '20px' }}>
          <h2 style={{ marginBottom: '16px' }}>公共图库</h2>

          {status === 'pending' && (
            <Spin tip="加载中...">
              <div style={{ height: 100 }} />
            </Spin>
          )}

          <Masonry
            breakpointCols={breakpointColumnsObj}
            className="masonry-grid"
            columnClassName="masonry-grid-column"
          >
            {allImages.map((img) => (
              <div key={img.id} className="masonry-item">
                <div className="image-card">
                  <Image
                    src={img.url}
                    alt=""
                    style={{
                      width: '100%',
                      borderRadius: 8,
                      filter: img.is_R18 ? 'blur(16px)' : 'none',
                    }}
                    preview
                    onLoad={(e) => {
                      const imgElement = e.currentTarget as HTMLImageElement
                      imgElement.style.opacity = '1'
                    }}
                  />
                  <div className="image-info">
                    上传者：{img.uploader_name}
                    <br />
                    上传时间：{new Date(img.created_at).toLocaleString()}
                    <br />
                    {img.is_R18 && <Tag color="error">R18</Tag>}
                  </div>
                </div>
              </div>
            ))}
          </Masonry>

          {/* 底部加载提示 */}
          <div ref={bottomRef} style={{ textAlign: 'center', padding: 20 }}>
            {isFetchingNextPage ? (
              <Spin tip="加载更多..." />
            ) : !hasNextPage && status !== 'pending' ? (
              <span style={{ color: '#999' }}>已加载全部图片</span>
            ) : (
              <span style={{ color: '#ccc' }}>下拉加载更多</span>
            )}
          </div>
        </div>
      </div>
    </CSSTransition>
  )
}

export default GalleryPage
