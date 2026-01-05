import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import ErrorMessage from '../../components/common/ErrorMessage'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import useAuth from '../../hooks/useAuth'
import { getDashboardPath } from '../../utils/roleHelpers'

const Login = () => {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const result = await login(form.email.trim(), form.password.trim())
      if (result?.success && result?.user?.role) {
        const dashboardPath = getDashboardPath(result.user.role)
        navigate(dashboardPath, { replace: true })
      } else {
        setError('Error al obtener información del usuario')
      }
    } catch (err) {
      const message = err?.response?.data?.message || 'No pudimos iniciar sesión'
      setError(Array.isArray(message) ? message.join(', ') : message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-card glass">
        <p className="eyebrow">Bienvenido</p>
        <h1>Inicia sesión</h1>
        <p className="muted">Accede a tu panel y gestiona tu perfil.</p>

        {error && <ErrorMessage message={error} />}

        <form className="form" onSubmit={handleSubmit}>
          <Input
            label="Correo"
            name="email"
            type="email"
            placeholder="nombre@correo.com"
            value={form.email}
            onChange={handleChange}
            required
          />
          <Input
            label="Contraseña"
            name="password"
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={handleChange}
            required
          />
          <div className="form-footer">
            <label className="checkbox">
              <input type="checkbox" />
              <span>Recuérdame</span>
            </label>
            <Link to="/register" className="muted">
              ¿No tienes cuenta?
            </Link>
          </div>
          <Button type="submit" variant="primary" loading={loading} fullWidth>
            Entrar
          </Button>
        </form>
      </div>
    </div>
  )
}

export default Login
