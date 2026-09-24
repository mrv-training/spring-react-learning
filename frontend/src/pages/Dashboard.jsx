import { Link } from 'react-router-dom'
import AppHeader from '../components/AppHeader'
import './Dashboard.css'

const Dashboard = () => {
  return (
    <div className="dashboard-container">
      <AppHeader title="Dashboard" />

      <div className="dashboard-content">
        <div className="card">
          <h2>Product managing</h2>
          <p>Sample product catalog with list, create, edit, and delete.</p>
          <Link to="/products" className="action-button" style={{ display: 'inline-block', textDecoration: 'none' }}>
            Open products
          </Link>
        </div>

        <div className="card">
          <h2>Category managing</h2>
          <p>Create and edit categories used when adding products.</p>
          <Link to="/categories" className="action-button" style={{ display: 'inline-block', textDecoration: 'none' }}>
            Open categories
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
