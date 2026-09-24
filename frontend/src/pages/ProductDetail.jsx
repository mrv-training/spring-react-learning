import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import AppHeader from '../components/AppHeader'
import { useAuth } from '../context/AuthContext'
import api from '../utils/axios'
import ImageLightbox from '../components/ImageLightbox'
import { productImageSrc } from '../utils/productImage'
import './Products.css'

const ProductDetail = () => {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const isAdmin = user?.role === 'ADMIN'
  const [product, setProduct] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [previewOpen, setPreviewOpen] = useState(false)

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const response = await api.get(`/products/${id}`)
        setProduct(response.data)
        setError('')
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load product')
      } finally {
        setLoading(false)
      }
    }

    loadProduct()
  }, [id])

  const handleDelete = async () => {
    if (!product || !window.confirm(`Delete "${product.name}"?`)) {
      return
    }
    try {
      await api.delete(`/products/${product.id}`)
      navigate('/products')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete product')
    }
  }

  return (
    <div className="page-container">
      <AppHeader title="Product details" />

      <div className="card form-card">
        {loading && <p>Loading product...</p>}
        {!loading && product && (
          <>
            {product.imageUrl && (
              <div className="detail-image">
                <button
                  type="button"
                  className="image-open"
                  aria-label={`View ${product.name} image`}
                  onClick={() => setPreviewOpen(true)}
                >
                  <img
                    className="clickable"
                    src={productImageSrc(product.imageUrl)}
                    alt={product.name}
                    referrerPolicy="no-referrer"
                  />
                </button>
              </div>
            )}
            <dl className="detail-list">
              <div>
                <dt>Name</dt>
                <dd>{product.name}</dd>
              </div>
              <div>
                <dt>SKU</dt>
                <dd>{product.sku}</dd>
              </div>
              <div>
                <dt>Category</dt>
                <dd>{product.category || '-'}</dd>
              </div>
              <div>
                <dt>Price</dt>
                <dd>${Number(product.price).toFixed(2)}</dd>
              </div>
              <div>
                <dt>Stock</dt>
                <dd>{product.stock}</dd>
              </div>
              <div>
                <dt>Description</dt>
                <dd>{product.description || '-'}</dd>
              </div>
            </dl>
            <div className="form-actions">
              <Link to="/products" className="secondary-button">
                Back to list
              </Link>
              {isAdmin && (
                <>
                  <Link to={`/products/${product.id}/edit`} className="primary-button">
                    Edit
                  </Link>
                  <button type="button" className="danger-button" onClick={handleDelete}>
                    Delete
                  </button>
                </>
              )}
            </div>
          </>
        )}
        {error && <div className="error-message">{error}</div>}
      </div>

      <ImageLightbox
        src={previewOpen ? productImageSrc(product?.imageUrl) : ''}
        alt={product?.name}
        onClose={() => setPreviewOpen(false)}
      />
    </div>
  )
}

export default ProductDetail
