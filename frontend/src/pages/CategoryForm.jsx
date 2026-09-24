import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import AppHeader from '../components/AppHeader'
import api from '../utils/axios'
import './Products.css'

const emptyForm = {
  name: '',
  description: '',
}

const CategoryForm = () => {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!isEdit) {
      return
    }

    const loadCategory = async () => {
      try {
        const response = await api.get(`/categories/${id}`)
        const category = response.data
        setForm({
          name: category.name || '',
          description: category.description || '',
        })
        setError('')
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load category')
      } finally {
        setLoading(false)
      }
    }

    loadCategory()
  }, [id, isEdit])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
    }

    try {
      if (isEdit) {
        await api.put(`/categories/${id}`, payload)
      } else {
        await api.post('/categories', payload)
      }
      navigate('/categories')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save category')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="page-container">
      <AppHeader title={isEdit ? 'Edit category' : 'Add category'} />

      <div className="card form-card">
        {loading ? (
          <p>Loading category...</p>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="required" htmlFor="name">Name</label>
              <input id="name" name="name" value={form.name} onChange={handleChange} required />
            </div>
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
              <Link to="/categories" className="secondary-button">
                Cancel
              </Link>
              <button type="submit" className="primary-button" disabled={saving}>
                {saving ? 'Saving...' : isEdit ? 'Save changes' : 'Create category'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default CategoryForm
