import { api } from './axiosConfig'

const getAllVacancies = async (filters = {}, userId = null) => {
  const params = { ...filters }
  if (userId) params.userId = userId
  const { data } = await api.get('/vacancies', { params })
  return data?.data || data
}

const getVacancyById = async (id) => {
  const { data } = await api.get(`/vacancies/${id}`)
  return data?.data || data
}

const createVacancy = async (payload) => {
  const { data } = await api.post('/vacancies', payload)
  return data?.data || data
}

const updateVacancy = async (id, payload) => {
  const { data } = await api.patch(`/vacancies/${id}`, payload)
  return data?.data || data
}

const toggleVacancyStatus = async (id) => {
  const { data } = await api.patch(`/vacancies/${id}/toggle`)
  return data?.data || data
}

const deleteVacancy = async (id) => {
  const { data } = await api.delete(`/vacancies/${id}`)
  return data?.data || data
}

const getAllMetrics = async () => {
  const { data } = await api.get('/vacancies/metrics')
  return data?.data || data
}

const getVacancyMetrics = async (id) => {
  const { data } = await api.get(`/vacancies/${id}/metrics`)
  return data?.data || data
}

export {
  createVacancy,
  getAllMetrics,
  getAllVacancies,
  getVacancyById,
  getVacancyMetrics,
  deleteVacancy,
  toggleVacancyStatus,
  updateVacancy,
}
