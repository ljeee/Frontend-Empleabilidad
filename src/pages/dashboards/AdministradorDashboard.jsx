import { useEffect, useState } from 'react'
import Navbar from '../../components/layout/Navbar'
import Button from '../../components/common/Button'
import ErrorMessage from '../../components/common/ErrorMessage'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import Modal from '../../components/common/Modal'
import Input from '../../components/common/Input'
import {
  getAllVacancies,
  createVacancy,
  updateVacancy,
  toggleVacancyStatus,
  getAllMetrics,
  getVacancyMetrics
} from '../../api/vacanciesService'
import { getAllApplications } from '../../api/applicationsService'
import { createUser, deleteUser, getAllUsers, updateUser } from '../../api/usersService'
import useAuth from '../../hooks/useAuth'

const emptyUser = { name: '', email: '', role: 'CODER', password: '' }
const emptyVacancy = { title: '', company: '', location: '', seniority: '', technologies: '', softSkills: '', description: '', salaryRange: '', modality: 'ONSITE', maxApplicants: 10 }

const MetricCard = ({ label, value, accent }) => (
  <div className="metric-card glass" style={{ borderColor: accent }}>
    <p className="muted">{label}</p>
    <h2>{value}</h2>
  </div>
)

const AdministradorDashboard = () => {
  const { user, logout } = useAuth()
  const [tab, setTab] = useState('users')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Data States
  const [users, setUsers] = useState([])
  const [vacancies, setVacancies] = useState([])
  const [applications, setApplications] = useState([])
  const [globalMetrics, setGlobalMetrics] = useState(null)

  // Modal States
  const [userModal, setUserModal] = useState({ open: false, data: emptyUser, id: null })
  const [vacancyModal, setVacancyModal] = useState({ open: false, data: emptyVacancy, id: null })
  const [metricsModal, setMetricsModal] = useState({ open: false, data: null, title: '' })

  const fetchAll = async () => {
    setError('')
    try {
      const [userData, vacancyData, applicationData, metricsData] = await Promise.all([
        getAllUsers(),
        getAllVacancies(),
        getAllApplications(),
        getAllMetrics()
      ])
      setUsers(userData || [])
      setVacancies(vacancyData || [])
      setApplications(applicationData || [])
      setGlobalMetrics(metricsData || {})
    } catch (err) {
      const message = err?.response?.data?.message || 'No pudimos cargar los datos'
      setError(Array.isArray(message) ? message.join(', ') : message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAll()
  }, [])

  /* --- User Logic --- */
  const openUserModal = (payload = emptyUser, id = null) => {
    setUserModal({ open: true, data: payload, id })
  }

  const handleSaveUser = async () => {
    try {
      if (userModal.id) {
        await updateUser(userModal.id, userModal.data)
      } else {
        await createUser(userModal.data)
      }
      setUserModal({ open: false, data: emptyUser, id: null })
      fetchAll()
    } catch (err) {
      setError(err?.response?.data?.message || 'Error al guardar usuario')
    }
  }

  const handleDeleteUser = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar este usuario?')) return
    try {
      await deleteUser(id)
      fetchAll()
    } catch (err) {
      setError(err?.response?.data?.message || 'Error al eliminar usuario')
    }
  }

  /* --- Vacancy Logic --- */
  const openVacancyModal = (payload = emptyVacancy, id = null) => {
    // Si editamos, technologies viene como string usualmente del backend si no lo parseamos,
    // pero si lo parseamos como array en la vista, aqui debemos asegurarnos de mostrarlo como string en el input
    // El input 'technologies' espera un string separado por comas
    let techs = payload.technologies
    if (Array.isArray(techs)) techs = techs.join(', ')

    setVacancyModal({ open: true, data: { ...payload, technologies: techs }, id })
  }

  const handleSaveVacancy = async (e) => {
    e.preventDefault()
    const { id, createdAt, updatedAt, applicationsCount, status, ...cleanData } = vacancyModal.data

    const payload = {
      title: cleanData.title,
      description: cleanData.description || '',
      company: cleanData.company,
      location: cleanData.location,
      seniority: cleanData.seniority,
      softSkills: cleanData.softSkills,
      technologies: cleanData.technologies
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
        .join(', '),
      maxApplicants: Number(cleanData.maxApplicants),
      salaryRange: cleanData.salaryRange,
      modality: cleanData.modality
    }

    try {
      if (vacancyModal.id) {
        await updateVacancy(vacancyModal.id, payload)
      } else {
        await createVacancy(payload)
      }
      setVacancyModal({ open: false, data: emptyVacancy, id: null })
      fetchAll()
    } catch (err) {
      setError(err?.response?.data?.message || 'Error al guardar vacante')
    }
  }

  const handleToggleVacancy = async (id) => {
    try {
      await toggleVacancyStatus(id)
      fetchAll()
    } catch (err) {
      setError(err?.response?.data?.message || 'Error al cambiar estado')
    }
  }

  const handleVacancyMetrics = async (vacancy) => {
    try {
      const data = await getVacancyMetrics(vacancy.id)
      setMetricsModal({ open: true, data, title: vacancy.title })
    } catch (err) {
      setError(err?.response?.data?.message || 'Error al cargar métricas')
    }
  }

  return (
    <div className="page" id="admin">
      <Navbar user={user} onLogout={logout} />

      <section className="hero">
        <div>
          <p className="eyebrow">Panel administrador</p>
          <h1>Control total</h1>
          <p className="muted">Gestión centralizada de la plataforma.</p>
        </div>
        <div className="tabs">
          <button className={tab === 'users' ? 'tab active' : 'tab'} onClick={() => setTab('users')}>Usuarios</button>
          <button className={tab === 'vacancies' ? 'tab active' : 'tab'} onClick={() => setTab('vacancies')}>Vacantes</button>
          <button className={tab === 'applications' ? 'tab active' : 'tab'} onClick={() => setTab('applications')}>Aplicaciones</button>
        </div>
      </section>

      {/* Global Metrics Bar */}
      {globalMetrics && (
        <section className="metrics-grid">
          <MetricCard label="Total Usuarios" value={users.length} accent="var(--accent-purple)" />
          <MetricCard label="Total Vacantes" value={globalMetrics.totalVacancies || vacancies.length} accent="var(--accent-cyan)" />
          <MetricCard label="Aplicaciones" value={globalMetrics.totalApplications || applications.length} accent="var(--accent-amber)" />
        </section>
      )}

      {loading ? (
        <LoadingSpinner message="Cargando datos..." />
      ) : (
        <>
          {error && <ErrorMessage message={error} onRetry={fetchAll} />}

          {/* Users Tab */}
          {tab === 'users' && (
            <section className="table-wrap glass">
              <div className="table-header">
                <h3>Usuarios</h3>
                <Button variant="primary" onClick={() => openUserModal(emptyUser)}>Crear usuario</Button>
              </div>
              <div className="table">
                <div className="table-row table-head grid-users">
                  <span>Nombre</span>
                  <span>Correo</span>
                  <span>Rol</span>
                  <span style={{ textAlign: 'right' }}>Acciones</span>
                </div>
                {users.map((item) => (
                  <div className="table-row grid-users" key={item.id}>
                    <span>{item.name}</span>
                    <span>{item.email}</span>
                    <span><span className="badge badge-muted">{item.role}</span></span>
                    <span className="table-actions">
                      <Button variant="ghost" onClick={() => openUserModal({ name: item.name, email: item.email, role: item.role }, item.id)}>Editar</Button>
                      <Button variant="danger" onClick={() => handleDeleteUser(item.id)}>Eliminar</Button>
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Vacancies Tab */}
          {tab === 'vacancies' && (
            <section className="table-wrap glass">
              <div className="table-header">
                <h3>Vacantes</h3>
                <Button variant="primary" onClick={() => openVacancyModal(emptyVacancy)}>Crear vacante</Button>
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
                      <Button variant="ghost" onClick={() => openVacancyModal(vacancy, vacancy.id)}>Editar</Button>
                      <Button variant={vacancy.isActive ? 'secondary' : 'primary'} onClick={() => handleToggleVacancy(vacancy.id)}>
                        {vacancy.isActive ? 'Pausar' : 'Activar'}
                      </Button>
                      <Button variant="ghost" onClick={() => handleVacancyMetrics(vacancy)}>Métricas</Button>
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Applications Tab */}
          {tab === 'applications' && (
            <section className="table-wrap glass">
              <div className="table-header">
                <h3>Todas las aplicaciones</h3>
                <Button variant="ghost" onClick={fetchAll}>Refrescar</Button>
              </div>
              <div className="table">
                <div className="table-row table-head grid-applications">
                  <span>Candidato</span>
                  <span>Vacante</span>
                  <span>Fecha</span>
                </div>
                {applications.map((app) => (
                  <div className="table-row grid-applications" key={app.id}>
                    <span>{app.userName || app.user?.name}</span>
                    <span>{app.vacancyTitle || app.vacancy?.title}</span>
                    <span>{new Date(app.createdAt).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {/* User Modal */}
      <Modal
        open={userModal.open}
        onClose={() => setUserModal({ open: false, data: emptyUser, id: null })}
        title={userModal.id ? 'Editar usuario' : 'Crear usuario'}
        footer={
          <div className="modal-actions">
            <Button variant="ghost" onClick={() => setUserModal({ open: false, data: emptyUser, id: null })}>Cancelar</Button>
            <Button variant="primary" onClick={handleSaveUser}>Guardar</Button>
          </div>
        }
      >
        <div className="form">
          <Input label="Nombre" value={userModal.data.name} onChange={(e) => setUserModal((p) => ({ ...p, data: { ...p.data, name: e.target.value } }))} />
          <Input label="Correo" type="email" value={userModal.data.email} onChange={(e) => setUserModal((p) => ({ ...p, data: { ...p.data, email: e.target.value } }))} />
          <label className="form-control">
            <span className="form-label">Rol</span>
            <select className="form-input" value={userModal.data.role} onChange={(e) => setUserModal((p) => ({ ...p, data: { ...p.data, role: e.target.value } }))}>
              <option value="CODER">CODER</option>
              <option value="GESTOR">GESTOR</option>
              <option value="ADMINISTRADOR">ADMINISTRADOR</option>
            </select>
          </label>
          {!userModal.id && (
            <Input label="Contraseña" type="password" value={userModal.data.password} onChange={(e) => setUserModal((p) => ({ ...p, data: { ...p.data, password: e.target.value } }))} />
          )}
        </div>
      </Modal>

      {/* Vacancy Modal */}
      <Modal
        open={vacancyModal.open}
        onClose={() => setVacancyModal({ open: false, data: emptyVacancy, id: null })}
        title={vacancyModal.id ? 'Editar vacante' : 'Crear vacante'}
        footer={
          <div className="modal-actions">
            <Button variant="ghost" onClick={() => setVacancyModal({ open: false, data: emptyVacancy, id: null })}>Cancelar</Button>
            <Button variant="primary" onClick={handleSaveVacancy}>Guardar</Button>
          </div>
        }
      >
        <form className="form">
          <Input label="Título" value={vacancyModal.data.title} onChange={(e) => setVacancyModal((p) => ({ ...p, data: { ...p.data, title: e.target.value } }))} required />

          <Input label="Descripción" value={vacancyModal.data.description} onChange={(e) => setVacancyModal((p) => ({ ...p, data: { ...p.data, description: e.target.value } }))} />

          <div className="form-grid">
            <Input label="Empresa" value={vacancyModal.data.company} onChange={(e) => setVacancyModal((p) => ({ ...p, data: { ...p.data, company: e.target.value } }))} required />
            <Input label="Ubicación" value={vacancyModal.data.location} onChange={(e) => setVacancyModal((p) => ({ ...p, data: { ...p.data, location: e.target.value } }))} required />
          </div>

          <div className="form-grid">
            <Input label="Seniority" value={vacancyModal.data.seniority} onChange={(e) => setVacancyModal((p) => ({ ...p, data: { ...p.data, seniority: e.target.value } }))} required />

            <label className="form-control">
              <span className="form-label">Modalidad</span>
              <select
                className="form-input"
                value={vacancyModal.data.modality}
                onChange={(e) => setVacancyModal((p) => ({ ...p, data: { ...p.data, modality: e.target.value } }))}
              >
                <option value="ONSITE">Presencial</option>
                <option value="REMOTE">Remoto</option>
                <option value="HYBRID">Híbrido</option>
              </select>
            </label>
          </div>

          <div className="form-grid">
            <Input label="Rango Salarial" value={vacancyModal.data.salaryRange} onChange={(e) => setVacancyModal((p) => ({ ...p, data: { ...p.data, salaryRange: e.target.value } }))} />
            <Input label="Max Aplicantes" type="number" value={vacancyModal.data.maxApplicants} onChange={(e) => setVacancyModal((p) => ({ ...p, data: { ...p.data, maxApplicants: e.target.value } }))} required />
          </div>

          <Input label="Tecnologías" helper="Separadas por coma" value={vacancyModal.data.technologies} onChange={(e) => setVacancyModal((p) => ({ ...p, data: { ...p.data, technologies: e.target.value } }))} required />
          <Input label="Soft Skills" helper="Separadas por coma" value={vacancyModal.data.softSkills} onChange={(e) => setVacancyModal((p) => ({ ...p, data: { ...p.data, softSkills: e.target.value } }))} required />
        </form>
      </Modal>

      {/* Metrics Modal */}
      <Modal
        open={metricsModal.open}
        onClose={() => setMetricsModal({ open: false, data: null, title: '' })}
        title={`Métricas: ${metricsModal.title}`}
      >
        {!metricsModal.data ? <LoadingSpinner /> : (
          <div className="metrics-grid">
            <MetricCard label="Total Apps" value={metricsModal.data.totalApplications} accent="var(--accent-cyan)" />
            <MetricCard label="Activas" value={metricsModal.data.activeApplications} accent="var(--accent-purple)" />
            <MetricCard label="Completas" value={metricsModal.data.completedApplications} accent="var(--accent-amber)" />
          </div>
        )}
      </Modal>
    </div>
  )
}

export default AdministradorDashboard
