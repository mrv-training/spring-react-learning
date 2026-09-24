import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import AppHeader from '../components/AppHeader'
import api from '../utils/axios'
import ImageLightbox from '../components/ImageLightbox'
import { uploadProductImage } from '../utils/productImage'
import './Products.css'

const emptyForm = {
  name: '',
  sku: '',
  description: '',
  price: '',
  stock: '',
  categoryId: '',
  imageUrl: '',
}

const ProductForm = () => {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [previewOpen, setPreviewOpen] = useState(false)
  const [categories, setCategories] = useState([])

  useEffect(() => {
    const loadForm = async () => {
      try {
        const optionsResponse = await api.get('/categories/options')
        setCategories(optionsResponse.data || [])
        if (!isEdit) {
          setLoading(false)
          return
        }
        const response = await api.get(`/products/${id}`)
        const product = response.data
        setForm({
          name: product.name || '',
          sku: product.sku || '',
          description: product.description || '',
          price: product.price ?? '',
          stock: product.stock ?? '',
          categoryId: product.categoryId != null ? String(product.categoryId) : '',
          imageUrl: product.imageUrl || '',
        })
        setImagePreview(product.imageUrl || '')
        setError('')
      } catch (err) {
        setError(err.response?.data?.message || (isEdit ? 'Failed to load product' : 'Failed to load categories'))
      } finally {
        setLoading(false)
      }
    }

    loadForm()
  }, [id, isEdit])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    if (name === 'imageUrl' && !imageFile) {
      setImagePreview(value.trim())
    }
  }

  const handleImageFile = (event) => {
    const file = event.target.files?.[0]
    setImageFile(file || null)
    if (file) {
      setImagePreview(URL.createObjectURL(file))
    } else {
      setImagePreview(form.imageUrl.trim())
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')

    const imageUrl = form.imageUrl.trim()
    if (!form.categoryId) {
      setError('Category is required.')
      setSaving(false)
      return
    }
    if (!imageFile && !imageUrl) {
      setError('Image is required. Provide an image URL or upload a file.')
      setSaving(false)
      return
    }

    const payload = {
      name: form.name.trim(),
      sku: form.sku.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      stock: Number(form.stock),
      categoryId: Number(form.categoryId),
      imageUrl,
    }

    try {
      const saved = isEdit
        ? (await api.put(`/products/${id}`, payload)).data
        : (await api.post('/products', payload)).data
      if (imageFile) {
        await uploadProductImage(api, saved.id, imageFile)
      }
      navigate(`/products/${saved.id}`)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save product')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="page-container">
      <AppHeader title={isEdit ? 'Edit product' : 'Add product'} />

      <div className="card form-card">
        {loading ? (
          <p>Loading product...</p>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="required" htmlFor="name">Name</label>
              <input id="name" name="name" value={form.name} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="required" htmlFor="sku">SKU</label>
              <input id="sku" name="sku" value={form.sku} onChange={handleChange} required />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="required" htmlFor="price">Price</label>
                <input
                  id="price"
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label className="required" htmlFor="stock">Stock</label>
                <input
                  id="stock"
                  name="stock"
                  type="number"
                  min="0"
                  step="1"
                  value={form.stock}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label className="required" htmlFor="categoryId">Category</label>
              <select
                id="categoryId"
                name="categoryId"
                value={form.categoryId}
                onChange={handleChange}
                required
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {categories.length === 0 && (
                <p className="field-hint">
                  No categories yet.{' '}
                  <Link to="/categories/new">Add a category</Link> first.
                </p>
              )}
            </div>
            <div className="form-group">
              <label className="required" htmlFor="imageUrl">Image</label>
              <p className="field-hint">Provide an image URL or upload a file.</p>
              <input
                id="imageUrl"
                name="imageUrl"
                value={form.imageUrl}
                onChange={handleChange}
                placeholder="https://example.com/product.jpg"
              />
            </div>
            <div className="form-group">
              <label htmlFor="imageFile">Upload image file</label>
              <input
                id="imageFile"
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleImageFile}
              />
            </div>
            {imagePreview && (
              <div className="image-preview">
                <button
                  type="button"
                  className="image-open"
                  aria-label="View product image"
                  onClick={() => setPreviewOpen(true)}
                >
                  <img className="clickable" src={imagePreview} alt="Product preview" />
                </button>
              </div>
            )}
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                rows="4"
                value={form.description}
                onChange={handleChange}
              />
            </div>
            {error && <div className="error-message">{error}</div>}
            <div className="form-actions">
              <Link to="/products" className="secondary-button">
                Cancel
              </Link>
              <button type="submit" className="primary-button" disabled={saving}>
                {saving ? 'Saving...' : isEdit ? 'Save changes' : 'Create product'}
              </button>
            </div>
          </form>
        )}
      </div>

      <ImageLightbox
        src={previewOpen ? imagePreview : ''}
        alt="Product preview"
        onClose={() => setPreviewOpen(false)}
      />
    </div>
  )
}

export default ProductForm
