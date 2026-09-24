import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import AppLogo from './AppLogo'
import './AppHeader.css'

const AppHeader = ({ title }) => {
  const { user, logout } = useAuth()

  return (
    <div className="app-header">
      <div className="app-header-left">
        <AppLogo size={40} />
        <h1>{title}</h1>
        <nav className="app-nav">
          <NavLink to="/dashboard">Dashboard</NavLink>
          <NavLink to="/products">Products</NavLink>
          <NavLink to="/categories">Categories</NavLink>
        </nav>
      </div>
      <div className="user-info">
        <span>
          Welcome, {user?.username} ({user?.role})
        </span>
        <button onClick={logout} className="logout-button">
          Logout
        </button>
      </div>
    </div>
  )
}

export default AppHeader
