import { useEffect, useState } from 'react'
import Navbar from '../../components/layout/Navbar'
import Button from '../../components/common/Button'
import ErrorMessage from '../../components/common/ErrorMessage'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import Modal from '../../components/common/Modal'
import Input from '../../components/common/Input'
import {
  createVacancy,
  getAllMetrics,
  getAllVacancies,
  getVacancyMetrics,
  toggleVacancyStatus,
  updateVacancy,
} from '../../api/vacanciesService'
import useAuth from '../../hooks/useAuth'

const emptyVacancy = {
  title: '',
  company: '',
  location: '',
  seniority: '',
  technologies: '',
  softSkills: '',
  description: '',
  salaryRange: '',
  modality: 'ONSITE',
  maxApplicants: 10
}

const GestorDashboard = () => {
  const { user, logout } = useAuth()
  const [vacancies, setVacancies] = useState([])
  const [metrics, setMetrics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(emptyVacancy)
  const [editingId, setEditingId] = useState(null)
  const [metricsModal, setMetricsModal] = useState({ open: false, data: null, title: '' })

  const fetchData = async () => {
    setError('')
    try {
      const [vacancyData, metricData] = await Promise.all([getAllVacancies(), getAllMetrics()])
      setVacancies(vacancyData || [])
      setMetrics(metricData || {})
    } catch (err) {
      const message = err?.response?.data?.message || 'No pudimos cargar la información'
      setError(Array.isArray(message) ? message.join(', ') : message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const openCreate = () => {
    setForm(emptyVacancy)
    setEditingId(null)
    setModalOpen(true)
  }

  const openEdit = (vacancy) => {
    setEditingId(vacancy.id)
    setForm({
      title: vacancy.title,
      company: vacancy.company,
      location: vacancy.location,
      seniority: vacancy.seniority,
      technologies: vacancy.technologies, // Ya no necesita join si es string, pero por seguridad:
      softSkills: vacancy.softSkills,
      description: vacancy.description,
      salaryRange: vacancy.salaryRange,
      modality: vacancy.modality || 'ONSITE',
      maxApplicants: vacancy.maxApplicants,
    })
    setModalOpen(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    const { id, createdAt, updatedAt, applicationsCount, status, isActive, ...cleanData } = form

    // Asegurar tratamiento de tecnologías como string o proceder con cuidado
    let techString = cleanData.technologies
    if (Array.isArray(techString)) {
      techString = techString.join(', ')
    }

    const payload = {
      title: cleanData.title,
      description: cleanData.description || '',
      company: cleanData.company,
      location: cleanData.location,
      seniority: cleanData.seniority,
      softSkills: cleanData.softSkills,
      technologies: techString ? techString.split(',').map(t => t.trim()).filter(Boolean).join(', ') : '',
      maxApplicants: Number(cleanData.maxApplicants),
      salaryRange: cleanData.salaryRange,
      modality: cleanData.modality
    }

    try {
      if (editingId) {
        await updateVacancy(editingId, payload)
      } else {
        await createVacancy(payload)
      }
      setModalOpen(false)
      fetchData()
    } catch (err) {
      const message = err?.response?.data?.message || 'No pudimos guardar la vacante'
      setError(Array.isArray(message) ? message.join(', ') : message)
    }
  }

  const handleToggle = async (id) => {
    try {
      await toggleVacancyStatus(id)
      fetchData()
    } catch (err) {
      const message = err?.response?.data?.message || 'No pudimos actualizar el estado'
      setError(Array.isArray(message) ? message.join(', ') : message)
    }
  }

  const handleMetrics = async (vacancy) => {
    try {
      const data = await getVacancyMetrics(vacancy.id)
      setMetricsModal({ open: true, data, title: vacancy.title })
    } catch (err) {
      const message = err?.response?.data?.message || 'No pudimos cargar las métricas'
      setError(Array.isArray(message) ? message.join(', ') : message)
    }
  }

  return (
    <div className="page">
      <Navbar user={user} onLogout={logout} />

      <section className="hero">
        <div>
          <p className="eyebrow">Panel de gestor</p>
          <h1>Vacantes y aplicaciones</h1>
          <p className="muted">Administra las posiciones y monitorea resultados.</p>
        </div>
        <Button variant="primary" onClick={openCreate}>
          Crear vacante
        </Button>
      </section>

      {loading ? (
        <LoadingSpinner message="Cargando información..." />
      ) : (
        <>
          {error && <ErrorMessage message={error} onRetry={fetchData} />}

          <section className="metrics-grid">
            <MetricCard label="Vacantes" value={metrics?.totalVacancies || 0} accent="var(--accent-purple)" />
            <MetricCard label="Activas" value={metrics?.activeVacancies || 0} accent="var(--accent-cyan)" />
            <MetricCard label="Aplicaciones" value={metrics?.totalApplications || 0} accent="var(--accent-amber)" />
          </section>

          <section className="table-wrap glass">
            <div className="table-header">
              <h3>Vacantes</h3>
              <Button variant="ghost" onClick={fetchData}>
                Refrescar
              </Button>
            </div>
            <div className="table">
              <div className="table-row table-head grid-vacancies">
                <span>Título</span>
                <span>Empresa</span>
                <span>Estado</span>
                <span>Apps</span>
                <span style={{ textAlign: 'right' }}>Acciones</span>
              </div>
              {vacancies.map((vacancy) => (
                <div className="table-row grid-vacancies" key={vacancy.id}>
                  <span>{vacancy.title}</span>
                  <span>{vacancy.company}</span>
                  <span>
                    <span className={`badge ${vacancy.isActive ? 'badge-success' : 'badge-inactive'}`}>
                      {vacancy.isActive ? 'Activa' : 'Inactiva'}
                    </span>
                  </span>
                  <span>{vacancy.applicationsCount}/{vacancy.maxApplicants}</span>
                  <span className="table-actions">
                    <Button variant="ghost" onClick={() => openEdit(vacancy)}>Editar</Button>
                    <Button variant={vacancy.isActive ? 'secondary' : 'primary'} onClick={() => handleToggle(vacancy.id)}>
                      {vacancy.isActive ? 'Pausar' : 'Activar'}
                    </Button>
                    <Button variant="ghost" onClick={() => handleMetrics(vacancy)}>Métricas</Button>
                  </span>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Editar vacante' : 'Crear vacante'}
        footer={
          <div className="modal-actions">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleSave}>
              Guardar
            </Button>
          </div>
        }
      >
        <form className="form">
          <Input label="Título" value={form.title || ''} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} required />

          <Input label="Descripción" value={form.description || ''} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />

          <div className="form-grid">
            <Input label="Empresa" value={form.company || ''} onChange={(e) => setForm((p) => ({ ...p, company: e.target.value }))} required />
            <Input label="Ubicación" value={form.location || ''} onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))} required />
          </div>

          <div className="form-grid">
            <Input label="Seniority" value={form.seniority || ''} onChange={(e) => setForm((p) => ({ ...p, seniority: e.target.value }))} required />

            <label className="form-control">
              <span className="form-label">Modalidad</span>
              <select
                className="form-input"
                value={form.modality || 'ONSITE'}
                onChange={(e) => setForm((p) => ({ ...p, modality: e.target.value }))}
              >
                <option value="ONSITE">Presencial</option>
                <option value="REMOTE">Remoto</option>
                <option value="HYBRID">Híbrido</option>
              </select>
            </label>
          </div>

          <div className="form-grid">
            <Input label="Rango Salarial" value={form.salaryRange || ''} onChange={(e) => setForm((p) => ({ ...p, salaryRange: e.target.value }))} />
            <Input label="Max Aplicantes" type="number" value={form.maxApplicants || 10} onChange={(e) => setForm((p) => ({ ...p, maxApplicants: e.target.value }))} required min={1} />
          </div>

          <Input label="Tecnologías" helper="Separadas por coma" value={form.technologies || ''} onChange={(e) => setForm((p) => ({ ...p, technologies: e.target.value }))} required />
          <Input label="Soft Skills" helper="Separadas por coma" value={form.softSkills || ''} onChange={(e) => setForm((p) => ({ ...p, softSkills: e.target.value }))} required />
        </form>
      </Modal>

      <Modal
        open={metricsModal.open}
        onClose={() => setMetricsModal({ open: false, data: null, title: '' })}
        title={`Métricas - ${metricsModal.title}`}
      >
        {!metricsModal.data ? (
          <LoadingSpinner message="Cargando métricas..." />
        ) : (
          <div className="metrics-grid">
            <MetricCard label="Aplicaciones" value={metricsModal.data.totalApplications || 0} accent="var(--accent-cyan)" />
            <MetricCard label="Activas" value={metricsModal.data.activeApplications || 0} accent="var(--accent-purple)" />
            <MetricCard label="Completadas" value={metricsModal.data.completedApplications || 0} accent="var(--accent-amber)" />
            <div className="table">
              <div className="table-row table-head">
                <span>Nombre</span>
                <span>Fecha</span>
              </div>
              {metricsModal.data.applicants?.map((applicant) => (
                <div className="table-row" key={applicant.id}>
                  <span>{applicant.name}</span>
                  <span>{new Date(applicant.appliedAt).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

const MetricCard = ({ label, value, accent }) => (
  <div className="metric-card glass" style={{ borderColor: accent }}>
    <p className="muted">{label}</p>
    <h2>{value}</h2>
  </div>
)

export default GestorDashboard
