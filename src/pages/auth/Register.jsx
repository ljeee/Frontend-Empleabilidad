import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import ErrorMessage from '../../components/common/ErrorMessage'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import useAuth from '../../hooks/useAuth'
import { getDashboardPath } from '../../utils/roleHelpers'

const Register = () => {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
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
      const result = await register(form.name.trim(), form.email.trim(), form.password.trim())
      if (result?.success && result?.user?.role) {
        const dashboardPath = getDashboardPath(result.user.role)
        navigate(dashboardPath, { replace: true })
      } else {
        setError('Error al obtener información del usuario')
      }
    } catch (err) {
      const message = err?.response?.data?.message || 'No pudimos crear tu cuenta'
      setError(Array.isArray(message) ? message.join(', ') : message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-card glass">
        <p className="eyebrow">Únete</p>
        <h1>Crea tu cuenta</h1>
        <p className="muted">Comienza a aplicar a vacantes.</p>

        {error && <ErrorMessage message={error} />}

        <form className="form" onSubmit={handleSubmit}>
          <Input
            label="Nombre"
            name="name"
            placeholder="Tu nombre"
            value={form.name}
            onChange={handleChange}
            required
          />
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
            <span className="muted">Rol por defecto: CODER</span>
            <Link to="/login" className="muted">
              Ya tengo cuenta
            </Link>
          </div>
          <Button type="submit" variant="primary" loading={loading} fullWidth>
            Registrarme
          </Button>
        </form>
      </div>
    </div>
  )
}

export default Register
