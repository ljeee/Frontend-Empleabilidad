import { Link } from 'react-router-dom'
import Button from '../components/common/Button'

const NotFound = () => (
  <div className="auth-shell">
    <div className="auth-card glass">
      <p className="eyebrow">404</p>
      <h1>Página no encontrada</h1>
      <p className="muted">La ruta solicitada no existe.</p>
      <Link to="/login" className="btn btn-primary">
        Volver
      </Link>
    </div>
  </div>
)

export default NotFound
