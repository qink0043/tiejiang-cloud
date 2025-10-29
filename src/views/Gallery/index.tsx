import { useRef } from 'react'
import './styles.scss'
import CSSTransition from 'react-transition-group/CSSTransition'

const GalleryPage: React.FC = () => {
  const GalleryPageRef = useRef(null)
  return (
    <CSSTransition
      nodeRef={GalleryPageRef}
      in={true}
      timeout={300}
      classNames="fade"
    >
      <div ref={GalleryPageRef} className="gallery-container">
        公共图库
      </div>
    </CSSTransition>
  )
}

export default GalleryPage
