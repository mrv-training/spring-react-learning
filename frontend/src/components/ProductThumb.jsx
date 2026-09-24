import { useEffect, useState } from 'react'

const ProductThumb = ({ src, alt, onOpen }) => {
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    setFailed(false)
  }, [src])

  if (!src || failed) {
    return <div className="product-thumb placeholder">No image</div>
  }

  const image = (
    <img
      className="product-thumb clickable"
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
    />
  )

  if (!onOpen) {
    return image
  }

  return (
    <button
      type="button"
      className="image-open"
      aria-label={`View ${alt} image`}
      onClick={onOpen}
    >
      {image}
    </button>
  )
}

export default ProductThumb
