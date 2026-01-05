import { useEffect, useState } from 'react'
import Navbar from '../../components/layout/Navbar'
import VacancyList from '../../components/common/VacancyList'
import ErrorMessage from '../../components/common/ErrorMessage'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import Button from '../../components/common/Button'
import { applyToVacancy } from '../../api/applicationsService'
import { getAllVacancies } from '../../api/vacanciesService'
import useAuth from '../../hooks/useAuth'

const CoderDashboard = () => {
  const { user, logout } = useAuth()
  const [vacancies, setVacancies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionMessage, setActionMessage] = useState('')

  const fetchVacancies = async () => {
    setError('')
    setActionMessage('')
    try {
      const data = await getAllVacancies({ status: 'ACTIVE' }, user?.id)
      setVacancies(data || [])
    } catch (err) {
      const message = err?.response?.data?.message || 'No pudimos cargar las vacantes'
      setError(Array.isArray(message) ? message.join(', ') : message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVacancies()
  }, [])

  const handleApply = async (vacancy) => {
    setActionMessage('')
    try {
      await applyToVacancy(user?.id, vacancy.id)
      setActionMessage('Aplicación registrada ✅')
      fetchVacancies()
    } catch (err) {
      const message = err?.response?.data?.message || 'No pudimos enviar tu aplicación'
      setActionMessage(Array.isArray(message) ? message.join(', ') : message)
    }
  }

  return (
    <div className="page">
      <Navbar user={user} onLogout={logout} />
      <section className="hero">
        <div>
          <p className="eyebrow">Hola, {user?.name}</p>
          <h1>Encuentra tu próxima oportunidad</h1>
          <p className="muted">Aplica a vacantes activas y sigue el progreso.</p>
        </div>
        <Button variant="secondary" onClick={fetchVacancies}>
          Actualizar
        </Button>
      </section>

      <section id="vacancies">
        {loading ? (
          <LoadingSpinner message="Cargando vacantes..." />
        ) : error ? (
          <ErrorMessage message={error} onRetry={fetchVacancies} />
        ) : (
          <VacancyList vacancies={vacancies} onApply={handleApply} />
        )}
        {actionMessage && <div className="alert alert-info">{actionMessage}</div>}
      </section>
    </div>
  )
}

export default CoderDashboard
