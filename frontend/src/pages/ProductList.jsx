import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AppHeader from '../components/AppHeader'
import { useAuth } from '../context/AuthContext'
import api from '../utils/axios'
import ImageLightbox from '../components/ImageLightbox'
import ProductThumb from '../components/ProductThumb'
import { productImageSrc } from '../utils/productImage'
import './Products.css'

const MAX_PAGE_BUTTONS = 5

const pageItems = (current, total) => {
  if (total <= 0) {
    return []
  }
  if (total <= MAX_PAGE_BUTTONS) {
    return Array.from({ length: total }, (_, index) => index)
  }

  const windowSize = MAX_PAGE_BUTTONS
  let start = Math.max(0, current - Math.floor(windowSize / 2))
  let end = start + windowSize
  if (end > total) {
    end = total
    start = end - windowSize
  }
  return Array.from({ length: end - start }, (_, index) => start + index)
}

const PAGE_SIZE = 5

const ProductList = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const isAdmin = user?.role === 'ADMIN'
  const [products, setProducts] = useState([])
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [preview, setPreview] = useState(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query.trim())
      setPage(0)
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  const loadProducts = async (pageIndex = page, search = debouncedQuery) => {
    try {
      setLoading(true)
      const response = await api.get('/products', {
        params: { page: pageIndex, size: PAGE_SIZE, q: search },
      })
      const data = response.data
      setProducts(data.content || [])
      setTotalPages(data.totalPages || 0)
      setTotalElements(data.totalElements || 0)
      if (data.totalPages > 0 && pageIndex > data.totalPages - 1) {
        setPage(data.totalPages - 1)
        return
      }
      setError('')
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError('Session expired. Please sign in again.')
        return
      }
      setError(err.response?.data?.message || 'Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProducts(page, debouncedQuery)
  }, [page, debouncedQuery])

  const handleDelete = async (product) => {
    if (!window.confirm(`Delete "${product.name}"?`)) {
      return
    }
    try {
      await api.delete(`/products/${product.id}`)
      await loadProducts(page, debouncedQuery)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete product')
    }
  }

  const from = totalElements === 0 ? 0 : page * PAGE_SIZE + 1
  const to = Math.min((page + 1) * PAGE_SIZE, totalElements)

  return (
    <div className="page-container">
      <AppHeader title="Products" />

      <div className="page-toolbar">
        <input
          type="search"
          placeholder="Search name, SKU, or category"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {isAdmin && (
          <Link to="/products/new" className="primary-button">
            Add product
          </Link>
        )}
      </div>

      <div className="card table-card">
        {loading && <p>Loading products...</p>}
        {!loading && products.length === 0 && <p>No products found.</p>}
        {!loading && products.length > 0 && (
          <table className="product-table">
            <thead>
              <tr>
                <th>SKU</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Image</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>{product.sku}</td>
                  <td>{product.name}</td>
                  <td>{product.category || '-'}</td>
                  <td>${Number(product.price).toFixed(2)}</td>
                  <td>{product.stock}</td>
                  <td>
                    <ProductThumb
                      src={productImageSrc(product.imageUrl)}
                      alt={product.name}
                      onOpen={() =>
                        setPreview({ src: productImageSrc(product.imageUrl), alt: product.name })
                      }
                    />
                  </td>
                  <td>
                    <div className="actions">
                      <button type="button" onClick={() => navigate(`/products/${product.id}`)}>
                        View
                      </button>
                      {isAdmin && (
                        <>
                          <button type="button" onClick={() => navigate(`/products/${product.id}/edit`)}>
                            Edit
                          </button>
                          <button type="button" className="danger" onClick={() => handleDelete(product)}>
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {error && <div className="error-message">{error}</div>}

        <div className="pagination">
          <span>
            {totalElements === 0 ? '0 items' : `${from}-${to} of ${totalElements}`}
          </span>
          <div className="pagination-actions">
            <button type="button" disabled={page <= 0 || loading} onClick={() => setPage(0)}>
              First
            </button>
            <button type="button" disabled={page <= 0 || loading} onClick={() => setPage((current) => current - 1)}>
              Previous
            </button>
            <div className="pagination-pages">
              {pageItems(page, totalPages).map((item) => (
                <button
                  key={item}
                  type="button"
                  className={item === page ? 'active' : ''}
                  disabled={loading}
                  onClick={() => setPage(item)}
                >
                  {item + 1}
                </button>
              ))}
            </div>
            <button
              type="button"
              disabled={page >= totalPages - 1 || loading}
              onClick={() => setPage((current) => current + 1)}
            >
              Next
            </button>
            <button
              type="button"
              disabled={page >= totalPages - 1 || loading}
              onClick={() => setPage(totalPages - 1)}
            >
              Last
            </button>
          </div>
        </div>
      </div>

      <ImageLightbox
        src={preview?.src}
        alt={preview?.alt}
        onClose={() => setPreview(null)}
      />
    </div>
  )
}

export default ProductList
