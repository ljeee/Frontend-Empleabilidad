import Button from './Button'

const VacancyCard = ({ vacancy, onApply, actionSlot, disableApply }) => {
  const {
    title,
    company,
    location,
    seniority,
    technologies = [],
    maxApplicants,
    applicationsCount,
    status,
  } = vacancy

  const filled = applicationsCount >= maxApplicants
  const inactive = status === 'INACTIVE' || status === false
  const isApplied = vacancy.isApplied
  const applyDisabled = disableApply || filled || inactive || isApplied

  return (
    <div className="card glass">
      <div className="card-header">
        <div>
          <p className="eyebrow">{company || 'Empresa'}</p>
          <h3>{title}</h3>
          <p className="muted">{location} • {seniority}</p>
        </div>
        <span className={`badge ${inactive ? 'badge-muted' : 'badge-success'}`}>
          {inactive ? 'Inactiva' : 'Activa'}
        </span>
      </div>

      <div className="card-body">
        <div className="tag-list">
          {(() => {
            const techs = Array.isArray(technologies)
              ? technologies
              : (typeof technologies === 'string' ? technologies.split(',').map(t => t.trim()).filter(Boolean) : [])

            return techs.map((tech) => (
              <span key={tech} className="tag">
                {tech}
              </span>
            ))
          })()}
        </div>
        <div className="progress">
          <div className="progress-bar" style={{ width: `${Math.min(100, (applicationsCount / maxApplicants) * 100)}%` }} />
        </div>
        <div className="progress-meta">
          <span>{applicationsCount} aplicantes</span>
          <span className="muted">Máximo {maxApplicants}</span>
        </div>
      </div>

      <div className="card-footer">
        {actionSlot ? (
          actionSlot
        ) : (
          <Button
            variant="primary"
            disabled={applyDisabled}
            onClick={() => onApply?.(vacancy)}
          >
            {isApplied ? 'Postulado' : filled ? 'Cupos llenos' : 'Postularme'}
          </Button>
        )}
      </div>
    </div>
  )
}

export default VacancyCard
