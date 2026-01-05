import { Navigate, Outlet, useLocation } from 'react-router-dom'
import LoadingSpinner from '../components/common/LoadingSpinner'
import useAuth from '../hooks/useAuth'

const ProtectedRoute = ({ children }) => {
  const { authenticated, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <LoadingSpinner fullscreen />
  }

  if (!authenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return children || <Outlet />
}

export default ProtectedRoute
