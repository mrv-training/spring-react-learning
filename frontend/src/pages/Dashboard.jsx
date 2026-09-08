import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../utils/axios'
import './Dashboard.css'

const Dashboard = () => {
  const { user, logout } = useAuth()
  const [userData, setUserData] = useState(null)
  const [adminData, setAdminData] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const fetchUserData = async () => {
    try {
      setLoading(true)
      const response = await api.get('/user')
      setUserData(response.data)
      setError('')
    } catch (err) {
      setError('Failed to fetch user data')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchAdminData = async () => {
    try {
      setLoading(true)
      const response = await api.get('/admin')
      setAdminData(response.data)
      setError('')
    } catch (err) {
      if (err.response?.status === 403) {
        setError('Access denied: Admin role required')
      } else {
        setError('Failed to fetch admin data')
      }
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUserData()
  }, [])

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <div className="user-info">
          <span>Welcome, {user?.username} ({user?.role})</span>
          <button onClick={logout} className="logout-button">
            Logout
          </button>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="card">
          <h2>User Endpoint</h2>
          <button onClick={fetchUserData} disabled={loading} className="action-button">
            Fetch User Data
          </button>
          {userData && (
            <div className="data-display">
              <pre>{JSON.stringify(userData, null, 2)}</pre>
            </div>
          )}
        </div>

        {user?.role === 'ADMIN' && (
          <div className="card">
            <h2>Admin Endpoint</h2>
            <button onClick={fetchAdminData} disabled={loading} className="action-button">
              Fetch Admin Data
            </button>
            {adminData && (
              <div className="data-display">
                <pre>{JSON.stringify(adminData, null, 2)}</pre>
              </div>
            )}
          </div>
        )}

        {error && <div className="error-message">{error}</div>}
      </div>
    </div>
  )
}

export default Dashboard


