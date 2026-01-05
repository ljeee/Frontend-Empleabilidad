import { api } from './axiosConfig'

const applyToVacancy = async (userId, vacancyId) => {
  const { data } = await api.post('/applications', { userId, vacancyId })
  return data?.data || data
}

const getAllApplications = async () => {
  const { data } = await api.get('/applications')
  return data?.data || data
}

export { applyToVacancy, getAllApplications }
