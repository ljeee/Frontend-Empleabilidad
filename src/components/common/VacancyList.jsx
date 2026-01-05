import { useMemo, useState } from 'react'
import VacancyCard from './VacancyCard'
import Input from './Input'

const VacancyList = ({ vacancies = [], onApply, disableApply }) => {
  const [query, setQuery] = useState('')
  const [tech, setTech] = useState('')

  // Helper para normalizar tecnologías a array
  const activeTechnologies = (vacancy) => {
    if (!vacancy.technologies) return []
    if (Array.isArray(vacancy.technologies)) return vacancy.technologies
    if (typeof vacancy.technologies === 'string') {
      return vacancy.technologies.split(',').map(t => t.trim()).filter(Boolean)
    }
    return []
  }

  const filtered = useMemo(() => {
    return vacancies.filter((vacancy) => {
      const title = vacancy.title || ''
      const techs = activeTechnologies(vacancy)

      const matchesQuery = title.toLowerCase().includes(query.toLowerCase()) ||
        techs.some(t => t.toLowerCase().includes(query.toLowerCase()))
      // Búsqueda flexible (case insensitive para mayor seguridad)
      const matchesTech = tech
        ? techs.some(t => t.toLowerCase() === tech.toLowerCase())
        : true

      return matchesQuery && matchesTech
    })
  }, [query, tech, vacancies])

  const techOptions = useMemo(() => {
    const set = new Set()
    vacancies.forEach((v) => {
      const techs = activeTechnologies(v)
      techs.forEach((t) => set.add(t))
    })
    return Array.from(set).sort()
  }, [vacancies])

  if (!vacancies.length) {
    return <div className="empty-state">No hay vacantes disponibles</div>
  }

  return (
    <div className="vacancy-list">
      <div className="filters glass">
        <Input
          label="Buscar"
          placeholder="Título de la vacante"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <label className="form-control">
          <span className="form-label">Tecnología</span>
          <select
            className="form-input"
            value={tech}
            onChange={(e) => setTech(e.target.value)}
          >
            <option value="">Todas</option>
            {techOptions.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid">
        {filtered.map((vacancy) => (
          <VacancyCard
            key={vacancy.id}
            vacancy={vacancy}
            onApply={onApply}
            disableApply={disableApply}
          />
        ))}
      </div>
    </div>
  )
}

export default VacancyList
