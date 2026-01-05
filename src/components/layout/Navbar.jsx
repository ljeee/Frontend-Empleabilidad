import { Link } from 'react-router-dom'
import Button from '../common/Button'
import { getDashboardPath } from '../../utils/roleHelpers'

const Navbar = ({ user, onLogout }) => {
  return (
    <header className="navbar glass">
      <div className="brand">
        <span className="logo-dot" />
        <div>
          <p className="eyebrow">Empleabilidad</p>
          <strong>Talent Hub</strong>
        </div>
      </div>

      <nav className="nav-links">
        <Link to={getDashboardPath(user?.role)}>Dashboard</Link>
        <a href="#vacancies">Vacantes</a>
        {user?.role === 'ADMINISTRADOR' && <a href="#admin">Administración</a>}
      </nav>

      <div className="nav-user">
        <div className="user-profile">
          <span className="user-name">{user?.name}</span>
          <span className="badge" style={{ background: 'var(--glass)', color: 'var(--text-primary)' }}>
            {user?.role}
          </span>
        </div>
        <Button variant="ghost" onClick={onLogout}>
          Salir
        </Button>
      </div>
    </header>
  )
}

export default Navbar
