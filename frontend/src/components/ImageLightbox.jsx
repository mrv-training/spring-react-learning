import { useEffect } from 'react'
import './ImageLightbox.css'

const ImageLightbox = ({ src, alt, onClose }) => {
  useEffect(() => {
    if (!src) {
      return undefined
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [src, onClose])

  if (!src) {
    return null
  }

  return (
    <div className="image-lightbox" onClick={onClose} role="presentation">
      <button type="button" className="image-lightbox-close" onClick={onClose} aria-label="Close image">
        ×
      </button>
      <img
        src={src}
        alt={alt}
        referrerPolicy="no-referrer"
        onClick={(event) => event.stopPropagation()}
      />
    </div>
  )
}

export default ImageLightbox
