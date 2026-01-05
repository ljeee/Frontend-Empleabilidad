import { Navigate, Outlet, useLocation } from 'react-router-dom'
import LoadingSpinner from '../components/common/LoadingSpinner'
import useAuth from '../hooks/useAuth'
import { getDashboardPath, hasPermission } from '../utils/roleHelpers'

const RoleRoute = ({ allowedRoles = [], children }) => {
  const { user, authenticated, loading } = useAuth()
  const location = useLocation()

  if (loading) return <LoadingSpinner fullscreen />
  if (!authenticated) return <Navigate to="/login" replace state={{ from: location }} />

  if (!hasPermission(user?.role, allowedRoles)) {
    const fallback = getDashboardPath(user?.role) || '/login'
    return <Navigate to={fallback} replace />
  }

  return children || <Outlet />
}

export default RoleRoute
