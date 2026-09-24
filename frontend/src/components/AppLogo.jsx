import { Link } from 'react-router-dom'

const AppLogo = ({ size = 40, to = '/products', className = '' }) => {
  const image = (
    <img
      className={`app-logo ${className}`.trim()}
      src="/logo.png"
      alt="Product Management Application"
      width={size}
      height={size}
    />
  )

  if (!to) {
    return image
  }

  return (
    <Link to={to} className="app-logo-link" aria-label="Product Management Application">
      {image}
    </Link>
  )
}

export default AppLogo
