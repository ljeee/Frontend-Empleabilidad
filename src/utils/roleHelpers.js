const ROLE_PATHS = {
  CODER: '/dashboard/coder',
  GESTOR: '/dashboard/gestor',
  ADMINISTRADOR: '/dashboard/admin',
}

const getDashboardPath = (role) => ROLE_PATHS[role] || '/login'

const hasPermission = (userRole, requiredRoles = []) => {
  if (!requiredRoles.length) return true
  return requiredRoles.includes(userRole)
}

const getRoleBadgeColor = (role) => {
  const colors = {
    CODER: 'var(--accent-cyan)',
    GESTOR: 'var(--accent-purple)',
    ADMINISTRADOR: 'var(--accent-amber)',
  }
  return colors[role] || 'var(--accent-muted)'
}

export { getDashboardPath, getRoleBadgeColor, hasPermission }
